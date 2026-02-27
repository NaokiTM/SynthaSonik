//This is where the "global" stuff is (functions and variables that are updated in multiple components)

import { derived, writable } from "svelte/store";
import keys from '$lib/assets/keys.png'


//Need help differentiating if this sets the default header stuff when I create a new track, or if its the function in trackoptions.
export const TracksArray = writable([
  {
    id: 0,
    instrument: "keys",
    instrumentIcon: keys,
    sample: null,
    color: "#00bf00", //default color for track
    muted: false,
    regions: [  //start with no regions initially
      // { 
      //   barNo: 0,   //which bar the region is in
      //   length: 0,  //Length of the region
      //   notes: [
      //     {
      //       //AT THE MOMENT, EACH NOTE FITS EXACTLY ONE BAR. ADD WHEN NOTE LENGTHS CHANGE noteId: 1,   //the id of the note is how many across it is generally. it will be played in sequence of the id
      //       pos: 1,    //pos is the number of keys down the note is (which note is being played out of the 8 octaves),length is the amount of space it takes  up in a bar
      //       //POS CAN GO UP TO 12 X 8 = 72.  
      //       // length: 1
      //     }
      //   ],
      // },
    ],
  },
]);




//Global states for song information
export const noOfBars = writable(4)   //Initial no. of bars
export const tempo = writable(120)
export const keySig = writable("c")  //root note for key sig
export const tonality = writable("major")   //major or minor key
export const accidental = writable("")  //is key signature sharp or flat (default neither)
export const octave = writable(0) //how many octaves above base is the key (default none)
export const timeSig = writable("4/4")

//information about current state of the song
export const caretPos = writable(0)  //Initial position of the track caret
export const caretHeaderWidth = writable(1)


// export const currentBar = writable(1)   //bar number 1 (or zero for zero indexing purposes? idk)
export const currentBar = derived(
  // @ts-ignore
  [caretPos, caretHeaderWidth, noOfBars],
  // @ts-ignore
  ([$caretPos, $caretHeaderWidth, $noOfBars]) => {
    const barWidth = $caretHeaderWidth / $noOfBars;
    let index = Math.floor($caretPos / barWidth);
    index = Math.max(0, Math.min($noOfBars - 1, index)) + 1; //+1 for proper indexing
    return index;
  }
);

//info about track states
export const currentBeat = writable(1)   //which beat the caret is above / playing
export const isPlaying = writable(false)   //Tracks whether the tracks are being played or not (and whether the caret should be moving)
export const whichMidiTrackOpen = writable(0)  //stores which track is open in the midi editor. 0 if none of them open? 
export const isLoopMode = writable(false)
export const loopedBars = writable([])

//number of tracks
export const noOfTracks = writable(0)

//booleans for toggling extra editors
export const mixingDeckHidden = writable(true)
export const midiEditorHidden = writable(true)

//Toggle mute on a specific track
export function toggleMute(id) {
  TracksArray.update(tracks =>
    tracks.map(t => t.id === id ? { ...t, muted: !t.muted } : t)
  );
}

//Change instrument
export function setInstrument(id, instrument) {
  TracksArray.update(tracks =>
    tracks.map(t => t.id === id ? { ...t, instrument } : t)
  );
}
