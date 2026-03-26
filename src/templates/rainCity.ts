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

export const rainCityTemplate: TemplateConfig = {
  name: '黑客帝国',
  nameKey: 'tpl_rainCity',
  palette: {
    background: '#000000',
    primary: '#003b00',
    secondary: '#005500',
    accent: '#00ff41',
    text: '#00ff41',
  },
  effects: [
    {
      type: 'gradientOverlay',
      layer: 'background',
      config: {
        colorTop: '#003838',
        colorMid: '#004848',
        colorBottom: '#001020',
        alpha: 0.5,
        mode: 'linear',
      },
    },
    {
      type: 'fallingText',
      layer: 'decoration',
      config: {
        color: '$accent',
        count: 35,
        minSize: 24,
        maxSize: 68,
        fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
      },
    },
    {
      type: 'chromaticAberration',
      layer: 'overlay',
      config: {
        offset: 4,
        flickerSpeed: 1.5,
      },
    },
    {
      type: 'vignette',
      layer: 'overlay',
      config: {
        color: '#000000',
        alpha: 0.7,
        radius: 0.6,
      },
    },
  ],
};