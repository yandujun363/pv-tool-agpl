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
 * along with this program. If not, see <https://www.gnu.org/licenses/agpl-3.0.txt>.
 * 
 * Source repository: https://github.com/yandujun363/pv-tool-agpl
 */

// Manages WebSocket connection to Now Playing API and provides
// track, lyric, and playback state data to the engine.

import type { LyricLine } from './types';
import { parseLrc } from './lrc';

const WS_URL = 'ws://localhost:9863/api/ws/lyric';
const RECONNECT_DELAY = 2000;
const TEST_URL = 'http://localhost:9863/api/query';
const TEST_TIMEOUT = 800;

export interface NowPlayingTrack {
  title: string;
  author: string;
  cover: string;
  duration: number;
  album: string;
}

export interface NowPlayingCallbacks {
  onTrack: (track: NowPlayingTrack) => void;
  onLyric: (lines: LyricLine[] | null) => void;
  onPauseState: (isPaused: boolean) => void;
  onProgress: (progressMs: number) => void;
  onReplay: () => void;
}

/**
 * Test whether the Now Playing service is reachable.
 * Sends a GET request to the query endpoint with a timeout.
 * Returns true only if the response status is 200.
 */
export async function testNowPlayingConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TEST_TIMEOUT);
    const res = await fetch(TEST_URL, { signal: controller.signal });
    clearTimeout(timer);
    return res.status === 200;
  } catch {
    return false;
  }
}

export class NowPlayingProvider {
  private ws: WebSocket | null = null;
  private callbacks: NowPlayingCallbacks;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _active = false;

  constructor(callbacks: NowPlayingCallbacks) {
    this.callbacks = callbacks;
  }

  /** Start listening to Now Playing WebSocket. */
  connect(): void {
    if (this._active) return;
    this._active = true;
    this.doConnect();
  }

  /** Stop listening and close the WebSocket connection. */
  disconnect(): void {
    this._active = false;
    this.clearReconnect();
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  get active(): boolean {
    return this._active;
  }

  private doConnect(): void {
    if (!this._active) return;

    try {
      this.ws = new WebSocket(WS_URL);
    } catch (err) {
      console.warn('[NowPlaying] WebSocket creation failed:', err);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log('[NowPlaying] WebSocket connected');
    };

    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        this.handleMessage(msg);
      } catch (err) {
        console.warn('[NowPlaying] Failed to parse message:', err);
      }
    };

    this.ws.onerror = (err) => {
      console.warn('[NowPlaying] WebSocket error:', err);
    };

    this.ws.onclose = () => {
      console.warn('[NowPlaying] WebSocket closed');
      this.ws = null;
      this.scheduleReconnect();
    };
  }

  private handleMessage(msg: { event: string; data: any }): void {
    const { event, data } = msg;

    switch (event) {
      case 'Track':
        this.callbacks.onTrack({
          title: data.title ?? '',
          author: data.author ?? '',
          cover: data.cover ?? '',
          duration: data.duration ?? 0,
          album: data.album ?? '',
        });
        break;

      case 'Lyric': {
        if (data.hasLyric && data.lrc) {
          const lines = parseLrc(data.lrc);
          this.callbacks.onLyric(lines.length > 0 ? lines : null);
        } else {
          this.callbacks.onLyric(null);
        }
        break;
      }

      case 'PlayerPauseState':
        this.callbacks.onPauseState(!!data.isPaused);
        break;

      case 'PlayerProgress':
        this.callbacks.onProgress(data.progress ?? 0);
        break;

      case 'PlayerProgressReplay':
        this.callbacks.onReplay();
        break;

      default:
        // Ignore unknown events
        break;
    }
  }

  private scheduleReconnect(): void {
    if (!this._active) return;
    this.clearReconnect();
    this.reconnectTimer = setTimeout(() => {
      this.doConnect();
    }, RECONNECT_DELAY);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  destroy(): void {
    this.disconnect();
  }
}
