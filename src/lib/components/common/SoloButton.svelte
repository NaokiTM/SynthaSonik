<!-- ************************************* -->
<!-- SOLO BUTTON COMPONENT-->
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
    bg-[radial-gradient(circle,_#B89D14,_#524609)] 
    cursor-pointer
    hover:brightness-150
    {track?.soloed ? 'brightness-150' : ''}"
    on:click={onClick}
>
    S
</button>