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
import { showToast } from '../composables/useToast';

export function initCopyUrlButton(
  copyUrlBtn: HTMLButtonElement,
  templateSelect: HTMLSelectElement,
  npListenToggle: HTMLInputElement,
  nwcListenToggle?: HTMLInputElement | null,
  getWesingCapAddr?: () => string | undefined,
): void {
  copyUrlBtn.addEventListener('click', async () => {
    const { default: CopyUrlSettings } = await import('../components/CopyUrlSettings.vue');
    const { createApp } = await import('vue');
    
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    const app = createApp(CopyUrlSettings, {
      templateValue: templateSelect.value,
      npEnabled: npListenToggle.checked,
      nwcEnabled: nwcListenToggle?.checked ?? false,
      nwcAddress: getWesingCapAddr?.() ?? '',
      onCopy: (url: string) => {
        navigator.clipboard.writeText(url).catch(() => {});
        showToast(t('url_copied'));
        app.unmount();
        container.remove();
      }
    });
    
    const instance = app.mount(container);
    if ((instance as any).open) {
      (instance as any).open();
    }
  });
}