<script lang="ts">
  import { onMount } from 'svelte';

  import Dial from './Dial.svelte';
  import MixChannel from './MixChannel.svelte';
  import { noOfTracks } from '$lib/stores';

  let windowWidth = 0;
  const channelWidth = 70; // total width of MixChannel component
  const gap = 5; // px gap between components

  let channels: number[] = [];  


  function calculateChannels() {
    const totalWidthPerChannel = channelWidth + gap;
    const maxThatFit = Math.floor(windowWidth / totalWidthPerChannel);
    const count = Math.min($noOfTracks, maxThatFit);

    channels = Array(count).fill(1);
  }

  //Calls the calculateChannels function, listens for resize events to recalculate how channels fit
  onMount(() => {
    windowWidth = window.innerWidth;
    calculateChannels();

    window.addEventListener('resize', () => {
      windowWidth = window.innerWidth;
      calculateChannels();
    });
  });
</script>

<div class="bottom-0 w-full h-[30vh] bg-[#5C5B5B] flex justify-start pl-8 items-center gap-5 border-t-1 border-neutral-400 z-30">
  
  <!-- iteratively display Channels (each channel containing a mixchannel component and dial stacked on top) -->
{#each Array($noOfTracks + 1) as _, i (i)}
  <div class="space-y-2">
    <div class="pl-1.5">
      <div class="flex items-end text-neutral-300 text-xs">
        <div>L</div>
        <Dial />
        <div>R</div>
      </div>
    </div>
    <MixChannel trackId={i}/>
  </div>
{/each}
</div>

<style>
</style>