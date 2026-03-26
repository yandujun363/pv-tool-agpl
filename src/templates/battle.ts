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

export const battleTemplate: TemplateConfig = {
  name: '战场',
  palette: {
    background: '#1a1a1e',
    primary: '#e0e0e0',
    secondary: '#888888',
    accent: '#5577aa',
    text: '#ffffff',
  },
  effects: [
    {
      type: 'textureBackground',
      layer: 'background',
      config: { intensity: 0.15, driftSpeed: 0.2 },
    },
    {
      type: 'diamondShapes',
      layer: 'decoration',
      config: {
        count: 3, maxSize: 180, x: 0.3, y: 0.35,
        color: '$primary', strokeWidth: 2, alpha: 0.6,
        animationSpeed: 0.06,
      },
    },
    {
      type: 'scatteredShapes',
      layer: 'decoration',
      config: {
        count: 10, color: '$primary',
        shapes: ['square', 'diamond'], minSize: 10, maxSize: 35, alpha: 0.7,
      },
    },
    {
      type: 'heroText',
      layer: 'text',
      config: {
        fontSize: 80, x: 0.6, y: 0.6,
        color: '$text',
        animation: 'breathe', animationSpeed: 0.5, animationAmount: 0.025,
        fontWeight: '900',
      },
    },
    {
      type: 'flowingLines',
      layer: 'decoration',
      config: {
        count: 1, color: '$accent', alpha: 0.6,
        strokeWidth: 2, amplitude: 40, frequency: 0.008, speed: 0.4,
      },
    },
    {
      type: 'vignette',
      layer: 'overlay',
      config: { intensity: 0.8 },
    },
  ],
};