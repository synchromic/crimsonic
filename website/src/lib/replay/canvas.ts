import map from "../../assets/map.json";
import { beatToMs, msToBeat, Replay, ReplayKey, ReplayScore } from "./replay";

// how many lane-heights should a beat be wide
const beatWidth = 1.4;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

function receptorX(h: number) {
  return h;
}

// t is current frame time, h is lane height
function posToMs(t: number, h: number, x: number) {
  const pixelsPerMs = (beatWidth / map.ms_per_beat) * h;
  return (x - receptorX(h)) / pixelsPerMs + t;
}

// t is current frame time, h is lane height, ms is time of object, returns x position of object
function msToPos(t: number, h: number, ms: number) {
  const pixelsPerMs = (beatWidth / map.ms_per_beat) * h;
  return (ms - t) * pixelsPerMs + receptorX(h);
}

export function register(elem: HTMLCanvasElement) {
  canvas = elem;
  ctx = elem.getContext("2d");
}

export function clear() {
  if (!ctx || !canvas) throw new Error("canvas has not loaded");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawBeat(x: number, y: number, r: number, kind: string, dim: boolean) {
  if (!ctx) return;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = kind === "d" ? "#990000" : "#000099";
  if (dim) ctx.fillStyle += "33";
  ctx.fill();
  ctx.lineWidth = 4.0;
  ctx.strokeStyle = "#ffffff";
  if (dim) ctx.strokeStyle += "33";
  ctx.stroke();
}

// Yields each visible note on the canvas, plus some leeway, in reverse order
// Note is a sixteenth note (1/4 beat); index into map data
const leeway = 1.0; // beats
function* visibleNotes(t: number, w: number, h: number) {
  const leftBeat = msToBeat(posToMs(t, h, 0));
  const rightBeat = msToBeat(posToMs(t, h, w));
  const startIndex = Math.max(0, Math.floor((leftBeat - leeway) * 4)); // *4 because four notes per beat
  const endIndex = Math.min(
    map.data.length - 1,
    Math.floor((rightBeat + leeway) * 4),
  );
  for (let i = endIndex; i >= startIndex; i--) {
    yield i;
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

function scoreColor(score: ReplayScore) {
  switch (score) {
    case ReplayScore.Great:
      return "#00FFFF";
    case ReplayScore.Ok:
      return "#00AA00";
    case ReplayScore.Miss:
      return "#FF0000";
  }
}

const noteRadius = 0.2; // in lane heights
const receptorRadius = 0.25;
const impactWidth = 1 / 25;
const scoreHeight = 1 / 12;
export function drawReplayFrame(
  replay: Replay,
  t: number,
  y: number,
  h: number,
) {
  if (!ctx || !canvas) throw new Error("canvas has not loaded");

  // draw receptor
  ctx.beginPath();
  ctx.arc(receptorX(h), h / 2, receptorRadius * h, 0, 2 * Math.PI);
  ctx.strokeStyle = "#777777";
  ctx.lineWidth = 4.0;
  ctx.stroke();

  // go back to front because we want to draw earlier notes on top
  for (const i of visibleNotes(t, canvas.width, h)) {
    const beat = i / 4;
    const x = msToPos(t, h, beatToMs(beat));
    if (Math.abs(i) % 16 === 0) {
      // bar line
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + h);
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    }

    if (map.data.charAt(i) === " ") continue;
    // dim if note was hit and past receptor
    const score = replay.scoreAt(i);
    const dim = score !== ReplayScore.Miss && beatToMs(beat) < t;
    drawBeat(x, y + h / 2, noteRadius * h, map.data.charAt(i), dim);
  }

  // draw keypress lines
  const leftMs = posToMs(t, h, 0);
  const rightMs = posToMs(t, h, canvas.width);
  const eventIndices = replay.eventsIntersecting(
    leftMs - leeway * map.ms_per_beat,
    rightMs + leeway * map.ms_per_beat,
  );
  for (const i of eventIndices) {
    const event = replay.events[i];
    const eventX = msToPos(t, h, event.pressTime) - (impactWidth * h) / 2;
    const eventW = impactWidth * h;
    const [eventY, eventH, color] = keyToData(event.key, y, h);
    ctx.fillStyle = color;
    ctx.fillRect(eventX, eventY, eventW, eventH);
  }

  // draw offset indicators
  ctx.lineWidth = 2;
  ctx.textBaseline = "middle";
  for (const i of eventIndices) {
    const event = replay.events[i];
    if (event.note === null) continue;
    const eventX = msToPos(t, h, event.pressTime) - (impactWidth * h) / 2;
    const eventW = impactWidth * h;
    const [eventY, eventH, _] = keyToData(event.key, y, h);
    const score = replay.scoreAt(event.note);
    if (score === null)
      throw new Error(
        `event #${i} corresponding note ${event.note} has null score`,
      );
    const noteX = msToPos(t, h, beatToMs(event.note / 4));

    // ---|
    ctx.beginPath();
    ctx.moveTo(eventX + eventW / 2, eventY + eventH / 2 - eventH / 8);
    ctx.lineTo(eventX + eventW / 2, eventY + eventH / 2 + eventH / 8);
    ctx.moveTo(eventX + eventW / 2, eventY + eventH / 2);
    ctx.lineTo(noteX, eventY + eventH / 2);
    ctx.strokeStyle = scoreColor(score);
    ctx.stroke();

    // offset number
    const offset = replay.offsets[event.note];
    if (offset === null)
      throw new Error(
        `event #${i} corresponding note ${event.note} has null offset`,
      );
    let textPos: number;
    if (offset < 0) {
      // draw to left of press
      ctx.textAlign = "right";
      textPos = eventX - eventH / 12;
    } else {
      ctx.textAlign = "left";
      textPos = eventX + eventW + eventH / 12;
    }
    const fontSize = Math.floor(eventH / 3);
    ctx.font = `${fontSize}px sans-serif`;
    const text = offset > 0 ? "+" + offset.toFixed(0) : offset.toFixed(0);
    ctx.fillStyle = scoreColor(score);
    ctx.fillText(text, textPos, eventY + eventH / 2);
  }

  // draw scoring indicators
  for (const i of visibleNotes(t, canvas.width, h)) {
    const score = replay.scoreAt(i);
    if (score === null) continue;
    const beat = i / 4;
    const width = Math.min((beatWidth / 4) * h, 2 * noteRadius * h);
    const x = msToPos(t, h, beatToMs(beat)) - width / 2;
    ctx.fillStyle = scoreColor(score);
    ctx.fillRect(x, y, width, y + scoreHeight * h);
  }
}
