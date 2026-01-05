<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { draw, register } from "./canvas.svelte";
  import { Replay } from "./replay";
  import { playbackState } from "../playbackState.svelte";

  let canvas: HTMLCanvasElement;
  let { scrollTop }: { scrollTop: number | undefined } = $props();

  onMount(() => {
    register(canvas);
    updateSize();
  });

  $effect(() => {
    scrollTop;
    console.log("drawing");
    draw(playbackState.time);
  });

  function updateSize() {
    canvas.width = canvas.parentElement!.clientWidth;
    canvas.height = canvas.parentElement!.clientHeight;
  }
</script>

<div>
  <canvas bind:this={canvas} onresize={updateSize}>
    Javascript is not supported in your browser.
  </canvas>
</div>

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
