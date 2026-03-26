// PV Tool — Copyright (c) 2026 DanteAlighieri13210914
// Licensed under AGPL-3.0. For commercial use, see COMMERCIAL.md

import { NowPlayingProvider } from '../nowPlayingProvider';
import type { NowPlayingTrack } from '../nowPlayingProvider';
import { WesingCapProvider } from '../wesingCapProvider';

export class NowPlayingManager {
  private engine: any;
  
  private npProvider: NowPlayingProvider | null = null;
  private _npActive = false;
  private _npPaused = false;
  private _npTime = 0;
  private _npDuration = 0;
  private _npTrack: NowPlayingTrack | null = null;
  private _npSavedUserText: string | null = null;
  private _nowPlayingListening = false;

  private nwcProvider: WesingCapProvider | null = null;
  private _nwcActive = false;
  private _nwcPaused = false;
  private _nwcTime = 0;
  private _nwcDuration = 0;
  private _nwcSongTitle = '';
  private _nwcSavedUserText: string | null = null;
  private _nwcWsUrl: string | undefined = undefined;
  private _onNwcDisconnect: (() => void) | undefined;

  constructor(engine: any) {
    this.engine = engine;
  }

  get nowPlayingListening() { return this._nowPlayingListening; }
  set nowPlayingListening(val: boolean) {
    if (this._nowPlayingListening === val) return;
    this._nowPlayingListening = val;
    if (val) this.startNowPlaying();
    else this.stopNowPlaying();
  }

  get nowPlayingTrack(): NowPlayingTrack | null { return this._npActive ? this._npTrack : null; }

  get wesingCapListening() { return this._nwcActive; }
  set wesingCapListening(val: boolean) {
    if (this._nwcActive === val) return;
    if (val) this.startNwc();
    else this.stopNwc();
  }

  get wesingCapWsUrl(): string | undefined { return this._nwcWsUrl; }
  set wesingCapWsUrl(url: string | undefined) { 
    this._nwcWsUrl = url;
    if (this.nwcProvider) {
      this.nwcProvider.wsUrl = url || '';
    }
  }

  get wesingCapSongTitle(): string { return this._nwcActive ? this._nwcSongTitle : ''; }
  set onWesingCapDisconnect(cb: (() => void) | undefined) { this._onNwcDisconnect = cb; }

  updateNowPlayingTime(dt: number): void {
    if (this._npActive && !this._npPaused) {
      this._npTime += dt;
    }
  }

  updateNwcTime(dt: number): void {
    if (this._nwcActive && !this._nwcPaused) {
      this._nwcTime += dt;
    }
  }

  getNowPlayingTime(): number { return this._npTime; }
  getNwcTime(): number { return this._nwcTime; }
  isNwcActive(): boolean { return this._nwcActive; }
  isNowPlayingActive(): boolean { return this._npActive; }
  getNwcDuration(): number { return this._nwcDuration; }
  getNpDuration(): number { return this._npDuration; }

  private startNowPlaying(): void {
    if (this.npProvider) return;

    this._npActive = true;
    this._npPaused = false;
    this._npTime = 0;
    this._npDuration = 0;
    this._npTrack = null;
    this._npSavedUserText = this.engine.userText;

    this.npProvider = new NowPlayingProvider({
      onTrack: (track) => {
        this._npTrack = track;
        this._npDuration = track.duration;
        this._npTime = 0;
        this._npPaused = false;
      },
      onLyric: (lines) => {
        if (lines && lines.length > 0) {
          this.engine.setLyricTimeline(lines);
        } else {
          this.engine.clearLyricTimeline();
          if (this._npTrack) {
            this.engine.userText = this._npTrack.title;
            this.engine.textSegments = [this._npTrack.title];
          }
        }
      },
      onPauseState: (isPaused) => { this._npPaused = isPaused; },
      onProgress: (progressMs) => { this._npTime = progressMs / 1000; },
      onReplay: () => {
        this._npTime = 0;
        this._npPaused = false;
        this.engine.lyricCursor = 0;
        this.engine.lastLyricTime = -1;
      },
    });
    this.npProvider.connect();
  }

  private stopNowPlaying(): void {
    if (this.npProvider) {
      this.npProvider.destroy();
      this.npProvider = null;
    }
    this._npActive = false;
    this._npPaused = false;
    this._npTime = 0;
    this._npDuration = 0;
    this._npTrack = null;

    this.engine.clearLyricTimeline();
    const saved = this._npSavedUserText;
    this._npSavedUserText = null;
    if (saved !== null) {
      this.engine.userText = saved;
      this.engine.textSegments = saved.split('/').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      if (this.engine.textSegments.length === 0) {
        this.engine.textSegments = [''];
      }
    }
    if (this.engine.currentTemplate) {
      this.engine.loadTemplate(this.engine.currentTemplate);
    }
  }

  private startNwc(): void {
    if (this.nwcProvider) return;

    this._nwcActive = true;
    this._nwcPaused = false;
    this._nwcTime = 0;
    this._nwcDuration = 0;
    this._nwcSongTitle = '';
    this._nwcSavedUserText = this.engine.userText;

    this.nwcProvider = new WesingCapProvider({
      onSongInfo: (name, _singer, title) => { this._nwcSongTitle = title || name; },
      onAllLyrics: (_lines, duration) => {
        this._nwcDuration = duration;
        this._nwcTime = 0;
        this._nwcPaused = false;
      },
      onLyric: (text, playTime) => {
        this._nwcTime = playTime;
        this._nwcPaused = false;
        this.engine.userText = text;
        this.engine.textSegments = [text];
      },
      onLyricClear: () => {
        this.engine.clearLyricTimeline();
        this._nwcTime = 0;
        this._nwcDuration = 0;
        this._nwcPaused = true;
        this._nwcSongTitle = '';
        this.engine.userText = '';
        this.engine.textSegments = [''];
      },
      onPauseState: (isPaused) => { this._nwcPaused = isPaused; },
      onIdle: () => {
        this.engine.clearLyricTimeline();
        this._nwcTime = 0;
        this._nwcDuration = 0;
        this._nwcPaused = true;
        this._nwcSongTitle = '';
        this.engine.userText = '';
        this.engine.textSegments = [''];
      },
      onStatus: (status) => {
        if (status === 'standby' || status === 'waiting_process' || status === 'waiting_song') {
          this.engine.clearLyricTimeline();
          this._nwcTime = 0;
          this._nwcDuration = 0;
          this._nwcPaused = true;
          this._nwcSongTitle = '';
          this.engine.userText = '';
          this.engine.textSegments = [''];
        }
      },
      onDisconnect: () => { this._onNwcDisconnect?.(); },
    }, this._nwcWsUrl);

    this.nwcProvider.connect();
  }

  private stopNwc(): void {
    if (this.nwcProvider) {
      this.nwcProvider.destroy();
      this.nwcProvider = null;
    }
    this._nwcActive = false;
    this._nwcPaused = false;
    this._nwcTime = 0;
    this._nwcDuration = 0;
    this._nwcSongTitle = '';

    this.engine.clearLyricTimeline();
    const saved = this._nwcSavedUserText;
    this._nwcSavedUserText = null;
    if (saved !== null) {
      this.engine.userText = saved;
      this.engine.textSegments = saved.split('/').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      if (this.engine.textSegments.length === 0) {
        this.engine.textSegments = [''];
      }
    }
    if (this.engine.currentTemplate) {
      this.engine.loadTemplate(this.engine.currentTemplate);
    }
  }

  destroy(): void {
    this.stopNowPlaying();
    this.stopNwc();
  }
}