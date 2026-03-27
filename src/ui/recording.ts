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
import { t } from '../i18n';
import type { UIElements } from './elements';
import { formatClock } from './utils';
import JSZip from 'jszip';

const templateSlugs = [
  'blueBold', 'kineticSplit', 'bluePlane', 'cyberGrunge', 'geometric',
  'rainCity', 'cyberpunkHud', 'emotionCinema', 'hystericNight',
  'spiderWeb', 'staggeredText', 'calmVillain', 'girlyClouds',
];

function getTemplateSlug(templateSelect: HTMLSelectElement): string {
  const val = templateSelect.value;
  if (val === 'custom') return 'custom';
  const idx = parseInt(val);
  return templateSlugs[idx] ?? 'unknown';
}

export function initRecording(engine: PVEngine, ui: UIElements): void {
  let mediaRecorder: MediaRecorder | null = null;
  let recordedChunks: Blob[] = [];
  let recStartTime = 0;
  let recTimerInterval: ReturnType<typeof setInterval> | null = null;

  // PNG sequence capture for alpha mode
  let pngFrameBuffer: Record<number, Blob> = {};
  let pngFrameIndex = 0;
  let pngCaptureRaf = 0;
  let pngRecording = false;
  let pngLastCaptureTime = 0;
  const PNG_FPS = 30;

  function showRecordingUI(): void {
    ui.recBtn.classList.add('recording');
    ui.recLabel.textContent = t('stop');
    ui.recTimer.style.display = '';
  }

  function hideRecordingUI(): void {
    ui.recBtn.classList.remove('recording');
    ui.recLabel.textContent = t('rec');
    ui.recTimer.textContent = '';
    ui.recTimer.style.display = 'none';
  }

  function capturePngFrame(canvas: HTMLCanvasElement) {
    if (!pngRecording) return;

    const now = performance.now();
    const interval = 1000 / PNG_FPS;

    if (now - pngLastCaptureTime >= interval) {
      pngLastCaptureTime = now;
      const idx = pngFrameIndex++;
      canvas.toBlob((blob) => {
        if (blob) pngFrameBuffer[idx] = blob;
      }, 'image/png');
    }

    pngCaptureRaf = requestAnimationFrame(() => capturePngFrame(canvas));
  }

  async function finishPngExport(slug: string): Promise<void> {
    ui.recLabel.textContent = t('packing');
    await new Promise(r => setTimeout(r, 200));

    const zip = new JSZip();
    const folder = zip.folder('frames')!;
    const totalFrames = pngFrameIndex;
    for (let i = 0; i < totalFrames; i++) {
      if (pngFrameBuffer[i]) {
        folder.file(`frame_${String(i).padStart(5, '0')}.png`, pngFrameBuffer[i]);
      }
    }
    zip.file('.pv', JSON.stringify({ v: '0914', t: Date.now(), fps: PNG_FPS, f: totalFrames }));
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pv-${slug}-${PNG_FPS}fps-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    pngFrameBuffer = {};
    pngFrameIndex = 0;
    ui.recLabel.textContent = t('rec');
  }

  ui.recBtn.addEventListener('click', () => {
    const useAlpha = engine.alphaMode;
    const slug = getTemplateSlug(ui.templateSelect);

    // Alpha mode: PNG sequence capture
    if (useAlpha) {
      if (pngRecording) {
        pngRecording = false;
        cancelAnimationFrame(pngCaptureRaf);
        if (recTimerInterval) { clearInterval(recTimerInterval); recTimerInterval = null; }
        hideRecordingUI();
        finishPngExport(slug);
        return;
      }

      pngFrameBuffer = {};
      pngFrameIndex = 0;
      pngLastCaptureTime = 0;
      pngRecording = true;
      recStartTime = performance.now();
      showRecordingUI();
      recTimerInterval = setInterval(() => {
        ui.recTimer.textContent = formatClock((performance.now() - recStartTime) / 1000);
      }, 500);
      capturePngFrame(engine.canvas);
      return;
    }

    // Normal mode: MediaRecorder
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      return;
    }

    const canvas = engine.canvas;
    const stream = canvas.captureStream(60);

    if (engine.beat.audioContext && engine.beat.sourceNode) {
      const dest = engine.beat.audioContext.createMediaStreamDestination();
      engine.beat.sourceNode.connect(dest);
      for (const track of dest.stream.getAudioTracks()) {
        stream.addTrack(track);
      }
    }

    const mp4Supported = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1');
    const mimeType = mp4Supported
      ? 'video/mp4;codecs=avc1'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
    const ext = mp4Supported ? 'mp4' : 'webm';

    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      if (recTimerInterval) { clearInterval(recTimerInterval); recTimerInterval = null; }
      hideRecordingUI();

      if (recordedChunks.length === 0) return;
      const blob = new Blob(recordedChunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pv-${slug}-${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    };

    mediaRecorder.start(100);
    recStartTime = performance.now();
    showRecordingUI();
    recTimerInterval = setInterval(() => {
      ui.recTimer.textContent = formatClock((performance.now() - recStartTime) / 1000);
    }, 500);
  });
}