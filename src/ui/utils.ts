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

import { attachModalDismiss } from '../core/uiHelpers';
import { t } from '../i18n';
import type { TemplateConfig } from '../core/types';

export function showModal(contentHtml: string, confirmText: string): void {
  const overlay = document.createElement('div');
  overlay.className = 'pv-modal-overlay';
  overlay.innerHTML = `
    <div class="pv-modal-box">
      <div class="pv-modal-body">${contentHtml}</div>
      <div class="pv-modal-footer">
        <button class="btn pv-modal-confirm">${confirmText}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('.pv-modal-confirm')!
    .addEventListener('click', () => overlay.remove());
  attachModalDismiss(overlay);
}

export function tplName(tpl: TemplateConfig): string {
  if (tpl.nameKey) {
    return t(tpl.nameKey as any);
  }
  return tpl.name;
}

export function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}