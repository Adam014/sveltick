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

### Navigation and SvelteKit

- Add createActivityTracker with bounded navigation history, ID deduplication,
  hostname-based attribution and opt-in transactional IndexedDB persistence.
- Add connectSvelteKit with initial/client/back-forward navigation tracking and
  layout cleanup; support Svelte 5 runes without afterUpdate.
- Record repeat routes in the synchronous compatibility API.
- Integrate the library in the website and add a live showcase with a second route.
- Make shared navigation wrap on mobile and provide a keyboard skip link.

### Reports and export

- Add structured reports with measured coverage, ratings and practical guidance.
- Return null instead of 100 when a diagnostic score has incomplete inputs;
  document the custom five-band model and exclude component history from it.
- Return reports from runPerformanceTracker/runGamification (updated result types).
- Add opt-in onReport delivery, bounded coalescing, timeout-aware flush and error counts.
- Add a downloadable JSON report to the live showcase.
