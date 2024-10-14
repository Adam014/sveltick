# ⚡️ Sveltick

Welcome to **Sveltick**! This is a super lightweight 🦋 and fun performance-tracking library for your Svelte apps. Track important performance metrics like:

- **First Contentful Paint** ⚡️
- **Time to Interactive** 🕒
- **Component Render Time** 🔧

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

Tracking First Contentful Paint, Time to Interactive, Largest Contentful Paint & Cumulative Layout Shift
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

## Tracking Component Render Times
Use the Sveltick component to track the render times of individual components:

```svelte
  import { onMount } from 'svelte';
  import { trackComponentRender } from 'sveltick';

  onMount(() => {
    const renderTime = performance.now();  // Measure render time
    trackComponentRender('YourComponent', renderTime);  // Track component render
  });
```

## 🛠 Performance Report
You can access all performance metrics at any point using:

```svelte
import { getPerformanceMetrics } from 'sveltick';

const metrics = getPerformanceMetrics();
console.log(metrics); // Output your performance metrics 🧐
```

## Tracking all reports at once (components + FCP, TTI, LCP & CLS)

```svelte
  import { onMount } from 'svelte';
  import { getPerformanceMetrics } from 'sveltick';

  onMount(async () => {
    const metrics = await getPerformanceMetrics();
    console.log('Performance Metrics (including component renders):', metrics);
  });
```

## 📜 License
MIT ©️ Adam Stadnik