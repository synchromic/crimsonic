import map from "../../assets/map.json";
import { Replay, ReplayKey } from "./replay";

// how many lane-heights should a beat be wide
const beatWidth = 1.4;

function beatToMs(beat: number) {
  return beat * map.ms_per_beat + map.start_offset;
}

function msToBeat(ms: number) {
  return (ms - map.start_offset) / map.ms_per_beat;
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

// t is current frame time, h is lane height
function posToMs(t: number, h: number, x: number) {
  const pixelsPerMs = (beatWidth / map.ms_per_beat) * h;
  const receptorX = h / 2;
  return (x - receptorX) / pixelsPerMs + t;
}

// t is current frame time, h is lane height, ms is time of object, returns x position of object
function msToPos(t: number, h: number, ms: number) {
  const pixelsPerMs = (beatWidth / map.ms_per_beat) * h;
  const receptorX = h / 2;
  return (ms - t) * pixelsPerMs + receptorX;
}

export function register(elem: HTMLCanvasElement) {
  canvas = elem;
  ctx = elem.getContext("2d");
}

export function clear() {
  if (!ctx || !canvas) throw new Error("canvas has not loaded");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawBeat(x: number, y: number, r: number, kind: string) {
  if (!ctx) return;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = kind === "d" ? "#990000" : "#000099";
  ctx.fill();
  ctx.lineWidth = 4.0;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
}

// t: time in ms, y: y offset, h: height
export function drawMapFrame(t: number, y: number, h: number) {
  if (!ctx || !canvas) throw new Error("canvas has not loaded");
  const leftBeat = msToBeat(posToMs(t, h, 0));
  const rightBeat = msToBeat(posToMs(t, h, canvas.width));
  const leeway = 1.0; // beats
  const startIndex = Math.max(0, Math.floor((leftBeat - leeway) * 4)); // *4 because four notes per beat
  const endIndex = Math.min(
    map.data.length - 1,
    Math.floor((rightBeat + leeway) * 4),
  );
  // go back to front because we want to draw earlier notes on top
  const noteRadius = h / 5;
  for (let i = endIndex; i >= startIndex; i--) {
    if (map.data.charAt(i) === " ") continue;
    const beat = i / 4;
    const x = msToPos(t, h, beatToMs(beat));
    if (i % 16 === 0) {
      // bar line
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + h);
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    }
    drawBeat(x, y + h / 2, noteRadius, map.data.charAt(i));
  }
}

// returns [y pos, height, color]
function keyToData(
  key: ReplayKey,
  y: number,
  h: number,
): [number, number, string] {
  const keyH = h / 6;
  switch (key) {
    case ReplayKey.LeftKat:
      return [y + 2 * keyH, keyH, "#0000FFdd"];
    case ReplayKey.LeftDon:
      return [y + 2 * keyH, keyH, "#FF0000dd"];
    case ReplayKey.RightDon:
      return [y + 3 * keyH, keyH, "#FF0000dd"];
    case ReplayKey.RightKat:
      return [y + 3 * keyH, keyH, "#0000FFdd"];
  }
}

const impactWidth = 1 / 25; // lane heights
export function drawReplayFrame(
  replay: Replay,
  t: number,
  y: number,
  h: number,
) {
  if (!ctx || !canvas) throw new Error("canvas has not loaded");
  const leftMs = posToMs(t, h, 0);
  const rightMs = posToMs(t, h, canvas.width);
  const leeway = map.ms_per_beat;
  const events = replay.eventsIntersecting(leftMs - leeway, rightMs + leeway);
  for (const event of events) {
    const eventX = msToPos(t, h, event.pressTime) - (impactWidth * h) / 2;
    const eventW = impactWidth * h;
    const [eventY, eventH, color] = keyToData(event.key, y, h);
    ctx.fillStyle = color;
    ctx.fillRect(eventX, eventY, eventW, eventH);
  }
}
