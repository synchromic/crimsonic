type PlaybackStatus = "paused" | "playing" | "playingGrabbed";

class PlaybackState {
  private _status: PlaybackStatus = $state("paused");
  time: number = $state(0);
  playStart: Date | null = null;
  playStartTime: number | null = null;
  animationFrame: number | null = null;

  get status() {
    return this._status;
  }

  set status(newStatus: PlaybackStatus) {
    if (this._status === newStatus) return;
    if (this._status === "paused" && newStatus === "playing") {
      this.startPlaying();
      this._status = newStatus;
    } else if (this._status === "playing" && newStatus === "paused") {
      this.stopPlaying();
      this._status = newStatus;
    } else if (this._status === "playing" && newStatus === "playingGrabbed") {
      this.stopPlaying();
      this._status = newStatus;
    } else if (this._status === "playingGrabbed" && newStatus === "playing") {
      this.startPlaying();
      this._status = newStatus;
    } else {
      throw new Error(
        `Undefined playback state transition: ${this._status} -> ${newStatus}`,
      );
    }
  }

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
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame(() => this.updateTime());
  }

  private stopPlaying() {
    this.playStart = null;
    this.playStartTime = null;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }
}

export const playbackState = new PlaybackState();
