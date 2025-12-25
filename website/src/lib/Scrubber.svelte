<script lang="ts">
  import map from "../assets/map.json";
  import { playbackState } from "./playbackState.svelte";

  let mapLen = (map.data.length / 4) * map.ms_per_beat;

  function updateScrubber(event: Event) {
    const target = event.target as HTMLInputElement;
    const inputValue = parseFloat(target.value);
    playbackState.time = inputValue + map.start_offset;
  }
</script>

<input
  type="range"
  min={0}
  max={mapLen}
  step="any"
  oninput={updateScrubber}
  style="width: 100%;"
/>
