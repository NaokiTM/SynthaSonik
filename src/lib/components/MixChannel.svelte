<!-- ************************************* -->
<!-- CHANNEL COMPONENT -->
<!-- represents a single tracks channel (not volume channel) in the mixing deck -->
<!-- ************************************* -->

<script lang="ts">
    import { TracksArray, toggleMute, toggleSolo, changeVolume } from "$lib/stores";
    import MuteButton from "./common/MuteButton.svelte";  
    import SoloButton from "./common/SoloButton.svelte";
    export let trackId 

    $: track = $TracksArray.find(t => t.id === trackId);
</script>



<div class="flex flex-col gap-4 items-center group">

    <!-- Level Indicator and adjuster -->
    <div class="flex items-center gap-4">


        <!-- Vertical slider -->
        <input
            type="range"
            style="writing-mode: vertical-rl;"
            min={0}
            max={100}
            value={track?.volume ?? 50}
            oninput={(e) =>
                changeVolume(trackId, +e.currentTarget.value)
            }
            class="custom-thumb"
        />

        <!-- level meters -->
        <!-- dynamically displays live volume in left and right gain channels (TO BE IMPLEMENTED)-->
        <div class="flex items-center gap-0 h-32">
            <!-- left -->
            <div id="left-meter" class="w-2 bg-[#353535] h-32"></div>
            <!-- Seperator -->
            <div class="w-0.5 bg-black h-32"></div>
            <!-- right -->
            <div id="right-meter" class="w-2 bg-[#353535] h-32"></div>
        </div>

        <!-- volume indicator label on hover -->
        <div class="hidden absolute group-hover:block menu rounded-sm p-2 shadow text-neutral-300">
            {track?.volume ?? 50}
        </div>
    </div>


    <div class="flex items-center gap-4">
        <MuteButton trackId={track?.id} onClick={() => toggleMute(trackId)}/>
        <SoloButton trackId={track?.id} onClick={() => toggleSolo(trackId)} />
    </div>
</div>

<style> 
    /* volume slider styling */
    .custom-thumb {
        writing-mode: vertical-rl;
        rotate: 180deg;
        width: 5px;
        height: 125px;
        background: #191919;
    }   

    /* volume slider HANDLE styling */
    .custom-thumb::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 35px;
        height: 50px;
        background: linear-gradient(#AAAAAA 70%, #444444 100%);
        cursor: pointer;
        clip-path: polygon(25% 25%, 75% 25%, 65% 50%, 75% 75%, 25% 75%, 35% 50%);
    }

    /* slider handle styling for firefox */
    .custom-thumb::-moz-range-thumb {
        width: 35px;
        height: 50px;
        background: linear-gradient(#AAAAAA 70%, #444444 100%);
        cursor: pointer;
        clip-path: polygon(25% 25%, 75% 25%, 65% 50%, 75% 75%, 25% 75%, 35% 50%);
    }
</style>