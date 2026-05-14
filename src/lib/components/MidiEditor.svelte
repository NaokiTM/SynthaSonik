<!-- ************************************* -->
<!-- MIDI EDITOR -->
<!-- main container for the midi editor -->
 <!-- ************************************* -->
<script lang="ts">
    import EditorBody from "./editor/EditorBody.svelte";
    import { midiEditorHidden } from "$lib/stores";
    import { caretPos } from "$lib/stores";
    import Trackbars from "./track/Trackbars.svelte";
    import EditorKeys from "./editor/EditorKeys.svelte";
    import { onMount } from "svelte";
    import plus from '$lib/assets/plus.png'

    let barsEl: HTMLDivElement;
    let keysEl: HTMLDivElement;
    let tracksEl: HTMLDivElement;
    let caretHeight = 0

    //match caret height to track body height
    function updateCaretHeight() {
        caretHeight = tracksEl.scrollHeight
    }


    onMount(() => {
        // initially set caret height as body height on load,
        // .scrollHeight automatically updates so caret height always matches body height
        updateCaretHeight()


        tracksEl.addEventListener("scroll", () => {

            // sync header and body vertical scrolling
            keysEl.scrollTop = tracksEl.scrollTop;

            //sync body and bar numbers when horizontally scrolling
            barsEl.scrollLeft = tracksEl.scrollLeft;
        });
    });

    function closeMidiEditor() {
        midiEditorHidden.set(true)
    }

</script>

<!--first column (options and piano roll) take 20% of width, second (bar numbers and editor body) takes 80%-->
<div class="grid grid-cols-[20%_1fr] grid-rows-[auto_1fr] flex-1 text-white overflow-hidden">

    <!--sticks to the top and left. close button is here.-->
    <div class="sticky top-0 left-0 z-2 bg-neutral-500 ">  
        <button class="font-bold bg-neutral-700 hover:cursor-pointer flex" on:click={closeMidiEditor}>
            <img src={plus} alt="close" class="rotate-45">
        </button>
    </div>

    <!-- BAR NUMBERS (allows horizontal scrolling, not vertical) -->
    <div class="sticky top-0 z-10 bg-neutral-700 overflow-hidden" bind:this={barsEl}>
        <Trackbars />
    </div>

    <!-- PIANO ROLL (allows vertical scrolling, not horizontal)-->
    <div class="sticky left-0 z-10 bg-neutral-800 overflow-hidden" bind:this={keysEl}>
        <EditorKeys />
    </div>


    <!-- EDITOR BODY PARENT CONTAINER (main body, notes show up here. allows both horizontal and vertical scrolling)--> 
    <div class="relative overflow-auto bg-neutral-900 overscroll-none" bind:this={tracksEl}>

        <!-- CARET -->
        <div class="h-full absolute top-0 bottom-0 w-[1px] bg-white z-30" style="left: {$caretPos}px; height: {caretHeight}px;"></div>

        <!-- EDITOR BODY COMPONENT -->
        <EditorBody />
    </div>
</div>