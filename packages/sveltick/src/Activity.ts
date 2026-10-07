export type TrafficSource = "Direct" | "Google" | "Facebook" | "Others";
export interface NavigationInput {
  url: string | URL;
  /** Prefer the SvelteKit route template, for example /users/[id]. */
  routeId?: string | null;
  /** Idempotency key, deduplicated while retained in recent history. */
  id?: string;
}
export interface NavigationRecord {
  id: string;
  route: string;
  timestamp: number;
  sessionId: string;
}
export interface ActivitySnapshot {
  schemaVersion: 1;
  scope: "instance" | "browser";
  persistence: "memory" | "indexeddb";
  persistenceError: boolean;
  pageViews: number;
  visitorId: string | null;
  sessionId: string;
  routes: NavigationRecord[];
  sources: Record<TrafficSource, number>;
}
export interface ActivityOptions {
  /** Memory by default. IndexedDB provides transactional cross-tab totals. */
  storage?: "memory" | "indexeddb";
  namespace?: string;
  maxEntries?: number;
  retentionMs?: number;
}
export interface ActivityTracker {
  recordNavigation(navigation: NavigationInput): Promise<ActivitySnapshot>;
  getSnapshot(): Promise<ActivitySnapshot>;
  subscribe(
    listener: (snapshot: ActivitySnapshot) => void | Promise<void>,
  ): () => void;
  reset(): Promise<ActivitySnapshot>;
  dispose(): void;
}
interface StoredActivity {
  version: 1;
  pageViews: number;
  visitorId: string | null;
  routes: NavigationRecord[];
  sources: Record<TrafficSource, number>;
  sessions: { id: string; timestamp: number }[];
}
const sources = (): Record<TrafficSource, number> => ({
  Direct: 0,
  Google: 0,
  Facebook: 0,
  Others: 0,
});
const fresh = (): StoredActivity => ({
  version: 1,
  pageViews: 0,
  visitorId: null,
  routes: [],
  sources: sources(),
  sessions: [],
});
const uid = (): string =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const count = (value: unknown): number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : 0;
const validText = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= max;
function decode(value: unknown): StoredActivity {
  const result = fresh();
  if (!value || typeof value !== "object") return result;
  const data = value as Partial<StoredActivity>;
  if (data.version !== 1) return result;
  result.pageViews = count(data.pageViews);
  result.visitorId = validText(data.visitorId, 200) ? data.visitorId : null;
  for (const name of Object.keys(result.sources) as TrafficSource[])
    result.sources[name] = count(data.sources?.[name]);
  if (Array.isArray(data.routes))
    result.routes = data.routes
      .filter(
        (entry) =>
          entry &&
          validText(entry.id, 200) &&
          validText(entry.route, 2048) &&
          validText(entry.sessionId, 200) &&
          Number.isFinite(entry.timestamp),
      )
      .slice(-1000)
      .map((entry) => ({
        id: entry.id,
        route: entry.route,
        timestamp: entry.timestamp,
        sessionId: entry.sessionId,
      }));
  if (Array.isArray(data.sessions))
    result.sessions = data.sessions
      .filter(
        (entry) =>
          entry && validText(entry.id, 200) && Number.isFinite(entry.timestamp),
      )
      .slice(-1000)
      .map(({ id, timestamp }) => ({ id, timestamp }));
  return result;
}
export function classifyReferrer(referrer: string): TrafficSource {
  if (!referrer) return "Direct";
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    const matches = (domain: string): boolean =>
      host === domain || host.endsWith(`.${domain}`);
    if (
      [
        "google.com",
        "google.cz",
        "google.co.uk",
        "google.de",
        "google.fr",
        "google.es",
        "google.it",
        "google.com.au",
        "google.co.jp",
      ].some(matches)
    )
      return "Google";
    if (["facebook.com", "fb.com"].some(matches)) return "Facebook";
  } catch {
    /* Unknown referrers stay unattributed. */
  }
  return "Others";
}
function routeOf(navigation: NavigationInput): string {
  if (navigation.routeId?.startsWith("/"))
    return navigation.routeId.split(/[?#]/)[0].slice(0, 2048);
  try {
    return new URL(
      String(navigation.url),
      typeof window === "undefined"
        ? "https://sveltick.invalid"
        : window.location.href,
    ).pathname.slice(0, 2048);
  } catch {
    return "/";
  }
}
function bound(
  value: number | undefined,
  fallback: number,
  max: number,
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(1, Math.min(max, Math.floor(value)))
    : fallback;
}

export function createActivityTracker(
  options: ActivityOptions = {},
): ActivityTracker {
  const namespace = options.namespace ?? "default";
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(namespace))
    throw new RangeError(
      "namespace must contain 1–80 letters, digits, underscores or hyphens",
    );
  const persistent = options.storage === "indexeddb";
  const limit = bound(options.maxEntries, 200, 1000);
  const retention = bound(options.retentionMs, 7 * 86400000, 30 * 86400000);
  let state = fresh();
  let sessionId = uid();
  let sessionLoaded = false;
  let persistence: ActivitySnapshot["persistence"] = "memory";
  let persistenceError = false;
  let failed = false;
  let disposed = false;
  let database: IDBDatabase | undefined;
  let opening: Promise<IDBDatabase> | undefined;
  let queue: Promise<unknown> = Promise.resolve();
  const listeners = new Set<
    (snapshot: ActivitySnapshot) => void | Promise<void>
  >();
  function initializeSession(): void {
    if (sessionLoaded || !persistent || typeof window === "undefined") return;
    sessionLoaded = true;
    try {
      const key = `sveltick:v2:${namespace}:session`;
      const previous = window.sessionStorage.getItem(key);
      if (validText(previous, 200)) sessionId = previous;
      else window.sessionStorage.setItem(key, sessionId);
    } catch {
      /* Inaccessible session storage uses this instance's session ID. */
    }
  }
  function prune(value: StoredActivity): void {
    const oldest = Date.now() - retention;
    value.routes = value.routes
      .filter((entry) => entry.timestamp >= oldest)
      .slice(-limit);
    value.sessions = value.sessions
      .filter((entry) => entry.timestamp >= oldest)
      .slice(-1000);
  }
  function snapshot(): ActivitySnapshot {
    prune(state);
    return {
      schemaVersion: 1,
      scope: persistence === "indexeddb" ? "browser" : "instance",
      persistence,
      persistenceError,
      pageViews: state.pageViews,
      visitorId: state.visitorId,
      sessionId,
      routes: state.routes.map((entry) => ({ ...entry })),
      sources: { ...state.sources },
    };
  }
  function deliver(
    listener: (snapshot: ActivitySnapshot) => void | Promise<void>,
  ): void {
    try {
      Promise.resolve(listener(snapshot())).catch(() => {});
    } catch {
      /* isolate consumers */
    }
  }
  function notify(): void {
    if (!disposed) for (const listener of listeners) deliver(listener);
  }
  function open(): Promise<IDBDatabase> {
    if (opening) return opening;
    opening = new Promise((resolve, reject) => {
      let finished = false;
      const timer = setTimeout(() => {
        finished = true;
        reject(new Error("Storage open timed out"));
      }, 2000);
      try {
        const request = window.indexedDB.open(`sveltick:v2:${namespace}`, 1);
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains("activity"))
            request.result.createObjectStore("activity");
        };
        request.onsuccess = () => {
          clearTimeout(timer);
          if (finished || disposed) {
            request.result.close();
            reject(new Error("Storage is closed"));
            return;
          }
          finished = true;
          database = request.result;
          database.onversionchange = () => database?.close();
          resolve(database);
        };
        request.onerror = () => {
          clearTimeout(timer);
          finished = true;
          reject(new Error("Storage open failed"));
        };
      } catch {
        clearTimeout(timer);
        finished = true;
        reject(new Error("Storage unavailable"));
      }
    });
    return opening;
  }
  async function transaction(
    update?: (value: StoredActivity) => void,
  ): Promise<StoredActivity> {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("activity", update ? "readwrite" : "readonly");
      const store = tx.objectStore("activity");
      let result = fresh();
      const timer = setTimeout(() => {
        try {
          tx.abort();
        } catch {
          /* already closed */
        }
        reject(new Error("Storage transaction timed out"));
      }, 2000);
      tx.oncomplete = () => {
        clearTimeout(timer);
        resolve(result);
      };
      tx.onabort = tx.onerror = () => {
        clearTimeout(timer);
        reject(new Error("Storage transaction failed"));
      };
      const request = store.get("state");
      request.onsuccess = () => {
        try {
          result = decode(request.result);
          prune(result);
          if (update) {
            update(result);
            store.put(result, "state");
          }
        } catch {
          tx.abort();
        }
      };
    });
  }
  function run(
    update?: (value: StoredActivity) => void,
  ): Promise<ActivitySnapshot> {
    if (disposed)
      return Promise.reject(
        new Error("This activity tracker has been disposed"),
      );
    const task = async (): Promise<ActivitySnapshot> => {
      initializeSession();
      if (persistent && !failed && typeof window !== "undefined") {
        try {
          state = await transaction(update);
          persistence = "indexeddb";
        } catch {
          failed = true;
          persistenceError = true;
          persistence = "memory";
          database?.close();
          prune(state);
          update?.(state);
        }
      } else {
        prune(state);
        update?.(state);
      }
      notify();
      return snapshot();
    };
    const result = queue.then(task, task);
    queue = result;
    return result;
  }
  return {
    recordNavigation(navigation) {
      const navigationId = navigation.id ?? uid();
      if (!validText(navigationId, 200))
        return Promise.reject(
          new RangeError("navigation id must contain 1–200 characters"),
        );
      const route = routeOf(navigation);
      return run((value) => {
        if (
          typeof window === "undefined" ||
          value.routes.some((entry) => entry.id === navigationId)
        )
          return;
        value.pageViews = Math.min(
          Number.MAX_SAFE_INTEGER,
          value.pageViews + 1,
        );
        value.visitorId ??= uid();
        const timestamp = Date.now();
        value.routes.push({ id: navigationId, route, timestamp, sessionId });
        const session = value.sessions.find((entry) => entry.id === sessionId);
        if (session) session.timestamp = timestamp;
        else {
          value.sessions.push({ id: sessionId, timestamp });
          const source = classifyReferrer(document.referrer);
          value.sources[source] = Math.min(
            Number.MAX_SAFE_INTEGER,
            value.sources[source] + 1,
          );
        }
        prune(value);
      });
    },
    getSnapshot: () => run(),
    reset: () =>
      run((value) => {
        Object.assign(value, fresh());
      }),
    subscribe(listener) {
      if (disposed) throw new Error("This activity tracker has been disposed");
      listeners.add(listener);
      deliver(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose() {
      disposed = true;
      listeners.clear();
      database?.close();
    },
  };
}
