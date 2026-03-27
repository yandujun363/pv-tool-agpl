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

/**
 * 获取显示器支持的最大刷新率
 * 通过创建离屏canvas并检查性能或使用screen属性
 */
async function getMaxMonitorFps(): Promise<number> {
  // 方法1: 使用 screen 属性（现代浏览器）
  if ('screen' in window && 'refreshRate' in screen) {
    const refreshRate = (screen as any).refreshRate;
    if (refreshRate && typeof refreshRate === 'number') {
      return refreshRate;
    }
  }
  
  // 方法2: 检测常见刷新率
  // 通过 requestAnimationFrame 快速测量
  return new Promise<number>((resolve) => {
    let frames = 0;
    let lastTime = performance.now();
    
    const measure = (now: number) => {
      frames++;
      if (now - lastTime >= 100) {
        // 快速估算，取整到常见值
        const estimatedFps = Math.round(frames * 1000 / (now - lastTime));
        const commonFps = [60, 120, 144, 165, 240, 360];
        let bestMatch = 60;
        for (const fps of commonFps) {
          if (Math.abs(estimatedFps - fps) < 15) {
            bestMatch = fps;
            break;
          }
        }
        resolve(bestMatch);
        return;
      }
      requestAnimationFrame(measure);
    };
    requestAnimationFrame(measure);
  });
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
 */
function updateFpsSelectOptions(
  fpsSelect: HTMLSelectElement,
  maxFps: number,
  currentValue: number | 'auto'
): void {
  const options = generateFpsOptions(maxFps);
  
  // 清空并重新填充选项
  fpsSelect.innerHTML = '';
  for (const opt of options) {
    const option = document.createElement('option');
    option.value = String(opt.value);
    option.textContent = opt.label;
    fpsSelect.appendChild(option);
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
  // 分辨率控制
  const resolutionSelect = ui.resolutionSelect;
  const customResolutionGroup = ui.customResolutionGroup;
  const customWidth = ui.customWidth;
  const customHeight = ui.customHeight;
  const applyResolutionBtn = ui.applyResolutionBtn;

  // FPS 控制
  const fpsSelect = ui.fpsSelect;
  const customFpsGroup = ui.customFpsGroup;
  const customFpsInput = ui.customFpsInput;
  const applyFpsBtn = ui.applyFpsBtn;
  const fpsCurrent = ui.fpsCurrent;

  // 获取最大显示器刷新率（异步）
  let maxMonitorFps = 60;
  try {
    maxMonitorFps = await getMaxMonitorFps();
  } catch (e) {
    console.warn('Failed to detect max monitor FPS, using default 60', e);
  }
  updateFpsSelectOptions(fpsSelect, maxMonitorFps, engine.targetFps);

  // 更新FPS显示（显示PIXI FPS和浏览器FPS）
  engine.onFpsUpdate = (pixiFps: number, browserFps: number) => {
    // 显示当前PIXI更新频率（这是实际效果更新频率）
    fpsCurrent.textContent = `${pixiFps} FPS`;
    fpsCurrent.title = `PIXI: ${pixiFps} FPS | Browser: ${browserFps} FPS`;
  };

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
    const maxFps = maxMonitorFps;
    const finalFps = Math.min(maxFps, Math.max(minFps, fps));
    
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