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

import { t } from '../i18n';
import { showToast, attachModalDismiss } from './uiHelpers';

export function initCopyUrlButton(
  copyUrlBtn: HTMLButtonElement,
  templateSelect: HTMLSelectElement,
  npListenToggle: HTMLInputElement,
  nwcListenToggle?: HTMLInputElement | null,
  getWesingCapAddr?: () => string | undefined,
): void {
  copyUrlBtn.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.className = 'pv-modal-overlay';
    overlay.innerHTML = `
      <div class="pv-modal-box">
        <div class="pv-modal-body">
          <p class="pv-modal-title">${t('copy_url_settings')}</p>
          <label class="effect-toggle" style="margin-bottom:8px">
            <input type="checkbox" id="copy-url-bg-check" checked>
            <span>${t('copy_url_transparent_bg')}</span>
          </label>
          <label class="effect-toggle" style="margin-bottom:8px">
            <input type="checkbox" id="copy-url-tpl-check" checked>
            <span>${t('copy_url_use_template')}</span>
          </label>
        </div>
        <div class="pv-modal-footer">
          <button class="btn pv-modal-confirm">${t('copy_url_copy_btn')}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const confirmBtn = overlay.querySelector('.pv-modal-confirm')!;
    confirmBtn.addEventListener('click', async () => {
      const bgCheck = overlay.querySelector('#copy-url-bg-check') as HTMLInputElement;
      const tplCheck = overlay.querySelector('#copy-url-tpl-check') as HTMLInputElement;

      const baseUrl = window.location.origin + window.location.pathname;
      const params = new URLSearchParams();
      params.set('panel', '0');
      if (bgCheck.checked) params.set('bg', '0');
      if (tplCheck.checked) params.set('t', templateSelect.value);
      if (npListenToggle.checked) params.set('np', '1');
      if (nwcListenToggle?.checked) {
        params.set('metabox-nexus-wesingcap', '1');
        const nwcAddr = getWesingCapAddr?.()?.trim();
        if (nwcAddr) params.set('metabox-nexus-wesingcap-addr', nwcAddr);
      }
      const url = baseUrl + '?' + params.toString();

      try { await navigator.clipboard.writeText(url); } catch { /* noop */ }
      overlay.remove();
      showToast(t('url_copied'));
    });

    attachModalDismiss(overlay);
  });
}
