<script lang="ts">
  import { onMount } from "svelte";
  import { playbackState } from "./playbackState.svelte";

  let element: HTMLAudioElement;

  const audioCtx = new AudioContext();
  let source: MediaElementAudioSourceNode | undefined;

  onMount(() => {
    source = audioCtx.createMediaElementSource(element);
    source.connect(audioCtx.destination);
  });

  $effect(() => {
    if (playbackState.status === "playing") {
      element.play();
    } else {
      element.pause();
    }
  });

  $effect(() => {
    if (playbackState.status !== "playing") {
      element.currentTime = playbackState.time / 1000;
    }
  });
</script>

<audio src="audio.ogg" bind:this={element}></audio>
