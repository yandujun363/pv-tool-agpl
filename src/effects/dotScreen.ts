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

/**
 * Full halftone dot screen pattern overlay.
 * Evenly spaced filled circles creating a print-like texture.
 */
export class DotScreen extends BaseEffect {
  readonly name = 'dotScreen';
  private tiling!: PIXI.TilingSprite;
  private lastBg = '';

  protected setup(): void {
    this.buildTile();
  }

  private buildTile(): void {
    const spacing = this.config.spacing ?? 8;
    const dotRadius = this.config.dotRadius ?? 1.5;
    const color = resolveColor(this.config.color ?? '$text', this.palette);
    const alpha = this.config.alpha ?? 0.12;
    const angle = (this.config.angle ?? 15) * Math.PI / 180;

    const tileSize = spacing;
    const canvas = document.createElement('canvas');
    canvas.width = tileSize;
    canvas.height = tileSize;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(tileSize / 2, tileSize / 2, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    const tex = PIXI.Texture.from(canvas);
    if (this.tiling) {
      this.tiling.texture = tex;
    } else {
      this.tiling = new PIXI.TilingSprite({ texture: tex, width: 1920, height: 1080 });
      this.tiling.rotation = angle;
      this.tiling.anchor.set(0.5);
      this.container.addChild(this.tiling);
    }
  }

  update(ctx: UpdateContext): void {
    const bg = ctx.palette.background;
    if (this.lastBg !== bg) {
      this.lastBg = bg;
      this.buildTile();
    }
    this.tiling.width = ctx.screenWidth * 1.5;
    this.tiling.height = ctx.screenHeight * 1.5;
    this.tiling.x = ctx.screenWidth / 2;
    this.tiling.y = ctx.screenHeight / 2;
  }
}