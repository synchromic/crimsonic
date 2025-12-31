<script lang="ts">
  import { playbackState } from "../playbackState.svelte";
  import { msToBeat } from "./canvas";
  import { ReplayScore, type Replay } from "./replay";

  const { replay }: { replay: Replay } = $props();

  let curIndex = $derived(Math.floor(msToBeat(playbackState.time) * 4));
  let greats = $derived(
    replay.scorePrefixSums.query(ReplayScore.Great, curIndex),
  );
  let oks = $derived(replay.scorePrefixSums.query(ReplayScore.Ok, curIndex));
  let misses = $derived(
    replay.scorePrefixSums.query(ReplayScore.Miss, curIndex),
  );
  let accuracy = $derived(((greats + oks / 3) / (greats + oks + misses)) * 100);
</script>

<div>
  <table>
    <tbody>
      <tr>
        <th>Accuracy</th>
        <th>300s</th>
        <th>100s</th>
        <th>Misses</th>
      </tr>
      <tr>
        <td>{accuracy.toFixed(2)}</td>
        <td>{greats}</td>
        <td>{oks}</td>
        <td>{misses}</td>
      </tr>
    </tbody>
  </table>
</div>

<style>
  div {
    margin: 10px 0;
  }

  table,
  th,
  td {
    border: 1px solid;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 5px;
  }
</style>
