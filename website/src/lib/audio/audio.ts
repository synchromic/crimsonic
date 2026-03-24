export const audioCtx = new AudioContext();

function createGains(): { [name: string]: GainNode } {
  let master = audioCtx.createGain();
  master.gain.setValueAtTime(0.3, audioCtx.currentTime);
  master.connect(audioCtx.destination);
  let music = audioCtx.createGain();
  music.gain.setValueAtTime(1.0, audioCtx.currentTime);
  music.connect(master);
  let effect = audioCtx.createGain();
  effect.gain.setValueAtTime(0.8, audioCtx.currentTime);
  effect.connect(master);
  return { master, music, effect };
}

export const gains = createGains();
