# TypeScript and compatibility

The core library, build script and website script blocks use strict TypeScript.
Run `npm run check` for library, test, tooling and Svelte checks. SvelteKit's
`svelte.config.js` and `eslint.config.js` remain JavaScript tool entry points
and participate in the website's `checkJs` checks.

## Public types

Import types from the package root; internal source paths are not public API.

```ts
import {
  createTracker,
  createActivityTracker,
  createPerformanceReport,
  type TrackerOptions,
  type TrackerSnapshot,
  type PerformanceReport,
} from "sveltick";

const options: TrackerOptions = { maxComponentEntries: 100 };
const tracker = createTracker(options);
tracker.start();
const snapshot: TrackerSnapshot = tracker.getSnapshot();
const report: PerformanceReport = createPerformanceReport(snapshot);
const activity = createActivityTracker(); // memory by default
tracker.dispose();
activity.dispose();
```

`TrackerSnapshot.metrics` contains numeric values or null, with explicit units,
status and timestamps. `PerformanceReport.score` is nullable. Legacy collectors
retain `Promise<string | null>`; they do not return the numeric snapshot format.
See [migration from 1.x](migration-v2.md) for intentional contract changes.

## Distribution

Rollup produces JavaScript targeting ES2020, plus:

- `dist/sveltick.es.js` and `dist/index.d.ts` for ESM.
- `dist/sveltick.cjs` and `dist/index.d.cts` for CommonJS.
- Source maps, the MIT license and bundled web-vitals license notices.

Conditional exports select matching declarations for NodeNext TypeScript
consumers. No TypeScript runtime is required by the installed package. Both
module formats can be imported during SSR; browser activity is not recorded
without a window. There is no Svelte runtime or virtual-module dependency in
the core; the SvelteKit adapter receives lifecycle hooks from its caller.

## Browser behavior

Measurement is feature-detected, not selected by browser name. Browser support
for individual PerformanceObserver entry types differs. An unsupported metric
is null with `status: "unsupported"`; a supported metric waiting for an event is
`pending`. In particular, a page with no interaction need not produce INP.
Missing data does not prevent navigation tracking or other metrics from working.

The browser needs ES2020 and standard DOM APIs. IndexedDB persistence is optional
and falls back to memory if access fails. The website itself uses Svelte 5 and
Tailwind 4 and targets modern browsers; its styling requirements are separate
from the library's measurement support. Browser test observations are documented
in [compatibility](compatibility.md).

## Contributor toolchain

Use Node 22.12 or newer and npm 10 or newer; the lockfile and CI use npm 11.12.1.
CI validates Node 22, 24 and 26 on Linux. The root production build runs type
checks, the existing unit tests, lint and both workspace builds. A fresh checkout
does not need a pre-existing library `dist`: Turbo builds dependency workspaces
before checking the website.

Development resolves `sveltick` directly to library source so edits hot-reload
and a concurrent library rebuild cannot remove its import target. Production
builds use the package's real export map. See [releasing](releasing.md) for
package gates and dependency override rationale.
