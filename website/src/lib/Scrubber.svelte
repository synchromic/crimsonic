<script lang="ts">
  import map from "../assets/gen/map.json";
  import { playbackState } from "./playbackState.svelte";

  let mapLen = map.notes.length * map.ms_per_note;

  let value = $state(0);

  function oninput() {
    if (
      playbackState.status === "paused" ||
      playbackState.status === "playingGrabbed"
    ) {
      playbackState.setTime(map.start_offset + value);
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

<div>
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
</div>

<style>
  div {
    display: flex;
    margin: 10px 0;
  }

  button {
    min-width: 60px;
    margin-right: 10px;
  }
</style>
