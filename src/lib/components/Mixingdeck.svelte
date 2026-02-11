<script lang="ts">
  import { onMount } from 'svelte';

  import Dial from './Dial.svelte';
  import MixChannel from './MixChannel.svelte';

  let windowWidth = 0;
  const channelWidth = 70; // total width of MixChannel component
  const gap = 5; // px gap between components

  let channels: number[] = [];  


  // Calculate the amount of space each channel should fill
  function calculateChannels() {
    const totalWidthPerChannel = channelWidth + gap;
    const count = Math.floor(windowWidth / totalWidthPerChannel);
    channels = Array(count).fill(100);
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

<div class="bottom-0 w-full h-[30vh] bg-[#5C5B5B] flex justify-center items-center gap-5 border-t-1 border-neutral-400">
  
  <!-- iteratively display Channels (each channel containing a mixchannel component and dial stacked on top) -->
  {#each channels as val, i (i)}
    <div class="space-y-2">
      <div class="pl-1.5">
        <div class="flex items-end text-neutral-300 text-xs">
          <div>L</div>
          <Dial bind:value={channels[i]} />
          <div>R</div>
        </div>
      </div>
      <MixChannel bind:value={channels[i]} />
    </div>
  {/each}
</div>

<style>
</style>