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
import { testNowPlayingConnection } from '../core/nowPlayingProvider';
import { t } from '../i18n';
import { showModal } from './utils';
import type { UIElements } from './elements';

let npConnecting = false;

export function initNowPlaying(engine: PVEngine, ui: UIElements): void {
  const npListenToggle = ui.npListenToggle;
  if (!npListenToggle) return;

  npListenToggle.addEventListener('change', async () => {
    if (npListenToggle.checked) {
      if (npConnecting) {
        npListenToggle.checked = false;
        return;
      }
      npConnecting = true;
      const ok = await testNowPlayingConnection();
      npConnecting = false;

      if (!ok) {
        npListenToggle.checked = false;
        const npFailLink = 'https://github.com/Widdit/now-playing-service';
        showModal(
          `<p class="pv-modal-title">${t('np_fail_title')}</p>
           <p>${t('np_fail_body')}</p>
           <p><a href="${npFailLink}" target="_blank" rel="noopener">${npFailLink}</a></p>`,
          t('modal_confirm'),
        );
        return;
      }
    }
    engine.nowPlayingListening = npListenToggle.checked;
  });
}