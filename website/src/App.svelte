<script lang="ts">
  import Scrubber from "./lib/Scrubber.svelte";
  import Audio from "./lib/Audio.svelte";
  import { options } from "./lib/options.svelte";
  import ReplayContainer from "./lib/replay/ReplayContainer.svelte";

  import autoReplayJSON from "./assets/auto_replay.json";
  import { Replay } from "./lib/replay/replay";
  import Background from "./lib/background/Background.svelte";
  import Playfield from "./lib/playfield/Playfield.svelte";

  const autoReplay = new Replay(autoReplayJSON);
  // TODO: get hovered replay to play hitsounds
</script>

<Background />
<main>
  <p>hello!</p>
  <Playfield />
  <Audio playingReplay={autoReplay} />
  <div>
    <label for="flyInput">Fly notes?</label>
    <input type="checkbox" id="flyInput" bind:checked={options.flyNotes} />
  </div>
  <Scrubber />
  <ReplayContainer />
</main>

<style>
  main {
    width: 90%;
    height: 100%;
    padding: 0 10px;
    margin: auto;
    display: flex;
    flex-direction: column;
    border-left: 1px solid #cc5500;
    border-right: 1px solid #cc5500;
    backdrop-filter: blur(10px);
  }
</style>
