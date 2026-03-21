<script lang="ts">
  import Scrubber from "./lib/Scrubber.svelte";
  import Audio from "./lib/Audio.svelte";
  import { options } from "./lib/options.svelte";
  import ReplayContainer from "./lib/replay/ReplayContainer.svelte";

  import autoReplayJSON from "./assets/gen/auto_replay.json";
  import { Replay } from "./lib/replay/replay";
  import Background from "./lib/background/Background.svelte";
  import Header from "./lib/Header.svelte";

  const autoReplay = new Replay(autoReplayJSON);
  // TODO: get hovered replay to play hitsounds
</script>

<Background />
<Header />
<main>
  <p>hello!</p>
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
    padding: 0 10px;
    margin: auto;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--red-border);
    border-right: 1px solid var(--red-border);
    backdrop-filter: blur(10px);
  }
</style>
