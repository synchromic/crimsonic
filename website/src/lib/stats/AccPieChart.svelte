<script lang="ts">
  import { scoreColor } from "../playfield/playfield";
  import {
    judgementsToAcc,
    ReplayScore,
    type Judgements,
  } from "../replay/replay";
  import AccPieChartArc from "./AccPieChartArc.svelte";

  let { size, judgements }: { size: number; judgements: Judgements } = $props();
  let accuracy = $derived(judgementsToAcc(judgements));
  let accText = $derived(accuracy.toFixed(2) + "%");
  let total = $derived(judgements["300"] + judgements["100"] + judgements.miss);
</script>

<svg width={size} height={size} viewBox="-1 -1 2 2">
  {#if total === 0}
    <circle r="1" fill="#888888" />
  {:else}
    <!-- ok and miss are more interesting so those are lined up with the top -->
    <AccPieChartArc
      fill={scoreColor(ReplayScore.Ok)}
      start={0}
      end={judgements["100"] / total}
    />
    <AccPieChartArc
      fill={scoreColor(ReplayScore.Great)}
      start={judgements["100"] / total}
      end={1 - judgements.miss / total}
    />
    <AccPieChartArc
      fill={scoreColor(ReplayScore.Miss)}
      start={1 - judgements.miss / total}
      end={1}
    />
    <text
      fill="#111"
      font-size="0.4px"
      font-weight="bold"
      dominant-baseline="middle"
      text-anchor="middle">{accText}</text
    >
  {/if}
</svg>
