<!-- ************************************* -->
<!-- MENU BAR -->    
<!-- contains file, edit, insert, about, help etc. at the top of the interface -->
<!-- ************************************* -->
<script>
    // @ts-nocheck  //disables typescript for now idk why
    import logo from "$lib/assets/logo.png"
    import logoFull from "$lib/assets/logofull.png"
    import waveformIcon from "$lib/assets/waveformIcon.png"
    import { mixingDeckHidden, TracksArray } from "$lib/stores";

    //"about" popup is initially closed
    let aboutOpen = false;

    // toggle mixing deck visibility
    function toggleMixingDeck() {
        mixingDeckHidden.update(value => !value);    
    }

    //lets user import an external sample
    function importSample() {
        const input = document.createElement('input'); //trigger external file input dialog
        input.type = 'file';
        input.accept = 'audio/*';
        input.onchange = e => {
            const file = e.target.files[0];

            if (!file) {
                return; // user cancelled file selection
            }

            //When playing the tracks, we need to pass a url and not a file object
            const url = URL.createObjectURL(file);

            //create new track with the imported sample
            TracksArray.update(tracks => [...tracks, { id: tracks.length, instrument: "sample", sample: url, instrumentIcon: waveformIcon, color: "#004491", volume: 50, pan: 50, panAngle: 0, muted: false, soloed: false, regions: [] }]);
        };
        input.click();
    }
</script>


<div>
    <nav class="bg-neutral-800 text-white flex items-center rounded-lg text-sm z-10">

        <!-- ADD ATTRIBUTION LATER / SWITCH OUT LOGO -->
        <!-- <a href="https://www.flaticon.com/free-icons/music-note" title="music note icons">Music note icons created by Freepik - Flaticon</a>  -->
        <div class="relative inline-block w-auto">
            <img src={logo} alt="logo" class="scale-80 h-8">
        </div>


        <!-- DROPDOWN 1 (File) -->
        <div class="relative inline-block group z-30">
            <button class="rounded-sm pl-1">File</button>

            <ul class="dropdown-content menu p-2 shadow bg-neutral-700 w-52 absolute hidden group-hover:block rounded-sm">
                <li><button class="btn text-slate-300 rounded-sm">New project</button></li>
                <li><button class="btn text-slate-300 rounded-sm">Open project</button></li>
                <li><button class="btn text-slate-300 rounded-sm">Save project</button></li>
                <li><button class="btn text-slate-300 rounded-sm">Share</button></li>
                <li><button class="btn text-slate-300 rounded-sm" on:click={importSample}>Import Sample as track</button></li>
                <li><button class="btn text-slate-300 rounded-sm">Close project</button></li>
            </ul>
        </div>

        <!-- DROPDOWN 2 (Edit) -->
        <div class="relative inline-block group z-30">
            <button class="rounded-sm">Edit</button>

            <ul class="dropdown-content menu p-2 shadow bg-neutral-700 w-52 absolute hidden group-hover:block rounded-sm">
                <li><button class="btn text-slate-300 rounded-sm">Undo</button></li>
                <li><button class="btn text-slate-300 rounded-sm">Redo</button></li>
                <li><button class="btn text-slate-300 rounded-sm">Copy</button></li>
                <li><button class="btn text-slate-300 rounded-sm">Paste</button></li>

            </ul>
        </div>

        <!-- DROPDOWN 3 (Add) -->
        <div class="relative inline-block group z-30">
            <button class="rounded-sm">Add</button>

            <ul class="dropdown-content menu p-2 shadow bg-neutral-700 w-52 absolute hidden group-hover:block rounded-sm">
                <li><button class="btn text-slate-300 rounded-sm">Add instrument</button></li>
            </ul>
        </div>

        <!-- DROPDOWN 4 (View) -->
        <div class="relative inline-block group z-30">
            <button class="rounded-sm">View</button>

            <ul class="dropdown-content menu p-2 shadow bg-neutral-700 w-52 absolute hidden group-hover:block rounded-sm">
                <li><button class="btn text-slate-300 rounded-sm">appearance</button></li>
                <li><button class="btn text-slate-300 rounded-sm" on:click={toggleMixingDeck}>toggle mixing deck</button></li>
                <li><button class="btn text-slate-300 rounded-sm">idk</button></li>
            </ul>
        </div>

        <!-- DROPDOWN 5 (Options) -->     
        <div class="relative inline-block group z-30">
            <button class="rounded-sm">Options</button>

            <ul class="dropdown-content menu p-2 shadow bg-neutral-700 w-52 absolute hidden group-hover:block rounded-sm">
                <li><button class="btn text-slate-300 rounded-sm">option1</button></li>
                <li><button class="btn text-slate-300 rounded-sm">option2</button></li>
            </ul>
        </div>  

        <!-- DROPDOWN 6 (Help) -->
        <div class="relative inline-block group z-30">
            <button class="rounded-sm">Help</button>

            <ul class="dropdown-content menu p-2 shadow bg-neutral-700 w-52 absolute hidden group-hover:block rounded-sm">
                <li><button class="btn text-slate-300 rounded-sm">help me</button></li>
                <li><button class="btn text-slate-300 rounded-sm" on:click={aboutOpen = true}>about</button></li>
            </ul>
        </div>
    </nav>

    {#if aboutOpen}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- scrim -->
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" on:click={() => (aboutOpen = false)}>
            <!-- modal -->
            <div class="bg-neutral-800 text-white rounded-lg p-8 min-w-[300px]" on:click|stopPropagation>
                <img src={logoFull} alt="logo" class="scale-100 h-12 mb-4">
                <p>Online DAW interface using 
                <br>Svelte and audioEngine.</p>
                <a href="https://github.com/NaokiTM/onlinedaw" class="text-blue-400 underline mt-2 block">Source Code</a>

                <button class="mt-4 px-4 py-1 bg-neutral-600 rounded" on:click={() => (aboutOpen = false)}>Close</button>
            </div>
        </div>
    {/if}

</div>


<style>
    button {
        padding-left: 5px;
        padding-right: 5px;
    }
    button:hover {
        background-color: #5e5e5e;
        cursor: pointer;
    }
    ul {
        position: absolute;
    }
</style>