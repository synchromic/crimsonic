<script lang="ts">
  import Scrubber from "./lib/Scrubber.svelte";
  import Audio from "./lib/audio/Audio.svelte";
  import ReplayContainer from "./lib/replay/ReplayContainer.svelte";

  import autoReplayJSON from "./assets/gen/auto_replay.json";
  import { Replay } from "./lib/replay/replay";
  import Background from "./lib/background/Background.svelte";
  import Header from "./lib/header/Header.svelte";
  import TabContainer from "./lib/tabs/TabContainer.svelte";

  const autoReplay = new Replay(autoReplayJSON);
  // TODO: get hovered replay to play hitsounds
</script>

<Background />
<Audio playingReplay={autoReplay} />
<div id="body">
  <Header />
  <main>
    <TabContainer />
    <ReplayContainer />
  </main>
</div>

<style>
  #body {
    height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(10px);
  }

  main {
    flex: 1 1 0;
    height: auto;
    display: flex;
    flex-direction: column;
  }
</style>
