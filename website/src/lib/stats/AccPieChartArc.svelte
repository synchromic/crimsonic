<script lang="ts">
  // start and end should be between 0 and 1 (percentage of full circle)
  // zero is facing up, goes clockwise
  let { fill, start, end }: { fill: string; start: number; end: number } =
    $props();

  const RADIUS = 1;

  function ratioToCoords(ratio: number): [number, number] {
    // could optimize away the math.pi/2 but whatever
    return [
      Math.cos(ratio * 2 * Math.PI - Math.PI / 2) * RADIUS,
      Math.sin(ratio * 2 * Math.PI - Math.PI / 2) * RADIUS,
    ];
  }

  let large = $derived(end - start > 0.5 ? "1" : "0");
  let [sx, sy] = $derived(ratioToCoords(start));
  let [ex, ey] = $derived(ratioToCoords(end));
</script>

<path
  d="
    M 0,0
    L {sx},{sy}
    A {RADIUS},{RADIUS} 0 {large} 1 {ex},{ey}
    L 0,0
  "
  {fill}
></path>
