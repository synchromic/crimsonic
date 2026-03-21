<script lang="ts">
  const p1 = 7; // ~length
  const p2 = 4; // ~thickness
  const y = 50;

  const { x }: { x: number } = $props();

  const points = $derived([
    [x - p1 - p2, y - p1],
    [x - p1, y - p1 - p2],
    [x, y - p2],
    [x + p1, y - p1 - p2],
    [x + p1 + p2, y - p1],
    [x + p2, y],
    [x + p1 + p2, y + p1],
    [x + p1, y + p1 + p2],
    [x, y + p2],
    [x - p1, y + p1 + p2],
    [x - p1 - p2, y + p1],
    [x - p2, y],
  ]);

  const pointsStr = $derived(points.map((tup) => tup.join(",")).join("\n"));
</script>

<polygon points={pointsStr} fill="#FF0000" stroke="#000000" stroke-width={1} />
