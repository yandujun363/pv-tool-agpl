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

export class ColorMask extends BaseEffect {
  readonly name = 'colorMask';
  private graphics!: PIXI.Graphics;
  private drawn = false;

  protected setup(): void {
    this.graphics = new PIXI.Graphics();
    this.container.addChild(this.graphics);
  }

  private draw(width: number, height: number): void {
    const g = this.graphics;
    const color = resolveColor(this.config.color ?? '$accent', this.palette);
    const alpha = this.config.alpha ?? 0.3;
    const coverage = this.config.coverage ?? { x: 0, y: 0, w: 1, h: 1 };

    g.rect(
      coverage.x * width,
      coverage.y * height,
      coverage.w * width,
      coverage.h * height
    );
    g.fill({ color, alpha });
  }

  update(ctx: UpdateContext): void {
    if (!this.drawn) {
      this.drawn = true;
      this.draw(ctx.screenWidth, ctx.screenHeight);
    }
  }
}