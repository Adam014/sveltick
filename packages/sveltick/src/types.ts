/** Existing metric collectors return formatted decimal strings, or null. */
export type MetricValue = string | null;

export interface PerformanceThresholds {
  fcp: number;
  lcp: number;
  tti: number;
  cls: number;
  fid: number;
  inp: number;
  ttfb: number;
  componentRenderTime: number;
}

export interface PerformanceTrackerOptions {
  trackMetrics?: boolean;
  showAlerts?: boolean;
  enableGamification?: boolean;
  thresholds?: Partial<PerformanceThresholds>;
}

export interface ComponentRenderTime {
  name: string;
  renderTime: number;
}

export interface ComponentRenderResult {
  name: string;
  renderTime: string;
}

export interface PerformanceMetrics {
  firstContentfulPaint: MetricValue;
  timeToInteractive: MetricValue;
  largestContentfulPaint: MetricValue;
  /** Initialized to zero before the first collection. */
  cumulativeLayoutShift: MetricValue | number;
  firstInputDelay: MetricValue;
  interactionToNextPaint: MetricValue;
  timeToFirstByte: MetricValue;
  componentRenderTimes: ComponentRenderTime[];
}

export interface RouteView {
  route: string;
  timestamp: number;
}

export interface TrafficSources {
  Direct: number;
  Google: number;
  Facebook: number;
  Others: number;
}

export interface ActivityMetrics {
  pageViews: number;
  uniqueVisitors: number;
  routeViews: RouteView[];
  trafficSources: TrafficSources;
}
