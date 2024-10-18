# ⚡️ Sveltick

Welcome to **Sveltick**! This is a super lightweight 🦋 and fun **performance**&**traffic**-tracking library for your Svelte apps.

✅ **v5 Svelte support**

## 📦 Latest Version 1.7.0

- Adding tracking of Web traffic - 👁️ pageViews, 🧑‍🤝‍🧑 uniqueUsers, 🛣️ visitedRoutes and 🔗 trafficSources
- Also possible to get each of them only
- For the best experience we need to use `onMount` but also `afterUpdate` and use this code in our `src/+layout.svelte` for tracking traffic.

## 📥 Installation

Install **Sveltick** via npm:

```bash
npm install sveltick
```

Install **Sveltick** via yarn:

```bash
yarn add sveltick
```

---

## 🔥 Quick Start

Import **Sveltick** into your Svelte app and start tracking your app's performance!

### 📈 Track **everything** you need and configure what metrics you want to see

```svelte
  import { onMount } from 'svelte';
  import { runPerformanceTracker } from 'sveltick';

  onMount(() => {
    // Run the performance tracker with custom options
    runPerformanceTracker({
      trackMetrics: true,     // Track all metrics
      showAlerts: true,       // Enable alerts
      enableGamification: true, // Enable gamification
      thresholds:  {
        fcp: 1800,  // Custom threshold for FCP
        lcp: 2300,  // Custom threshold for LCP
        tti: 2800,  // Custom threshold for TTI
        cls: 0.15,  // Custom threshold for CLS
        fid: 100, // Custom threshold for FID
        inp: 200, // Custom threshold for INP
        ttfb: 800, // Custom threshold for TTFB
        componentRenderTime: 400 // Custom threshold for component render time
      }
    });
  });
```

📌 Note:
The `thresholds` object is optional, and each metric has a default value. If you don't provide a custom threshold for a particular metric, the following default values will be used:

- First Contentful Paint (FCP): 2000ms
- Largest Contentful Paint (LCP): 2500ms
- Time to Interactive (TTI): 3000ms
- Cumulative Layout Shift (CLS): 0.1
- First Input Delay (FID): 100ms _(User must interact with the page to track this metric)_
- Interaction to Next Paint (INP): 200ms _(User must interact with the page to track this metric)_
- Time to First Byte (TTFB): 800ms
- Component Render Time: 500ms

### Tracking ⚡️ `First Contentful Paint`, 🕒`Time to Interactive`, 📏`Largest Contentful Paint` & 📊 `Cumulative Layout Shift`, 🖱️ `First Input Delay`, 🖌️ `Interaction to Next Paint`, 📡 `Time to First Byte`

```svelte
<script>
  import { onMount } from 'svelte';
  import { trackFirstContentfulPaint, trackTimeToInteractive, trackLargestContentfulPaint, trackCumulativeLayoutShift, trackFirstInputDelay, trackInteractionToNextPaint, trackTimeToFirstByte } from 'sveltick';

  onMount(async () => {
    const ftp = await trackFirstContentfulPaint()
    const tti = await trackTimeToInteractive()
    const lcp = await trackLargestContentfulPaint();
    const cls = await trackCumulativeLayoutShift();
    const fid = await trackFirstInputDelay();
    const inp = await trackInteractionToNextPaint();
    const ttfb = await trackTimeToFirstByte();

    console.log(ftp, tti, lcp, cls, fid, inp, ttfb)
  });

</script>
```

### 🔧 Tracking `Component` Render Times

```svelte
  import { onMount } from 'svelte';
  import { trackComponentRender } from 'sveltick';

	onMount(() => {
		const now = performance.now();  // Measure render time
		const { name, renderTime } = trackComponentRender('YourComponent', now);  // Get the name and render time
		console.log(name, renderTime);
	});
```

### 🛠 Performance Report

You can access all performance metrics (including components one) at any point using:

```svelte
  import { onMount } from 'svelte';
  import { trackComponentRender, getPerformanceMetrics } from 'sveltick';

  onMount(async () => {
    const now = performance.now();  // Measure render time
    trackComponentRender('YourComponent', now);  // Get the name and render time
    const metrics = await getPerformanceMetrics();
    console.log(metrics)
  });
```

### ⚠️ Checking for all performance with custom threshold alerts

```svelte
  import { onMount } from 'svelte';
  import { getPerformanceMetrics, checkPerformanceAlerts } from 'sveltick';

  onMount(async () => {
    const metrics = await getPerformanceMetrics();
    console.log('Updated Performance Metrics:', metrics);

    // Check for any performance alerts with custom thresholds
    checkPerformanceAlerts({
      fcp: 1800,  // Custom threshold for FCP
      lcp: 2300,  // Custom threshold for LCP
      tti: 2800,  // Custom threshold for TTI
      cls: 0.15,  // Custom threshold for CLS
      fid: 100, // Custom threshold for FID
      inp: 200, // Custom threshold for INP
      ttfb: 800, // Custom threshold for TTFB
      componentRenderTime: 400 // Custom threshold for component render time
    });
  });
```

### 🎯 Checking the score of your web based by the performance

```svelte
  import { onMount } from 'svelte';
  import { runGamification } from 'sveltick';

  onMount(() => {
    // Run the gamification logic
    runGamification();
  });
```

### Checking all traffic metrics

For the best experience we need to use `onMount` but also `afterUpdate` and use this code in our `src/+layout.svelte`.

```svelte
  import { onMount, afterUpdate } from 'svelte';
  import { trackAllActivities } from 'sveltick';

	// Track all activities on component mount and update
	let trackedData = {};

	// This function will track and log activities when the component is mounted
	onMount(() => {
		trackedData = trackAllActivities();
		console.log('Tracked Data on Mount:', trackedData);
	});

	// This function will track and log activities every time the component is updated
	afterUpdate(() => {
		trackedData = trackAllActivities
		console.log('Tracked Data after Update:', trackedData);
	});
```

### Track Page Views

```svelte
  import { onMount, afterUpdate } from 'svelte';
  import { trackAllActivies, getPageViews } from 'sveltick';

	let pageViews = 0;

	// This function will track and log activities when the component is mounted
	onMount(() => {
		trackedData = trackAllActivities();
		pageViews = getPageViews();
		console.log(pageViews)
	});

	// This function will track and log activities every time the component is updated
	afterUpdate(() => {
		trackedData = trackAllActivities();
		pageViews = getPageViews();
		console.log(pageViews)
	});
```

### Track Unique Users

```svelte
  import { onMount, afterUpdate } from 'svelte';
  import { trackAllActivies, getUniqueVisitors } from 'sveltick';

	let uniqueVisitors = 0;

	// This function will track and log activities when the component is mounted
	onMount(() => {
		trackedData = trackAllActivities();
		uniqueVisitors = getUniqueVisitors();
		console.log(uniqueVisitors)
	});

	// This function will track and log activities every time the component is updated
	afterUpdate(() => {
		trackedData = trackAllActivities();
		uniqueVisitors = getUniqueVisitors();
		console.log(uniqueVisitors)
	});
```

### Track Route Visited

```svelte
  import { onMount, afterUpdate } from 'svelte';
  import { trackAllActivies, getRouteViews } from 'sveltick';

  let routeViews = [];

	// This function will track and log activities when the component is mounted
	onMount(() => {
		trackedData = trackAllActivities();
		routeViews = getRouteViews();
		console.log(routeViews)
	});

	// This function will track and log activities every time the component is updated
	afterUpdate(() => {
		trackedData = trackAllActivities();
		routeViews = getRouteViews();
		console.log(routeViews)
	});
```

### Track Traffic Sources

- We have for now 4 sources from user comes and we differ it out - `Direct`, `Facebook`, `Google` and `Others`

```svelte
  import { onMount, afterUpdate } from 'svelte';
  import { trackAllActivies, getTrafficSources} from 'sveltick';

  let trafficSources = {};

	// This function will track and log activities when the component is mounted
	onMount(() => {
		trackedData = trackAllActivities();
		trafficSources = getTrafficSources();
		console.log(trafficSources)
	});

	// This function will track and log activities every time the component is updated
	afterUpdate(() => {
		trackedData = trackAllActivities();
    trafficSources = getTrafficSources();
		console.log(trafficSources)
	});
```

---

## 📊 Metrics to check:

### Performance

- **First Contentful Paint** ⚡️
- **Time to Interactive** 🕒
- **Component Render Time** 🔧
- **Largest Contentful Paint** 📏
- **Cumulative Layout Shift** 📊
- **First Input Delay** 🖱️ _(Click-based)_
- **Interaction to Next Paint** 🖌️ _(Click-based)_
- **Time to First Byte** 📡

### 🚦 Traffic

- **Page Views** 👁️
- **Unique Users** 🧑‍🤝‍🧑
- **Visited Routes** 🛣️
- **Traffic Sources** 🔗

#### 🖱️ First Input Delay (FID) & 🖌️ Interaction to Next Paint (INP)

📌 Note:

- FID and INP metrics are triggered by user interactions like clicks. These metrics depend on actual user interaction events.
- If no interaction occurs within 5 seconds, the FID and INP values will be set to null and won't impact the performance alerts or gamification score.

## ⏳ Coming up in next releases:

1. Any events in page as page views, clicks per view etc...
2. Plugin system - users can integrate other performance functions from other providers like Web Vitals or Lighthouse
3. Integration with analytics platforms, like Google Analytics, Sentry or DataDog - data can be send to these providers
4. Dashboard perfomance-tracker (docs website + dashboard)
5. Visual showcase of the metrics (graphs)(probably on the dashboard web dont know yet)

## Output example screenshot:

![Sveltick Example](https://storage.googleapis.com/sveltick_assets/screenshot_sveltick.png)

For now it is just this simple console info about the project (of course you could implement it into something bigger!). But in the **upcoming days I will create a dashboard performance-tracking webapp for this library**, where you could use `Sveltick` from anywhere around the globe! So stay tuned guys!

## 📜 License

MIT ©️ Adam Stadnik
