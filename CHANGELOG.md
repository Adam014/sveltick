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

Tracking algorithms are unchanged.
