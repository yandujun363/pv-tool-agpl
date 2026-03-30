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

import type { MotionTargetInfo } from "../types";
import type { PVEngine } from "./index";

/**
 * 状态管理 - 负责引擎内部状态
 */
export class EngineState {
  private engine: PVEngine;

  private _animationSpeed = 2;
  private _motionIntensity = 1;
  private _effectOpacity = 1;
  private _alphaMode = false;
  private _motionDetectionEnabled = false;
  private motionTargets: MotionTargetInfo[] = [];
  private _loading = false;
  private _time = 0;

  constructor(engine: PVEngine) {
    this.engine = engine;
  }

  // Getters/Setters
  get animationSpeed(): number {
    return this._animationSpeed;
  }

  set animationSpeed(val: number) {
    this._animationSpeed = val;
  }

  get motionIntensity(): number {
    return this._motionIntensity;
  }

  set motionIntensity(val: number) {
    this._motionIntensity = val;
  }

  get effectOpacity(): number {
    return this._effectOpacity;
  }

  set effectOpacity(val: number) {
    this._effectOpacity = val;
    this.engine.core.bgFill.alpha = val;
  }

  get alphaMode(): boolean {
    return this._alphaMode;
  }

  set alphaMode(val: boolean) {
    this._alphaMode = val;
    const bgLayer = this.engine.core.layers.get("background");
    if (val) {
      this.engine.core.bgFill.visible = false;
      if (bgLayer) bgLayer.visible = false;
      this.engine.core.app.renderer.background.alpha = 0;
    } else {
      this.engine.core.bgFill.visible = true;
      if (bgLayer) bgLayer.visible = true;
      this.engine.core.app.renderer.background.alpha = 1;
    }
  }

  get motionDetectionEnabled(): boolean {
    return this._motionDetectionEnabled;
  }

  set motionDetectionEnabled(val: boolean) {
    this._motionDetectionEnabled = val;
  }

  get motionTargetsValue(): MotionTargetInfo[] {
    return this.motionTargets;
  }

  set motionTargetsValue(targets: MotionTargetInfo[]) {
    this.motionTargets = targets;
  }

  get loading(): boolean {
    return this._loading;
  }

  set loading(val: boolean) {
    this._loading = val;
  }

  get time(): number {
    return this._time;
  }

  set time(val: number) {
    this._time = val;
  }
}
