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

export const girlyCloudTemplate: TemplateConfig = {
  name: '少女云朵',
  nameKey: 'tpl_girlyClouds',
  palette: {
    background: '#fef5f8',
    primary: '#fbbdbe',
    secondary: '#f8d7da',
    accent: '#ff9eb5',
    text: '#5a3a3f',
  },
  bpm: 120,
  animationSpeed: 1.5,
  effects: [
    {
      type: 'pinkStripes',
      layer: 'background',
      config: {
        pinkColor: '#fbbdbe',
        stripeWidth: 150,
        speed: 0.3,
        angle: -45,
        alpha: 1.0,
      },
    },
    {
      type: 'edgeClouds',
      layer: 'decoration',
      config: {
        color: '#ffffff',
        alpha: 1.0,
        cloudCount: 5,
        baseRadius: 100,
        minCircles: 6,
        maxCircles: 10,
        shadowOffsetX: 4,
        shadowOffsetY: 4,
        shadowAlpha: 0.25,
        shadowColor: '#fbbdbe',
      },
    },
    {
      type: 'heroText',
      layer: 'text',
      config: {
        color: '#5a3a3f',
        fontSize: 72,
        fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic Pro", sans-serif',
      },
    },
  ],
};
