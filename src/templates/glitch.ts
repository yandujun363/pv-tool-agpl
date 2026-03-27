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

import type { TemplateConfig } from '../core/types';

/**
 * Matches reference PV section B (frames 8-12):
 * Black background, white text cards flying in,
 * chromatic aberration, glitch bars, bold katakana
 */
export const glitchTemplate: TemplateConfig = {
  name: '故障風 B',
  palette: {
    background: '#0a0a0a',
    primary: '#ffffff',
    secondary: '#ff00ff',
    accent: '#00ffff',
    text: '#0a0a0a',
  },
  effects: [
    {
      type: 'textCards',
      layer: 'decoration',
      config: {
        cardColor: '$primary', textColor: '$text',
        borderColor: '$accent',
        fontSize: 80, padding: 25,
        spawnInterval: 0.5, lifetime: 2.5,
        fontFamily: '"Noto Sans JP", "Yu Gothic", sans-serif',
      },
    },
    {
      type: 'glitchBars',
      layer: 'decoration',
      config: {
        color: '$primary', alpha: 0.85,
        spawnRate: 0.12, maxBars: 10,
        minHeight: 2, maxHeight: 10,
      },
    },
    {
      type: 'glitchBars',
      layer: 'decoration',
      config: {
        color: '$secondary', alpha: 0.4,
        spawnRate: 0.3, maxBars: 4,
        minHeight: 1, maxHeight: 4,
      },
    },
    {
      type: 'chromaticAberration',
      layer: 'overlay',
      config: { offset: 4, flickerSpeed: 3 },
    },
    {
      type: 'scatteredShapes',
      layer: 'decoration',
      config: {
        count: 8, color: '$primary',
        shapes: ['square'], minSize: 3, maxSize: 10, alpha: 0.3,
      },
    },
    {
      type: 'heroText',
      layer: 'text',
      config: {
        fontSize: 50, x: 0.5, y: 0.88,
        color: '$primary', fontWeight: 'bold',
        animation: 'breathe', animationSpeed: 0.8, animationAmount: 0.02,
        fontFamily: '"Noto Sans JP", sans-serif',
      },
    },
  ],
};