# Validation and release preparation

Run contributor commands from the repository root with Node 22.12+ and npm.

```sh
npm ci
npm run release:check
```

This runs workspace checks, existing tests, lint and builds, followed by a dry
package listing. It neither changes versions nor commits, pushes, tags, creates
a GitHub release or publishes to npm. CI runs the same gate on Node 22, 24 and 26
and audits production dependencies.

`npm pack --workspace=sveltick` creates a local archive. Its `prepack` hook checks
library types, runs its tests and lint, and rebuilds JavaScript and declarations.
The allowlist includes `dist`, README, LICENSE and THIRD_PARTY_NOTICES (plus npm's
mandatory package metadata). Source tests and website tooling are not shipped.
The package bundles web-vitals and includes its Apache-2.0 notice; Sveltick uses MIT.

## Prepare a version separately

The current source preview is `2.0.0-next.0`; it is not a declaration that an npm
release has been published. When preparing a release, select the intended
version explicitly, for example:

```sh
npm version 2.0.0-next.1 --workspace=sveltick --no-git-tag-version
npm install --package-lock-only
npm run release:check
npm pack --workspace=sveltick
```

Review package metadata, changelog, README release status, archive contents and
migration guidance before committing. Git review, pushing, tagging and npm
publication are separate explicit operations. The removed `release-patch`,
`release-minor` and `release-major` scripts used to stage all files and push
without a full validation gate.

For a prerelease, publish the reviewed archive with an explicit npm tag, such
as `next`, only when publication is intended. Do not put a prerelease on `latest`
by accident. Validate the installed archive in the target application's build,
including its TypeScript module resolution, before publication.

## Dependency maintenance

Use `npm audit` to inspect the whole development tree and `npm audit --omit=dev`
for installed production dependencies. Re-check advisories when updating the
lockfile; an empty audit is not a guarantee that no vulnerability exists.

Two root overrides keep compatible transitive APIs on patched versions:

- SvelteKit 2's `cookie` uses the 0.7 branch for input-validation fixes, preserving
  its `parse` and `serialize` API.
- `@istanbuljs/load-nyc-config` uses js-yaml 4's `load` API, avoiding the old
  js-yaml 3 → argparse → sprintf-js chain. This applies only to test tooling.

Remove these overrides once upstream dependencies provide the patched ranges.
Neither override changes the library's browser runtime bundle. Tailwind 4 uses
its Vite plugin; the unused typography/aspect-ratio plugins, Vitest runner and
standard-version dependency have been removed.
