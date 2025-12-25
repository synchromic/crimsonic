import map from "../../assets/map.json";
import { Replay, ReplayKey } from "./replay";

// how many lane-heights should a beat be wide
const beatWidth = 1.4;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

export function register(elem: HTMLCanvasElement) {
  canvas = elem;
  ctx = elem.getContext("2d");
}

export function clear() {
  if (!ctx || !canvas) throw new Error("canvas has not loaded");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// t: time in ms, y: y offset, h: height
export function drawMapFrame(t: number, y: number, h: number) {
  if (!ctx || !canvas) throw new Error("canvas has not loaded");
  const curBeat = (t - map.start_offset) / map.ms_per_beat;
  const receptorX = h / 2;
  const leftBeat = curBeat - receptorX / h / beatWidth;
  const rightBeat = curBeat + (canvas.width - receptorX) / h / beatWidth;
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
    const x = receptorX + (beat - curBeat) * beatWidth * h;
    if (i % 16 === 0) {
      // bar line
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + h);
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(x, y + h / 2, noteRadius, 0, 2 * Math.PI);
    ctx.fillStyle = map.data.charAt(i) === "d" ? "#990000" : "#000099";
    ctx.fill();
    ctx.lineWidth = 4.0;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
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
  const msWidth = beatWidth / map.ms_per_beat;
  const receptorX = h / 2;
  const leftMs = t - receptorX / h / msWidth;
  const rightMs = t + (canvas.width - receptorX) / h / msWidth;
  const leeway = map.ms_per_beat;
  const events = replay.eventsIntersecting(leftMs - leeway, rightMs + leeway);
  for (const event of events) {
    const eventX =
      receptorX + (event.pressTime - t) * msWidth * h - (impactWidth * h) / 2;
    const eventW = impactWidth * h;
    const [eventY, eventH, color] = keyToData(event.key, y, h);
    ctx.fillStyle = color;
    ctx.fillRect(eventX, eventY, eventW, eventH);
  }
}
