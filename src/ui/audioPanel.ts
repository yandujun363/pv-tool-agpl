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