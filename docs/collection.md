# Collection and storage contract

Legacy collectors and `getPerformanceMetrics` accept `{ timeoutMs?: number }`.
The default is 5000 milliseconds; finite values are clamped to 0–60000. A
collector resolves with its formatted result or `null` when no result is
available, its API is unsupported, or collection fails. Timers require a
running event loop and can be delayed in background tabs.

`getPerformanceSnapshot()` reads a defensive copy of already collected values
without registering new observers. Individual collectors update this state as
they finish; one missing metric does not hide another completed metric. Calling
`getPerformanceMetrics` still starts a fresh bounded legacy collection.

Imports are safe without DOM or browser storage. SSR calls return null metrics
or empty activity data. Storage is accessed only when activity functions run.
Invalid JSON and invalid shapes fall back to valid empty values. If reading or
writing an area fails, that area uses memory for the module lifetime; those
updates do not persist across reloads. Existing storage keys are retained in
this compatibility release. Route and visitor lists are capped at 1000 entries.

Page views increment on each explicit `trackAllActivities` call. These local
counters are not site-wide analytics. Concurrent cross-tab read/write is not
transactional yet; this contract does not promise exact cross-tab totals.
Routes currently retain the legacy unique-path semantics.

Alerts read the actual collected state and merge partial thresholds with
defaults. Missing results are skipped. Measurement definitions and the legacy
score will be updated separately; a bounded result is not a final Core Web
Vitals report.
