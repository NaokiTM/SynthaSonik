<script>
    import { onDestroy } from 'svelte';
    export let trackId;
    import { TracksArray } from '$lib/stores';

    let colorMenuOpen = false;

    function toggleColorMenu() {
        colorMenuOpen = !colorMenuOpen;
    }

    // small action that moves the node to document.body to avoid clipping by
    // parent stacking contexts / overflow. This preserves Svelte bindings/events.
    function portal(node) {
        const target = document.body;
        target.appendChild(node);
        return {
            destroy() {
                if (node.parentNode) node.parentNode.removeChild(node);
            }
        };
    }
</script>

<div class="pr-2 align-center flex">
    <button class="w-4 h-4 bg-gray-700 rounded-md" style="background-color: {$TracksArray[trackId].color}" on:click={toggleColorMenu}></button>
    {#if colorMenuOpen}
        <div use:portal data-color-menu-portal class="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center" on:click={() => (colorMenuOpen = false)}>
            <!-- modal -->
            <div class="bg-neutral-800 text-white rounded-lg p-8" on:click|stopPropagation>
                <h2 class="text-lg font-semibold mb-4">Select Track Color</h2>
                <div class="grid grid-cols-10 w-fill">
                    <!-- Example color options -->
                    <button class="w-4 h-4 rounded-md" style="background-color: #ff0033;" on:click={() => {  //red
                        $TracksArray = $TracksArray.map(t => t.id === trackId ? {...t, color: '#ff0033' } : t); colorMenuOpen = false; }}></button>
                    <button class="w-4 h-4 rounded-md" style="background-color: #ff4400;" on:click={() => { //orange
                         $TracksArray = $TracksArray.map(t => t.id === trackId ? {...t, color: '#ff4400' } : t); colorMenuOpen = false; }}></button>
                    <button class="w-4 h-4 rounded-md" style="background-color: #ffea00;" on:click={() => { //yellow
                        $TracksArray = $TracksArray.map(t => t.id === trackId ? {...t, color: '#ffea00' } : t); colorMenuOpen = false; }}></button>
                    <button class="w-4 h-4 rounded-md" style="background-color: #00bf00;" on:click={() => { //green
                        $TracksArray = $TracksArray.map(t => t.id === trackId ? {...t, color: '#00bf00' } : t); colorMenuOpen = false; }}></button>
                        <button class="w-4 h-4 rounded-md" style="background-color: #004491;" on:click={() => { //blue
                        $TracksArray = $TracksArray.map(t => t.id === trackId ? {...t, color: '#004491' } : t); colorMenuOpen = false; }}></button>
                        <button class="w-4 h-4 rounded-md" style="background-color: #a800fc;" on:click={() => { //purple
                        $TracksArray = $TracksArray.map(t => t.id === trackId ? {...t, color: '#a800fc' } : t); colorMenuOpen = false; }}></button>
                        <button class="w-4 h-4 rounded-md" style="background-color: #ff42dc;" on:click={() => { //pink
                        $TracksArray = $TracksArray.map(t => t.id === trackId ? {...t, color: '#ff42dc' } : t); colorMenuOpen = false; }}></button>
                    <button class="mt-4 px-4 py-1 bg-neutral-600 rounded" on:click={() => (colorMenuOpen = false)}>Close</button>
                </div>
            </div>  
        </div>
    {/if}
</div>

<style>

</style>