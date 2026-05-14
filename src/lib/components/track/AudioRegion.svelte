<!-- ************************************* -->
<!-- AUDIO REGION-->
<!-- a single audio region component taking the track and region its in as paramters-->
<!-- ************************************* -->

<script>
    export let region;
    export let track;
</script>

<div class="w-full h-full resize rounded-md" style="background-color: {track?.color || '#666'}">
</div>