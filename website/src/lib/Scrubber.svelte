<script lang="ts">
  import map from "../assets/map.json";
  import { playbackState } from "./playbackState.svelte";

  let mapLen = (map.data.length / 4) * map.ms_per_beat;

  let value = $state(0);

  function oninput() {
    if (
      playbackState.status === "paused" ||
      playbackState.status === "playingGrabbed"
    ) {
      playbackState.time = map.start_offset + value;
    }
  }

  function onmousedown() {
    if (playbackState.status === "playing") {
      playbackState.status = "playingGrabbed";
    }
  }

  function onmouseup() {
    if (playbackState.status === "playingGrabbed") {
      playbackState.status = "playing";
    }
  }

  $effect(() => {
    if (playbackState.status === "playing") {
      value = playbackState.time;
    }
  });
</script>

{#if !playbackState.ready}
  Loading...
{:else if playbackState.status === "playing" || playbackState.status === "playingGrabbed"}
  <button
    onclick={() => {
      playbackState.status = "paused";
    }}>Pause</button
  >
{:else if playbackState.status === "paused"}
  <button
    onclick={() => {
      playbackState.status = "playing";
    }}>Play</button
  >
{/if}
<input
  type="range"
  min={0}
  max={mapLen}
  step="any"
  {oninput}
  {onmousedown}
  {onmouseup}
  bind:value
  style="width: 100%;"
/>
