import { replays, type Replay } from "../../replay/replay";
import type { Calculator } from "./calculator";
import { Statistic } from "../Statistic.svelte";
import { ReplayObject, type OverallObject } from "../statsObject.svelte";

function displayAcc(value: number): string {
  return (value * 100).toFixed(2);
}

export class AccuracyCalculator implements Calculator<
  OverallObject,
  ReplayObject
> {
  sortedReplays: Replay[];

  constructor() {
    this.sortedReplays = [...replays].sort((a, b) => a.accuracy - b.accuracy);
  }

  compute(parent: OverallObject): Statistic<ReplayObject>[] {
    const worst = this.sortedReplays[0];
    const best = this.sortedReplays[this.sortedReplays.length - 1];
    const median =
      this.sortedReplays[Math.floor(this.sortedReplays.length / 2)];
    return [
      new Statistic({
        name: "bestAcc",
        description: "Best accuracy",
        value: best.accuracy,
        category: "accuracy",
        ref: new ReplayObject(best),
        display: displayAcc,
      }),
      new Statistic({
        name: "worstAcc",
        description: "Worst accuracy",
        value: worst.accuracy,
        category: "accuracy",
        ref: new ReplayObject(worst),
        display: displayAcc,
      }),
      new Statistic({
        name: "medianAcc",
        description: "Median accuracy",
        value: median.accuracy,
        category: "accuracy",
        ref: new ReplayObject(median),
        display: displayAcc,
      }),
    ];
  }
}

export class MeanAccuracyCalculator implements Calculator<
  OverallObject,
  undefined
> {
  average: number;

  constructor() {
    this.average =
      replays.map((r) => r.accuracy).reduce((acc, v) => acc + v, 0) /
      replays.length;
  }

  compute(parent: OverallObject): Statistic<undefined>[] {
    return [
      new Statistic({
        name: "meanAcc",
        description: "Mean accuracy",
        value: this.average,
        category: "accuracy",
        ref: undefined,
        display: displayAcc,
      }),
    ];
  }
}
