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

/**
 * Checkerboard / chessboard pattern overlay.
 */
export class Checkerboard extends BaseEffect {
  readonly name = 'checkerboard';
  private tiling!: PIXI.TilingSprite;

  protected setup(): void {
    const cellSize = this.config.cellSize ?? 40;
    const color1 = resolveColor(this.config.color1 ?? '#000000', this.palette);
    const color2 = resolveColor(this.config.color2 ?? '#ffffff', this.palette);
    const alpha = this.config.alpha ?? 0.08;

    const tileSize = cellSize * 2;
    const canvas = document.createElement('canvas');
    canvas.width = tileSize;
    canvas.height = tileSize;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, cellSize, cellSize);
    ctx.fillRect(cellSize, cellSize, cellSize, cellSize);
    ctx.fillStyle = color2;
    ctx.fillRect(cellSize, 0, cellSize, cellSize);
    ctx.fillRect(0, cellSize, cellSize, cellSize);

    const tex = PIXI.Texture.from(canvas);
    this.tiling = new PIXI.TilingSprite({ texture: tex, width: 1920, height: 1080 });
    this.tiling.alpha = alpha;
    this.container.addChild(this.tiling);
  }

  update(ctx: UpdateContext): void {
    this.tiling.width = ctx.screenWidth;
    this.tiling.height = ctx.screenHeight;
  }
}