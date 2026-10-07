let api: typeof import("../src/PerformanceTracker.js");
beforeEach(async () => {
  jest.resetModules();
  api = await import("../src/PerformanceTracker.js");
});

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
    expect(api.calculatePerformanceScore()).toBe(100);
    expect(api.trackComponentRender("ComponentA", 2500)).toEqual({
      name: "ComponentA",
      renderTime: "2500.00",
    });
    expect(api.calculatePerformanceScore()).toBe(80);
  });

  test("trackFirstContentfulPaint resolves with the formatted FCP", async () => {
    mockObserver([
      makeEntry({ name: "first-contentful-paint", startTime: 1234.56 }),
    ]);
    await expect(api.trackFirstContentfulPaint()).resolves.toBe("1234.56");
  });

  test("trackTimeToInteractive resolves with a formatted time", async () => {
    jest.spyOn(globalThis.performance, "now").mockReturnValue(1000);
    await expect(api.trackTimeToInteractive()).resolves.toBe("1000.00");
  });

  test("trackLargestContentfulPaint resolves with the formatted LCP", async () => {
    mockObserver([makeEntry({ startTime: 2345.67 })]);
    await expect(api.trackLargestContentfulPaint()).resolves.toBe("2345.67");
  });

  test("trackCumulativeLayoutShift formats the observed CLS", async () => {
    const entry = {
      ...makeEntry({ entryType: "layout-shift" }),
      hadRecentInput: false,
      value: 0.03,
    };
    mockObserver([entry]);
    await expect(api.trackCumulativeLayoutShift()).resolves.toBe("0.0300");
  });

  test("checkPerformanceAlerts uses collected state and default thresholds", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    mockObserver([
      makeEntry({ name: "first-contentful-paint", startTime: 9000 }),
    ]);
    await api.trackFirstContentfulPaint();
    api.checkPerformanceAlerts();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("FCP of 9000"));
  });
});
