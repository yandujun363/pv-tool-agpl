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
import type { LayerType } from "../types";
import type { PVEngine } from "./index";
import { GlitchFilter } from "../glitchFilter";

/**
 * 引擎核心 - 负责PIXI初始化、渲染循环和基础图层管理
 */
export class EngineCore {
  private engine: PVEngine;

  // PIXI 核心
  app: PIXI.Application;
  layers = new Map<LayerType, PIXI.Container>();
  effectsRoot!: PIXI.Container;
  bgFill!: PIXI.Graphics;

  // 滤镜
  hueFilter: PIXI.ColorMatrixFilter;
  glitchFilter: GlitchFilter;
  // 状态
  private _renderPaused = true;
  private _tick = 0;

  constructor(engine: PVEngine, app: PIXI.Application) {
    this.engine = engine;
    this.app = app;
    this.hueFilter = new PIXI.ColorMatrixFilter();
    this.glitchFilter = new GlitchFilter();
  }

  /**
   * 初始化图层结构
   */
  initLayers(): void {
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

    const EFFECT_LAYERS: LayerType[] = [
      "background",
      "decoration",
      "text",
      "overlay",
    ];

    for (const layerType of EFFECT_LAYERS) {
      const container = new PIXI.Container();
      this.layers.set(layerType, container);
      this.effectsRoot.addChild(container);
    }

    this.app.stage.filters = [this.hueFilter, this.glitchFilter];
  }

  /**
   * 启动渲染循环
   */
  startRenderLoop(playbackUpdateFn: (dt: number) => number): void {
    this.app.ticker.add((ticker) => {
      if (this._renderPaused) return;
      const now = performance.now();
      const dt = (now - this.engine.playback.lastFrameTime) / 1000;
      this.engine.playback.lastFrameTime = now;

      const currentTime = playbackUpdateFn(dt);
      this.engine["_setTime"](currentTime);

      this.engine["_update"](currentTime, ticker.deltaTime / 60);
    });
  }

  get renderPaused(): boolean {
    return this._renderPaused;
  }

  set renderPaused(val: boolean) {
    this._renderPaused = val;
  }

  get tick(): number {
    return this._tick;
  }

  incrementTick(): void {
    this._tick++;
    if (this._tick === 0x7fffffff) this._tick = 0;
  }

  /**
   * 更新背景填充
   */
  updateBgFill(paletteBackground: string): void {
    if (!this.bgFill) return;
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const pad = Math.max(w, h) * 0.5;
    this.bgFill.clear();
    this.bgFill.rect(-pad, -pad, w + pad * 2, h + pad * 2);
    this.bgFill.fill({ color: paletteBackground });
  }

  /**
   * 应用相机特效（抖动、缩放、倾斜）
   */
  applyCameraFX(
    time: number,
    shake: number,
    zoom: number,
    tilt: number,
    beatReactivity: number,
    beat: any,
  ): void {
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const cx = w / 2;
    const cy = h / 2;

    this.app.stage.pivot.set(cx, cy);

    let px = cx,
      py = cy;

    const beatShake = beat.getIntensity(time) * beatReactivity;
    const totalShake = shake + beatShake * 0.15;
    if (totalShake > 0) {
      px += (Math.random() - 0.5) * totalShake * 30;
      py += (Math.random() - 0.5) * totalShake * 20;
    }

    this.app.stage.position.set(px, py);
    this.app.stage.scale.set(1 + zoom * 0.5);
    this.app.stage.rotation = tilt * 0.3;

    this.glitchFilter.time = time;
  }

  destroy(): void {
    this.app.destroy(true);
  }
}
