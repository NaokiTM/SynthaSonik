<!-- ************************************* -->
<!-- TRACK HEADER-->
<!-- the header for a single track (contains track number indicator, volume control, mute feature, track icon, pan dial, color menu)-->
<!-- ************************************* -->


<script lang='ts'>
    // @ts-ignore
    export let track: any  //Track is the variable containing the current track object (things unique to this track)
    import { onMount } from 'svelte';
    import { toggleMute, toggleSolo, TracksArray } from '$lib/stores';
    import Dial from '../common/Dial.svelte';
    import ColorMenu from '../submenus/ColorMenu.svelte';
    import VolumeSlider from '../common/VolumeSlider.svelte';
    import MuteButton from '../common/MuteButton.svelte';
    import SoloButton from '../common/SoloButton.svelte';

    // initialise open menu x and y coordinates
    let menuX = 0;
    let menuY = 0;

    let editing = false;

    let newName = ""

    //represents the entire track body area (used to calculate where user right clicked)
    let tracksArea: HTMLElement

    //right click pop up menu is initially hidden 
    let showMenu = false;

    // which bar and which track the user opened the menu in
    let clickedTrackIndex: any = null;

    function deleteTrack() {
        if (track.id === 0) {
            console.log("can't delete first track (to be fixed...)");
            return;
        }

        TracksArray.update(tracks =>
            tracks
                // remove deleted track
                .filter(t => t.id !== track.id)

                // shift higher IDs down
                .map(t =>
                    t.id > track.id
                        ? { ...t, id: t.id - 1 }
                        : t
                )
        );
    }

    // called when renaming the track 
    function renameTrack(newName: string) {

        //defensive check against empty input
        const cleaned = newName.trim();
        if (cleaned.length === 0) {
            // optionally reset to old name instead of saving empty
            newName = track.trackName;
            editing = false;
            return;
        }

        //update with the tracks new name
        TracksArray.update(tracks =>
            tracks.map(t =>
                t.id === track.id
                    ? { ...t, trackName: newName }
                    : t
            )
        );

        editing = false;
    }

        //OPEN RIGHT CLICK MENU FOR THE SELECTED TRACK AND BAR EXACTLY WHERE THE CLICK HAPPENED
    function handleRightClick(e: any, trackIndex: any) {
      
        //get the tracksArea as its dimensions
        const tracksAreaRect = tracksArea.getBoundingClientRect()

        //stop browser right click menu interfering with our custom right click menu
        e.preventDefault();

        // the right click popup menu is now showing
        showMenu = true;

        // Convert global mouse position into coordinates relative to the track container
        menuX = e.pageX - tracksAreaRect.left;
        menuY = e.pageY - tracksAreaRect.top;

        // Store which track + bar this action applies to
        clickedTrackIndex = trackIndex;
    }

        //listener to close right click menu if anywhere in the track body clicked 
    onMount(() => {
      const closeMenu = () => (showMenu = false);
      document.addEventListener("click", closeMenu);
      return () => document.removeEventListener("click", closeMenu);
    });


</script>

<div class="bg-neutral-600 w-full h-15 border-neutral-500 border-b-1 flex space-x-2 relative " bind:this={tracksArea} on:contextmenu={(e) => handleRightClick(e, clickedTrackIndex)}>


    <div class="border-r-1 w-5 border-r-neutral-500 items-center justify-center flex">
        {track.id + 1}
    </div>
    <img src={track.instrumentIcon} alt='instrumentIcon' class="pb-2 pt-1 pl-1">
    <div class="flex flex-col pt-1">

        <!-- TRACK COLOR MENU -->
        {#if editing}
            <input
                bind:value={newName}
                autofocus
                on:blur={() => renameTrack(newName)}
                on:keydown={(e) => e.key === 'Enter' && renameTrack(newName)}
                class="bg-neutral-700 text-white px-1"
            />
        {:else}
            <div on:dblclick={() => editing = true}>
                {track.trackName}
            </div>
        {/if}

        <!-- CONTAINER FOR MUTE AND VOLUME CONTROLS -->
        <div class="flex flex-row mt-1 space-x-1">

            <MuteButton trackId={track.id} onClick={() => toggleMute(track.id)} />
            <SoloButton trackId={track.id} onClick={() => toggleSolo(track.id)} />

            <!-- VOLUME SLIDER -->
            <VolumeSlider trackId={track.id} /> 

        </div>

        <!-- PAN DIAL -->
        <div class="absolute right-0 pr-1 pt-1">
            <div class="flex items-end">
                <div class="text-xs">L</div>
                <Dial trackId = {track.id} />
                <div class="text-xs">R</div>
            </div>
        </div>
    </div>
</div>



{#if showMenu}
  <ul
    class="absolute bg-white text-black rounded shadow-md"
    style="top: {menuY}px; left: {menuX}px;"
  >
    <li class="px-4 py-2 hover:bg-gray-200" on:click={deleteTrack}>Delete Track "{track.trackName}"</li>
  </ul>
{/if}



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