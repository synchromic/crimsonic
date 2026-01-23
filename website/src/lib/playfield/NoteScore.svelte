<script lang="ts">
  import { ReplayScore } from "../replay/replay";
  import { noteWidth } from "./playfield";

  const { score, x, nextX }: { score: ReplayScore; x: number; nextX?: number } =
    $props();

  const hue = $derived.by(() => {
    switch (score) {
      case ReplayScore.Great:
        return 265;
      case ReplayScore.Ok:
        return 145;
      case ReplayScore.Miss:
        return 30;
    }
  });
  const color = $derived(`oklch(0.64 0.19 ${hue} / 50%)`);

  // notes aren't actually totally evenly spaced so we need to adjust width
  // to prevent 1-pixel overlaps/gaps
  const startX = $derived(Math.floor(x - noteWidth / 2));
  const endX = $derived(
    nextX ? Math.floor(nextX - noteWidth / 2) : startX + noteWidth,
  );
  const width = $derived(endX - startX);
</script>

<rect x={startX} y={0} {width} height={100} fill={color} />
