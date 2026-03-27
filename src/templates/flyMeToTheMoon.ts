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

export const flyMeToTheMoonTemplate: TemplateConfig = {
  name: 'Fly Me to the Moon',
  nameKey: 'tpl_flyMeToTheMoon',
  palette: {
    background: '#1122ee',
    primary: '#c0c0d0',
    secondary: '#888899',
    accent: '#6a6a8a',
    text: '#e0e0e0',
  },
  animationSpeed: 3.7,
  effects: [
    {
      type: 'textureBackground',
      layer: 'background',
      config: {},
    },
    {
      type: 'gradientOverlay',
      layer: 'background',
      config: {
        colorTop: '#0a0a18',
        colorBottom: '#000008',
        alpha: 0.55,
        mode: 'radial',
      },
    },
    {
      type: 'scatteredShapes',
      layer: 'decoration',
      config: {
        color: '$primary',
      },
    },
    {
      type: 'planet',
      layer: 'decoration',
      config: {
        color: '#ffffff',
        radius: 120,
        coreRadius: 12,
      },
    },
    {
      type: 'verticalSubText',
      layer: 'text',
      config: {
        color: '#ffffff',
        fontSize: 13,
      },
    },
    {
      type: 'vignette',
      layer: 'overlay',
      config: {
        color: '#000010',
        alpha: 0.35,
        radius: 0.7,
      },
    },
    {
      type: 'dotScreen',
      layer: 'overlay',
      config: {},
    },
  ],
  postfx: {
    shake: 0,
    zoom: 0.65,
    tilt: -0.52,
    glitch: 0,
    hueShift: -10,
  },
};
