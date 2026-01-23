<script lang="ts">
  import { noteToMs, ReplayScore } from "../replay/replay";
  import { msToPos, noteWidth } from "./playfield";

  const { t, score, index }: { t: number; score: ReplayScore; index: number } =
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
  const x = $derived(Math.floor(msToPos(t, noteToMs(index)) - noteWidth / 2));
  const nextX = $derived(
    Math.floor(msToPos(t, noteToMs(index + 1)) - noteWidth / 2),
  );
  const width = $derived(nextX - x);
</script>

<rect {x} y={0} {width} height={100} fill={color} />
