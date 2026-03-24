<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { playbackState } from "../playbackState.svelte";
  import type { Replay } from "../replay/replay";
  import VolumeSlider from "./VolumeSlider.svelte";
  import { audioCtx, gains } from "./audio";

  let { playingReplay }: { playingReplay?: Replay } = $props();
  let element: HTMLAudioElement;

  // purely based off vibes
  const hitsoundOffset = 50; // +10 = 10 ms later

  let source: MediaElementAudioSourceNode | undefined;
  let donBuffer: AudioBuffer | undefined;
  let katBuffer: AudioBuffer | undefined;

  let loadedCount = 0;
  function addLoaded() {
    loadedCount++;
    if (loadedCount === 3) {
      playbackState.ready = true;
    }
  }

  async function loadSample(path: string) {
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }

  // time should be in seconds, related to the audioCtx currentTime
  function playHitsound(which: "don" | "kat", time: number) {
    const buffer = which === "don" ? donBuffer : katBuffer;
    const source = new AudioBufferSourceNode(audioCtx, { buffer });
    source.connect(gains.effect);
    source.start(time);
    return source;
  }

  // schedules hitsounds for the next [lookahead] ms starting from [t]
  let scheduled: {
    index: number;
    time: number;
    source: AudioBufferSourceNode;
  }[] = [];
  const lookahead = 100;
  const interval = 25;
  let intervalHandler: number | null = null;
  function scheduleHitsounds(replay: Replay) {
    const t = playbackState.computeTime();
    let events = replay.eventsIntersecting(t, t + lookahead);
    // discard already scheduled events
    events = events.filter(
      (e) =>
        !scheduled.some((sched) => sched.index === e.index) && e.pressTime >= t,
    );
    for (const event of events) {
      const time =
        audioCtx.currentTime + (event.pressTime - t + hitsoundOffset) / 1000;
      const which = event.key.toLowerCase() === "d" ? "don" : "kat";
      const source = playHitsound(which, time);
      source.addEventListener("ended", () => {
        scheduled = scheduled.filter((sched) => sched.index !== event.index);
      });
      scheduled.push({ index: event.index, time, source });
    }
  }

  function cancelHitsounds() {
    if (intervalHandler) clearInterval(intervalHandler);
    intervalHandler = null;
    for (const sched of scheduled) {
      sched.source.disconnect();
    }
    scheduled = [];
  }

  $effect(() => {
    if (playbackState.status === "playing") {
      element.play();
      if (playingReplay) {
        cancelHitsounds();
        scheduleHitsounds(playingReplay);
        intervalHandler = setInterval(
          () => scheduleHitsounds(playingReplay),
          interval,
        );
      }
    } else {
      element.pause();
      cancelHitsounds();
    }
  });

  $effect(() => {
    if (playbackState.status !== "playing") {
      if (playbackState.time < 0)
        console.warn("Setting to negative time!", playbackState.time);
      element.currentTime = playbackState.time / 1000;
      cancelHitsounds();
    }
  });

  onMount(() => {
    loadSample("taiko-normal-hitnormal.wav").then((res) => {
      donBuffer = res;
      addLoaded();
    });
    loadSample("taiko-normal-hitclap.wav").then((res) => {
      katBuffer = res;
      addLoaded();
    });
    source = audioCtx.createMediaElementSource(element);
    source.connect(gains.music);
    addLoaded();
  });

  onDestroy(() => {
    cancelHitsounds();
  });
</script>

<audio src="audio.ogg" bind:this={element}></audio>
