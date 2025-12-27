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
      playbackState.setStatus("playingGrabbed");
    }
  }

  function onmouseup() {
    if (playbackState.status === "playingGrabbed") {
      playbackState.setStatus("playing");
    }
  }

  $effect(() => {
    if (playbackState.status === "playing") {
      value = playbackState.time;
    }
  });
</script>

{#if playbackState.status === "playing" || playbackState.status === "playingGrabbed"}
  <button
    onclick={() => {
      playbackState.setStatus("paused");
    }}>Pause</button
  >
{:else if playbackState.status === "paused"}
  <button
    onclick={() => {
      playbackState.setStatus("playing");
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
