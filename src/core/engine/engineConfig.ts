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
import { createEffect, BaseEffect } from "../../effects";
import type { PVEngine } from "./index";

/**
 * 配置管理 - 负责模板加载、效果管理
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
        this.engine.core.bgFill.alpha = template.bgOpacity;
      }

      this.engine.media.outlineEnabled =
        template.features?.mediaOutline ?? false;
      this.engine._setMotionDetectionEnabled(
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
        this.engine.core.app.renderer.background.color = new PIXI.Color(
          this.palette.background,
        ).toNumber();
      }
      callbacks.onUpdateBgFill();

      for (const entry of template.effects) {
        const layer = this.engine.core.layers.get(entry.layer);
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
    for (const [key, layer] of this.engine.core.layers) {
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
          this.engine.core.tick % heavySkip !== 0
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

  destroy(): void {
    this.clearEffects();
  }
}
