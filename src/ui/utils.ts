// PV Tool — Copyright (c) 2026 DanteAlighieri13210914
// Licensed under AGPL-3.0. For commercial use, see COMMERCIAL.md

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