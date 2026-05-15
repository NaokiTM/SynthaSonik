<script lang='ts'>
    export let trackId: number;
    export let volume: number = 50;
    import { TracksArray, changeVolume } from "$lib/stores";

    $: track = $TracksArray.find(t => t.id === trackId);
    
</script>

<!-- THE SLIDER INPUT-->
<div class="">
    <input type="range" min="1" max="100" value={track?.volume} oninput={(e) => changeVolume(trackId, +e.currentTarget.value)} class="w-30 h-3 vol-slider rounded-xl bg-neutral-900">    
</div>

<style>
    /* The slider itself */
    .vol-slider {
        -webkit-appearance: none;  /* Override default CSS styles */
        appearance: none;
        outline: none; /* Remove outline */
        opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
        -webkit-transition: .2s; /* 0.2 seconds transition on hover */
        transition: opacity .2s;
    }

    /* SLIDER HANDLE BELOW: */
    /* Enables chrome, safari, newer edge styling */ 
    .vol-slider::-webkit-slider-thumb {
        -webkit-appearance: none; /* Override default look */
        appearance: none;
        width: 25px; /* Set a specific slider handle width */
        height: 25px; /* Slider handle height */
        cursor: pointer; /* Cursor on hover */
        background: #757575;
        border-radius: 50%;
    }

    /* Firefox specific styling */
    .vol-slider::-moz-range-thumb {
        cursor: pointer; /* Cursor on hover */
        background: #757575;
        border-radius: 50%;
    }
</style>
