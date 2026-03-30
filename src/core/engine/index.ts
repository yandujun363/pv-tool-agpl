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
  LyricLine,
  LayerType,
} from "../types";
import { extractDominantColors } from "../colorExtractor";
import { BeatProvider } from "../beatProvider";
import { MotionDetector } from "../motionDetector";
import type { UnifiedConfig } from "../unifiedConfig";
import { MediaController } from "./mediaController";
import { LyricsManager } from "./lyricsManager";
import { ExternalSourceManager } from "./externalSourceManager";
import { PlaybackController } from "./playbackController";
import { EngineCore } from "./engineCore";
import { EngineConfig } from "./engineConfig";
import { EngineFps } from "./engineFps";
import { EngineResolution } from "./engineResolution";
import { EngineState } from "./engineState";

export class PVEngine {
  // 核心模块 (公开以供其他模块访问)
  readonly beat = new BeatProvider();
  readonly media: MediaController;
  readonly lyrics: LyricsManager;
  readonly external: ExternalSourceManager;
  readonly playback: PlaybackController;

  // 内部模块
  readonly core: EngineCore;
  readonly config: EngineConfig;
  readonly fps: EngineFps;
  readonly resolution: EngineResolution;
  private state: EngineState;

  // 其他依赖
  private motionDetector: MotionDetector | null = null;
  private extractingColors = false;

  constructor() {
    const app = new PIXI.Application();

    // 初始化核心模块
    this.core = new EngineCore(this, app);
    this.config = new EngineConfig(this);
    this.fps = new EngineFps(this);
    this.resolution = new EngineResolution(this);
    this.state = new EngineState(this);

    // 初始化业务模块
    this.media = new MediaController(this);
    this.lyrics = new LyricsManager(this);
    this.external = new ExternalSourceManager(this);
    this.playback = new PlaybackController(this);
  }

  async init(parent: HTMLElement) {
    this.resolution.nativeDPR = Math.min(window.devicePixelRatio || 1, 3);
    this.resolution.resizeParent = parent;

    await this.core.app.init({
      resizeTo: undefined,
      backgroundColor: 0x000000,
      backgroundAlpha: 0,
      antialias: true,
      resolution: this.resolution.nativeDPR,
      autoDensity: true,
      preserveDrawingBuffer: true,
    });
    parent.appendChild(this.core.app.canvas);

    // 初始化分辨率观察器
    this.resolution.initResizeObserver(parent, () => {
      this.applyResolution();
    });

    // 初始化图层
    this.core.initLayers();

    // 初始化模块
    this.media.init();
    this.lyrics.init();
    this.external.init();
    this.playback.init();

    // 启动渲染循环
    this.core.startRenderLoop((dt: number) => this.playback.updateTime(dt));

    this.core.renderPaused = true;

    // 启动FPS监控
    this.fps.startFpsMonitor();

    // 应用初始FPS设置
    this.fps.targetFps = this.fps.targetFps;
    this.applyResolution();
  }

  // ========== 渲染控制 ==========

  pauseRendering(): void {
    this.core.renderPaused = true;
  }

  resumeRendering(): void {
    this.core.renderPaused = false;
    this.playback.lastFrameTime = performance.now();
  }

  get isRenderingPaused(): boolean {
    return this.core.renderPaused;
  }

  // ========== FPS 相关 ==========

  get targetFps(): number | "auto" {
    return this.fps.targetFps;
  }

  set targetFps(fps: number | "auto") {
    this.fps.targetFps = fps;
  }

  get pixiFps(): number {
    return this.fps.pixiFps;
  }

  get browserFps(): number {
    return this.fps.browserFps;
  }

  set onFpsUpdate(
    callback: ((pixiFps: number, browserFps: number) => void) | null,
  ) {
    this.fps.onFpsUpdate = callback;
  }

  getRecordingFps(): number {
    return this.fps.getRecordingFps();
  }

  // ========== 分辨率相关 ==========

  get targetResolution(): number | { width: number; height: number } | "auto" {
    return this.resolution.targetResolution;
  }

  set targetResolution(resolution: typeof this.resolution.targetResolution) {
    this.resolution.targetResolution = resolution;
  }

  get scaleMode(): "stretch" | "contain" {
    return this.resolution.scaleMode;
  }

  set scaleMode(mode: "stretch" | "contain") {
    this.resolution.scaleMode = mode;
  }

  private applyResolution(): void {
    this.resolution.applyResolution();
  }

  private syncResolution(): void {
    this.resolution.syncResolution(this.config["activeEffects"]?.length || 0);
  }

  // ========== 播放控制 ==========

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

  // ========== 模板和文本 ==========

  loadTemplate(template: TemplateConfig) {
    if (this.state.loading) return;
    this.state.loading = true;

    this.config.loadTemplate(template, {
      onBeforeLoad: () => {},
      onAfterLoad: () => {
        this.state.loading = false;
      },
      onSyncMotionDetector: () => this.syncMotionDetector(),
      onApplyExtractedColors: () => this.applyExtractedColors(),
      onUpdateBgFill: () =>
        this.core.updateBgFill(this.config.paletteValue.background),
      onSyncResolution: () => this.syncResolution(),
    });
  }

  reloadTemplate(): void {
    this.config.reloadTemplate({
      onBeforeLoad: () => {},
      onAfterLoad: () => {
        this.state.loading = false;
      },
      onSyncMotionDetector: () => this.syncMotionDetector(),
      onApplyExtractedColors: () => this.applyExtractedColors(),
      onUpdateBgFill: () =>
        this.core.updateBgFill(this.config.paletteValue.background),
      onSyncResolution: () => this.syncResolution(),
    });
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

  // ========== 媒体控制 ==========

  async addMedia(file: File, mode: "fit" | "free" = "fit") {
    await this.media.addMedia(file, mode);
    if (
      this.config.currentTemplateValue?.features?.autoExtractColors &&
      this.media.mediaElementRef &&
      !this.extractingColors
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

  // ========== Getter/Setter 委托 ==========

  get animationSpeed() {
    return this.state.animationSpeed;
  }
  set animationSpeed(val: number) {
    this.state.animationSpeed = val;
  }

  get motionIntensity() {
    return this.state.motionIntensity;
  }
  set motionIntensity(val: number) {
    this.state.motionIntensity = val;
  }

  get segmentDuration() {
    return this.lyrics.segmentDuration;
  }
  set segmentDuration(val: number) {
    this.lyrics.segmentDuration = val;
  }

  get effectOpacity() {
    return this.state.effectOpacity;
  }
  set effectOpacity(val: number) {
    this.state.effectOpacity = val;
  }

  get alphaMode() {
    return this.state.alphaMode;
  }
  set alphaMode(val: boolean) {
    this.state.alphaMode = val;
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
    return this.config.bgColorOverride;
  }
  set canvasColor(color: string | null) {
    this.config.bgColorOverride = color;
    if (color) {
      this.config.updatePalette(
        color,
        this.config.paletteValue.primary,
        this.config.paletteValue.secondary,
        this.config.paletteValue.accent,
        this.config.paletteValue.text,
      );
      this.core.app.renderer.background.color = new PIXI.Color(
        color,
      ).toNumber();
      this.core.updateBgFill(color);
    } else if (this.config.currentTemplateValue) {
      const bg = this.config.currentTemplateValue.palette.background;
      this.config.updatePalette(
        bg,
        this.config.paletteValue.primary,
        this.config.paletteValue.secondary,
        this.config.paletteValue.accent,
        this.config.paletteValue.text,
      );
      this.core.app.renderer.background.color = new PIXI.Color(bg).toNumber();
      this.core.updateBgFill(bg);
    }
  }

  get canvas(): HTMLCanvasElement {
    return this.core.app.canvas as HTMLCanvasElement;
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

  // ========== 配置管理 ==========

  getConfig(): UnifiedConfig {
    const lyricConfig = this.lyrics.getConfig();

    return {
      template: {
        name: this.config.currentTemplateValue?.name || "",
        palette: { ...this.config.paletteValue },
        effects:
          this.config.currentTemplateValue?.effects?.map((e) => ({ ...e })) ||
          [],
        bpm: this.beat.bpm,
        animationSpeed: this.state.animationSpeed,
        bgOpacity: this.state.effectOpacity,
        postfx: this.playback.getPostFXConfig(),
        features: {
          mediaOutline: this.media.outlineEnabled,
          autoExtractColors:
            this.config.currentTemplateValue?.features?.autoExtractColors ??
            false,
          motionDetection: this.state.motionDetectionEnabled,
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
        currentIntensity: this.beat.getIntensity(this.state.time),
      },
      media: this.media.getMediaConfig(),
      effects: {
        alphaMode: this.state.alphaMode,
        effectOpacity: this.state.effectOpacity,
        motionIntensity: this.state.motionIntensity,
        beatReactivity: this.playback.beatReactivity,
      },
      postfx: this.playback.getPostFXConfig(),
      features: {
        mediaOutline: this.media.outlineEnabled,
        autoExtractColors:
          this.config.currentTemplateValue?.features?.autoExtractColors ??
          false,
        motionDetection: this.state.motionDetectionEnabled,
        invertMedia: this.media.invertMediaEnabled,
        thresholdMedia: this.media.thresholdMediaEnabled,
        alphaMode: this.state.alphaMode,
      },
      nowPlaying: this.external.getNowPlayingConfig(),
      wesingCap: this.external.getWesingCapConfig(),
      render: {
        screenWidth: this.core.app.screen.width,
        screenHeight: this.core.app.screen.height,
        resolution: this.resolution.currentResolution,
        canvasColor: this.config.bgColorOverride,
        targetResolution: this.resolution.targetResolution,
        targetFps: this.fps.targetFps,
        scaleMode: this.resolution.scaleMode,
      },
      motion: {
        enabled: this.state.motionDetectionEnabled,
        targets: [...this.state.motionTargetsValue],
        intensity: this.state.motionIntensity,
      },
    };
  }

  applyConfig(config: Partial<UnifiedConfig>): void {
    // 模板配置
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

    // 播放配置
    if (config.playback) {
      this.playback.applyConfig(config.playback);
    }

    // 文本配置
    if (config.text) {
      this.lyrics.applyConfig(config.text);
    }

    // 歌词配置
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

    // 节拍配置
    if (config.beat) {
      if (config.beat.bpm !== undefined) this.beat.bpm = config.beat.bpm;
      if (config.beat.reactivity !== undefined)
        this.beatReactivity = config.beat.reactivity;
    }

    // 效果配置
    if (config.effects) {
      if (config.effects.alphaMode !== undefined)
        this.alphaMode = config.effects.alphaMode;
      if (config.effects.effectOpacity !== undefined)
        this.effectOpacity = config.effects.effectOpacity;
      if (config.effects.motionIntensity !== undefined)
        this.motionIntensity = config.effects.motionIntensity;
    }

    // 后处理配置
    if (config.postfx) {
      this.playback.applyPostFXConfig(config.postfx);
    }

    // 媒体配置
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

    // 渲染配置
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
    this.resolution.destroy();
    this.fps.destroy();
    this.config.destroy();
    this.external.destroy();
    this.media.destroy();
    this.lyrics.destroy();
    this.playback.destroy();
    this.core.destroy();
  }

  // ========== 私有方法 ==========

  private applyExtractedColors(): void {
    if (!this.media.mediaElementRef) return;
    this.extractingColors = true;
    const colors = extractDominantColors(this.media.mediaElementRef);
    this.config.updatePalette(
      colors.primary,
      colors.primary,
      colors.secondary,
      colors.complement,
      "#ffffff",
    );
    this.extractingColors = false;
  }

  private syncMotionDetector(): void {
    if (
      this.state.motionDetectionEnabled &&
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
      this.state.motionTargetsValue = [];
    }
  }

  private _update(time: number, deltaTime: number): void {
    const lyricClock = this.external.isExternalActive
      ? this.external.currentPlaybackTime
      : this.beat.isAudioMode
        ? this.beat.currentTime
        : time;
    this.playback.playbackTime = lyricClock;

    // 运动检测
    if (
      this.motionDetector &&
      this.media.mediaElementRef instanceof HTMLVideoElement
    ) {
      this.motionDetector.detect(this.media.mediaElementRef);
      const srcW = this.media.mediaElementRef.videoWidth || 1;
      const srcH = this.media.mediaElementRef.videoHeight || 1;
      this.state.motionTargetsValue = this.motionDetector.getTargetsForDisplay(
        this.core.app.screen.width,
        this.core.app.screen.height,
        srcW,
        srcH,
      );
    }

    const ctx: UpdateContext = {
      time,
      deltaTime,
      screenWidth: this.core.app.screen.width,
      screenHeight: this.core.app.screen.height,
      palette: this.config.paletteValue,
      animationSpeed: this.state.animationSpeed,
      motionIntensity: this.state.motionIntensity,
      currentText: this.lyrics.getDisplayText(lyricClock),
      beatIntensity:
        this.beat.getIntensity(time) * this.playback.beatReactivity,
      motionTargets: this.state.motionTargetsValue,
    };

    this.core.updateBgFill(this.config.paletteValue.background);
    this.core.applyCameraFX(
      time,
      this.playback.shake,
      this.playback.zoom,
      this.playback.tilt,
      this.playback.beatReactivity,
      this.beat,
    );

    if (this.media.mediaElementRef) {
      this.media.updateOutline(this.media.mediaElementRef);
    }

    this.core.incrementTick();

    const n = this.config["activeEffects"]?.length || 0;
    const heavySkip = n > 15 ? 3 : n > 8 ? 2 : 0;

    this.config.updateEffects(ctx, heavySkip);
  }

  // ========== 内部访问接口（供其他模块使用） ==========

  /**
   * 获取内部 PIXI Application
   */
  getApp(): PIXI.Application {
    return this.core.app;
  }

  /**
   * 获取图层容器
   */
  getLayers(): Map<LayerType, PIXI.Container> {
    return this.core.layers;
  }

  /**
   * 获取色相滤镜
   */
  getHueFilter(): PIXI.ColorMatrixFilter {
    return this.core.hueFilter;
  }

  /**
   * 获取 Glitch 滤镜
   */
  getGlitchFilter(): any {
    return this.core.glitchFilter;
  }

  /**
   * 获取当前时间（内部使用）
   */
  getInternalTime(): number {
    return this.state.time;
  }

  /**
   * 获取加载状态
   */
  isLoading(): boolean {
    return this.state.loading;
  }

  /**
   * 设置加载状态
   */
  setLoading(val: boolean): void {
    this.state.loading = val;
  }

  /**
   * 获取背景填充对象
   */
  getBgFill(): PIXI.Graphics {
    return this.core.bgFill;
  }

  /**
   * 同步运动检测器（内部使用）
   */
  syncMotionDetectorInternal(): void {
    this.syncMotionDetector();
  }

  /**
   * 应用提取的颜色（内部使用）
   */
  applyExtractedColorsInternal(): void {
    this.applyExtractedColors();
  }

  /**
   * 更新背景填充（内部使用）
   */
  updateBgFillInternal(): void {
    this.core.updateBgFill(this.config.paletteValue.background);
  }

  /**
   * 同步分辨率（内部使用）
   */
  syncResolutionInternal(): void {
    this.syncResolution();
  }

  /**
   * 获取效果数量
   */
  getActiveEffectsCount(): number {
    return this.config["activeEffects"]?.length || 0;
  }

  /**
   * 更新所有效果
   */
  updateEffectsInternal(ctx: UpdateContext, heavySkip: number): void {
    this.config.updateEffects(ctx, heavySkip);
  }

  // 供内部模块访问的私有方法
  _setTime(time: number): void {
    this.state.time = time;
  }

  _setMotionDetectionEnabled(val: boolean): void {
    this.state.motionDetectionEnabled = val;
  }
}

// 导出模块以便其他文件使用
export { MediaController } from "./mediaController";
export { LyricsManager, type SrtEntry } from "./lyricsManager";
export { ExternalSourceManager } from "./externalSourceManager";
export { PlaybackController } from "./playbackController";
