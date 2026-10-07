# Changelog

## Unreleased

- Migrate library sources, Jest tests, build tooling, and website code to strict
  TypeScript; export public configuration and result types.
- Publish separate ESM and CommonJS declarations alongside compiled JavaScript.
- Correct the CommonJS bundle extension to `.cjs`.
- Add monorepo type checks.
- Replace the library's Babel/Svelte build plugins with TypeScript compilation.
- Keep formatting explicit instead of rewriting files during builds.
- Fix the existing redundant image alt text that blocked website lint.

### Reliability fixes

- Make imports storage-independent and recover from unavailable or malformed
  browser storage with a memory fallback.
- Fix repeated page-view increments and empty visitor getters.
- Fix browser alerts and merge partial thresholds with defaults.
- Bound legacy metric collection with `timeoutMs` (default 5000 ms), clean up
  listeners/observers, and isolate missing or failed metrics as `null`.
- Add `getPerformanceSnapshot()` for defensive copies of partial results.
- Make all legacy collectors and activity entry points safe to call during SSR.

### Measurement fixes

- Measure FCP, LCP, CLS, INP and TTFB with bundled web-vitals 6.2.3.
- Keep one backend per document and update snapshots throughout its lifetime.
- Report later LCP candidates, CLS session windows and full interaction latency.
- Retire the incorrect TTI load timestamp (the compatibility call returns null).
- Keep FID as an explicit legacy collector, outside aggregate collection.
- Validate supplied component durations and bound their history.
- Include the bundled dependency license in package notices.

### Tracker lifecycle

- Add createTracker with idempotent start, stop/resume, subscribe and dispose.
- Expose isolated numeric metric snapshots with units and availability states.
- Bound operation/component history by entry count and retention time.
- Add manual interval measurement and history reset without restarting Web Vitals.
- Isolate synchronous and asynchronous subscriber failures.
