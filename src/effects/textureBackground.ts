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

export class TextureBackground extends BaseEffect {
  readonly name = 'textureBackground';
  private tiling!: PIXI.TilingSprite;
  private driftX = 0;
  private driftY = 0;

  protected setup(): void {
    const intensity = this.config.intensity ?? 0.15;
    const w = 512;
    const h = 512;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(w, h);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      imageData.data[i] = v;
      imageData.data[i + 1] = v;
      imageData.data[i + 2] = v;
      imageData.data[i + 3] = Math.floor(intensity * 255);
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = PIXI.Texture.from(canvas);
    this.tiling = new PIXI.TilingSprite({ texture, width: 1920, height: 1080 });

    this.container.addChild(this.tiling);
  }

  update(ctx: UpdateContext): void {
    this.tiling.width = ctx.screenWidth;
    this.tiling.height = ctx.screenHeight;

    const speed = (this.config.driftSpeed ?? 0.5) * ctx.animationSpeed;
    this.driftX += speed * ctx.deltaTime * ctx.motionIntensity;
    this.driftY += speed * 0.7 * ctx.deltaTime * ctx.motionIntensity;
    this.tiling.tilePosition.x = this.driftX;
    this.tiling.tilePosition.y = this.driftY;
  }
}