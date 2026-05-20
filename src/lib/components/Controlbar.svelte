<!-- ************************************* -->
<!-- CONTROL-BAR -->
<!-- Bar for track controls (play, pause, record etc.) -->
<!-- logic for play, pause, record, fastforward etc is handled here atm -->
<!-- ************************************* -->


<script>
    // @ts-nocheck
    import { onDestroy, onMount } from 'svelte'

    import back from '$lib/assets/back.png'
    import play from '$lib/assets/play.png'
    import metronome from '$lib/assets/metronome.png'
    import skip from '$lib/assets/skip.png'
    import pause from '$lib/assets/pause.png'
    import record from '$lib/assets/record.png'
    import piano from '$lib/assets/piano.png'
    import loop from '$lib/assets/loop.png'
    import snip from '$lib/assets/snip.png'
    import mixer from '$lib/assets/mixer.png'

    import { currentBar, currentBeat, keySig, timeSig, tonality, accidental, octave, tempo, isPlaying, TracksArray, isLoopMode, toggleMixingDeck, caretPos, mixingDeckHidden } from '$lib/stores'
    import { AudioEngine } from '../../audioEngine'

    import Menubar from './Menubar.svelte'
    import VolumeSlider from './common/VolumeSlider.svelte'

    let audio
    let lastTimestamp;
    let animationFrame;

    const speed = 100 //speed of caret in pixels per second (change to be based on tempo + pixels per beat)

    // define audio variables (all created during functions, but used globally)
    let mediaRecorder = null
    let micStream = null

    let midiAccess = null
    let activeMidiInput = null

    function cleanupRecording() {
        // =========================
        // STOP MEDIA RECORDER
        // =========================
        if (mediaRecorder) {

            if (mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
            }

            mediaRecorder.ondataavailable = null;
            mediaRecorder.onstop = null;

            mediaRecorder = null;
        }

        // =========================
        // STOP MICROPHONE STREAM
        // =========================
        if (micStream) {

            micStream.getTracks().forEach(track => {
                track.stop();
            })

            micStream = null;
        }

        // =========================
        // REMOVE MIDI LISTENERS
        // =========================
        if (activeMidiInput) {
            activeMidiInput.onmidimessage = null;
            activeMidiInput = null;
        }

        midiAccess = null;

        // =========================
        // RESET STORE STATE
        // =========================
        TracksArray.update(tracks =>
            tracks.map(t => ({
                ...t,
                recording: false
            }))
        );

        console.log("Recording cleanup complete");
    }

    onMount(() => {
        //initialize audio engine on mount so that there is no delay when user clicks play for the first time
        audio = new AudioEngine()
    });

    onDestroy(() => {
        cleanupRecording()
    });

    //make tempo display stay within 3 digits
    function enforceThreeDigits(event) {
        let val = event.target.value.replace(/\D/g, ''); // strip non-digits

        if (val.length === 2 && val[0] === '0') {
            val = val[1]; // Keep only the newly typed digit
        }

        if (val.length > 3) val = val.slice(0, 3); // keep first 3 digits (last 3 means tempo can change just by typing, which isnt ideal if we already have 3 digits)

        tempo.set(+val || 0);
        event.target.value = val;
    }

    // 
    async function playTracks() {
        audio = new AudioEngine();
        const tracks = $TracksArray;

        //FIX: unknown content type passed error when importing samples
        //for all tracks, check for a sample, and if it exists then load into buffer and add as clip to play
        for (let i = 0; i < tracks.length; i++) {
            let track = audio.addTrack();

            const sample = tracks[i].sample;

            if (sample) {
                const buffer = await audio.loadBuffer(sample);
                await audio.addClip(track, buffer);
            }
        }

        //First resets the boolean to false (in case its already true), and make it true again to run.
        //idk why this works but it allows for clicking the play button multiple times
        isPlaying.set(true);

        lastTimestamp = performance.now(); //What is this? 

        //starts moving caret
        animationFrame = requestAnimationFrame(nextCaretPos);

        // function to play the track, then schedule the next playback
        function playLoop() {
            if (!$isPlaying) return

            audio.play();

            // schedule the next play after a delay (e.g. 1 second)
            // adjust 1000 to your clip length in ms
            // CHANGE TO PLAY IN SYNC BASED ON TRACK NOTES AND TEMPO
            setTimeout(playLoop, 1000);
        }

        //start the first playthrough
        playLoop();
    }

    // pause all tracks, stop caret from moving (but not reset).
    function pauseTracks() {
        isPlaying.set(false);
        cancelAnimationFrame(animationFrame);
    }

    // rewind all tracks and reset caret position to 0
    function rewindTracks() {
        isPlaying.set(false);
        cancelAnimationFrame(animationFrame);
        caretPos.set(0)
    }

    //toggle loop mode
    function toggleLoopMode() {
        isLoopMode.set(!$isLoopMode)
    }

    //Comment in detail later
    function nextCaretPos(timestamp) {
        animationFrame = requestAnimationFrame(nextCaretPos);
        let toSeconds = (timestamp - lastTimestamp) / 1000; //Converts to seconds
        lastTimestamp = timestamp;
        caretPos.update(pos => pos + speed * toSeconds); //I dont really get what this does in detail
    }

    // function to start recording voice (will be different based on the instrument)
    async function startRecording() {

        // find selected track
        const selectedTrack = $TracksArray.find(t => t.selected);
        // defensive check
        if (!selectedTrack) {
            console.log("No track selected");
            return;
        }

        // access selected track
        if (selectedTrack.instrument === "voice") {

            // CHECK IF CONNECTION TO MIC CAN BE ESTABLISHED
            try {
                // ask for microphone access
                micStream = await navigator.mediaDevices.getUserMedia({
                    audio: true
                });

                // create recorder
                mediaRecorder = new MediaRecorder(micStream);

                mediaRecorder.ondataavailable = (event) => {
                    console.log("Audio chunk:", event.data);
                }

                mediaRecorder.start();

                console.log("Microphone recording started");

            // IF MIC CAN'T BE ACCESSED / NO MIC AVAILABLE
            } catch (err) {
                // user denied mic OR no mic exists
                console.log("No microphone available");
                return;
            }
        } else {
            //CHECK IF BROWSER SUPPORTS MIDI
            if (!navigator.requestMIDIAccess) {
                console.log("Web MIDI not supported");
                return;
            }

            //TRY CONNECTING TO MIDI IF IT EXISTS
            try {
                midiAccess = await navigator.requestMIDIAccess();

                // get connected MIDI inputs
                const inputs = [...midiAccess.inputs.values()];

                // no MIDI device connected
                if (inputs.length === 0) {
                    console.log("No MIDI device connected");
                    return;
                }

                // use first MIDI device
                activeMidiInput = inputs[0];

                console.log("Connected MIDI:", activeMidiInput.name);

                // listen for MIDI notes
                activeMidiInput.onmidimessage = (event) => {
                    console.log("MIDI message:", event.data);
                }

            // IF BROWSER DOESNT SUPPORT MIDI, DON'T START RECORDING
            } catch (err) {
                console.log("Could not access MIDI");
                return;
            }
        }

        // set recording state
        TracksArray.update(tracks =>
            tracks.map(t => ({
                ...t,
                recording: t.id === selectedTrack.id
            }))
        );
    }

    // set the track.recording to false (will stop recording in backend later)
    function stopRecording() {

        cleanupRecording()

        TracksArray.update(tracks =>
            tracks.map(t => ({
                ...t,
                recording: false
            }))
        );
    }

</script>

<nav class="bg-[#292828] text-white space-x-2 flex items-center text-sm p-2">

    <!-- Menu  -->
    <Menubar />

    <!-- track controls -->
     <div class="flex-1 flex justify-center">
        <div class="bg-neutral-900 p-2 space-x-2 flex w-fit rounded-lg" >
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button class="record-btn" on:click={startRecording}>
                <span class="record-slot"></span>
            </button>

            <button class="cassette-btn" on:click={playTracks}>
                <img src={play} alt='play' class="block w-4 h-4 mb-1.5">
                <span class="cassette-slot"></span>
            </button>

            <button class="cassette-btn" on:click={pauseTracks}>
                <img src={pause} alt='pause' class="block w-4 h-4 mb-1.5">
                <span class="cassette-slot"></span>
            </button>

            <button class="cassette-btn" on:click={rewindTracks}>
                <img src={back} alt='back' class="block w-4 h-4 mb-1.5">
                <span class="cassette-slot"></span>
            </button>

            <button class="cassette-btn">
                <img src={skip} alt='skip' class="block w-4 h-4 mb-1.5">
                <span class="cassette-slot"></span>
            </button>

            <button
                class="cassette-btn"
                style={`background: ${$isLoopMode ? '#eab308' : 'rgb(60,59,55)'}`}
                on:click={toggleLoopMode}
            >
                <img src={loop} alt='loop' class="block w-4 h-4 mb-1.5">
                <span class="cassette-slot"></span>
            </button>
        </div>
     </div>

    <!-- track information (the blue bit in the middle; this is straight gore at the minute) -->
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

    <div class="flex-1"></div>

    <div class="flex-1 flex justify-center">

        <div class="flex-1 flex flex-col justify-center items-center scale-125 space-y-1">
            <div class="text-xs">Master Volume</div>
            <VolumeSlider />
        </div>

        <div class="flex bg-neutral-900 w-fit p-2 rounded-lg space-x-2">

            <button class="cassette-btn">
                <img src={snip} alt='snip' class="block w-4 h-4 mb-1.5">
                <span class="cassette-slot"></span>
            </button>

            <button class="cassette-btn" on:click={toggleMixingDeck}>
                <img src={mixer} alt='mixer' class="block w-4 h-4 mb-1.5">
                <span class="cassette-slot"></span>
            </button>

            <button class="cassette-btn">
                <img src={metronome} alt='metronome' class="block w-4 h-4 mb-1.5">
                <span class="cassette-slot"></span>
            </button>

        </div>
    </div>
</nav>

<style>
    .record-btn {
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
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;

        background-image: none;

        background-color: rgb(0, 74, 112);
        color: rgb(5, 166, 244);

        border: none;

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
        -moz-appearance: textfield;

        background-color: rgb(0, 74, 112);

        color: rgb(5, 166, 244);

        border: none;

        font-size: 20px;

        line-height: 1;

        padding: 0;

        border-radius: 4px;

        outline: none;

        width: 3ch;

        text-align: center;

        padding-top: 2px;
    }
</style>