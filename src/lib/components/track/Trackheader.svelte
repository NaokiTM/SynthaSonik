<!-- ************************************* -->
<!-- TRACK HEADER-->
<!-- the header for a single track (contains track number indicator, volume control, mute feature, track icon, pan dial, color menu)-->
<!-- ************************************* -->


<script>
    // @ts-ignore
    export let track  //Track is the variable containing the current track object (things unique to this track)
    import muted from '$lib/assets/muted.png'
    import unmuted from '$lib/assets/unmuted.png'
    import { toggleMute } from '$lib/stores';
    import Dial from '../common/Dial.svelte';
    import ColorMenu from '../submenus/ColorMenu.svelte';
    import VolumeSlider from '../common/VolumeSlider.svelte';

    function handleMute() {
        // @ts-ignore
        toggleMute(track.id)  //The actual toggleMute function is in stores.js
    }

</script>

<div class="bg-neutral-600 w-full h-15 border-neutral-500 border-b-1 flex space-x-2 relative">
    <div class="border-r-1 w-5 border-r-neutral-500 items-center justify-center flex">
        {track.id + 1}
    </div>
    <img src={track.instrumentIcon} alt='instrumentIcon' class="pb-2 pt-1 pl-1">
    <div class="flex flex-col pt-1">

        <!-- TRACK COLOR MENU -->
        <div class="flex items-center">
            <ColorMenu trackId={track.id}/>
            <div>{track.instrument}</div>
        </div>

        <!-- CONTAINER FOR MUTE AND VOLUME CONTROLS -->
        <div class="flex flex-row mt-1 space-x-1">

            <!-- MUTE BUTTON -->
            <button on:click={handleMute} class="hover:cursor-pointer w-5 h-5">
                <!-- Changes muted icon image depending on whether muted or not -->
                <img src={track.muted ? muted : unmuted} alt="mute">   
            </button>

            <!-- VOLUME SLIDER -->
            <!-- pass track.id to VolumeSlider later to adjust volume-->
            <VolumeSlider></VolumeSlider>

        </div>

        <!-- PAN DIAL -->
        <div class="absolute right-0 pr-1 pt-1">
            <div class="flex items-end">
                <div class="text-xs">L</div>
                <Dial></Dial>
                <div class="text-xs">R</div>
            </div>
        </div>
    </div>
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