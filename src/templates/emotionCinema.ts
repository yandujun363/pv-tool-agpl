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

import type { TemplateConfig } from '../core/types';

/**
 * Inspired by reference EmotionTheme:
 * Cinematic melancholy with heavy vignette, desaturated cool tones,
 * floating emotional text, thin elegant corner brackets on targets.
 */
export const emotionCinemaTemplate: TemplateConfig = {
  name: '情绪电影(建议配合视频使用)',
  nameKey: 'tpl_emotionCinema',
  palette: {
    background: '#0d1018',
    primary: '#c8c8d0',
    secondary: '#4455aa',
    accent: '#7788cc',
    text: '#e0e0e8',
  },
  features: {
    motionDetection: true,
  },
  effects: [
    {
      type: 'gradientOverlay',
      layer: 'background',
      config: { colorTop: '#141828', colorBottom: '#080c14', alpha: 0.7 },
    },
    {
      type: 'flowingLines',
      layer: 'decoration',
      config: {
        count: 4, color: '$secondary', alpha: 0.15,
        strokeWidth: 0.5, amplitude: 80, speed: 0.08,
      },
    },
    {
      type: 'scatteredText',
      layer: 'text',
      config: {
        count: 6, color: '$secondary',
        minSize: 12, maxSize: 20,
        chars: 'MELANCHOLY SOLITUDE VOID FADING ECHO 虚無 薄れゆく 永劫回帰',
      },
    },
    {
      type: 'motionBrackets',
      layer: 'overlay',
      config: { color: '$primary', alpha: 0.5, lineWidth: 1, style: 'medium' },
    },
    {
      type: 'heroText',
      layer: 'text',
      config: {
        fontSize: 60, x: 0.5, y: 0.5,
        color: '$text',
        animation: 'breathe', animationSpeed: 0.15, animationAmount: 0.02,
        fontFamily: '"Noto Serif JP", "Source Han Serif", serif',
      },
    },
    {
      type: 'vignette',
      layer: 'overlay',
      config: { color: '#000000', alpha: 0.8 },
    },
    {
      type: 'colorMask',
      layer: 'overlay',
      config: { color: '#1a2040', alpha: 0.15 },
    },
  ],
};