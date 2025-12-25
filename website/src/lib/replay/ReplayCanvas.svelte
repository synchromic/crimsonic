<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { clear, drawMapFrame, drawReplayFrame, register } from "./canvas";
  import { Replay } from "./replay";
  import { playbackState } from "../playbackState.svelte";

  let { replay }: { replay: Replay } = $props();

  let canvas: HTMLCanvasElement;
  let animationFrame: number | null = null;

  function draw(t: number) {
    clear();
    drawMapFrame(t, 0, 300);
    drawReplayFrame(replay, t, 0, 300);
    animationFrame = null;
  }

  function scheduleDraw(t: number) {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    requestAnimationFrame(() => draw(t));
  }

  onMount(() => {
    register(canvas);
    updateSize();
  });

  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });

  $effect(() => {
    scheduleDraw(playbackState.time);
  });

  function updateSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
</script>

<canvas bind:this={canvas} onresize={updateSize}>
  Javascript is not supported in your browser.
</canvas>

<style>
</style>
