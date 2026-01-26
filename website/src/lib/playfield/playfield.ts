import map from "../../assets/map.json";
import { options } from "../options.svelte";
import { msToNote, noteToMs, Replay, ReplayScore } from "../replay/replay";

export interface SVGNote {
  index: number;
  x: number;
  y: number;
  kind: string;
  transparent: boolean;
  score: ReplayScore;
  showMiss: boolean;
}

// assume svg height of 100
export const receptorX = 100;
export const noteWidth = 42; // how far between note centers
const pixelsPerMs = noteWidth / map.ms_per_note;

function posToMs(t: number, x: number) {
  return (x - receptorX) / pixelsPerMs + t;
}

export function msToPos(t: number, ms: number) {
  return (ms - t) * pixelsPerMs + receptorX;
}

function* iterateNotes(t: number, svgWidth: number) {
  const leeway = 100;
  const maxNote = Math.min(
    map.notes.length - 1,
    Math.ceil(msToNote(posToMs(t, svgWidth + leeway))),
  );
  const minNote = Math.max(0, Math.floor(msToNote(posToMs(t, -leeway))));
  for (let i = maxNote; i >= minNote; i--) {
    yield i;
  }
}

function flyOffset(t: number, pressTime: number) {
  const peakTime = 300; // ms
  const timeSinceHit = t - pressTime;
  const ratio = timeSinceHit / peakTime;
  return -60 * (1 - (1 - ratio) * (1 - ratio));
}

export function visibleNotes(
  replay: Replay,
  t: number,
  svgWidth: number,
): SVGNote[] {
  let result: SVGNote[] = [];
  for (let i of iterateNotes(t, svgWidth)) {
    if (map.notes[i] !== " ") {
      const event = replay.noteEvent(i);
      let transparent, y, showMiss;
      if (event && event.pressTime <= t) {
        transparent =
          replay.scoreAt(i) === ReplayScore.Miss || !options.flyNotes;
        showMiss = replay.scoreAt(i) === ReplayScore.Miss;
        if (options.flyNotes && replay.scoreAt(i) !== ReplayScore.Miss) {
          y = 50 + flyOffset(t, event.pressTime);
        } else {
          y = 50;
        }
      } else {
        transparent = false;
        y = 50;
        showMiss = replay.scoreAt(i) === ReplayScore.Miss && noteToMs(i) <= t;
      }
      result.push({
        index: i,
        x: msToPos(t, noteToMs(i)),
        y,
        kind: map.notes[i],
        transparent,
        score: replay.scoreAt(i)!,
        showMiss,
      });
    }
  }
  return result;
}

// barlines appear every 16 notes
// returns list of x positions
export function visibleBarlines(t: number, svgWidth: number) {
  const leeway = 10;
  const maxBar = Math.ceil(msToNote(posToMs(t, svgWidth + leeway)) / 16.0);
  const minBar = Math.floor(msToNote(posToMs(t, -leeway)) / 16.0);
  let result: number[] = [];
  for (let i = minBar; i < maxBar; i++) {
    result.push(msToPos(t, noteToMs(i * 16)));
  }
  return result;
}

export function visibleEvents(replay: Replay, t: number, svgWidth: number) {
  const leeway = 50;
  const leftMs = posToMs(t, -leeway);
  const rightMs = posToMs(t, svgWidth + leeway);
  return replay.eventsIntersecting(leftMs, rightMs);
}
