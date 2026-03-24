import type { Replay } from "../replay/replay";
import { calculators } from "./calculators";
import type { Statistic } from "./statistic";

interface Referenceable {
  reference(): string;
}

export type Reference = Referenceable | void;

export abstract class StatsObject {
  abstract getStats(): Statistic<Reference>[];
}

export class OverallObject implements StatsObject {
  // brand that prevents other objects from being used in place of this one
  readonly _kind: "overall" = "overall";

  constructor() {}

  getStats(): Statistic<Reference>[] {
    return calculators.overall.flatMap((calc) => calc.compute(this));
  }
}

export class ReplayObject implements StatsObject, Referenceable {
  readonly _kind: "replay" = "replay";
  replay: Replay;

  constructor(replay: Replay) {
    this.replay = replay;
  }

  reference() {
    return `#${this.replay.id}`;
  }

  getStats(): Statistic<Reference>[] {
    return calculators.replay.flatMap((calc) => calc.compute(this));
  }
}

export class NoteObject implements StatsObject, Referenceable {
  readonly _kind: "note" = "note";
  index: number;

  constructor(index: number) {
    this.index = index;
  }

  reference() {
    return `note ${this.index}`;
  }

  getStats(): Statistic<Reference>[] {
    return calculators.note.flatMap((calc) => calc.compute(this));
  }
}

export class ReplayNoteObject implements StatsObject, Referenceable {
  readonly _kind: "replayNote" = "replayNote";
  replay: Replay;
  index: number;

  constructor(replay: Replay, index: number) {
    this.replay = replay;
    this.index = index;
  }

  reference() {
    return `#${this.replay.id}, note ${this.index}`;
  }

  getStats(): Statistic<Reference>[] {
    return calculators.replayNote.flatMap((calc) => calc.compute(this));
  }
}
