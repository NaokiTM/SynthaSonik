<!-- ************************************* -->
<!-- NOTE REGION-->
<!-- represents a single note object, rendered onto the editor body -->
<!-- ************************************* -->

<script lang="ts">
    import { TracksArray } from "$lib/stores";
    import type { Note } from "$lib/stores";

    export let note: Note;
    export let notePixelWidth: number;
    export let barCellWidth: number;

    let currentNoteWidth = notePixelWidth;
    let isResizing = false;
    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    // Sync with prop changes, but only when not actively dragging
    $: if (!isResizing) currentNoteWidth = notePixelWidth;


    // HANDLES THE RESIZE EVENT (START AND STOP RESIZE HANDLING)
    function startResize(event: MouseEvent) {
        event.stopPropagation();
        isResizing = true;
        startX = event.clientX;
        startWidth = currentNoteWidth;
        window.addEventListener("mousemove", resizeNote);
        window.addEventListener("mouseup", stopResize);
    }

    let originalStart = 0; // to keep track of the note's original start position during dragging

    function startDrag(event: MouseEvent) {
        event.stopPropagation();

        isDragging = true;
        startX = event.clientX;
        originalStart = note.start;

        window.addEventListener("mousemove", dragNote);
        window.addEventListener("mouseup", stopDrag);
    }


    // DURING RESIZE, CALCULATE NEW WIDTH AND UPDATE STORE
    function resizeNote(event: MouseEvent) {
        if (!isResizing) return;

        const differenceX = event.clientX - startX;

        // minimum width only prevents disappearing
        currentNoteWidth = Math.max(10, startWidth + differenceX);

        const newWidthInBars = currentNoteWidth / barCellWidth;

        TracksArray.update(tracks =>
            tracks.map(track => ({
                ...track,
                regions: track.regions.map(region => ({
                    ...region,
                    notes: region.notes.map(n =>
                        n.id === note.id
                            ? { ...n, width: newWidthInBars }
                            : n
                    )
                }))
            }))
        );
    }


    // Implement dragging logic here, similar to resizing but updating note position instead of width
    function dragNote(event: MouseEvent) {
        if (!isDragging) return;

        const differenceX = event.clientX - startX;
        const barsMoved = differenceX / barCellWidth;

        TracksArray.update(tracks =>
            tracks.map(track => ({
                ...track,
                regions: track.regions.map(region => ({
                    ...region,
                    notes: region.notes.map(n =>
                        n.id === note.id
                            ? { ...n, start: originalStart + barsMoved }
                            : n
                    )
                }))
            }))
        );
    }


    // STOP RESIZING NOTE
    function stopResize() {
        isResizing = false;

        window.removeEventListener("mousemove", resizeNote);
        window.removeEventListener("mouseup", stopResize);
    }

    // STOP DRAGGING NOTE
    function stopDrag() {
        isDragging = false;

        window.removeEventListener("mousemove", dragNote);
        window.removeEventListener("mouseup", stopDrag);

        TracksArray.update(tracks =>
            tracks.map(track => ({
                ...track,
                regions: track.regions.map(region => ({
                    ...region,
                    notes: region.notes.map(n => {
                        if (n.id !== note.id) return n;

                        return {
                            ...n,
                            start: Math.round(n.start) // SNAP HERE
                        };
                    })
                }))
            }))
        );
    }




    // REMOVE NOTE BY DOUBLE CLICKING THE NOTE
    function removeNote() {
        TracksArray.update(tracks => tracks.map(track => ({
            ...track,
            regions: track.regions.map(region => ({
                ...region,
                notes: region.notes.filter(n => n.id !== note.id)
            }))
        })));
    }


</script>

<!-- MAIN NOTE BODY-->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
    class="absolute inset-y-0 left-0 bg-green-500 z-10 flex items-center justify-end pointer-events-auto"
    style="width: {currentNoteWidth}px; left: {note.start * barCellWidth}px;"
    on:click|stopPropagation={() => {}}
    on:dblclick|stopPropagation={removeNote}
    on:mousedown|preventDefault|stopPropagation={startDrag} 
>

    <!-- NOTE RESIZER ON EDGE OF THE NOTE-->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <div 
        class="w-2 h-full bg-green-300 cursor-ew-resize flex-shrink-0 hover:bg-white pointer-events-auto"
        on:mousedown|preventDefault|stopPropagation={startResize}
    />
</div>