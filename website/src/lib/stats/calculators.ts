import { AccuracyCalculator } from "./calculators/accuracy";
import type { Calculator } from "./calculators/calculator";
import type {
  NoteObject,
  OverallObject,
  Reference,
  ReplayNoteObject,
  ReplayObject,
} from "./statsObject";

export const calculators: {
  overall: Calculator<OverallObject, Reference>[];
  replay: Calculator<ReplayObject, Reference>[];
  note: Calculator<NoteObject, Reference>[];
  replayNote: Calculator<ReplayNoteObject, Reference>[];
} = {
  overall: [new AccuracyCalculator()],
  replay: [],
  note: [],
  replayNote: [],
};
