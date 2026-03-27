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
import type { UnifiedConfig } from '../core/unifiedConfig';
import type { UIElements } from '../ui/elements';
import { syncPostfxSliders } from '../ui/postfxPanel';
import { syncUIFromConfig } from './sync';

// 扩展 Window 接口
declare global {
  interface Window {
    PvToolCeConfig: {
      getConfig: () => UnifiedConfig;
      applyConfig: (config: UnifiedConfig) => void;
      saveConfig: () => void;
      loadConfig: () => void;
      exportConfig: () => void;
    };
  }
}

export function exposeGlobalConfigAPI(
  engine: PVEngine,
  ui: UIElements,
  customTemplates: any[]
): void {
  window.PvToolCeConfig = {
    getConfig: () => engine.getConfig(),
    applyConfig: (config: UnifiedConfig) => {
      engine.applyConfig(config);
      syncUIFromConfig(engine, ui, config as UnifiedConfig, customTemplates);
      syncPostfxSliders(engine, ui);
    },
    saveConfig: () => {
      const config = engine.getConfig();
      localStorage.setItem('pv-tool-config', JSON.stringify(config));
      console.log('配置已保存到 localStorage');
    },
    loadConfig: () => {
      const saved = localStorage.getItem('pv-tool-config');
      if (saved) {
        const config = JSON.parse(saved);
        engine.applyConfig(config);
        syncUIFromConfig(engine, ui, config, customTemplates);
        syncPostfxSliders(engine, ui);
        console.log('配置已加载');
      }
    },
    exportConfig: () => {
      const config = engine.getConfig();
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pv-config-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  };

  console.log('PV Tool Community Edition 已启动，可用命令:');
  console.log('  window.PvToolCeConfig.getConfig() - 获取配置');
  console.log('  window.PvToolCeConfig.applyConfig() - 应用配置');
  console.log('  window.PvToolCeConfig.saveConfig() - 保存配置');
  console.log('  window.PvToolCeConfig.loadConfig() - 加载配置');
  console.log('  window.PvToolCeConfig.exportConfig() - 导出配置');
}