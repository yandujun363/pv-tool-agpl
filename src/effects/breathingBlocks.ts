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

interface Block {
  g: PIXI.Graphics;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  brightness: number;
  phase: number;
  breathSpeed: number;
}

/**
 * Multiple irregular blocks in varying shades from white to light gray,
 * with breathing animation (pulsing scale and alpha).
 */
export class BreathingBlocks extends BaseEffect {
  readonly name = 'breathingBlocks';
  private blocks: Block[] = [];
  private built = false;

  protected setup(): void {}

  private build(sw: number, sh: number): void {
    if (this.built) return;
    this.built = true;

    const count = this.config.count ?? 8;
    const minSize = this.config.minSize ?? 0.15;
    const maxSize = this.config.maxSize ?? 0.55;
    const minBrightness = this.config.minBrightness ?? 180;
    const maxBrightness = this.config.maxBrightness ?? 255;

    for (let i = 0; i < count; i++) {
      const bw = sw * (minSize + Math.random() * (maxSize - minSize));
      const bh = sh * (minSize + Math.random() * (maxSize - minSize));
      const x = Math.random() * sw;
      const y = Math.random() * sh;
      const rotation = (Math.random() - 0.5) * 0.6;
      const brightness = minBrightness + Math.random() * (maxBrightness - minBrightness);
      const phase = Math.random() * Math.PI * 2;
      const breathSpeed = 0.3 + Math.random() * 0.5;

      const hex = Math.floor(brightness).toString(16).padStart(2, '0');
      const color = `#${hex}${hex}${hex}`;

      const g = new PIXI.Graphics();
      g.rect(-bw / 2, -bh / 2, bw, bh);
      g.fill({ color, alpha: 0.6 + Math.random() * 0.35 });

      g.x = x;
      g.y = y;
      g.rotation = rotation;
      g.pivot.set(0, 0);

      this.container.addChild(g);
      this.blocks.push({ g, x, y, w: bw, h: bh, rotation, brightness, phase, breathSpeed });
    }
  }

  update(ctx: UpdateContext): void {
    this.build(ctx.screenWidth, ctx.screenHeight);

    const speed = ctx.animationSpeed;
    for (const b of this.blocks) {
      const t = ctx.time * b.breathSpeed * speed;
      const breathScale = 1 + Math.sin(t + b.phase) * 0.04;
      const breathAlpha = 0.6 + Math.sin(t * 0.7 + b.phase + 1) * 0.15;

      b.g.scale.set(breathScale);
      b.g.alpha = Math.max(0.3, Math.min(1, breathAlpha));
    }
  }

  destroy(): void {
    for (const b of this.blocks) b.g.destroy();
    this.blocks = [];
    super.destroy();
  }
}