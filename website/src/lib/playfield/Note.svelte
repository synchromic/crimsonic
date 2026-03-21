<script lang="ts">
  import NoteMiss from "./NoteMiss.svelte";
  import type { SVGNote } from "./playfield";
  import { noteToMs, ReplayScore } from "../replay/replay";
  import { options } from "../options.svelte";
  import { playbackState } from "../playbackState.svelte";

  const { index, kind, x, score, event }: SVGNote = $props();

  function flyOffset(t: number, pressTime: number) {
    const peakTime = 300; // ms
    const timeSinceHit = t - pressTime;
    const ratio = timeSinceHit / peakTime;
    return -60 * (1 - (1 - ratio) * (1 - ratio));
  }

  function computeProps(t: number): {
    y: number;
    transparent: boolean;
    showMiss: boolean;
  } {
    if (event && event.pressTime <= t) {
      let y = 50;
      if (options.flyNotes && score !== ReplayScore.Miss) {
        y += flyOffset(t, event.pressTime);
      }
      return {
        y,
        transparent: score === ReplayScore.Miss || !options.flyNotes,
        showMiss: score === ReplayScore.Miss,
      };
    } else {
      return {
        y: 50,
        transparent: false,
        showMiss: score === ReplayScore.Miss && noteToMs(index) <= t,
      };
    }
  }

  let { y, transparent, showMiss } = $derived(computeProps(playbackState.time));

  const hue = $derived(kind === "d" ? "25" : "270");
  const alpha = $derived(transparent ? " / 20%" : "");
  const color = $derived(`oklch(0.45 0.2 ${hue}${alpha})`);
  const strokeColor = $derived(`oklch(1 0 0${alpha})`);
</script>

<circle
  cx={x}
  cy={y}
  r={25}
  fill={color}
  stroke={strokeColor}
  stroke-width={3}
/>
{#if showMiss}
  <NoteMiss {x} />
{/if}
