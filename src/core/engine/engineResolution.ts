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

import type { PVEngine } from "./index";

/**
 * 分辨率管理 - 负责画布尺寸和缩放
 */
export class EngineResolution {
  private engine: PVEngine;

  private _targetResolution:
    | number
    | { width: number; height: number }
    | "auto" = "auto";
  private _scaleMode: "stretch" | "contain" = "contain";
  private _nativeDPR = 1;
  private _currentResolution = 1;
  private _resizeParent: HTMLElement | null = null;
  private _resizeObserver: ResizeObserver | null = null;

  constructor(engine: PVEngine) {
    this.engine = engine;
  }

  get targetResolution(): typeof this._targetResolution {
    return this._targetResolution;
  }

  set targetResolution(resolution: typeof this._targetResolution) {
    this._targetResolution = resolution;
    this.applyResolution();
  }

  get scaleMode(): "stretch" | "contain" {
    return this._scaleMode;
  }

  set scaleMode(mode: "stretch" | "contain") {
    this._scaleMode = mode;
    this.applyResolution();
  }

  get currentResolution(): number {
    return this._currentResolution;
  }

  get nativeDPR(): number {
    return this._nativeDPR;
  }

  set nativeDPR(val: number) {
    this._nativeDPR = val;
  }

  get resizeParent(): HTMLElement | null {
    return this._resizeParent;
  }

  set resizeParent(parent: HTMLElement | null) {
    this._resizeParent = parent;
  }

  /**
   * 设置原生 DPR（内部使用）
   */
  setNativeDPR(dpr: number): void {
    this._nativeDPR = dpr;
  }

  /**
   * 获取原生 DPR
   */
  getNativeDPR(): number {
    return this._nativeDPR;
  }

  /**
   * 手动设置当前分辨率（谨慎使用）
   */
  setCurrentResolution(res: number): void {
    this._currentResolution = res;
  }

  /**
   * 初始化分辨率观察器
   */
  initResizeObserver(parent: HTMLElement, onResize: () => void): void {
    this._resizeParent = parent;
    this._resizeObserver = new ResizeObserver(() => {
      onResize();
    });
    this._resizeObserver.observe(parent);

    window.addEventListener("resize", () => {
      onResize();
    });
  }

  /**
   * 应用分辨率设置
   */
  applyResolution(): void {
    if (!this.engine.core.app.renderer) return;

    const parent = this._resizeParent;
    if (!parent) return;

    const baseWidth = parent.clientWidth;
    const baseHeight = parent.clientHeight;
    const baseAspect = baseWidth / baseHeight;

    let targetWidth: number;
    let targetHeight: number;
    let resolution = this._nativeDPR;

    if (this._targetResolution !== "auto") {
      if (typeof this._targetResolution === "number") {
        resolution = this._targetResolution;
        targetWidth = baseWidth;
        targetHeight = baseHeight;
      } else if (typeof this._targetResolution === "object") {
        targetWidth = this._targetResolution.width;
        targetHeight = this._targetResolution.height;
        resolution = 1;
      } else {
        targetWidth = baseWidth;
        targetHeight = baseHeight;
      }
    } else {
      targetWidth = baseWidth;
      targetHeight = baseHeight;
    }

    this._currentResolution = resolution;
    this.engine.core.app.renderer.resolution = resolution;
    this.engine.core.app.renderer.resize(targetWidth, targetHeight);

    // 根据缩放模式设置 CSS 样式
    if (this._scaleMode === "contain") {
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

      this.engine.core.app.canvas.style.width = `${displayWidth}px`;
      this.engine.core.app.canvas.style.height = `${displayHeight}px`;
      this.engine.core.app.canvas.style.position = "absolute";
      this.engine.core.app.canvas.style.top = "50%";
      this.engine.core.app.canvas.style.left = "50%";
      this.engine.core.app.canvas.style.transform = "translate(-50%, -50%)";
      this.engine.core.app.canvas.style.backgroundColor = "#000000";
    } else {
      this.engine.core.app.canvas.style.width = `${baseWidth}px`;
      this.engine.core.app.canvas.style.height = `${baseHeight}px`;
      this.engine.core.app.canvas.style.position = "";
      this.engine.core.app.canvas.style.transform = "";
      this.engine.core.app.canvas.style.backgroundColor = "";
    }

    this.engine.core.updateBgFill(this.engine.config.paletteValue.background);
  }

  /**
   * 自动分辨率同步（根据效果数量）
   */
  syncResolution(activeEffectsCount: number): void {
    if (this._targetResolution !== "auto") {
      return;
    }
    const n = activeEffectsCount;
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
      this.engine.core.app.renderer.resolution = target;
      if (this._resizeParent) {
        const w = this._resizeParent.clientWidth;
        const h = this._resizeParent.clientHeight;
        this.engine.core.app.renderer.resize(w, h);
      }
    }
  }

  destroy(): void {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }
}
