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

export class TextStrip extends BaseEffect {
  readonly name = 'textStrip';
  private stripContainer!: PIXI.Container;
  private textContainer!: PIXI.Container;

  private displayedText = '';
  private pendingText = '';
  private textAlpha = 1;
  private fadeState: 'idle' | 'fadeOut' | 'fadeIn' = 'idle';

  protected setup(): void {
    this.stripContainer = new PIXI.Container();
    this.container.addChild(this.stripContainer);

    const stripColor = resolveColor(this.config.stripColor ?? '$secondary', this.palette);
    const width = this.config.stripWidth ?? 80;
    const height = this.config.stripHeight ?? 600;
    const rotation = (this.config.rotation ?? -30) * Math.PI / 180;

    const bg = new PIXI.Graphics();
    bg.rect(-width / 2, -height / 2, width, height);
    bg.fill({ color: stripColor, alpha: this.config.stripAlpha ?? 0.85 });
    this.stripContainer.addChild(bg);

    this.textContainer = new PIXI.Container();
    this.stripContainer.addChild(this.textContainer);
    this.stripContainer.rotation = rotation;

    const text = this.config._userText || this.config.text || 'ヨルシカ';
    this.buildText(text);
  }

  private buildText(text: string): void {
    this.textContainer.removeChildren().forEach(c => c.destroy());
    this.displayedText = text;

    const textColor = resolveColor(this.config.textColor ?? '$text', this.palette);
    const height = this.config.stripHeight ?? 600;
    const fontSize = this.config.fontSize ?? 60;

    const chars = text.split('');
    const charSpacing = height / (chars.length + 1);

    for (let i = 0; i < chars.length; i++) {
      const style = new PIXI.TextStyle({
        fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
        fontSize,
        fontWeight: 'bold',
        fill: textColor,
      });
      const t = new PIXI.Text({ text: chars[i], style });
      t.anchor.set(0.5);
      t.y = -height / 2 + charSpacing * (i + 1);
      this.textContainer.addChild(t);
    }
  }

  update(ctx: UpdateContext): void {
    const newText = ctx.currentText || this.config.text || 'ヨルシカ';

    if (newText !== this.displayedText && this.fadeState === 'idle') {
      this.pendingText = newText;
      this.fadeState = 'fadeOut';
    }

    const fadeSpeed = 4 * Math.max(ctx.animationSpeed, 0.5);
    if (this.fadeState === 'fadeOut') {
      this.textAlpha -= ctx.deltaTime * fadeSpeed;
      if (this.textAlpha <= 0) {
        this.textAlpha = 0;
        this.buildText(this.pendingText);
        this.fadeState = 'fadeIn';
      }
    } else if (this.fadeState === 'fadeIn') {
      this.textAlpha += ctx.deltaTime * fadeSpeed;
      if (this.textAlpha >= 1) {
        this.textAlpha = 1;
        this.fadeState = 'idle';
      }
    }
    this.textContainer.alpha = this.textAlpha;

    const px = (this.config.x ?? 0.5) * ctx.screenWidth;
    const py = (this.config.y ?? 0.5) * ctx.screenHeight;
    const drift = ctx.motionIntensity;
    this.stripContainer.x = px + Math.sin(ctx.time * 0.3 * ctx.animationSpeed) * 3 * drift;
    this.stripContainer.y = py;
  }
}