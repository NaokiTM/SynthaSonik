<!-- ************************************* -->
<!-- THE MAIN INTERFACE-->
<!-- this file is the umbrella file that contains components tracks, their headers, the caret, and bar numbers on the main screen. -->
<!-- ************************************* -->


<script lang="ts">
  import { onMount } from "svelte";
  import { TracksArray, caretPos } from "$lib/stores";
  import Trackoptions from "$lib/components/track/Cornerheader.svelte";
  import Trackbars from "$lib/components/track/Trackbars.svelte";
  import Trackheader from "$lib/components/track/Trackheader.svelte";
  import Trackbody from "$lib/components/track/Trackbody.svelte";

  let headerEl: HTMLDivElement;
  let trackbarsEl: HTMLDivElement;
  let bodyEl: HTMLDivElement;
  let caretHeight = 0

  //match caret height to track body height
  function updateCaretHeight() {
      caretHeight = bodyEl.scrollHeight
  }

  onMount(() => {

    // initially set caret height as body height on load, 
    // .scrollHeight automatically updates so caret height always matches body height
    updateCaretHeight()

    // listen continously for any scrolls
    bodyEl.addEventListener("scroll", () => {
      
      // sync vertically scrolling components
      headerEl.scrollTop = bodyEl.scrollTop;

      //sync horizontally scrolling components
      trackbarsEl.scrollLeft = bodyEl.scrollLeft;
    });
  });
</script>

<!--first column (Trackoptions and track headers) take 20% of width, second (bar numbers and track bodies) takes 80%-->
<div class="grid grid-cols-[20%_1fr] grid-rows-[auto_1fr] flex-1 text-white overflow-hidden">
  
  <!-- ADD-TRACK BAR (Top-left) -->
  <!--sticks top and left-->
  <div class="sticky top-0 left-0 z-2">  
    <Trackoptions />
  </div>

  <!-- BAR NUMBERS (top right)-->
  <!--can scroll horizontally, cant scroll vertically -->
  <div class="sticky top-0 z-10 bg-neutral-700 overflow-hidden" bind:this={trackbarsEl}> 
    <Trackbars />
  </div>

  <!-- TRACK HEADERS (bottom left) -->
  <!--cant scroll horizontally, can scroll vertically -->
  <div class="sticky left-0 bg-neutral-800 overflow-hidden" bind:this={headerEl}>    
    {#each $TracksArray as track (track.id)}
      <Trackheader {track} />
    {/each}
  </div>

  <!-- TRACK BODIES (bottom right) -->
  <!-- can scroll both horizontally and vertically -->
  <div class="relative overflow-auto bg-neutral-900 overscroll-none" bind:this={bodyEl}>

    <!-- THE CARET -->
    <div class="h-full absolute top-0 bottom-0 w-[1px] bg-white" style="left: {$caretPos}px; height: {caretHeight}px;"></div>

    <!-- pass track id prop to each track body to identify it uniquely -->
    {#each $TracksArray as track, i (track.id)}
      <Trackbody {track} trackIndex={i} />
    {/each}
  </div>
</div>
