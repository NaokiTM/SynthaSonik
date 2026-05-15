<!-- ************************************* -->
<!-- CORNER HEADER-->
<!-- just a grey box in the top left corner. the button to add an empty track is here. -->
<!-- ************************************* -->


<script lang='ts'>
import plus from '$lib/assets/plus.png'
import { noOfTracks, TracksArray, instrumentCounts } from "$lib/stores"

import keys from '$lib/assets/keys.png'
import drum from '$lib/assets/drum.png'
import bass from '$lib/assets/bass.png'
import mic from '$lib/assets/mic.png'
import guitar from '$lib/assets/guitar.png'


let trackMenuOpen = false;

const instruments = [
    "keys",
    "drums",
    "guitar",
    "bass",
    "voice",
]

// Create a mapping from instrument name to icon
const instrumentIcons = {
    keys: keys,
    drums: drum,
    guitar: guitar,
    bass: bass,  // Use guitar icon for bass (or import a bass icon)
    voice: mic,
}

function portal(node) {
    const target = document.body;
    target.appendChild(node);
    return {
        destroy() {
            if (node.parentNode) node.parentNode.removeChild(node);
        }
    };
}

function toggleTrackMenu() {
    trackMenuOpen = !trackMenuOpen
}

function addTrack(instrument: string) {
    // Get current count using $ prefix (read-only from derived store)
    const currentCount = $instrumentCounts[instrument] || 0;
    
    // NO instrumentCounts.update() - it updates automatically!

    TracksArray.update(arr => {
        let maxId = arr.length ? Math.max(...arr.map(t => t.id)) : -1; 
        let nextId = maxId + 1;            
        
        return [  
            ...arr, 
            {
                id: nextId, 
                trackName: `${instrument}${currentCount + 1}`,
                instrument: instrument,  // IMPORTANT!
                sample: null, 
                instrumentIcon: instrumentIcons[instrument],
                color: "#ff4400", 
                volume: 50, 
                pan: 50, 
                panAngle: 0, 
                muted: false, 
                soloed: false, 
                regions: []
            }
        ];
    });
    
    $noOfTracks++;
    trackMenuOpen = false;
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