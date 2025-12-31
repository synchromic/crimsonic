type PlaybackStatus = "paused" | "playing" | "playingGrabbed";

class PlaybackState {
  ready = $state(false);
  private _status: PlaybackStatus = $state("paused");
  time = $state(0);
  playStart: Date | null = null;
  playStartTime: number | null = null;
  animationFrame: number | null = null;

  get status() {
    return this._status;
  }

  set status(newStatus: PlaybackStatus) {
    if (!this.ready) return;
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

  // more accurate time that isn't just updated every animation frame
  computeTime() {
    if (this.playStart === null || this.playStartTime === null)
      return this.time;
    return (
      this.playStartTime + (new Date().getTime() - this.playStart.getTime())
    );
  }

  private updateTime() {
    if (this.playStart !== null && this.playStartTime !== null) {
      this.time = this.computeTime();
      this.animationFrame = requestAnimationFrame(() => this.updateTime());
    }
  }

  private startPlaying() {
    this.playStart = new Date();
    this.playStartTime = this.time;
    if (this.animationFrame) {
      // hopefully prevent multiple animation frames from scheduling
      cancelAnimationFrame(this.animationFrame);
    }
    this.updateTime();
  }

  private stopPlaying() {
    this.playStart = null;
    this.playStartTime = null;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }
}

export const playbackState = new PlaybackState();
