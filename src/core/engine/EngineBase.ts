// PV Tool — Copyright (c) 2026 DanteAlighieri13210914
// Licensed under AGPL-3.0. For commercial use, see COMMERCIAL.md

import * as PIXI from 'pixi.js';
import type { LayerType, ColorPalette, TemplateConfig } from '../types';
import { GlitchFilter } from '../glitchFilter';
import { BeatProvider } from '../beatProvider';

const EFFECT_LAYERS: LayerType[] = ['background', 'decoration', 'text', 'overlay'];

export class EngineBase {
  protected app: PIXI.Application;
  protected layers = new Map<LayerType, PIXI.Container>();
  protected effectsRoot!: PIXI.Container;
  protected bgFill!: PIXI.Graphics;
  
  protected palette: ColorPalette = {
    background: '#ffffff',
    primary: '#000000',
    secondary: '#666666',
    accent: '#ff0000',
    text: '#000000',
  };
  
  protected currentTemplate: TemplateConfig | null = null;
  protected _alphaMode = false;
  protected _effectOpacity = 1;
  protected _bgColorOverride: string | null = null;
  
  protected hueFilter: PIXI.ColorMatrixFilter;
  protected glitchFilter: GlitchFilter;
  
  protected _hueShift = 0;
  protected _shake = 0;
  protected _zoom = 0;
  protected _tilt = 0;
  protected _glitch = 0;
  
  protected _animationSpeed = 2;
  protected _motionIntensity = 1;
  
  protected _nativeDPR = 1;
  protected _currentResolution = 1;
  protected _resizeParent: HTMLElement | null = null;
  protected _loading = false;
  protected _tick = 0;
  protected _playbackTime = 0;
  protected _paused = false;
  protected _time = 0;
  protected _lastFrameTime = 0;
  
  readonly beat = new BeatProvider();

  constructor() {
    this.app = new PIXI.Application();
    this.hueFilter = new PIXI.ColorMatrixFilter();
    this.glitchFilter = new GlitchFilter();
  }

  async init(parent: HTMLElement) {
    this._nativeDPR = Math.min(window.devicePixelRatio || 1, 3);
    this._currentResolution = this._nativeDPR;
    this._resizeParent = parent;

    await this.app.init({
      resizeTo: parent,
      backgroundColor: 0x000000,
      backgroundAlpha: 0,
      antialias: true,
      resolution: this._nativeDPR,
      autoDensity: true,
      preserveDrawingBuffer: true,
    });
    parent.appendChild(this.app.canvas);

    const mediaLayer = new PIXI.Container();
    this.layers.set('media', mediaLayer);
    this.app.stage.addChild(mediaLayer);

    this.effectsRoot = new PIXI.Container();
    this.app.stage.addChild(this.effectsRoot);

    this.bgFill = new PIXI.Graphics();
    this.effectsRoot.addChild(this.bgFill);

    for (const layerType of EFFECT_LAYERS) {
      const container = new PIXI.Container();
      this.layers.set(layerType, container);
      this.effectsRoot.addChild(container);
    }

    this._lastFrameTime = performance.now();

    this.app.stage.filters = [this.hueFilter, this.glitchFilter];

    this.app.ticker.add(() => {
      const now = performance.now();
      const dt = (now - this._lastFrameTime) / 1000;
      this._lastFrameTime = now;
      this.updateTime(dt);
    });
  }

  protected updateTime(_dt: number) {
    // To be overridden by PVEngine
  }

  get paused() { return this._paused; }
  pause() { this._paused = true; this.beat.pause(); }
  resume() { this._paused = false; this._lastFrameTime = performance.now(); this.beat.resume(); }
  seek(time: number) { this._time = Math.max(0, time); }

  get animationSpeed() { return this._animationSpeed; }
  set animationSpeed(val: number) { this._animationSpeed = val; }
  
  get motionIntensity() { return this._motionIntensity; }
  set motionIntensity(val: number) { this._motionIntensity = val; }

  get effectOpacity() { return this._effectOpacity; }
  set effectOpacity(val: number) {
    this._effectOpacity = val;
    this.bgFill.alpha = val;
  }

  get alphaMode() { return this._alphaMode; }
  set alphaMode(val: boolean) {
    this._alphaMode = val;
    const bgLayer = this.layers.get('background');
    if (val) {
      this.bgFill.visible = false;
      if (bgLayer) bgLayer.visible = false;
      this.app.renderer.background.alpha = 0;
    } else {
      this.bgFill.visible = true;
      if (bgLayer) bgLayer.visible = true;
      this.app.renderer.background.alpha = 1;
    }
  }

  get canvasColor() { return this._bgColorOverride; }
  set canvasColor(color: string | null) {
    this._bgColorOverride = color;
    if (color) {
      this.palette.background = color;
      this.app.renderer.background.color = new PIXI.Color(color).toNumber();
      this.updateBgFill();
    } else if (this.currentTemplate) {
      this.palette.background = this.currentTemplate.palette.background;
      this.app.renderer.background.color = new PIXI.Color(this.palette.background).toNumber();
      this.updateBgFill();
    }
  }

  get hueShift() { return this._hueShift; }
  set hueShift(degrees: number) {
    this._hueShift = degrees;
    this.hueFilter.matrix = [1,0,0,0,0, 0,1,0,0,0, 0,0,1,0,0, 0,0,0,1,0];
    this.hueFilter.hue(degrees, false);
  }

  get shake() { return this._shake; }
  set shake(val: number) { this._shake = val; }
  get zoom() { return this._zoom; }
  set zoom(val: number) { this._zoom = val; }
  get tilt() { return this._tilt; }
  set tilt(val: number) { this._tilt = val; }
  get glitch() { return this._glitch; }
  set glitch(val: number) {
    this._glitch = val;
    this.glitchFilter.intensity = val;
  }

  protected updateBgFill() {
    if (!this.bgFill) return;
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const pad = Math.max(w, h) * 0.5;
    this.bgFill.clear();
    this.bgFill.rect(-pad, -pad, w + pad * 2, h + pad * 2);
    this.bgFill.fill({ color: this.palette.background });
  }

  get canvas(): HTMLCanvasElement {
    return this.app.canvas as HTMLCanvasElement;
  }

  get playbackTime(): number {
    return this._playbackTime;
  }

  destroy() {
    this.app.destroy(true);
  }
}