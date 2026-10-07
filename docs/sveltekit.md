# SvelteKit integration

Call `connectSvelteKit` once during initialization of `src/routes/+layout.svelte`.
Pass the real lifecycle hooks so the core package needs no virtual module imports
or mandatory framework runtime dependency. This works with Svelte 5 runes and
legacy components.

```svelte
<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { connectSvelteKit } from 'sveltick';

  const tracking = connectSvelteKit({ afterNavigate, onDestroy }, {
    activity: { storage: 'indexeddb', namespace: 'my-app' }
  });
  onMount(() => tracking.performance.subscribe((snapshot) => {
    console.log(snapshot.metrics.INP);
  }));
</script>
```

Keep the layout's existing children/slot rendering. The default activity mode
is memory; persistence in this example is explicitly enabled. `afterNavigate`
includes the initial page and completed client navigations, including browser
back/forward. Do not add a second initial page view in onMount or count renders
with afterUpdate. Query/hash navigations count if SvelteKit calls afterNavigate;
stored routes use `to.route.id` when available, otherwise a sanitized pathname.

The adapter returns independent `performance` and `activity` trackers. Share
that returned object through Svelte context if descendants need it. Use a
synchronous onMount callback returning the unsubscribe function, as above.
The adapter disposes both trackers at layout destruction and ignores subsequent
callbacks. Ordinary component updates produce no page views. Registering the
adapter twice intentionally creates two activity producers, so keep it in one
root layout. Vite HMR may replace the layout and trigger another initial mount;
those are development remount visits, not production client navigations.

Performance metrics belong to the document and continue across SPA navigation.
Activity events belong to individual navigations. The adapter does not relabel
buffered document FCP/LCP as a measurement for a new route.

The repository website uses this adapter and exposes its live data at
`/showcase`. Its counter button records an update interval through Svelte's
`tick()`, not an automatic measurement of component render cost.
