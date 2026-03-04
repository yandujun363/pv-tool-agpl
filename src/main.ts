// PV Tool — Copyright (c) 2026 DanteAlighieri13210914
// Licensed under AGPL-3.0. For commercial use, see COMMERCIAL.md

import './style.css';
import { PVEngine } from './core/engine';
import { templates } from './templates';
import { effectCatalog } from './core/effectCatalog';
import type { TemplateConfig } from './core/types';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="panels-wrapper" id="panels-wrapper">
    <div class="controls">
      <div class="control-group">
        <label>模板 Template</label>
        <select id="template-select">
          ${templates.map((t, i) => `<option value="${i}">${t.name}</option>`).join('')}
          <option value="custom">✦ Custom 自定义</option>
        </select>
      </div>

      <div class="control-group">
        <label>画布色 Canvas</label>
        <div class="color-swatches" id="canvas-color-swatches">
          <button class="swatch swatch-active" data-color="" title="跟随模板">
            <span class="swatch-auto">A</span>
          </button>
          <button class="swatch" data-color="#ffffff" title="白" style="background:#ffffff"></button>
          <button class="swatch" data-color="#000000" title="黑" style="background:#000000"></button>
          <button class="swatch" data-color="#1122ee" title="蓝" style="background:#1122ee"></button>
          <button class="swatch" data-color="#8b1a1a" title="红" style="background:#8b1a1a"></button>
          <button class="swatch" data-color="#EEDD11" title="黄" style="background:#EEDD11"></button>
        </div>
      </div>

      <div class="control-group">
        <label>文字 Text（用 / 分段）</label>
        <input type="text" id="text-input" placeholder="春を告げる/夜を越えて" value="春を告げる/夜を越えて/踊れ踊れ">
      </div>

      <div class="control-group">
        <label>段落间隔 <span id="seg-val">3.0s</span></label>
        <input type="range" id="seg-slider" min="1" max="10" step="0.5" value="3">
      </div>

      <div class="control-group">
        <label>动画速度 <span id="speed-val">2.0x</span></label>
        <input type="range" id="speed-slider" min="0" max="4" step="0.1" value="2">
      </div>

      <div class="control-group">
        <label>运动幅度 <span id="motion-val">1.0x</span></label>
        <input type="range" id="motion-slider" min="0" max="2" step="0.1" value="1">
      </div>

      <div class="control-group">
        <label>效果透明度 <span id="opacity-val">100%</span></label>
        <input type="range" id="opacity-slider" min="0" max="1" step="0.05" value="1">
      </div>

      <div class="control-group">
        <label>媒体 Media</label>
        <input type="file" id="media-input" accept="image/*,video/mp4,video/webm,video/mov">
      </div>

      <div class="control-group" id="media-mode-group" style="display:none">
        <label>媒体模式 Mode</label>
        <select id="media-mode">
          <option value="fit">自动适配 Auto Fit</option>
          <option value="free">自由模式 Free</option>
        </select>
        <button id="media-apply" class="btn">应用 Apply</button>
      </div>

      <div class="control-group">
        <label>音乐 Audio</label>
        <input type="file" id="audio-input" accept="audio/*">
      </div>

      <div class="control-group" id="audio-controls" style="display:none">
        <div class="audio-row">
          <button id="audio-toggle" class="btn">⏸ 暂停</button>
          <span id="audio-status" class="audio-status">♪ Playing</span>
        </div>
      </div>

      <div class="control-group">
        <label>BPM <span id="bpm-val">120</span></label>
        <input type="range" id="bpm-slider" min="30" max="240" step="1" value="120">
      </div>

      <div class="control-group">
        <label>节拍反应 Beat React <span id="beat-val">0.5</span></label>
        <input type="range" id="beat-slider" min="0" max="1" step="0.05" value="0.5">
      </div>
    </div>

    <div class="controls controls-right">
      <div class="panel-title">後期 Post FX</div>

      <div class="control-group">
        <label>抖动 Shake <span id="shake-val">0</span></label>
        <input type="range" id="shake-slider" min="0" max="1" step="0.05" value="0">
      </div>

      <div class="control-group">
        <label>缩放 Zoom <span id="zoom-val">0</span></label>
        <input type="range" id="zoom-slider" min="-1" max="1" step="0.05" value="0">
      </div>

      <div class="control-group">
        <label>倾斜 Tilt <span id="tilt-val">0°</span></label>
        <input type="range" id="tilt-slider" min="-1" max="1" step="0.05" value="0">
      </div>

      <div class="control-group">
        <label>故障 Glitch <span id="glitch-val">0</span></label>
        <input type="range" id="glitch-slider" min="0" max="1" step="0.05" value="0">
      </div>

      <div class="control-group">
        <label>色相偏移 Hue <span id="hue-val">0°</span></label>
        <input type="range" id="hue-slider" min="-180" max="180" step="5" value="0">
      </div>

      <div class="control-group rec-group">
        <button id="rec-btn" class="btn rec-btn" title="录制 Record">
          <span class="rec-icon"></span>
          <span id="rec-label">录制 REC</span>
        </button>
        <span id="rec-timer" class="rec-timer"></span>
      </div>
    </div>

    <div class="controls controls-bottom" id="custom-panel" style="display:none">
      <div class="panel-title">效果库 Effects</div>
      <div class="effect-grid" id="effect-grid">
        ${effectCatalog.map((e, i) => `
          <label class="effect-toggle">
            <input type="checkbox" data-effect-idx="${i}">
            <span>${e.label}</span>
          </label>
        `).join('')}
      </div>
    </div>
  </div>

  <button class="mobile-toggle" id="mobile-toggle" title="显示/隐藏控制面板">☰</button>
  <div id="pv-container"></div>
`;

const engine = new PVEngine();
const container = document.getElementById('pv-container')!;

engine.init(container).then(() => {
  engine.setText('春を告げる/夜を越えて/踊れ踊れ');
  engine.loadTemplate(templates[0]);
  templateSelect.value = '0';
  syncSpeedSlider();
});

// Mobile toggle
const mobileToggle = document.getElementById('mobile-toggle')!;
const panelsWrapper = document.getElementById('panels-wrapper')!;
const isMobile = window.matchMedia('(max-width: 768px)').matches;
if (isMobile) {
  panelsWrapper.classList.add('panels-hidden');
}
mobileToggle.addEventListener('click', () => {
  const hidden = panelsWrapper.classList.contains('panels-hidden');
  panelsWrapper.classList.toggle('panels-hidden', !hidden);
  mobileToggle.textContent = hidden ? '✕' : '☰';
});

// Canvas color swatches
const swatchContainer = document.getElementById('canvas-color-swatches')!;
swatchContainer.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('.swatch') as HTMLButtonElement | null;
  if (!btn) return;
  swatchContainer.querySelectorAll('.swatch').forEach(s => s.classList.remove('swatch-active'));
  btn.classList.add('swatch-active');
  const color = btn.dataset.color;
  engine.canvasColor = color || null;
});

// Template
const templateSelect = document.getElementById('template-select') as HTMLSelectElement;
const customPanel = document.getElementById('custom-panel')!;
const effectGrid = document.getElementById('effect-grid')!;

let isCustomMode = false;

function buildCustomTemplate(): TemplateConfig {
  const checks = effectGrid.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
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

function syncSpeedSlider() {
  const v = engine.animationSpeed;
  speedSlider.value = String(v);
  speedVal.textContent = `${v.toFixed(1)}x`;
}

templateSelect.addEventListener('change', () => {
  const val = templateSelect.value;
  if (val === 'custom') {
    isCustomMode = true;
    customPanel.style.display = '';
    engine.loadTemplate(buildCustomTemplate());
  } else {
    isCustomMode = false;
    customPanel.style.display = 'none';
    engine.loadTemplate(templates[parseInt(val)]);
    syncSpeedSlider();
  }
});

let customRebuildTimer: ReturnType<typeof setTimeout>;
effectGrid.addEventListener('change', () => {
  if (isCustomMode) {
    clearTimeout(customRebuildTimer);
    customRebuildTimer = setTimeout(() => {
      try {
        engine.loadTemplate(buildCustomTemplate());
      } catch (err) {
        console.warn('[PV] Custom template rebuild failed:', err);
      }
    }, 300);
  }
});

// Text input with debounce
const textInput = document.getElementById('text-input') as HTMLInputElement;
let textTimer: ReturnType<typeof setTimeout>;
textInput.addEventListener('input', (e) => {
  clearTimeout(textTimer);
  textTimer = setTimeout(() => {
    engine.setText((e.target as HTMLInputElement).value);
  }, 400);
});

// Segment duration
const segSlider = document.getElementById('seg-slider') as HTMLInputElement;
const segVal = document.getElementById('seg-val')!;
segSlider.addEventListener('input', () => {
  const v = parseFloat(segSlider.value);
  engine.segmentDuration = v;
  segVal.textContent = `${v.toFixed(1)}s`;
});

// Animation speed
const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
const speedVal = document.getElementById('speed-val')!;
speedSlider.addEventListener('input', () => {
  const v = parseFloat(speedSlider.value);
  engine.animationSpeed = v;
  speedVal.textContent = `${v.toFixed(1)}x`;
});

// Motion intensity
const motionSlider = document.getElementById('motion-slider') as HTMLInputElement;
const motionVal = document.getElementById('motion-val')!;
motionSlider.addEventListener('input', () => {
  const v = parseFloat(motionSlider.value);
  engine.motionIntensity = v;
  motionVal.textContent = `${v.toFixed(1)}x`;
});

// Effect opacity
const opacitySlider = document.getElementById('opacity-slider') as HTMLInputElement;
const opacityVal = document.getElementById('opacity-val')!;
opacitySlider.addEventListener('input', () => {
  const v = parseFloat(opacitySlider.value);
  engine.effectOpacity = v;
  opacityVal.textContent = `${Math.round(v * 100)}%`;
});

// --- Post FX panel ---
const shakeSlider = document.getElementById('shake-slider') as HTMLInputElement;
const shakeVal = document.getElementById('shake-val')!;
shakeSlider.addEventListener('input', () => {
  const v = parseFloat(shakeSlider.value);
  engine.shake = v;
  shakeVal.textContent = v.toFixed(2);
});

const zoomSlider = document.getElementById('zoom-slider') as HTMLInputElement;
const zoomVal = document.getElementById('zoom-val')!;
zoomSlider.addEventListener('input', () => {
  const v = parseFloat(zoomSlider.value);
  engine.zoom = v;
  zoomVal.textContent = v.toFixed(2);
});

const tiltSlider = document.getElementById('tilt-slider') as HTMLInputElement;
const tiltVal = document.getElementById('tilt-val')!;
tiltSlider.addEventListener('input', () => {
  const v = parseFloat(tiltSlider.value);
  engine.tilt = v;
  tiltVal.textContent = `${(v * 17.2).toFixed(0)}°`;
});

const glitchSlider = document.getElementById('glitch-slider') as HTMLInputElement;
const glitchVal = document.getElementById('glitch-val')!;
glitchSlider.addEventListener('input', () => {
  const v = parseFloat(glitchSlider.value);
  engine.glitch = v;
  glitchVal.textContent = v.toFixed(2);
});

const hueSlider = document.getElementById('hue-slider') as HTMLInputElement;
const hueVal = document.getElementById('hue-val')!;
hueSlider.addEventListener('input', () => {
  const v = parseFloat(hueSlider.value);
  engine.hueShift = v;
  hueVal.textContent = `${v}°`;
});

// Audio upload
const audioInput = document.getElementById('audio-input') as HTMLInputElement;
const audioControls = document.getElementById('audio-controls')!;
const audioToggle = document.getElementById('audio-toggle') as HTMLButtonElement;
const audioStatus = document.getElementById('audio-status')!;

audioInput.addEventListener('change', async () => {
  const file = audioInput.files?.[0];
  if (!file) return;
  await engine.beat.loadAudio(file);
  audioControls.style.display = 'flex';
  audioStatus.textContent = '♪ Playing';
  audioToggle.textContent = '⏸ 暂停';
});

audioToggle.addEventListener('click', () => {
  if (engine.beat.paused) {
    engine.beat.resume();
    audioToggle.textContent = '⏸ 暂停';
    audioStatus.textContent = '♪ Playing';
  } else {
    engine.beat.pause();
    audioToggle.textContent = '▶ 播放';
    audioStatus.textContent = '⏹ Paused';
  }
});

// BPM (used when no audio is loaded)
const bpmSlider = document.getElementById('bpm-slider') as HTMLInputElement;
const bpmVal = document.getElementById('bpm-val')!;
bpmSlider.addEventListener('input', () => {
  const v = parseInt(bpmSlider.value);
  engine.beat.bpm = v;
  bpmVal.textContent = String(v);
});

// Beat reactivity
const beatSlider = document.getElementById('beat-slider') as HTMLInputElement;
const beatVal = document.getElementById('beat-val')!;
beatSlider.addEventListener('input', () => {
  const v = parseFloat(beatSlider.value);
  engine.beatReactivity = v;
  beatVal.textContent = v.toFixed(2);
});

// Media upload
const mediaInput = document.getElementById('media-input') as HTMLInputElement;
const mediaModeGroup = document.getElementById('media-mode-group')!;
const mediaModeSelect = document.getElementById('media-mode') as HTMLSelectElement;
const mediaApplyBtn = document.getElementById('media-apply')!;

let pendingFile: File | null = null;

mediaInput.addEventListener('change', () => {
  const file = mediaInput.files?.[0];
  if (file) {
    pendingFile = file;
    mediaModeGroup.style.display = 'flex';
  }
});

mediaApplyBtn.addEventListener('click', async () => {
  if (pendingFile) {
    const mode = mediaModeSelect.value as 'fit' | 'free';
    try {
      await engine.addMedia(pendingFile, mode);
    } catch (err) {
      console.warn('[PV] Media load failed:', err);
    }
    pendingFile = null;
  }
});

// --- Recording ---
const recBtn = document.getElementById('rec-btn')!;
const recLabel = document.getElementById('rec-label')!;
const recTimer = document.getElementById('rec-timer')!;

const templateSlugs = [
  'blueBold', 'kineticSplit', 'bluePlane', 'cyberGrunge', 'geometric',
  'rainCity', 'cyberpunkHud', 'emotionCinema', 'hystericNight',
  'spiderWeb', 'staggeredText',
];

function getTemplateSlug(): string {
  const val = templateSelect.value;
  if (val === 'custom') return 'custom';
  const idx = parseInt(val);
  return templateSlugs[idx] ?? 'unknown';
}

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let recStartTime = 0;
let recTimerInterval: ReturnType<typeof setInterval> | null = null;

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

recBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    return;
  }

  const canvas = engine.canvas;
  const stream = canvas.captureStream(60);

  // Include audio if playing
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
  const slug = getTemplateSlug();

  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    if (recTimerInterval) { clearInterval(recTimerInterval); recTimerInterval = null; }
    recBtn.classList.remove('recording');
    recLabel.textContent = '录制 REC';
    recTimer.textContent = '';

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
  recBtn.classList.add('recording');
  recLabel.textContent = '停止 STOP';
  recTimerInterval = setInterval(() => {
    recTimer.textContent = formatTime(performance.now() - recStartTime);
  }, 500);
});