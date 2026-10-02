<script>
// @ts-nocheck

	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>SynthaSonik</title>
</svelte:head>

{@render children?.()}
