<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { clear, drawFrame, register } from "./canvas";

  let canvas: HTMLCanvasElement;

  let curFrame = 12000;
  let curTime = 0;
  let animationFrame: number | null = null;

  function draw() {
    const newTime = Date.now();
    const dt = newTime - curTime;
    curFrame += dt;
    clear();
    drawFrame(curFrame, 0, 300);
    curTime = newTime;
    animationFrame = requestAnimationFrame(draw);
  }

  onMount(() => {
    register(canvas);
    updateSize();
    curTime = Date.now();
    draw();
  });

  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
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
