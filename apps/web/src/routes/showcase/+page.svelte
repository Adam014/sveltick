<script lang="ts">
	import { getContext, onMount, tick } from 'svelte';
	import type { ActivitySnapshot } from 'sveltick';
	import { trackingKey, type DemoTracking } from '$lib/tracking';

	const tracking = getContext<DemoTracking>(trackingKey);
	let performance = $state(tracking.performance.getSnapshot());
	let activity = $state<ActivitySnapshot | null>(null);
	let clicks = $state(0);
	let error = $state('');

	onMount(() => {
		const offPerformance = tracking.performance.subscribe((value) => {
			performance = value;
		});
		const offActivity = tracking.activity.subscribe((value) => {
			activity = value;
		});
		return () => {
			offPerformance();
			offActivity();
		};
	});
	async function updateCounter() {
		const end = tracking.performance.measure('Counter update');
		clicks += 1;
		await tick();
		end();
	}
	async function resetActivity() {
		try {
			await tracking.activity.reset();
			error = '';
		} catch {
			error = 'Could not reset local activity. Reload and try again.';
		}
	}
</script>

<svelte:head
	><title>Live showcase · Sveltick</title><meta
		name="description"
		content="Explore real document performance and local navigation activity with Sveltick."
	/></svelte:head
>
<section class="content-page">
	<p class="goldish">LIVE SHOWCASE</p>
	<h1>Measure this page.</h1>
	<p>
		These values come from this browser. They update as you interact; unavailable metrics remain
		clearly marked.
	</p>
	<div class="table-scroll">
		<table>
			<caption>Document performance</caption>
			<thead
				><tr><th scope="col">Metric</th><th scope="col">Value</th><th scope="col">State</th></tr
				></thead
			>
			<tbody
				>{#each Object.values(performance.metrics) as metric}<tr
						><th scope="row">{metric.name}</th><td
							>{metric.value === null ? '—' : metric.value.toFixed(metric.unit === 'score' ? 4 : 1)}
							{metric.value === null ? '' : metric.unit}</td
						><td>{metric.status}</td></tr
					>{/each}</tbody
			>
		</table>
	</div>
	<p>
		INP needs a user interaction. Document metrics continue across client navigation; they are not
		presented as new metrics for each route.
	</p>
	<div class="action-row">
		<button class="black-button" onclick={updateCounter}>Update counter</button><span
			aria-live="polite">Updates: {clicks}</span
		>
	</div>
	<p>
		Last update interval: {performance.components.at(-1)?.durationMs.toFixed(2) ?? '—'} ms. This measures
		the counter update through Svelte’s next flush.
	</p>
	<h2>Activity in this browser</h2>
	<p>
		Views since reset: <strong data-testid="page-views">{activity?.pageViews ?? '…'}</strong>.
		Storage: {activity?.persistence ?? 'loading'}.
	</p>
	{#if activity?.persistenceError}<p role="status">
			Persistent storage is unavailable. This session continues in memory.
		</p>{/if}
	<p>
		Recent route visits: {activity?.routes.length ?? 0}. Query strings and fragments are not stored.
		This demo keeps data locally and sends nothing to a server.
	</p>
	<div class="action-row">
		<a href="/showcase/next" class="black-button">Visit another route</a><button
			class="black-button"
			onclick={resetActivity}>Reset local activity</button
		>
	</div>
	{#if error}<p role="alert">{error}</p>{/if}
</section>
