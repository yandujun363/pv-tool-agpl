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

export const cyberTemplate: TemplateConfig = {
  name: '电脑',
  palette: {
    background: '#e8edf2',
    primary: '#2255aa',
    secondary: '#334466',
    accent: '#4488cc',
    text: '#1a1a1a',
  },
  effects: [
    {
      type: 'halftoneBlocks',
      layer: 'decoration',
      config: {
        count: 10, color: '$primary',
        blockSize: 50, dotSpacing: 5, dotRadius: 1.5, alpha: 0.65,
      },
    },
    {
      type: 'diamondShapes',
      layer: 'decoration',
      config: {
        count: 3, maxSize: 200, x: 0.5, y: 0.5,
        color: '$secondary', strokeWidth: 2, alpha: 0.7,
        animationSpeed: 0.05,
      },
    },
    {
      type: 'heroText',
      layer: 'text',
      config: {
        fontSize: 100, x: 0.5, y: 0.45,
        color: '$text',
        animation: 'breathe', animationSpeed: 0.3, animationAmount: 0.02,
        letterSpacing: 20,
      },
    },
    {
      type: 'scatteredShapes',
      layer: 'decoration',
      config: {
        count: 15, color: '$primary',
        shapes: ['square'], minSize: 8, maxSize: 30, alpha: 0.6,
      },
    },
  ],
};