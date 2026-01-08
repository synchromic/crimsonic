<script lang="ts">
  import { onMount } from "svelte";
  import type { Replay } from "./replay";
  import { addReplayRow } from "./canvas.svelte";
  import Stats from "./Stats.svelte";

  let { replay, visible }: { replay: Replay; visible: boolean } = $props();
  let container: HTMLDivElement;

  function formatDate(date: Date) {
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function replayName(replay: Replay) {
    const date = formatDate(new Date(replay.date));
    const accuracy = (replay.accuracy * 100).toFixed(2);
    const misses = replay.judgements.miss;
    return `${date} (${accuracy}%, ${misses} misses)`;
  }

  onMount(() => {
    addReplayRow({
      replay,
      getH() {
        return container.getBoundingClientRect().height;
      },
      getY() {
        return container.getBoundingClientRect().top;
      },
      isVisible() {
        return visible;
      },
    });
  });
</script>

<div id="outer" bind:this={container}>
  <div>{replayName(replay)}</div>
  <Stats {replay} />
</div>

<style>
  #outer {
    border: 1px solid;
    padding: 5px;
    box-sizing: border-box;
    /* this is annoying to have but css doesn't seem to have a way to make 
       each row height the same inside a scrollable container */
    min-height: 150px;
  }
</style>
