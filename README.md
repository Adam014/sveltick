# ⚡️ Sveltick

Welcome to **Sveltick**! This is a super lightweight 🦋 and fun performance-tracking library for your Svelte apps. Track important performance metrics like:

## 🚀 New Version 1.3.5

- Providing a performance score based on how well the app meets the defined thresholds.
- Offering feedback in a fun way, rewarding high scores and encouraging improvements for lower scores.
- `runPerformanceTracker()` - main function that runs all the tracking, alerts, and gamification features.
- Users can customize what they want to run through options like `trackMetrics`, `showAlerts`, and `enableGamification`.
- Fixing error: `TypeError: Cannot read properties of undefined (reading 'message')`

## 📊 Metrics to check

- **First Contentful Paint** ⚡️
- **Time to Interactive** 🕒
- **Component Render Time** 🔧
- **Largest Contentful Paint** 📏
- **Cumulative Layout Shift** 📊

## 🚀 Installation

Install **Sveltick** via npm:

```bash
npm install sveltick
```

Install **Sveltick** via yarn:

```bash
yarn add sveltick
```

## 🔥 Quick Start

Import **Sveltick** into your Svelte app and start tracking your app's performance!

### 📈 Track **everything** you need and configure what metrics you want to see

```svelte
  import { onMount } from 'sveltick';
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
        componentRenderTime: 400 // Custom threshold for component render time
      }
    });
  });
```

### Tracking `⚡️First Contentful Paint`, 🕒`Time to Interactive`, 📏`Largest Contentful Paint` & `📊 Cumulative Layout Shift`

```svelte
<script>
  import { onMount } from 'svelte';
  import { trackFirstContentfulPaint, trackTimeToInteractive, trackLargestContentfulPaint, trackCumulativeLayoutShift } from 'sveltick';

  onMount(() => {
    // Track metrics
    trackFirstContentfulPaint();
    trackTimeToInteractive();
    trackLargestContentfulPaint();
    trackCumulativeLayoutShift();
  });
</script>
```

### 🔧 Tracking `Component` Render Times

```svelte
  import { onMount } from 'svelte';
  import { trackComponentRender } from 'sveltick';

  onMount(() => {
    const renderTime = performance.now();  // Measure render time
    trackComponentRender('YourComponent', renderTime);  // Track component render
  });
```

### 🛠 Performance Report

You can access all performance metrics at any point using:

```svelte
import { getPerformanceMetrics } from 'sveltick';

const metrics = getPerformanceMetrics();
console.log(metrics); // Output your performance metrics 🧐
```

### 📈 Tracking **all reports** at once (`🔧components` + `⚡️FCP`, `🕒TTI`, `📏LCP` & `📊CLS`)

```svelte
  import { onMount } from 'svelte';
  import { getPerformanceMetrics } from 'sveltick';

  onMount(async () => {
    const metrics = await getPerformanceMetrics();
    console.log('Performance Metrics (including component renders):', metrics);
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
      componentRenderTime: 400 // Custom threshold for component render time
    });
  });
```

### 🎯 Checking the score of your web based by the performance

```svelte
  import { onMount } from 'sveltick';
  import { runGamification } from 'sveltick';

  onMount(() => {
    // Run the gamification logic
    runGamification();
  });
```

## 📜 License

MIT ©️ Adam Stadnik
