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

export const blueInkTemplate: TemplateConfig = {
  name: '青墨',
  palette: {
    background: '#3366cc',
    primary: '#001a66',
    secondary: '#ffffff',
    accent: '#0044aa',
    text: '#001a66',
  },
  effects: [
    {
      type: 'colorMask',
      layer: 'background',
      config: {
        color: '#ffffff', alpha: 0.15,
        coverage: { x: 0.4, y: 0, w: 0.6, h: 1 },
      },
    },
    {
      type: 'crossPattern',
      layer: 'decoration',
      config: {
        spacing: 35, size: 3, color: '$secondary', alpha: 0.6,
        area: { x: 0.3, y: 0.1, w: 0.5, h: 0.8 },
      },
    },
    {
      type: 'heroText',
      layer: 'text',
      config: {
        fontSize: 90, x: 0.15, y: 0.5,
        rotation: -90, color: '$text',
        animation: 'breathe', animationSpeed: 0.4, animationAmount: 0.02,
      },
    },
    {
      type: 'scatteredText',
      layer: 'text',
      config: { count: 8, color: '$text', minSize: 14, maxSize: 35 },
    },
    {
      type: 'scatteredShapes',
      layer: 'decoration',
      config: {
        count: 6, color: '$secondary',
        shapes: ['dot', 'square'], minSize: 5, maxSize: 15, alpha: 0.55,
      },
    },
    {
      type: 'vignette',
      layer: 'overlay',
      config: { intensity: 0.4 },
    },
  ],
};