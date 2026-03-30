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
 * FPS管理 - 负责FPS监控和限制
 */
export class EngineFps {
  private engine: PVEngine;

  private _targetFps: number | "auto" = "auto";
  private _pixiFps = 60;
  private _browserFps = 60;
  private _fpsCallback: ((pixiFps: number, browserFps: number) => void) | null =
    null;

  // 浏览器FPS监控
  private _rafId: number | null = null;
  private _lastBrowserFpsUpdate = 0;
  private _browserFrameCount = 0;

  // PIXI FPS监控
  private _lastPixiFpsUpdate = 0;
  private _pixiFrameCount = 0;
  private _fpsMonitorStarted = false;

  constructor(engine: PVEngine) {
    this.engine = engine;
  }

  get targetFps(): number | "auto" {
    return this._targetFps;
  }

  set targetFps(fps: number | "auto") {
    this._targetFps = fps;
    this.applyFpsLimit();
  }

  get pixiFps(): number {
    return this._pixiFps;
  }

  get browserFps(): number {
    return this._browserFps;
  }

  set onFpsUpdate(
    callback: ((pixiFps: number, browserFps: number) => void) | null,
  ) {
    this._fpsCallback = callback;
  }

  /**
   * 启动双重FPS监控
   */
  startFpsMonitor(): void {
    if (this._fpsMonitorStarted) return;
    if (!this.engine.core.app.ticker) {
      console.warn("[PVEngine] Cannot start FPS monitor: app.ticker not ready");
      return;
    }

    this._fpsMonitorStarted = true;

    // 监控 PIXI ticker 的实际更新频率
    this.engine.core.app.ticker.add(() => {
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

  /**
   * 停止FPS监控
   */
  stopFpsMonitor(): void {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._fpsMonitorStarted = false;
  }

  private notifyFpsUpdate(): void {
    if (this._fpsCallback) {
      this._fpsCallback(this._pixiFps, this._browserFps);
    }
  }

  /**
   * 应用FPS限制到PIXI ticker
   */
  private applyFpsLimit(): void {
    if (!this.engine.core.app.ticker) return;

    if (this._targetFps === "auto") {
      this.engine.core.app.ticker.maxFPS = 0;
      return;
    }

    const fps = Math.max(10, Math.min(this._targetFps, 240));
    this.engine.core.app.ticker.maxFPS = fps;
  }

  /**
   * 获取当前应该用于录制的FPS
   */
  getRecordingFps(): number {
    if (this._targetFps !== "auto") {
      return this._targetFps as number;
    }
    return Math.min(Math.max(this._pixiFps, 30), 60);
  }

  destroy(): void {
    this.stopFpsMonitor();
  }
}
