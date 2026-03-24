<script lang="ts">
  import { audioCtx, gains } from "./audio";

  let {
    id,
    initial,
    label,
  }: {
    id: string;
    initial: number;
    label: string;
  } = $props();

  let gainNode = $derived(gains[id]);

  // svelte-ignore state_referenced_locally
  let value = $state(initial);
  let valueText = $derived(Math.round(value * 100));

  $effect(() => {
    gainNode.gain.setValueAtTime(value, audioCtx.currentTime);
  });
</script>

<div>
  <input {id} type="range" min={0} max={1} step={0.01} bind:value />
  <label for={id}>{label}: {valueText}</label>
</div>
