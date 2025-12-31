<script lang="ts">
  import replays from "../assets/replays.json";
  import { pickedReplay } from "./pickerState.svelte";
  import { Replay, type JSONReplay } from "./replay/replay";

  let picked: string | null = $state(null);

  function formatDate(date: Date) {
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatReplay(replay: JSONReplay) {
    const date = formatDate(new Date(replay.date));
    const accuracy = (replay.accuracy * 100).toFixed(2);
    const misses = replay.judgements.miss;
    return `${date} (${accuracy}%, ${misses} misses)`;
  }

  $effect(() => {
    const jsonReplay = replays.find((replay) => replay.date === picked);
    pickedReplay.replay = jsonReplay ? new Replay(jsonReplay) : null;
  });
</script>

<div>
  <label for="replaySelect">Pick a replay: </label>
  <select id="replaySelect" bind:value={picked}>
    <option value={null} selected></option>
    {#each replays as replay}
      <option value={replay.date}>{formatReplay(replay)}</option>
    {/each}
  </select>
</div>
