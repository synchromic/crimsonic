<script lang="ts">
  import NoteMiss from "./NoteMiss.svelte";
  import type { SVGNote } from "./playfield";

  const { kind, x, y, transparent, showMiss }: SVGNote = $props();

  const hue = $derived(kind === "d" ? "25" : "270");
  const alpha = $derived(transparent ? " / 20%" : "");
  const color = $derived(`oklch(0.45 0.2 ${hue}${alpha})`);
  const strokeColor = $derived(`oklch(1 0 0${alpha})`);
</script>

<circle
  cx={x}
  cy={y}
  r={20}
  fill={color}
  stroke={strokeColor}
  stroke-width={3}
/>
{#if showMiss}
  <NoteMiss {x} />
{/if}
