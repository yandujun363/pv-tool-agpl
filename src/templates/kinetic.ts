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
 * Matches reference PV section A (frames 1-7):
 * White/cream background, red accent, diagonal-fill shapes,
 * bold typography, scattered text, film-grain texture
 */
export const kineticTemplate: TemplateConfig = {
  name: '激烈風 A',
  palette: {
    background: '#f5f0eb',
    primary: '#1a1a1a',
    secondary: '#8b0000',
    accent: '#cc1a1a',
    text: '#1a1a1a',
  },
  effects: [
    {
      type: 'textureBackground',
      layer: 'background',
      config: { intensity: 0.08, driftSpeed: 0.2 },
    },
    {
      type: 'diagonalFill',
      layer: 'decoration',
      config: {
        shape: 'bowtie', size: 350,
        color: '$secondary', lineColor: '$background',
        lineSpacing: 5, lineWidth: 1.5, alpha: 0.85,
        x: 0.5, y: 0.5, animationSpeed: 0.3,
      },
    },
    {
      type: 'diagonalFill',
      layer: 'decoration',
      config: {
        shape: 'diamond', size: 220,
        color: '$primary', lineColor: '$background',
        lineSpacing: 6, lineWidth: 1, alpha: 0.8,
        x: 0.7, y: 0.35, animationSpeed: 0.15,
      },
    },
    {
      type: 'heroText',
      layer: 'text',
      config: {
        fontSize: 100, x: 0.5, y: 0.48,
        color: '$text', fontWeight: '900',
        animation: 'breathe', animationSpeed: 0.6, animationAmount: 0.04,
        letterSpacing: 12,
      },
    },
    {
      type: 'scatteredText',
      layer: 'text',
      config: {
        count: 12, color: '$secondary',
        minSize: 18, maxSize: 50,
        chars: 'えたあほらまだ逢違',
      },
    },
    {
      type: 'flowingLines',
      layer: 'decoration',
      config: {
        count: 2, color: '$primary', alpha: 0.3,
        strokeWidth: 1, amplitude: 30, speed: 0.4,
      },
    },
    {
      type: 'scatteredShapes',
      layer: 'decoration',
      config: {
        count: 6, color: '$primary',
        shapes: ['square', 'diamond'], minSize: 5, maxSize: 20, alpha: 0.4,
      },
    },
    {
      type: 'vignette',
      layer: 'overlay',
      config: { intensity: 0.3 },
    },
  ],
};