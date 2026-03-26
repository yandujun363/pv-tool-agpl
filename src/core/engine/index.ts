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

import * as PIXI from 'pixi.js';
import { EngineBase } from './EngineBase';
import { MediaManager } from './MediaManager';
import { NowPlayingManager } from './NowPlayingManager';
import { EffectManager } from './EffectManager';
import { StateManager } from './StateManager';
import type { TemplateConfig, UpdateContext } from '../types';
import type { UnifiedConfig } from '../unifiedConfig';

export class PVEngine extends EngineBase {
  private mediaManager: MediaManager;
  private nowPlayingManager: NowPlayingManager;
  private effectManager: EffectManager;
  private stateManager: StateManager;

  constructor() {
    super();
    this.mediaManager = new MediaManager(this);
    this.nowPlayingManager = new NowPlayingManager(this);
    this.effectManager = new EffectManager(this);
    this.stateManager = new StateManager(this);
  }

  protected updateTime(dt: number): void {
    if (!this._paused) {
      if (this.nowPlayingManager.isNowPlayingActive()) {
        this.nowPlayingManager.updateNowPlayingTime(dt);
        this._time = this.nowPlayingManager.getNowPlayingTime();
      } else if (this.nowPlayingManager.isNwcActive()) {
        this.nowPlayingManager.updateNwcTime(dt);
        this._time = this.nowPlayingManager.getNwcTime();
      } else if (this.beat.isAudioMode) {
        this._time = this.beat.currentTime;
      } else {
        this._time += dt;
      }
    }
    this.update(this._time, dt);
  }

  seek(time: number): void {
    super.seek(time);
    if (this.nowPlayingManager.isNowPlayingActive()) {
      // NP time is managed by provider
    } else if (this.nowPlayingManager.isNwcActive()) {
      // NWC time is managed by provider
    } else if (this.beat.isAudioMode) {
      this.beat.seek(this._time);
    }
  }

  loadTemplate(template: TemplateConfig): void {
    if (this._loading) return;
    this._loading = true;

    try {
      this.effectManager.loadTemplateEffects(template);
      this.currentTemplate = template;
      this.palette = { ...template.palette };

      this.beat.bpm = template.bpm ?? 120;
      if (template.animationSpeed !== undefined) {
        this._animationSpeed = template.animationSpeed;
      }
      if (template.bgOpacity !== undefined) {
        this._effectOpacity = template.bgOpacity;
        this.bgFill.alpha = template.bgOpacity;
      }

      this.mediaManager.outlineEnabled = template.features?.mediaOutline ?? false;
      this.mediaManager.motionDetectionEnabled = template.features?.motionDetection ?? false;
      this.mediaManager.invertMediaEnabled = template.features?.invertMedia ?? false;
      this.mediaManager.thresholdMediaEnabled = template.features?.thresholdMedia ?? false;

      if (template.features?.autoExtractColors && this.mediaManager.mediaFile && !(this.mediaManager as any).extractingColors) {
        // Color extraction handled by media manager on addMedia
      }

      if (this._bgColorOverride) {
        this.palette.background = this._bgColorOverride;
      }
      if (!this._alphaMode) {
        this.app.renderer.background.color = new PIXI.Color(this.palette.background).toNumber();
      }
      this.updateBgFill();

      if (template.postfx) {
        this._shake = template.postfx.shake ?? 0;
        this._zoom = template.postfx.zoom ?? 0;
        this._tilt = template.postfx.tilt ?? 0;
        this.glitch = template.postfx.glitch ?? 0;
        this.hueShift = template.postfx.hueShift ?? 0;
      }

      this.syncResolution();
    } finally {
      this._loading = false;
    }
  }

  setText(text: string): void {
    this.stateManager.setText(text);
  }

  getMediaFile(): File | null {
    return this.mediaManager.mediaFile;
  }

  getAudioFile(): File | null {
    return this.stateManager.audioFile;
  }

  getConfig(): UnifiedConfig {
    return this.stateManager.getConfig();
  }

  applyConfig(config: Partial<UnifiedConfig>): void {
    this.stateManager.applyConfig(config);
  }

  get segmentDuration(): number {
    return this.stateManager.segmentDuration;
  }
  set segmentDuration(val: number) {
    this.stateManager.segmentDuration = val;
  }

  get beatReactivity(): number {
    return this.stateManager.beatReactivity;
  }
  set beatReactivity(val: number) {
    this.stateManager.beatReactivity = val;
  }

  setSrtTimeline(entries: { startMs: number; endMs: number; text: string }[] | null): void {
    this.stateManager.setSrtTimeline(entries);
  }

  setLyricTimeline(lines: any[]): void {
    this.stateManager.setLyricTimeline(lines);
  }

  clearLyricTimeline(): void {
    this.stateManager.clearLyricTimeline();
  }

  get hasLyricTimeline(): boolean {
    return this.stateManager.hasLyricTimeline;
  }

  get lyricLineCount(): number {
    return this.stateManager.lyricLineCount;
  }

  set lyricOffset(val: number) {
    this.stateManager.lyricOffset = val;
  }
  get lyricOffset(): number {
    return this.stateManager.lyricOffset;
  }

  get timelineDuration(): number {
    return this.stateManager.getTimelineDuration(
      this.nowPlayingManager.isNowPlayingActive(),
      this.nowPlayingManager.isNwcActive(),
      this.nowPlayingManager.getNpDuration(),
      this.nowPlayingManager.getNwcDuration()
    );
  }

  get nowPlayingListening(): boolean {
    return this.nowPlayingManager.nowPlayingListening;
  }
  set nowPlayingListening(val: boolean) {
    this.nowPlayingManager.nowPlayingListening = val;
  }

  get nowPlayingTrack() {
    return this.nowPlayingManager.nowPlayingTrack;
  }

  get wesingCapListening(): boolean {
    return this.nowPlayingManager.wesingCapListening;
  }
  set wesingCapListening(val: boolean) {
    this.nowPlayingManager.wesingCapListening = val;
  }

  get wesingCapWsUrl(): string | undefined {
    return this.nowPlayingManager.wesingCapWsUrl;
  }
  set wesingCapWsUrl(url: string | undefined) {
    this.nowPlayingManager.wesingCapWsUrl = url;
  }

  get wesingCapSongTitle(): string {
    return this.nowPlayingManager.wesingCapSongTitle;
  }

  set onWesingCapDisconnect(cb: (() => void) | undefined) {
    this.nowPlayingManager.onWesingCapDisconnect = cb;
  }

  async addMedia(file: File, mode: 'fit' | 'free' = 'fit'): Promise<void> {
    return this.mediaManager.addMedia(file, mode);
  }

  setMediaOffset(dx: number, dy: number): void {
    this.mediaManager.setMediaOffset(dx, dy);
  }

  setMediaScale(scale: number): void {
    this.mediaManager.setMediaScale(scale);
  }

  getMediaState(): { offsetX: number; offsetY: number; scale: number } | null {
    return this.mediaManager.getMediaState();
  }

  destroy(): void {
    this.nowPlayingManager.destroy();
    this.mediaManager.destroy();
    this.effectManager.destroy();
    this.stateManager.destroy();
    super.destroy();
  }

  private syncResolution(): void {
    const n = this.effectManager.getEffectCount();
    const dpr = this._nativeDPR;
    const mobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    let target: number;
    if (mobile) {
      if (n <= 4) target = Math.min(dpr, 2);
      else if (n <= 8) target = Math.min(dpr, 1.5);
      else target = 1;
    } else {
      if (n <= 6) target = dpr;
      else if (n <= 12) target = Math.min(dpr, 2);
      else if (n <= 18) target = Math.min(dpr, 1.5);
      else target = 1;
    }

    target = Math.round(target * 4) / 4;

    if (target !== this._currentResolution) {
      this._currentResolution = target;
      this.app.renderer.resolution = target;
      if (this._resizeParent) {
        const w = this._resizeParent.clientWidth;
        const h = this._resizeParent.clientHeight;
        this.app.renderer.resize(w, h);
      }
    }
  }

  private update(time: number, deltaTime: number): void {
    const lyricClock = this.nowPlayingManager.isNowPlayingActive()
      ? this.nowPlayingManager.getNowPlayingTime()
      : this.beat.isAudioMode
        ? this.beat.currentTime
        : time;
    this._playbackTime = lyricClock;

    this.mediaManager.updateMotion();
    this.mediaManager.updateOutline();

    const ctx: UpdateContext = {
      time,
      deltaTime,
      screenWidth: this.app.screen.width,
      screenHeight: this.app.screen.height,
      palette: this.palette,
      animationSpeed: this._animationSpeed,
      motionIntensity: this._motionIntensity,
      currentText: this.stateManager.getDisplayText(lyricClock,
        this.nowPlayingManager.isNowPlayingActive(),
        this.nowPlayingManager.isNwcActive()),
      beatIntensity: this.beat.getIntensity(time) * this.beatReactivity,
      motionTargets: this.mediaManager.motionTargets,
    };

    this.updateBgFill();
    this.applyCameraFX(time);

    this._tick++;
    if (this._tick === 0x7fffffff) this._tick = 0;

    this.effectManager.updateEffects(ctx, this._tick);
  }

  private applyCameraFX(time: number): void {
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const cx = w / 2;
    const cy = h / 2;

    this.app.stage.pivot.set(cx, cy);

    let px = cx, py = cy;

    const beatShake = this.beat.getIntensity(time) * this.beatReactivity;
    const totalShake = this._shake + beatShake * 0.15;
    if (totalShake > 0) {
      px += (Math.random() - 0.5) * totalShake * 30;
      py += (Math.random() - 0.5) * totalShake * 20;
    }

    this.app.stage.position.set(px, py);
    this.app.stage.scale.set(1 + this._zoom * 0.5);
    this.app.stage.rotation = this._tilt * 0.3;

    this.glitchFilter.time = time;
  }
}