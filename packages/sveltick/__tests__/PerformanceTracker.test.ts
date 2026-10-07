import {
  calculatePerformanceScore,
  trackComponentRender,
  trackFirstContentfulPaint,
  trackTimeToInteractive,
  trackLargestContentfulPaint,
  trackCumulativeLayoutShift,
  checkPerformanceAlerts,
} from "../src/PerformanceTracker.js";
import type { PerformanceMetrics } from "../src/types.js";

const mockPerformanceMetrics: PerformanceMetrics = {
  firstContentfulPaint: "1000",
  largestContentfulPaint: "1500",
  timeToInteractive: "2000",
  cumulativeLayoutShift: "0.05",
  firstInputDelay: "50",
  interactionToNextPaint: "100",
  timeToFirstByte: "400",
  componentRenderTimes: [{ name: "ComponentA", renderTime: 300 }],
};

const originalObserver = Object.getOwnPropertyDescriptor(
  globalThis,
  "PerformanceObserver",
);

function makeEntry(overrides: Partial<PerformanceEntry>): PerformanceEntry {
  return {
    name: "",
    entryType: "",
    startTime: 0,
    duration: 0,
    toJSON: () => ({}),
    ...overrides,
  };
}

function mockObserver(entries: PerformanceEntry[]): void {
  const observer: PerformanceObserver = {
    observe: jest.fn(),
    disconnect: jest.fn(),
    takeRecords: jest.fn(() => entries),
  };
  const list: PerformanceObserverEntryList = {
    getEntries: () => entries,
    getEntriesByType: (type) =>
      entries.filter((entry) => entry.entryType === type),
    getEntriesByName: (name) => entries.filter((entry) => entry.name === name),
  };
  Object.defineProperty(globalThis, "PerformanceObserver", {
    configurable: true,
    writable: true,
    value: jest.fn((callback: PerformanceObserverCallback) => {
      setTimeout(() => callback(list, observer), 0);
      return observer;
    }),
  });
}

afterEach(() => {
  if (originalObserver) {
    Object.defineProperty(globalThis, "PerformanceObserver", originalObserver);
  } else {
    Reflect.deleteProperty(globalThis, "PerformanceObserver");
  }
  Reflect.deleteProperty(globalThis, "performanceMetrics");
});

describe("PerformanceTracker Functions", () => {
  test("calculatePerformanceScore accounts for recorded component durations", () => {
    expect(calculatePerformanceScore()).toBe(100);
    expect(trackComponentRender("ComponentA", 2500)).toEqual({
      name: "ComponentA",
      renderTime: "2500.00",
    });
    expect(calculatePerformanceScore()).toBe(80);
  });

  test("trackFirstContentfulPaint resolves with the formatted FCP", async () => {
    mockObserver([
      makeEntry({ name: "first-contentful-paint", startTime: 1234.56 }),
    ]);
    await expect(trackFirstContentfulPaint()).resolves.toBe("1234.56");
  });

  test("trackTimeToInteractive resolves with a formatted time", async () => {
    jest.spyOn(globalThis.performance, "now").mockReturnValue(1000);
    await expect(trackTimeToInteractive()).resolves.toBe("1000.00");
  });

  test("trackLargestContentfulPaint resolves with the formatted LCP", async () => {
    mockObserver([makeEntry({ startTime: 2345.67 })]);
    await expect(trackLargestContentfulPaint()).resolves.toBe("2345.67");
  });

  test("trackCumulativeLayoutShift formats the observed CLS", async () => {
    const entry = {
      ...makeEntry({ entryType: "layout-shift" }),
      hadRecentInput: false,
      value: 0.03,
    };
    mockObserver([entry]);
    await expect(trackCumulativeLayoutShift()).resolves.toBe("0.0300");
  });

  test("checkPerformanceAlerts retains the legacy global FCP lookup", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    Object.assign(globalThis, { performanceMetrics: mockPerformanceMetrics });
    checkPerformanceAlerts({ fcp: 500 });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("FCP of 1000"));
  });
});
