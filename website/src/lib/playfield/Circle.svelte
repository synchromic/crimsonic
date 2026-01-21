<script lang="ts">
  const { kind, x }: { kind: string; x: number } = $props();

  const color = $derived(
    kind === "d" ? "oklch(0.45 0.2 25)" : "oklch(0.45 0.2 270)",
  );
</script>

<circle cx={x} cy={50} r={20} fill={color} stroke="#FFFFFF" stroke-width={3} />
