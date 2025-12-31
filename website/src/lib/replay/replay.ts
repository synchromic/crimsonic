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
  scores: string;
}

export enum ReplayKey {
  LeftDon = "d",
  LeftKat = "k",
  RightDon = "D",
  RightKat = "K",
}

export enum ReplayScore {
  Great = "3",
  Ok = "1",
  Miss = "x",
}

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
  id: number;
  key: ReplayKey;
  pressTime: number;
  releaseTime: number;
}

interface TreeValue {
  id: number;
  key: ReplayKey;
}

class ScorePrefixSums {
  length: number;
  sums: { [scoreType: string]: number[] };

  constructor(scores: string) {
    this.length = scores.length;
    this.sums = {
      "3": [],
      "1": [],
      x: [],
    };
    let cum: { [scoreType: string]: number } = {
      "3": 0,
      "1": 0,
      x: 0,
    };
    for (let i = 0; i < scores.length; i++) {
      cum[scores.charAt(i)]++;
      for (const scoreType of ["3", "1", "x"]) {
        this.sums[scoreType].push(cum[scoreType]);
      }
    }
  }

  query(scoreType: ReplayScore, index: number) {
    if (index < 0) return 0;
    if (index >= this.length) index = this.length - 1;
    return this.sums[scoreType][index];
  }
}

export class Replay {
  date: Date;
  scores: string;
  scorePrefixSums: ScorePrefixSums;
  private eventTree: IntervalTree<TreeValue>;

  constructor(json: JSONReplay) {
    this.date = new Date(json.date);
    this.scores = json.scores;
    this.eventTree = new IntervalTree();
    const pressTimes = fromDeltas(json.press_time_deltas);
    const releaseTimes = fromDeltas(json.release_time_deltas);
    for (let i = 0; i < json.keys.length; i++) {
      this.eventTree.insert([pressTimes[i], releaseTimes[i]], {
        id: i,
        key: json.keys.charAt(i) as ReplayKey,
      });
    }
    this.scorePrefixSums = new ScorePrefixSums(this.scores);
  }

  eventsIntersecting(start: number, end: number): ReplayEvent[] {
    return this.eventTree.search([start, end], (treeValue, interval) => {
      return {
        id: treeValue.id,
        key: treeValue.key,
        pressTime: interval.low as number,
        releaseTime: interval.high as number,
      };
    });
  }

  scoreAt(index: number): ReplayScore | null {
    const char = this.scores.charAt(index);
    if (char === " ") return null;
    return this.scores.charAt(index) as ReplayScore;
  }
}
