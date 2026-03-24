<script lang="ts">
  import { gains } from "../audio/audio";
  import VolumeSlider from "../audio/VolumeSlider.svelte";
  import { options } from "../options.svelte";
</script>

<div style="padding: 10px;">
  <label for="flyInput">Fly notes?</label>
  <input type="checkbox" id="flyInput" bind:checked={options.flyNotes} />

  <VolumeSlider id="master" initial={0.3} label="Master volume" />
  <VolumeSlider id="music" initial={1} label="Music volume" />
  <VolumeSlider id="effect" initial={0.8} label="Hitsound volume" />
</div>
