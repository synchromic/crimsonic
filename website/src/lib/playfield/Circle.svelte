<script lang="ts">
  import type { SVGNote } from "./playfield";

  const { kind, x, transparent }: SVGNote = $props();

  const hue = $derived(kind === "d" ? "25" : "270");
  const alpha = $derived(transparent ? " / 20%" : "");
  const color = $derived(`oklch(0.45 0.2 ${hue}${alpha})`);
  const strokeColor = $derived(`oklch(1 0 0${alpha})`);
</script>

<circle
  cx={x}
  cy={50}
  r={20}
  fill={color}
  stroke={strokeColor}
  stroke-width={3}
/>
