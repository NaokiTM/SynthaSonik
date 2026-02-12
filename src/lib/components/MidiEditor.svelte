
<!-- midieditor.svelte -->
<script lang="ts">
    import EditorTrack from "./editor/EditorTrack.svelte";
    import { midiEditorHidden, TracksArray } from "$lib/stores";
    import { caretPos } from "$lib/stores";
    import Trackbars from "./track/Trackbars.svelte";
    import Trackoptions from "./track/Trackoptions.svelte";
    import EditorKeys from "./editor/EditorKeys.svelte";
    import { onMount } from "svelte";
    import plus from '$lib/assets/plus.png'

    let barsEl: HTMLDivElement;
    let keysEl: HTMLDivElement;
    let tracksEl: HTMLDivElement;

    let caretHeight = 0

    function updateCaretHeight() {
        caretHeight = tracksEl.scrollHeight
    }

    onMount(() => {
        updateCaretHeight()
        tracksEl.addEventListener("scroll", () => {
        // sync header and body vertical scrolling
        keysEl.scrollTop = tracksEl.scrollTop;

        //sync body and bar numbers when horizontally scrolling
        barsEl.scrollLeft = tracksEl.scrollLeft;   //remember that this means updating barsEl to match tracksEl's position. NOT the other way around that prevents scrolling
        });
    });

    function closeMidiEditor() {
        midiEditorHidden.set(true)
    }

</script>


<div class="grid grid-cols-[20%_1fr] grid-rows-[auto_1fr] flex-1 text-white overflow-hidden">

    <div class="sticky top-0 left-0 z-2 bg-neutral-500 ">  <!--sticks to the top and left to avoid any scroll interference-->
        <button class="font-bold bg-neutral-700 hover:cursor-pointer flex" on:click={closeMidiEditor}>
            <img src={plus} alt="close" class="rotate-45">
        </button>
    </div>

    <div class="sticky top-0 z-10 bg-neutral-700 overflow-hidden" bind:this={barsEl}>
        <Trackbars />
    </div>

    <!-- piano -->
    <div class="sticky left-0 z-10 bg-neutral-800 overflow-hidden" bind:this={keysEl}>
        <EditorKeys />
    </div>


    <!-- loops through tracks --> 
    <div class="relative overflow-auto bg-neutral-900 overscroll-none" bind:this={tracksEl}>
        <div class="h-full absolute top-0 bottom-0 w-[1px] bg-white z-30" style="left: {$caretPos}px; height: {caretHeight}px;"></div>

        <!-- pass props to track body to identify it uniquely -->
        <EditorTrack />

    </div>
</div>