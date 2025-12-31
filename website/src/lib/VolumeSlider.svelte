<script lang="ts">
  let {
    audioCtx,
    initial,
    gainNode,
    label,
  }: {
    audioCtx: AudioContext;
    initial: number;
    gainNode: GainNode;
    label: string;
  } = $props();

  // svelte-ignore state_referenced_locally
  let value = $state(initial);
  let valueText = $derived(Math.round(value * 100));

  $effect(() => {
    gainNode.gain.setValueAtTime(value, audioCtx.currentTime);
  });
</script>

<div>
  <input id="range" type="range" min={0} max={1} step={0.01} bind:value />
  <label for="range">{label}: {valueText}</label>
</div>
