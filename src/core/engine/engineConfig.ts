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
import type { TemplateConfig, ColorPalette, UpdateContext } from "../types";
import type { UnifiedConfig } from "../unifiedConfig";
import { createEffect, BaseEffect } from "../../effects";
import type { PVEngine } from "./index";

/**
 * 配置管理 - 负责模板加载、效果管理和统一配置的获取/应用
 */
export class EngineConfig {
  private engine: PVEngine;

  public activeEffects: BaseEffect[] = [];
  private palette: ColorPalette = {
    background: "#ffffff",
    primary: "#000000",
    secondary: "#666666",
    accent: "#ff0000",
    text: "#000000",
  };
  private currentTemplate: TemplateConfig | null = null;
  private _bgColorOverride: string | null = null;

  constructor(engine: PVEngine) {
    this.engine = engine;
  }

  get paletteValue(): ColorPalette {
    return this.palette;
  }

  get currentTemplateValue(): TemplateConfig | null {
    return this.currentTemplate;
  }

  get bgColorOverride(): string | null {
    return this._bgColorOverride;
  }

  set bgColorOverride(color: string | null) {
    this._bgColorOverride = color;
  }

  /**
   * 加载模板
   */
  loadTemplate(
    template: TemplateConfig,
    callbacks: {
      onBeforeLoad: () => void;
      onAfterLoad: () => void;
      onSyncMotionDetector: () => void;
      onApplyExtractedColors: () => void;
      onUpdateBgFill: () => void;
      onSyncResolution: () => void;
    },
  ): void {
    callbacks.onBeforeLoad();

    try {
      this.clearEffects();
      this.currentTemplate = template;
      this.palette = { ...template.palette };

      this.engine.beat.bpm = template.bpm ?? 120;
      if (template.animationSpeed !== undefined) {
        this.engine.animationSpeed = template.animationSpeed;
      }
      if (template.bgOpacity !== undefined) {
        this.engine.effectOpacity = template.bgOpacity;
        this.engine.getBgFill().alpha = template.bgOpacity;
      }

      this.engine.media.outlineEnabled =
        template.features?.mediaOutline ?? false;
      this.engine.setMotionDetectionEnabled(
        template.features?.motionDetection ?? false,
      );
      this.engine.media.invertMediaEnabled =
        template.features?.invertMedia ?? false;
      this.engine.media.thresholdMediaEnabled =
        template.features?.thresholdMedia ?? false;

      callbacks.onSyncMotionDetector();

      if (
        template.features?.autoExtractColors &&
        this.engine.media.mediaElementRef &&
        !this.engine.extractingColors
      ) {
        callbacks.onApplyExtractedColors();
      }

      if (this._bgColorOverride) {
        this.palette.background = this._bgColorOverride;
      }
      if (!this.engine.alphaMode) {
        this.engine.getApp().renderer.background.color = new PIXI.Color(
          this.palette.background,
        ).toNumber();
      }
      callbacks.onUpdateBgFill();

      for (const entry of template.effects) {
        const layer = this.engine.getLayers().get(entry.layer);
        if (!layer) continue;

        const config = { ...entry.config };
        const userText = this.engine.lyrics.userTextValue;
        if (userText) {
          config._userText =
            this.engine.lyrics.textSegmentsValue[0] || userText;
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
        this.engine.playback.applyPostFXConfig(template.postfx);
      } else {
        this.engine.playback.applyPostFXConfig({
          shake: 0,
          zoom: 0,
          tilt: 0,
          glitch: 0,
          hueShift: 0,
        });
      }

      callbacks.onSyncResolution();
    } finally {
      callbacks.onAfterLoad();
    }
  }

  /**
   * 重新加载当前模板
   */
  reloadTemplate(callbacks: Parameters<EngineConfig["loadTemplate"]>[1]): void {
    if (this.currentTemplate) {
      this.loadTemplate(this.currentTemplate, callbacks);
    }
  }

  /**
   * 清除所有效果
   */
  clearEffects(): void {
    for (const e of this.activeEffects) {
      try {
        e.destroy();
      } catch {
        // already destroyed
      }
    }
    this.activeEffects = [];
    for (const [key, layer] of this.engine.getLayers()) {
      if (key !== "media" && layer.children.length > 0) {
        try {
          layer.removeChildren().forEach((c: any) => c.destroy());
        } catch {
          // safe
        }
      }
    }
  }

  /**
   * 更新所有效果
   */
  updateEffects(ctx: UpdateContext, heavySkip: number): void {
    for (const effect of this.activeEffects) {
      try {
        if (
          heavySkip &&
          effect.heavy &&
          this.engine.getInternalTick() % heavySkip !== 0
        )
          continue;
        effect.update(ctx);
      } catch (err) {
        console.warn(`[PVEngine] Effect "${effect.name}" update error:`, err);
      }
    }
  }

  /**
   * 更新调色板
   */
  updatePalette(
    background: string,
    primary: string,
    secondary: string,
    accent: string,
    text: string,
  ): void {
    this.palette = { background, primary, secondary, accent, text };
  }

  /**
   * 获取统一配置
   */
  getUnifiedConfig(): UnifiedConfig {
    const lyricConfig = this.engine.lyrics.getConfig();
    const nowPlayingConfig = this.engine.external.getNowPlayingConfig();
    const wesingCapConfig = this.engine.external.getWesingCapConfig();

    return {
      template: {
        name: this.currentTemplate?.name || "",
        palette: { ...this.palette },
        effects: this.currentTemplate?.effects?.map((e) => ({ ...e })) || [],
        bpm: this.engine.beat.bpm,
        animationSpeed: this.engine.animationSpeed,
        bgOpacity: this.engine.effectOpacity,
        postfx: this.engine.playback.getPostFXConfig(),
        features: {
          mediaOutline: this.engine.media.outlineEnabled,
          autoExtractColors: this.currentTemplate?.features?.autoExtractColors ?? false,
          motionDetection: this.engine.motionDetectionEnabled,
          invertMedia: this.engine.media.invertMediaEnabled,
          thresholdMedia: this.engine.media.thresholdMediaEnabled,
        },
      },
      playback: this.engine.playback.getConfig(),
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
        bpm: this.engine.beat.bpm,
        reactivity: this.engine.beatReactivity,
        useAudio: this.engine.beat.isAudioMode,
        currentIntensity: this.engine.beat.getIntensity(this.engine.playbackTime),
      },
      media: this.engine.media.getMediaConfig(),
      effects: {
        alphaMode: this.engine.alphaMode,
        effectOpacity: this.engine.effectOpacity,
        motionIntensity: this.engine.motionIntensity,
        beatReactivity: this.engine.beatReactivity,
      },
      postfx: this.engine.playback.getPostFXConfig(),
      features: {
        mediaOutline: this.engine.media.outlineEnabled,
        autoExtractColors: this.currentTemplate?.features?.autoExtractColors ?? false,
        motionDetection: this.engine.motionDetectionEnabled,
        invertMedia: this.engine.media.invertMediaEnabled,
        thresholdMedia: this.engine.media.thresholdMediaEnabled,
        alphaMode: this.engine.alphaMode,
      },
      nowPlaying: nowPlayingConfig,
      wesingCap: wesingCapConfig,
      render: {
        screenWidth: this.engine.getApp().screen.width,
        screenHeight: this.engine.getApp().screen.height,
        resolution: this.engine.resolution.currentResolution,
        canvasColor: this._bgColorOverride,
        targetResolution: this.engine.resolution.targetResolution,
        targetFps: this.engine.targetFps,
        scaleMode: this.engine.scaleMode,
      },
      motion: {
        enabled: this.engine.motionDetectionEnabled,
        targets: [...this.engine.motionTargets],
        intensity: this.engine.motionIntensity,
      },
    };
  }

  /**
   * 应用统一配置
   */
  applyUnifiedConfig(config: Partial<UnifiedConfig>): void {
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
      this.engine.loadTemplate(tempTemplate);
    }

    // 播放配置
    if (config.playback) {
      this.engine.playback.applyConfig(config.playback);
    }

    // 文本配置
    if (config.text) {
      this.engine.lyrics.applyConfig(config.text);
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
        this.engine.lyrics.setSrtTimeline(convertedSrt);
      } else if (lyricConfig.srtTimeline === null) {
        this.engine.lyrics.setSrtTimeline(null);
      }

      if (lyricConfig.timeline !== undefined) {
        if (lyricConfig.timeline && lyricConfig.timeline.length > 0) {
          this.engine.lyrics.setLyricTimeline(lyricConfig.timeline);
        } else {
          this.engine.lyrics.clearLyricTimeline();
        }
      }
      if (lyricConfig.offset !== undefined) {
        this.engine.lyrics.lyricOffset = lyricConfig.offset;
      }
    }

    // 节拍配置
    if (config.beat) {
      if (config.beat.bpm !== undefined) this.engine.beat.bpm = config.beat.bpm;
      if (config.beat.reactivity !== undefined)
        this.engine.beatReactivity = config.beat.reactivity;
    }

    // 效果配置
    if (config.effects) {
      if (config.effects.alphaMode !== undefined)
        this.engine.alphaMode = config.effects.alphaMode;
      if (config.effects.effectOpacity !== undefined)
        this.engine.effectOpacity = config.effects.effectOpacity;
      if (config.effects.motionIntensity !== undefined)
        this.engine.motionIntensity = config.effects.motionIntensity;
    }

    // 后处理配置
    if (config.postfx) {
      this.engine.playback.applyPostFXConfig(config.postfx);
    }

    // 媒体配置
    if (config.media && config.media.hasMedia && config.media.url) {
      if (
        config.media.offsetX !== undefined ||
        config.media.offsetY !== undefined
      ) {
        this.engine.setMediaOffset(
          config.media.offsetX || 0,
          config.media.offsetY || 0,
        );
      }
      if (config.media.scale !== undefined) {
        this.engine.setMediaScale(config.media.scale);
      }
    }

    // 渲染配置
    if (config.render?.canvasColor !== undefined) {
      this.engine.canvasColor = config.render.canvasColor;
    }
    if (config.render?.targetResolution !== undefined) {
      this.engine.targetResolution = config.render.targetResolution;
    }
    if (config.render?.targetFps !== undefined) {
      this.engine.targetFps = config.render.targetFps;
    }
    if (config.render?.scaleMode !== undefined) {
      this.engine.scaleMode = config.render.scaleMode;
    }

    this.engine.external.applyConfig(config);
  }

  destroy(): void {
    this.clearEffects();
  }
}