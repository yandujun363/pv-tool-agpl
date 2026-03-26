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

export type LayerType = 'background' | 'decoration' | 'media' | 'text' | 'overlay';

export interface ColorPalette {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

export interface EffectEntry {
  type: string;
  layer: LayerType;
  config: Record<string, any>;
}

export interface TemplateConfig {
  name: string;
  nameKey?: string;
  palette: ColorPalette;
  effects: EffectEntry[];
  bpm?: number;
  animationSpeed?: number;
  bgOpacity?: number;
  postfx?: {
    shake?: number;
    zoom?: number;
    tilt?: number;
    glitch?: number;
    hueShift?: number;
  };
  features?: {
    mediaOutline?: boolean;
    autoExtractColors?: boolean;
    motionDetection?: boolean;
    invertMedia?: boolean;
    thresholdMedia?: boolean;
  };
}

export interface MotionTargetInfo {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  area: number;
}

export interface UpdateContext {
  time: number;
  deltaTime: number;
  screenWidth: number;
  screenHeight: number;
  palette: ColorPalette;
  animationSpeed: number;
  motionIntensity: number;
  currentText: string;
  beatIntensity: number;
  motionTargets: MotionTargetInfo[];
}

export interface Beat {
  time: number;
  type: 'kick' | 'snare' | 'accent';
}

export interface LyricChar {
  text: string;
  startTime: number;
  endTime: number;
}

export interface LyricPhrase {
  chars: LyricChar[];
  startTime: number;
  endTime: number;
}

export interface LyricLine {
  time: number;
  text: string;
}

export interface Segment {
  type: 'verse' | 'chorus' | 'bridge';
  startTime: number;
  endTime: number;
}

export interface MusicData {
  bpm: number;
  beats: Beat[];
  lyrics: LyricPhrase[];
  segments: Segment[];
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function resolveColor(color: string, palette: ColorPalette): string {
  if (color === '$line') {
    return luminance(palette.background) > 0.55 ? '#999999' : '#ffffff';
  }
  if (color.startsWith('$')) {
    const key = color.slice(1) as keyof ColorPalette;
    return palette[key] || '#000000';
  }
  return color;
}