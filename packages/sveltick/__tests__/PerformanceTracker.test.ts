let api: typeof import("../src/PerformanceTracker.js");
beforeEach(async () => {
  jest.resetModules();
  api = await import("../src/PerformanceTracker.js");
});

describe("PerformanceTracker compatibility API", () => {
  test("calculatePerformanceScore accounts for recorded component durations", () => {
    expect(api.calculatePerformanceScore()).toBe(100);
    expect(api.trackComponentRender("ComponentA", 2500)).toEqual({
      name: "ComponentA",
      renderTime: "2500.00",
    });
    expect(api.calculatePerformanceScore()).toBe(80);
  });
  test("FCP resolves null when the browser API is unavailable", async () => {
    await expect(
      api.trackFirstContentfulPaint({ timeoutMs: 10 }),
    ).resolves.toBeNull();
  });
  test("retired TTI does not fabricate a duration", async () => {
    await expect(api.trackTimeToInteractive()).resolves.toBeNull();
  });
  test("a snapshot retains null for unsupported metrics", async () => {
    const result = await api.getPerformanceMetrics({ timeoutMs: 10 });
    expect(result.largestContentfulPaint).toBeNull();
    expect(result.cumulativeLayoutShift).toBeNull();
    expect(result.interactionToNextPaint).toBeNull();
  });
  test("snapshot edits do not change recorded component durations", () => {
    api.trackComponentRender("ComponentA", 100);
    const snapshot = api.getPerformanceSnapshot();
    snapshot.componentRenderTimes[0].renderTime = 9999;
    expect(
      api.getPerformanceSnapshot().componentRenderTimes[0].renderTime,
    ).toBe(100);
  });
  test("alerts merge partial thresholds with defaults", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    api.trackComponentRender("Slow", 2500);
    api.checkPerformanceAlerts({ fcp: 10000 });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Component Slow"),
    );
  });
});
