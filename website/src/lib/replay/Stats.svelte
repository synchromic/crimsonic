<script lang="ts">
  import { playbackState } from "../playbackState.svelte";
  import { msToNote, ReplayScore, type Replay } from "./replay";

  const { replay }: { replay: Replay } = $props();

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

  let curIndex = $derived(Math.floor(msToNote(playbackState.time)));
  let greats = $derived(
    replay.scorePrefixSums.query(ReplayScore.Great, curIndex),
  );
  let oks = $derived(replay.scorePrefixSums.query(ReplayScore.Ok, curIndex));
  let misses = $derived(
    replay.scorePrefixSums.query(ReplayScore.Miss, curIndex),
  );
  let accuracy = $derived(((greats + oks / 3) / (greats + oks + misses)) * 100);
</script>

<div>{replayName(replay)}</div>
<div class="table-div">
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
  .table-div {
    margin-top: 10px;
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
