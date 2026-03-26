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

import type { PVEngine } from '../core/engine';
import type { UIElements } from './elements';

export function initPostfxPanel(engine: PVEngine, ui: UIElements): void {
  // Shake
  ui.shakeSlider.addEventListener('input', () => {
    const v = parseFloat(ui.shakeSlider.value);
    engine.shake = v;
    ui.shakeVal.textContent = v.toFixed(2);
  });

  // Zoom
  ui.zoomSlider.addEventListener('input', () => {
    const v = parseFloat(ui.zoomSlider.value);
    engine.zoom = v;
    ui.zoomVal.textContent = v.toFixed(2);
  });

  // Tilt
  ui.tiltSlider.addEventListener('input', () => {
    const v = parseFloat(ui.tiltSlider.value);
    engine.tilt = v;
    ui.tiltVal.textContent = `${(v * 17.2).toFixed(0)}°`;
  });

  // Glitch
  ui.glitchSlider.addEventListener('input', () => {
    const v = parseFloat(ui.glitchSlider.value);
    engine.glitch = v;
    ui.glitchVal.textContent = v.toFixed(2);
  });

  // Hue shift
  ui.hueSlider.addEventListener('input', () => {
    const v = parseFloat(ui.hueSlider.value);
    engine.hueShift = v;
    ui.hueVal.textContent = `${v}°`;
  });
}

export function syncPostfxSliders(engine: PVEngine, ui: UIElements): void {
  ui.shakeSlider.value = String(engine.shake);
  ui.shakeVal.textContent = engine.shake.toFixed(2);
  ui.zoomSlider.value = String(engine.zoom);
  ui.zoomVal.textContent = engine.zoom.toFixed(2);
  ui.tiltSlider.value = String(engine.tilt);
  ui.tiltVal.textContent = `${(engine.tilt * 17.2).toFixed(0)}°`;
  ui.glitchSlider.value = String(engine.glitch);
  ui.glitchVal.textContent = engine.glitch.toFixed(2);
  ui.hueSlider.value = String(engine.hueShift);
  ui.hueVal.textContent = `${engine.hueShift}°`;
}