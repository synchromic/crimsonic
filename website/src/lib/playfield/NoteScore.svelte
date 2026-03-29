<script lang="ts">
  import { noteToMs, ReplayScore } from "../replay/replay";
  import { msToPos, noteWidth, scoreColor } from "./playfield";

  const { score, index }: { score: ReplayScore; index: number } = $props();

  const color = $derived(scoreColor(score, "50%"));

  // notes aren't actually totally evenly spaced so we need to adjust width
  // to prevent 1-pixel overlaps/gaps
  const x = $derived(Math.floor(msToPos(noteToMs(index)) - noteWidth / 2));
  const nextX = $derived(
    Math.floor(msToPos(noteToMs(index + 1)) - noteWidth / 2),
  );
  const width = $derived(nextX - x);
</script>

<rect
  {x}
  y={0}
  {width}
  height={100}
  fill={color}
  style="pointer-events: none;"
/>
