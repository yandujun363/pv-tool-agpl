// core/engine/MediaManager.ts
// PV Tool — Copyright (c) 2026 DanteAlighieri13210914
// Licensed under AGPL-3.0. For commercial use, see COMMERCIAL.md

import * as PIXI from 'pixi.js';
import type { EngineBase } from './EngineBase';
import { MediaOutlineRenderer } from '../mediaOutline';
import { MotionDetector } from '../motionDetector';
import { extractDominantColors } from '../colorExtractor';
import type { MotionTargetInfo } from '../types';

export class MediaManager {
  private engine: EngineBase;
  
  private mediaElement: HTMLVideoElement | HTMLImageElement | null = null;
  private outlineRenderer: MediaOutlineRenderer | null = null;
  private _outlineEnabled = false;
  private extractingColors = false;
  
  private motionDetector: MotionDetector | null = null;
  private _motionDetectionEnabled = false;
  public motionTargets: MotionTargetInfo[] = [];
  
  private invertFilter: PIXI.ColorMatrixFilter | null = null;
  private _invertMediaEnabled = false;
  private _thresholdMediaEnabled = false;
  
  private _mediaFile: File | null = null;

  constructor(engine: EngineBase) {
    this.engine = engine;
  }

  get mediaFile(): File | null { return this._mediaFile; }
  get outlineEnabled() { return this._outlineEnabled; }
  set outlineEnabled(val: boolean) {
    this._outlineEnabled = val;
    this.syncOutline();
  }
  get motionDetectionEnabled() { return this._motionDetectionEnabled; }
  set motionDetectionEnabled(val: boolean) {
    this._motionDetectionEnabled = val;
    this.syncMotionDetector();
  }
  get invertMediaEnabled() { return this._invertMediaEnabled; }
  set invertMediaEnabled(val: boolean) {
    this._invertMediaEnabled = val;
    this.syncInvertFilter();
  }
  get thresholdMediaEnabled() { return this._thresholdMediaEnabled; }
  set thresholdMediaEnabled(val: boolean) {
    this._thresholdMediaEnabled = val;
    this.syncInvertFilter();
  }

  async addMedia(file: File, mode: 'fit' | 'free' = 'fit'): Promise<void> {
    if ((this.engine as any)._loading) return;
    (this.engine as any)._loading = true;

    const url = URL.createObjectURL(file);

    try {
      this._mediaFile = file;
      const mediaLayer = this.engine['layers'].get('media')!;
      this.destroyOutline();
      mediaLayer.removeChildren().forEach(c => c.destroy({ children: true }));

      const isVideo = file.type.startsWith('video/');
      const app = this.engine['app'];

      if (isVideo) {
        const video = document.createElement('video');
        video.src = url;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;

        await video.play();
        this.mediaElement = video;

        const texture = PIXI.Texture.from(video);
        const sprite = new PIXI.Sprite(texture);

        if (mode === 'fit') {
          const scale = Math.max(
            app.screen.width / video.videoWidth,
            app.screen.height / video.videoHeight
          );
          sprite.scale.set(scale);
        } else {
          const scale = Math.min(
            app.screen.width * 0.6 / video.videoWidth,
            app.screen.height * 0.6 / video.videoHeight
          );
          sprite.scale.set(scale);
        }

        sprite.anchor.set(0.5);
        sprite.x = app.screen.width / 2;
        sprite.y = app.screen.height / 2;
        mediaLayer.addChild(sprite);
      } else {
        const img = new Image();
        img.src = url;

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Image load failed'));
        });

        const maxDim = 4096;
        if (img.naturalWidth > maxDim || img.naturalHeight > maxDim) {
          const downscale = maxDim / Math.max(img.naturalWidth, img.naturalHeight);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.naturalWidth * downscale);
          canvas.height = Math.round(img.naturalHeight * downscale);
          const dctx = canvas.getContext('2d')!;
          dctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const smallImg = new Image();
          smallImg.src = canvas.toDataURL();
          await new Promise<void>((res) => { smallImg.onload = () => res(); });
          this.mediaElement = smallImg;
        } else {
          this.mediaElement = img;
        }

        const texture = PIXI.Texture.from(this.mediaElement as HTMLImageElement);
        const sprite = new PIXI.Sprite(texture);

        if (mode === 'fit') {
          const scale = Math.max(
            app.screen.width / sprite.texture.width,
            app.screen.height / sprite.texture.height
          );
          sprite.scale.set(scale);
        } else {
          const scale = Math.min(
            app.screen.width * 0.6 / sprite.texture.width,
            app.screen.height * 0.6 / sprite.texture.height
          );
          sprite.scale.set(scale);
        }

        sprite.anchor.set(0.5);
        sprite.x = app.screen.width / 2;
        sprite.y = app.screen.height / 2;
        mediaLayer.addChild(sprite);
      }

      const template = (this.engine as any).currentTemplate;
      if (template?.features?.autoExtractColors && !this.extractingColors) {
        this.extractingColors = true;
        this.applyExtractedColors();
        (this.engine as any)._loading = false;
        (this.engine as any).loadTemplate(template);
        this.extractingColors = false;
        return;
      }

      this.syncOutline();
      this.syncMotionDetector();
    } catch (err) {
      console.warn('[PVEngine] addMedia failed:', err);
    } finally {
      URL.revokeObjectURL(url);
      (this.engine as any)._loading = false;
    }
  }

  private applyExtractedColors(): void {
    if (!this.mediaElement) return;
    const colors = extractDominantColors(this.mediaElement);
    (this.engine as any).palette = {
      background: colors.primary,
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.complement,
      text: '#ffffff',
    };
  }

  private getMediaSprite(): PIXI.Sprite | null {
    const layer = this.engine['layers'].get('media');
    return (layer?.children[0] as PIXI.Sprite) ?? null;
  }

  setMediaOffset(dx: number, dy: number): void {
    const s = this.getMediaSprite();
    if (!s) return;
    const app = this.engine['app'];
    s.x = app.screen.width / 2 + dx;
    s.y = app.screen.height / 2 + dy;
    this.syncOutline();
  }

  setMediaScale(scale: number): void {
    const s = this.getMediaSprite();
    if (!s) return;
    const app = this.engine['app'];
    const base = Math.max(
      app.screen.width / s.texture.width,
      app.screen.height / s.texture.height,
    );
    s.scale.set(base * scale);
    this.syncOutline();
  }

  getMediaState(): { offsetX: number; offsetY: number; scale: number } | null {
    const s = this.getMediaSprite();
    if (!s) return null;
    const app = this.engine['app'];
    const base = Math.max(
      app.screen.width / s.texture.width,
      app.screen.height / s.texture.height,
    );
    return {
      offsetX: s.x - app.screen.width / 2,
      offsetY: s.y - app.screen.height / 2,
      scale: s.scale.x / base,
    };
  }

  private syncOutline(): void {
    if (!this._outlineEnabled || !this.mediaElement) {
      this.destroyOutline();
      return;
    }

    const mediaLayer = this.engine['layers'].get('media')!;
    const mediaSprite = mediaLayer.children[0] as PIXI.Sprite | undefined;
    if (!mediaSprite) return;

    if (this.outlineRenderer) return;

    const srcW = this.mediaElement instanceof HTMLVideoElement
      ? this.mediaElement.videoWidth
      : this.mediaElement.naturalWidth;
    const srcH = this.mediaElement instanceof HTMLVideoElement
      ? this.mediaElement.videoHeight
      : this.mediaElement.naturalHeight;

    this.outlineRenderer = new MediaOutlineRenderer(srcW, srcH);
    const os = this.outlineRenderer.sprite;
    os.anchor.set(0.5);
    os.x = mediaSprite.x;
    os.y = mediaSprite.y;
    os.width = mediaSprite.width;
    os.height = mediaSprite.height;
    mediaLayer.addChild(os);
  }

  private destroyOutline(): void {
    if (this.outlineRenderer) {
      this.outlineRenderer.destroy();
      this.outlineRenderer = null;
    }
  }

  private syncInvertFilter(): void {
    const mediaLayer = this.engine['layers'].get('media')!;
    if (this._thresholdMediaEnabled) {
      const desat = new PIXI.ColorMatrixFilter();
      desat.desaturate();
      const contrast = new PIXI.ColorMatrixFilter();
      contrast.matrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
      contrast.contrast(1.8, false);
      const bright = new PIXI.ColorMatrixFilter();
      bright.matrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
      bright.brightness(1.15, false);
      mediaLayer.filters = [desat, contrast, bright];
      this.invertFilter = null;
    } else if (this._invertMediaEnabled) {
      if (!this.invertFilter) {
        this.invertFilter = new PIXI.ColorMatrixFilter();
      }
      const m = this.invertFilter;
      m.matrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
      m.desaturate();
      m.negative(false);
      const tint = new PIXI.ColorMatrixFilter();
      tint.matrix = [
        1.06, 0, 0, 0, 0.08,
        0, 1.02, 0, 0, 0.04,
        0, 0, 0.94, 0, 0,
        0, 0, 0, 1, 0,
      ];
      mediaLayer.filters = [this.invertFilter, tint];
    } else {
      this.invertFilter = null;
      mediaLayer.filters = [];
    }
  }

  private syncMotionDetector(): void {
    if (this._motionDetectionEnabled && this.mediaElement instanceof HTMLVideoElement) {
      if (!this.motionDetector) {
        this.motionDetector = new MotionDetector();
      }
    } else {
      if (this.motionDetector) {
        this.motionDetector.destroy();
        this.motionDetector = null;
      }
      this.motionTargets = [];
    }
  }

  updateMotion(): void {
    if (this.motionDetector && this.mediaElement instanceof HTMLVideoElement) {
      this.motionDetector.detect(this.mediaElement);
      const srcW = this.mediaElement.videoWidth || 1;
      const srcH = this.mediaElement.videoHeight || 1;
      const app = this.engine['app'];
      this.motionTargets = this.motionDetector.getTargetsForDisplay(
        app.screen.width, app.screen.height, srcW, srcH,
      );
    }
  }

  updateOutline(): void {
    if (this.outlineRenderer && this.mediaElement) {
      this.outlineRenderer.update(this.mediaElement as HTMLVideoElement);
    }
  }

  get mediaElementRef(): HTMLVideoElement | HTMLImageElement | null {
    return this.mediaElement;
  }

  destroy(): void {
    this.destroyOutline();
    if (this.motionDetector) {
      this.motionDetector.destroy();
      this.motionDetector = null;
    }
  }
}