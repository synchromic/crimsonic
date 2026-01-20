<script lang="ts">
  import { onMount } from "svelte";
  import { ShaderInstance } from "./shader";
  let canvas: HTMLCanvasElement;
  let instance: ShaderInstance;

  function onresize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  onMount(() => {
    onresize();
    instance = new ShaderInstance(canvas);
  });
</script>

<svelte:window {onresize} />

<canvas bind:this={canvas}></canvas>

<style>
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
  }
</style>
