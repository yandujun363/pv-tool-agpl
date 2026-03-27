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

export class FlowingLines extends BaseEffect {
  readonly name = 'flowingLines';
  override readonly heavy = true;
  private graphics!: PIXI.Graphics;

  protected setup(): void {
    this.graphics = new PIXI.Graphics();
    this.container.addChild(this.graphics);
  }

  update(ctx: UpdateContext): void {
    const g = this.graphics;
    g.clear();

    const count = this.config.count ?? 3;
    const color = resolveColor(this.config.color ?? '$secondary', this.palette);
    const alpha = this.config.alpha ?? 0.5;
    const strokeWidth = this.config.strokeWidth ?? 1.5;
    const amplitude = (this.config.amplitude ?? 80) * ctx.motionIntensity * (1 + ctx.beatIntensity * 0.5);
    const frequency = this.config.frequency ?? 0.005;
    const speed = (this.config.speed ?? 0.5) * ctx.animationSpeed;

    for (let l = 0; l < count; l++) {
      const yOffset = (ctx.screenHeight / (count + 1)) * (l + 1);
      const phaseOffset = l * Math.PI * 0.6;
      const timeOffset = ctx.time * speed;

      g.moveTo(0, yOffset + Math.sin(phaseOffset + timeOffset) * amplitude);

      for (let x = 10; x <= ctx.screenWidth; x += 10) {
        const y = yOffset + Math.sin(x * frequency + phaseOffset + timeOffset) * amplitude;
        g.lineTo(x, y);
      }

      g.stroke({ color, width: strokeWidth, alpha });
    }
  }
}