
<script>
    import plus from '$lib/assets/plus.png'
    import keys from '$lib/assets/keys.png'
    import { noOfTracks, TracksArray } from "$lib/stores"

    function addTrack() {
        TracksArray.update(arr => {
            let maxId = arr.length ? Math.max(...arr.map(t => t.id)) : 0; //calculates last index of the array where length is non zero
            let nextId = maxId + 1;            //calculate index for the next tracks id
            return [   //Return a copy of the previous tracks array + object for the track to be added
                ...arr, 
                {id: nextId, instrument: "keys", sample: null, instrumentIcon: keys, color: "#00bf00", muted: false, regions: []}  //allow user to choose instrument before adding a track (do later)
            ]
        })
        $noOfTracks++
    }
</script>


<div class="h-5 w-full bg-neutral-500">

    <!--button to add a new track-->
    <button class="h-full">   
        <img src={plus} alt='add' class="hover:cursor-pointer" onclick={addTrack}>
    </button>
</div>