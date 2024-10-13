let performanceMetrics = {
  firstContentfulPaint: null,
  timeToInteractive: null,
  componentRenderTimes: [],
};

// Track First Contentful Paint
function trackFirstContentfulPaint() {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entry = list.getEntriesByName('first-contentful-paint')[0];
      if (entry) {
        performanceMetrics.firstContentfulPaint = entry.startTime;
        console.log(`⚡️ First Contentful Paint: ${entry.startTime.toFixed(2)} ms`);
      }
    });
    observer.observe({ type: 'paint', buffered: true });
  }
}

// Track Time to Interactive
function trackTimeToInteractive() {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const tti = performance.now();
      performanceMetrics.timeToInteractive = tti;
      console.log(`🕒 Time to Interactive: ${tti.toFixed(2)} ms`);
    });
  }
}

// Track individual component renders
function trackComponentRender(name, renderTime) {
  performanceMetrics.componentRenderTimes.push({ name, renderTime });
  console.log(`🔧 Component ${name} rendered in ${renderTime.toFixed(2)} ms`);
}

// Get all collected performance metrics
function getPerformanceMetrics() {
  return performanceMetrics;
}

export {
  trackFirstContentfulPaint,
  trackTimeToInteractive,
  trackComponentRender,
  getPerformanceMetrics,
};
