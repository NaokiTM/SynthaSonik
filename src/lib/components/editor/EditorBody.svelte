<!-- ************************************* -->
<!-- MIDI EDITOR BODY-->
<!-- contains the grid where notes are added / rendered -->
 <!-- ************************************* -->

<script lang="ts">
    import { noOfBars, TracksArray, whichMidiTrackOpen,  } from "$lib/stores";
    import { onDestroy, onMount } from "svelte";
    import NoteRegion from "./NoteRegion.svelte";

    let trackIndex: number;
    $: trackIndex = $whichMidiTrackOpen
    let barCellWidth = 0; 

    function addNote(octaveIndex: number, rowIndex: number, barIndex: number) {
        const rowsPerOctave = 12;
        const notePos = octaveIndex * rowsPerOctave + rowIndex;

        TracksArray.update(tracks => {
            const copy = [...tracks];
            const track = { ...copy[trackIndex] };
            const regionIndex = track.regions.findIndex(   // Find the region index (not the region itself)
                r => barIndex >= r.startBar && barIndex < r.endBar
            );


            // IF NO REGION, CREATE NEW ONE
            if (regionIndex === -1) {
                const noteStart = 0; // New region starts at this bar
                const newRegion = {
                    id: crypto.randomUUID(),
                    startBar: barIndex,
                    endBar: barIndex + 1,
                    notes: [{
                        // ADD NEW NOTE
                        id: crypto.randomUUID(),
                        pitch: notePos,
                        start: noteStart,
                        width: 1
                    }]
                };
                
                // UPDATE REGIONS WITH NEW REGION + NOTE
                track.regions = [...track.regions, newRegion];


            } else {  // ELSE IF REGION ALREADY EXISTS
                let newNotes;
                const region = track.regions[regionIndex];
                const noteStart = barIndex - region.startBar;
                const existingNoteIndex = region.notes.findIndex(
                    note => note.pitch === notePos && note.start === noteStart
                );

                // IF NOTE ALREADY EXISTS IN THIS SPACE, RENOVE
                if (existingNoteIndex !== -1) {
                    newNotes = region.notes.filter((_, i) => i !== existingNoteIndex);
                } else { // ELSE ADD NEW NOTE TO REGION
                    newNotes = [...region.notes, {
                        id: crypto.randomUUID(),
                        pitch: notePos,
                        start: noteStart,
                        width: 1
                    }];
                }

                // UPDATE REGION WITH NEW NOTE
                track.regions = track.regions.map((r, i) => 
                    i === regionIndex ? { ...r, notes: newNotes } : r
                );
            }

            // RETURN THE UPDATED TRACKS ARRAY
            copy[trackIndex] = track;
            return copy;
        });
    }
  
</script>

<div class="">
  <!-- 8 OCTAVES, 12 PITCHES PER OCTAVE -->
  {#each Array.from({ length: 8 }) as _, octaveIndex}
    {#each Array.from({ length: 12 }) as _, rowIndex}

      <div class="bg-neutral-900 h-6 flex">
        
        <!-- FOR EVERY BAR -->
        {#each Array.from({ length: $noOfBars }) as _, barIndex}
        
          <!-- BAR CELL FOR A SINGLE PITCH -->
          <!-- PASS ITS CLIENT WIDTH AS THE DEFAULT WIDTH FOR A NEW NOTE -->
          <div class="border-neutral-800 border-1 w-1/4 h-6 flex-shrink-0 relative" bind:clientWidth={barCellWidth}> 
            <div class="w-full h-full relative">

              <!-- BUTTON TO ADD NEW NOTE -->
              <button 
                aria-label="Add note"
                class="absolute inset-0 bg-neutral-900 hover:bg-neutral-700 z-0" 
                on:click={() => addNote(octaveIndex, rowIndex, barIndex)}
              ></button>
              
              <!-- IF NOTE EXISTS IN THIS SPACE RENDER IT -->
              <div class="absolute inset-0 z-10 pointer-events-none">
                  {#each ($TracksArray[trackIndex]?.regions ?? []) as region}
                      {#each region.notes.filter(note => note.pitch === octaveIndex * 12 + rowIndex && barIndex >= region.startBar + note.start && barIndex < region.startBar + note.start + note.width) as note}
                          <NoteRegion {note} notePixelWidth={barCellWidth * note.width} {barCellWidth}/>
                      {/each}
                  {/each}
              </div>

            </div>
          </div>
        {/each}
      </div>
    {/each}
  {/each}
</div>



 