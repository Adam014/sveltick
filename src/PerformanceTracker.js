// Default thresholds and configurations for metrics
const defaultThresholds = {
  fcp: 2000, // Default: 2s for FCP
  lcp: 2500, // Default: 2.5s for LCP
  tti: 3000, // Default: 3s for TTI
  cls: 0.1, // Default: CLS should be below 0.1
  componentRenderTime: 500 // Default: 500ms for component render time
}

const MAX_SCORE = 100

// All-in-One Main Function with Presets
async function runPerformanceTracker(options = {}) {
  const {
    trackMetrics = true, // Enable or disable tracking of all metrics
    showAlerts = true, // Enable or disable performance alerts
    enableGamification = true, // Enable or disable gamification
    thresholds = {} // Allow users to set custom thresholds for alerts
  } = options

  // Merge user-defined thresholds with defaults
  const mergedThresholds = { ...defaultThresholds, ...thresholds }

  // Step 1: Track Metrics
  if (trackMetrics) {
    await getPerformanceMetrics() // Runs all tracking functions
    console.log('📊 Performance Metrics:', performanceMetrics)
  }

  // Step 2: Check Performance Alerts if enabled
  if (showAlerts) {
    checkPerformanceAlerts(mergedThresholds)
  }

  // Step 3: Run Gamification if enabled
  if (enableGamification) {
    const score = calculatePerformanceScore()
    provideFeedback(score)
  }
}

// Tracking Functions (same as before)
let performanceMetrics = {
  firstContentfulPaint: null,
  timeToInteractive: null,
  largestContentfulPaint: null,
  cumulativeLayoutShift: 0,
  componentRenderTimes: []
}

function trackFirstContentfulPaint() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entry = list.getEntriesByName('first-contentful-paint')[0]
        if (entry) {
          performanceMetrics.firstContentfulPaint = entry.startTime
          console.log(`⚡️ First Contentful Paint: ${entry.startTime.toFixed(2)} ms`)
          resolve()
        }
      })
      observer.observe({ type: 'paint', buffered: true })
    } else {
      resolve()
    }
  })
}

function trackTimeToInteractive() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const tti = performance.now()
        performanceMetrics.timeToInteractive = tti
        console.log(`🕒 Time to Interactive: ${tti.toFixed(2)} ms`)
        resolve()
      })

      if (document.readyState === 'complete') {
        const ttiFallback = performance.now()
        performanceMetrics.timeToInteractive = ttiFallback
        console.log(`🕒 Time to Interactive (Fallback): ${ttiFallback.toFixed(2)} ms`)
        resolve()
      }
    } else {
      resolve()
    }
  })
}

function trackLargestContentfulPaint() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        performanceMetrics.largestContentfulPaint = lastEntry.startTime
        console.log(`📏 Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)} ms`)
        resolve()
      })
      observer.observe({ type: 'largest-contentful-paint', buffered: true })
    } else {
      resolve()
    }
  })
}

function trackCumulativeLayoutShift() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput && entry.value) {
            clsValue += entry.value
          }
        })
        performanceMetrics.cumulativeLayoutShift = clsValue
        console.log(`📊 Cumulative Layout Shift: ${clsValue.toFixed(4)}`)
        resolve()
      })
      observer.observe({ type: 'layout-shift', buffered: true })
    } else {
      resolve()
    }
  })
}

function trackComponentRender(name, renderTime) {
  performanceMetrics.componentRenderTimes.push({ name, renderTime })
  console.log(`🔧 Component ${name} rendered in ${renderTime.toFixed(2)} ms`)
}

function checkPerformanceAlerts(thresholds = {}) {
  const { fcp, lcp, tti, cls, componentRenderTime } = thresholds

  if (performanceMetrics.firstContentfulPaint > fcp) {
    console.warn(
      `⚠️ FCP of ${performanceMetrics.firstContentfulPaint} ms exceeded threshold of ${fcp} ms`
    )
  }

  if (performanceMetrics.largestContentfulPaint > lcp) {
    console.warn(
      `⚠️ LCP of ${performanceMetrics.largestContentfulPaint} ms exceeded threshold of ${lcp} ms`
    )
  }

  if (performanceMetrics.timeToInteractive > tti) {
    console.warn(
      `⚠️ TTI of ${performanceMetrics.timeToInteractive} ms exceeded threshold of ${tti} ms`
    )
  }

  if (performanceMetrics.cumulativeLayoutShift > cls) {
    console.warn(
      `⚠️ CLS of ${performanceMetrics.cumulativeLayoutShift} exceeded threshold of ${cls}`
    )
  }

  performanceMetrics.componentRenderTimes.forEach(({ name, renderTime }) => {
    if (renderTime > componentRenderTime) {
      console.warn(
        `⚠️ Component ${name} render time of ${renderTime} ms exceeded threshold of ${componentRenderTime} ms`
      )
    }
  })
}

function calculatePerformanceScore() {
  let score = MAX_SCORE

  const metricDifferences = [
    (performanceMetrics.firstContentfulPaint - defaultThresholds.fcp) / 100,
    (performanceMetrics.largestContentfulPaint - defaultThresholds.lcp) / 100,
    (performanceMetrics.timeToInteractive - defaultThresholds.tti) / 100,
    (performanceMetrics.cumulativeLayoutShift - defaultThresholds.cls) * 100
  ]

  metricDifferences.forEach((diff) => {
    if (diff > 0) score -= diff
  })

  performanceMetrics.componentRenderTimes.forEach(({ renderTime }) => {
    const diff = (renderTime - defaultThresholds.componentRenderTime) / 100
    if (diff > 0) score -= diff
  })

  return Math.max(0, Math.round(score)) // Ensure score doesn't go below 0
}

function provideFeedback(score) {
  const feedbackMap = [
    { threshold: 90, message: `🏆 Excellent! Your score is ${score}/100. Keep up the great work!` },
    {
      threshold: 70,
      message: `👍 Good job! Your score is ${score}/100. Some improvements needed.`
    },
    {
      threshold: 0,
      message: `⚠️ Needs Improvement! Your score is ${score}/100. Optimize for better performance.`
    }
  ]

  const feedback = feedbackMap.find((fb) => score >= fb.threshold)
  console.log(feedback?.message)
}

// Gamification - Run only gamification logic
async function runGamification() {
  // Gather the necessary performance metrics
  await getPerformanceMetrics()

  // Calculate the performance score
  const score = calculatePerformanceScore()

  // Provide feedback based on the score
  provideFeedback(score)
}

// Automatically rerun all tracking functions when calling getPerformanceMetrics
async function getPerformanceMetrics() {
  await Promise.all([
    trackFirstContentfulPaint(),
    trackTimeToInteractive(),
    trackLargestContentfulPaint(),
    trackCumulativeLayoutShift()
  ])
  return performanceMetrics
}

// Expose functions for custom use
export {
  runPerformanceTracker, // All-in-one function
  getPerformanceMetrics, // Track metrics manually
  trackFirstContentfulPaint,
  trackTimeToInteractive,
  trackLargestContentfulPaint,
  trackCumulativeLayoutShift,
  trackComponentRender,
  checkPerformanceAlerts,
  calculatePerformanceScore,
  runGamification
}
