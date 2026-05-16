<script lang="ts">
    import { onDestroy } from 'svelte';
    export let trackId;
    import { TracksArray } from '$lib/stores';
    import { derived } from 'svelte/store';

    const track = derived(TracksArray, $tracks =>
        $tracks.find(t => t.id === trackId)
    );

    let colorMenuOpen = false;

    const colors = [
        '#ff0033', // red
        '#ff4400', // orange
        '#ffea00', // yellow
        '#00bf00', // green
        '#004491', // blue
        '#a800fc', // purple
        '#ff42dc'  // pink
    ];



    function toggleColorMenu() {
        colorMenuOpen = !colorMenuOpen;
    }

    // small action that moves the node to document.body to avoid clipping by
    // parent stacking contexts / overflow. This preserves Svelte bindings/events.
    function portal(node: any) {
        const target = document.body;
        target.appendChild(node);
        return {
            destroy() {
                if (node.parentNode) node.parentNode.removeChild(node);
            }
        };
    }

    // helper function to set colour
    function setTrackColor(color: string) {
        TracksArray.update(tracks =>
            tracks.map(t =>
                t.id === trackId
                    ? { ...t, color }
                    : t
            )
        );
        colorMenuOpen = false;
    }



</script>


<div class="pr-2 align-center flex">
    <button
        class="w-4 h-4 bg-gray-700 rounded-md"
        style="background-color: {$track?.color}"
        on:click={toggleColorMenu}>
    </button>
    {#if colorMenuOpen}
        <div use:portal data-color-menu-portal class="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center" on:click={() => (colorMenuOpen = false)}>
            <!-- modal -->
            <div class="bg-neutral-800 text-white rounded-lg p-8" on:click|stopPropagation>
                <h2 class="text-lg font-semibold mb-4">Select Track Color</h2>
                <div class="grid grid-cols-10 w-fill">

                    <!-- displays every colour as a colour change button -->
                    {#each colors as color}
                        <button
                            class="w-4 h-4 m-2 rounded-md"
                            style="background-color: {color};"
                            on:click={() => setTrackColor(color)}
                        />
                    {/each}
                </div>
            </div>  
        </div>
    {/if}
</div>

<style>

</style>