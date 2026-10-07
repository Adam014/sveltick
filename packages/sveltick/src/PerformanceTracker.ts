import { readVitals, waitForVital } from "./VitalsEngine.js";
import type { VitalName } from "./VitalsEngine.js";
import type {
  CollectionOptions,
  ComponentRenderResult,
  MetricValue,
  PerformanceMetrics,
  PerformanceThresholds,
  PerformanceTrackerOptions,
} from "./types.js";

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
}

// Default thresholds and configurations for metrics
const defaultThresholds: PerformanceThresholds = {
  fcp: 2000, // Default: 2s for FCP
  lcp: 2500, // Default: 2.5s for LCP
  tti: 3000, // Default: 3s for TTI
  cls: 0.1, // Default: CLS should be below 0.1
  fid: 100, // Default: 100ms for FID
  inp: 200, // Default: 200ms for INP
  ttfb: 800, // Default: 800ms for TTFB
  componentRenderTime: 500, // Default: 500ms for component render time
};

const MAX_SCORE = 100;

// All-in-One Main Function with Presets
async function runPerformanceTracker(
  options: PerformanceTrackerOptions = {},
): Promise<void> {
  const {
    trackMetrics = true, // Enable or disable tracking of all metrics
    showAlerts = true, // Enable or disable performance alerts
    enableGamification = true, // Enable or disable gamification
    thresholds = {}, // Allow users to set custom thresholds for alerts
    timeoutMs = 5000,
  } = options;

  // Merge user-defined thresholds with defaults
  const mergedThresholds = { ...defaultThresholds, ...thresholds };

  // Step 1: Track Metrics
  if (trackMetrics) {
    await getPerformanceMetrics({ timeoutMs });
    console.log("📊 Performance Metrics:", getPerformanceSnapshot());
  }

  // Step 2: Check Performance Alerts if enabled
  if (showAlerts) {
    checkPerformanceAlerts(mergedThresholds);
  }

  // Step 3: Run Gamification if enabled
  if (enableGamification) {
    const score = calculatePerformanceScore();
    provideFeedback(score);
  }
}

// Tracking Metrics Data
let performanceMetrics: PerformanceMetrics = {
  firstContentfulPaint: null,
  timeToInteractive: null,
  largestContentfulPaint: null,
  cumulativeLayoutShift: null,
  firstInputDelay: null,
  interactionToNextPaint: null,
  timeToFirstByte: null,
  componentRenderTimes: [],
};

// Every collection owns its timeout and cleanup, including unsupported APIs.
type MetricKey = Exclude<keyof PerformanceMetrics, "componentRenderTimes">;

function collect(
  key: MetricKey,
  start: (finish: (value: MetricValue) => void) => (() => void) | void,
  options: CollectionOptions = {},
): Promise<MetricValue> {
  if (typeof window === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    let settled = false;
    let cleanup: (() => void) | void;
    const timeout = Number.isFinite(options.timeoutMs)
      ? Math.min(60000, Math.max(0, options.timeoutMs!))
      : 5000;
    const timer = setTimeout(() => finish(null), timeout);
    function finish(value: MetricValue): void {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup?.();
      performanceMetrics[key] = value;
      resolve(value);
    }
    try {
      cleanup = start(finish);
      if (settled) cleanup?.();
    } catch {
      finish(null);
    }
  });
}

function observe(
  key: MetricKey,
  type: string,
  read: (entries: PerformanceObserverEntryList) => MetricValue | undefined,
  options?: CollectionOptions,
): Promise<MetricValue> {
  return collect(
    key,
    (finish) => {
      if (
        typeof PerformanceObserver === "undefined" ||
        (PerformanceObserver.supportedEntryTypes &&
          !PerformanceObserver.supportedEntryTypes.includes(type))
      ) {
        finish(null);
        return;
      }
      const observer = new PerformanceObserver((entries) => {
        try {
          const value = read(entries);
          if (value !== undefined) finish(value);
        } catch {
          finish(null);
        }
      });
      try {
        observer.observe({ type, buffered: true });
      } catch {
        observer.disconnect();
        finish(null);
      }
      return () => observer.disconnect();
    },
    options,
  );
}

async function vital(
  name: VitalName,
  options?: CollectionOptions,
): Promise<MetricValue> {
  const value = await waitForVital(name, options?.timeoutMs);
  return value === null ? null : value.toFixed(name === "CLS" ? 4 : 2);
}
function trackFirstContentfulPaint(
  options?: CollectionOptions,
): Promise<MetricValue> {
  return vital("FCP", options);
}
function trackLargestContentfulPaint(
  options?: CollectionOptions,
): Promise<MetricValue> {
  return vital("LCP", options);
}
function trackCumulativeLayoutShift(
  options?: CollectionOptions,
): Promise<MetricValue> {
  return vital("CLS", options);
}
/** @deprecated TTI is not collected. Use INP; this compatibility function returns null. */
function trackTimeToInteractive(
  _options?: CollectionOptions,
): Promise<MetricValue> {
  return Promise.resolve(null);
}

/** @deprecated FID is a legacy metric; prefer INP. */
function trackFirstInputDelay(
  options?: CollectionOptions,
): Promise<MetricValue> {
  return observe(
    "firstInputDelay",
    "first-input",
    (list) => {
      const entry = list.getEntries()[0] as FirstInputEntry | undefined;
      return entry
        ? (entry.processingStart - entry.startTime).toFixed(2)
        : undefined;
    },
    options,
  );
}

function trackInteractionToNextPaint(
  options?: CollectionOptions,
): Promise<MetricValue> {
  return vital("INP", options);
}
function trackTimeToFirstByte(
  options?: CollectionOptions,
): Promise<MetricValue> {
  return vital("TTFB", options);
}

/** Reads already collected results without creating observers. */
function getPerformanceSnapshot(): PerformanceMetrics {
  const values = readVitals();
  const formatted = (name: VitalName): MetricValue =>
    values[name].value === null
      ? null
      : values[name].value.toFixed(name === "CLS" ? 4 : 2);
  return {
    ...performanceMetrics,
    firstContentfulPaint: formatted("FCP"),
    largestContentfulPaint: formatted("LCP"),
    cumulativeLayoutShift: formatted("CLS"),
    interactionToNextPaint: formatted("INP"),
    timeToFirstByte: formatted("TTFB"),
    componentRenderTimes: performanceMetrics.componentRenderTimes.map(
      (entry) => ({ ...entry }),
    ),
  };
}

// Track Component Render Times
function trackComponentRender(
  name: string,
  renderTime: number,
): ComponentRenderResult {
  if (!Number.isFinite(renderTime) || renderTime < 0)
    throw new RangeError(
      "renderTime must be a finite non-negative duration in milliseconds",
    );
  performanceMetrics.componentRenderTimes.push({ name, renderTime });
  if (performanceMetrics.componentRenderTimes.length > 1000)
    performanceMetrics.componentRenderTimes.shift();
  return {
    name,
    renderTime: renderTime.toFixed(2), // Format render time to 2 decimal places
  };
}

// Performance Alerts - Skip missing metrics
function checkPerformanceAlerts(
  thresholds: Partial<PerformanceThresholds> | null = {},
): void {
  const performanceMetrics = getPerformanceSnapshot();
  const { fcp, lcp, tti, cls, fid, inp, ttfb, componentRenderTime } = {
    ...defaultThresholds,
    ...thresholds,
  };

  if (
    performanceMetrics.firstContentfulPaint != null &&
    Number(performanceMetrics.firstContentfulPaint) > Number(fcp)
  ) {
    console.warn(
      `⚠️ FCP of ${performanceMetrics.firstContentfulPaint} ms exceeded threshold of ${fcp} ms`,
    );
  }

  if (
    performanceMetrics.largestContentfulPaint != null &&
    Number(performanceMetrics.largestContentfulPaint) > Number(lcp)
  ) {
    console.warn(
      `⚠️ LCP of ${performanceMetrics.largestContentfulPaint} ms exceeded threshold of ${lcp} ms`,
    );
  }

  if (
    performanceMetrics.timeToInteractive != null &&
    Number(performanceMetrics.timeToInteractive) > Number(tti)
  ) {
    console.warn(
      `⚠️ TTI of ${performanceMetrics.timeToInteractive} ms exceeded threshold of ${tti} ms`,
    );
  }

  if (
    performanceMetrics.cumulativeLayoutShift != null &&
    Number(performanceMetrics.cumulativeLayoutShift) > Number(cls)
  ) {
    console.warn(
      `⚠️ CLS of ${performanceMetrics.cumulativeLayoutShift} exceeded threshold of ${cls}`,
    );
  }

  if (
    performanceMetrics.firstInputDelay != null &&
    Number(performanceMetrics.firstInputDelay) > Number(fid)
  ) {
    console.warn(
      `⚠️ FID of ${performanceMetrics.firstInputDelay} ms exceeded threshold of ${fid} ms`,
    );
  }

  if (
    performanceMetrics.interactionToNextPaint != null &&
    Number(performanceMetrics.interactionToNextPaint) > Number(inp)
  ) {
    console.warn(
      `⚠️ INP of ${performanceMetrics.interactionToNextPaint} ms exceeded threshold of ${inp} ms`,
    );
  }

  if (
    performanceMetrics.timeToFirstByte != null &&
    Number(performanceMetrics.timeToFirstByte) > Number(ttfb)
  ) {
    console.warn(
      `⚠️ TTFB of ${performanceMetrics.timeToFirstByte} ms exceeded threshold of ${ttfb} ms`,
    );
  }

  performanceMetrics.componentRenderTimes.forEach(({ name, renderTime }) => {
    if (renderTime > Number(componentRenderTime)) {
      console.warn(
        `⚠️ Component ${name} render time of ${renderTime} ms exceeded threshold of ${componentRenderTime} ms`,
      );
    }
  });
}

// Calculate Performance Score - Skip missing metrics
function calculatePerformanceScore(): number {
  const performanceMetrics = getPerformanceSnapshot();
  let score = MAX_SCORE;

  const metricDifferences = [
    (Number(performanceMetrics.firstContentfulPaint) - defaultThresholds.fcp) /
      100,
    (Number(performanceMetrics.largestContentfulPaint) -
      defaultThresholds.lcp) /
      100,
    (Number(performanceMetrics.timeToInteractive) - defaultThresholds.tti) /
      100,
    (Number(performanceMetrics.cumulativeLayoutShift) - defaultThresholds.cls) *
      100,
    (Number(performanceMetrics.firstInputDelay) - defaultThresholds.fid) / 100,
    (Number(performanceMetrics.interactionToNextPaint) -
      defaultThresholds.inp) /
      100,
    (Number(performanceMetrics.timeToFirstByte) - defaultThresholds.ttfb) / 100,
  ];

  metricDifferences.forEach((diff) => {
    if (diff > 0) score -= diff;
  });

  performanceMetrics.componentRenderTimes.forEach(({ renderTime }) => {
    const diff = (renderTime - defaultThresholds.componentRenderTime) / 100;
    if (diff > 0) score -= diff;
  });

  return Math.max(0, Math.round(score)); // Ensure score doesn't go below 0
}

// Provide Feedback
function provideFeedback(score: number): void {
  const feedbackMap = [
    {
      threshold: 90,
      message: `🏆 Excellent! Your score is ${score}/100. Keep up the great work!`,
    },
    {
      threshold: 70,
      message: `👍 Good job! Your score is ${score}/100. Some improvements needed.`,
    },
    {
      threshold: 0,
      message: `⚠️ Needs Improvement! Your score is ${score}/100. Optimize for better performance.`,
    },
  ];

  const feedback = feedbackMap.find((fb) => score >= fb.threshold);
  console.log(feedback?.message);
}

// Run Gamification
async function runGamification(): Promise<void> {
  await getPerformanceMetrics(); // Ensure metrics are gathered first
  const score = calculatePerformanceScore();
  provideFeedback(score);
}

/** Waits for a bounded snapshot; ongoing document measurement is not restarted. */
async function getPerformanceMetrics(
  options: CollectionOptions = {},
): Promise<PerformanceMetrics> {
  await Promise.all([
    trackFirstContentfulPaint(options),
    trackLargestContentfulPaint(options),
    trackCumulativeLayoutShift(options),
    trackInteractionToNextPaint(options),
    trackTimeToFirstByte(options),
  ]);
  return getPerformanceSnapshot();
}

// Expose functions for custom use
export {
  runPerformanceTracker, // All-in-one function
  getPerformanceMetrics, // Track metrics manually
  getPerformanceSnapshot,
  trackFirstContentfulPaint,
  trackTimeToInteractive,
  trackLargestContentfulPaint,
  trackCumulativeLayoutShift,
  trackFirstInputDelay,
  trackInteractionToNextPaint,
  trackTimeToFirstByte,
  trackComponentRender,
  checkPerformanceAlerts,
  calculatePerformanceScore,
  runGamification,
};
