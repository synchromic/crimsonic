import {
  AccuracyCalculator,
  MeanAccuracyCalculator,
  NoteMeanAccuracyCalculator,
} from "./calculators/accuracy";
import type { Calculator } from "./calculators/calculator";
import type {
  NoteObject,
  OverallObject,
  Reference,
  ReplayNoteObject,
  ReplayObject,
} from "./statsObject.svelte";

export const calculators: {
  overall: Calculator<OverallObject, Reference>[];
  replay: Calculator<ReplayObject, Reference>[];
  note: Calculator<NoteObject, Reference>[];
  replayNote: Calculator<ReplayNoteObject, Reference>[];
} = {
  overall: [new AccuracyCalculator(), new MeanAccuracyCalculator()],
  replay: [],
  note: [new NoteMeanAccuracyCalculator()],
  replayNote: [new NoteMeanAccuracyCalculator()],
};
