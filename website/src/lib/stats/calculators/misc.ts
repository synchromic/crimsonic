import { replays } from "../../replay/replay";
import { formatDate } from "../../utils";
import type { CalculatorRegistry } from "../stats.svelte";
import { ReplayObject } from "../statsObject.svelte";

export function loadMiscCalculators(calculators: CalculatorRegistry) {
  const latestReplay = [...replays].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  )[0];

  calculators.overall.push(() => [
    {
      name: "totalReplays",
      description: "Replay count",
      category: "misc",
      value: replays.length.toString(),
      ref: undefined,
    },
    {
      name: "latestReplay",
      description: "Latest replay",
      category: "misc",
      value: formatDate(latestReplay.date),
      ref: new ReplayObject(latestReplay),
    },
  ]);
}
