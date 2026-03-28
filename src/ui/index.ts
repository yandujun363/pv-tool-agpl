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
import { initRenderPanel } from './renderPanel';

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
  initRenderPanel(engine, ui);

  await initRenderPanel(engine, ui);

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