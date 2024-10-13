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

Tracking First Contentful Paint & Time to Interactive
```svelte
<script>
  import { trackFirstContentfulPaint, trackTimeToInteractive } from 'sveltick';

  // Track metrics
  trackFirstContentfulPaint();
  trackTimeToInteractive();
</script>
```

## Tracking Component Render Times
Use the Sveltick component to track the render times of individual components:

```svelte
<script>
  import { Sveltick } from 'sveltick';
</script>

<Sveltick name="MyCoolComponent">
  <p>This component is tracked by Sveltick! 🎉</p>
</Sveltick>
```

## 🛠 Performance Report
You can access all performance metrics at any point using:

```svelte
import { getPerformanceMetrics } from 'sveltick';

const metrics = getPerformanceMetrics();
console.log(metrics); // Output your performance metrics 🧐
```

## 📜 License
MIT ©️ Adam Stadnik