<script lang="ts">
  import ReplayCanvas from "./lib/replay/ReplayCanvas.svelte";
  import replays from "./assets/replays.json";
  import { Replay } from "./lib/replay/replay";
  import Scrubber from "./lib/Scrubber.svelte";
  import Stats from "./lib/replay/Stats.svelte";
  import Audio from "./lib/Audio.svelte";
  import ReplayPicker from "./lib/ReplayPicker.svelte";
  import { pickedReplay } from "./lib/pickerState.svelte";

  let testReplay = new Replay(
    replays.find((r) => r.date === "2025-03-13 01:34:52.675568+00:00")!,
  );
</script>

<main>
  <p>hello!</p>
</main>
<Audio playingReplay={pickedReplay.replay ?? undefined} />
<ReplayPicker />
<br />
{#if pickedReplay.replay}
  <Scrubber />
  <Stats replay={pickedReplay.replay} />
  <ReplayCanvas replay={pickedReplay.replay} />
{/if}
