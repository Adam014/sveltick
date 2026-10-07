import type { ActivityMetrics, RouteView, TrafficSources } from "./types.js";

type Area = "localStorage" | "sessionStorage";
// Storage access is lazy. A failed area stays in memory for this module lifetime,
// so a failed write cannot be replaced by stale persisted data on the next read.
const memory: Record<Area, Map<string, string>> = {
  localStorage: new Map(),
  sessionStorage: new Map(),
};
const disabled = new Set<Area>();
const browser = (): boolean => typeof window !== "undefined";

function read(key: string, area: Area = "localStorage"): string | null {
  if (!browser()) return null;
  if (!disabled.has(area)) {
    try {
      const value = window[area].getItem(key);
      if (value === null) memory[area].delete(key);
      else memory[area].set(key, value);
      return value;
    } catch {
      disabled.add(area);
    }
  }
  return memory[area].get(key) ?? null;
}
function write(key: string, value: string, area: Area = "localStorage"): void {
  if (!browser()) return;
  memory[area].set(key, value);
  if (!disabled.has(area)) {
    try {
      window[area].setItem(key, value);
    } catch {
      disabled.add(area);
    }
  }
}
function parse(key: string): unknown {
  try {
    return JSON.parse(read(key) ?? "null");
  } catch {
    return null;
  }
}
function count(value: unknown): number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : 0;
}
const emptySources = (): TrafficSources => ({
  Direct: 0,
  Google: 0,
  Facebook: 0,
  Others: 0,
});
function getTrafficSources(): TrafficSources {
  const data = parse("trafficSources");
  const result = emptySources();
  if (data && typeof data === "object") {
    for (const key of Object.keys(result) as (keyof TrafficSources)[]) {
      result[key] = count((data as Record<string, unknown>)[key]);
    }
  }
  return result;
}
function visitors(): string[] {
  const data = parse("uniqueVisitors");
  return Array.isArray(data)
    ? [
        ...new Set(
          data.filter(
            (id): id is string => typeof id === "string" && id.length <= 200,
          ),
        ),
      ].slice(-1000)
    : [];
}
function getUniqueVisitors(): number {
  return visitors().length;
}
function getPageViews(): number {
  return count(Number(read("pageViewCount")));
}
function getRouteViews(): RouteView[] {
  const data = parse("routeViews");
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (entry): entry is RouteView =>
        !!entry &&
        typeof entry === "object" &&
        typeof entry.route === "string" &&
        entry.route.length <= 2048 &&
        typeof entry.timestamp === "number" &&
        Number.isFinite(entry.timestamp),
    )
    .slice(-1000)
    .map(({ route, timestamp }) => ({ route, timestamp }));
}
function trackAllActivities(): ActivityMetrics {
  if (!browser())
    return {
      pageViews: 0,
      uniqueVisitors: 0,
      routeViews: [],
      trafficSources: emptySources(),
    };
  const pageViews = Math.min(Number.MAX_SAFE_INTEGER, getPageViews() + 1);
  write("pageViewCount", String(pageViews));
  let visitorId = read("visitorId");
  if (!visitorId || visitorId.length > 200) {
    visitorId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    write("visitorId", visitorId);
  }
  const uniqueVisitors = [...new Set([...visitors(), visitorId])].slice(-1000);
  write("uniqueVisitors", JSON.stringify(uniqueVisitors));
  const routeViews = getRouteViews();
  const route = window.location.pathname.slice(0, 2048);
  if (!routeViews.some((entry) => entry.route === route)) {
    routeViews.push({ route, timestamp: Date.now() });
    if (routeViews.length > 1000) routeViews.shift();
    write("routeViews", JSON.stringify(routeViews));
  }
  const trafficSources = getTrafficSources();
  if (!read("trackedTrafficSource", "sessionStorage")) {
    const referrer = document.referrer.toLowerCase();
    const source = !referrer
      ? "Direct"
      : referrer.includes("google")
        ? "Google"
        : referrer.includes("facebook")
          ? "Facebook"
          : "Others";
    trafficSources[source] = Math.min(
      Number.MAX_SAFE_INTEGER,
      trafficSources[source] + 1,
    );
    write("trafficSources", JSON.stringify(trafficSources));
    write("trackedTrafficSource", "true", "sessionStorage");
  }
  return {
    pageViews,
    uniqueVisitors: uniqueVisitors.length,
    routeViews,
    trafficSources,
  };
}
export {
  trackAllActivities,
  getPageViews,
  getUniqueVisitors,
  getRouteViews,
  getTrafficSources,
};
