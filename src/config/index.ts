// PV Tool — Copyright (c) 2026 DanteAlighieri13210914
// Licensed under AGPL-3.0. For commercial use, see COMMERCIAL.md

import type { PVEngine } from '../core/engine';
import type { UnifiedConfig } from '../core/unifiedConfig';
import type { UIElements } from '../ui/elements';
import { syncPostfxSliders } from '../ui/postfxPanel';
import { syncUIFromConfig } from './sync';

export function exposeGlobalConfigAPI(
  engine: PVEngine,
  ui: UIElements,
  customTemplates: any[]
): void {
  window.PvToolCeConfig = {
    getConfig: () => engine.getConfig(),
    applyConfig: (config) => {
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