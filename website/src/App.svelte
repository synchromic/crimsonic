<script lang="ts">
  import Scrubber from "./lib/Scrubber.svelte";
  import Audio from "./lib/Audio.svelte";
  import { pickedReplay } from "./lib/pickerState.svelte";
  import { options } from "./lib/options.svelte";
  import ReplayContainer from "./lib/replay/ReplayContainer.svelte";
</script>

<p>hello!</p>
<Audio playingReplay={pickedReplay.replay ?? undefined} />
<br />
{#if pickedReplay.replay}
  <div>
    <label for="flyInput">Fly notes?</label>
    <input type="checkbox" id="flyInput" bind:checked={options.flyNotes} />
  </div>
  <Scrubber />
  <ReplayContainer />
{/if}
