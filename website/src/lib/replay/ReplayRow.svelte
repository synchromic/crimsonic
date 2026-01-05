<script lang="ts">
  import { onMount } from "svelte";
  import type { Replay } from "./replay";
  import { addReplayRow } from "./canvas.svelte";
  import Stats from "./Stats.svelte";

  let { replay }: { replay: Replay } = $props();
  let container: HTMLDivElement;

  onMount(() => {
    addReplayRow({
      replay,
      getH() {
        return container.getBoundingClientRect().height;
      },
      getY() {
        return container.getBoundingClientRect().top;
      },
    });
  });
</script>

<div bind:this={container}>
  <Stats {replay} />
</div>

<style>
  div {
    width: 100%;
    height: 100%;
    min-height: 200px;
    border: 1px solid;
    padding: 5px;
    box-sizing: border-box;
  }
</style>
