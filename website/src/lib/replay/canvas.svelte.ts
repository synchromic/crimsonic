import map from "../../assets/map.json";
import { options } from "../options.svelte";
import { noteToMs, msToNote, Replay, ReplayKey, ReplayScore } from "./replay";

// how many lane-heights should be between note centers
const noteWidth = 0.35;

const missWindow = 84.5; // ms

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

function receptorX(h: number) {
  return h;
}

// t is current frame time, h is lane height
function posToMs(t: number, h: number, x: number) {
  const pixelsPerMs = (noteWidth / map.ms_per_note) * h;
  return (x - receptorX(h)) / pixelsPerMs + t;
}

// t is current frame time, h is lane height, ms is time of object, returns x position of object
function msToPos(t: number, h: number, ms: number) {
  const pixelsPerMs = (noteWidth / map.ms_per_note) * h;
  return (ms - t) * pixelsPerMs + receptorX(h);
}

export interface IReplayRow {
  replay: Replay;
  getY: () => number;
  getH: () => number;
  isVisible: () => boolean;
}

let replayRows: IReplayRow[] = $state([]);

export function addReplayRow(row: IReplayRow) {
  replayRows.push(row);
}

export function register(elem: HTMLCanvasElement) {
  canvas = elem;
  ctx = elem.getContext("2d");
}

export function draw(time: number) {
  if (!ctx || !canvas) throw new Error("canvas has not loaded");
  clear();
  const canvasY = canvas.getBoundingClientRect().top;
  for (const replayRow of replayRows) {
    if (!replayRow.isVisible()) continue;
    const y = replayRow.getY() - canvasY;
    const h = replayRow.getH();
    drawReplayFrame(replayRow.replay, time, y, h);
  }
}

export function clear() {
  if (!ctx || !canvas) throw new Error("canvas has not loaded");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawNote(x: number, y: number, r: number, kind: string, dim: boolean) {
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

function drawCross(x: number, y: number, noteRadius: number) {
  if (!ctx) return;
  const p1 = noteRadius / 3; // ~length
  const p2 = noteRadius / 5; // ~thickness
  ctx.beginPath();
  ctx.moveTo(x - p1 - p2, y - p1);
  ctx.lineTo(x - p1, y - p1 - p2);
  ctx.lineTo(x, y - p2);
  ctx.lineTo(x + p1, y - p1 - p2);
  ctx.lineTo(x + p1 + p2, y - p1);
  ctx.lineTo(x + p2, y);
  ctx.lineTo(x + p1 + p2, y + p1);
  ctx.lineTo(x + p1, y + p1 + p2);
  ctx.lineTo(x, y + p2);
  ctx.lineTo(x - p1, y + p1 + p2);
  ctx.lineTo(x - p1 - p2, y + p1);
  ctx.lineTo(x - p2, y);
  ctx.closePath();
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = p2 / 5;
  ctx.stroke();
}

// Yields each visible note on the canvas, plus some leeway, in reverse order
const leeway = 4.0; // notes
function* visibleNotes(t: number, w: number, h: number) {
  const leftNote = msToNote(posToMs(t, h, 0));
  const rightNote = msToNote(posToMs(t, h, w));
  const startIndex = Math.max(0, Math.floor(leftNote - leeway));
  const endIndex = Math.min(
    map.notes.length - 1,
    Math.floor(rightNote + leeway),
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
  ctx.arc(receptorX(h), y + h / 2, receptorRadius * h, 0, 2 * Math.PI);
  ctx.strokeStyle = "#777777";
  ctx.lineWidth = 4.0;
  ctx.stroke();

  // draw scoring indicators
  for (const i of visibleNotes(t, canvas.width, h)) {
    const score = replay.scoreAt(i);
    if (score === null) continue;
    const width = Math.min(noteWidth * h, 2 * noteRadius * h);
    const x = msToPos(t, h, noteToMs(i)) - width / 2;
    ctx.fillStyle = scoreColor(score);
    ctx.fillRect(x, y, width, scoreHeight * h);
  }

  // go back to front because we want to draw earlier notes on top
  for (const i of visibleNotes(t, canvas.width, h)) {
    const x = msToPos(t, h, noteToMs(i));
    if (Math.abs(i) % 16 === 0) {
      // bar line
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + h);
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    }

    if (map.notes.charAt(i) === " ") continue;

    const score = replay.scoreAt(i);
    const eventIndex = replay.noteToEventMap[i];
    let dim = false;
    if (
      score === ReplayScore.Miss &&
      eventIndex !== null &&
      replay.events[eventIndex].pressTime <= t
    ) {
      // note was incorrectly hit, draw X
      drawNote(x, y + h / 2, noteRadius * h, map.notes.charAt(i), true);
      drawCross(x, y + h / 2, noteRadius * h);
    } else if (score !== ReplayScore.Miss) {
      const event = replay.events[eventIndex!];
      if (options.flyNotes) {
        // bounce animation
        const peakTime = 500; // ms
        const timeSinceHit = t - event.pressTime;
        const ratio = timeSinceHit / peakTime;
        let offsetY = 0;
        if (timeSinceHit > 0) {
          offsetY = -1.5 * h * (1 - (1 - ratio) * (1 - ratio));
        }
        drawNote(
          x,
          y + h / 2 + offsetY,
          noteRadius * h,
          map.notes.charAt(i),
          false,
        );
      } else {
        let dim = t > event.pressTime;
        drawNote(x, y + h / 2, noteRadius * h, map.notes.charAt(i), dim);
      }
    } else {
      drawNote(x, y + h / 2, noteRadius * h, map.notes.charAt(i), false);
      if (t > noteToMs(i) + missWindow) drawCross(x, y + h / 2, noteRadius * h);
    }
  }

  // draw keypress lines
  const leftMs = posToMs(t, h, 0);
  const rightMs = posToMs(t, h, canvas.width);
  const eventIndices = replay.eventsIntersecting(
    leftMs - leeway * map.ms_per_note,
    rightMs + leeway * map.ms_per_note,
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
    const noteX = msToPos(t, h, noteToMs(event.note));

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
    const width = Math.min(noteWidth * h, 2 * noteRadius * h);
    const x = msToPos(t, h, noteToMs(i)) - width / 2;
    ctx.fillStyle = scoreColor(score);
    ctx.fillRect(x, y, width, scoreHeight * h);
  }
}
