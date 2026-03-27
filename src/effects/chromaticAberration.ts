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

export class ChromaticAberration extends BaseEffect {
  readonly name = 'chromaticAberration';
  private filter!: PIXI.ColorMatrixFilter;
  private targetContainer!: PIXI.Container;

  protected setup(): void {
    // Apply to the parent container passed in (typically the effectsRoot)
    this.filter = new PIXI.ColorMatrixFilter();
    this.targetContainer = this.container.parent ?? this.container;
  }

  update(ctx: UpdateContext): void {
    const offset = (this.config.offset ?? 3) * ctx.motionIntensity;
    const flickerSpeed = (this.config.flickerSpeed ?? 4) * ctx.animationSpeed;
    const flicker = Math.sin(ctx.time * flickerSpeed * Math.PI * 2);

    // Simulate RGB split by shifting the color matrix red/blue channels
    const shift = offset * (0.6 + flicker * 0.4);
    const s = shift / 255;

    this.filter.matrix = [
      1, 0, 0, 0, s,
      0, 1, 0, 0, 0,
      0, 0, 1, 0, -s,
      0, 0, 0, 1, 0,
    ];

    const existing = this.targetContainer.filters ?? [];
    if (!existing.includes(this.filter)) {
      this.targetContainer.filters = [...existing, this.filter];
    }
  }

  destroy(): void {
    if (this.targetContainer?.filters) {
      this.targetContainer.filters = this.targetContainer.filters.filter(f => f !== this.filter);
    }
    super.destroy();
  }
}