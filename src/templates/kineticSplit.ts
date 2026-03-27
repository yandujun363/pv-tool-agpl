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

export const kineticSplitTemplate: TemplateConfig = {
  name: '斩击',
  nameKey: 'tpl_kineticSplit',
  palette: {
    background: '#f0ece8',
    primary: '#1a1a1a',
    secondary: '#ffffff',
    accent: '#8b1a1a',
    text: '#1a1a1a',
  },
  effects: [
    {
      type: 'diagonalHatch',
      layer: 'background',
      config: { spacing: 7, lineWidth: 0.6, color: '$accent', alpha: 0.1 },
    },
    {
      type: 'diagonalSplit',
      layer: 'decoration',
      config: {
        color: '$accent',
        alpha: 1,
        rotSpeed: 0.25,
        baseHalfAngle: 0.6,
        angleVariation: 0.3,
        initRotation: -1.5708,
        hatchSpacing: 6,
        centerSize: 12,
        centerColor: '$primary',
      },
    },
    {
      type: 'screenBorder',
      layer: 'decoration',
      config: { color: '$primary', lineWidth: 1.5, alpha: 0.5, margin: 18, gap: 5, starSize: 4, edgeStarCount: 4, edgeStarCountV: 2 },
    },
    {
      type: 'layeredText',
      layer: 'text',
      config: {
        color: '$primary',
        fontSize: 90,
        maxLayers: 4,
      },
    },
    {
      type: 'vignette',
      layer: 'overlay',
      config: { intensity: 0.3 },
    },
  ],
};