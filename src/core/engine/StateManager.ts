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

import type { TemplateConfig, LyricLine } from '../types';
import type { UnifiedConfig } from '../unifiedConfig';

export class StateManager {
  private engine: any;
  
  private _userText = '';
  private _textSegments: string[] = ['春を告げる'];
  private _segmentDuration = 3;
  
  private _lyricTimeline: LyricLine[] | null = null;
  private _lyricOffsetSeconds = 0;
  public lyricCursor = 0;
  public lastLyricTime = -1;
  private _srtTimeline: { startMs: number; endMs: number; text: string }[] | null = null;
  
  private _beatReactivity = 0.5;
  
  private _mediaFile: File | null = null;
  private _audioFile: File | null = null;

  constructor(engine: any) {
    this.engine = engine;
  }

  get segmentDuration() { return this._segmentDuration; }
  set segmentDuration(val: number) { this._segmentDuration = val; }
  
  get beatReactivity() { return this._beatReactivity; }
  set beatReactivity(val: number) { this._beatReactivity = val; }
  
  get userText() { return this._userText; }
  set userText(val: string) { this._userText = val; }
  
  get textSegments() { return this._textSegments; }
  set textSegments(val: string[]) { this._textSegments = val; }
  
  get lyricTimeline() { return this._lyricTimeline; }
  
  get lyricOffset() { return this._lyricOffsetSeconds; }
  set lyricOffset(val: number) { this._lyricOffsetSeconds = val; }
  
  get srtTimeline() { return this._srtTimeline; }
  
  get mediaFile() { return this._mediaFile; }
  set mediaFile(val: File | null) { this._mediaFile = val; }
  
  get audioFile() { return this._audioFile; }
  set audioFile(val: File | null) { this._audioFile = val; }

  setText(text: string): void {
    this.clearLyricTimeline();
    this._userText = text;
    this._textSegments = text.split('/').map(s => s.trim()).filter(s => s.length > 0);
    if (this._textSegments.length === 0) {
      this._textSegments = [''];
    }
    if (this.engine.currentTemplate) {
      this.engine.loadTemplate(this.engine.currentTemplate);
    }
  }

  setSrtTimeline(entries: { startMs: number; endMs: number; text: string }[] | null): void {
    this._srtTimeline = entries;
    if (entries && entries.length > 0) {
      this.clearLyricTimeline();
    }
  }

  setLyricTimeline(lines: LyricLine[]): void {
    if (lines.length === 0) {
      this.clearLyricTimeline();
      return;
    }

    this._srtTimeline = null;
    this._lyricTimeline = [...lines].sort((a, b) => a.time - b.time);
    this.lyricCursor = 0;
    this.lastLyricTime = -1;

    this._userText = this._lyricTimeline[0].text;
    this._textSegments = [this._userText];

    if (this.engine.currentTemplate) {
      this.engine.loadTemplate(this.engine.currentTemplate);
    }
  }

  clearLyricTimeline(): void {
    this._lyricTimeline = null;
    this.lyricCursor = 0;
    this.lastLyricTime = -1;
    this._lyricOffsetSeconds = 0;
  }

  get hasLyricTimeline(): boolean {
    return !!this._lyricTimeline && this._lyricTimeline.length > 0;
  }

  get lyricLineCount(): number {
    return this._lyricTimeline?.length ?? 0;
  }

  getDisplayText(time: number, _npActive: boolean, nwcActive: boolean): string {
    if (nwcActive) {
      const segIdx = this._textSegments.length > 1
        ? Math.floor(time / this._segmentDuration) % this._textSegments.length
        : 0;
      return this._textSegments[segIdx] || '';
    }

    if (this._srtTimeline) {
      const ms = time * 1000;
      const entry = this._srtTimeline.find(e => ms >= e.startMs && ms < e.endMs);
      return entry?.text ?? '';
    }

    if (!this._lyricTimeline || this._lyricTimeline.length === 0) {
      const segIdx = this._textSegments.length > 1
        ? Math.floor(time / this._segmentDuration) % this._textSegments.length
        : 0;
      return this._textSegments[segIdx] || '';
    }

    const t = Math.max(0, time + this._lyricOffsetSeconds);
    if (t < this.lastLyricTime) {
      this.lyricCursor = 0;
    }
    this.lastLyricTime = t;

    while (this.lyricCursor + 1 < this._lyricTimeline.length && this._lyricTimeline[this.lyricCursor + 1].time <= t) {
      this.lyricCursor++;
    }
    while (this.lyricCursor > 0 && this._lyricTimeline[this.lyricCursor].time > t) {
      this.lyricCursor--;
    }

    if (t < this._lyricTimeline[0].time) return '';
    return this._lyricTimeline[this.lyricCursor].text;
  }

  getTimelineDuration(npActive: boolean, nwcActive: boolean, npDuration: number, nwcDuration: number): number {
    if (npActive && npDuration > 0) return npDuration;
    if (nwcActive && nwcDuration > 0) return nwcDuration;

    const audioDuration = this.engine.beat.duration;
    if (Number.isFinite(audioDuration) && audioDuration > 0) return audioDuration;

    if (this._lyricTimeline && this._lyricTimeline.length > 0) {
      return Math.max(this._lyricTimeline[this._lyricTimeline.length - 1].time + 2, 1);
    }

    return Math.max(this._textSegments.length * this._segmentDuration, this._segmentDuration);
  }

  getConfig(): UnifiedConfig {
    const currentTemplate = this.engine.currentTemplate;
    const palette = this.engine.palette;
    const beat = this.engine.beat;
    const mediaManager = this.engine.mediaManager;
    const nowPlayingManager = this.engine.nowPlayingManager;
    const time = this.engine._time;
    const paused = this.engine._paused;
    const playbackTime = this.engine._playbackTime;
    const alphaMode = this.engine._alphaMode;
    const effectOpacity = this.engine._effectOpacity;
    const motionIntensity = this.engine._motionIntensity;
    const shake = this.engine._shake;
    const zoom = this.engine._zoom;
    const tilt = this.engine._tilt;
    const glitch = this.engine._glitch;
    const hueShift = this.engine._hueShift;
    const bgColorOverride = this.engine._bgColorOverride;
    const app = this.engine.app;
    const currentResolution = this.engine._currentResolution;

    const mediaState = mediaManager.getMediaState();
    const hasMedia = !!(mediaManager.mediaFile);
    const mediaType = mediaManager.mediaElementRef instanceof HTMLVideoElement ? 'video' 
      : mediaManager.mediaElementRef instanceof HTMLImageElement ? 'image' : null;

    return {
      template: {
        name: currentTemplate?.name || '',
        palette: { ...palette },
        effects: currentTemplate?.effects?.map((e: any) => ({ ...e })) || [],
        bpm: beat.bpm,
        animationSpeed: this.engine._animationSpeed,
        bgOpacity: effectOpacity,
        postfx: { shake, zoom, tilt, glitch, hueShift },
        features: {
          mediaOutline: mediaManager.outlineEnabled,
          autoExtractColors: currentTemplate?.features?.autoExtractColors ?? false,
          motionDetection: mediaManager.motionDetectionEnabled,
          invertMedia: mediaManager.invertMediaEnabled,
          thresholdMedia: mediaManager.thresholdMediaEnabled,
        },
      },
      playback: {
        time: time,
        paused: paused,
        duration: this.getTimelineDuration(
          nowPlayingManager.isNowPlayingActive(),
          nowPlayingManager.isNwcActive(),
          nowPlayingManager.getNpDuration(),
          nowPlayingManager.getNwcDuration()
        ),
      },
      text: {
        userText: this._userText,
        textSegments: [...this._textSegments],
        currentText: this.getDisplayText(playbackTime,
          nowPlayingManager.isNowPlayingActive(),
          nowPlayingManager.isNwcActive()),
        segmentDuration: this._segmentDuration,
      },
      lyric: {
        timeline: this._lyricTimeline ? [...this._lyricTimeline] : null,
        offset: this._lyricOffsetSeconds,
        srtTimeline: this._srtTimeline ? [...this._srtTimeline] : null,
      },
      beat: {
        bpm: beat.bpm,
        reactivity: this._beatReactivity,
        useAudio: beat.isAudioMode,
        currentIntensity: beat.getIntensity(time),
      },
      media: {
        hasMedia,
        type: mediaType,
        url: null,
        offsetX: mediaState?.offsetX ?? 0,
        offsetY: mediaState?.offsetY ?? 0,
        scale: mediaState?.scale ?? 1,
        mode: 'fit',
      },
      effects: {
        alphaMode: alphaMode,
        effectOpacity: effectOpacity,
        motionIntensity: motionIntensity,
        beatReactivity: this._beatReactivity,
      },
      postfx: { shake, zoom, tilt, glitch, hueShift },
      features: {
        mediaOutline: mediaManager.outlineEnabled,
        autoExtractColors: currentTemplate?.features?.autoExtractColors ?? false,
        motionDetection: mediaManager.motionDetectionEnabled,
        invertMedia: mediaManager.invertMediaEnabled,
        thresholdMedia: mediaManager.thresholdMediaEnabled,
        alphaMode: alphaMode,
      },
      nowPlaying: {
        active: nowPlayingManager.isNowPlayingActive(),
        listening: nowPlayingManager.nowPlayingListening,
        track: nowPlayingManager.nowPlayingTrack ? { ...nowPlayingManager.nowPlayingTrack } : null,
        time: nowPlayingManager.getNowPlayingTime(),
        duration: nowPlayingManager.getNpDuration(),
        paused: false,
      },
      wesingCap: {
        active: nowPlayingManager.isNwcActive(),
        listening: nowPlayingManager.isNwcActive(),
        wsUrl: nowPlayingManager.wesingCapWsUrl || null,
        songTitle: nowPlayingManager.wesingCapSongTitle,
        time: nowPlayingManager.getNwcTime(),
        duration: nowPlayingManager.getNwcDuration(),
        paused: false,
      },
      render: {
        screenWidth: app.screen.width,
        screenHeight: app.screen.height,
        resolution: currentResolution,
        canvasColor: bgColorOverride,
      },
      motion: {
        enabled: mediaManager.motionDetectionEnabled,
        targets: [...mediaManager.motionTargets],
        intensity: motionIntensity,
      },
    };
  }

  applyConfig(config: Partial<UnifiedConfig>): void {
    if (config.template) {
      const tpl = config.template;
      const tempTemplate: TemplateConfig = {
        name: tpl.name,
        palette: tpl.palette,
        effects: tpl.effects,
        bpm: tpl.bpm,
        animationSpeed: tpl.animationSpeed,
        bgOpacity: tpl.bgOpacity,
        postfx: tpl.postfx,
        features: tpl.features,
      };
      this.engine.loadTemplate(tempTemplate);
    }

    if (config.playback) {
      if (config.playback.paused !== undefined) {
        config.playback.paused ? this.engine.pause() : this.engine.resume();
      }
      if (config.playback.time !== undefined) {
        this.engine.seek(config.playback.time);
      }
    }

    if (config.text) {
      if (config.text.userText !== undefined) {
        this.setText(config.text.userText);
      }
      if (config.text.segmentDuration !== undefined) {
        this.segmentDuration = config.text.segmentDuration;
      }
    }

    if (config.lyric) {
      if (config.lyric.timeline !== undefined) {
        if (config.lyric.timeline && config.lyric.timeline.length > 0) {
          this.setLyricTimeline(config.lyric.timeline);
        } else {
          this.clearLyricTimeline();
        }
      }
      if (config.lyric.offset !== undefined) {
        this.lyricOffset = config.lyric.offset;
      }
      if (config.lyric.srtTimeline !== undefined) {
        this.setSrtTimeline(config.lyric.srtTimeline);
      }
    }

    if (config.beat) {
      if (config.beat.bpm !== undefined) {
        this.engine.beat.bpm = config.beat.bpm;
      }
      if (config.beat.reactivity !== undefined) {
        this.beatReactivity = config.beat.reactivity;
      }
    }

    if (config.effects) {
      if (config.effects.alphaMode !== undefined) {
        this.engine.alphaMode = config.effects.alphaMode;
      }
      if (config.effects.effectOpacity !== undefined) {
        this.engine.effectOpacity = config.effects.effectOpacity;
      }
      if (config.effects.motionIntensity !== undefined) {
        this.engine.motionIntensity = config.effects.motionIntensity;
      }
    }

    if (config.postfx) {
      if (config.postfx.shake !== undefined) this.engine.shake = config.postfx.shake;
      if (config.postfx.zoom !== undefined) this.engine.zoom = config.postfx.zoom;
      if (config.postfx.tilt !== undefined) this.engine.tilt = config.postfx.tilt;
      if (config.postfx.glitch !== undefined) this.engine.glitch = config.postfx.glitch;
      if (config.postfx.hueShift !== undefined) this.engine.hueShift = config.postfx.hueShift;
    }

    if (config.media && config.media.hasMedia && config.media.url) {
      if (config.media.offsetX !== undefined || config.media.offsetY !== undefined) {
        this.engine.setMediaOffset(config.media.offsetX || 0, config.media.offsetY || 0);
      }
      if (config.media.scale !== undefined) {
        this.engine.setMediaScale(config.media.scale);
      }
    }

    if (config.render?.canvasColor !== undefined) {
      this.engine.canvasColor = config.render.canvasColor;
    }
  }

  destroy(): void {
    this.clearLyricTimeline();
  }
}