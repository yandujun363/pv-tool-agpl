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
import type { UIElements } from './elements';
import { t } from '../i18n';
import { showToast } from '../core/uiHelpers';

/**
 * 获取显示器支持的最大刷新率
 * 通过 requestAnimationFrame 测量实际帧率
 */
async function getMaxMonitorFps(MEASURE_DURATION: number = 1000): Promise<number> {
  // 注意：screen.refreshRate 属性不存在于任何浏览器中，保留此代码仅为兼容性考虑
  if ('screen' in window && 'refreshRate' in screen) {
    const refreshRate = (screen as any).refreshRate;
    if (refreshRate && typeof refreshRate === 'number') {
      return refreshRate;
    }
  }
  
  // 通过 requestAnimationFrame 测量
  return new Promise<number>((resolve) => {
    let frames = 0;
    let lastTime = performance.now();
    let animationId: number;
    
    const measure = (now: number) => {
      frames++;
      const elapsed = now - lastTime;
      
      if (elapsed >= MEASURE_DURATION) {
        // 停止测量
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        
        // 计算实际平均帧率
        const actualFps = (frames * 1000) / elapsed;
        
        // 四舍五入到最接近的整数
        // 因为测量值通常略低于实际值（59.94 -> 60, 119.88 -> 120）
        const roundedFps = Math.round(actualFps);
        
        resolve(roundedFps);
        
        return;
      }
      
      animationId = requestAnimationFrame(measure);
    };
    
    animationId = requestAnimationFrame(measure);
  });
}

/**
 * 显示/隐藏初始化浮层
 */
function setInitOverlayVisible(visible: boolean): void {
  const overlay = document.getElementById('init-overlay');
  if (overlay) {
    overlay.style.display = visible ? 'flex' : 'none';
  }
}

/**
 * 生成FPS选项列表
 * @param maxFps 最大FPS限制
 * @returns 选项数组 [{ value: number | 'auto', label: string }]
 */
function generateFpsOptions(maxFps: number): Array<{ value: number | 'auto'; label: string }> {
  const options: Array<{ value: number | 'auto'; label: string }> = [];
  
  // 自动选项
  options.push({ value: 'auto', label: 'Auto (Max)' });
  
  // 从10开始，每10FPS一档，直到最大FPS
  for (let fps = 10; fps <= maxFps; fps += 10) {
    options.push({ value: fps, label: `${fps} FPS` });
  }
  
  // 确保最大FPS被包含（如果不是10的倍数）
  if (maxFps % 10 !== 0 && maxFps > 10) {
    options.push({ value: maxFps, label: `${maxFps} FPS` });
  }
  
  return options;
}

/**
 * 更新FPS下拉框选项
 * @param fpsSelect - select元素
 * @param maxFps - 最大帧率
 * @param currentValue - 当前选中值
 * @param customOptions - 自定义选项（可以是 option 元素或配置对象）
 */
function updateFpsSelectOptions(
  fpsSelect: HTMLSelectElement,
  maxFps: number,
  currentValue: number | 'auto',
  customOptions: (HTMLOptionElement | { value: string | number; label: string; selected?: boolean; disabled?: boolean })[] = []
): void {
  const defaultOptions = generateFpsOptions(maxFps);
  
  // 清空 select
  fpsSelect.innerHTML = '';
  
  // 添加默认选项
  for (const opt of defaultOptions) {
    const option = document.createElement('option');
    option.value = String(opt.value);
    option.textContent = opt.label;
    fpsSelect.appendChild(option);
  }
  
  // 添加自定义选项
  for (const customOpt of customOptions) {
    if (customOpt instanceof HTMLOptionElement) {
      // 直接使用 option 元素
      fpsSelect.appendChild(customOpt);
    } else {
      // 根据配置对象创建 option
      const option = document.createElement('option');
      option.value = String(customOpt.value);
      option.textContent = customOpt.label;
      if (customOpt.selected) option.selected = true;
      if (customOpt.disabled) option.disabled = true;
      fpsSelect.appendChild(option);
    }
  }
  
  // 恢复选中的值
  const valueToSet = String(currentValue);
  if (fpsSelect.querySelector(`option[value="${valueToSet}"]`)) {
    fpsSelect.value = valueToSet;
  } else {
    fpsSelect.value = 'auto';
  }
}

export async function initRenderPanel(engine: PVEngine, ui: UIElements): Promise<void> {

  engine.pauseRendering();
  console.log('[RenderPanel] Paused rendering for FPS detection...');
  setInitOverlayVisible(true);

  // 分辨率控制
  const resolutionSelect = ui.resolutionSelect;
  const customResolutionGroup = ui.customResolutionGroup;
  const customWidth = ui.customWidth;
  const customHeight = ui.customHeight;
  const applyResolutionBtn = ui.applyResolutionBtn;
  const scaleModeSelect = ui.scaleModeSelect;

  // FPS 控制
  const fpsSelect = ui.fpsSelect;
  const customFpsGroup = ui.customFpsGroup;
  const customFpsInput = ui.customFpsInput;
  const applyFpsBtn = ui.applyFpsBtn;
  const fpsCurrent = ui.fpsCurrent;

  // 先立即用默认值初始化 FPS 选择器
  let maxMonitorFps = 60;
  updateFpsSelectOptions(fpsSelect, maxMonitorFps, engine.targetFps, [{ value: 'custom', label: t("render_fps_custom"), selected: false }]);
  
  // 异步检测真实刷新率，不阻塞后续初始化
  getMaxMonitorFps(1000)
    .then(maxFps => {
      maxMonitorFps = maxFps;
      updateFpsSelectOptions(fpsSelect, maxMonitorFps, engine.targetFps, [{ value: 'custom', label: t("render_fps_custom"), selected: false }]);
      engine.resumeRendering();
      setInitOverlayVisible(false);
    })
    .catch(e => {
      console.warn('Failed to detect max monitor FPS, using default 60', e);
    });

  // 更新FPS显示（显示PIXI FPS和浏览器FPS）
  engine.onFpsUpdate = (pixiFps: number, browserFps: number) => {
    // 显示当前PIXI更新频率
    fpsCurrent.textContent = `PIXI: ${pixiFps} FPS | Browser: ${browserFps} FPS`;
    fpsCurrent.title = `PIXI: ${pixiFps} FPS | Browser: ${browserFps} FPS`;
  };

  if (scaleModeSelect) {
    // 初始化值
    scaleModeSelect.value = engine.scaleMode;
    
    // 监听变化
    scaleModeSelect.addEventListener('change', () => {
      engine.scaleMode = scaleModeSelect.value as 'stretch' | 'contain';
    });
  }


  // 分辨率选择变化
  resolutionSelect.addEventListener('change', () => {
    const value = resolutionSelect.value;
    if (value === 'custom') {
      customResolutionGroup.style.display = 'flex';
    } else {
      customResolutionGroup.style.display = 'none';
      if (value === 'auto') {
        engine.targetResolution = 'auto';
      } else {
        const multiplier = parseFloat(value);
        if (!isNaN(multiplier)) {
          engine.targetResolution = multiplier;
        }
      }
    }
  });

  // 应用自定义分辨率
  applyResolutionBtn.addEventListener('click', () => {
    const width = parseInt(customWidth.value);
    const height = parseInt(customHeight.value);
    
    if (isNaN(width) || isNaN(height)) {
      return;
    }
    
    const minWidth = 320;
    const minHeight = 240;
    const maxWidth = 7680;
    const maxHeight = 4320;
    
    const finalWidth = Math.min(maxWidth, Math.max(minWidth, width));
    const finalHeight = Math.min(maxHeight, Math.max(minHeight, height));
    
    engine.targetResolution = { width: finalWidth, height: finalHeight };
    
    customWidth.value = String(finalWidth);
    customHeight.value = String(finalHeight);
  });

  // FPS 选择变化
  fpsSelect.addEventListener('change', () => {
    const value = fpsSelect.value;
    if (value === 'custom') {
      customFpsGroup.style.display = 'flex';
      // 设置默认值
      customFpsInput.value = engine.targetFps === 'auto' ? '60' : String(engine.targetFps);
    } else {
      customFpsGroup.style.display = 'none';
      if (value === 'auto') {
        engine.targetFps = 'auto';
      } else {
        const fps = parseInt(value);
        if (!isNaN(fps) && fps >= 10) {
          engine.targetFps = Math.min(fps, maxMonitorFps);
        }
      }
    }
  });

  // 应用自定义 FPS
  applyFpsBtn.addEventListener('click', () => {
      let fps = parseInt(customFpsInput.value);
      
      if (isNaN(fps)) return;
      
      const minFps = 10;
      // 允许超过显示器限制，但显示警告
      let finalFps = Math.max(minFps, fps);
      
      if (finalFps > maxMonitorFps) {
          showToast(t('fps_warning_exceed_monitor', {
          fps: finalFps,
          max: maxMonitorFps
          }));
      }
      
      engine.targetFps = finalFps;
      customFpsInput.value = String(finalFps);
      
      // 如果自定义FPS在预设选项中，切换回去
      const optionExists = Array.from(fpsSelect.options).some(
          opt => opt.value === String(finalFps)
      );
      if (optionExists) {
          fpsSelect.value = String(finalFps);
          customFpsGroup.style.display = 'none';
      }
  });
}