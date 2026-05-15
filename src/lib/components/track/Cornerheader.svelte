<!-- ************************************* -->
<!-- CORNER HEADER-->
<!-- just a grey box in the top left corner. the button to add an empty track is here. -->
<!-- ************************************* -->


<script lang='ts'>
    import plus from '$lib/assets/plus.png'
    import keys from '$lib/assets/keys.png'
    import { noOfTracks, TracksArray } from "$lib/stores"

    let trackMenuOpen = false;
    let chosenInstrument: string

    const instruments = [
        "keys",
        "drums",
        "guitar",
        "bass",
        "voice",
    ]

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

    // used to toggle the track menu (for instrument selection)
    function toggleTrackMenu() {
        trackMenuOpen = !trackMenuOpen
    }

    function addTrack(instrument: string) {
        TracksArray.update(arr => {

            //calculates the index of the last track added (number of tracks that currently exist basically)
            let maxId = arr.length ? Math.max(...arr.map(t => t.id)) : 0; 

            //calculate index for the to-be-added track (current last track + 1)
            let nextId = maxId + 1;            


            //Return a copy of the previous tracks array + object for the track to be added
            return [  
                ...arr, 
                {id: nextId, trackName: instrument, sample: null, instrumentIcon: keys, color: "#ff4400", volume: 50, pan: 50, panAngle: 0, muted: false, soloed: false, regions: []}  //allow user to choose instrument before adding a track (do later)
            ]
        })

        // once the track added update the counter for the tracks
        $noOfTracks++
        trackMenuOpen = false
    }
</script>


<div class="h-5 w-full bg-neutral-500">
    <!--button to add a new track-->
    <button class="h-full">   

        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <img src={plus} alt='add' class="hover:cursor-pointer" on:click={toggleTrackMenu}>
    </button>
</div>

{#if trackMenuOpen}
    <div use:portal data-color-menu-portal class="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center" on:click={() => (trackMenuOpen = false)}>
        <div class="flex flex-row bg-neutral-800 text-white rounded-lg p-8" on:click|stopPropagation>
            {#each instruments as instrument}
                <button
                    class=" rounded-md p-4 justify-between hover:bg-neutral-700 cursor-pointer"
                    on:click={() => addTrack(instrument)}
                >
                    {instrument}
                </button>
            {/each}
        </div>
    </div>
{/if}