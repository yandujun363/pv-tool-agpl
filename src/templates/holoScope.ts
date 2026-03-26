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

export const holoScopeTemplate: TemplateConfig = {
  name: '全息',
  palette: {
    background: '#0a0a14',
    primary: '#6666cc',
    secondary: '#4444aa',
    accent: '#cc44aa',
    text: '#aaaaff',
  },
  bpm: 128,
  effects: [
    {
      type: 'glowRing',
      layer: 'background',
      config: {
        colorInner: '#3344dd',
        colorOuter: '#bb22aa',
        radius: 0.36,
        ringWidth: 0.14,
        alpha: 0.65,
      },
    },
    {
      type: 'targetGuide',
      layer: 'decoration',
      config: {
        color: '#7777cc',
        alpha: 0.35,
        rings: [0.1, 0.16, 0.24],
        tickCount: 12,
      },
    },
    {
      type: 'lightSpot',
      layer: 'overlay',
      config: {
        color: '#ccccff',
        alpha: 0.5,
        x: 0.5,
        y: 0.08,
        size: 0.55,
      },
    },
    {
      type: 'chromaticAberration',
      layer: 'overlay',
      config: {
        offset: 5,
        flickerSpeed: 2,
      },
    },
    {
      type: 'vignette',
      layer: 'overlay',
      config: {
        color: '#000011',
        alpha: 0.8,
        radius: 0.5,
      },
    },
  ],
};