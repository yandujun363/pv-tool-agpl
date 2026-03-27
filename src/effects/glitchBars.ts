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
import { BaseEffect } from './base';
import type { UpdateContext } from '../core/types';
import { resolveColor } from '../core/types';

interface GlitchBar {
  graphics: PIXI.Graphics;
  y: number;
  width: number;
  height: number;
  speed: number;
  lifetime: number;
  born: number;
}

export class GlitchBars extends BaseEffect {
  readonly name = 'glitchBars';
  private bars: GlitchBar[] = [];
  private lastSpawn = 0;

  protected setup(): void {}

  update(ctx: UpdateContext): void {
    const spawnRate = this.config.spawnRate ?? 0.15;
    const maxBars = this.config.maxBars ?? 8;
    const color = resolveColor(this.config.color ?? '$primary', this.palette);
    const barAlpha = this.config.alpha ?? 0.9;
    const minHeight = this.config.minHeight ?? 2;
    const maxHeight = this.config.maxHeight ?? 12;
    const speed = ctx.animationSpeed;

    // Spawn new bars
    if (ctx.time - this.lastSpawn > spawnRate / speed && this.bars.length < maxBars) {
      this.lastSpawn = ctx.time;
      const g = new PIXI.Graphics();
      const h = minHeight + Math.random() * (maxHeight - minHeight);
      const w = ctx.screenWidth * (0.3 + Math.random() * 0.7);
      const x = Math.random() * (ctx.screenWidth - w);
      const y = Math.random() * ctx.screenHeight;

      g.rect(0, 0, w, h);
      g.fill({ color, alpha: barAlpha });
      g.x = x;
      g.y = y;

      this.container.addChild(g);
      this.bars.push({
        graphics: g,
        y,
        width: w,
        height: h,
        speed: (Math.random() - 0.5) * 200 * ctx.motionIntensity,
        lifetime: 0.08 + Math.random() * 0.2,
        born: ctx.time,
      });
    }

    // Update and remove expired bars
    this.bars = this.bars.filter(bar => {
      const age = ctx.time - bar.born;
      if (age > bar.lifetime) {
        this.container.removeChild(bar.graphics);
        bar.graphics.destroy();
        return false;
      }
      bar.graphics.x += bar.speed * ctx.deltaTime;
      bar.graphics.alpha = 1 - (age / bar.lifetime);
      return true;
    });
  }

  destroy(): void {
    this.bars.forEach(b => b.graphics.destroy());
    this.bars = [];
    super.destroy();
  }
}