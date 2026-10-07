# ⚡️ Sveltick Monorepo

A small performance and traffic tracking library, with a SvelteKit website.

- [`packages/sveltick`](packages/sveltick/README.md): the library and its public API.
- [`apps/web`](apps/web/README.md): the website.
- [TypeScript development and compatibility](docs/typescript.md).
- [SvelteKit integration](docs/sveltekit.md) and [navigation activity](docs/activity.md).
- [Reports, scoring and export](docs/reports.md).
- [Tracker lifecycle and numeric snapshots](docs/tracker.md).
- [Collection and storage contract](docs/collection.md).
- [Changelog](CHANGELOG.md).

## Development

Use npm from the repository root:

```sh
npm ci
npm run check         # Strict TypeScript and Svelte checks
npm test              # Library unit tests
npm run lint          # Lint and formatting checks
npm run build         # Checks, tests, lint, and production builds
npm run dev           # Start the website
```

Use `npm run format` to apply formatting explicitly. Builds do not rewrite source
files. The library is authored in TypeScript and distributed as JavaScript with
ESM and CommonJS declarations; consumers do not need a TypeScript runtime.
