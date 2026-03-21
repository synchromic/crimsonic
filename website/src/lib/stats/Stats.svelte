<script lang="ts">
  import { playbackState } from "../playbackState.svelte";
  import { msToNote, ReplayScore, type Replay } from "../replay/replay";
  import AccPieChart from "./AccPieChart.svelte";

  // be careful that size does not change whether visible or not
  const { replay, visible }: { replay: Replay; visible: boolean } = $props();

  function formatDate(date: Date) {
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  let curIndex = $derived(Math.floor(msToNote(playbackState.time)));
  let judgements = $derived(replay.scorePrefixSums.queryAll(curIndex));
</script>

<div id="container">
  <div>{formatDate(replay.date)}</div>
  <div>
    {(replay.accuracy * 100).toFixed(2)}%, {replay.judgements.miss} misses
  </div>
  <div>
    {#if visible}
      <!-- pie chart is pretty laggy so make sure to hide if unseen -->
      <AccPieChart size={120} {judgements} />
    {:else}
      <div style="width: 120px; height: 120px"></div>
    {/if}
  </div>
</div>

<style>
  #container {
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: center;
  }
</style>
