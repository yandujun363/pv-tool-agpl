/*!
 * SPDX-License-Identifier: AGPL-3.0-only
 * 
 * PV Tool — AGPL Community Edition
 * Based on the last AGPL-3.0 version published on 2026-03-18
 * 
 * Copyright (c) 2026 DanteAlighieri13210914
 * Copyright (c) 2026 Contributors to PV Tool AGPL Community Edition
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3 of the License.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { EngineModule } from './engineModule';
import { NowPlayingProvider, type NowPlayingTrack } from '../nowPlayingProvider';
import { WesingCapProvider } from '../wesingCapProvider';

export class ExternalSourceManager extends EngineModule {
  private npProvider: NowPlayingProvider | null = null;
  private nwcProvider: WesingCapProvider | null = null;
  
  private _npActive = false;
  private _npPaused = false;
  private _npTime = 0;
  private _npDuration = 0;
  private _npTrack: NowPlayingTrack | null = null;
  private _npSavedUserText: string | null = null;
  
  private _nwcActive = false;
  private _nwcPaused = false;
  private _nwcTime = 0;
  private _nwcDuration = 0;
  private _nwcSongTitle = '';
  private _nwcSavedUserText: string | null = null;
  private _nwcWsUrl: string | undefined;
  
  private _nowPlayingListening = false;
  private _onNwcDisconnect: (() => void) | undefined;

  init(): void {}

  destroy(): void {
    this.stopNowPlaying();
    this.stopNwc();
  }

  get nowPlayingListening(): boolean { return this._nowPlayingListening; }
  set nowPlayingListening(val: boolean) {
    if (this._nowPlayingListening === val) return;
    this._nowPlayingListening = val;
    if (val) {
      this.startNowPlaying();
    } else {
      this.stopNowPlaying();
    }
  }

  get nowPlayingTrack(): NowPlayingTrack | null {
    return this._npActive ? this._npTrack : null;
  }

  get wesingCapListening(): boolean { return this._nwcActive; }
  set wesingCapListening(val: boolean) {
    if (this._nwcActive === val) return;
    if (val) {
      this.startNwc();
    } else {
      this.stopNwc();
    }
  }

  get wesingCapWsUrl(): string | undefined { return this._nwcWsUrl; }
  set wesingCapWsUrl(url: string | undefined) { this._nwcWsUrl = url; }

  get wesingCapSongTitle(): string {
    return this._nwcActive ? this._nwcSongTitle : '';
  }

  set onWesingCapDisconnect(cb: (() => void) | undefined) { this._onNwcDisconnect = cb; }

  get isExternalActive(): boolean { return this._npActive || this._nwcActive; }
  
  get currentPlaybackTime(): number {
    if (this._npActive) return this._npTime;
    if (this._nwcActive) return this._nwcTime;
    return 0;
  }

  syncTime(time: number): void {
    if (this._npActive) this._npTime = time;
    if (this._nwcActive) this._nwcTime = time;
  }

  getNowPlayingConfig() {
    return {
      active: this._npActive,
      listening: this._nowPlayingListening,
      track: this._npTrack ? { ...this._npTrack } : null,
      time: this._npTime,
      duration: this._npDuration,
      paused: this._npPaused,
    };
  }

  getWesingCapConfig() {
    return {
      active: this._nwcActive,
      listening: this._nwcActive,
      wsUrl: this._nwcWsUrl || null,
      songTitle: this._nwcSongTitle,
      time: this._nwcTime,
      duration: this._nwcDuration,
      paused: this._nwcPaused,
    };
  }

  applyConfig(config: { nowPlaying?: any; wesingCap?: any }): void {
    if (config.nowPlaying?.listening !== undefined) {
      this.nowPlayingListening = config.nowPlaying.listening;
    }
    if (config.wesingCap?.listening !== undefined) {
      this.wesingCapListening = config.wesingCap.listening;
    }
    if (config.wesingCap?.wsUrl !== undefined) {
      this._nwcWsUrl = config.wesingCap.wsUrl;
    }
  }

  private startNowPlaying(): void {
    if (this.npProvider) return;

    this._npActive = true;
    this._npPaused = false;
    this._npTime = 0;
    this._npDuration = 0;
    this._npTrack = null;
    this._npSavedUserText = this.engine['lyrics'].userTextValue;

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
            this.engine.setText(this._npTrack.title);
          }
        }
      },

      onPauseState: (isPaused) => {
        this._npPaused = isPaused;
      },

      onProgress: (progressMs) => {
        this._npTime = progressMs / 1000;
      },

      onReplay: () => {
        this._npTime = 0;
        this._npPaused = false;
        this.engine.resetLyricCursor();
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
      this.engine.setText(saved);
    }
    this.engine.reloadTemplate();
  }

  private startNwc(): void {
    if (this.nwcProvider) return;

    this._nwcActive = true;
    this._nwcPaused = false;
    this._nwcTime = 0;
    this._nwcDuration = 0;
    this._nwcSongTitle = '';
    this._nwcSavedUserText = this.engine['lyrics'].userTextValue;

    this.nwcProvider = new WesingCapProvider({
      onSongInfo: (name, _singer, title) => {
        this._nwcSongTitle = title || name;
      },

      onAllLyrics: (_lines, duration) => {
        this._nwcDuration = duration;
        this._nwcTime = 0;
        this._nwcPaused = false;
      },

      onLyric: (text, playTime) => {
        this._nwcTime = playTime;
        this._nwcPaused = false;
        this.engine.setText(text);
      },

      onLyricClear: () => {
        this.engine.clearLyricTimeline();
        this._nwcTime = 0;
        this._nwcDuration = 0;
        this._nwcPaused = true;
        this._nwcSongTitle = '';
        this.engine.setText('');
      },

      onPauseState: (isPaused) => {
        this._nwcPaused = isPaused;
      },

      onIdle: () => {
        this.engine.clearLyricTimeline();
        this._nwcTime = 0;
        this._nwcDuration = 0;
        this._nwcPaused = true;
        this._nwcSongTitle = '';
        this.engine.setText('');
      },

      onStatus: (status) => {
        if (status === 'standby' || status === 'waiting_process' || status === 'waiting_song') {
          this.engine.clearLyricTimeline();
          this._nwcTime = 0;
          this._nwcDuration = 0;
          this._nwcPaused = true;
          this._nwcSongTitle = '';
          this.engine.setText('');
        }
      },

      onDisconnect: () => {
        this._onNwcDisconnect?.();
      },
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
      this.engine.setText(saved);
    }
    this.engine.reloadTemplate();
  }
}