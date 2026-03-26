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

export function showToast(msg: string) {
  const el = document.createElement('div');
  el.className = 'pv-toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

/**
 * Attach dismiss behaviour (click-outside + Escape) to a modal overlay.
 * Listeners are automatically cleaned up when the overlay is removed.
 */
export function attachModalDismiss(overlay: HTMLElement): void {
  const onEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', onEsc);
      overlay.remove();
    }
  };
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.removeEventListener('keydown', onEsc);
      overlay.remove();
    }
  });
  document.addEventListener('keydown', onEsc);
}
