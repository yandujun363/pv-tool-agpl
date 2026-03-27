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

export class HeroText extends BaseEffect {
  readonly name = 'heroText';
  private textObj!: PIXI.Text;
  private initialRotation = 0;

  private displayedText = '';
  private pendingText = '';
  private textAlpha = 1;
  private fadeState: 'idle' | 'fadeOut' | 'fadeIn' = 'idle';

  protected setup(): void {
    const text = this.config._userText || this.config.text || '春を告げる';
    const fontSize = this.config.fontSize ?? 120;
    const fontFamily = this.config.fontFamily ?? '"Noto Serif JP", "Yu Mincho", "MS Mincho", serif';
    const color = resolveColor(this.config.color ?? '$text', this.palette);

    const style = new PIXI.TextStyle({
      fontFamily,
      fontSize,
      fontWeight: this.config.fontWeight ?? 'bold',
      fill: color,
      letterSpacing: this.config.letterSpacing ?? 8,
    });

    this.textObj = new PIXI.Text({ text, style });
    this.textObj.anchor.set(0.5);
    this.displayedText = text;

    this.initialRotation = (this.config.rotation ?? 0) * Math.PI / 180;
    this.textObj.rotation = this.initialRotation;

    this.container.addChild(this.textObj);
  }

  update(ctx: UpdateContext): void {
    const newText = ctx.currentText || this.config.text || '春を告げる';

    if (newText !== this.displayedText && this.fadeState === 'idle') {
      this.pendingText = newText;
      this.fadeState = 'fadeOut';
    }

    const fadeSpeed = 4 * Math.max(ctx.animationSpeed, 0.5);
    if (this.fadeState === 'fadeOut') {
      this.textAlpha -= ctx.deltaTime * fadeSpeed;
      if (this.textAlpha <= 0) {
        this.textAlpha = 0;
        this.textObj.text = this.pendingText;
        this.displayedText = this.pendingText;
        this.fadeState = 'fadeIn';
      }
    } else if (this.fadeState === 'fadeIn') {
      this.textAlpha += ctx.deltaTime * fadeSpeed;
      if (this.textAlpha >= 1) {
        this.textAlpha = 1;
        this.fadeState = 'idle';
      }
    }
    this.textObj.alpha = this.textAlpha;

    const px = this.config.x ?? 0.5;
    const py = this.config.y ?? 0.5;
    this.textObj.x = px * ctx.screenWidth;
    this.textObj.y = py * ctx.screenHeight;

    const animation = this.config.animation ?? 'breathe';
    if (animation === 'breathe') {
      const speed = (this.config.animationSpeed ?? 0.5) * ctx.animationSpeed;
      const amount = (this.config.animationAmount ?? 0.03) * ctx.motionIntensity;
      const beatPulse = ctx.beatIntensity * 0.08;
      const scale = 1 + Math.sin(ctx.time * speed * Math.PI * 2) * amount + beatPulse;
      this.textObj.scale.set(scale);
    } else if (animation === 'rotate') {
      const rotSpeed = (this.config.rotationSpeed ?? 0.1) * ctx.animationSpeed;
      this.textObj.rotation = this.initialRotation + ctx.time * rotSpeed;
    }
  }
}