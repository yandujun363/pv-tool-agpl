// PV Tool — Copyright (c) 2026 DanteAlighieri13210914
// Licensed under AGPL-3.0. For commercial use, see COMMERCIAL.md

export interface UIElements {
  // Template
  templateSelect: HTMLSelectElement;
  tplDeleteBtn: HTMLButtonElement;
  tplExportBtn: HTMLButtonElement;
  tplSaveBtn: HTMLButtonElement;
  tplImportBtn: HTMLButtonElement;
  tplSaveInput: HTMLElement;
  tplNameInput: HTMLInputElement;
  tplSaveOk: HTMLButtonElement;
  tplSaveCancel: HTMLButtonElement;
  tplDeleteConfirm: HTMLElement;
  tplDeleteText: HTMLElement;
  tplDeleteOk: HTMLButtonElement;
  tplDeleteCancel: HTMLButtonElement;
  shareCodeGroup: HTMLElement;
  shareCodeLabel: HTMLElement;
  shareCodeText: HTMLInputElement;
  shareCodeOk: HTMLButtonElement;
  shareCodeCancel: HTMLButtonElement;

  // Controls
  canvasColorSwatches: HTMLElement;
  textInput: HTMLTextAreaElement;
  segSlider: HTMLInputElement;
  segVal: HTMLElement;
  speedSlider: HTMLInputElement;
  speedVal: HTMLElement;
  motionSlider: HTMLInputElement;
  motionVal: HTMLElement;
  opacitySlider: HTMLInputElement;
  opacityVal: HTMLElement;
  playbackTimeEl: HTMLElement;
  seekSlider: HTMLInputElement;
  bpmSlider: HTMLInputElement;
  bpmVal: HTMLElement;
  beatSlider: HTMLInputElement;
  beatVal: HTMLElement;

  // PostFX
  shakeSlider: HTMLInputElement;
  shakeVal: HTMLElement;
  zoomSlider: HTMLInputElement;
  zoomVal: HTMLElement;
  tiltSlider: HTMLInputElement;
  tiltVal: HTMLElement;
  glitchSlider: HTMLInputElement;
  glitchVal: HTMLElement;
  hueSlider: HTMLInputElement;
  hueVal: HTMLElement;

  // Media
  mediaPickBtn: HTMLButtonElement;
  mediaPickName: HTMLElement;
  mediaInput: HTMLInputElement;
  mediaModeGroup: HTMLElement;
  mediaModeSelect: HTMLSelectElement;
  mediaApplyBtn: HTMLButtonElement;  // 确保类型正确
  mediaPosGroup: HTMLElement;
  mediaXSlider: HTMLInputElement;
  mediaYSlider: HTMLInputElement;
  mediaScaleSlider: HTMLInputElement;
  mediaXVal: HTMLElement;
  mediaYVal: HTMLElement;
  mediaScaleVal: HTMLElement;

  // Audio
  audioPickBtn: HTMLButtonElement;
  audioPickName: HTMLElement;
  audioInput: HTMLInputElement;
  audioControls: HTMLElement;
  audioToggle: HTMLButtonElement;
  audioStatus: HTMLElement;

  // LRC
  lrcPickBtn: HTMLButtonElement;
  lrcPickName: HTMLElement;
  lrcInput: HTMLInputElement;

  // Export
  alphaToggle: HTMLInputElement;
  recBtn: HTMLElement;
  recLabel: HTMLElement;
  recTimer: HTMLElement;
  exportProjectBtn: HTMLButtonElement;
  importProjectBtn: HTMLButtonElement;

  // Listen
  npListenToggle: HTMLInputElement | null;
  nwcListenToggle: HTMLInputElement | null;
  nwcGearBtn: HTMLButtonElement | null;
  copyUrlBtn: HTMLButtonElement | null;

  // Misc
  customPanel: HTMLElement;
  effectGrid: HTMLElement;
  mobileToggle: HTMLElement;
  panelsWrapper: HTMLElement;
}

export function getUIElements(): UIElements {
  return {
    templateSelect: document.getElementById('template-select') as HTMLSelectElement,
    tplDeleteBtn: document.getElementById('tpl-delete') as HTMLButtonElement,
    tplExportBtn: document.getElementById('tpl-export') as HTMLButtonElement,
    tplSaveBtn: document.getElementById('tpl-save') as HTMLButtonElement,
    tplImportBtn: document.getElementById('tpl-import') as HTMLButtonElement,
    tplSaveInput: document.getElementById('tpl-save-input')!,
    tplNameInput: document.getElementById('tpl-name-input') as HTMLInputElement,
    tplSaveOk: document.getElementById('tpl-save-ok') as HTMLButtonElement,
    tplSaveCancel: document.getElementById('tpl-save-cancel') as HTMLButtonElement,
    tplDeleteConfirm: document.getElementById('tpl-delete-confirm')!,
    tplDeleteText: document.getElementById('tpl-delete-text')!,
    tplDeleteOk: document.getElementById('tpl-delete-ok') as HTMLButtonElement,
    tplDeleteCancel: document.getElementById('tpl-delete-cancel') as HTMLButtonElement,
    shareCodeGroup: document.getElementById('share-code-group')!,
    shareCodeLabel: document.getElementById('share-code-label')!,
    shareCodeText: document.getElementById('share-code-text') as HTMLInputElement,
    shareCodeOk: document.getElementById('share-code-ok') as HTMLButtonElement,
    shareCodeCancel: document.getElementById('share-code-cancel') as HTMLButtonElement,

    canvasColorSwatches: document.getElementById('canvas-color-swatches')!,
    textInput: document.getElementById('text-input') as HTMLTextAreaElement,
    segSlider: document.getElementById('seg-slider') as HTMLInputElement,
    segVal: document.getElementById('seg-val')!,
    speedSlider: document.getElementById('speed-slider') as HTMLInputElement,
    speedVal: document.getElementById('speed-val')!,
    motionSlider: document.getElementById('motion-slider') as HTMLInputElement,
    motionVal: document.getElementById('motion-val')!,
    opacitySlider: document.getElementById('opacity-slider') as HTMLInputElement,
    opacityVal: document.getElementById('opacity-val')!,
    playbackTimeEl: document.getElementById('playback-time')!,
    seekSlider: document.getElementById('seek-slider') as HTMLInputElement,
    bpmSlider: document.getElementById('bpm-slider') as HTMLInputElement,
    bpmVal: document.getElementById('bpm-val')!,
    beatSlider: document.getElementById('beat-slider') as HTMLInputElement,
    beatVal: document.getElementById('beat-val')!,

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

    mediaPickBtn: document.getElementById('media-pick-btn') as HTMLButtonElement,
    mediaPickName: document.getElementById('media-pick-name')!,
    mediaInput: document.getElementById('media-input') as HTMLInputElement,
    mediaModeGroup: document.getElementById('media-mode-group')!,
    mediaModeSelect: document.getElementById('media-mode') as HTMLSelectElement,
    mediaApplyBtn: document.getElementById('media-apply') as HTMLButtonElement,
    mediaPosGroup: document.getElementById('media-pos-group')!,
    mediaXSlider: document.getElementById('media-x') as HTMLInputElement,
    mediaYSlider: document.getElementById('media-y') as HTMLInputElement,
    mediaScaleSlider: document.getElementById('media-scale') as HTMLInputElement,
    mediaXVal: document.getElementById('media-x-val')!,
    mediaYVal: document.getElementById('media-y-val')!,
    mediaScaleVal: document.getElementById('media-scale-val')!,

    audioPickBtn: document.getElementById('audio-pick-btn') as HTMLButtonElement,
    audioPickName: document.getElementById('audio-pick-name')!,
    audioInput: document.getElementById('audio-input') as HTMLInputElement,
    audioControls: document.getElementById('audio-controls')!,
    audioToggle: document.getElementById('audio-toggle') as HTMLButtonElement,
    audioStatus: document.getElementById('audio-status')!,

    lrcPickBtn: document.getElementById('lrc-pick-btn') as HTMLButtonElement,
    lrcPickName: document.getElementById('lrc-pick-name')!,
    lrcInput: document.getElementById('lrc-input') as HTMLInputElement,

    alphaToggle: document.getElementById('alpha-toggle') as HTMLInputElement,
    recBtn: document.getElementById('rec-btn')!,
    recLabel: document.getElementById('rec-label')!,
    recTimer: document.getElementById('rec-timer')!,
    exportProjectBtn: document.getElementById('export-project-btn') as HTMLButtonElement,
    importProjectBtn: document.getElementById('import-project-btn') as HTMLButtonElement,

    npListenToggle: document.getElementById('np-listen-toggle') as HTMLInputElement | null,
    nwcListenToggle: document.getElementById('nwc-listen-toggle') as HTMLInputElement | null,
    nwcGearBtn: document.getElementById('nwc-gear-btn') as HTMLButtonElement | null,
    copyUrlBtn: document.getElementById('copy-url-btn') as HTMLButtonElement | null,

    customPanel: document.getElementById('custom-panel')!,
    effectGrid: document.getElementById('effect-grid')!,
    mobileToggle: document.getElementById('mobile-toggle')!,
    panelsWrapper: document.getElementById('panels-wrapper')!,
  };
}