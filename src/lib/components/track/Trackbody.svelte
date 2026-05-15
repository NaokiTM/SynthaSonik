<!--************************************* -->
<!-- TRACK BODY -->
<!-- displays the bars and any audio regions in it for ONE track -->
<!-- ************************************* -->

<script lang="ts">
    // @ts-nocheck
    import { onMount } from "svelte";
    import { noOfBars, TracksArray, midiEditorHidden, whichMidiTrackOpen } from "$lib/stores";
    import AudioRegion from "./AudioRegion.svelte";
    import NoteRegion from "../editor/NoteRegion.svelte";
    export let track;    // current track object
    export let trackIndex;     // index of current track

    // initialise open menu x and y coordinates
    let menuX = 0;
    let menuY = 0;

    //represents the entire track body area (used to calculate where user right clicked)
    let tracksArea: HTMLElement

    //right click pop up menu is initially hidden 
    let showMenu = false;

    // which bar and which track the user opened the menu in
    let clickedTrackIndex = null;
    let clickedBarIndex = null;



    //OPEN RIGHT CLICK MENU FOR THE SELECTED TRACK AND BAR EXACTLY WHERE THE CLICK HAPPENED
    function handleRightClick(e, trackIndex, barIndex) {
      
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
        clickedBarIndex = barIndex;
    }



    //listener to close right click menu if anywhere in the track body clicked 
    onMount(() => {
      const closeMenu = () => (showMenu = false);
      document.addEventListener("click", closeMenu);
      return () => document.removeEventListener("click", closeMenu);
    });



    //ADD A NEW AUDIO REGION
    function addRegion() {
      const regionHere = track.regions.find(region => region.barNo === clickedBarIndex);

      if (regionHere) {
        return;  //cancel if region already exists
      }

      TracksArray.update(tracks => {
        const copy = [...tracks];
        const track = copy[clickedTrackIndex];

        const newRegion = {
          barNo: clickedBarIndex,
          length: 1,
          notes: []
        };

        track.regions = [...track.regions, newRegion];
        copy[clickedTrackIndex] = track;
        return copy;
      });
    }


    //DELETE AN EXISTING AUDIO REGION
    function deleteRegion() {
      TracksArray.update(tracks => {
        const copy = [...tracks];
        const track = copy[clickedTrackIndex];

        track.regions = track.regions.filter(
          region => region.barNo !== clickedBarIndex
        );

        copy[clickedTrackIndex] = track;
        return copy;
      });
    }


    //OPEN MIDI EDITOR FOR THE SELECTED TRACK 
    function toggleMidiEditor() {
        midiEditorHidden.update(value => !value)
        whichMidiTrackOpen.set(clickedTrackIndex)
    }
</script>


<!-- LOOPS THROUGH EACH BAR OF EACH TRACK AND DISPLAYS REGION IF REGION HAS BEEN ADDED-->
<div class="bg-neutral-900 h-15 border-neutral-600 border-r-1 flex" bind:this={tracksArea}>


    <!-- LOOP THROUGH EACH BAR -->
    {#each Array.from({ length: $noOfBars }) as _, barIndex}


        <!-- THE DIV CONTAINING A BAR CELL -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="border-neutral-800 border-1 w-1/4 h-15 p-0 flex-shrink-0" on:contextmenu={(e) => handleRightClick(e, trackIndex, barIndex)}>
          
            <!-- DISPLAY REGION IF THE BAR CONTAINS A REGION-->
            {#each track.regions.filter(region => region.barNo === barIndex) as region} 
                <AudioRegion {region} {track} />
            {/each}

        </div>

    {/each}

</div>



<!-- RIGHT CLICK MENU -->
{#if showMenu}
  <ul
    class="absolute bg-white text-black rounded shadow-md"
    style="top: {menuY}px; left: {menuX}px;"
  >
    <li class="px-4 py-2 hover:bg-gray-200" on:click={addRegion}>Add region</li>
    <li class="px-4 py-2 hover:bg-gray-200" on:click={deleteRegion}>Delete region</li>
    <li class="px-4 py-2 hover:bg-gray-200" on:click={toggleMidiEditor}>Open track in MIDI editor</li>
  </ul>
{/if}
