# Tracker lifecycle and snapshots

`createTracker(options)` creates a browser performance consumer without starting
measurement or touching storage. `start()` starts or joins the document backend;
repeated starts are harmless. SSR start is a no-op.

`subscribe(callback)` immediately supplies a defensive snapshot, then delivers
changes while running. It returns an unsubscribe function. Each subscriber gets
its own copy. A throwing or rejecting callback does not interrupt other consumers.

`getSnapshot()` starts no observers. A snapshot has `schemaVersion: 1`,
`documentId`, `sessionId`, `capturedAt`, `running`, `metrics`, `components` and
`droppedComponentEntries`. Metric names are FCP, LCP, CLS, INP and TTFB. Each
metric carries a numeric `value` or null, its unit, status, rating, metric ID,
update timestamp and navigation type. Status is pending, available, unsupported
or error. Available values can change; this is not a final page report. CLS zero
is available only after the backend actually reports zero. No interaction means
INP may remain pending. Error denotes a detected registration failure.

`stop()` detaches this consumer and freezes its last metric values. It keeps
subscribers for a later `start()`. `dispose()` also removes those subscribers;
subsequent mutating calls on that instance throw. Neither method disconnects the
shared document-lifetime web-vitals backend. Other consumers continue working.

`recordComponent(name, durationMs)` records a duration supplied by the caller.
`measure(name)` returns an idempotent end function for a caller-defined interval;
this is not an automatic Svelte render profiler. Names are limited to 200
characters and durations must be finite and non-negative.

`maxComponentEntries` defaults to 100 (range 0–1000). `retentionMs` defaults to
30 minutes (range 0–24 hours). Finite options are clamped; invalid values use the
default. History is pruned on reads and writes. The dropped count includes
entries removed by count or age. `reset()` clears this local history and creates
a new session ID; it does not reset document Web Vitals. A browser BFCache
restoration creates a new document measurement ID and backend metrics.

```ts
import { createTracker } from 'sveltick';
const tracker = createTracker();
tracker.start();
const end = tracker.measure('format report');
// Perform the operation being measured.
const durationMs = end();
const snapshot = tracker.getSnapshot();
tracker.dispose();
```
