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

import * as PIXI from 'pixi.js';
import { EngineModule } from './engineModule';
import { MediaOutlineRenderer } from '../mediaOutline';

export class MediaController extends EngineModule {
  private mediaElement: HTMLVideoElement | HTMLImageElement | null = null;
  private outlineRenderer: MediaOutlineRenderer | null = null;
  private invertFilter: PIXI.ColorMatrixFilter | null = null;
  
  private _outlineEnabled = false;
  private _invertMediaEnabled = false;
  private _thresholdMediaEnabled = false;
  private _mediaFile: File | null = null;

  init(): void {}

  destroy(): void {
    this.destroyOutline();
    this.mediaElement = null;
  }

  async addMedia(file: File, mode: 'fit' | 'free' = 'fit'): Promise<void> {
    if (this.engine['_loading']) return;
    this.engine['_loading'] = true;

    const url = URL.createObjectURL(file);

    try {
      this._mediaFile = file;
      const mediaLayer = this.engine['layers'].get('media')!;
      this.destroyOutline();
      mediaLayer.removeChildren().forEach(c => c.destroy({ children: true }));

      const isVideo = file.type.startsWith('video/');

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
            this.engine['app'].screen.width / video.videoWidth,
            this.engine['app'].screen.height / video.videoHeight
          );
          sprite.scale.set(scale);
        } else {
          const scale = Math.min(
            this.engine['app'].screen.width * 0.6 / video.videoWidth,
            this.engine['app'].screen.height * 0.6 / video.videoHeight
          );
          sprite.scale.set(scale);
        }

        sprite.anchor.set(0.5);
        sprite.x = this.engine['app'].screen.width / 2;
        sprite.y = this.engine['app'].screen.height / 2;
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
            this.engine['app'].screen.width / sprite.texture.width,
            this.engine['app'].screen.height / sprite.texture.height
          );
          sprite.scale.set(scale);
        } else {
          const scale = Math.min(
            this.engine['app'].screen.width * 0.6 / sprite.texture.width,
            this.engine['app'].screen.height * 0.6 / sprite.texture.height
          );
          sprite.scale.set(scale);
        }

        sprite.anchor.set(0.5);
        sprite.x = this.engine['app'].screen.width / 2;
        sprite.y = this.engine['app'].screen.height / 2;
        mediaLayer.addChild(sprite);
      }

      this.syncOutline();
      this.engine['syncMotionDetector']();
    } catch (err) {
      console.warn('[MediaController] addMedia failed:', err);
    } finally {
      URL.revokeObjectURL(url);
      this.engine['_loading'] = false;
    }
  }

  setMediaOffset(dx: number, dy: number): void {
    const s = this.getMediaSprite();
    if (!s) return;
    s.x = this.engine['app'].screen.width / 2 + dx;
    s.y = this.engine['app'].screen.height / 2 + dy;
    this.syncOutline();
  }

  setMediaScale(scale: number): void {
    const s = this.getMediaSprite();
    if (!s) return;
    const base = Math.max(
      this.engine['app'].screen.width / s.texture.width,
      this.engine['app'].screen.height / s.texture.height,
    );
    s.scale.set(base * scale);
    this.syncOutline();
  }

  getMediaState(): { offsetX: number; offsetY: number; scale: number } | null {
    const s = this.getMediaSprite();
    if (!s) return null;
    const base = Math.max(
      this.engine['app'].screen.width / s.texture.width,
      this.engine['app'].screen.height / s.texture.height,
    );
    return {
      offsetX: s.x - this.engine['app'].screen.width / 2,
      offsetY: s.y - this.engine['app'].screen.height / 2,
      scale: s.scale.x / base,
    };
  }

  getMediaConfig() {
    const state = this.getMediaState();
    const mediaLayer = this.engine['layers'].get('media');
    const hasMedia = !!(mediaLayer && mediaLayer.children.length > 0);
    
    const type: 'video' | 'image' | null = this.mediaElement instanceof HTMLVideoElement ? 'video' 
      : this.mediaElement instanceof HTMLImageElement ? 'image' : null;
    
    return {
      hasMedia,
      type,
      url: null,
      offsetX: state?.offsetX ?? 0,
      offsetY: state?.offsetY ?? 0,
      scale: state?.scale ?? 1,
      mode: 'fit' as const,
    };
  }

  get mediaFile(): File | null { return this._mediaFile; }
  
  get outlineEnabled(): boolean { return this._outlineEnabled; }
  set outlineEnabled(val: boolean) { this._outlineEnabled = val; this.syncOutline(); }
  
  get invertMediaEnabled(): boolean { return this._invertMediaEnabled; }
  set invertMediaEnabled(val: boolean) { this._invertMediaEnabled = val; this.syncInvertFilter(); }
  
  get thresholdMediaEnabled(): boolean { return this._thresholdMediaEnabled; }
  set thresholdMediaEnabled(val: boolean) { this._thresholdMediaEnabled = val; this.syncInvertFilter(); }
  
  get mediaElementRef(): HTMLVideoElement | HTMLImageElement | null { return this.mediaElement; }

  updateOutline(source: HTMLVideoElement | HTMLImageElement): void {
    if (this.outlineRenderer) {
      this.outlineRenderer.update(source as HTMLVideoElement);
    }
  }

  private getMediaSprite(): PIXI.Sprite | null {
    const layer = this.engine['layers'].get('media');
    return (layer?.children[0] as PIXI.Sprite) ?? null;
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
}