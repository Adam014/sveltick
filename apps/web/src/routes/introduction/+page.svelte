<script lang="ts">
	import { resolve } from '$app/paths';
	const setup = `git clone https://github.com/Adam014/sveltick.git
cd sveltick
npm ci
npm run build
npm pack --workspace=sveltick`;
	const example = `import { createTracker } from 'sveltick';

const tracker = createTracker();
tracker.start();
const unsubscribe = tracker.subscribe((snapshot) => {
  console.log(snapshot.metrics.LCP);
});
// When this owner is done:
unsubscribe();
tracker.dispose();`;
</script>

<svelte:head><title>Introduction — Sveltick</title></svelte:head>
<section class="content-page">
	<p class="goldish">GET STARTED</p>
	<h1>Measure first. Inspect what you know.</h1>
	<p>
		Sveltick tracks document performance and browser-local navigation activity. Its core works
		without a framework; the SvelteKit adapter connects completed navigations to the same tracking
		session.
	</p>
	<h2>Try the development source</h2>
	<p>
		This website demonstrates unreleased changes. The package version remains 1.7.1, while the
		published npm package predates these changes. Use Node 22.12 or newer to build the repository,
		then install the generated archive in your app.
	</p>
	<pre><code>{setup}</code></pre>
	<pre><code>npm install /path/to/sveltick-1.7.1.tgz</code></pre>
	<p>Run <code>npm run dev</code> in the repository to explore this website locally.</p>
	<h2>Read a numeric snapshot</h2>
	<pre><code>{example}</code></pre>
	<p>
		A value can be pending, available, unsupported or in error. No-interaction INP stays null. A
		snapshot is a point-in-time view; measurements can update later.
	</p>
	<h2>Connect SvelteKit once</h2>
	<p>
		Register <code>connectSvelteKit</code> in your root layout with <code>afterNavigate</code> and
		<code>onDestroy</code>. It records the initial page and subsequent completed navigations.
		Component updates do not add visits.
	</p>
	<div class="action-row">
		<a class="black-button" href={resolve('/documentation')}>Read integration guides</a><a
			class="black-button"
			href={resolve('/showcase')}>Inspect the live demo</a
		>
	</div>
</section>
