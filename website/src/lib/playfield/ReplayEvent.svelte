<script lang="ts">
  import { ReplayKey, type ReplayEvent } from "../replay/replay";
  import { msToPos } from "./playfield";

  const { event }: { event: ReplayEvent } = $props();

  const x = $derived(msToPos(event.pressTime));
  const y = $derived(
    event.key === ReplayKey.LeftDon || event.key === ReplayKey.LeftKat
      ? 40
      : 60,
  );

  const isDon = $derived(
    event.key === ReplayKey.LeftDon || event.key === ReplayKey.RightDon,
  );
  const hue = $derived(isDon ? "25" : "270");
  const color = $derived(`oklch(0.7 0.2 ${hue})`);
</script>

<rect
  x={x - 3}
  y={y - 10}
  width={6}
  height={20}
  stroke="#111111"
  fill={color}
/>
