import map from "../../assets/map.json";
import { msToNote, noteToMs } from "../replay/replay";

export interface SVGNote {
  index: number;
  x: number;
  kind: string;
}

// assume svg height of 100
const receptorX = 100;
const noteWidth = 35; // how far between note centers
const pixelsPerMs = noteWidth / map.ms_per_note;

function posToMs(t: number, x: number) {
  return (x - receptorX) / pixelsPerMs + t;
}

function msToPos(t: number, ms: number) {
  return (ms - t) * pixelsPerMs + receptorX;
}

const leeway = 100;
function* visibleIndices(t: number, svgWidth: number) {
  const maxNote = Math.min(
    map.notes.length - 1,
    Math.ceil(msToNote(posToMs(t, svgWidth + leeway))),
  );
  const minNote = Math.max(0, Math.floor(msToNote(posToMs(t, -leeway))));
  for (let i = maxNote; i >= minNote; i--) {
    if (map.notes[i] !== " ") yield i;
  }
}

function getSVGNote(t: number, index: number): SVGNote {
  return {
    index,
    x: msToPos(t, noteToMs(index)),
    kind: map.notes[index],
  };
}

export function visibleNotes(t: number, svgWidth: number) {
  return [...visibleIndices(t, svgWidth)].map((index) => getSVGNote(t, index));
}
