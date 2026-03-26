// PV Tool — Copyright (c) 2026 DanteAlighieri13210914
// Licensed under AGPL-3.0. For commercial use, see COMMERCIAL.md

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