<script lang="ts">
	import { resolve } from '$app/paths';
	const guides = [
		['sveltekit', 'SvelteKit integration', 'Root layout setup, navigation events and cleanup.'],
		[
			'tracker',
			'Tracker lifecycle',
			'Start, stop, subscribe, numeric snapshots and bounded history.'
		],
		[
			'collection',
			'Metric collection',
			'Document lifetime, timeouts, missing data and legacy collectors.'
		],
		[
			'activity',
			'Navigation activity',
			'Local counts, route privacy, IndexedDB and multiple tabs.'
		],
		[
			'reports',
			'Reports and export',
			'Coverage, custom score, recommendations and bounded delivery.'
		],
		[
			'migration',
			'Migrating from 1.x',
			'Changed return types, metric semantics and compatible entry points.'
		],
		[
			'typescript',
			'TypeScript and compatibility',
			'Public types, ESM/CommonJS and browser support.'
		],
		[
			'releasing',
			'Building and releasing',
			'Validation, package contents and explicit publication steps.'
		]
	];
</script>

<svelte:head><title>Documentation — Sveltick</title></svelte:head>
<section class="content-page">
	<p class="goldish">DOCUMENTATION</p>
	<h1>Use Sveltick in your app.</h1>
	<p>
		The guides cover the unreleased changes in this repository. Start with the <a
			href={resolve('/introduction')}>installation guide</a
		>
		or try the <a href={resolve('/showcase')}>working example</a>.
	</p>
	<ul class="guide-list">
		{#each guides as [slug, title, description] (slug)}
			<li>
				<h2>
					<a href={`https://github.com/Adam014/sveltick/blob/main/docs/${slug}.md`}>{title}</a>
				</h2>
				<p>{description}</p>
			</li>
		{/each}
	</ul>
	<h2>Know the scope of your data</h2>
	<p>
		Web Vitals describe the current document, not individual SvelteKit route transitions. Activity
		counts belong to this browser, not all visitors to your website. Export is optional and no
		server receives data automatically.
	</p>
</section>
