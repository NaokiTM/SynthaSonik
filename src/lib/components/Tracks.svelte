<script lang="ts">
  import { onMount } from "svelte";
  import { TracksArray, caretPos } from "$lib/stores";
  import Trackoptions from "$lib/components/track/Trackoptions.svelte";
  import Trackbars from "$lib/components/track/Trackbars.svelte";
  import Trackheader from "$lib/components/track/Trackheader.svelte";
  import Trackbody from "$lib/components/track/Trackbody.svelte";

  let headerEl: HTMLDivElement;
  let trackbarsEl: HTMLDivElement;
  let bodyEl: HTMLDivElement;

  onMount(() => {
    bodyEl.addEventListener("scroll", () => {
      // sync header and body vertical scrolling
      headerEl.scrollTop = bodyEl.scrollTop;

      //sync body and bar numbers when horizontally scrolling
      trackbarsEl.scrollLeft = bodyEl.scrollLeft;
    });
  });
</script>

<!-- Here the first column takes 20% of space (headers) and the column containing the body takes up remaining space on the right-->
<!-- the first row contains trackoptions and tracksbars (auto sized) and the second row contains header and body (sized to fill)-->
<div class="grid grid-cols-[20%_1fr] grid-rows-[auto_1fr] flex-1 text-white overflow-hidden">
  <!-- Top-left -->
  <div class="sticky top-0 left-0 z-2">  <!--sticks to the top and left to avoid any scroll interference-->
    <Trackoptions />
  </div>

  <!-- Top -->
  <!--sticks to the top when scrolling horizontally (but not to the left so we can scroll through bars)-->
  <div class="sticky top-0 z-10 bg-neutral-700 overflow-hidden" bind:this={trackbarsEl}> 
    <Trackbars />
  </div>

  <!-- Left -->
  <!--sticks to the left when scrolling horizontally (but not to the top so we can still scroll through tracks)--> 
  <div class="sticky left-0 bg-neutral-800 overflow-hidden" bind:this={headerEl}>    
    {#each $TracksArray as track (track.id)}
      <Trackheader {track} />
    {/each}
  </div>

  <!-- Main body -->
  <div class="relative overflow-auto bg-neutral-900 overscroll-none" bind:this={bodyEl}>
    <div class="h-full fixed w-[1px] bg-white" style="left: {$caretPos + 384}px"></div>

    <!-- pass props to track body to identify it uniquely -->
    {#each $TracksArray as track, i (track.id)}
      <Trackbody {track} trackIndex={i} />
    {/each}
  </div>
</div>
