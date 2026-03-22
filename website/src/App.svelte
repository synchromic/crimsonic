<script lang="ts">
  import Scrubber from "./lib/Scrubber.svelte";
  import Audio from "./lib/Audio.svelte";
  import { options } from "./lib/options.svelte";
  import ReplayContainer from "./lib/replay/ReplayContainer.svelte";

  import autoReplayJSON from "./assets/gen/auto_replay.json";
  import { Replay } from "./lib/replay/replay";
  import Background from "./lib/background/Background.svelte";
  import Header, { HEADER_HEIGHT } from "./lib/header/Header.svelte";

  const autoReplay = new Replay(autoReplayJSON);
  // TODO: get hovered replay to play hitsounds
</script>

<Background />
<Header />
<main style="margin-top: {-HEADER_HEIGHT}px; padding-top: {HEADER_HEIGHT}px">
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
    box-sizing: border-box;
    height: 100vh;
    width: 100%;
    padding-left: 10px;
    padding-right: 10px;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(10px);
  }
</style>
