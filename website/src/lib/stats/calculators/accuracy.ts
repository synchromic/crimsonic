import { replays, type Replay } from "../../replay/replay";
import type { Calculator } from "./calculator";
import { Statistic } from "../Statistic.svelte";
import { ReplayObject, type OverallObject } from "../statsObject.svelte";

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
    return [
      new Statistic({
        name: "bestAcc",
        description: "Best accuracy",
        value: best.accuracy,
        category: "accuracy",
        ref: new ReplayObject(best),
        display: () => `${(best.accuracy * 100).toFixed(2)}%`,
      }),
      new Statistic({
        name: "worstAcc",
        description: "Worst accuracy",
        value: worst.accuracy,
        category: "accuracy",
        ref: new ReplayObject(worst),
        display: () => `${(worst.accuracy * 100).toFixed(2)}%`,
      }),
    ];
  }
}
