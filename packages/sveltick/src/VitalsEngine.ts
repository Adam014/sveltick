import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import type { Metric } from "web-vitals";

export const vitalNames = ["FCP", "LCP", "CLS", "INP", "TTFB"] as const;
export type VitalName = (typeof vitalNames)[number];
export interface VitalResult {
  name: VitalName;
  value: number | null;
  unit: "ms" | "score";
  status: "pending" | "available" | "unsupported" | "error";
  rating: "good" | "needs-improvement" | "poor" | null;
  id: string | null;
  updatedAt: number | null;
  navigationType: string | null;
}
export type VitalResults = Record<VitalName, VitalResult>;
interface Engine {
  metrics: VitalResults;
  listeners: Set<() => void>;
  documentId: string;
}
const key = Symbol.for("sveltick.vitals.engine.v1");
const entryTypes: Record<VitalName, string> = {
  FCP: "paint",
  LCP: "largest-contentful-paint",
  CLS: "layout-shift",
  INP: "event",
  TTFB: "navigation",
};
function supported(name: VitalName): boolean {
  if (
    typeof window === "undefined" ||
    typeof PerformanceObserver === "undefined"
  )
    return false;
  if (!PerformanceObserver.supportedEntryTypes?.includes(entryTypes[name]))
    return false;
  if (
    name === "CLS" &&
    !PerformanceObserver.supportedEntryTypes.includes("paint")
  )
    return false;
  if (name === "INP") {
    return (
      typeof PerformanceEventTiming !== "undefined" &&
      "interactionId" in PerformanceEventTiming.prototype
    );
  }
  return true;
}
function empty(): VitalResults {
  return Object.fromEntries(
    vitalNames.map((name) => [
      name,
      {
        name,
        value: null,
        unit: name === "CLS" ? "score" : "ms",
        status: supported(name) ? "pending" : "unsupported",
        rating: null,
        id: null,
        updatedAt: null,
        navigationType: null,
      },
    ]),
  ) as VitalResults;
}
function registry(): Record<symbol, Engine | undefined> {
  return globalThis as unknown as Record<symbol, Engine | undefined>;
}
function notify(engine: Engine): void {
  for (const listener of engine.listeners) {
    try {
      listener();
    } catch {
      /* isolate consumers */
    }
  }
}
const documentId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** One backend per document, shared across component mounts and HMR imports. */
export function startVitals(): void {
  if (typeof window === "undefined" || registry()[key]) return;
  const engine: Engine = {
    metrics: empty(),
    listeners: new Set(),
    documentId: documentId(),
  };
  registry()[key] = engine;
  // Registered before the backend restore handlers so stale values are cleared first.
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      engine.metrics = empty();
      engine.documentId = documentId();
      notify(engine);
    }
  });
  const receive = (metric: Metric): void => {
    if (!Number.isFinite(metric.value) || metric.value < 0) return;
    const name = metric.name;
    engine.metrics[name] = {
      name,
      value: metric.value,
      unit: name === "CLS" ? "score" : "ms",
      status: "available",
      rating: metric.rating,
      id: metric.id,
      updatedAt: Date.now(),
      navigationType: metric.navigationType,
    };
    notify(engine);
  };
  const registrations = {
    FCP: onFCP,
    LCP: onLCP,
    CLS: onCLS,
    INP: onINP,
    TTFB: onTTFB,
  };
  for (const name of vitalNames) {
    if (engine.metrics[name].status === "unsupported") continue;
    try {
      registrations[name](receive, { reportAllChanges: true });
    } catch {
      engine.metrics[name].status = "error";
    }
  }
}
export function readVitals(): VitalResults {
  const values =
    (typeof window !== "undefined" ? registry()[key]?.metrics : undefined) ??
    empty();
  return Object.fromEntries(
    vitalNames.map((name) => [name, { ...values[name] }]),
  ) as VitalResults;
}
export function readDocumentId(): string | null {
  return typeof window !== "undefined"
    ? (registry()[key]?.documentId ?? null)
    : null;
}
export function subscribeVitals(listener: () => void): () => void {
  startVitals();
  const engine = typeof window !== "undefined" ? registry()[key] : undefined;
  engine?.listeners.add(listener);
  return () => {
    engine?.listeners.delete(listener);
  };
}
export function collectionTimeout(timeoutMs?: number): number {
  return typeof timeoutMs === "number" && Number.isFinite(timeoutMs)
    ? Math.min(60000, Math.max(0, timeoutMs))
    : 5000;
}
export async function waitForVital(
  name: VitalName,
  timeoutMs?: number,
): Promise<number | null> {
  startVitals();
  const current = readVitals()[name];
  if (current.status === "unsupported" || current.status === "error")
    return null;
  const changesDuringPageLife =
    name === "CLS" || name === "LCP" || name === "INP";
  if (!changesDuringPageLife && current.value !== null) return current.value;
  return new Promise((resolve) => {
    const timer = setTimeout(finish, collectionTimeout(timeoutMs));
    const unsubscribe = subscribeVitals(() => {
      if (!changesDuringPageLife && readVitals()[name].value !== null) finish();
    });
    function finish(): void {
      clearTimeout(timer);
      unsubscribe();
      resolve(readVitals()[name].value);
    }
  });
}
