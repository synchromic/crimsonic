<script lang="ts">
  import replays from "../assets/replays.json";
  import { pickedReplay } from "./pickerState.svelte";
  import { Replay } from "./replay/replay";

  let picked: string | null = $state(null);

  $effect(() => {
    const jsonReplay = replays.find((replay) => replay.date === picked);
    pickedReplay.replay = jsonReplay ? new Replay(jsonReplay) : null;
  });
</script>

<label for="replaySelect">Pick a replay: </label>
<select id="replaySelect" bind:value={picked}>
  <option value={null} selected></option>
  {#each replays as replay}
    <option value={replay.date}>{replay.date}</option>
  {/each}
</select>
