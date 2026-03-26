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

export class BurstLines extends BaseEffect {
  readonly name = 'burstLines';
  private g!: PIXI.Graphics;
  private drawn = false;
  private lastW = 0;
  private lastH = 0;

  protected setup(): void {
    this.g = new PIXI.Graphics();
    this.container.addChild(this.g);
  }

  update(ctx: UpdateContext): void {
    const isStatic = (this.config.rotSpeed ?? 0.05) === 0;
    if (isStatic && this.drawn && this.lastW === ctx.screenWidth && this.lastH === ctx.screenHeight) return;
    this.drawn = true;
    this.lastW = ctx.screenWidth;
    this.lastH = ctx.screenHeight;

    const g = this.g;
    g.clear();

    const w = ctx.screenWidth;
    const h = ctx.screenHeight;
    const cx = w * (this.config.x ?? 0.5);
    const cy = h * (this.config.y ?? 0.5);
    const color = resolveColor(this.config.color ?? '$secondary', this.palette);
    const alpha = this.config.alpha ?? 0.25;
    const rayCount = this.config.rayCount ?? 24;
    const innerRadius = Math.min(w, h) * (this.config.innerRadius ?? 0.08);
    const outerRadius = Math.max(w, h) * (this.config.outerRadius ?? 0.7);
    const angleStep = (Math.PI * 2) / rayCount;
    const rotSpeed = (this.config.rotSpeed ?? 0.05) * ctx.animationSpeed;
    const rot = ctx.time * rotSpeed;

    for (let i = 0; i < rayCount; i++) {
      const angle = rot + i * angleStep;
      const sx = cx + Math.cos(angle) * innerRadius;
      const sy = cy + Math.sin(angle) * innerRadius;
      const ex = cx + Math.cos(angle) * outerRadius;
      const ey = cy + Math.sin(angle) * outerRadius;
      g.moveTo(sx, sy).lineTo(ex, ey);
    }
    g.stroke({ color, width: this.config.lineWidth ?? 1, alpha });
  }
}