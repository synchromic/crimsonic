import type { Replay } from "../replay/replay";

export class OverallObject {
  constructor() {}
}

export class ReplayObject {
  replay: Replay;

  constructor(replay: Replay) {
    this.replay = replay;
  }
}

export class NoteObject {
  index: number;

  constructor(index: number) {
    this.index = index;
  }
}

export class ReplayNoteObject {
  replay: Replay;
  index: number;

  constructor(replay: Replay, index: number) {
    this.replay = replay;
    this.index = index;
  }
}
