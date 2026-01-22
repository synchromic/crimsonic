<script lang="ts">
  import { onMount } from "svelte";
  import type { Replay } from "../replay/replay";
  import { visibleNotes } from "./playfield";
  import { playbackState } from "../playbackState.svelte";
  import Circle from "./Circle.svelte";

  let { replay, visible }: { replay: Replay; visible: boolean } = $props();

  let container: HTMLDivElement;
  let containerWidth = $state(800);
  let containerHeight = $state(100);
  let svgWidth = $derived((containerWidth / containerHeight) * 100);

  let notes = $derived.by(() => {
    return visibleNotes(playbackState.time, svgWidth);
  });

  function onresize() {
    containerWidth = container.clientWidth;
    containerHeight = container.clientHeight;
  }

  onMount(() => {
    onresize();
  });
</script>

<svelte:window {onresize} />

<div bind:this={container}>
  {#if visible}
    <svg
      width={containerWidth}
      height={containerHeight}
      preserveAspectRatio="none"
      viewBox={"0 0 " + svgWidth + " 100"}
    >
      {#each notes as note (note.index)}
        <Circle x={note.x} kind={note.kind} />
      {/each}
    </svg>
  {/if}
</div>

<style>
  div {
    overflow: hidden;
    height: 100%;
    min-height: 50px;
  }
</style>
