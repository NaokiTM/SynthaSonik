<!-- BAR FOR TRACK CONTROLS (PLAY, PAUSE, RECORD ETC.) -->

<script>
// @ts-nocheck
    import back from '$lib/assets/back.png'
    import play from '$lib/assets/play.png'
    import metronome from '$lib/assets/metronome.png'
    import skip from '$lib/assets/skip.png'
    import pause from'$lib/assets/pause.png'
    import record from'$lib/assets/record.png'
    import piano from '$lib/assets/piano.png'
    import loop from '$lib/assets/loop.png'
    import snip from '$lib/assets/snip.png'
    import mixer from '$lib/assets/mixer.png'

    import { currentBar, currentBeat, keySig, timeSig, tonality, accidental, octave, tempo, isPlaying, TracksArray } from '$lib/stores'
    import { caretPos } from '$lib/stores'

    import { mixingDeckHidden } from "$lib/stores";
    import { AudioEngine } from '../../audioEngine'
    import { onMount } from 'svelte'
  import Menubar from './Menubar.svelte';
  import VolumeSlider from './track/VolumeSlider.svelte';

    let audio

    onMount(() => {
        audio = new AudioEngine; // runs only in browser
    });

    function toggleMixingDeck() {
        mixingDeckHidden.update(value => !value);    
    }

    let lastTimestamp;
    let animationFrame;

    const speed = 100   //This is in pixels per second. This needs to be translated into tempo, and is NOT the tempo itself.

    function enforceThreeDigits(event) {
        let val = event.target.value.replace(/\D/g, ''); // strip non-digits

        if (val.length === 2 && val[0] === '0') {
            val = val[1]; // Keep only the newly typed digit
        }

        if (val.length > 3) val = val.slice(0, 3); // keep first 3 digits (last 3 means tempo can change just by typing, which isnt ideal if we already have 3 digits)

        tempo.set(+val || 0);
        event.target.value = val;
    }

    async function playTracks() {
        audio = new AudioEngine; // runs only in browser

        //Loop thorugh all tracks and for as many tracks create an audio.newtrack, find the tracks sample and save as buffer, create a clip, and when all have looped through play the clips
        //do later, fix unknown content type passed error when importing samples
        const tracks = $TracksArray;
        for (let i = 0; i < tracks.length; i++) { 
            let track = audio.addTrack() 
            const sample = tracks[i].sample; 
            if (sample) {
                const buffer = await audio.loadBuffer(sample);
                await audio.addClip(track, buffer)
            } 
        }

        //First resets the boolean to false (in case its already true), and make it true again to run.
        // idk why this works but it allows for clicking the play button multiple times
        isPlaying.set(true);
        lastTimestamp = performance.now(); //What is this?

        //starts moving caret
        animationFrame = requestAnimationFrame(nextCaretPos);

        // function to play the track, then schedule the next playback
        function playLoop() {
            audio.play();

            // schedule the next play after a delay (e.g. 1 second)
            // adjust 1000 to your clip length in ms
            setTimeout(playLoop, 1000);
        }

        // // start the first play
        playLoop();
    }

    function pauseTracks() {
        isPlaying.set(false);
        cancelAnimationFrame(animationFrame);
    }

    function rewindTracks() {
        isPlaying.set(false);
        cancelAnimationFrame(animationFrame);
        caretPos.set(0)
    }

    function toggleLoopMode() {
        //toggle to opposite setting
        isLoopMode.set(!isLoopMode)
    }

    //Comment later i dont really get what this does in detail
    function nextCaretPos(timestamp) {        
        animationFrame = requestAnimationFrame(nextCaretPos);
        let toSeconds = (timestamp - lastTimestamp) / 1000; //Converts to seconds
        lastTimestamp = timestamp;

        caretPos.update(pos => pos + speed * toSeconds);
    }
</script>

<nav class="bg-[#292828] text-white space-x-2 flex items-center text-sm p-2">

    <!-- Menu  -->
    <Menubar />

    <!-- track controls -->
     <div class="flex-1 flex justify-center">
        <div class="bg-neutral-900 p-2 space-x-2 flex w-fit rounded-lg" >
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button class="record-btn">
                <span class="record-slot"></span>
            </button>
            <button class="cassette-btn" on:click={playTracks}>
                <img src='{play}' alt='back' class="block w-4 h-4 mb-1.5">
                <span class="cassette-slot"></span>
            </button>
            <button class="cassette-btn" on:click={pauseTracks}>
                <img src='{pause}' alt='play' class="block w-4 h-4 mb-1.5">
                <span class="cassette-slot"></span>
            </button>
            <button class="cassette-btn" on:click={rewindTracks}>
                <img src='{back}' alt='record' class="block w-4 h-4 mb-1.5">
                <span class="cassette-slot"></span>
            </button>
            <button class="cassette-btn">
                <img src='{skip}' alt='skip'class="block w-4 h-4 mb-1.5">
                <span class="cassette-slot"></span>
            </button>
            <button class="cassette-btn">
                <img src={loop} alt='metronome' class="block w-4 h-4 mb-1.5">
                <span class="cassette-slot"></span>
            </button>
        </div> 
     </div>


    <!-- track information -->
     <div class="justify-center flex">
        <div class="bg-sky-900 flex text-sky-500 pl-1 w-fit rounded-lg pb-0.5">
            <div class="flex flex-col">
                <div class="text-xl">{$currentBar}</div>
                <div class="text-xs text-center">bar</div>
            </div>
            <div class="border-sky-800 border-1 ml-1 mr-1 w-fit items-center"></div>
            <div class="flex flex-col">
                <div class="text-xl">{$currentBeat}</div>
                <div class='text-xs text-center'>beat</div>
            </div>
            <div class="border-sky-800 border-1 ml-1 mr-1"></div>
            <div class="flex flex-col">
                <div class="text-center">
                    <input 
                        type="number" 
                        min="0" 
                        max="999" 
                        bind:value={$tempo}
                        class="custom-input" 
                        on:input={enforceThreeDigits}
                    />
                </div>
                <!-- <div class="text-center text-xs">keep</div> -->
                <div class="text-xs text-center">tempo</div>
            </div>
            <div class="border-sky-800 border-1 ml-1 mr-1"></div>
            <div class="flex flex-row justify-between">
                <div class="text-xl text-center flex-col justify-center items-center flex">
                    <select class="sig-drop w-full">
                        <option value="4/4">4/4</option>
                        <option value="3/4">3/4</option>
                        <option value="2/4">2/4</option>
                        <option value="12/8">12/8</option>
                        <option value="7/8">7/8</option>
                        <option value="6/8">6/8</option>
                    </select>
                    <div class="text-xs text-center">time</div>
                </div>
                <div class="border-sky-800 border-1 ml-1 mr-1"></div>
                <div class="text-lg text-center flex flex-col justify-center items-center">
                    <select class="sig-drop w-full">
                        <option value="C# Major">C# Major</option>
                        <option value="F# Major">F# Major</option>
                        <option value="B Major">B Major</option>
                        <option value="E Major">E Major</option>
                        <option value="A Major">A Major</option>
                        <option value="D Major">D Major</option>
                        <option value="G Major">G Major</option>
                        <option value="C Major">C Major</option>
                        <option value="F Major">F Major</option>
                        <option value="B♭ Major">B♭ Major</option>
                        <option value="E♭ Major">E♭ Major</option>
                        <option value="A♭ Major">A♭ Major</option>
                        <option value="D♭ Major">D♭ Major</option>
                        <option value="G♭ Major">G♭ Major</option>
                        <option value="C♭ Major">C♭ Major</option>
                        <option value="E♭ Major">E♭ Major</option>
                        <option value="A# Minor">A# Minor</option>
                        <option value="D# Minor">D# Minor</option>
                        <option value="G# Minor">G# Minor</option>
                        <option value="C# Minor">C# Minor</option>
                        <option value="F# Minor">F# Minor</option>
                        <option value="B Minor">B Minor</option>
                        <option value="E Minor">E Minor</option>
                        <option value="A Minor">A Minor</option>
                        <option value="D Minor">D Minor</option>
                        <option value="G Minor">G Minor</option>
                        <option value="C Minor">C Minor</option>
                        <option value="F Minor">F Minor</option>
                        <option value="B♭ Minor">B♭ Minor</option>
                        <option value="E♭ Minor">E♭ Minor</option>
                        <option value="A♭ Minor">A♭ Minor</option>
                    </select>
                    <div class="text-xs text-center">Key Sig</div>
                </div>
            </div>
        </div>
     </div>
        <div class="flex-1">
        </div>

        <div class="flex-1 flex justify-center" >
            <div class="flex-1 flex flex-col justify-center items-center scale-125 space-y-1"> 
                <div class="text-xs">Master Volume</div>
                <VolumeSlider></VolumeSlider>
            </div>
            <div class="flex bg-neutral-900 w-fit p-2 rounded-lg space-x-2">
                <button class="cassette-btn">
                    <img src={snip} alt='metronome' class="block w-4 h-4 mb-1.5">
                    <span class="cassette-slot"></span>
                </button>
                <button class="cassette-btn" on:click={toggleMixingDeck}>
                    <img src={mixer} alt='metronome' class="block w-4 h-4 mb-1.5">
                    <span class="cassette-slot"></span>
                </button>                
                <button class="cassette-btn">
                    <img src={metronome} alt='metronome' class="block w-4 h-4 mb-1.5">
                    <span class="cassette-slot"></span>
                </button>

                <!-- <button class="cassette-btn">
                    <img src={} alt='metronome' class="block w-4 h-4 mb-1.5">
                    <span class="cassette-slot"></span>
                </button> -->
            </div>
        </div>



</nav>

<style>
    /* img {
        scale: 50%;
    } */

    .record-btn {
        /* all: unset; */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;

        width: 30px;
        height: 35px;
        position: relative;

        background: rgb(127, 26, 26);

        border-top-left-radius: 2px;
        border-top-right-radius: 2px;

        clip-path: polygon(
            0 0,
            100% 0,
            100% 85%,
            90% 100%,
            10% 100%,
            0 85%
        );

        cursor: pointer;
    }

    .record-slot {
        width: 80%;
        height: 2.5px;
        background: linear-gradient(to bottom, #c41212 0%, #721717 48%);
        border-radius: 6px;
        box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.3);
        margin-bottom: 2px;
    }

    .cassette-btn {
        /* all: unset; */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;

        width: 30px;
        height: 35px;
        position: relative;

        background: rgb(60, 59, 55);

        border-top-left-radius: 2px;
        border-top-right-radius: 2px;

        clip-path: polygon(
            0 0,
            100% 0,
            100% 85%,
            90% 100%,
            10% 100%,
            0 85%
        );

        cursor: pointer;
    }

    .cassette-slot {
        width: 80%;
        height: 2.5px;
        background: linear-gradient(to bottom, #706E67 0%, #33332F 48%);
        border-radius: 6px;
        box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.3);
        margin-bottom: 2px;
    }

    .sig-drop {
        appearance: none;            /* Remove default OS styling */
        -webkit-appearance: none;
        -moz-appearance: none;
        background-image: none;   /* important */

        background-color: rgb(0, 74, 112);
        color: rgb(5, 166, 244);               
        border: none;                /* Clean edge */
        padding: 0;
        font-size: 14px;
        border-radius: 4px;
        cursor: pointer;
        outline: none;
        width: fit-content;
        margin-right: 1px;
    }

    .custom-input {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: textfield; /* hides spinners in Firefox */

        background-color: rgb(0, 74, 112);  /* same blue as dropdown */
        color: rgb(5, 166, 244);                /* black text */
        border: none;       /* same slim padding */
        font-size: 20px;

        line-height: 1;         /* IMPORTANT */
        padding: 0;  
        border-radius: 4px;
        outline: none;
        width: 3ch;                /* optional: fixed width */
        text-align: center;
        padding-top: 2px;
    }
</style>