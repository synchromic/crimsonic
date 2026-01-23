import map from "../../assets/map.json";
import { msToNote, noteToMs, Replay } from "../replay/replay";

export interface SVGNote {
  index: number;
  x: number;
  kind: string;
  transparent: boolean;
}

// assume svg height of 100
export const receptorX = 100;
const noteWidth = 35; // how far between note centers
const pixelsPerMs = noteWidth / map.ms_per_note;

function posToMs(t: number, x: number) {
  return (x - receptorX) / pixelsPerMs + t;
}

function msToPos(t: number, ms: number) {
  return (ms - t) * pixelsPerMs + receptorX;
}

export function visibleNotes(
  replay: Replay,
  t: number,
  svgWidth: number,
): SVGNote[] {
  const leeway = 100;
  const maxNote = Math.min(
    map.notes.length - 1,
    Math.ceil(msToNote(posToMs(t, svgWidth + leeway))),
  );
  const minNote = Math.max(0, Math.floor(msToNote(posToMs(t, -leeway))));
  let result: SVGNote[] = [];
  for (let i = maxNote; i >= minNote; i--) {
    if (map.notes[i] !== " ") {
      const event = replay.noteEvent(i);
      const transparent = event ? event.pressTime <= t : false;
      result.push({
        index: i,
        x: msToPos(t, noteToMs(i)),
        kind: map.notes[i],
        transparent,
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
