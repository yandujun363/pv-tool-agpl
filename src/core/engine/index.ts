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

import * as PIXI from "pixi.js";
import type {
  TemplateConfig,
  UpdateContext,
  ColorPalette,
  LayerType,
  MotionTargetInfo,
  LyricLine,
} from "../types";
import { createEffect, BaseEffect } from "../../effects";
import { extractDominantColors } from "../colorExtractor";
import { GlitchFilter } from "../glitchFilter";
import { BeatProvider } from "../beatProvider";
import { MotionDetector } from "../motionDetector";
import type { UnifiedConfig } from "../unifiedConfig";
import { MediaController } from "./mediaController";
import { LyricsManager } from "./lyricsManager";
import { ExternalSourceManager } from "./externalSourceManager";
import { PlaybackController } from "./playbackController";

const EFFECT_LAYERS: LayerType[] = [
  "background",
  "decoration",
  "text",
  "overlay",
];

export class PVEngine {
  // PIXI 核心
  private app: PIXI.Application;
  private layers = new Map<LayerType, PIXI.Container>();
  private effectsRoot!: PIXI.Container;
  private activeEffects: BaseEffect[] = [];
  private palette: ColorPalette = {
    background: "#ffffff",
    primary: "#000000",
    secondary: "#666666",
    accent: "#ff0000",
    text: "#000000",
  };
  private currentTemplate: TemplateConfig | null = null;

  // 滤镜和背景
  private hueFilter: PIXI.ColorMatrixFilter;
  private glitchFilter: GlitchFilter;
  private bgFill!: PIXI.Graphics;

  private _targetResolution: number | { width: number; height: number } | 'auto' = 'auto';
  private _targetFps: number | 'auto' = 'auto';
  
  private _scaleMode: 'stretch' | 'contain' = 'contain';

  // FPS监控数据
  private _pixiFps = 60;
  private _browserFps = 60;
  private _fpsCallback: ((pixiFps: number, browserFps: number) => void) | null = null;
  
  // 浏览器FPS监控
  private _rafId: number | null = null;
  private _lastBrowserFpsUpdate = 0;
  private _browserFrameCount = 0;
  
  // PIXI FPS监控
  private _lastPixiFpsUpdate = 0;
  private _pixiFrameCount = 0;

  private _userCustomSize = false;

  private _resizeObserver: ResizeObserver | null = null;

  // 标记是否已启动监控
  private _fpsMonitorStarted = false;

  private _renderPaused = false;


  // 模块化组件 (公开以供其他模块访问)
  readonly beat = new BeatProvider();
  readonly media: MediaController;
  readonly lyrics: LyricsManager;
  readonly external: ExternalSourceManager;
  readonly playback: PlaybackController;

  // 状态
  private _animationSpeed = 2;
  private _motionIntensity = 1;
  private _effectOpacity = 1;
  private _alphaMode = false;
  private _motionDetectionEnabled = false;
  private motionTargets: MotionTargetInfo[] = [];
  private motionDetector: MotionDetector | null = null;

  private _nativeDPR = 1;
  private _currentResolution = 1;
  private _resizeParent: HTMLElement | null = null;
  private _loading = false; // 内部使用，供模块访问
  private _bgColorOverride: string | null = null;
  private _tick = 0;
  private _time = 0; // 内部使用，供模块访问

  constructor() {
    this.app = new PIXI.Application();
    this.hueFilter = new PIXI.ColorMatrixFilter();
    this.glitchFilter = new GlitchFilter();

    // 初始化模块
    this.media = new MediaController(this);
    this.lyrics = new LyricsManager(this);
    this.external = new ExternalSourceManager(this);
    this.playback = new PlaybackController(this);
  }

  async init(parent: HTMLElement) {
    this._nativeDPR = Math.min(window.devicePixelRatio || 1, 3);
    this._currentResolution = this._nativeDPR;
    this._resizeParent = parent;

    await this.app.init({
      resizeTo: undefined,
      backgroundColor: 0x000000,
      backgroundAlpha: 0,
      antialias: true,
      resolution: this._nativeDPR,
      autoDensity: true,
      preserveDrawingBuffer: true,
    });
    parent.appendChild(this.app.canvas);

    this._resizeObserver = new ResizeObserver(() => {
      this.applyResolution();
    });
    this._resizeObserver.observe(parent);

    window.addEventListener('resize', () => {
      this.applyResolution();
    });

    // Media layer at the very bottom
    const mediaLayer = new PIXI.Container();
    this.layers.set("media", mediaLayer);
    this.app.stage.addChild(mediaLayer);

    // All effect layers inside one container, on top of media
    this.effectsRoot = new PIXI.Container();
    this.app.stage.addChild(this.effectsRoot);

    // Solid background fill as the first child — ensures full coverage over media
    this.bgFill = new PIXI.Graphics();
    this.effectsRoot.addChild(this.bgFill);

    for (const layerType of EFFECT_LAYERS) {
      const container = new PIXI.Container();
      this.layers.set(layerType, container);
      this.effectsRoot.addChild(container);
    }

    this.app.stage.filters = [this.hueFilter, this.glitchFilter];

    // 初始化模块
    this.media.init();
    this.lyrics.init();
    this.external.init();
    this.playback.init();

    this.app.ticker.add((ticker) => {
      if (this._renderPaused) return;
      const now = performance.now();
      const dt = (now - this.playback["_lastFrameTime"]) / 1000;
      this.playback["_lastFrameTime"] = now;

      const currentTime = this.playback.updateTime(dt);
      this._time = currentTime;

      this.update(currentTime, ticker.deltaTime / 60);
    });

    this._renderPaused = true;
    
    // 启动FPS监控
    this.startFpsMonitor();

    // 应用初始FPS设置
    this.applyFpsLimit();
    this.applyResolution();
  }


  /**
   * 暂停渲染更新
   */
  pauseRendering(): void {
    this._renderPaused = true;
  }

  /**
   * 恢复渲染更新
   */
  resumeRendering(): void {
    this._renderPaused = false;
    // 重置时间基准，避免delta过大
    this.playback["_lastFrameTime"] = performance.now();
  }

  /**
   * 检查渲染是否已启动
   */
  get isRenderingPaused(): boolean {
    return this._renderPaused;
  }



  /**
   * 启动双重FPS监控
   * - 浏览器FPS: 通过 requestAnimationFrame 测量
   * - PIXI FPS: 通过 PIXI ticker 测量实际更新频率
   */
  private startFpsMonitor(): void {
    if (this._fpsMonitorStarted) return;
    if (!this.app.ticker) {
      console.warn('[PVEngine] Cannot start FPS monitor: app.ticker not ready');
      return;
    }
    
    this._fpsMonitorStarted = true;
    
    // 监控 PIXI ticker 的实际更新频率
    this.app.ticker.add(() => {
      const now = performance.now();
      this._pixiFrameCount++;
      
      if (now - this._lastPixiFpsUpdate >= 1000) {
        this._pixiFps = this._pixiFrameCount;
        this._pixiFrameCount = 0;
        this._lastPixiFpsUpdate = now;
        this.notifyFpsUpdate();
      }
    });
    
    // 监控浏览器 requestAnimationFrame 的实际频率
    const monitorBrowserFps = () => {
      const now = performance.now();
      this._browserFrameCount++;
      
      if (now - this._lastBrowserFpsUpdate >= 1000) {
        this._browserFps = this._browserFrameCount;
        this._browserFrameCount = 0;
        this._lastBrowserFpsUpdate = now;
        this.notifyFpsUpdate();
      }
      
      this._rafId = requestAnimationFrame(monitorBrowserFps);
    };
    
    this._rafId = requestAnimationFrame(monitorBrowserFps);
  }

  private notifyFpsUpdate(): void {
    if (this._fpsCallback) {
      this._fpsCallback(this._pixiFps, this._browserFps);
    }
  }

  get scaleMode(): 'stretch' | 'contain' {
    return this._scaleMode;
  }
  
  set scaleMode(mode: 'stretch' | 'contain') {
    this._scaleMode = mode;
    this.applyResolution();
  }

  set onFpsUpdate(callback: ((pixiFps: number, browserFps: number) => void) | null) {
    this._fpsCallback = callback;
  }

  get targetResolution(): typeof this._targetResolution {
    return this._targetResolution;
  }

  set targetResolution(resolution: typeof this._targetResolution) {
    this._targetResolution = resolution;
    this._userCustomSize = resolution !== 'auto' && typeof resolution === 'object';
    this.applyResolution();
  }

  get pixiFps(): number {
    return this._pixiFps;
  }

  get browserFps(): number {
    return this._browserFps;
  }

  get targetFps(): number | 'auto' {
    return this._targetFps;
  }

  set targetFps(fps: number | 'auto') {
    this._targetFps = fps;
    this.applyFpsLimit();
  }

  private applyResolution(): void {
    if (!this.app.renderer) return;
    
    const parent = this._resizeParent;
    if (!parent) return;
    
    const baseWidth = parent.clientWidth;
    const baseHeight = parent.clientHeight;
    const baseAspect = baseWidth / baseHeight;
    
    let targetWidth: number;
    let targetHeight: number;
    let resolution = this._nativeDPR;
    
    if (this._targetResolution !== 'auto') {
      if (typeof this._targetResolution === 'number') {
        // 倍率模式：画布尺寸跟随窗口，分辨率倍率固定
        resolution = this._targetResolution;
        targetWidth = baseWidth;
        targetHeight = baseHeight;
      } else if (typeof this._targetResolution === 'object') {
        // 自定义宽高模式
        targetWidth = this._targetResolution.width;
        targetHeight = this._targetResolution.height;
        resolution = 1;
        this._userCustomSize = true;
      } else {
        targetWidth = baseWidth;
        targetHeight = baseHeight;
      }
    } else {
      // 自动模式
      targetWidth = baseWidth;
      targetHeight = baseHeight;
    }
    
    this._currentResolution = resolution;
    this.app.renderer.resolution = resolution;
    this.app.renderer.resize(targetWidth, targetHeight);
    
    // 根据缩放模式设置 CSS 样式
    if (this._scaleMode === 'contain') {
      // 保持比例模式
      const targetAspect = targetWidth / targetHeight;
      let displayWidth: number;
      let displayHeight: number;
      
      if (targetAspect > baseAspect) {
        displayWidth = baseWidth;
        displayHeight = baseWidth / targetAspect;
      } else {
        displayHeight = baseHeight;
        displayWidth = baseHeight * targetAspect;
      }
      
      this.app.canvas.style.width = `${displayWidth}px`;
      this.app.canvas.style.height = `${displayHeight}px`;
      this.app.canvas.style.position = 'absolute';
      this.app.canvas.style.top = '50%';
      this.app.canvas.style.left = '50%';
      this.app.canvas.style.transform = 'translate(-50%, -50%)';
      this.app.canvas.style.backgroundColor = '#000000';
    } else {
      // 拉伸模式
      this.app.canvas.style.width = `${baseWidth}px`;
      this.app.canvas.style.height = `${baseHeight}px`;
      this.app.canvas.style.position = '';
      this.app.canvas.style.transform = '';
      this.app.canvas.style.backgroundColor = '';
    }
    
    this.updateBgFill();
  }


  /**
   * 应用FPS限制到PIXI ticker
   * 这会控制效果更新的频率
   */
  private applyFpsLimit(): void {
    if (!this.app.ticker) return;
    
    if (this._targetFps === 'auto') {
      this.app.ticker.maxFPS = 0;  // 0 = 无限制
      return;
    }
    
    const fps = Math.max(10, Math.min(this._targetFps, 240));
    this.app.ticker.maxFPS = fps;
  }

  /**
   * 获取当前应该用于录制的FPS
   * 如果用户设置了自定义FPS则使用，否则使用浏览器当前FPS
   */
  getRecordingFps(): number {
    if (this._targetFps !== 'auto') {
      return this._targetFps as number;
    }
    // 自动模式：使用PIXI实际FPS，但限制在合理范围
    return Math.min(Math.max(this._pixiFps, 30), 60);
  }

  // ========== 公共 API ==========

  get paused() {
    return this.playback.paused;
  }

  pause() {
    this.playback.pause();
  }

  resume() {
    this.playback.resume();
  }

  seek(time: number) {
    this.playback.seek(time);
  }

  loadTemplate(template: TemplateConfig) {
    if (this._loading) return;
    this._loading = true;

    try {
      this.clearEffects();
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

      this.media.outlineEnabled = template.features?.mediaOutline ?? false;
      this._motionDetectionEnabled =
        template.features?.motionDetection ?? false;
      this.media.invertMediaEnabled = template.features?.invertMedia ?? false;
      this.media.thresholdMediaEnabled =
        template.features?.thresholdMedia ?? false;

      this.syncMotionDetector();

      if (
        template.features?.autoExtractColors &&
        this.media.mediaElementRef &&
        !this["_extractingColors"]
      ) {
        this.applyExtractedColors();
      }

      if (this._bgColorOverride) {
        this.palette.background = this._bgColorOverride;
      }
      if (!this._alphaMode) {
        this.app.renderer.background.color = new PIXI.Color(
          this.palette.background,
        ).toNumber();
      }
      this.updateBgFill();

      for (const entry of template.effects) {
        const layer = this.layers.get(entry.layer);
        if (!layer) continue;

        const config = { ...entry.config };
        const userText = this.lyrics.userTextValue;
        if (userText) {
          config._userText = this.lyrics.textSegmentsValue[0] || userText;
        }

        try {
          const effect = createEffect(entry.type, layer, config, this.palette);
          this.activeEffects.push(effect);
        } catch (err) {
          console.warn(
            `[PVEngine] Failed to create effect "${entry.type}":`,
            err,
          );
        }
      }

      if (template.postfx) {
        this.playback.applyPostFXConfig(template.postfx);
      } else {
        this.playback.applyPostFXConfig({
          shake: 0,
          zoom: 0,
          tilt: 0,
          glitch: 0,
          hueShift: 0,
        });
      }

      this.syncResolution();
    } finally {
      this._loading = false;
    }
  }

  reloadTemplate(): void {
    if (this.currentTemplate) {
      this.loadTemplate(this.currentTemplate);
    }
  }

  setText(text: string) {
    this.lyrics.setText(text);
  }

  setLyricTimeline(lines: LyricLine[]): void {
    this.lyrics.setLyricTimeline(lines);
  }

  clearLyricTimeline(): void {
    this.lyrics.clearLyricTimeline();
  }

  resetLyricCursor(): void {
    this.lyrics["lyricCursor"] = 0;
    this.lyrics["lastLyricTime"] = -1;
  }

  async addMedia(file: File, mode: "fit" | "free" = "fit") {
    await this.media.addMedia(file, mode);
    if (
      this.currentTemplate?.features?.autoExtractColors &&
      this.media.mediaElementRef &&
      !this["_extractingColors"]
    ) {
      this.applyExtractedColors();
    }
    this.syncMotionDetector();
  }

  setMediaOffset(dx: number, dy: number): void {
    this.media.setMediaOffset(dx, dy);
  }

  setMediaScale(scale: number): void {
    this.media.setMediaScale(scale);
  }

  getMediaState() {
    return this.media.getMediaState();
  }

  getMediaFile(): File | null {
    return this.media.mediaFile;
  }

  getAudioFile(): File | null {
    return this.beat.getAudioFile();
  }

  // Getter/Setter 委托
  get animationSpeed() {
    return this._animationSpeed;
  }
  set animationSpeed(val: number) {
    this._animationSpeed = val;
  }

  get motionIntensity() {
    return this._motionIntensity;
  }
  set motionIntensity(val: number) {
    this._motionIntensity = val;
  }

  get segmentDuration() {
    return this.lyrics.segmentDuration;
  }
  set segmentDuration(val: number) {
    this.lyrics.segmentDuration = val;
  }

  get effectOpacity() {
    return this._effectOpacity;
  }
  set effectOpacity(val: number) {
    this._effectOpacity = val;
    this.bgFill.alpha = val;
  }

  get alphaMode() {
    return this._alphaMode;
  }
  set alphaMode(val: boolean) {
    this._alphaMode = val;
    const bgLayer = this.layers.get("background");
    if (val) {
      this.bgFill.visible = false;
      if (bgLayer) bgLayer.visible = false;
      this.app.renderer.background.alpha = 0;
    } else {
      this.bgFill.visible = true;
      if (bgLayer) bgLayer.visible = true;
      this.app.renderer.background.alpha = 1;
    }
  }

  get nowPlayingListening() {
    return this.external.nowPlayingListening;
  }
  set nowPlayingListening(val: boolean) {
    this.external.nowPlayingListening = val;
  }

  get nowPlayingTrack() {
    return this.external.nowPlayingTrack;
  }

  get wesingCapListening() {
    return this.external.wesingCapListening;
  }
  set wesingCapListening(val: boolean) {
    this.external.wesingCapListening = val;
  }

  get wesingCapWsUrl() {
    return this.external.wesingCapWsUrl;
  }
  set wesingCapWsUrl(val: string | undefined) {
    this.external.wesingCapWsUrl = val;
  }

  get wesingCapSongTitle() {
    return this.external.wesingCapSongTitle;
  }

  set onWesingCapDisconnect(cb: (() => void) | undefined) {
    this.external.onWesingCapDisconnect = cb;
  }

  get shake() {
    return this.playback.shake;
  }
  set shake(val: number) {
    this.playback.shake = val;
  }

  get zoom() {
    return this.playback.zoom;
  }
  set zoom(val: number) {
    this.playback.zoom = val;
  }

  get tilt() {
    return this.playback.tilt;
  }
  set tilt(val: number) {
    this.playback.tilt = val;
  }

  get glitch() {
    return this.playback.glitch;
  }
  set glitch(val: number) {
    this.playback.glitch = val;
  }

  get beatReactivity() {
    return this.playback.beatReactivity;
  }
  set beatReactivity(val: number) {
    this.playback.beatReactivity = val;
  }

  get hueShift() {
    return this.playback.hueShift;
  }
  set hueShift(val: number) {
    this.playback.hueShift = val;
  }

  get canvasColor() {
    return this._bgColorOverride;
  }
  set canvasColor(color: string | null) {
    this._bgColorOverride = color;
    if (color) {
      this.palette.background = color;
      this.app.renderer.background.color = new PIXI.Color(color).toNumber();
      this.updateBgFill();
    } else if (this.currentTemplate) {
      this.palette.background = this.currentTemplate.palette.background;
      this.app.renderer.background.color = new PIXI.Color(
        this.palette.background,
      ).toNumber();
      this.updateBgFill();
    }
  }

  get canvas(): HTMLCanvasElement {
    return this.app.canvas as HTMLCanvasElement;
  }

  get playbackTime(): number {
    return this.playback.playbackTime;
  }

  get timelineDuration(): number {
    const npConfig = this.external.getNowPlayingConfig();
    if (npConfig.active && npConfig.duration > 0) {
      return npConfig.duration;
    }
    const wcConfig = this.external.getWesingCapConfig();
    if (wcConfig.active && wcConfig.duration > 0) {
      return wcConfig.duration;
    }

    const audioDuration = this.beat.duration;
    if (Number.isFinite(audioDuration) && audioDuration > 0) {
      return audioDuration;
    }

    const lyricConfig = this.lyrics.getConfig();
    if (lyricConfig.timeline && lyricConfig.timeline.length > 0) {
      return Math.max(
        lyricConfig.timeline[lyricConfig.timeline.length - 1].time + 2,
        1,
      );
    }

    return Math.max(
      lyricConfig.textSegments.length * lyricConfig.segmentDuration,
      lyricConfig.segmentDuration,
    );
  }

  getConfig(): UnifiedConfig {
    const lyricConfig = this.lyrics.getConfig();

    return {
      template: {
        name: this.currentTemplate?.name || "",
        palette: { ...this.palette },
        effects: this.currentTemplate?.effects?.map((e) => ({ ...e })) || [],
        bpm: this.beat.bpm,
        animationSpeed: this._animationSpeed,
        bgOpacity: this._effectOpacity,
        postfx: this.playback.getPostFXConfig(),
        features: {
          mediaOutline: this.media.outlineEnabled,
          autoExtractColors:
            this.currentTemplate?.features?.autoExtractColors ?? false,
          motionDetection: this._motionDetectionEnabled,
          invertMedia: this.media.invertMediaEnabled,
          thresholdMedia: this.media.thresholdMediaEnabled,
        },
      },
      playback: this.playback.getConfig(),
      text: {
        userText: lyricConfig.userText,
        textSegments: lyricConfig.textSegments,
        currentText: lyricConfig.currentText,
        segmentDuration: lyricConfig.segmentDuration,
      },
      lyric: {
        timeline: lyricConfig.timeline,
        offset: lyricConfig.offset,
        srtTimeline: lyricConfig.srtTimeline,
      },
      beat: {
        bpm: this.beat.bpm,
        reactivity: this.playback.beatReactivity,
        useAudio: this.beat.isAudioMode,
        currentIntensity: this.beat.getIntensity(this._time),
      },
      media: this.media.getMediaConfig(),
      effects: {
        alphaMode: this._alphaMode,
        effectOpacity: this._effectOpacity,
        motionIntensity: this._motionIntensity,
        beatReactivity: this.playback.beatReactivity,
      },
      postfx: this.playback.getPostFXConfig(),
      features: {
        mediaOutline: this.media.outlineEnabled,
        autoExtractColors:
          this.currentTemplate?.features?.autoExtractColors ?? false,
        motionDetection: this._motionDetectionEnabled,
        invertMedia: this.media.invertMediaEnabled,
        thresholdMedia: this.media.thresholdMediaEnabled,
        alphaMode: this._alphaMode,
      },
      nowPlaying: this.external.getNowPlayingConfig(),
      wesingCap: this.external.getWesingCapConfig(),
      render: {
        screenWidth: this.app.screen.width,
        screenHeight: this.app.screen.height,
        resolution: this._currentResolution,
        canvasColor: this._bgColorOverride,
        targetResolution: this._targetResolution,
        targetFps: this._targetFps,
        scaleMode: this._scaleMode,
      },
      motion: {
        enabled: this._motionDetectionEnabled,
        targets: [...this.motionTargets],
        intensity: this._motionIntensity,
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
      this.loadTemplate(tempTemplate);
    }

    if (config.playback) {
      this.playback.applyConfig(config.playback);
    }

    if (config.text) {
      this.lyrics.applyConfig(config.text);
    }

    if (config.lyric) {
      const lyricConfig = { ...config.lyric };
      if (lyricConfig.srtTimeline) {
        const convertedSrt = lyricConfig.srtTimeline.map((entry, idx) => ({
          index: idx + 1,
          startMs: entry.startMs,
          endMs: entry.endMs,
          text: entry.text,
        }));
        this.lyrics.setSrtTimeline(convertedSrt);
      } else if (lyricConfig.srtTimeline === null) {
        this.lyrics.setSrtTimeline(null);
      }

      if (lyricConfig.timeline !== undefined) {
        if (lyricConfig.timeline && lyricConfig.timeline.length > 0) {
          this.lyrics.setLyricTimeline(lyricConfig.timeline);
        } else {
          this.lyrics.clearLyricTimeline();
        }
      }
      if (lyricConfig.offset !== undefined) {
        this.lyrics.lyricOffset = lyricConfig.offset;
      }
    }

    if (config.beat) {
      if (config.beat.bpm !== undefined) this.beat.bpm = config.beat.bpm;
      if (config.beat.reactivity !== undefined)
        this.beatReactivity = config.beat.reactivity;
    }

    if (config.effects) {
      if (config.effects.alphaMode !== undefined)
        this.alphaMode = config.effects.alphaMode;
      if (config.effects.effectOpacity !== undefined)
        this.effectOpacity = config.effects.effectOpacity;
      if (config.effects.motionIntensity !== undefined)
        this.motionIntensity = config.effects.motionIntensity;
    }

    if (config.postfx) {
      this.playback.applyPostFXConfig(config.postfx);
    }

    if (config.media && config.media.hasMedia && config.media.url) {
      if (
        config.media.offsetX !== undefined ||
        config.media.offsetY !== undefined
      ) {
        this.setMediaOffset(
          config.media.offsetX || 0,
          config.media.offsetY || 0,
        );
      }
      if (config.media.scale !== undefined) {
        this.setMediaScale(config.media.scale);
      }
    }

    if (config.render?.canvasColor !== undefined) {
      this.canvasColor = config.render.canvasColor;
    }

    if (config.render?.targetResolution !== undefined) {
      this.targetResolution = config.render.targetResolution;
    }
    if (config.render?.targetFps !== undefined) {
      this.targetFps = config.render.targetFps;
    }

    if (config.render?.scaleMode !== undefined) {
      this.scaleMode = config.render.scaleMode;
    }

    this.external.applyConfig(config);
  }

  destroy() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._fpsMonitorStarted = false;
    this.external.destroy();
    this.media.destroy();
    this.lyrics.destroy();
    this.playback.destroy();
    this.clearEffects();
    this.app.destroy(true);
  }

  private _extractingColors = false;

  private applyExtractedColors(): void {
    if (!this.media.mediaElementRef) return;
    this._extractingColors = true;
    const colors = extractDominantColors(this.media.mediaElementRef);
    this.palette = {
      background: colors.primary,
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.complement,
      text: "#ffffff",
    };
    this._extractingColors = false;
  }

  private updateBgFill() {
    if (!this.bgFill) return;
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const pad = Math.max(w, h) * 0.5;
    this.bgFill.clear();
    this.bgFill.rect(-pad, -pad, w + pad * 2, h + pad * 2);
    this.bgFill.fill({ color: this.palette.background });
  }

  private syncResolution(): void {
    if (this._targetResolution !== 'auto') {
      return;
    }
    const n = this.activeEffects.length;
    const dpr = this._nativeDPR;
    const mobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;

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

  private syncMotionDetector(): void {
    if (
      this._motionDetectionEnabled &&
      this.media.mediaElementRef instanceof HTMLVideoElement
    ) {
      if (!this.motionDetector) {
        this.motionDetector = new MotionDetector();
      }
    } else {
      if (this.motionDetector) {
        this.motionDetector.destroy();
        this.motionDetector = null;
      }
      this.motionTargets = [];
    }
  }

  private clearEffects() {
    for (const e of this.activeEffects) {
      try {
        e.destroy();
      } catch {
        /* already destroyed */
      }
    }
    this.activeEffects = [];
    for (const [key, layer] of this.layers) {
      if (key !== "media" && layer.children.length > 0) {
        try {
          layer.removeChildren().forEach((c) => c.destroy());
        } catch {
          /* safe */
        }
      }
    }
  }

  private update(time: number, deltaTime: number) {
    const lyricClock = this.external.isExternalActive
      ? this.external.currentPlaybackTime
      : this.beat.isAudioMode
        ? this.beat.currentTime
        : time;
    this.playback.playbackTime = lyricClock;

    if (
      this.motionDetector &&
      this.media.mediaElementRef instanceof HTMLVideoElement
    ) {
      this.motionDetector.detect(this.media.mediaElementRef);
      const srcW = this.media.mediaElementRef.videoWidth || 1;
      const srcH = this.media.mediaElementRef.videoHeight || 1;
      this.motionTargets = this.motionDetector.getTargetsForDisplay(
        this.app.screen.width,
        this.app.screen.height,
        srcW,
        srcH,
      );
    }

    const ctx: UpdateContext = {
      time,
      deltaTime,
      screenWidth: this.app.screen.width,
      screenHeight: this.app.screen.height,
      palette: this.palette,
      animationSpeed: this._animationSpeed,
      motionIntensity: this._motionIntensity,
      currentText: this.lyrics.getDisplayText(lyricClock),
      beatIntensity:
        this.beat.getIntensity(time) * this.playback.beatReactivity,
      motionTargets: this.motionTargets,
    };

    this.updateBgFill();
    this.applyCameraFX(time);

    if (this.media.mediaElementRef) {
      this.media.updateOutline(this.media.mediaElementRef);
    }

    this._tick++;
    if (this._tick === 0x7fffffff) this._tick = 0;

    const n = this.activeEffects.length;
    const heavySkip = n > 15 ? 3 : n > 8 ? 2 : 0;

    for (const effect of this.activeEffects) {
      try {
        if (heavySkip && effect.heavy && this._tick % heavySkip !== 0) continue;
        effect.update(ctx);
      } catch (err) {
        console.warn(`[PVEngine] Effect "${effect.name}" update error:`, err);
      }
    }
  }

  private applyCameraFX(time: number): void {
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const cx = w / 2;
    const cy = h / 2;

    this.app.stage.pivot.set(cx, cy);

    let px = cx,
      py = cy;

    const beatShake =
      this.beat.getIntensity(time) * this.playback.beatReactivity;
    const totalShake = this.playback.shake + beatShake * 0.15;
    if (totalShake > 0) {
      px += (Math.random() - 0.5) * totalShake * 30;
      py += (Math.random() - 0.5) * totalShake * 20;
    }

    this.app.stage.position.set(px, py);
    this.app.stage.scale.set(1 + this.playback.zoom * 0.5);
    this.app.stage.rotation = this.playback.tilt * 0.3;

    this.glitchFilter.time = time;
  }
}

// 导出模块以便其他文件使用
export { MediaController } from "./mediaController";
export { LyricsManager, type SrtEntry } from "./lyricsManager";
export { ExternalSourceManager } from "./externalSourceManager";
export { PlaybackController } from "./playbackController";
