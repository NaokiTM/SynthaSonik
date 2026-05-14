<!-- ************************************* -->
<!-- BAR NUMBER INDICATORS-->
<!-- a bar component on the top of the main interface and midi editor, showing bar numbers.-->
<!-- caret HEADER logic is mostly here -->
<!-- all logic for looping bars is also here -->
<!-- ************************************* -->

<script lang="ts">
    import minus from '$lib/assets/minus.png'
    import plus from '$lib/assets/plus.png'
    import { currentBar, noOfBars, caretHeaderWidth, loopedBars, isLoopMode } from '$lib/stores';
    import { caretPos } from '$lib/stores';
    import { onMount } from 'svelte';

    // dynamically gets number of bars to display
    $: bars = Array.from({length: $noOfBars})

    let holding = false;
    let caretHeader: HTMLElement


    //set the initial width of bars to match the width of track regions
    onMount(() => {

        // initially set caret header position based on initial parent width? 
        caretHeaderWidth.set(caretHeader.getBoundingClientRect().width);


        //adjust caret header position based on resize of parent?
        const resizeObserver = new ResizeObserver(() => {
          caretHeaderWidth.set(caretHeader.getBoundingClientRect().width);
        });


        resizeObserver.observe(caretHeader);
    });

    //update caret position while dragging with a mouse
    function moveCaret(e: MouseEvent) {
        if (!holding) return;

        //get the size of the caret header element
        const rect = caretHeader.getBoundingClientRect()

        //new caret header position is the current mouse position (minus the slight offset from the caret header box)
        const newCaretHeaderPos = e.clientX - rect.left 

        //Ensure The caret header doesnt hide under track headers / corner stub thing
        if (newCaretHeaderPos >= 0) {  
            $caretPos = newCaretHeaderPos  
        }
    }

    //detect when caret header is being dragged
    function startHolding() {
        holding = true
        window.addEventListener("mousemove", moveCaret)
        window.addEventListener("mouseup", stopHolding)
    }

    // detect when caret header is not being dragged anymore
    function stopHolding() {
        holding = false

        window.removeEventListener("mousemove", moveCaret);
        window.removeEventListener("mouseup", stopHolding);
    }

    //sets desired bars to be designated as looping
    function addLoopBar(_barNo: number) {

        // if we are in loop mode then allow for adding looping bars (bars can be selected to be looped through)
        if ($isLoopMode) {
            loopedBars.update(current => {
                

                // Sort the loopedBars array to make sure it's always in order
                const sortedBars = [...current].sort((a, b) => a - b);


                // Only set the bar as looping if it's not already being looped
                if (!current.includes(_barNo)) {


                    //if only one bar is looping, dont check for adjacency
                    if (current.length === 0) {
                        return [...current, _barNo];
                    }


                    // Otherwise, check if the bar is adjacent to any of the existing bars
                    const isAdjacent = sortedBars.some(bar => bar === _barNo - 1 || bar === _barNo + 1);



                    if (isAdjacent) {
                        // Add the bar if it's adjacent
                        return [...current, _barNo]; 
                    } else {
                        // Do not add the bar if it's not adjacent
                        return current; 
                    }



                } else {
                    // Remove the bar if it's already in the array (turn off looping for the selected bar)
                    return current.filter(bar => bar !== _barNo); 
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
        <button onclick={() => addLoopBar(i)} class={`border-neutral-500 border-r-1 h-5 w-1/4 items-center flex p-1 flex-shrink-0 justify-end ${$loopedBars.includes(i) ? 'bg-amber-400 rounded-md' : 'bg-neutral-700'}`}>
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