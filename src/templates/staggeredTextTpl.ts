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

export const staggeredTextTplTemplate: TemplateConfig = {
  name: '错落文字',
  nameKey: 'tpl_staggeredText',
  animationSpeed: 3.4,
  palette: {
    background: '#1a2a6c',
    primary: '#ffffff',
    secondary: '#8899cc',
    accent: '#4466dd',
    text: '#ffffff',
  },
  effects: [
    // Staggered text — the core effect cycling through 5 layout modes
    { type: 'staggeredText', layer: 'text', config: {
      color: '#ffffff', fontSize: 68, modeDuration: 3.5,
      transition: 0.5, colChars: 5,
      fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
      frameColor: '#ffffff', frameAlpha: 0.5, framePadding: 35,
    }},

    // Subtle chromatic aberration — blue-toned shift
    { type: 'chromaticAberration', layer: 'overlay', config: {
      amount: 3, angle: 0.1,
    }},

    // Light vignette
    { type: 'vignette', layer: 'overlay', config: {
      color: '#0a1440', alpha: 0.4,
    }},
  ],
};
