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

export const blueBoldTemplate: TemplateConfig = {
  name: '蓝色冲击',
  nameKey: 'tpl_blueBold',
  palette: {
    background: '#1122ee',
    primary: '#ffffff',
    secondary: '#e0e0e0',
    accent: '#0022aa',
    text: '#e0e0e0',
  },
  effects: [
    {
      type: 'bigOutlineText',
      layer: 'decoration',
      config: {
        color: '#d8d8e0',
        strokeColor: '#ffffff',
        fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic Pro", sans-serif',
        staggerDelay: 0.18,
      },
    },
    {
      type: 'shadowShapes',
      layer: 'text',
      config: {
        color: '#ffffff',
        shadowColor: '#000055',
        shadowAlpha: 0.45,
        shadowOffX: 14,
        shadowOffY: 16,
        shapes: [
          { type: 'square', x: 0.38, y: 0.32, size: 0.16, rotation: -0.08 },
          { type: 'diamond', x: 0.55, y: 0.58, size: 0.15, rotation: 0.785 },
          { type: 'rect',    x: 0.68, y: 0.40, size: 0.12, rotation: 0.02 },
          { type: 'square', x: 0.25, y: 0.62, size: 0.09, rotation: 0.1 },
        ],
      },
    },
    {
      type: 'vignette',
      layer: 'overlay',
      config: {
        color: '#000022',
        alpha: 0.35,
        radius: 0.7,
      },
    },
  ],
};