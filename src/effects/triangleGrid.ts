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

import * as PIXI from 'pixi.js';
import { BaseEffect } from './base';
import type { UpdateContext } from '../core/types';
import { resolveColor } from '../core/types';

export class TriangleGrid extends BaseEffect {
  readonly name = 'triangleGrid';
  private g!: PIXI.Graphics;
  private drawn = false;
  private lastW = 0;
  private lastH = 0;

  protected setup(): void {
    this.g = new PIXI.Graphics();
    this.container.addChild(this.g);
  }

  update(ctx: UpdateContext): void {
    if (this.drawn && this.lastW === ctx.screenWidth && this.lastH === ctx.screenHeight) return;
    this.drawn = true;
    this.lastW = ctx.screenWidth;
    this.lastH = ctx.screenHeight;

    const g = this.g;
    g.clear();

    const w = ctx.screenWidth;
    const h = ctx.screenHeight;
    const color = resolveColor(this.config.color ?? '$secondary', this.palette);
    const alpha = this.config.alpha ?? 0.2;
    const cols = this.config.cols ?? 10;
    const step = Math.ceil(w / cols);
    const filled = this.config.filled ?? false;
    const fillColor = resolveColor(this.config.fillColor ?? '#002200', this.palette);
    const fillAlpha = this.config.fillAlpha ?? 0.08;

    for (let x = 0; x <= w + step; x += step) {
      const colIdx = Math.floor(x / step);
      const yOffset = colIdx % 2 === 0 ? 0 : Math.floor(step / 2);

      for (let y = -step; y <= h + step; y += step) {
        const pt1x = x;
        const pt1y = y + yOffset;
        const pt2x = x + step;
        const pt2y = y + Math.floor(step / 2) + yOffset;
        const pt3x = x;
        const pt3y = y + step + yOffset;

        if (filled) {
          g.poly([pt1x, pt1y, pt2x, pt2y, pt3x, pt3y]);
          g.fill({ color: fillColor, alpha: fillAlpha });
        }

        g.moveTo(pt1x, pt1y).lineTo(pt2x, pt2y);
        g.moveTo(pt2x, pt2y).lineTo(pt3x, pt3y);
        g.moveTo(pt1x, pt1y).lineTo(x + step, y + yOffset);
        g.stroke({ color, width: 1, alpha });
      }
    }
  }
}