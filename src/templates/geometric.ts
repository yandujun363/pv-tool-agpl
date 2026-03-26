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

export const geometricTemplate: TemplateConfig = {
  name: '几何',
  nameKey: 'tpl_geometric',
  palette: {
    background: '#ffee00',
    primary: '#1a1a1a',
    secondary: '#ffffff',
    accent: '#888888',
    text: '#ffffff',
  },
  effects: [
    {
      type: 'diagonalHatch',
      layer: 'background',
      config: { spacing: 8, lineWidth: 0.7, color: '$accent', alpha: 0.14 },
    },
    {
      type: 'screenBorder',
      layer: 'decoration',
      config: { color: '$primary', lineWidth: 1.5, alpha: 0.6, margin: 22, gap: 6, starSize: 5, edgeStarCount: 5, edgeStarCountV: 3 },
    },
    {
      type: 'centeredSquares',
      layer: 'decoration',
      config: {
        outerSize: 320,
        midSize: 240,
        innerSize: 170,
        borderColor: '$primary',
        midColor: '$primary',
        innerColor: '$secondary',
        fontSize: 52,
        charSpreadFrac: 0.5,
        staggerY: 18,
      },
    },
    {
      type: 'vignette',
      layer: 'overlay',
      config: { intensity: 0.35 },
    },
  ],
};