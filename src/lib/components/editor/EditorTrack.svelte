<script lang="ts">
    import { noOfBars, TracksArray, whichMidiTrackOpen,  } from "$lib/stores";

    let trackIndex: number;
    $: trackIndex = $whichMidiTrackOpen
    // let clickedNoteIndex = null

    function handleNote(octaveIndex: number, rowIndex: number, barIndex: number) {
        // if note already exists then remove, if note doesnt exist then add. default length of 1 (fills the bar clicked on)
        const rowsPerOctave = 12
        const notePos = octaveIndex * rowsPerOctave + rowIndex;

        TracksArray.update(tracks => {
            const copy = [...tracks];
            const track = { ...copy[trackIndex] };

            //Find region for current bar (since we are given the bar index)
            let region = track.regions.find(r => r.barNo === barIndex);

            //If a region doesnt exist then make a new one 
            if (!region) {
                region = {barNo: barIndex, length: 1, notes: []};
                track.regions = [...track.regions, region];
            }

            const newNote = {
                pos: notePos,  //Determines the note the new note is going in
                length: 1
            };

            //check if note already exists, if it does then remove and return false
            let noteToFind = region.notes.find(note => note.pos === notePos)
            if (noteToFind) {
                region.notes = region.notes.filter(note => note.pos !== notePos);
                copy[trackIndex] = track;
                return copy;
            }

            //appends the new note to the existing notes in the region
            region.notes = [...region.notes, newNote]

            copy[trackIndex] = track;
            return copy;
        });
        //add the note in stores to the track, to a new region length 1, to a bar number, to pos. 
    }

    //helper function for checking if a note exists at a spot 
    function hasNoteHelper(octaveIndex: number, barIndex: number, rowIndex: number) {
        const rowsPerOctave = 12
        const notePos = octaveIndex * rowsPerOctave + rowIndex


        //Get the bar number in the region (if the region exists which it should after clicking a note, then we let it show the note (region))
        const track = $TracksArray[trackIndex];
        if (!track) return false;

        const region = track.regions.find(r => r.barNo === barIndex);
        if (!region) return false;

        //Return true if it finds the matching note 
        return !!region.notes.find(note => note.pos === notePos)
    }
</script>

<div class="">
  <!-- 8 octaves -->
  {#each Array.from({ length: 8 }) as _, octaveIndex}

    {#each Array.from({ length: 12 }) as _, rowIndex}
      <div class="bg-neutral-900 h-6 flex">
        {#each Array.from({ length: $noOfBars }) as _, barIndex}
        

          <div class="border-neutral-800 border-1 w-1/4 h-6 flex-shrink-0 relative"> <!-- svelte-ignore a11y_consider_explicit_label --> <!-- svelte-ignore element_invalid_self_closing_tag --> <!-- the button is the note that you click to add or remove a note, and the hasNoteHelper function determines whether it should be green (if there is a note there) or not (if there isnt a note there)--> <!-- the math.max bit subtracts 1 but keeps the value from going below 1 --> <!-- the handleNote function adds or removes a note at that position in the store depending on whether there is already a note there or not-->
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <!-- svelte-ignore element_invalid_self_closing_tag -->
            <button
              class="w-full h-full"
              class:bg-green-500={hasNoteHelper(octaveIndex, barIndex, rowIndex)}
              class:bg-neutral-900={!hasNoteHelper(octaveIndex, barIndex, rowIndex)}
              on:click={() =>
                handleNote(octaveIndex, rowIndex, barIndex)
              }
            />
          </div>
        {/each}
      </div>
    {/each}
  {/each}
</div>



 