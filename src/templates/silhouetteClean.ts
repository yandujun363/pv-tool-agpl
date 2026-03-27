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

/**
 * Inspired by reference SilhouetteTheme:
 * High-contrast white background with media outline (silhouette),
 * minimal HUD elements, motion detection brackets.
 */
export const silhouetteCleanTemplate: TemplateConfig = {
  name: '剪影极简',
  palette: {
    background: '#ffffff',
    primary: '#000000',
    secondary: '#888888',
    accent: '#333333',
    text: '#000000',
  },
  features: {
    mediaOutline: true,
    motionDetection: true,
  },
  effects: [
    {
      type: 'screenBorder',
      layer: 'decoration',
      config: { color: '$primary', lineWidth: 2, alpha: 0.5, margin: 30, gap: 4 },
    },
    {
      type: 'motionBrackets',
      layer: 'overlay',
      config: { color: '$primary', alpha: 0.6, lineWidth: 2, style: 'medium' },
    },
    {
      type: 'dashedGuideLines',
      layer: 'decoration',
      config: { color: '$secondary', alpha: 0.1 },
    },
    {
      type: 'heroText',
      layer: 'text',
      config: {
        fontSize: 48, x: 0.5, y: 0.88,
        color: '$text', fontWeight: 'bold',
        animation: 'breathe', animationSpeed: 0.3, animationAmount: 0.01,
      },
    },
    {
      type: 'scatteredText',
      layer: 'text',
      config: {
        count: 4, color: '$secondary',
        minSize: 9, maxSize: 12,
        chars: 'OPTICAL CAMOUFLAGE ACTIVE SYSTEM',
      },
    },
  ],
};