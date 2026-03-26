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

import type { TemplateConfig, UpdateContext } from '../types';
import { createEffect, BaseEffect } from '../../effects';

export class EffectManager {
  private engine: any;
  private activeEffects: BaseEffect[] = [];

  constructor(engine: any) {
    this.engine = engine;
  }

  loadTemplateEffects(template: TemplateConfig): void {
    this.clearEffects();
    
    const layers = this.engine.layers;
    const palette = this.engine.palette;
    const userText = this.engine.userText;
    const textSegments = this.engine.textSegments;

    for (const entry of template.effects) {
      const layer = layers.get(entry.layer);
      if (!layer) continue;

      const config = { ...entry.config };
      if (userText) {
        config._userText = textSegments[0] || userText;
      }

      try {
        const effect = createEffect(entry.type, layer, config, palette);
        this.activeEffects.push(effect);
      } catch (err) {
        console.warn(`[PVEngine] Failed to create effect "${entry.type}":`, err);
      }
    }
  }

  getEffectCount(): number {
    return this.activeEffects.length;
  }

  updateEffects(ctx: UpdateContext, tick: number): void {
    const n = this.activeEffects.length;
    const heavySkip = n > 15 ? 3 : n > 8 ? 2 : 0;

    for (const effect of this.activeEffects) {
      try {
        if (heavySkip && (effect as any).heavy && tick % heavySkip !== 0) continue;
        effect.update(ctx);
      } catch (err) {
        console.warn(`[PVEngine] Effect "${effect.name}" update error:`, err);
      }
    }
  }

  private clearEffects() {
    for (const e of this.activeEffects) {
      try { e.destroy(); } catch { /* already destroyed */ }
    }
    this.activeEffects = [];
    
    const layers = this.engine.layers;
    for (const [key, layer] of layers) {
      if (key !== 'media' && layer.children.length > 0) {
        try { layer.removeChildren().forEach((c: any) => c.destroy()); } catch { /* safe */ }
      }
    }
  }

  destroy(): void {
    this.clearEffects();
  }
}