<!-- ************************************* -->
<!-- MIXING DECK -->
<!-- a pop up deck that shows volume and panning controls for all tracks -->
<!-- ************************************* -->

<script lang="ts">
  export let trackId
  import { onMount } from 'svelte';
  import Dial from './common/Dial.svelte';
  import MixChannel from './MixChannel.svelte';
  import { noOfTracks } from '$lib/stores';

  let windowWidth = 0;  
  let visibleChannelCount = 0;
  const channelWidth = 70; // total width of MixChannel component
  const gap = 5; // px gap between components


  //calculate max number of channels that can fit in the width of the mixing deck
  function calculateMaxChannels(width: number, tracks: number) {
    const totalWidthPerChannel = channelWidth + gap;
    const maxThatFit = Math.floor(width / totalWidthPerChannel);
    visibleChannelCount = Math.min(tracks, maxThatFit);
  }

  //visibleChannelCount changes as noOfTracks does. every time either windowwidth (below) or noOfTracks changes, it recalculates.
  $: calculateMaxChannels(windowWidth, $noOfTracks);

  onMount(() => {
    // calculate max channels that fit on load initially
    windowWidth = window.innerWidth;

    //on window resize, adapt max number of channels that fit
    window.addEventListener('resize', () => {
      windowWidth = window.innerWidth;
    });
  });
</script>

<!-- mixing deck container-->
<div class="bottom-0 w-full h-[30vh] bg-[#5C5B5B] flex justify-start pl-8 items-center gap-5 border-t-1 border-neutral-400 z-30">
  
  <!--all channels displayed in container-->
  {#each { length: visibleChannelCount + 1} as _, trackId (trackId)}
    <div class="space-y-2">
      <div class="pl-1.5">
        <div class="flex items-end text-neutral-300 text-xs">
          <div>L</div>
          <Dial trackId = {trackId} />
          <div>R</div>
        </div>
      </div>
      <MixChannel trackId={trackId}/>
    </div>
  {/each}

</div>