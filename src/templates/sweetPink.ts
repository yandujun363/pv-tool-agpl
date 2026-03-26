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

export const sweetPinkTemplate: TemplateConfig = {
  name: '格子花边',
  nameKey: 'tpl_sweetPink',
  palette: {
    background: '#fef5f8',
    primary: '#fab2b5',
    secondary: '#f8c7ca',
    accent: '#ecbfc0',
    text: '#fab2b5',
  },
  bpm: 120,
  animationSpeed: 1.0,
  effects: [
    {
      type: 'pinkGrid',
      layer: 'background',
      config: {
        color: '#f8c7ca',
        cellSize: 50,
        lineColor: '#ffffff',
        lineWidth: 2,
        speed: 30,
        alpha: 1.0,
      },
    },
    {
      type: 'pulsingCircle',
      layer: 'background',
      config: {
        strokeColor: '#ffffff',
        strokeAlpha: 0.8,
        strokeWidth: 8,
        outerStrokeColor: '#ecbfc0',
        outerStrokeWidth: 3,
        outerStrokeAlpha: 0.6,
        radius: 250,
        x: 0.5,
        y: 0.5,
        animSpeed: 0.2,
        strokePulseAmount: 0.5,
        radiusPulseAmount: 0.08,
        enableBeatReact: false,
      },
    },
    {
      type: 'scalloppedBorder',
      layer: 'decoration',
      config: {
        color: '#ffffff',
        shadowColor: '#ecbfc0',
        shadowAlpha: 0.6,
        shadowOffsetX: 0,
        shadowOffsetY: 8,
        circleRadius: 80,
        animSpeed: 0.2,
        moveAmount: 15,
        alpha: 1.0,
      },
    },
    {
      type: 'cuteOutlineText',
      layer: 'text',
      config: {
        fillColor: '#fab2b5',
        strokeColor: '#ffffff',
        fontSize: 80,
        strokeWidth: 8,
        fontWeight: '900',
        letterSpacing: 4,
        x: 0.5,
        y: 0.5,
      },
    },
  ],
};
