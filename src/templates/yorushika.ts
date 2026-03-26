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

export const yorushikaTemplate: TemplateConfig = {
  name: '夜色',
  palette: {
    background: '#1a1a1a',
    primary: '#ffffff',
    secondary: '#aaaaaa',
    accent: '#e8e8e8',
    text: '#ffffff',
  },
  effects: [
    {
      type: 'textureBackground',
      layer: 'background',
      config: { intensity: 0.12, driftSpeed: 0.3 },
    },
    {
      type: 'concentricCircles',
      layer: 'decoration',
      config: {
        count: 4, maxRadius: 250, x: 0.5, y: 0.5,
        color: '$primary', strokeWidth: 1.5, alpha: 0.7,
        animation: 'rotate', animationSpeed: 0.1,
      },
    },
    {
      type: 'textStrip',
      layer: 'decoration',
      config: {
        rotation: -25, x: 0.5, y: 0.5,
        stripColor: '$primary', textColor: '#1a1a1a',
        stripWidth: 70, stripHeight: 500, fontSize: 55,
      },
    },
    {
      type: 'flowingLines',
      layer: 'decoration',
      config: {
        count: 2, color: '$secondary', alpha: 0.5,
        strokeWidth: 1, amplitude: 60, speed: 0.3,
      },
    },
    {
      type: 'scatteredText',
      layer: 'text',
      config: {
        count: 10, color: '$secondary',
        minSize: 16, maxSize: 40,
        chars: 'つもにはでをがのへと',
      },
    },
    {
      type: 'vignette',
      layer: 'overlay',
      config: { intensity: 0.7 },
    },
  ],
};