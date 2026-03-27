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

import { PVEngine } from './core/engine';
import { templates } from './templates';
import { t } from './i18n';
import { loadCustomTemplates } from './core/templateStore';
import { initUI, updateTemplateButtons, syncPostfxSliders } from './ui';
import { effectCatalog } from './core/effectCatalog';

// Helper: effect key
export const fxKey = (e: any): string => {
  if (e.type === 'organicBlob') return `fx_organicBlob_${e.config.shape ?? 'blob'}`;
  return `fx_${e.type}`;
};

// Build effect categories
export const effectCategories = effectCatalog.reduce((acc: Record<string, any[]>, e: any, i: number) => {
  const cat = e.category;
  if (!acc[cat]) acc[cat] = [];
  acc[cat].push({
    idx: i,
    key: fxKey(e),
    fallback: e.label
  });
  return acc;
}, {});

// Helper: template name localization
export const tplNameLocal = (tpl: any): string => {
  if (tpl.nameKey) {
    return t(tpl.nameKey as any);
  }
  return tpl.name;
};

// 初始化函数
export async function initApp() {
  console.log('%cPV Tool%c solaris:0914', 'color:#6688cc;font-weight:bold', 'color:#888');
  document.title = t('page_title');

  const engine = new PVEngine();
  const container = document.getElementById('pv-container')!;

  await engine.init(container);
  engine.setText('深夜東京/の6畳半夢/を見てた/灯りの灯らない蛍光灯/明日には消えてる電脳城/に/開幕戦/打ち上げて/いなくなんないよね/ここには誰もいない/ここには誰もいないから');

  const urlParams = new URLSearchParams(window.location.search);
  const customTemplates = loadCustomTemplates();
  const tParam = urlParams.get('t');

  if (tParam !== null) {
    if (tParam.startsWith('user-')) {
      const idx = parseInt(tParam.split('-')[1]);
      if (idx >= 0 && idx < customTemplates.length) {
        engine.loadTemplate(customTemplates[idx]);
        (document.getElementById('template-select') as HTMLSelectElement).value = tParam;
      } else {
        engine.loadTemplate(templates[0]);
        (document.getElementById('template-select') as HTMLSelectElement).value = '0';
      }
    } else {
      const idx = parseInt(tParam);
      if (!isNaN(idx) && idx >= 0 && idx < templates.length) {
        engine.loadTemplate(templates[idx]);
        (document.getElementById('template-select') as HTMLSelectElement).value = String(idx);
      } else {
        engine.loadTemplate(templates[0]);
        (document.getElementById('template-select') as HTMLSelectElement).value = '0';
      }
    }
  } else {
    engine.loadTemplate(templates[0]);
    (document.getElementById('template-select') as HTMLSelectElement).value = '0';
  }

  // Sync sliders after template load
  const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
  const speedVal = document.getElementById('speed-val')!;
  const opacitySlider = document.getElementById('opacity-slider') as HTMLInputElement;
  const opacityVal = document.getElementById('opacity-val')!;

  speedSlider.value = String(engine.animationSpeed);
  speedVal.textContent = `${engine.animationSpeed.toFixed(1)}x`;
  opacitySlider.value = String(engine.effectOpacity);
  opacityVal.textContent = `${Math.round(engine.effectOpacity * 100)}%`;

  syncPostfxSliders(engine, {
    shakeSlider: document.getElementById('shake-slider') as HTMLInputElement,
    shakeVal: document.getElementById('shake-val')!,
    zoomSlider: document.getElementById('zoom-slider') as HTMLInputElement,
    zoomVal: document.getElementById('zoom-val')!,
    tiltSlider: document.getElementById('tilt-slider') as HTMLInputElement,
    tiltVal: document.getElementById('tilt-val')!,
    glitchSlider: document.getElementById('glitch-slider') as HTMLInputElement,
    glitchVal: document.getElementById('glitch-val')!,
    hueSlider: document.getElementById('hue-slider') as HTMLInputElement,
    hueVal: document.getElementById('hue-val')!,
  } as any);

  const templateSelect = document.getElementById('template-select') as HTMLSelectElement;
  updateTemplateButtons({
    templateSelect,
    tplDeleteBtn: document.getElementById('tpl-delete') as HTMLButtonElement,
    tplExportBtn: document.getElementById('tpl-export') as HTMLButtonElement,
    tplSaveInput: document.getElementById('tpl-save-input')!,
    tplDeleteConfirm: document.getElementById('tpl-delete-confirm')!,
  } as any);

  // URL param: bg (transparent background)
  const bgParam = urlParams.get('bg');
  if (bgParam === '0') {
    engine.alphaMode = true;
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
  }

  // URL param: panel (hide panels)
  const panelParam = urlParams.get('panel');
  if (panelParam === '0') {
    (window as any).panelsVisible = false;
    document.body.classList.add('pv-panels-hidden');
  }

  // URL param: np (Now Playing listener)
  const npParam = urlParams.get('np');
  const npListenToggle = document.getElementById('np-listen-toggle') as HTMLInputElement | null;
  if (npParam === '1' && npListenToggle) {
    npListenToggle.checked = true;
    npListenToggle.dispatchEvent(new Event('change'));
  }

  // URL param: metabox-nexus-wesingcap (WesingCap listener)
  const nwcListenToggle = document.getElementById('nwc-listen-toggle') as HTMLInputElement | null;
  const nwcAddrParam = urlParams.get('metabox-nexus-wesingcap-addr');
  if (nwcAddrParam && nwcAddrParam !== '0') {
    const addr = decodeURIComponent(nwcAddrParam);
    engine.wesingCapWsUrl = 'ws://' + addr + '/ws';
  }
  const nwcParam = urlParams.get('metabox-nexus-wesingcap');
  if (nwcParam === '1' && nwcListenToggle) {
    nwcListenToggle.checked = true;
    nwcListenToggle.dispatchEvent(new Event('change'));
  }

  // Initialize UI after engine is ready
  initUI(engine);

  console.log('PV Tool Community Edition 已启动');
  console.log(licenseText);
}

const licenseText = `/*!
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
 */`;