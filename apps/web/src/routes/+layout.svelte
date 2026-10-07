<script lang="ts">
	import '../app.css';
	import { onDestroy, setContext } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { connectSvelteKit } from 'sveltick';
	import { trackingKey } from '$lib/tracking';
	import Navbar from '../components/Navbar.svelte';

	const tracking = connectSvelteKit(
		{ afterNavigate, onDestroy },
		{ activity: { storage: 'indexeddb', namespace: 'sveltick-demo' } }
	);
	setContext(trackingKey, tracking);
</script>

<Navbar />
<main id="main"><slot /></main>
