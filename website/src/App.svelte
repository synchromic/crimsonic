<script lang="ts">
  import ReplayCanvas from "./lib/replay/ReplayCanvas.svelte";
  import replays from "./assets/replays.json";
  import { Replay } from "./lib/replay/replay";

  let testReplay = new Replay(replays[replays.length - 1]);
</script>

<main>
  <p>hello!</p>
</main>
<ReplayCanvas replay={testReplay} />
