import { createPerformanceReport } from "./Report.js";
import type { PerformanceReport } from "./Report.js";
import { createReportSink } from "./ReportSink.js";
import {
  readDocumentId,
  readVitals,
  startVitals,
  subscribeVitals,
} from "./VitalsEngine.js";
import type { VitalResults } from "./VitalsEngine.js";

export interface ComponentMeasurement {
  name: string;
  durationMs: number;
  timestamp: number;
}
export interface TrackerSnapshot {
  schemaVersion: 1;
  documentId: string | null;
  sessionId: string;
  capturedAt: number;
  running: boolean;
  metrics: VitalResults;
  components: ComponentMeasurement[];
  droppedComponentEntries: number;
  exportErrors: number;
}
export interface TrackerOptions {
  /** Optional consumer; no transport is installed by the library. */
  onReport?: (report: PerformanceReport) => void | Promise<void>;
  /** Retained operation/component measurements, default 100, maximum 1000. */
  maxComponentEntries?: number;
  /** Component retention in ms, default 30 minutes, maximum 24 hours. */
  retentionMs?: number;
}
export interface Tracker {
  start(): void;
  stop(): void;
  dispose(): void;
  getSnapshot(): TrackerSnapshot;
  /** Waits for the export callback queue; false means the deadline elapsed. */
  flush(options?: { timeoutMs?: number }): Promise<boolean>;
  subscribe(
    listener: (snapshot: TrackerSnapshot) => void | Promise<void>,
  ): () => void;
  recordComponent(name: string, durationMs: number): ComponentMeasurement;
  /** Returns an idempotent end function measuring a caller-defined interval. */
  measure(name: string): () => number;
  /** Clears this instance's component history; document Web Vitals are preserved. */
  reset(): void;
}
function bounded(
  value: number | undefined,
  fallback: number,
  maximum: number,
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(maximum, Math.max(0, Math.floor(value)))
    : fallback;
}
const id = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const now = (): number =>
  typeof performance === "undefined" ? Date.now() : performance.now();

/** A subscriber to the document backend with isolated, bounded local history. */
export function createTracker(options: TrackerOptions = {}): Tracker {
  const sink = createReportSink(options.onReport);
  const limit = bounded(options.maxComponentEntries, 100, 1000);
  const retention = bounded(
    options.retentionMs,
    30 * 60 * 1000,
    24 * 60 * 60 * 1000,
  );
  let running = false;
  let disposed = false;
  let metrics = readVitals();
  let documentId = readDocumentId();
  let sessionId = id();
  let components: ComponentMeasurement[] = [];
  let droppedComponentEntries = 0;
  let unsubscribe: (() => void) | undefined;
  const listeners = new Set<
    (snapshot: TrackerSnapshot) => void | Promise<void>
  >();
  function prune(): void {
    const before = components.length;
    const oldest = Date.now() - retention;
    components = components.filter((entry) => entry.timestamp >= oldest);
    if (components.length > limit)
      components = limit === 0 ? [] : components.slice(-limit);
    droppedComponentEntries += before - components.length;
  }
  function getSnapshot(): TrackerSnapshot {
    prune();
    return {
      schemaVersion: 1,
      documentId,
      sessionId,
      capturedAt: Date.now(),
      running,
      metrics: Object.fromEntries(
        Object.entries(metrics).map(([name, result]) => [name, { ...result }]),
      ) as VitalResults,
      components: components.map((entry) => ({ ...entry })),
      droppedComponentEntries,
      exportErrors: sink.errors(),
    };
  }
  function deliver(
    listener: (snapshot: TrackerSnapshot) => void | Promise<void>,
  ): void {
    try {
      Promise.resolve(listener(getSnapshot())).catch(() => {});
    } catch {
      /* isolate consumer failures */
    }
  }
  function emit(): void {
    if (running) for (const listener of listeners) deliver(listener);
  }
  function ensureUsable(): void {
    if (disposed) throw new Error("This tracker has been disposed");
  }
  function refresh(): void {
    metrics = readVitals();
    documentId = readDocumentId();
    emit();
    if (running) sink.send(createPerformanceReport(getSnapshot()));
  }
  function start(): void {
    ensureUsable();
    if (running || typeof window === "undefined") return;
    running = true;
    startVitals();
    unsubscribe = subscribeVitals(refresh);
    refresh();
  }
  function stop(): void {
    running = false;
    unsubscribe?.();
    unsubscribe = undefined;
    sink.clear();
  }
  function recordComponent(
    name: string,
    durationMs: number,
  ): ComponentMeasurement {
    ensureUsable();
    if (!name.trim() || !Number.isFinite(durationMs) || durationMs < 0)
      throw new RangeError(
        "A name and a finite non-negative duration are required",
      );
    const entry = {
      name: name.slice(0, 200),
      durationMs,
      timestamp: Date.now(),
    };
    components.push(entry);
    prune();
    emit();
    return { ...entry };
  }
  return {
    start,
    stop,
    getSnapshot,
    recordComponent,
    flush: (options) => sink.flush(options?.timeoutMs),
    dispose() {
      stop();
      listeners.clear();
      sink.close();
      disposed = true;
    },
    subscribe(listener) {
      ensureUsable();
      listeners.add(listener);
      deliver(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    measure(name) {
      ensureUsable();
      const began = now();
      let duration: number | undefined;
      return () => {
        if (duration === undefined) {
          const elapsed = Math.max(0, now() - began);
          recordComponent(name, elapsed);
          duration = elapsed;
        }
        return duration;
      };
    },
    reset() {
      ensureUsable();
      components = [];
      droppedComponentEntries = 0;
      sessionId = id();
      emit();
    },
  };
}
