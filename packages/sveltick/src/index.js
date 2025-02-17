import {
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
} from "./PerformanceTracker.js";

import {
  trackAllActivities,
  getPageViews,
  getRouteViews,
  getTrafficSources,
  getUniqueVisitors,
} from "./ActivityTracker.js";

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
  trackAllActivities, // Track all activities at once
  getPageViews, // Get total page views
  getRouteViews,
  getTrafficSources,
  getUniqueVisitors,
};
