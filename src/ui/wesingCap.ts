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
import { testWesingCapConnection } from '../core/wesingCapProvider';
import { t } from '../i18n';
import { showToast } from '../composables/useToast';
import { showConfirm } from '../composables/useConfirm';
import type { UIElements } from './elements';

export function initWesingCap(engine: PVEngine, ui: UIElements): void {
  const nwcListenToggle = ui.nwcListenToggle;
  if (!nwcListenToggle) return;

  // Disconnect handler
  engine.onWesingCapDisconnect = () => {
    if (nwcListenToggle) nwcListenToggle.checked = false;
    engine.wesingCapListening = false;
    showConfirm({
      title: t('nwc_fail_title'),
      message: t('nwc_fail_body') + '\n\nhttps://vtb.link/wesingcap',
      confirmText: t('modal_confirm')
    });
  };

  // Gear settings popup - 使用 Vue 组件
  const nwcGearBtn = ui.nwcGearBtn;
  nwcGearBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const currentAddr = engine.wesingCapWsUrl
      ? engine.wesingCapWsUrl.replace(/^ws:\/\//, '').replace(/\/ws\/?$/, '')
      : '';

    // 动态导入 WesingCapSettings 组件
    const { default: WesingCapSettings } = await import('../components/WesingCapSettings.vue');
    const { createApp } = await import('vue');
    
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    const app = createApp(WesingCapSettings, {
      onSave: (addr: string) => {
        if (addr) {
          engine.wesingCapWsUrl = 'ws://' + addr + '/ws';
        } else {
          engine.wesingCapWsUrl = undefined;
        }
        showToast(t('nwc_saved'));
        app.unmount();
        container.remove();
      }
    });
    
    const instance = app.mount(container);
    // 打开模态框
    if ((instance as any).open) {
      (instance as any).open(currentAddr);
    }
  });

  // Toggle listener
  nwcListenToggle.addEventListener('change', async () => {
    if (nwcListenToggle.checked) {
      const ok = await testWesingCapConnection(engine.wesingCapWsUrl);

      if (!ok) {
        nwcListenToggle.checked = false;
        showConfirm({
          title: t('nwc_fail_title'),
          message: t('nwc_fail_body') + '\n\nhttps://vtb.link/wesingcap',
          confirmText: t('modal_confirm')
        });
        return;
      }
    }
    engine.wesingCapListening = nwcListenToggle.checked;
  });
}