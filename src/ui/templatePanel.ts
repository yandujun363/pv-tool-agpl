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
import type { TemplateConfig } from '../core/types';
import { effectCatalog } from '../core/effectCatalog';
import { templates } from '../templates';
import { t } from '../i18n';
import {
  loadCustomTemplates,
  saveCustomTemplates,
  encodeShareCode,
  encodeShareCodeJSON,
  decodeShareCodeSmart
} from '../core/templateStore';
import { showToast } from '../core/uiHelpers';
import { tplName } from './utils';
import type { UIElements } from './elements';

let customTemplates: TemplateConfig[] = [];

export function initTemplatePanel(
  engine: PVEngine,
  ui: UIElements,
  onTemplateChanged: () => void
): void {
  customTemplates = loadCustomTemplates();
  rebuildTemplateSelect(ui);
  setupTemplateEvents(engine, ui, onTemplateChanged);
}

function rebuildTemplateSelect(ui: UIElements): void {
  const builtInHtml = templates.map((tp, i) => `<option value="${i}">${tplName(tp)}</option>`).join('');
  const customHtml = customTemplates.map((tp, i) =>
    `<option value="user-${i}">⭐ ${tp.name}</option>`
  ).join('');
  ui.templateSelect.innerHTML = builtInHtml + customHtml + `<option value="custom">${t('custom')}</option>`;
}

export function updateTemplateButtons(ui: UIElements): void {
  const val = ui.templateSelect.value;
  const isUser = val.startsWith('user-');
  ui.tplDeleteBtn.style.display = isUser ? '' : 'none';
  ui.tplExportBtn.style.display = isUser ? '' : 'none';
  ui.tplSaveInput.style.display = 'none';
  ui.tplDeleteConfirm.style.display = 'none';
}

export function buildCustomTemplate(ui: UIElements): TemplateConfig {
  const checks = ui.effectGrid.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
  const effects: TemplateConfig['effects'] = [];
  checks.forEach((cb) => {
    if (cb.checked) {
      const idx = parseInt(cb.dataset.effectIdx!);
      const preset = effectCatalog[idx];
      effects.push({ type: preset.type, layer: preset.layer, config: { ...preset.config } });
    }
  });
  return {
    name: 'Custom',
    palette: {
      background: '#ffffff',
      primary: '#000000',
      secondary: '#888888',
      accent: '#ff3366',
      text: '#000000',
    },
    effects,
  };
}

function setupTemplateEvents(
  engine: PVEngine,
  ui: UIElements,
  onTemplateChanged: () => void
): void {
  let isCustomMode = false;
  let customRebuildTimer: ReturnType<typeof setTimeout>;

  ui.templateSelect.addEventListener('change', () => {
    const val = ui.templateSelect.value;
    if (val === 'custom') {
      isCustomMode = true;
      ui.customPanel.style.display = '';
      engine.loadTemplate(buildCustomTemplate(ui));
    } else if (val.startsWith('user-')) {
      isCustomMode = false;
      ui.customPanel.style.display = 'none';
      const idx = parseInt(val.split('-')[1]);
      engine.loadTemplate(customTemplates[idx]);
      onTemplateChanged();
    } else {
      isCustomMode = false;
      ui.customPanel.style.display = 'none';
      engine.loadTemplate(templates[parseInt(val)]);
      onTemplateChanged();
    }
    updateTemplateButtons(ui);
  });

  // Effect grid change - rebuild custom template
  ui.effectGrid.addEventListener('change', () => {
    if (isCustomMode) {
      clearTimeout(customRebuildTimer);
      customRebuildTimer = setTimeout(() => {
        try {
          engine.loadTemplate(buildCustomTemplate(ui));
        } catch (err) {
          console.warn('[PV] Custom template rebuild failed:', err);
        }
      }, 300);
    }
  });

  // Save template
  ui.tplSaveBtn.addEventListener('click', () => {
    ui.tplSaveInput.style.display = '';
    ui.tplNameInput.value = '';
    ui.tplNameInput.focus();
  });

  ui.tplSaveCancel.addEventListener('click', () => {
    ui.tplSaveInput.style.display = 'none';
  });

  function doSave() {
    const name = ui.tplNameInput.value.trim();
    if (!name) return;
    const tpl = { ...buildCustomTemplate(ui), name };
    customTemplates.push(tpl);
    saveCustomTemplates(customTemplates);
    rebuildTemplateSelect(ui);
    ui.templateSelect.value = `user-${customTemplates.length - 1}`;
    isCustomMode = false;
    ui.customPanel.style.display = 'none';
    engine.loadTemplate(tpl);
    updateTemplateButtons(ui);
    onTemplateChanged();
    ui.tplSaveInput.style.display = 'none';
  }

  ui.tplSaveOk.addEventListener('click', doSave);
  ui.tplNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSave();
    if (e.key === 'Escape') ui.tplSaveInput.style.display = 'none';
  });

  // Delete template
  ui.tplDeleteBtn.addEventListener('click', () => {
    const val = ui.templateSelect.value;
    if (!val.startsWith('user-')) return;
    const idx = parseInt(val.split('-')[1]);
    ui.tplDeleteText.textContent = `${t('confirm_delete')} "${customTemplates[idx].name}"？`;
    ui.tplDeleteConfirm.style.display = '';
  });

  ui.tplDeleteCancel.addEventListener('click', () => {
    ui.tplDeleteConfirm.style.display = 'none';
  });

  ui.tplDeleteOk.addEventListener('click', () => {
    const val = ui.templateSelect.value;
    if (!val.startsWith('user-')) return;
    const idx = parseInt(val.split('-')[1]);
    customTemplates.splice(idx, 1);
    saveCustomTemplates(customTemplates);
    rebuildTemplateSelect(ui);
    ui.templateSelect.value = '0';
    engine.loadTemplate(templates[0]);
    updateTemplateButtons(ui);
    onTemplateChanged();
    ui.tplDeleteConfirm.style.display = 'none';
  });

  // Export share code
  ui.tplExportBtn.addEventListener('click', async () => {
    const val = ui.templateSelect.value;
    if (!val.startsWith('user-')) return;
    const idx = parseInt(val.split('-')[1]);

    const useJson = confirm(t('export_json_confirm'));

    let code: string;
    if (useJson) {
      code = encodeShareCodeJSON(customTemplates[idx]);
    } else {
      code = await encodeShareCode(customTemplates[idx]);
    }

    try { await navigator.clipboard.writeText(code); } catch { /* noop */ }
    showToast(t('code_copied'));
  });

  // Import share code
  ui.tplImportBtn.addEventListener('click', () => {
    ui.shareCodeLabel.classList.remove('label-error');
    ui.shareCodeLabel.textContent = t('import_code');
    ui.shareCodeText.value = '';
    ui.shareCodeText.readOnly = false;
    ui.shareCodeOk.textContent = t('import_btn');
    ui.shareCodeGroup.style.display = '';
  });

  ui.shareCodeOk.addEventListener('click', async () => {
    const code = ui.shareCodeText.value.trim();
    if (!code) return;
    try {
      const tpl = await decodeShareCodeSmart(code);
      customTemplates.push(tpl);
      saveCustomTemplates(customTemplates);
      rebuildTemplateSelect(ui);
      const newIdx = customTemplates.length - 1;
      ui.templateSelect.value = `user-${newIdx}`;
      isCustomMode = false;
      ui.customPanel.style.display = 'none';
      engine.loadTemplate(tpl);
      updateTemplateButtons(ui);
      onTemplateChanged();
      ui.shareCodeGroup.style.display = 'none';
    } catch (err) {
      ui.shareCodeLabel.textContent = t('code_invalid');
      ui.shareCodeLabel.classList.add('label-error');
      console.warn('[PV] Share code decode failed:', err);
      return;
    }
  });

  ui.shareCodeCancel.addEventListener('click', () => {
    ui.shareCodeGroup.style.display = 'none';
  });
}