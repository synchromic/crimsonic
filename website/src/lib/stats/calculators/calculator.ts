import type { Statistic } from "../statistic";
import type { Reference } from "../statsObject";

export interface Calculator<P, R extends Reference> {
  compute(parent: P): Statistic<R>[];
}
