import type { Replay } from "../replay/replay";
import { calculators, type Statistic } from "./stats.svelte";

export interface Referenceable {
  reference(): string; // display string for a clickable link to this object
}

export type Reference = Referenceable | undefined;

export abstract class StatsObject {
  abstract getStats(): Statistic<Reference>[];
  abstract name(): string;
}

export class OverallObject implements StatsObject {
  constructor() {}

  getStats(): Statistic<Reference>[] {
    return calculators.overall.flatMap((calc) => calc(this));
  }

  name() {
    return "playfield";
  }
}

export class ReplayObject implements StatsObject, Referenceable {
  replay: Replay;

  constructor(replay: Replay) {
    this.replay = replay;
  }

  reference() {
    return `#${this.replay.id}`;
  }

  getStats(): Statistic<Reference>[] {
    return calculators.replay.flatMap((calc) => calc(this));
  }

  name() {
    return `replay #${this.replay.id}`;
  }
}

export class NoteObject implements StatsObject, Referenceable {
  index: number;

  constructor(index: number) {
    this.index = index;
  }

  reference() {
    return `note ${this.index}`;
  }

  getStats(): Statistic<Reference>[] {
    return calculators.note.flatMap((calc) => calc(this));
  }

  name() {
    return `note ${this.index}`;
  }
}

export class ReplayNoteObject implements StatsObject, Referenceable {
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
    return calculators.note.flatMap((calc) => calc(this));
  }

  name() {
    return `replay #${this.replay.id} note ${this.index}`;
  }
}

export const selectedObject: { value: StatsObject } = $state({
  value: new OverallObject(),
});
