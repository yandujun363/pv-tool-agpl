// PV Tool — Copyright (c) 2026 DanteAlighieri13210914
// Licensed under AGPL-3.0. For commercial use, see COMMERCIAL.md

import type { PVEngine } from '../core/engine';
import type { UIElements } from './elements';

let pendingFile: File | null = null;

function resetMediaSliders(ui: UIElements): void {
  ui.mediaXSlider.value = '0';
  ui.mediaYSlider.value = '0';
  ui.mediaScaleSlider.value = '1';
  ui.mediaXVal.textContent = '0';
  ui.mediaYVal.textContent = '0';
  ui.mediaScaleVal.textContent = '1.0x';
}

function initMediaPositionControls(engine: PVEngine, ui: UIElements): void {
  ui.mediaXSlider.addEventListener('input', () => {
    const x = parseFloat(ui.mediaXSlider.value);
    const y = parseFloat(ui.mediaYSlider.value);
    ui.mediaXVal.textContent = String(x);
    engine.setMediaOffset(x, y);
  });

  ui.mediaYSlider.addEventListener('input', () => {
    const x = parseFloat(ui.mediaXSlider.value);
    const y = parseFloat(ui.mediaYSlider.value);
    ui.mediaYVal.textContent = String(y);
    engine.setMediaOffset(x, y);
  });

  ui.mediaScaleSlider.addEventListener('input', () => {
    const s = parseFloat(ui.mediaScaleSlider.value);
    ui.mediaScaleVal.textContent = `${s.toFixed(1)}x`;
    engine.setMediaScale(s);
  });
}

export function initMediaPanel(engine: PVEngine, ui: UIElements): void {
  // Media pick
  ui.mediaPickBtn.addEventListener('click', () => ui.mediaInput.click());

  ui.mediaInput.addEventListener('change', () => {
    const file = ui.mediaInput.files?.[0];
    if (file) {
      pendingFile = file;
      ui.mediaPickName.textContent = file.name;
      ui.mediaModeGroup.style.display = 'flex';
    }
  });

  // Media apply
  ui.mediaApplyBtn.addEventListener('click', async () => {
    if (pendingFile) {
      const mode = ui.mediaModeSelect.value as 'fit' | 'free';
      try {
        await engine.addMedia(pendingFile, mode);
        engine.effectOpacity = 0.7;
        ui.opacitySlider.value = '0.7';
        ui.opacityVal.textContent = '70%';
        ui.mediaPosGroup.style.display = 'flex';
        resetMediaSliders(ui);
      } catch (err) {
        console.warn('[PV] Media load failed:', err);
      }
      pendingFile = null;
    }
  });

  // Media position controls
  initMediaPositionControls(engine, ui);
}