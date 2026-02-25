<script lang="ts">
    import minus from '$lib/assets/minus.png'
    import plus from '$lib/assets/plus.png'
    import { currentBar, noOfBars, caretHeaderWidth, loopedBars, isLoopMode } from '$lib/stores';
    import { caretPos } from '$lib/stores';
     import { onMount } from 'svelte';
    $: bars = Array.from({length: $noOfBars}) //$ makes it a reactive variable to allow changes to the array when bars are dynamically added / removed

    let holding = false;
    let caretHeader: HTMLElement

    // //change to only apply to current bar 
    // let toBeLooped = false

    //This is required to set a default headerwidth asap to determine what bar we are initially on (in stores.js)
    onMount(() => {
        caretHeaderWidth.set(caretHeader.getBoundingClientRect().width);
        //for resize
        const resizeObserver = new ResizeObserver(() => {
          caretHeaderWidth.set(caretHeader.getBoundingClientRect().width);
        });

        resizeObserver.observe(caretHeader);  //Observe the caretHeader for resizes
    });

    //update caret position while dragging with a mouse
    function moveCaret(e: MouseEvent) {
        if (!holding) return;

        const rect = caretHeader.getBoundingClientRect()
        const newCaretPos = e.clientX - rect.left //whole screen - left offset from edge of screen to left of caretHeader, which gives the correct x coords
        if (newCaretPos >= 0) {  //Ensure The caret doesnt hide under caretHeaders
            $caretPos = newCaretPos  
        }


        // //To update currentbar with the 
        // const barWidth = rect.width / 4;
        // $currentBar = Math.floor($caretPos / barWidth);
    }

    function startHolding() {
        holding = true

        window.addEventListener("mousemove", moveCaret)
        window.addEventListener("mouseup", stopHolding)
    }

    function stopHolding() {
        holding = false

        window.removeEventListener("mousemove", moveCaret);
        window.removeEventListener("mouseup", stopHolding);
    }

    function addLoopBar(_barNo) {
        if ($isLoopMode) {
            //if loop mode is on, then allow for highlighting this bar only.
            //when the track starts playing, it will get as far as the highlighted bar, and at the end will replay the same part of the track

            loopedBars.update(current => {
                // Sort the loopedBars array to make sure it's always in order
                const sortedBars = [...current].sort((a, b) => a - b);

                // Only add the bar if it's not already in the array
                if (!current.includes(_barNo)) {
                    if (current.length === 0) {
                        return [...current, _barNo];
                    }

                    // Otherwise, check if the bar is adjacent to any of the existing bars
                    const isAdjacent = sortedBars.some(bar => bar === _barNo - 1 || bar === _barNo + 1);

                    if (isAdjacent) {
                        return [...current, _barNo]; // Add the bar if it's adjacent
                    } else {
                        return current; // Do not add the bar if it's not adjacent
                    }
                } else {
                    return current.filter(bar => bar !== _barNo); // Remove the bar if it's already in the array
                }
            });
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
    class="h-5 w-full bg-neutral-700 flex relative flex-shrink-0"
    bind:this = {caretHeader}
>

    <!-- caret (top bit) -->
    <div 
        class="absolute -left-2.5 clipped-square h-5 w-5 bg-white hover:cursor-pointer" 
        style="left: {$caretPos - 10}px"
        onmousedown={startHolding}
    ></div>

    <!-- iteratively display bars on top of track body -->
    {#each bars as _, i}

        <!-- replace with on:click later -->
        <button 
        onclick={() => addLoopBar(i)} 
        class={`border-neutral-500 border-r-1 h-5 w-1/4 items-center flex p-1 flex-shrink-0 justify-end 
                ${$loopedBars.includes(i) ? 'bg-amber-400' : 'bg-neutral-700'}`}
        >
        {i + 1}
        </button>
    {/each}

    <div class="fixed right-0 bg-gradient-to-r from-transparent to-neutral-900">
        <!-- Add bar -->
        <button onclick={() => $noOfBars++} class='hover:cursor-pointer'>
            <img src={plus} alt='add' class="h-full">
        </button>

        <!-- the math.max bit subtracts 1 but keeps the value from going below 1 -->
        <button onclick={() => $noOfBars = Math.max(1, $noOfBars-1)} class='hover:cursor-pointer'>  
            <img src={minus} alt='remove' class="h-full">
        </button>
    </div>


</div>

<style>

    /* Gives the caret the "pointer" look by cutting the 2 bottom corners diagonally*/
    .clipped-square {
        clip-path: polygon(
            0 0,      /* top-left */
            100% 0,   /* top-right */
            100% 50%, /* just above bottom-right */
            50% 100%, /* bottom-right cut */
            50% 100%, /* bottom-left cut */
            0 50%     /* just above bottom-left */
        );
    }

    
</style>