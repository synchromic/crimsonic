<script lang="ts">
  import { onMount } from "svelte";
  import { draw, register, resize } from "./canvas.svelte";
  import { playbackState } from "../playbackState.svelte";

  let canvas: HTMLCanvasElement;
  let { scrollTop }: { scrollTop: number | undefined } = $props();

  onMount(() => {
    register(canvas);
  });

  $effect(() => {
    scrollTop;
    draw(playbackState.time);
  });

  function onresize() {
    resize(canvas);
    draw(playbackState.time);
  }
</script>

<svelte:window {onresize} />

<div>
  <canvas bind:this={canvas}>
    Javascript is not supported in your browser.
  </canvas>
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
