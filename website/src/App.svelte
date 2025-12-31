<script lang="ts">
  import ReplayCanvas from "./lib/replay/ReplayCanvas.svelte";
  import replays from "./assets/replays.json";
  import { Replay } from "./lib/replay/replay";
  import Scrubber from "./lib/Scrubber.svelte";
  import Stats from "./lib/replay/Stats.svelte";
  import Audio from "./lib/Audio.svelte";
  import ReplayPicker from "./lib/ReplayPicker.svelte";
  import { pickedReplay } from "./lib/pickerState.svelte";
</script>

<p>hello!</p>
<Audio playingReplay={pickedReplay.replay ?? undefined} />
<ReplayPicker />
<br />
{#if pickedReplay.replay}
  <Stats replay={pickedReplay.replay} />
  <Scrubber />
  <ReplayCanvas replay={pickedReplay.replay} />
{/if}
