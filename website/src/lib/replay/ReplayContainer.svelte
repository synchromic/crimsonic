<script lang="ts">
  import replays from "../../assets/replays.json";
  import { Replay } from "./replay";
  import ReplayCanvas from "./ReplayCanvas.svelte";
  import ReplayRow from "./ReplayRow.svelte";

  let testReplay = new Replay(replays[0]);
</script>

<div id="outer">
  <div id="rows"><ReplayRow replay={testReplay} /></div>
  <div id="canvas"><ReplayCanvas /></div>
</div>

<style>
  #outer {
    display: flex;
    flex-direction: row;
  }

  #canvas {
    flex-grow: 1;
    margin-left: 5px;
  }
</style>
