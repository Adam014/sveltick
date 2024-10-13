let performanceMetrics = {
  firstContentfulPaint: null,
  timeToInteractive: null,
  componentRenderTimes: [],
};

function trackFirstContentfulPaint() {
  // Ensure this runs only in the browser (client-side rendering)
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    new PerformanceObserver((list) => {
      const entry = list.getEntriesByName('first-contentful-paint')[0];
      if (entry) {
        performanceMetrics.firstContentfulPaint = entry.startTime;
        console.log(`⚡️ First Contentful Paint: ${entry.startTime.toFixed(2)} ms`);
      }
    }).observe({ type: 'paint', buffered: true });
  }
}

function trackTimeToInteractive() {
  // Check for client-side before accessing window
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const tti = performance.now();
      performanceMetrics.timeToInteractive = tti;
      console.log(`🕒 Time to Interactive: ${tti.toFixed(2)} ms`);
    });
  }
}

function trackComponentRender(name, time) {
  // This function can safely run in both SSR and client-side, as it's not browser-specific.
  performanceMetrics.componentRenderTimes.push({ name, time });
  console.log(`🔧 Component ${name} rendered in ${time.toFixed(2)} ms`);
}

function getPerformanceMetrics() {
  return performanceMetrics;
}

export {
  trackFirstContentfulPaint,
  trackTimeToInteractive,
  trackComponentRender,
  getPerformanceMetrics,
};
