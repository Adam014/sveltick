<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head><title>Development notes — Sveltick</title></svelte:head>
<section class="content-page">
	<p class="goldish">DEVELOPMENT NOTES</p>
	<h1>Preparing Sveltick 2.0.</h1>
	<article>
		<h2>Trust the measurement before the score</h2>
		<p>
			The upcoming release uses the web-vitals measurement backend for FCP, LCP, CLS, INP and TTFB.
			Later layout shifts and interaction latency can update a snapshot throughout the document
			lifetime.
		</p>
		<p>
			Incomplete data now remains visible: missing values are null, coverage is explicit, and a
			custom score appears only when all five metrics are available. It is a Sveltick diagnostic,
			not a Lighthouse score.
		</p>
		<h2>One owner, one clear lifecycle</h2>
		<p>
			The new tracker API provides start, stop, subscriptions and disposal. The SvelteKit adapter
			records completed navigation separately from component updates. Optional IndexedDB storage
			preserves committed local counts across tabs.
		</p>
		<p>
			This is an unreleased preview. See the <a
				href="https://github.com/Adam014/sveltick/blob/main/CHANGELOG.md">changelog</a
			>
			for implementation details and the
			<a href="https://github.com/Adam014/sveltick/blob/main/docs/migration-v2.md"
				>migration guide</a
			> for API changes.
		</p>
		<a class="black-button" href={resolve('/showcase')}>Explore the changes</a>
	</article>
</section>
