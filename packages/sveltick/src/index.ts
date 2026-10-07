import {
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
  trackAllActivities, // Track all activities at once
  getPageViews, // Get total page views
  getRouteViews,
  getTrafficSources,
  getUniqueVisitors,
};

export type {
  ActivityMetrics,
  CollectionOptions,
  ComponentRenderResult,
  ComponentRenderTime,
  MetricValue,
  PerformanceMetrics,
  PerformanceThresholds,
  PerformanceTrackerOptions,
  RouteView,
  TrafficSources,
} from "./types.js";
