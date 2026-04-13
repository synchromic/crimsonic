import { Judgements, replays } from "../../replay/replay";
import type { CalculatorRegistry } from "../stats.svelte";
import { ReplayObject } from "../statsObject.svelte";

function displayAcc(value: number): string {
  return (value * 100).toFixed(2) + "%";
}

export function loadAccCalculators(calculators: CalculatorRegistry) {
  const sortedReplays = [...replays].sort((a, b) => a.accuracy - b.accuracy);
  const worst = sortedReplays[0];
  const best = sortedReplays[sortedReplays.length - 1];
  const median = sortedReplays[Math.floor(sortedReplays.length / 2)];
  calculators.overall.push(() => [
    {
      name: "bestAcc",
      description: "Best accuracy",
      value: displayAcc(best.accuracy),
      category: "accuracy",
      ref: new ReplayObject(best),
    },
    {
      name: "worstAcc",
      description: "Worst accuracy",
      value: displayAcc(worst.accuracy),
      category: "accuracy",
      ref: new ReplayObject(worst),
    },
    {
      name: "medianAcc",
      description: "Median accuracy",
      value: displayAcc(median.accuracy),
      category: "accuracy",
      ref: new ReplayObject(median),
    },
  ]);

  const meanAcc =
    replays.map((r) => r.accuracy).reduce((acc, v) => acc + v, 0) /
    replays.length;

  calculators.overall.push(() => [
    {
      name: "meanAcc",
      description: "Mean accuracy",
      value: displayAcc(meanAcc),
      category: "accuracy",
      ref: undefined,
    },
  ]);

  const averages: Map<number, number> = new Map(); // cached index -> average

  function getAccuracy(index: number): number {
    if (averages.has(index)) return averages.get(index)!;
    let judgements = new Judgements();
    judgements.add(
      ...replays.map((r) => r.scoreAt(index)).filter((s) => s !== null),
    );
    const acc = judgements.toAcc();
    averages.set(index, acc);
    return acc;
  }

  calculators.note.push((parent) => [
    {
      name: "noteMeanAcc",
      description: "Mean accuracy",
      value: displayAcc(getAccuracy(parent.index)),
      category: "accuracy",
      ref: undefined,
    },
  ]);
}
