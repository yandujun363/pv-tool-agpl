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

export class DiamondShapes extends BaseEffect {
  readonly name = 'diamondShapes';
  private shapeContainer!: PIXI.Container;

  protected setup(): void {
    this.shapeContainer = new PIXI.Container();
    this.container.addChild(this.shapeContainer);
    this.drawDiamonds();
  }

  private drawDiamonds(): void {
    const count = this.config.count ?? 3;
    const maxSize = this.config.maxSize ?? 300;
    const strokeWidth = this.config.strokeWidth ?? 2;
    const color = resolveColor(this.config.color ?? '$primary', this.palette);
    const fillColor = this.config.fill ? resolveColor(this.config.fill, this.palette) : null;
    const alpha = this.config.alpha ?? 0.7;

    for (let i = 0; i < count; i++) {
      const g = new PIXI.Graphics();
      const size = maxSize - (maxSize / count) * i * 0.6;
      const half = size / 2;

      g.moveTo(0, -half)
        .lineTo(half, 0)
        .lineTo(0, half)
        .lineTo(-half, 0)
        .closePath();

      if (fillColor && i === count - 1) {
        g.fill({ color: fillColor, alpha: alpha * 0.3 });
      }
      g.stroke({ color, width: strokeWidth, alpha });

      this.shapeContainer.addChild(g);
    }
  }

  update(ctx: UpdateContext): void {
    const cx = (this.config.x ?? 0.5) * ctx.screenWidth;
    const cy = (this.config.y ?? 0.5) * ctx.screenHeight;
    this.shapeContainer.x = cx;
    this.shapeContainer.y = cy;

    const speed = (this.config.animationSpeed ?? 0.08) * ctx.animationSpeed;
    this.shapeContainer.rotation = ctx.time * speed;
  }
}