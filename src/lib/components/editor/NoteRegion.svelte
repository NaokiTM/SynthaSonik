<script lang="ts">
    import { TracksArray } from "$lib/stores";
    import type { Note } from "$lib/stores";

    export let note: Note;
    export let notePixelWidth: number;
    export let barCellWidth: number;

    let currentNoteWidth = notePixelWidth;
    let resizing = false;
    let startX = 0;
    let startWidth = 0;

    // Sync with prop changes, but only when not actively dragging
    $: if (!resizing) currentNoteWidth = notePixelWidth;

    function startResize(event: MouseEvent) {
        event.stopPropagation();
        resizing = true;
        startX = event.clientX;
        startWidth = currentNoteWidth;
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResize);
    }


    function resize(event: MouseEvent) {
        if (!resizing) return;
        const dx = event.clientX - startX;
        currentNoteWidth = Math.max(barCellWidth, startWidth + dx);

        const newWidthInBars = Math.max(1, currentNoteWidth / barCellWidth);
        TracksArray.update(tracks => tracks.map(track => ({
            ...track,
            regions: track.regions.map(region => ({
                ...region,
                notes: region.notes.map(n =>
                    n.id === note.id ? { ...n, width: newWidthInBars } : n
                )
            }))
        })));
    }

    function stopResize() {
        resizing = false;
        window.removeEventListener("mousemove", resize);
        window.removeEventListener("mouseup", stopResize);

        const snappedWidth = Math.round(currentNoteWidth / barCellWidth);
        currentNoteWidth = snappedWidth * barCellWidth;
        TracksArray.update(tracks => tracks.map(track => ({
            ...track,
            regions: track.regions.map(region => ({
                ...region,
                notes: region.notes.map(n =>
                    n.id === note.id ? { ...n, width: snappedWidth } : n
                )
            }))
        })));
    }

    function removeNote() {

    }
</script>

<!-- main note  -->
<div 
    class="absolute inset-y-0 left-0 bg-green-500 z-10 flex items-center justify-end pointer-events-auto"
    style="width: {currentNoteWidth}px;"
>

    <!-- main resizer -->
    <div 
        class="w-2 h-full bg-green-300 cursor-ew-resize flex-shrink-0 hover:bg-white pointer-events-auto"
        on:mousedown={startResize}
    />
</div>