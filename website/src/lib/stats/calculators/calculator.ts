import type { Statistic } from "../Statistic.svelte";
import type { Reference } from "../statsObject.svelte";

export interface Calculator<P, R extends Reference> {
  compute(parent: P): Statistic<R>[];
}
