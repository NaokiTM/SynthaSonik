<!-- ************************************* -->
<!-- MUTE BUTTON COMPONENT-->
<!-- ************************************* -->
 

<script lang="ts">
    import { TracksArray } from "$lib/stores";
    export let onClick: () => void;
    export let trackId;

    $: track = $TracksArray.find(t => t.id === trackId);
</script>

<button
    class="
    h-5 
    w-5 
    flex
    items-center
    justify-center
    font-bold
    text-black
    border-1
    rounded-[3px]
    bg-[radial-gradient(circle,_#0767B5,_#032D4F)] 
    cursor-pointer
    hover:brightness-150
    {track?.muted ? 'brightness-150' : ''}"
    on:click={onClick}
>
    M
</button>