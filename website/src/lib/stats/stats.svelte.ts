import { loadAccCalculators } from "./calculators/accuracy";
import { loadMiscCalculators } from "./calculators/misc";
import type {
  NoteObject,
  OverallObject,
  Reference,
  ReplayObject,
  StatsObject,
} from "./statsObject.svelte";

const categories = ["accuracy", "misc"] as const;
export type Category = (typeof categories)[number];

export interface Statistic<R extends Reference> {
  name: string;
  description: string;
  category: Category;
  value: string;
  ref: R;
}

export type Calculator<P extends StatsObject> = (
  parent: P,
) => Statistic<Reference>[];

export interface CalculatorRegistry {
  overall: Calculator<OverallObject>[];
  replay: Calculator<ReplayObject>[];
  note: Calculator<NoteObject>[];
}

export const calculators: CalculatorRegistry = {
  overall: [],
  replay: [],
  note: [],
};

function loadCalculators() {
  loadMiscCalculators(calculators);
  loadAccCalculators(calculators);
}

loadCalculators();
