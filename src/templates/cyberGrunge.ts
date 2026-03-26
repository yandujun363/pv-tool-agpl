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

export const cyberGrungeTemplate: TemplateConfig = {
  name: '赛博废墟',
  nameKey: 'tpl_cyberGrunge',
  palette: {
    background: '#000000',
    primary: '#ffffff',
    secondary: '#888888',
    accent: '#cccccc',
    text: '#ffffff',
  },
  features: {
    thresholdMedia: true,
  },
  effects: [
    // Heavy halftone dot screen — the defining texture of this style
    { type: 'dotScreen', layer: 'overlay', config: {
      spacing: 6, dotRadius: 2, color: '#ffffff', alpha: 0.18, angle: 22,
    }},

    // Dense scanlines
    { type: 'scanlines', layer: 'overlay', config: {
      color: '#000000', alpha: 0.2, spacing: 3,
    }},

    // Heavy film grain — xerox / photocopy feel
    { type: 'filmGrain', layer: 'overlay', config: {
      alpha: 0.14, mono: true, updateInterval: 2,
    }},

    // Data monitors — floating CRT terminal rectangles
    { type: 'dataMonitors', layer: 'decoration', config: {
      count: 4, borderColor: '#ffffff', fillColor: '#000000',
      dataColor: '#ffffff', alpha: 0.65,
    }},

    // Garbled noise text blocks — information overload
    { type: 'noiseText', layer: 'decoration', config: {
      count: 10, color: '#ffffff', bgColor: '#000000',
    }},

    // Diagonal hatch for industrial screen-tone feel
    { type: 'diagonalHatch', layer: 'decoration', config: {
      color: '#ffffff', alpha: 0.06, spacing: 12,
    }},

    // Scattered shapes — debris-like fragments
    { type: 'scatteredShapes', layer: 'decoration', config: {
      color: '#ffffff', alpha: 0.08,
    }},

    // Glitch bars — digital corruption
    { type: 'glitchBars', layer: 'overlay', config: {
      color: '#ffffff', alpha: 0.4,
    }},

    // Glowing text cards — lyrics as individual character cards
    { type: 'glowTextCards', layer: 'text', config: {
      cardColor: '#ffffff', textColor: '#000000',
      fontSize: 64, glowAlpha: 0.5, charsPerRow: 5,
    }},

    // Vignette — darkened edges
    { type: 'vignette', layer: 'overlay', config: {
      color: '#000000', alpha: 0.7,
    }},
  ],
};
