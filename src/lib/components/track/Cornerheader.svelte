<!-- ************************************* -->
<!-- CORNER HEADER-->
<!-- just a grey box in the top left corner. the button to add an empty track is here. -->
<!-- ************************************* -->


<script>
    import plus from '$lib/assets/plus.png'
    import keys from '$lib/assets/keys.png'
    import { noOfTracks, TracksArray } from "$lib/stores"

    function addTrack() {
        TracksArray.update(arr => {

            //calculates the index of the last track added (number of tracks that currently exist basically)
            let maxId = arr.length ? Math.max(...arr.map(t => t.id)) : 0; 

            //calculate index for the to-be-added track (current last track + 1)
            let nextId = maxId + 1;            


            //Return a copy of the previous tracks array + object for the track to be added
            return [  
                ...arr, 
                {id: nextId, trackName: "keys", sample: null, instrumentIcon: keys, color: "#ff4400", volume: 50, pan: 50, panAngle: 0, muted: false, soloed: false, regions: []}  //allow user to choose instrument before adding a track (do later)
            ]
        })

        // once the track added update the counter for the tracks
        $noOfTracks++
    }
</script>


<div class="h-5 w-full bg-neutral-500">
    <!--button to add a new track-->
    <button class="h-full">   

        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <img src={plus} alt='add' class="hover:cursor-pointer" onclick={addTrack}>
    </button>
</div>