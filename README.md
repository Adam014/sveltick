# ⚡️ Sveltick

Welcome to **Sveltick**! This is a super lightweight 🦋 and fun performance-tracking library for your Svelte apps.

## 🚀 New Version 1.5.2

- Implementing new metrics: `First Input Delay (FID)`, `Interaction to Next Paint (INP)` & `Time to First Byte (TTFB)`
- Better documentation with notes for optional `threshold` and FID & INP
- Fixing bugs with not running functions
- Adding when there is not tracked INP & FID after 5s, it will be null.
- Fixing observers are null

## 🚀 Installation

Install **Sveltick** via npm:

```bash
npm install sveltick
```

Install **Sveltick** via yarn:

```bash
yarn add sveltick
```

## 📊 Metrics to check

- **First Contentful Paint** ⚡️
- **Time to Interactive** 🕒
- **Component Render Time** 🔧
- **Largest Contentful Paint** 📏
- **Cumulative Layout Shift** 📊
- **First Input Delay** 🖱️ _(Click-based)_
- **Interaction to Next Paint** 🖌️ _(Click-based)_
- **Time to First Byte** 📡

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

  onMount(() => {
    // Track metrics
    trackFirstContentfulPaint();
    trackTimeToInteractive();
    trackLargestContentfulPaint();
    trackCumulativeLayoutShift();
    trackFirstInputDelay();
    trackInteractionToNextPaint();
    trackTimeToFirstByte();
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
      fid: 100, // Custom threshold for FID
      inp: 200, // Custom threshold for INP
      ttfb: 800, // Custom threshold for TTFB
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

#### 🖱️ First Input Delay (FID) & 🖌️ Interaction to Next Paint (INP)

📌 Note:

- FID and INP metrics are triggered by user interactions like clicks. These metrics depend on actual user interaction events.
- If no interaction occurs within 5 seconds, the FID and INP values will be set to null and won't impact the performance alerts or gamification score.

Output example screenshot:

![Sveltick Example](https://storage.googleapis.com/sveltick_assets/screenshot_sveltick.png)

For now it is just this simple console info about the project (of course you could implement it into something bigger!). But in the **upcoming days I will create a dashboard performance-tracking webapp for this library**, where you could use `Sveltick` from anywhere around the globe! So stay tuned guys!

## 📜 License

MIT ©️ Adam Stadnik
