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

export class ConcentricCircles extends BaseEffect {
  readonly name = 'concentricCircles';
  private circleContainer!: PIXI.Container;

  protected setup(): void {
    this.circleContainer = new PIXI.Container();
    this.container.addChild(this.circleContainer);
    this.drawCircles();
  }

  private drawCircles(): void {
    const count = this.config.count ?? 4;
    const maxRadius = this.config.maxRadius ?? 250;
    const strokeWidth = this.config.strokeWidth ?? 1.5;
    const color = resolveColor(this.config.color ?? '$primary', this.palette);
    const alpha = this.config.alpha ?? 0.6;

    const g = new PIXI.Graphics();
    for (let i = 1; i <= count; i++) {
      const radius = (maxRadius / count) * i;
      g.circle(0, 0, radius);
    }
    g.stroke({ color, width: strokeWidth, alpha });
    this.circleContainer.addChild(g);
  }

  update(ctx: UpdateContext): void {
    const cx = (this.config.x ?? 0.5) * ctx.screenWidth;
    const cy = (this.config.y ?? 0.5) * ctx.screenHeight;
    this.circleContainer.x = cx;
    this.circleContainer.y = cy;

    const animation = this.config.animation ?? 'rotate';
    const speed = (this.config.animationSpeed ?? 0.15) * ctx.animationSpeed;

    if (animation === 'rotate') {
      this.circleContainer.rotation = ctx.time * speed;
    } else if (animation === 'pulse') {
      const scale = 1 + Math.sin(ctx.time * speed * Math.PI * 2) * 0.05 * ctx.motionIntensity;
      this.circleContainer.scale.set(scale);
    }
  }
}