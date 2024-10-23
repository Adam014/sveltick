import {
  calculatePerformanceScore,
  trackFirstContentfulPaint,
  trackTimeToInteractive,
  trackLargestContentfulPaint,
  trackCumulativeLayoutShift,
  checkPerformanceAlerts,
} from "../src/PerformanceTracker";

// Mock the performance metrics
const mockPerformanceMetrics = {
  firstContentfulPaint: 1000,
  largestContentfulPaint: 1500,
  timeToInteractive: 2000,
  cumulativeLayoutShift: 0.05,
  firstInputDelay: 50,
  interactionToNextPaint: 100,
  timeToFirstByte: 400,
  componentRenderTimes: [{ name: "ComponentA", renderTime: 300 }],
};

describe("PerformanceTracker Functions", () => {
  test("calculatePerformanceScore returns a valid score", () => {
    global.performanceMetrics = mockPerformanceMetrics;

    const score = calculatePerformanceScore();
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test("trackFirstContentfulPaint should resolve with FCP time", async () => {
    const mockObserverInstance = {
      observe: jest.fn(),
      disconnect: jest.fn(),
    };

    global.PerformanceObserver = jest.fn().mockImplementation((callback) => {
      // Mock the getEntriesByName function
      const list = {
        getEntriesByName: jest.fn().mockReturnValue([{ startTime: 1234.56 }]),
      };

      // Simulate the behavior of the callback with a fake entry
      setTimeout(() => callback(list), 100);

      return mockObserverInstance;
    });

    const result = await trackFirstContentfulPaint();
    expect(result).toBe("1234.56"); // Expecting the mocked FCP time
  });

  test("trackTimeToInteractive should resolve with a valid time", async () => {
    jest.spyOn(global.performance, "now").mockReturnValue(1000);

    const result = await trackTimeToInteractive();
    expect(result).toBe("1000.00");

    jest.restoreAllMocks();
  });

  test("trackLargestContentfulPaint should resolve with a valid LCP time", async () => {
    const mockObserverInstance = {
      observe: jest.fn(),
      disconnect: jest.fn(),
    };

    global.PerformanceObserver = jest.fn().mockImplementation((callback) => {
      // Simulate the behavior of the callback with a fake entry
      const entries = [{ startTime: 2345.67 }];
      setTimeout(() => callback({ getEntries: () => entries }), 100);
      return mockObserverInstance;
    });

    const result = await trackLargestContentfulPaint();
    expect(result).toBe("2345.67"); // Expecting the mocked LCP time
  });

  test("trackCumulativeLayoutShift should calculate CLS correctly", async () => {
    const mockObserverInstance = {
      observe: jest.fn(),
      disconnect: jest.fn(),
    };

    global.PerformanceObserver = jest.fn().mockImplementation((callback) => {
      // Simulate the behavior of the callback with a fake CLS entry
      const entries = [{ hadRecentInput: false, value: 0.03 }];
      setTimeout(() => callback({ getEntries: () => entries }), 100);
      return mockObserverInstance;
    });

    const result = await trackCumulativeLayoutShift();
    expect(result).toBe("0.0300"); // Expecting the mocked CLS value
  });

  test("checkPerformanceAlerts should log warnings if thresholds are exceeded", () => {
    // Mock console.warn
    console.warn = jest.fn();

    // Custom thresholds for testing
    const customThresholds = {
      fcp: 500, // Set FCP threshold low to trigger the warning
    };

    // Ensure firstContentfulPaint is set and exceeds the threshold
    global.performanceMetrics = {
      firstContentfulPaint: 1000, // Exceeds the 500ms threshold
      largestContentfulPaint: null,
      timeToInteractive: null,
      cumulativeLayoutShift: null,
      firstInputDelay: null,
      interactionToNextPaint: null,
      timeToFirstByte: null,
      componentRenderTimes: [],
    };

    // Call the function to trigger the alert
    checkPerformanceAlerts(customThresholds);

    // Expect console.warn to be called with the correct message
    expect(console.warn).toHaveBeenCalledTimes(1); // Ensure it was called exactly once
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("FCP of 1000"),
    ); // Check specific message

    // Cleanup the mock
    console.warn.mockRestore();
  });
});
