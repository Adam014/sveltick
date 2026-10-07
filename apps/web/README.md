# Sveltick website

A Svelte 5 / SvelteKit 2 example using the workspace library, Vite 7, Tailwind 4
and TypeScript. Routes include the homepage, introduction, documentation index,
development notes, live showcase and a second navigation example.

From the repository root, with Node 22.12+:

```sh
npm ci
npm run dev
npm run build
npm run preview --workspace=web
```

`npm run dev --workspace=web` resolves the library directly from source. Root
`npm run build` checks and builds the library first; production imports exercise
its package exports. Run `npm run check` and `npm run lint` for explicit checks.

The root layout connects SvelteKit navigation hooks to Sveltick. The showcase
renders numeric snapshots, local activity and structured reports, and downloads
JSON without sending it to a server. Its opt-in IndexedDB namespace is
`sveltick-demo`. Use the showcase's reset button to clear that namespace's counts.

Source APIs are an unreleased 2.0 preview; published npm 1.7.1 differs. The website
guides users to build and install an archive instead of claiming those APIs are
already available from the registry.

The production build uses adapter-auto. Choose a deployment adapter appropriate
to the target hosting environment before deploying.
