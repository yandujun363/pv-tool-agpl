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

import { EngineModule } from './engineModule';

export class PlaybackController extends EngineModule {
  private _time = 0;
  private _paused = false;
  _lastFrameTime = 0;
  private _playbackTime = 0;
  
  private _shake = 0;
  private _zoom = 0;
  private _tilt = 0;
  private _glitch = 0;
  private _hueShift = 0;
  private _beatReactivity = 0.5;

  init(): void {
    this._lastFrameTime = performance.now();
  }

  destroy(): void {}

  get paused(): boolean { return this._paused; }
  
  pause(): void {
    this._paused = true;
    this.engine.beat.pause();
  }
  
  resume(): void {
    this._paused = false;
    this._lastFrameTime = performance.now();
    this.engine.beat.resume();
  }
  
  seek(time: number): void {
    this._time = Math.max(0, time);
    this.engine.external.syncTime(this._time);
    if (this.engine.beat.isAudioMode) {
      this.engine.beat.seek(this._time);
    }
  }
  
  updateTime(deltaTime: number): number {
    if (this._paused) return this._time;
    
    if (this.engine.external.isExternalActive) {
      this._time = this.engine.external.currentPlaybackTime;
    } else if (this.engine.beat.isAudioMode) {
      this._time = this.engine.beat.currentTime;
    } else {
      this._time += deltaTime;
    }
    return this._time;
  }
  
  get playbackTime(): number { return this._playbackTime; }
  set playbackTime(val: number) { this._playbackTime = val; }
  
  get time(): number { return this._time; }
  
  get shake(): number { return this._shake; }
  set shake(val: number) { this._shake = val; }
  
  get zoom(): number { return this._zoom; }
  set zoom(val: number) { this._zoom = val; }
  
  get tilt(): number { return this._tilt; }
  set tilt(val: number) { this._tilt = val; }
  
  get glitch(): number { return this._glitch; }
  set glitch(val: number) { this._glitch = val; this.engine['glitchFilter'].intensity = val; }
  
  get hueShift(): number { return this._hueShift; }
  set hueShift(val: number) { 
    this._hueShift = val; 
    this.engine['hueFilter'].matrix = [1,0,0,0,0, 0,1,0,0,0, 0,0,1,0,0, 0,0,0,1,0];
    this.engine['hueFilter'].hue(val, false);
  }
  
  get beatReactivity(): number { return this._beatReactivity; }
  set beatReactivity(val: number) { this._beatReactivity = val; }
  
  getConfig() {
    return {
      time: this._time,
      paused: this._paused,
      duration: this.engine.timelineDuration,
    };
  }
  
  applyConfig(config: { time?: number; paused?: boolean } | undefined): void {
    if (!config) return;
    if (config.paused !== undefined) {
      config.paused ? this.pause() : this.resume();
    }
    if (config.time !== undefined) {
      this.seek(config.time);
    }
  }
  
  getPostFXConfig() {
    return {
      shake: this._shake,
      zoom: this._zoom,
      tilt: this._tilt,
      glitch: this._glitch,
      hueShift: this._hueShift,
    };
  }
  
  applyPostFXConfig(config: { shake?: number; zoom?: number; tilt?: number; glitch?: number; hueShift?: number } | undefined): void {
    if (!config) return;
    if (config.shake !== undefined) this.shake = config.shake;
    if (config.zoom !== undefined) this.zoom = config.zoom;
    if (config.tilt !== undefined) this.tilt = config.tilt;
    if (config.glitch !== undefined) this.glitch = config.glitch;
    if (config.hueShift !== undefined) this.hueShift = config.hueShift;
  }
}