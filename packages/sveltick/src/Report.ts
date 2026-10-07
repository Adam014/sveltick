import {
  CLSThresholds,
  FCPThresholds,
  INPThresholds,
  LCPThresholds,
  TTFBThresholds,
} from "web-vitals";
import { vitalNames } from "./VitalsEngine.js";
import type { VitalName, VitalResult, VitalResults } from "./VitalsEngine.js";
export type PerformanceRating = "good" | "needs-improvement" | "poor";
export interface MetricAssessment extends VitalResult {
  recommendation: string | null;
}
export interface PerformanceReport {
  schemaVersion: 1;
  scope: "document";
  documentId: string | null;
  generatedAt: number;
  coverage: { available: number; total: 5; missing: VitalName[] };
  overallRating: PerformanceRating | null;
  /** Custom five-band average, not a Lighthouse score. Null unless all five metrics exist. */
  score: number | null;
  scoreModel: "sveltick-bands-v1";
  metrics: Record<VitalName, MetricAssessment>;
}
export interface PerformanceReportInput {
  documentId: string | null;
  capturedAt: number;
  metrics: VitalResults;
}
const thresholds = {
  FCP: FCPThresholds,
  LCP: LCPThresholds,
  CLS: CLSThresholds,
  INP: INPThresholds,
  TTFB: TTFBThresholds,
};
const recommendations: Record<VitalName, string> = {
  FCP: "Reduce render-blocking resources and initial JavaScript work.",
  LCP: "Check when the largest image or text becomes visible and prioritize its critical resources.",
  CLS: "Reserve space for images and embeds; avoid inserting content above existing elements.",
  INP: "Split long event handlers and move work that does not update the UI off the main thread.",
  TTFB: "Inspect redirects, connection setup and server response time.",
};
const points: Record<PerformanceRating, number> = {
  good: 100,
  "needs-improvement": 50,
  poor: 0,
};

/** Pure assessment of available document metrics, with explicit missing coverage. */
export function createPerformanceReport(
  input: PerformanceReportInput,
): PerformanceReport {
  const missing: VitalName[] = [];
  const metrics = {} as Record<VitalName, MetricAssessment>;
  for (const name of vitalNames) {
    const metric = input.metrics[name];
    const available =
      metric.status === "available" &&
      metric.value !== null &&
      Number.isFinite(metric.value) &&
      metric.value >= 0;
    const rating = available
      ? metric.value! <= thresholds[name][0]
        ? "good"
        : metric.value! <= thresholds[name][1]
          ? "needs-improvement"
          : "poor"
      : null;
    if (!available) missing.push(name);
    metrics[name] = {
      ...metric,
      value: available ? metric.value : null,
      status:
        metric.status === "available" && !available ? "error" : metric.status,
      rating,
      recommendation:
        rating && rating !== "good" ? recommendations[name] : null,
    };
  }
  const core = [metrics.LCP.rating, metrics.CLS.rating, metrics.INP.rating];
  const overallRating = core.some((rating) => rating === null)
    ? null
    : core.includes("poor")
      ? "poor"
      : core.includes("needs-improvement")
        ? "needs-improvement"
        : "good";
  return {
    schemaVersion: 1,
    scope: "document",
    documentId: input.documentId,
    generatedAt: input.capturedAt,
    coverage: {
      available: vitalNames.length - missing.length,
      total: 5,
      missing,
    },
    overallRating,
    score: missing.length
      ? null
      : Math.round(
          vitalNames.reduce(
            (sum, name) => sum + points[metrics[name].rating!],
            0,
          ) / vitalNames.length,
        ),
    scoreModel: "sveltick-bands-v1",
    metrics,
  };
}
