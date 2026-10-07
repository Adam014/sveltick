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

The package version remains `1.7.1` during development. Current changes are
unreleased; a new release version has not been selected. Local archives use
`sveltick-1.7.1.tgz`, but contain the workspace source rather than the previously
published npm package.

Change the version only when preparing an actual release. Choose it explicitly
based on the API changes, update the package metadata and lockfile without
creating a Git tag, then run the validation and packaging commands above.

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
