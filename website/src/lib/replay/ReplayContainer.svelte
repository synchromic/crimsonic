<script lang="ts">
  import jsonReplays from "../../assets/replays.json";
  import { Replay } from "./replay";
  import ReplayCanvas from "./ReplayCanvas.svelte";
  import ReplayRow from "./ReplayRow.svelte";

  let replays = jsonReplays.map((r) => new Replay(r));
  let elem: HTMLDivElement;
  let scrollTop = $state(0);

  function onscroll() {
    scrollTop = elem.scrollTop;
  }
</script>

<div id="outer" bind:this={elem} {onscroll}>
  <div id="rows">
    {#each replays as replay}
      <ReplayRow {replay} />
    {/each}
  </div>
  <div id="canvas"><ReplayCanvas {scrollTop} /></div>
</div>

<style>
  #outer {
    display: flex;
    flex-direction: row;
    max-width: 100%;
    max-height: 60vh;
    overflow-y: scroll;
    border: 1px solid;
    padding: 5px;
  }

  #canvas {
    flex-grow: 1;
    position: sticky;
    top: 0;
    margin-left: 5px;
  }
</style>
