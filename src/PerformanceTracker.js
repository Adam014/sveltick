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

// Performance Alert Function
function checkPerformanceAlerts(thresholds = {}){
 const {
    fcp = 2000,  // Default: 2s for FCP
    lcp = 2500,  // Default: 2.5s for LCP
    tti = 3000,  // Default: 3s for TTI
    cls = 0.1,   // Default: CLS should be below 0.1
    componentRenderTime = 500 // Default: 500ms for component render time
  } = thresholds;

  if (performanceMetrics.firstContentfulPaint > fcp) {
    console.warn(`⚠️ FCP of ${performanceMetrics.firstContentfulPaint} ms exceeded threshold of ${fcp} ms`);
  }

  if (performanceMetrics.largestContentfulPaint > lcp) {
    console.warn(`⚠️ LCP of ${performanceMetrics.largestContentfulPaint} ms exceeded threshold of ${lcp} ms`);
  }

  if (performanceMetrics.timeToInteractive > tti) {
    console.warn(`⚠️ TTI of ${performanceMetrics.timeToInteractive} ms exceeded threshold of ${tti} ms`);
  }

  if (performanceMetrics.cumulativeLayoutShift > cls) {
    console.warn(`⚠️ CLS of ${performanceMetrics.cumulativeLayoutShift} exceeded threshold of ${cls}`);
  }

  performanceMetrics.componentRenderTimes.forEach(({ name, renderTime }) => {
    if (renderTime > componentRenderTime) {
      console.warn(`⚠️ Component ${name} render time of ${renderTime} ms exceeded threshold of ${componentRenderTime} ms`);
    }
  });
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
  trackComponentRender,
  checkPerformanceAlerts
};
