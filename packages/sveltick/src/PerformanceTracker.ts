import type {
  ComponentRenderResult,
  MetricValue,
  PerformanceMetrics,
  PerformanceThresholds,
  PerformanceTrackerOptions,
} from "./types.js";

// Legacy FCP alert lookup retained during the TypeScript migration.
declare const global: { performanceMetrics: PerformanceMetrics };

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

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
  } = options;

  // Merge user-defined thresholds with defaults
  const mergedThresholds = { ...defaultThresholds, ...thresholds };

  // Step 1: Track Metrics
  if (trackMetrics) {
    await getPerformanceMetrics(); // Runs all tracking functions
    console.log("📊 Performance Metrics:", performanceMetrics);
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
  cumulativeLayoutShift: 0,
  firstInputDelay: null,
  interactionToNextPaint: null,
  timeToFirstByte: null,
  componentRenderTimes: [],
};

// Core Tracker Functions

function trackFirstContentfulPaint(): Promise<MetricValue> {
  return new Promise<MetricValue>((resolve) => {
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entry = list.getEntriesByName("first-contentful-paint")[0];
        if (entry) {
          const firstContentfulPaintTime = entry.startTime.toFixed(2); // String with 2 decimals
          resolve(firstContentfulPaintTime);
          observer.disconnect();
        }
      });
      observer.observe({ type: "paint", buffered: true });
    } else {
      resolve(null); // Return null if not supported
    }
  });
}

// Time to Interactive
function trackTimeToInteractive(): Promise<MetricValue> {
  return new Promise<MetricValue>((resolve) => {
    if (typeof window !== "undefined") {
      window.addEventListener("load", () => {
        const tti = performance.now().toFixed(2); // Return formatted value
        resolve(tti); // Resolve the value
      });

      if (document.readyState === "complete") {
        const ttiFallback = performance.now().toFixed(2); // Fallback value
        resolve(ttiFallback); // Resolve the value
      }
    } else {
      resolve(null); // Resolve null in unsupported environments
    }
  });
}
// Largest Contentful Paint
function trackLargestContentfulPaint(): Promise<MetricValue> {
  return new Promise<MetricValue>((resolve) => {
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1]; // Get the last entry
        const largestContentfulPaintTime = lastEntry.startTime.toFixed(2); // Format value
        resolve(largestContentfulPaintTime); // Resolve the value
        observer.disconnect();
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
    } else {
      resolve(null); // Resolve null in unsupported environments
    }
  });
}

// Cumulative Layout Shift
function trackCumulativeLayoutShift(): Promise<MetricValue> {
  return new Promise<MetricValue>((resolve) => {
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        (list.getEntries() as LayoutShiftEntry[]).forEach((entry) => {
          if (!entry.hadRecentInput && entry.value) {
            clsValue += entry.value;
          }
        });
        const clsValueFormatted = clsValue.toFixed(4); // Format CLS to 4 decimals
        resolve(clsValueFormatted); // Resolve the value
        observer.disconnect();
      });
      observer.observe({ type: "layout-shift", buffered: true });
    } else {
      resolve(null); // Resolve null in SSR or unsupported environments
    }
  });
}

// Track First Input Delay (FID)
function trackFirstInputDelay(): Promise<MetricValue> {
  return new Promise<MetricValue>((resolve) => {
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const firstEntry = list.getEntries()[0] as FirstInputEntry;
        const firstInputDelay = (
          firstEntry.processingStart - firstEntry.startTime
        ).toFixed(2); // Format value
        resolve(firstInputDelay); // Resolve the value
        observer.disconnect();
      });

      observer.observe({ type: "first-input", buffered: true });

      // Fallback if no user input is captured within 5 seconds
      setTimeout(() => {
        if (performanceMetrics.firstInputDelay === null) {
          console.warn("⚠️ No First Input Delay captured, using default.");
          resolve(null);
        }
      }, 5000);
    } else {
      resolve(null); // Resolve null in unsupported environments
    }
  });
}

// Track Interaction to Next Paint (INP)
function trackInteractionToNextPaint(): Promise<MetricValue> {
  return new Promise<MetricValue>((resolve) => {
    let interactionOccurred = false;
    const handleInteraction = (event: MouseEvent): void => {
      const inp = (performance.now() - event.timeStamp).toFixed(2); // Format value
      resolve(inp); // Resolve the value
      interactionOccurred = true;
      window.removeEventListener("click", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);

    setTimeout(() => {
      if (!interactionOccurred) {
        console.warn(
          "⚠️ No interaction occurred or INP tracking is not supported.",
        );
        resolve(null); // Resolve null if no interaction occurred
      }
    }, 5000); // 3 second timeout as a fallback
  });
}

// Time to First Byte (TTFB)
function trackTimeToFirstByte(): Promise<MetricValue> {
  return new Promise<MetricValue>((resolve) => {
    if (typeof window !== "undefined") {
      const ttfb = (
        performance.timing.responseStart - performance.timing.requestStart
      ).toFixed(2); // Format value
      resolve(ttfb); // Resolve the value
    } else {
      resolve(null); // Resolve null in unsupported environments
    }
  });
}

// Track Component Render Times
function trackComponentRender(
  name: string,
  renderTime: number,
): ComponentRenderResult {
  performanceMetrics.componentRenderTimes.push({ name, renderTime });
  return {
    name,
    renderTime: renderTime.toFixed(2), // Format render time to 2 decimal places
  };
}

// Performance Alerts - Skip missing metrics
function checkPerformanceAlerts(
  thresholds: Partial<PerformanceThresholds> | null = {},
): void {
  const { fcp, lcp, tti, cls, fid, inp, ttfb, componentRenderTime } =
    thresholds || defaultThresholds;

  if (
    global.performanceMetrics.firstContentfulPaint != null &&
    Number(global.performanceMetrics.firstContentfulPaint) > Number(fcp)
  ) {
    console.warn(
      `⚠️ FCP of ${global.performanceMetrics.firstContentfulPaint} ms exceeded threshold of ${fcp} ms`,
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

// Automatically rerun all tracking functions when calling getPerformanceMetrics
async function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  const [
    firstContentfulPaint,
    timeToInteractive,
    largestContentfulPaint,
    cumulativeLayoutShift,
    firstInputDelay,
    interactionToNextPaint,
    timeToFirstByte,
  ] = await Promise.all([
    trackFirstContentfulPaint(),
    trackTimeToInteractive(),
    trackLargestContentfulPaint(),
    trackCumulativeLayoutShift(),
    trackFirstInputDelay(),
    trackInteractionToNextPaint(),
    trackTimeToFirstByte(),
  ]);

  // Update the global performanceMetrics object instead of re-declaring it
  performanceMetrics = {
    ...performanceMetrics, // Keep existing component render times and other properties
    firstContentfulPaint,
    timeToInteractive,
    largestContentfulPaint,
    cumulativeLayoutShift,
    firstInputDelay,
    interactionToNextPaint,
    timeToFirstByte,
  };

  return performanceMetrics;
}

// Expose functions for custom use
export {
  runPerformanceTracker, // All-in-one function
  getPerformanceMetrics, // Track metrics manually
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
