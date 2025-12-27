// TODO: rearchitect this because this fucking sucks

type PlaybackStatus = "paused" | "playing" | "playingGrabbed";

class PlaybackState {
  status: PlaybackStatus = $state("paused");
  time: number = $state(0);
  playStart: Date | null = null;
  playStartTime: number | null = null;
  animationFrame: number | null = null;

  constructor() {}

  private updateTime() {
    if (this.playStart !== null && this.playStartTime !== null) {
      this.time =
        this.playStartTime + (new Date().getTime() - this.playStart.getTime());
      this.animationFrame = requestAnimationFrame(() => this.updateTime());
    }
  }

  private startPlaying() {
    this.playStart = new Date();
    this.playStartTime = this.time;
    this.animationFrame = requestAnimationFrame(() => this.updateTime());
  }

  private stopPlaying() {
    this.playStart = null;
    this.playStartTime = null;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }

  setStatus(newStatus: PlaybackStatus) {
    if (this.status === newStatus) return;
    if (this.status === "paused" && newStatus === "playing") {
      this.startPlaying();
      this.status = newStatus;
    } else if (this.status === "playing" && newStatus === "paused") {
      this.stopPlaying();
      this.status = newStatus;
    } else if (this.status === "playing" && newStatus === "playingGrabbed") {
      this.stopPlaying();
      this.status = newStatus;
    } else if (this.status === "playingGrabbed" && newStatus === "playing") {
      this.startPlaying();
      this.status = newStatus;
    } else {
      throw new Error(
        `Undefined playback state transition: ${this.status} -> ${newStatus}`,
      );
    }
  }
}

export const playbackState = new PlaybackState();
