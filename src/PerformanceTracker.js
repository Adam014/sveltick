// Default thresholds and configurations for metrics
const defaultThresholds = {
  fcp: 2000, // Default: 2s for FCP
  lcp: 2500, // Default: 2.5s for LCP
  tti: 3000, // Default: 3s for TTI
  cls: 0.1, // Default: CLS should be below 0.1
  fid: 100, // Default: 100ms for FID
  inp: 200, // Default: 200ms for INP
  ttfb: 800, // Default: 800ms for TTFB
  componentRenderTime: 500 // Default: 500ms for component render time
}

const MAX_SCORE = 100

// Tracking Metrics Data
let performanceMetrics = {
  firstContentfulPaint: null,
  timeToInteractive: null,
  largestContentfulPaint: null,
  cumulativeLayoutShift: 0,
  firstInputDelay: null,
  interactionToNextPaint: null,
  timeToFirstByte: null,
  componentRenderTimes: []
}

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

// Core Tracker Functions

// First Contentful Paint
function trackFirstContentfulPaint() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entry = list.getEntriesByName('first-contentful-paint')[0]
        if (entry) {
          performanceMetrics.firstContentfulPaint = entry.startTime
          console.log(`⚡️ First Contentful Paint: ${entry.startTime.toFixed(2)} ms`)
          observer.disconnect() // Disconnect the observer after the first entry
          resolve()
        }
      })
      observer.observe({ type: 'paint', buffered: true })
    } else {
      resolve()
    }
  })
}

// Time to Interactive
function trackTimeToInteractive() {
  return new Promise((resolve) => {
    const setTTI = () => {
      const tti = performance.now()
      performanceMetrics.timeToInteractive = tti
      console.log(`🕒 Time to Interactive: ${tti.toFixed(2)} ms`)
      resolve()
    }

    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        setTTI()
      } else {
        window.addEventListener('load', setTTI)
      }
    } else {
      resolve()
    }
  })
}

// Largest Contentful Paint
function trackLargestContentfulPaint() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] // Get the last entry
        performanceMetrics.largestContentfulPaint = lastEntry.startTime
        console.log(`📏 Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)} ms`)
        observer.disconnect() // Disconnect the observer
        resolve()
      })
      observer.observe({ type: 'largest-contentful-paint', buffered: true })
    } else {
      resolve()
    }
  })
}

// Cumulative Layout Shift
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
        observer.disconnect() // Disconnect after gathering data
        resolve()
      })
      observer.observe({ type: 'layout-shift', buffered: true })
    } else {
      resolve()
    }
  })
}

// First Input Delay (FID)
function trackFirstInputDelay() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      const handleUserInteraction = (event) => {
        const delay = event.timeStamp
        performanceMetrics.firstInputDelay = delay
        console.log(`🖱 First Input Delay: ${delay.toFixed(2)} ms`)
        window.removeEventListener('pointerdown', handleUserInteraction)
        resolve()
      }
      window.addEventListener('pointerdown', handleUserInteraction)
    } else {
      resolve()
    }
  })
}

// Interaction to Next Paint (INP)
function trackInteractionToNextPaint() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      const handleInteraction = (event) => {
        const inp = performance.now() - event.timeStamp
        performanceMetrics.interactionToNextPaint = inp
        console.log(`🎨 Interaction to Next Paint: ${inp.toFixed(2)} ms`)
        window.removeEventListener('click', handleInteraction)
        resolve()
      }
      window.addEventListener('click', handleInteraction)
    } else {
      resolve()
    }
  })
}

// Time to First Byte (TTFB)
function trackTimeToFirstByte() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      const ttfb = performance.timing.responseStart - performance.timing.requestStart
      performanceMetrics.timeToFirstByte = ttfb
      console.log(`⏳ Time to First Byte: ${ttfb.toFixed(2)} ms`)
      resolve()
    } else {
      resolve()
    }
  })
}

// Track Component Render Times
function trackComponentRender(name, renderTime) {
  performanceMetrics.componentRenderTimes.push({ name, renderTime })
  console.log(`🔧 Component ${name} rendered in ${renderTime.toFixed(2)} ms`)
}

// Performance Alerts
function checkPerformanceAlerts(thresholds = {}) {
  const { fcp, lcp, tti, cls, fid, inp, ttfb, componentRenderTime } = thresholds

  if (performanceMetrics.firstContentfulPaint > fcp) {
    console.warn(`⚠️ FCP of ${performanceMetrics.firstContentfulPaint} ms exceeded ${fcp} ms`)
  }
  if (performanceMetrics.largestContentfulPaint > lcp) {
    console.warn(`⚠️ LCP of ${performanceMetrics.largestContentfulPaint} ms exceeded ${lcp} ms`)
  }
  if (performanceMetrics.timeToInteractive > tti) {
    console.warn(`⚠️ TTI of ${performanceMetrics.timeToInteractive} ms exceeded ${tti} ms`)
  }
  if (performanceMetrics.cumulativeLayoutShift > cls) {
    console.warn(`⚠️ CLS of ${performanceMetrics.cumulativeLayoutShift} exceeded ${cls}`)
  }
  if (performanceMetrics.firstInputDelay > fid) {
    console.warn(`⚠️ FID of ${performanceMetrics.firstInputDelay} ms exceeded ${fid} ms`)
  }
  if (performanceMetrics.interactionToNextPaint > inp) {
    console.warn(`⚠️ INP of ${performanceMetrics.interactionToNextPaint} ms exceeded ${inp} ms`)
  }
  if (performanceMetrics.timeToFirstByte > ttfb) {
    console.warn(`⚠️ TTFB of ${performanceMetrics.timeToFirstByte} ms exceeded ${ttfb} ms`)
  }

  performanceMetrics.componentRenderTimes.forEach(({ name, renderTime }) => {
    if (renderTime > componentRenderTime) {
      console.warn(`⚠️ Component ${name} render time exceeded ${componentRenderTime} ms`)
    }
  })
}

// Calculate Performance Score
function calculatePerformanceScore() {
  let score = MAX_SCORE

  const metricDifferences = [
    (performanceMetrics.firstContentfulPaint - defaultThresholds.fcp) / 100,
    (performanceMetrics.largestContentfulPaint - defaultThresholds.lcp) / 100,
    (performanceMetrics.timeToInteractive - defaultThresholds.tti) / 100,
    (performanceMetrics.cumulativeLayoutShift - defaultThresholds.cls) * 100,
    (performanceMetrics.firstInputDelay - defaultThresholds.fid) / 100,
    (performanceMetrics.interactionToNextPaint - defaultThresholds.inp) / 100,
    (performanceMetrics.timeToFirstByte - defaultThresholds.ttfb) / 100
  ]

  metricDifferences.forEach((diff) => {
    if (diff > 0) score -= diff
  })

  performanceMetrics.componentRenderTimes.forEach(({ renderTime }) => {
    const diff = (renderTime - defaultThresholds.componentRenderTime) / 100
    if (diff > 0) score -= diff
  })

  return Math.max(0, Math.round(score))
}

// Provide Feedback
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

// Run Gamification
async function runGamification() {
  await getPerformanceMetrics()
  const score = calculatePerformanceScore()
  provideFeedback(score)
}

// Automatically rerun all tracking functions when calling getPerformanceMetrics
async function getPerformanceMetrics() {
  await Promise.all([
    trackFirstContentfulPaint(),
    trackTimeToInteractive(),
    trackLargestContentfulPaint(),
    trackCumulativeLayoutShift(),
    trackFirstInputDelay(),
    trackInteractionToNextPaint(),
    trackTimeToFirstByte()
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
  trackFirstInputDelay,
  trackInteractionToNextPaint,
  trackTimeToFirstByte,
  trackComponentRender,
  checkPerformanceAlerts,
  calculatePerformanceScore,
  runGamification
}
