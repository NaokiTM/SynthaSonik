<script>
  import Controlbar from "$lib/components/Controlbar.svelte";
  import MidiEditor from "$lib/components/MidiEditor.svelte";
  import Mixingdeck from "$lib/components/Mixingdeck.svelte";
  import Tracks from "$lib/components/Tracks.svelte";
  import { mixingDeckHidden, midiEditorHidden } from "$lib/stores";
</script>

<div class="flex flex-col h-screen select-none">
    <Controlbar></Controlbar>

    {#if !$midiEditorHidden}
        <MidiEditor />
    {:else}
        <Tracks />
    {/if}

    {#if !$mixingDeckHidden}
        <Mixingdeck />
    {/if}

</div>

<style>
    :global(body) {
        background-color: black;
    }
</style>