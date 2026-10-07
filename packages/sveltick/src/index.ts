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

export { createTracker } from "./Tracker.js";
export type {
  Tracker,
  TrackerOptions,
  TrackerSnapshot,
  ComponentMeasurement,
} from "./Tracker.js";
export type { VitalName, VitalResult, VitalResults } from "./VitalsEngine.js";

export { createActivityTracker, classifyReferrer } from "./Activity.js";
export type {
  ActivityTracker,
  ActivityOptions,
  ActivitySnapshot,
  NavigationInput,
  NavigationRecord,
  TrafficSource,
} from "./Activity.js";
export { connectSvelteKit } from "./SvelteKit.js";
export type {
  SvelteKitHooks,
  SvelteKitOptions,
  SvelteKitTracking,
} from "./SvelteKit.js";
