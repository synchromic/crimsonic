<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { clear, drawReplayFrame, register } from "./canvas";
  import { Replay } from "./replay";
  import { playbackState } from "../playbackState.svelte";

  let { replay }: { replay: Replay } = $props();

  let canvas: HTMLCanvasElement;

  function draw(time: number) {
    clear();
    drawReplayFrame(replay, time, 0, 300);
  }

  onMount(() => {
    register(canvas);
    updateSize();
  });

  $effect(() => {
    draw(playbackState.time);
  });

  function updateSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
</script>

<canvas bind:this={canvas} onresize={updateSize}>
  Javascript is not supported in your browser.
</canvas>
