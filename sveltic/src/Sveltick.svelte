<script>
  import { onMount, afterUpdate } from 'svelte';
  import { trackComponentRender } from './PerformanceTracker.js';

  export let name = 'Unnamed Component';
  let startTime;

  onMount(() => {
    startTime = performance.now();
  });

  afterUpdate(() => {
    const endTime = performance.now();
    trackComponentRender(name, endTime - startTime);
  });
</script>

<slot></slot>
