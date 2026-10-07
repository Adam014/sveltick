# Reports, scoring and export

`createPerformanceReport(tracker.getSnapshot())` is a pure assessment of a
snapshot. `getPerformanceReport()` reads the compatibility document backend
without starting collection. `runPerformanceTracker()` and `runGamification()`
now resolve with a PerformanceReport rather than void.

The version 1 report contains `scope: "document"`, document ID, generation time,
coverage (available count, total 5, missing metric names), overallRating, score,
scoreModel and five metric assessments. Each assessment includes the numeric
value and unit, availability state, metric ID, timestamp, navigation type,
rating and optional recommendation. The report contains no route, URL, DOM
node, component name or visitor ID. Normal JSON serialization is supported.

Pending, unsupported, failed or invalid values do not count as measured. Null
is distinct from a measured zero. A metric marked available with an invalid
number becomes an error in the assessment. Values are provisional throughout
the document lifetime. `overallRating` is the worst rating among LCP, CLS and
INP; it remains null if any of those three is missing. A single document report
is not a site-wide field percentile or a claim that the site passes Core Web Vitals.

The diagnostic score uses `scoreModel: "sveltick-bands-v1"`. It is null unless
all five metrics are available. Each good metric contributes 100, each needs-
improvement metric 50, and each poor metric 0; the five contributions are
averaged and rounded. Component history does not affect it. This is Sveltick's
custom diagnostic model, not a Lighthouse score or a ranking signal.

| Metric | Good through | Needs improvement through | Unit |
| --- | --- | --- | --- |
| FCP | 1800 | 3000 | ms |
| LCP | 2500 | 4000 | ms |
| CLS | 0.1 | 0.25 | score |
| INP | 200 | 500 | ms |
| TTFB | 800 | 1800 | ms |

Bands use the threshold constants in the bundled
[web-vitals implementation](https://github.com/GoogleChrome/web-vitals).
Compatibility alert thresholds can be customized separately; they do not
change this published scoring model. Non-finite or negative alert thresholds
fall back to defaults.

`createTracker({ onReport })` adds an optional export consumer. The library
installs no HTTP transport and sends nothing by itself. At most one callback is
in flight and one latest report is queued; intermediate snapshots are coalesced.
A thrown error or rejected promise increments `getSnapshot().exportErrors`
without breaking measurement. This is bounded delivery, not a durable queue:
there are no automatic retries, guaranteed unload delivery or offline storage.

`await tracker.flush({ timeoutMs: 1000 })` returns true if the queue drained,
false if the deadline elapsed. True does not imply successful delivery; inspect
the error count or track acknowledgements in your callback. Timers require a
running event loop. Stop clears queued work, resume can send the current state,
and dispose closes the sink. An already running callback belongs to the
application and cannot be cancelled by the tracker. Keep network timeouts and
retry policy in your transport.

The live showcase offers a local JSON download using the same report schema.
