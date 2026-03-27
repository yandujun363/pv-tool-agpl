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

interface HalftoneBlock {
  container: PIXI.Container;
  baseX: number;
  baseY: number;
  driftPhase: number;
}

export class HalftoneBlocks extends BaseEffect {
  readonly name = 'halftoneBlocks';
  private blocks: HalftoneBlock[] = [];
  private initialized = false;

  protected setup(): void {}

  private initBlocks(width: number, height: number): void {
    if (this.initialized) return;
    this.initialized = true;

    const count = this.config.count ?? 8;
    const color = resolveColor(this.config.color ?? '$primary', this.palette);
    const blockSize = this.config.blockSize ?? 60;
    const dotSpacing = this.config.dotSpacing ?? 6;
    const dotRadius = this.config.dotRadius ?? 1.5;
    const alpha = this.config.alpha ?? 0.5;

    for (let i = 0; i < count; i++) {
      const blockContainer = new PIXI.Container();
      const g = new PIXI.Graphics();

      for (let x = 0; x < blockSize; x += dotSpacing) {
        for (let y = 0; y < blockSize; y += dotSpacing) {
          g.circle(x, y, dotRadius);
        }
      }
      g.fill({ color, alpha });

      blockContainer.addChild(g);
      blockContainer.pivot.set(blockSize / 2, blockSize / 2);

      const baseX = Math.random() * width;
      const baseY = Math.random() * height;
      blockContainer.x = baseX;
      blockContainer.y = baseY;
      blockContainer.rotation = (Math.random() - 0.5) * 0.5;
      blockContainer.scale.set(0.5 + Math.random());

      this.blocks.push({
        container: blockContainer,
        baseX,
        baseY,
        driftPhase: Math.random() * Math.PI * 2,
      });

      this.container.addChild(blockContainer);
    }
  }

  update(ctx: UpdateContext): void {
    this.initBlocks(ctx.screenWidth, ctx.screenHeight);

    for (const block of this.blocks) {
      const drift = ctx.motionIntensity;
      const spd = ctx.animationSpeed;
      block.container.x = block.baseX + Math.sin(ctx.time * 0.15 * spd + block.driftPhase) * 5 * drift;
      block.container.y = block.baseY + Math.cos(ctx.time * 0.1 * spd + block.driftPhase) * 5 * drift;
    }
  }
}