# TypeScript development

The library, tests, build script, Vite/Tailwind configurations, and Svelte script
blocks use TypeScript. Strict checks run with `npm run check` and as part of the
root production build.

`apps/web/svelte.config.js`, `postcss.config.js`, and `eslint.config.js` remain
JavaScript tool entry points for compatibility with the existing toolchain.
They are included in the website's `checkJs` type checks. Svelte components keep
their `.svelte` extension and use `<script lang="ts">`.

## Public types

The package exports `MetricValue`, `PerformanceMetrics`, `PerformanceThresholds`,
`PerformanceTrackerOptions`, `ComponentRenderTime`, `ComponentRenderResult`,
`ActivityMetrics`, `RouteView`, and `TrafficSources` using type-only exports.

```ts
import {
  trackComponentRender,
  type ComponentRenderResult,
  type PerformanceTrackerOptions,
} from "sveltick";

const options: PerformanceTrackerOptions = {
  thresholds: { fcp: 1800, lcp: 2500 },
};

const result: ComponentRenderResult = trackComponentRender("Example", 12.5);
// result.renderTime is the formatted string "12.50".
```

Metric collectors retain their existing `Promise<string | null>` return values.
Null indicates that no measurement was returned. CLS starts at numeric zero in
the internal snapshot before collection. Recorded component durations are
numbers; `trackComponentRender` returns a formatted string. The migration does
not reinterpret these values or replace the measurement algorithms.

## Builds

Rollup compiles the TypeScript source and produces:

- `dist/sveltick.es.js` and `dist/index.d.ts` for ESM imports.
- `dist/sveltick.cjs` and `dist/index.d.cts` for CommonJS consumers.
- JavaScript source maps for both formats.

CommonJS now uses the `.cjs` extension so Node does not interpret that bundle as
ESM. Import the package by name, rather than relying on internal output paths.
The `types` and conditional `exports` entries select the matching declarations.
Development dependencies are not required by consumers.

`npm pack --workspace sveltick` checks and builds the library through `prepack`.
Root `npm run build` additionally runs tests and lint. No release or publication
is performed by the migration.
