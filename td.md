# TODO: Add Gamification (earn points and score based on the well performance of the web)
# TODO: API and Presets
EXAMPLE
```svelte
function initSveltick(options = {}) {
  const {
    trackAll = true,
    thresholds = {},
    enableAlerts = false
  } = options;

  if (trackAll) {
    getPerformanceMetrics();
  }

  if (enableAlerts) {
    monitorPerformanceThresholds(thresholds);
  }

  // Allow more customizable features based on user input
  return {
    metrics: performanceMetrics,
    trackSpecific: getPerformanceMetrics,  // Expose functions for user to call manually
    storeMetrics: storeMetricsInLocalStorage
  };
}
```
# TODO: Plugin system, enable for users to be able include custom metrics or integrations with Lighthouse or Web Vitals
# TODO: Integration with monitoring platforms like Analytics, Sentry, Datadog etc
# TODO: Make an web about sveltick and documentation of it