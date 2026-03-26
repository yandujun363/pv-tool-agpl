// PV Tool — Copyright (c) 2026 DanteAlighieri13210914
// Licensed under AGPL-3.0. For commercial use, see COMMERCIAL.md

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