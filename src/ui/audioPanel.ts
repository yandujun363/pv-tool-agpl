// PV Tool — Copyright (c) 2026 DanteAlighieri13210914
// Licensed under AGPL-3.0. For commercial use, see COMMERCIAL.md

import type { PVEngine } from '../core/engine';
import { t } from '../i18n';
import type { UIElements } from './elements';

export function initAudioPanel(engine: PVEngine, ui: UIElements): void {
  ui.audioPickBtn.addEventListener('click', () => ui.audioInput.click());

  ui.audioInput.addEventListener('change', async () => {
    const file = ui.audioInput.files?.[0];
    if (!file) return;
    ui.audioPickName.textContent = file.name;
    await engine.beat.loadAudio(file);
    ui.audioControls.style.display = 'flex';
    ui.audioStatus.textContent = t('playing');
    ui.audioToggle.textContent = t('pause');
  });

  ui.audioToggle.addEventListener('click', () => {
    if (engine.beat.paused) {
      engine.beat.resume();
      ui.audioToggle.textContent = t('pause');
      ui.audioStatus.textContent = t('playing');
    } else {
      engine.beat.pause();
      ui.audioToggle.textContent = t('play');
      ui.audioStatus.textContent = t('paused');
    }
  });
}