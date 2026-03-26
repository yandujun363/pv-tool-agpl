// PV Tool — Copyright (c) 2026 DanteAlighieri13210914
// Licensed under AGPL-3.0. For commercial use, see COMMERCIAL.md

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