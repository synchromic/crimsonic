<script lang="ts">
  import replays from "../assets/replays.json";
  import autoReplay from "../assets/auto_replay.json";
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
    const date = formatDate(new Date(replay.timestamp));
    const accuracy = (replay.accuracy * 100).toFixed(2);
    const misses = replay.judgements.miss;
    return `${date} (${accuracy}%, ${misses} misses)`;
  }

  function oninput(event: Event) {
    const target = event.target as HTMLSelectElement;
    let jsonReplay: JSONReplay | undefined;
    if (target.value === "auto") {
      jsonReplay = autoReplay;
    } else {
      jsonReplay = replays.find((replay) => replay.timestamp === target.value);
    }
    pickedReplay.replay = jsonReplay ? new Replay(jsonReplay) : null;
  }

  $effect(() => {});
</script>

<div>
  <label for="replaySelect">Pick a replay: </label>
  <select id="replaySelect" bind:value={picked} {oninput}>
    <option value={null} selected></option>
    <option value="auto">Auto</option>
    {#each replays as replay}
      <option value={replay.timestamp}>{formatReplay(replay)}</option>
    {/each}
  </select>
</div>
