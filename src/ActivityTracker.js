// Utility to check if code is running in a browser environment
function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

// Initialize traffic sources from localStorage, or default values if they don't exist
let trafficSources = isBrowser()
  ? JSON.parse(localStorage.getItem('trafficSources')) || {
      Direct: 0,
      Google: 0,
      Facebook: 0,
      Others: 0
    }
  : { Direct: 0, Google: 0, Facebook: 0, Others: 0 }

// Initialize other tracking values from localStorage
let pageViewCount = isBrowser() ? parseInt(localStorage.getItem('pageViewCount')) || 0 : 0
let uniqueVisitors = isBrowser()
  ? new Set(JSON.parse(localStorage.getItem('uniqueVisitors')) || [])
  : new Set()
let routeViews = isBrowser() ? JSON.parse(localStorage.getItem('routeViews')) || [] : []

// Track page views and update in localStorage, only in browser
function trackPageView() {
  if (isBrowser()) {
    const updatedPageViewCount = pageViewCount + 1
    localStorage.setItem('pageViewCount', updatedPageViewCount)
    return updatedPageViewCount
  }
  return 0 // Return 0 if not in browser
}

// Get page view count
function getPageViews() {
  return isBrowser() ? parseInt(localStorage.getItem('pageViewCount')) || 0 : 0
}

// Track unique visitors using localStorage to persist visitorId, only in browser
function trackUniqueVisitors() {
  if (isBrowser()) {
    let visitorId = localStorage.getItem('visitorId')
    if (!visitorId) {
      visitorId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      localStorage.setItem('visitorId', visitorId)
    }
    uniqueVisitors.add(visitorId)
    localStorage.setItem('uniqueVisitors', JSON.stringify([...uniqueVisitors]))
    return uniqueVisitors.size
  }
  return 0 // Return 0 if not in browser
}

// Get unique visitor count
function getUniqueVisitors() {
  return isBrowser() ? JSON.parse(localStorage.getItem('uniqueVisitors')).length || 0 : 0
}

// Track all viewed routes and associate with the user ID, but prevent duplicate routes
function trackRouteView(route) {
  if (isBrowser()) {
    const newRoute = { route, timestamp: Date.now() }

    // Only add the route if it hasn't been tracked in this session
    if (!routeViews.find((view) => view.route === route)) {
      routeViews.push(newRoute) // Add the new route view along with the user ID
      localStorage.setItem('routeViews', JSON.stringify(routeViews)) // Save updated route views to localStorage
    }
    return routeViews
  }
  return [] // Return empty array if not in browser
}

// Get all route views
function getRouteViews() {
  return isBrowser() ? JSON.parse(localStorage.getItem('routeViews')) || [] : []
}

// Track the source of traffic and update in localStorage
function trackSourceOfTraffic() {
  if (isBrowser()) {
    // Only track the source once per session
    if (!sessionStorage.getItem('trackedTrafficSource')) {
      const referrer = document.referrer.toLowerCase()

      if (!referrer) {
        trafficSources.Direct++ // No referrer means Direct visit
      } else if (referrer.includes('google')) {
        trafficSources.Google++ // Referrer from Google
      } else if (referrer.includes('facebook')) {
        trafficSources.Facebook++ // Referrer from Facebook
      } else {
        trafficSources.Others++ // Any other referrer is counted as Others
      }

      // Mark the traffic source as tracked for this session
      sessionStorage.setItem('trackedTrafficSource', 'true')
    }

    // Store updated traffic sources in localStorage
    localStorage.setItem('trafficSources', JSON.stringify(trafficSources))

    // Return the current traffic sources for use
    return trafficSources
  }

  // Default return if not in a browser environment
  return { Direct: 0, Google: 0, Facebook: 0, Others: 0 }
}

// Get traffic sources
function getTrafficSources() {
  return isBrowser()
    ? JSON.parse(localStorage.getItem('trafficSources')) || trafficSources
    : { Direct: 0, Google: 0, Facebook: 0, Others: 0 }
}

// Track all activities and return an object with data
function trackAllActivities() {
  return {
    pageViews: trackPageView(),
    uniqueVisitors: trackUniqueVisitors(),
    routeViews: trackRouteView(window.location.pathname),
    trafficSources: trackSourceOfTraffic()
  }
}
// Expose functions for custom use
export {
  trackAllActivities, // Track all activities at once
  getPageViews, // Get total page views
  getUniqueVisitors, // Get total unique visitors
  getRouteViews, // Get all route views
  getTrafficSources // Get traffic sources
}
