import map from "../../assets/gen/map.json";
import { options } from "../options.svelte";
import {
  msToNote,
  noteToMs,
  Replay,
  ReplayScore,
  type ReplayEvent,
} from "../replay/replay";

export interface SVGNote {
  replay: Replay;
  index: number;
  x: number;
  kind: string;
  score: ReplayScore;
  event: ReplayEvent | null;
}

// assume svg height of 100, receptor at current time
export const receptorX = 100;
export const noteWidth = 42; // how far between note centers
const pixelsPerMs = noteWidth / map.ms_per_note;

function screenPosToMs(t: number, x: number) {
  return (x - receptorX) / pixelsPerMs + t;
}

export function msToPos(ms: number) {
  return ms * pixelsPerMs;
}

function* iterateNotes(timeF: number, svgWidth: number) {
  const leeway = noteWidth;
  const maxNote = Math.min(
    map.notes.length - 1,
    Math.ceil(msToNote(screenPosToMs(timeF, svgWidth + leeway))),
  );
  const minNote = Math.max(
    0,
    Math.floor(msToNote(screenPosToMs(timeF, -leeway))),
  );
  for (let i = maxNote; i >= minNote; i--) {
    yield i;
  }
}

export function visibleNotes(
  replay: Replay,
  timeF: number,
  svgWidth: number,
): SVGNote[] {
  let result: SVGNote[] = [];
  for (let i of iterateNotes(timeF, svgWidth)) {
    if (map.notes[i] !== " ") {
      result.push({
        replay,
        index: i,
        x: msToPos(noteToMs(i)),
        kind: map.notes[i],
        score: replay.scoreAt(i)!,
        event: replay.noteEvent(i),
      });
    }
  }
  return result;
}

// barlines appear every 16 notes
// returns list of x positions
export function visibleBarlines(timeF: number, svgWidth: number) {
  const leeway = 10 + noteWidth;
  const maxBar = Math.ceil(
    msToNote(screenPosToMs(timeF, svgWidth + leeway)) / 16.0,
  );
  const minBar = Math.floor(msToNote(screenPosToMs(timeF, -leeway)) / 16.0);
  let result: number[] = [];
  for (let i = minBar; i < maxBar; i++) {
    result.push(msToPos(noteToMs(i * 16)));
  }
  return result;
}

export function visibleEvents(replay: Replay, timeF: number, svgWidth: number) {
  const leeway = 50 + noteWidth;
  const leftMs = screenPosToMs(timeF, -leeway);
  const rightMs = screenPosToMs(timeF, svgWidth + leeway);
  return replay.eventsIntersecting(leftMs, rightMs);
}

export function scoreColor(score: ReplayScore, transparency?: string) {
  let hue;
  switch (score) {
    case ReplayScore.Great:
      hue = 265;
      break;
    case ReplayScore.Ok:
      hue = 145;
      break;
    case ReplayScore.Miss:
      hue = 30;
      break;
  }
  if (transparency !== undefined) {
    return `oklch(0.64 0.19 ${hue} / ${transparency})`;
  } else {
    return `oklch(0.64 0.19 ${hue})`;
  }
}
