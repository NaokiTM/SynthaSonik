//This is where the "global" stuff is (functions and variables that are updated in multiple components)

import { derived, writable } from "svelte/store";
import keys from '$lib/assets/keys.png'
import drum from '$lib/assets/drum.png'
import mic from '$lib/assets/mic.png'
import guitar from '$lib/assets/guitar.png'

let nextId = 0;

// optional inputs
export type CreateTrackInput = {
    instrument: string;
    instrumentIcon: string;
    trackName?: string;
    sample?: string | null;
    color?: string;
};

// new structure with empty tracks array to begin with, being able to add with the createTrack function

export function createTrack(config: CreateTrackInput): Track {
    const id = nextId++;

    return {
        id,
        trackName: config.trackName ?? `${config.instrument}${id + 1}`,
        instrument: config.instrument,
        instrumentIcon: config.instrumentIcon,
        sample: config.sample ?? null,
        color: config.color ?? "#ff4400",
        volume: 50,
        pan: 50,
        panAngle: 0,
        muted: false,
        soloed: false,
        regions: []
    };
}

export type Track = {
    id: number;
    trackName: string;
    instrument: string;
    instrumentIcon: string;
    sample: any;
    color: string;
    volume: number;
    pan: number;
    panAngle: number;
    muted: boolean;
    soloed: boolean;
    regions: any[];
};

export const TracksArray = writable<Track[]>([]);

// Derive instrument counts from TracksArray automatically
export const instrumentCounts = derived(TracksArray, ($tracks) => {
    const counts: Record<string, number> = {};

    $tracks.forEach(track => {
        counts[track.instrument] = (counts[track.instrument] || 0) + 1;
    });

    return counts;
});


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
export function toggleMute(id: number) {
  TracksArray.update(tracks => {
    const soloActive = tracks.some(t => t.soloed);

    return tracks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          muted: !t.muted,
          soloed: soloActive ? false : t.soloed
        };
      }

      // if solo was active and user interacts, cancel solo system-wide
      if (soloActive) {
        return {
          ...t,
          soloed: false,
          muted: false
        };
      }

      return t;
    });
  });
}

// toggle solo function (mute every track excluding this track)
export function toggleSolo(id: number) {
  TracksArray.update(tracks => {
    const clicked = tracks.find(t => t.id === id);
    const isAlreadySoloed = clicked?.soloed;

    return tracks.map(t => {
      if (isAlreadySoloed) {
        // turn SOLO OFF → restore normal mute state
        return {
          ...t,
          soloed: false,
          muted: false
        };
      }

      // turn SOLO ON
      return {
        ...t,
        soloed: t.id === id,
        muted: t.id !== id
      };
    });
  });
}

//We open the mixing deck from the control bar on the right, hence why this function is in the file
export function toggleMixingDeck() {
    mixingDeckHidden.update(value => !value);    
}

// change the volume of a track 
export function changeVolume(id: number, newVolume: number) {
  TracksArray.update(tracks =>
    tracks.map(t => t.id === id ? { ...t, volume: newVolume } : t)
  );
}

// change the pan level of a track
export function changePanLevel(id: number, newPan: number) {
  TracksArray.update(tracks =>
    tracks.map(t => t.id === id ? { ...t, pan: newPan } : t)
  );
}


//Change instrument
export function setInstrument(id: number, instrument: string) {
  TracksArray.update(tracks =>
    tracks.map(t => t.id === id ? { ...t, instrument } : t)
  );
}
