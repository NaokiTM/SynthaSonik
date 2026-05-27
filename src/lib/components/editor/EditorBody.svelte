<script lang="ts">
    import { noOfBars, TracksArray, whichMidiTrackOpen,  } from "$lib/stores";
    import { onDestroy, onMount } from "svelte";
    import NoteRegion from "./NoteRegion.svelte";

    let trackIndex: number;
    $: trackIndex = $whichMidiTrackOpen
    // let clickedNoteIndex = null

    let barCellWidth = 0; 

    function addNote(octaveIndex: number, rowIndex: number, barIndex: number) {
        const rowsPerOctave = 12;
        const notePos = octaveIndex * rowsPerOctave + rowIndex;

        TracksArray.update(tracks => {
            const copy = [...tracks];
            const track = { ...copy[trackIndex] };
            
            // Guard: ensure track and regions exist
            if (!track || !track.regions) {
                console.warn('No track found at index:', trackIndex);
                return tracks;
            }

            // Find the region index (not the region itself)
            const regionIndex = track.regions.findIndex(
                r => barIndex >= r.startBar && barIndex < r.endBar
            );

            if (regionIndex === -1) {
                // No region exists - create a new one with the note
                const noteStart = 0; // New region starts at this bar
                const newRegion = {
                    id: crypto.randomUUID(),
                    startBar: barIndex,
                    endBar: barIndex + 1,
                    notes: [{
                        id: crypto.randomUUID(),
                        pitch: notePos,
                        start: noteStart,
                        width: 1
                    }]
                };
                track.regions = [...track.regions, newRegion];


            } else {
                // Region exists - update it immutably
                const region = track.regions[regionIndex];
                const noteStart = barIndex - region.startBar;
                
                const existingNoteIndex = region.notes.findIndex(
                    note => note.pitch === notePos && note.start === noteStart
                );

                let newNotes;
                if (existingNoteIndex !== -1) {
                    // Remove existing note
                    newNotes = region.notes.filter((_, i) => i !== existingNoteIndex);
                } else {
                    // Add new note
                    newNotes = [...region.notes, {
                        id: crypto.randomUUID(),
                        pitch: notePos,
                        start: noteStart,
                        width: 1
                    }];
                }

                // Create new regions array with updated region
                track.regions = track.regions.map((r, i) => 
                    i === regionIndex ? { ...r, notes: newNotes } : r
                );
            }

            copy[trackIndex] = track;
            return copy;
        });

        console.log('Updated tracks:', $TracksArray[trackIndex]);
    }
  
</script>

<div class="">
  <!-- 8 octaves -->
  {#each Array.from({ length: 8 }) as _, octaveIndex}

    <!-- 12 pitches (piano keys) per octave -->
    {#each Array.from({ length: 12 }) as _, rowIndex}
      <div class="bg-neutral-900 h-6 flex">
        {#each Array.from({ length: $noOfBars }) as _, barIndex}
        

          <!-- represents a single bar for a pitch (its a container) -->
          <div class="border-neutral-800 border-1 w-1/4 h-6 flex-shrink-0 relative" bind:clientWidth={barCellWidth}>
            <div class="w-full h-full relative">
              <button 
                class="absolute inset-0 bg-neutral-900 hover:bg-neutral-700 z-0" 
                on:click={() => addNote(octaveIndex, rowIndex, barIndex)}
              />
              
              <!-- Notes render on top of button -->
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



 