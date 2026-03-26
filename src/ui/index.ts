// PV Tool — Copyright (c) 2026 DanteAlighieri13210914
// Licensed under AGPL-3.0. For commercial use, see COMMERCIAL.md

import type { PVEngine } from '../core/engine';
import { getUIElements } from './elements';
import { initTemplatePanel, updateTemplateButtons } from './templatePanel';
import { initControls } from './controls';
import { initPostfxPanel, syncPostfxSliders } from './postfxPanel';
import { initMediaPanel } from './mediaPanel';
import { initAudioPanel } from './audioPanel';
import { initRecording } from './recording';
import { initExportImport } from './exportImport';
import { initNowPlaying } from './nowPlaying';
import { initWesingCap } from './wesingCap';
import { exposeGlobalConfigAPI } from '../config';
import { syncUIFromConfig } from '../config/sync';
import { initCopyUrlButton } from '../core/copyUrl';
import { loadCustomTemplates } from '../core/templateStore';

let customTemplates = loadCustomTemplates();

export async function initUI(engine: PVEngine): Promise<void> {
  const ui = getUIElements();

  // Initialize all UI modules
  initTemplatePanel(engine, ui, () => {
    syncPostfxSliders(engine, ui);
  });

  initControls(engine, ui);
  initPostfxPanel(engine, ui);
  initMediaPanel(engine, ui);
  initAudioPanel(engine, ui);
  initRecording(engine, ui);
  initExportImport(engine, ui, (config) => {
    syncUIFromConfig(engine, ui, config, customTemplates);
    syncPostfxSliders(engine, ui);
  });
  initNowPlaying(engine, ui);
  initWesingCap(engine, ui);

  // Copy URL button
  if (ui.copyUrlBtn && ui.npListenToggle) {
    initCopyUrlButton(
      ui.copyUrlBtn,
      ui.templateSelect,
      ui.npListenToggle,
      ui.nwcListenToggle,
      () => engine.wesingCapWsUrl?.replace(/^ws:\/\//, '').replace(/\/ws\/?$/, ''),
    );
  }

  // Alpha toggle
  ui.alphaToggle.addEventListener('change', () => {
    engine.alphaMode = ui.alphaToggle.checked;
  });

  // Expose global config API
  exposeGlobalConfigAPI(engine, ui, customTemplates);
}

// Re-export utilities for use in main.ts
export { updateTemplateButtons, syncPostfxSliders };