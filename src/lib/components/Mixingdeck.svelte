<!-- ************************************* -->
<!-- MIXING DECK -->
<!-- a pop up deck that shows volume and panning controls for all tracks -->
<!-- ************************************* -->

<script lang="ts">
  import Dial from './common/Dial.svelte';
  import MixChannel from './MixChannel.svelte';
  import { toggleMixingDeck, TracksArray } from '$lib/stores';
  import plus from '$lib/assets/plus.png'
</script>

<!-- mixing deck container-->
<div class="relative bottom-0 w-full h-[30vh] bg-[#5C5B5B] flex justify-start items-center gap-5 border-t-1 border-neutral-400 z-30 overflow-hidden pr-10">
  
  <!-- scroll container (allows overflow scrolling) -->
  <div class="flex items-center h-full pl-7 overflow-x-auto overflow-y-hidden">

    <!--all channels displayed in container-->
{#each $TracksArray as track (track.id)}
    <div class="{track.id !== 0 ? 'border-r border-black' : 'border-l-1 border-r-1'} h-full flex-shrink-0">
        <div class="space-y-2 p-4">
            <div class="pl-1.5">
                <div class="flex items-end text-neutral-300 text-xs">
                    <div>L</div>
                    <Dial trackId={track.id}/>
                    <div>R</div>
                </div>
            </div>

            <MixChannel trackId={track.id}/>
        </div>

        <div style="background-color: {track?.color}" class="flex justify-center">
            {track?.trackName}
        </div>
    </div>
{/each}

  </div>

  <img src={plus} alt='add' class="absolute top-2 right-2 hover:cursor-pointer rotate-45" on:click={toggleMixingDeck}>

</div>