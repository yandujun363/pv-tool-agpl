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

import * as PIXI from 'pixi.js';
import type { ColorPalette, UpdateContext } from '../core/types';

export abstract class BaseEffect {
  abstract readonly name: string;
  /** Mark as true for GPU/CPU-heavy effects — engine will skip frames when many effects are active */
  readonly heavy: boolean = false;
  protected container!: PIXI.Container;
  protected config: Record<string, any> = {};
  protected palette!: ColorPalette;
  private _ownContainer!: PIXI.Container;

  init(parentLayer: PIXI.Container, config: Record<string, any>, palette: ColorPalette): void {
    this._ownContainer = new PIXI.Container();
    parentLayer.addChild(this._ownContainer);
    this.container = this._ownContainer;
    this.config = config;
    this.palette = palette;
    this.setup();
  }

  protected abstract setup(): void;
  abstract update(ctx: UpdateContext): void;

  destroy(): void {
    try {
      this._ownContainer.removeChildren().forEach(c => {
        try { c.destroy({ children: true }); } catch { /* already gone */ }
      });
      this._ownContainer.destroy();
    } catch { /* container already destroyed */ }
  }
}