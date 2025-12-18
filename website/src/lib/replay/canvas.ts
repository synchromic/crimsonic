import map from "../../assets/map.json";

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
export function drawFrame(t: number, y: number, h: number) {
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
    ctx.fillStyle = map.data.charAt(i) === "d" ? "#ff0000" : "#0000ff";
    ctx.fill();
    ctx.lineWidth = 4.0;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
  }
}
