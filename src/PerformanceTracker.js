let performanceMetrics = {
  firstContentfulPaint: null,
  timeToInteractive: null,
  largestContentfulPaint: null,
  cumulativeLayoutShift: 0,
  componentRenderTimes: []
};

// Track First Contentful Paint
function trackFirstContentfulPaint() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entry = list.getEntriesByName('first-contentful-paint')[0];
        if (entry) {
          performanceMetrics.firstContentfulPaint = entry.startTime;
          console.log(`⚡️ First Contentful Paint: ${entry.startTime.toFixed(2)} ms`);
          resolve();
        }
      });
      observer.observe({ type: 'paint', buffered: true });
    } else {
      resolve();  // Resolve immediately if running in SSR or no `window` object
    }
  });
}

// Track Time to Interactive
function trackTimeToInteractive() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const tti = performance.now();
        performanceMetrics.timeToInteractive = tti;
        console.log(`🕒 Time to Interactive: ${tti.toFixed(2)} ms`);
        resolve();
      });

      if (document.readyState === 'complete') {
        const ttiFallback = performance.now();
        performanceMetrics.timeToInteractive = ttiFallback;
        console.log(`🕒 Time to Interactive (Fallback): ${ttiFallback.toFixed(2)} ms`);
        resolve();
      }
    } else {
      resolve();
    }
  });
}

// Track Largest Contentful Paint
function trackLargestContentfulPaint() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        performanceMetrics.largestContentfulPaint = lastEntry.startTime;
        console.log(`📏 Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)} ms`);
        resolve();
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } else {
      resolve();  // Resolve immediately if running in SSR or no `window` object
    }
  });
}

// Track Cumulative Layout Shift
function trackCumulativeLayoutShift() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput && entry.value) {
            clsValue += entry.value;
          }
        });
        performanceMetrics.cumulativeLayoutShift = clsValue;
        console.log(`📊 Cumulative Layout Shift: ${clsValue.toFixed(4)}`);
        resolve();
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    } else {
      resolve();  // Resolve immediately if running in SSR or no `window` object
    }
  });
}

// Track individual component renders
function trackComponentRender(name, renderTime) {
  performanceMetrics.componentRenderTimes.push({ name, renderTime });
  console.log(`🔧 Component ${name} rendered in ${renderTime.toFixed(2)} ms`);
}

// Automatically rerun all tracking functions when calling getPerformanceMetrics
async function getPerformanceMetrics() {
  await Promise.all([
    trackFirstContentfulPaint(),
    trackTimeToInteractive(),
    trackLargestContentfulPaint(),
    trackCumulativeLayoutShift()
  ]);
  return performanceMetrics;
}

export {
  getPerformanceMetrics,  
  trackFirstContentfulPaint,  
  trackTimeToInteractive, 
  trackLargestContentfulPaint,  
  trackCumulativeLayoutShift, 
  trackComponentRender  
};
