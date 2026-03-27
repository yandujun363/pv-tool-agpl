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
import type { UnifiedConfig } from '../core/unifiedConfig';
import { effectCatalog } from '../core/effectCatalog';
import { templates } from '../templates';
import type { UIElements } from '../ui/elements';

export function syncUIFromConfig(
  engine: PVEngine,
  ui: UIElements,
  config: UnifiedConfig,
  customTemplates: any[]
): void {
  // Update text input
  ui.textInput.value = config.text.userText;

  // Update sliders
  ui.segSlider.value = String(config.text.segmentDuration);
  ui.segVal.textContent = `${config.text.segmentDuration.toFixed(1)}s`;

  ui.speedSlider.value = String(config.template.animationSpeed);
  ui.speedVal.textContent = `${config.template.animationSpeed.toFixed(1)}x`;

  ui.motionSlider.value = String(config.effects.motionIntensity);
  ui.motionVal.textContent = `${config.effects.motionIntensity.toFixed(1)}x`;

  ui.opacitySlider.value = String(config.effects.effectOpacity);
  ui.opacityVal.textContent = `${Math.round(config.effects.effectOpacity * 100)}%`;

  // Update PostFX
  ui.shakeSlider.value = String(config.postfx.shake);
  ui.shakeVal.textContent = config.postfx.shake.toFixed(2);
  ui.zoomSlider.value = String(config.postfx.zoom);
  ui.zoomVal.textContent = config.postfx.zoom.toFixed(2);
  ui.tiltSlider.value = String(config.postfx.tilt);
  ui.tiltVal.textContent = `${(config.postfx.tilt * 17.2).toFixed(0)}°`;
  ui.glitchSlider.value = String(config.postfx.glitch);
  ui.glitchVal.textContent = config.postfx.glitch.toFixed(2);
  ui.hueSlider.value = String(config.postfx.hueShift);
  ui.hueVal.textContent = `${config.postfx.hueShift}°`;

  // Update BPM and Beat
  ui.bpmSlider.value = String(config.beat.bpm);
  ui.bpmVal.textContent = String(config.beat.bpm);
  ui.beatSlider.value = String(config.beat.reactivity);
  ui.beatVal.textContent = config.beat.reactivity.toFixed(2);

  // Update Alpha Mode
  ui.alphaToggle.checked = config.effects.alphaMode;

  // Update canvas color
  if (config.render.canvasColor) {
    engine.canvasColor = config.render.canvasColor;
    const swatch = document.querySelector(`.swatch[data-color="${config.render.canvasColor}"]`);
    if (swatch) {
      document.querySelectorAll('.swatch').forEach(s => s.classList.remove('swatch-active'));
      swatch.classList.add('swatch-active');
    }
  } else {
    document.querySelector('.swatch[data-color=""]')?.classList.add('swatch-active');
  }

  // Update template selector
  const templateValue = config.template.name
    ? (() => {
        const existingIdx = customTemplates.findIndex(t => t.name === config.template.name);
        if (existingIdx >= 0) return `user-${existingIdx}`;
        const builtinIdx = templates.findIndex(t => t.name === config.template.name);
        if (builtinIdx >= 0) return String(builtinIdx);
        return 'custom';
      })()
    : '0';

  ui.templateSelect.value = templateValue;

  // Update custom panel effect checkboxes
  if (templateValue === 'custom') {
    const effectsSet = new Set(
      config.template.effects.map(e =>
        effectCatalog.findIndex(cat => cat.type === e.type)
      )
    );
    const checks = ui.effectGrid.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    checks.forEach((cb) => {
      cb.checked = effectsSet.has(parseInt(cb.dataset.effectIdx!));
    });
  }

  // Update Now Playing state
  if (ui.npListenToggle) {
    ui.npListenToggle.checked = config.nowPlaying.active;
    if (config.nowPlaying.active) {
      engine.nowPlayingListening = true;
    }
  }

  // Update WesingCap state
  if (ui.nwcListenToggle) {
    ui.nwcListenToggle.checked = config.wesingCap.active;
    if (config.wesingCap.active && config.wesingCap.wsUrl) {
      engine.wesingCapWsUrl = config.wesingCap.wsUrl;
      engine.wesingCapListening = true;
    }
  }

  // 同步渲染设置
  if (config.render.targetResolution !== undefined) {
    const resolution = config.render.targetResolution;
    if (resolution === 'auto') {
      ui.resolutionSelect.value = 'auto';
      ui.customResolutionGroup.style.display = 'none';
    } else if (typeof resolution === 'number') {
      ui.resolutionSelect.value = String(resolution);
      ui.customResolutionGroup.style.display = 'none';
    } else if (typeof resolution === 'object') {
      ui.resolutionSelect.value = 'custom';
      ui.customResolutionGroup.style.display = 'flex';
      ui.customWidth.value = String(resolution.width);
      ui.customHeight.value = String(resolution.height);
    }
  }

  if (config.render.targetFps !== undefined) {
    const fps = config.render.targetFps;
    if (fps === 'auto') {
      ui.fpsSelect.value = 'auto';
      ui.customFpsGroup.style.display = 'none';
    } else {
      ui.fpsSelect.value = String(fps);
      ui.customFpsGroup.style.display = 'none';
    }
  }
}