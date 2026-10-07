# Migrating from published 1.7.1 to development source

The package version remains `1.7.1` during development. The changes described
here are unreleased and differ from published npm 1.7.1. Build and pack this
workspace to evaluate them. Choose the next release version when preparing
an actual release.

## Changes to existing calls

| API or behavior | Development behavior |
| --- | --- |
| `calculatePerformanceScore()` | `number \| null`; incomplete measurements produce null. |
| `runPerformanceTracker()` / `runGamification()` | `Promise<PerformanceReport>` instead of a void-only result. |
| TTI | Deprecated collector returns null; a load timestamp is not TTI. |
| FID | Explicit legacy collector; omitted from aggregate metrics. |
| FCP, LCP, CLS, INP, TTFB | Measured by web-vitals; values can differ substantially from 1.x's incorrect algorithms. |
| Missing metrics | Null, never a fabricated zero or perfect score. |
| Bounded collection | `timeoutMs`, default 5000, clamped to 0–60000 while the event loop runs. |
| Component durations | Must be finite and nonnegative. Invalid input throws. |
| Legacy route history | Repeated visits are retained, with a 1000-entry cap. |
| Legacy activity | Lazy storage access and memory fallback; no import-time storage read. |

Standalone metric collectors still resolve formatted strings or null. Use
`createTracker` for the numeric API rather than changing how you parse those
compatibility results. Handle score null explicitly:

```ts
const score = calculatePerformanceScore();
console.log(score === null ? "Not enough data" : `${score}/100`);
```

## Replace update-based page views

Remove activity calls from `afterUpdate` and avoid a second initial `onMount`
page-view call when using `connectSvelteKit`. Register the adapter once in the
root layout. It records initial and completed client navigations, including
back/forward; ordinary component renders do not increment the count.
See the [SvelteKit guide](sveltekit.md) for runes and legacy layout examples.

## Choose activity scope explicitly

`createActivityTracker()` uses instance-local memory. Opt into IndexedDB with
a namespace for atomic browser-local totals across tabs. It does not migrate
ambiguous legacy localStorage counters automatically. Existing legacy keys
remain available to legacy getters; reset the new activity store through its
own `reset()` method. These identifiers are not global visitor analytics.

## Own the lifecycle

Keep the instance outside update handlers. Start once, unsubscribe when an
owner leaves and dispose when it is finished. Stop freezes this instance;
resume reads the shared document backend. Reset clears component history and
changes the instance session ID, not the document's Web Vitals.

Review [numeric snapshots](tracker.md), [activity storage](activity.md) and
[report/export semantics](reports.md). In particular, the optional export
callback is a bounded best-effort sink, not a durable delivery queue.
