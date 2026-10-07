import { collectionTimeout } from "./VitalsEngine.js";
import type { PerformanceReport } from "./Report.js";

/** At most one in-flight callback and one queued latest report. */
export function createReportSink(
  callback?: (report: PerformanceReport) => void | Promise<void>,
) {
  let queued: PerformanceReport | undefined;
  let sending = false;
  let closed = false;
  let errors = 0;
  const idle = new Set<() => void>();
  async function drain(): Promise<void> {
    sending = true;
    while (queued && !closed) {
      const report = queued;
      queued = undefined;
      try {
        await callback?.(report);
      } catch {
        errors++;
      }
    }
    sending = false;
    for (const listener of idle) listener();
    idle.clear();
  }
  return {
    send(report: PerformanceReport): void {
      if (!callback || closed) return;
      queued = report;
      if (!sending) void drain();
    },
    clear(): void {
      queued = undefined;
    },
    close(): void {
      closed = true;
      queued = undefined;
    },
    errors: (): number => errors,
    flush(timeoutMs = 1000): Promise<boolean> {
      if (!sending && !queued) return Promise.resolve(true);
      return new Promise((resolve) => {
        const done = (): void => {
          clearTimeout(timer);
          idle.delete(done);
          resolve(true);
        };
        const timer = setTimeout(() => {
          idle.delete(done);
          resolve(false);
        }, collectionTimeout(timeoutMs));
        idle.add(done);
      });
    },
  };
}
