<script lang="ts">
  import Scrubber from "./lib/Scrubber.svelte";
  import Audio from "./lib/Audio.svelte";
  import { options } from "./lib/options.svelte";
  import ReplayContainer from "./lib/replay/ReplayContainer.svelte";

  import autoReplayJSON from "./assets/auto_replay.json";
  import { Replay } from "./lib/replay/replay";

  const autoReplay = new Replay(autoReplayJSON);
  // TODO: get hovered replay to play hitsounds
</script>

<p>hello!</p>
<Audio playingReplay={autoReplay} />
<div>
  <label for="flyInput">Fly notes?</label>
  <input type="checkbox" id="flyInput" bind:checked={options.flyNotes} />
</div>
<Scrubber />
<ReplayContainer />
