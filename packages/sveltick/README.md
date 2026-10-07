# Sveltick

Document performance and navigation activity for Svelte and SvelteKit.

**Unreleased development source:** the APIs below are on the repository's main branch.
The package version remains 1.7.1 during development; published npm 1.7.1
predates these fixes. Build this workspace or install its
packed archive to try them before the next package release.

## SvelteKit

Register once in `src/routes/+layout.svelte`, keeping its existing slot/children:

```svelte
<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { connectSvelteKit } from 'sveltick';

  const tracking = connectSvelteKit({ afterNavigate, onDestroy }, {
    activity: { storage: 'indexeddb', namespace: 'my-app' }
  });
  onMount(() => tracking.performance.subscribe((snapshot) => {
    console.log(snapshot.metrics.INP);
  }));
</script>
```

The initial page and completed client navigations each produce one visit.
Renders do not count as navigations. Storage defaults to isolated memory;
IndexedDB is opt-in and provides transactional totals shared across tabs.
These are browser-local activity counts, not site-wide analytics. Nothing is
sent to a server automatically.

[SvelteKit guide](https://github.com/Adam014/sveltick/blob/main/docs/sveltekit.md)
· [Activity and storage](https://github.com/Adam014/sveltick/blob/main/docs/activity.md)

## Performance without a framework

```ts
import { createTracker } from "sveltick";

const tracker = createTracker({ maxComponentEntries: 100 });
tracker.start();
const unsubscribe = tracker.subscribe((snapshot) => {
  console.log(snapshot.metrics.LCP.value, snapshot.metrics.LCP.status);
});
const snapshot = tracker.getSnapshot();
unsubscribe();
tracker.dispose();
```

FCP, LCP, CLS, INP and TTFB use the bundled web-vitals backend. Numeric snapshots
include units, timestamps and pending/available/unsupported/error states.
Values can update throughout the document lifetime. Missing data stays null;
no-interaction INP is not fabricated as zero. Reads do not restart measurement.
`stop()` freezes this instance; `start()` resumes it. `dispose()` removes its
subscribers. The shared measurement backend follows the document lifetime.

`recordComponent(name, durationMs)` records a supplied duration; `measure(name)`
returns an end function for an explicitly chosen interval. Neither API claims
to automatically profile Svelte rendering. History has count and age limits.

[Tracker lifecycle](https://github.com/Adam014/sveltick/blob/main/docs/tracker.md)
· [Metric collection](https://github.com/Adam014/sveltick/blob/main/docs/collection.md)

## Reports and optional export

```ts
import { createTracker, createPerformanceReport } from "sveltick";
const tracker = createTracker({
  onReport: async (report) => {
    // Pass this bounded report to your own collector or transport.
    console.log(report.coverage, report.metrics.INP);
  },
});
tracker.start();
const report = createPerformanceReport(tracker.getSnapshot());
const drained = await tracker.flush({ timeoutMs: 1000 });
tracker.dispose();
```

Reports show available/missing coverage, per-metric ratings and recommendations.
The optional custom score is null until all five metrics are measured. It is
not a Lighthouse score. Export callbacks are isolated, with one in flight and
only the latest report queued. `flush` returns false on timeout; callback failure
counts are available as `getSnapshot().exportErrors`.

[Report schema and scoring](https://github.com/Adam014/sveltick/blob/main/docs/reports.md)

## Compatibility API

The existing standalone collectors and `getPerformanceMetrics({ timeoutMs })`
return formatted strings or null. Waiting defaults to 5000 ms and is bounded
to 0–60000 ms while the event loop runs. `getPerformanceSnapshot()` reads an
independent copy of current results. LCP/CLS/INP continue updating after a
bounded request finishes; its result is not a final page-lifetime report.

TTI is deprecated and returns null because the old load timestamp was not TTI.
FID is an explicit legacy collector outside aggregate collection.
`runPerformanceTracker()` and `runGamification()` now return a structured report;
`calculatePerformanceScore()` is nullable when data is incomplete. Browser alerts
use collected state and merged thresholds. The old synchronous activity API
retains its localStorage keys and memory fallback, but is not transactional
across tabs; prefer createActivityTracker. SSR imports are safe and record no
browser activity.

## TypeScript and packages

Sources use strict TypeScript. The npm package contains JavaScript and types for
both ESM and CommonJS. Public types include TrackerSnapshot, TrackerOptions,
ActivitySnapshot, ActivityOptions and the compatibility API's existing types.
No TypeScript runtime or framework is needed for the core API.

[Development and compatibility](https://github.com/Adam014/sveltick/blob/main/docs/typescript.md)
· [Migration from 1.x](https://github.com/Adam014/sveltick/blob/main/docs/migration.md)
· [Changelog](https://github.com/Adam014/sveltick/blob/main/CHANGELOG.md)
