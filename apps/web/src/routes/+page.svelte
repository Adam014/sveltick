<script lang="ts">
	import { resolve } from '$app/paths';
	import metricsimage from '../assets/metrics.svg';
</script>

<svelte:head>
	<title>Sveltick — performance you can inspect</title>
	<meta
		name="description"
		content="Inspect Web Vitals and browser-local navigation activity in your Svelte and SvelteKit app."
	/>
</svelte:head>

<section class="hero">
	<div class="hero-heading">
		<h1>
			<span class="meet ibm-plex-serif-light">Meet</span><span class="sveltick">Sveltick.</span>
		</h1>
		<img
			src={metricsimage}
			alt="Illustration of performance measurements"
			width="480"
			height="320"
		/>
	</div>
	<div class="hero-details">
		<div>
			<p class="intro">Understand how your app feels.</p>
			<p>
				Measure Web Vitals, follow navigation activity and inspect what is actually available. Built
				for Svelte and SvelteKit, with a framework-independent core.
			</p>
		</div>
		<div>
			<div class="action-row">
				<a href={resolve('/introduction')} class="white-button">Get started</a>
				<a href={resolve('/showcase')} class="black-button">Try the live demo</a>
			</div>
			<p class="release-note">
				Explore the latest unreleased changes. <a href={resolve('/introduction')}
					>Build from source</a
				> to try it today.
			</p>
		</div>
	</div>
</section>

<style>
	.hero {
		width: min(calc(100% - 2rem), 76rem);
		margin: 2rem auto 4rem;
	}
	.hero-heading {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 2rem;
		align-items: center;
	}
	h1 {
		min-width: 0;
	}
	.meet {
		display: block;
		font-size: clamp(5rem, 16vw, 13rem);
		line-height: 1;
		text-transform: uppercase;
	}
	.sveltick {
		display: block;
		color: var(--goldish);
		font-size: clamp(2.5rem, 7vw, 5.3rem);
		letter-spacing: 0.1em;
		line-height: 1.3;
	}
	img {
		width: 100%;
		max-width: 30rem;
		height: auto;
		justify-self: center;
	}
	.hero-details {
		display: grid;
		gap: 1rem 3rem;
		margin-top: 2rem;
		line-height: 1.7;
	}
	.hero-details p {
		max-width: 52ch;
	}
	.intro {
		font-size: 1.6rem;
		margin-bottom: 0.75rem;
	}
	.hero .white-button,
	.hero .black-button {
		width: auto;
		display: inline-block;
		padding: 0.75rem 1rem;
	}
	.release-note {
		font-size: 0.95rem;
		color: #ccc;
	}
	.release-note a {
		text-decoration: underline;
		text-underline-offset: 0.2rem;
	}
	@media (min-width: 768px) {
		.hero {
			margin-top: 3rem;
		}
		.hero-heading {
			grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		}
		.hero-details {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			align-items: center;
			margin-top: 3rem;
		}
	}
</style>
