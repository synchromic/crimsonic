import type { Statistic } from "./statistic";

export interface Calculator<P, R> {
  compute(parent: P): Statistic<R>[];
}
