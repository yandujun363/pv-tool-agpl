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
import { testWesingCapConnection } from '../core/wesingCapProvider';
import { t } from '../i18n';
import { showToast, attachModalDismiss } from '../core/uiHelpers';
import { showModal } from './utils';
import type { UIElements } from './elements';

let nwcConnecting = false;

export function initWesingCap(engine: PVEngine, ui: UIElements): void {
  const nwcListenToggle = ui.nwcListenToggle;
  if (!nwcListenToggle) return;

  // Disconnect handler
  engine.onWesingCapDisconnect = () => {
    if (nwcListenToggle) nwcListenToggle.checked = false;
    engine.wesingCapListening = false;
    const nwcLink = 'https://vtb.link/wesingcap';
    showModal(
      `<p class="pv-modal-title">${t('nwc_fail_title')}</p>
       <p>${t('nwc_fail_body')}</p>
       <p><a href="${nwcLink}" target="_blank" rel="noopener">${nwcLink}</a></p>`,
      t('modal_confirm'),
    );
  };

  // Gear settings popup
  const nwcGearBtn = ui.nwcGearBtn;
  nwcGearBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const overlay = document.createElement('div');
    overlay.className = 'pv-modal-overlay';

    const currentAddr = engine.wesingCapWsUrl
      ? engine.wesingCapWsUrl.replace(/^ws:\/\//, '').replace(/\/ws\/?$/, '')
      : '';

    overlay.innerHTML = `
      <div class="pv-modal-box nwc-settings-box">
        <div class="pv-modal-body">
          <p class="pv-modal-title">${t('nwc_settings_title')}</p>
          <label class="nwc-addr-label">${t('nwc_ws_addr')}</label>
          <input type="text" class="nwc-addr-input" id="nwc-addr-input"
                 value="${currentAddr}" placeholder="${t('nwc_ws_addr_placeholder')}">
        </div>
        <div class="pv-modal-footer nwc-settings-footer">
          <button class="btn pv-modal-confirm">${t('nwc_save')}</button>
        </div>
        <div class="nwc-settings-branding">
          <a href="https://vtb.link/wesingcap" target="_blank" rel="noopener">VTB-TOOLS Metabox Nexus WesingCap</a>
          <span class="nwc-powered-by">Powered by <a href="https://space.bilibili.com/40879764" target="_blank" rel="noopener">VTB-LIVE &amp; VTB-LINK</a></span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const addrInput = overlay.querySelector('#nwc-addr-input') as HTMLInputElement;
    const confirmBtn = overlay.querySelector('.pv-modal-confirm')!;
    confirmBtn.addEventListener('click', () => {
      const val = addrInput.value.trim();
      if (val) {
        engine.wesingCapWsUrl = 'ws://' + val + '/ws';
      } else {
        engine.wesingCapWsUrl = undefined;
      }
      overlay.remove();
      showToast(t('nwc_saved'));
    });
    attachModalDismiss(overlay);
  });

  // Toggle listener
  nwcListenToggle.addEventListener('change', async () => {
    if (nwcListenToggle.checked) {
      if (nwcConnecting) {
        nwcListenToggle.checked = false;
        return;
      }
      nwcConnecting = true;
      const ok = await testWesingCapConnection(engine.wesingCapWsUrl);
      nwcConnecting = false;

      if (!ok) {
        nwcListenToggle.checked = false;
        const nwcLink = 'https://vtb.link/wesingcap';
        showModal(
          `<p class="pv-modal-title">${t('nwc_fail_title')}</p>
           <p>${t('nwc_fail_body')}</p>
           <p><a href="${nwcLink}" target="_blank" rel="noopener">${nwcLink}</a></p>`,
          t('modal_confirm'),
        );
        return;
      }
    }
    engine.wesingCapListening = nwcListenToggle.checked;
  });
}