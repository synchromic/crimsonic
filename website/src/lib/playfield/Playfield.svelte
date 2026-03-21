<script lang="ts">
  import { onMount } from "svelte";
  import type { Replay } from "../replay/replay";
  import {
    msToPos,
    receptorX,
    visibleBarlines,
    visibleEvents,
    visibleNotes,
  } from "./playfield";
  import { playbackState } from "../playbackState.svelte";
  import Note from "./Note.svelte";
  import NoteScore from "./NoteScore.svelte";
  import ReplayEvent from "./ReplayEvent.svelte";

  let { replay, visible }: { replay: Replay; visible: boolean } = $props();

  let container: HTMLDivElement;
  let containerWidth = $state(800);
  let containerHeight = $state(100);
  let svgWidth = $derived((containerWidth / containerHeight) * 100);

  let offsetX = $derived(-msToPos(playbackState.time) + receptorX);

  let barlines = $derived(visibleBarlines(playbackState.timeF, svgWidth));
  let notes = $derived(visibleNotes(replay, playbackState.timeF, svgWidth));
  let events = $derived(visibleEvents(replay, playbackState.timeF, svgWidth));

  function onresize() {
    containerWidth = container.clientWidth;
    containerHeight = container.clientHeight;
  }

  onMount(() => {
    onresize();
  });
</script>

<svelte:window {onresize} />

<div id="container" bind:this={container}>
  {#if visible}
    <svg
      width={Math.floor(containerWidth)}
      height={Math.floor(containerHeight)}
      preserveAspectRatio="none"
      viewBox={"0 0 " + svgWidth + " 100"}
    >
      <g transform={`translate(${offsetX} 0)`}>
        <!-- receptor -->
        <circle
          cx={msToPos(playbackState.time)}
          cy={50}
          r={31}
          fill="none"
          stroke="#777777"
          stroke-width={3}
        />
        {#each notes as note (note.index)}
          <NoteScore score={note.score} index={note.index} />
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
        {#each events as event (event.index)}
          <ReplayEvent {event} />
        {/each}
      </g>
    </svg>
  {/if}
</div>

<style>
  #container {
    position: relative;
    overflow: hidden;
    height: 100%;
    min-height: 50px;
  }

  svg {
    position: absolute;
    left: 0;
    top: 0;
  }
</style>
