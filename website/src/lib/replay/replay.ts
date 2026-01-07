import IntervalTree from "@flatten-js/interval-tree";
import map from "../../assets/map.json";

export function noteToMs(noteIndex: number) {
  return Math.floor(noteIndex * map.ms_per_note + map.start_offset);
}

export function msToNote(ms: number) {
  return (ms - map.start_offset) / map.ms_per_note;
}

export interface JSONReplay {
  timestamp: string;
  accuracy: number;
  judgements: {
    "300": number;
    "100": number;
    miss: number;
  };
  keys: string;
  press_time_deltas: number[];
  release_time_deltas: number[];
  scores: string;
  note_to_press_map: number[];
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
  key: ReplayKey;
  pressTime: number;
  releaseTime: number;
  note: number | null; // which note was hit by this event, if any
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

type EventIndex = number;
export class Replay {
  date: Date;
  scores: string;
  scorePrefixSums: ScorePrefixSums;
  events: ReplayEvent[];
  private eventTree: IntervalTree<EventIndex>;
  noteToEventMap: (EventIndex | null)[];
  offsets: (number | null)[];

  constructor(json: JSONReplay) {
    this.date = new Date(json.timestamp);
    this.scores = json.scores;
    this.eventTree = new IntervalTree();
    this.events = [];
    this.noteToEventMap = json.note_to_press_map.map((i) =>
      i === -1 ? null : i,
    );
    const pressTimes = fromDeltas(json.press_time_deltas);
    const releaseTimes = fromDeltas(json.release_time_deltas);
    for (let i = 0; i < json.keys.length; i++) {
      const event: ReplayEvent = {
        key: json.keys.charAt(i) as ReplayKey,
        pressTime: pressTimes[i],
        releaseTime: releaseTimes[i],
        note: null, // fill in later
      };
      this.events.push(event);
      this.eventTree.insert([pressTimes[i], releaseTimes[i]], i);
    }
    for (let i = 0; i < this.noteToEventMap.length; i++) {
      const eventIndex = this.noteToEventMap[i];
      if (eventIndex !== null) {
        this.events[eventIndex].note = i;
      }
    }
    this.scorePrefixSums = new ScorePrefixSums(this.scores);
    this.offsets = [];
    for (let i = 0; i < this.noteToEventMap.length; i++) {
      const eventIndex = this.noteToEventMap[i];
      if (eventIndex === null) {
        this.offsets.push(null);
      } else {
        const event = this.events[eventIndex];
        this.offsets.push(event.pressTime - noteToMs(i));
      }
    }
  }

  eventsIntersecting(start: number, end: number): EventIndex[] {
    return this.eventTree.search([start, end]);
  }

  scoreAt(index: number): ReplayScore | null {
    const char = this.scores.charAt(index);
    if (char === " ") return null;
    return this.scores.charAt(index) as ReplayScore;
  }
}
