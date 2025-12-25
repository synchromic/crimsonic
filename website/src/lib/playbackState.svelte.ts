class PlaybackState {
  private _playing = $state(false);
  private _playStart: Date | null = $state(null);
  private _initialTime = $state(0); // in ms

  constructor() {}

  get time() {
    if (this._playing) {
      return (
        new Date().getTime() - this._playStart!.getTime() + this._initialTime
      );
    } else {
      return this._initialTime;
    }
  }

  set time(time: number) {
    this._initialTime = time;
    if (this._playing) {
      this._playStart = new Date();
    }
  }

  get playing() {
    return this._playing;
  }

  set playing(playing: boolean) {
    if (playing === this._playing) return;
    if (playing && !this._playing) {
      this._playing = true;
      this._playStart = new Date();
      // initialTime is still the same
    } else {
      // setting playing to false
      this._initialTime = this.time; // using getter to compute the pause time
      this._playing = false;
      this._playStart = null;
    }
  }
}

export const playbackState = new PlaybackState();
