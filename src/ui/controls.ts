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
import { parseLrc } from '../core/lrc';
import type { UIElements } from './elements';
import { formatClock } from './utils';

export function initControls(
  engine: PVEngine,
  ui: UIElements
): void {
  initTextInput(engine, ui);
  initSeekSlider(engine, ui);
  initSliders(engine, ui);
  initCanvasColorSwatches(engine, ui);
  initBPMBeat(engine, ui);
  initMobileToggle(ui);
  initHelpTooltips();
  initPanelsToggle();
}

function initTextInput(engine: PVEngine, ui: UIElements): void {
  let textTimer: ReturnType<typeof setTimeout>;

  function applyTextInput(rawText: string): void {
    const hasTimestamps = /\[\d{1,2}:\d{2}/.test(rawText);
    if (hasTimestamps) {
      const parsed = parseLrc(rawText);
      if (parsed.length > 0) {
        engine.setLyricTimeline(parsed);
        return;
      }
    }
    engine.setText(rawText.replace(/\r?\n/g, '/'));
  }

  ui.textInput.addEventListener('focus', () => {
    ui.textInput.rows = 6;
    ui.textInput.classList.add('text-expanded');
  });

  ui.textInput.addEventListener('blur', () => {
    ui.textInput.rows = 1;
    ui.textInput.classList.remove('text-expanded');
  });

  ui.textInput.addEventListener('input', () => {
    clearTimeout(textTimer);
    textTimer = setTimeout(() => {
      applyTextInput(ui.textInput.value);
    }, 400);
  });

  // LRC import
  ui.lrcPickBtn.addEventListener('click', () => ui.lrcInput.click());

  ui.lrcInput.addEventListener('change', async () => {
    const file = ui.lrcInput.files?.[0];
    if (!file) return;

    ui.lrcPickName.textContent = file.name;
    const content = await file.text();
    ui.textInput.value = content;
    applyTextInput(content);
    ui.lrcInput.value = '';
  });
}

function initSeekSlider(engine: PVEngine, ui: UIElements): void {
  let isSeeking = false;

  ui.seekSlider.addEventListener('mousedown', () => { isSeeking = true; });
  ui.seekSlider.addEventListener('touchstart', () => { isSeeking = true; });
  ui.seekSlider.addEventListener('input', () => {
    const total = engine.timelineDuration;
    const target = parseFloat(ui.seekSlider.value) * total;
    engine.seek(target);
  });
  ui.seekSlider.addEventListener('mouseup', () => { isSeeking = false; });
  ui.seekSlider.addEventListener('touchend', () => { isSeeking = false; });

  function updatePlaybackTimer(): void {
    const current = engine.playbackTime;
    const total = engine.timelineDuration;
    ui.playbackTimeEl.textContent = `${formatClock(current)} / ${formatClock(total)}`;
    if (!isSeeking && total > 0) {
      ui.seekSlider.value = String(current / total);
    }
    requestAnimationFrame(updatePlaybackTimer);
  }

  requestAnimationFrame(updatePlaybackTimer);
}

function initSliders(engine: PVEngine, ui: UIElements): void {
  // Segment duration
  ui.segSlider.addEventListener('input', () => {
    const v = parseFloat(ui.segSlider.value);
    engine.segmentDuration = v;
    ui.segVal.textContent = `${v.toFixed(1)}s`;
  });

  // Animation speed
  ui.speedSlider.addEventListener('input', () => {
    const v = parseFloat(ui.speedSlider.value);
    engine.animationSpeed = v;
    ui.speedVal.textContent = `${v.toFixed(1)}x`;
  });

  // Motion intensity
  ui.motionSlider.addEventListener('input', () => {
    const v = parseFloat(ui.motionSlider.value);
    engine.motionIntensity = v;
    ui.motionVal.textContent = `${v.toFixed(1)}x`;
  });

  // Effect opacity
  ui.opacitySlider.addEventListener('input', () => {
    const v = parseFloat(ui.opacitySlider.value);
    engine.effectOpacity = v;
    ui.opacityVal.textContent = `${Math.round(v * 100)}%`;
  });
}

function initCanvasColorSwatches(engine: PVEngine, ui: UIElements): void {
  ui.canvasColorSwatches.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.swatch') as HTMLButtonElement | null;
    if (!btn) return;
    ui.canvasColorSwatches.querySelectorAll('.swatch').forEach(s => s.classList.remove('swatch-active'));
    btn.classList.add('swatch-active');
    const color = btn.dataset.color;
    engine.canvasColor = color || null;
  });
}

function initBPMBeat(engine: PVEngine, ui: UIElements): void {
  ui.bpmSlider.addEventListener('input', () => {
    const v = parseInt(ui.bpmSlider.value);
    engine.beat.bpm = v;
    ui.bpmVal.textContent = String(v);
  });

  ui.beatSlider.addEventListener('input', () => {
    const v = parseFloat(ui.beatSlider.value);
    engine.beatReactivity = v;
    ui.beatVal.textContent = v.toFixed(2);
  });
}

function initMobileToggle(ui: UIElements): void {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) {
    ui.panelsWrapper.classList.add('panels-hidden');
  }

  ui.mobileToggle.addEventListener('click', () => {
    const hidden = ui.panelsWrapper.classList.contains('panels-hidden');
    ui.panelsWrapper.classList.toggle('panels-hidden', !hidden);
    ui.mobileToggle.textContent = hidden ? '✕' : '☰';
  });
}

function initHelpTooltips(): void {
  let bubble: HTMLDivElement | null = null;
  const show = (el: HTMLElement) => {
    const tip = el.getAttribute('data-tip');
    if (!tip) return;
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.className = 'help-tip-bubble';
      document.body.appendChild(bubble);
    }
    bubble.textContent = tip;
    bubble.style.display = '';
    const r = el.getBoundingClientRect();
    bubble.style.left = Math.max(4, r.right - 220) + 'px';
    bubble.style.top = (r.top - bubble.offsetHeight - 6) + 'px';
  };
  const hide = () => { if (bubble) bubble.style.display = 'none'; };
  document.addEventListener('pointerenter', (e) => {
    const el = (e.target as HTMLElement).closest?.('.help-tip') as HTMLElement | null;
    if (el) show(el);
  }, true);
  document.addEventListener('pointerleave', (e) => {
    const el = (e.target as HTMLElement).closest?.('.help-tip');
    if (el) hide();
  }, true);
}

function initPanelsToggle(): void {
  let panelsVisible = true;
  document.addEventListener('keydown', (e) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (document.querySelector('.pv-modal-overlay')) return;

    if (e.key.toLowerCase() === 'h') {
      panelsVisible = !panelsVisible;
      document.body.classList.toggle('pv-panels-hidden', !panelsVisible);
    }
  });
}