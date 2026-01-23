<script lang="ts">
  import { onMount } from "svelte";
  import type { Replay } from "../replay/replay";
  import { receptorX, visibleBarlines, visibleNotes } from "./playfield";
  import { playbackState } from "../playbackState.svelte";
  import Note from "./Note.svelte";
  import NoteScore from "./NoteScore.svelte";

  let { replay, visible }: { replay: Replay; visible: boolean } = $props();

  let container: HTMLDivElement;
  let containerWidth = $state(800);
  let containerHeight = $state(100);
  let svgWidth = $derived((containerWidth / containerHeight) * 100);

  let barlines = $derived.by(() =>
    visibleBarlines(playbackState.time, svgWidth),
  );
  let notes = $derived.by(() =>
    visibleNotes(replay, playbackState.time, svgWidth),
  );

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
      <!-- receptor -->
      <circle
        cx={receptorX}
        cy={50}
        r={26}
        fill="none"
        stroke="#777777"
        stroke-width={3}
      />
      {#each notes as note, index (note.index)}
        <NoteScore score={note.score} x={note.x} nextX={notes[index - 1]?.x} />
      {/each}
      {#each barlines as barX}
        <line
          x1={barX}
          y1={0}
          x2={barX}
          y2={100}
          stroke="#FFFFFF"
          stroke-width={2}
        />
      {/each}
      {#each notes as note (note.index)}
        <Note {...note} />
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
