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

export class PinkStripes extends BaseEffect {
  readonly name = 'pinkStripes';
  private graphics!: PIXI.Graphics;

  protected setup(): void {
    this.graphics = new PIXI.Graphics();
    this.container.addChild(this.graphics);
  }

  update(ctx: UpdateContext): void {
    const stripeWidth = this.config.stripeWidth ?? 150;
    const speed = (this.config.speed ?? 0.5) * ctx.animationSpeed;
    const angle = this.config.angle ?? -45;
    const pinkColor = this.config.pinkColor ?? '#fbbdbe';
    const alpha = this.config.alpha ?? 1.0;

    // Time-based offset — frame-rate independent
    const offset = (ctx.time * speed * stripeWidth) % (stripeWidth * 2);

    this.graphics.clear();

    const angleRad = (angle * Math.PI) / 180;
    const diagonal = Math.sqrt(ctx.screenWidth ** 2 + ctx.screenHeight ** 2);
    const numStripes = Math.ceil(diagonal / stripeWidth) + 2;

    for (let i = -2; i < numStripes; i++) {
      const x = (i * stripeWidth * 2 + offset) - diagonal / 2;
      this.graphics.rect(x, -diagonal / 2, stripeWidth, diagonal * 2);
      this.graphics.fill({ color: pinkColor, alpha });
    }

    this.graphics.x = ctx.screenWidth / 2;
    this.graphics.y = ctx.screenHeight / 2;
    this.graphics.rotation = angleRad;
  }
}
