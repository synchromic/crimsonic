<script lang="ts">
  import { onMount } from "svelte";
  import type { Replay } from "./replay";
  import Stats from "./Stats.svelte";
  import { containerState } from "./containerState.svelte";
  import Playfield from "../playfield/Playfield.svelte";

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
</script>

<div class="stats" bind:this={container}>
  <div>{replayName(replay)}</div>
  <Stats {replay} />
</div>
<div class="playfield">
  <Playfield />
</div>

<style>
  .stats {
    border: 1px solid;
    padding: 5px;
    box-sizing: border-box;
  }

  .playfield {
    flex-grow: 1;
  }
</style>
