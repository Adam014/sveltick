# Collection and storage contract

Legacy collectors and `getPerformanceMetrics` accept `{ timeoutMs?: number }`.
The default is 5000 milliseconds; finite values are clamped to 0–60000. A
collector resolves with its formatted result or `null` when no result is
available, its API is unsupported, or collection fails. Timers require a
running event loop and can be delayed in background tabs.

`getPerformanceSnapshot()` reads a defensive copy of already collected values
without registering new observers. Individual collectors update this state as
they finish; one missing metric does not hide another completed metric. Calling
`getPerformanceMetrics` waits for a bounded snapshot of the same document
backend; it does not restart measurement.

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
defaults. Missing results are skipped. The legacy score will be updated separately. A bounded result is not a final
Core Web Vitals report.

FCP, LCP, CLS, INP and TTFB use bundled web-vitals 6.2.3 with reportAllChanges.
LCP, CLS and INP wait until the requested deadline and return their current
values; FCP and TTFB can return earlier. Snapshot reads continue to reflect new
reports after a waiting call has returned. Backend registration happens once
per document, including across HMR imports. BFCache restoration starts a new
set of document metrics. Unsupported entry types stay null.

TTI is deprecated and returns null because the former load timestamp was not
TTI. FID remains available only as an explicitly called legacy collector.
Component timing records a supplied non-negative duration; it does not profile
Svelte rendering. Component records are limited to the latest 1000 entries.

These are document metrics, not metrics for each SPA route. There is no
soft-navigation metric claim. The backend retains its document-lifetime
observers after an individual snapshot request completes. See the
[web-vitals API](https://github.com/GoogleChrome/web-vitals) for metric semantics.
