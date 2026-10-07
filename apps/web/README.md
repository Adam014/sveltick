# Sveltick website

The website uses Svelte 5, SvelteKit 2, Vite, Tailwind CSS, and TypeScript. It
currently contains the landing page; the linked documentation and showcase
routes are not implemented yet.

From the repository root:

```sh
npm ci
npm run dev --workspace web
npm run check --workspace web
npm run lint --workspace web
npm run build --workspace web
npm run preview --workspace web
```

Svelte components use `<script lang="ts">`. Vite and Tailwind configuration use
`.ts` files. The remaining JavaScript tool entry points are also type-checked.
SvelteKit generates its supporting types with `svelte-kit sync` before checking.

The production build uses `adapter-auto`; deployment may require an adapter for
the chosen hosting environment.
