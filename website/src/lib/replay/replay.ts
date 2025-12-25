import IntervalTree from "@flatten-js/interval-tree";

interface JSONReplay {
  date: string;
  judgements: {
    "300": number;
    "100": number;
    miss: number;
  };
  keys: string;
  press_time_deltas: number[];
  release_time_deltas: number[];
}

export enum ReplayKey {
  LeftDon,
  LeftKat,
  RightDon,
  RightKat,
}

const replayKeyCharMap: { [keyChar: string]: ReplayKey } = {
  d: ReplayKey.LeftDon,
  k: ReplayKey.LeftKat,
  D: ReplayKey.RightDon,
  K: ReplayKey.RightKat,
};

function fromDeltas(arr: number[]) {
  let acc = 0;
  let res = [];
  for (let i = 0; i < arr.length; i++) {
    acc += arr[i];
    res.push(acc);
  }
  return res;
}

export interface ReplayEvent {
  key: ReplayKey;
  pressTime: number;
  releaseTime: number;
}

export class Replay {
  date: Date;
  private eventTree: IntervalTree<ReplayKey>;

  constructor(json: JSONReplay) {
    this.date = new Date(json.date);
    this.eventTree = new IntervalTree();
    const pressTimes = fromDeltas(json.press_time_deltas);
    const releaseTimes = fromDeltas(json.release_time_deltas);
    for (let i = 0; i < json.keys.length; i++) {
      this.eventTree.insert(
        [pressTimes[i], releaseTimes[i]],
        replayKeyCharMap[json.keys.charAt(i)],
      );
    }
  }

  eventsIntersecting(start: number, end: number): ReplayEvent[] {
    return this.eventTree.search([start, end], (replayKey, interval) => {
      return {
        key: replayKey,
        pressTime: interval.low as number,
        releaseTime: interval.high as number,
      };
    });
  }
}
