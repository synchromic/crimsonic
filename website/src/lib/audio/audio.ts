export const audioCtx = new AudioContext();

function createGains(): { [name: string]: GainNode } {
  let master = audioCtx.createGain();
  master.connect(audioCtx.destination);
  let music = audioCtx.createGain();
  music.connect(master);
  let effect = audioCtx.createGain();
  effect.connect(master);
  return { master, music, effect };
}

export const gains = createGains();
