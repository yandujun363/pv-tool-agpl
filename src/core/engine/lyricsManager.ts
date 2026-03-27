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

import type { LyricLine } from '../types';
import { EngineModule } from './engineModule';

export interface SrtEntry {
  index: number;
  startMs: number;
  endMs: number;
  text: string;
}

export class LyricsManager extends EngineModule {
  private userText = '';
  private textSegments: string[] = ['春を告げる'];
  private lyricTimeline: LyricLine[] | null = null;
  private lyricOffsetSeconds = 0;
  lyricCursor = 0;
  lastLyricTime = -1;
  private _segmentDuration = 3;
  private _srtTimeline: SrtEntry[] | null = null;

  init(): void {}

  destroy(): void {
    this.clearLyricTimeline();
  }

  setText(text: string): void {
    this.clearLyricTimeline();
    this.userText = text;
    this.textSegments = text
      .split('/')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    if (this.textSegments.length === 0) {
      this.textSegments = [''];
    }
    this.engine.reloadTemplate();
  }

  setLyricTimeline(lines: LyricLine[]): void {
    if (lines.length === 0) {
      this.clearLyricTimeline();
      return;
    }

    this._srtTimeline = null;
    this.lyricTimeline = [...lines].sort((a, b) => a.time - b.time);
    this.lyricCursor = 0;
    this.lastLyricTime = -1;

    this.userText = this.lyricTimeline[0].text;
    this.textSegments = [this.userText];

    this.engine.reloadTemplate();
  }

  setSrtTimeline(entries: SrtEntry[] | null): void {
    this._srtTimeline = entries;
    if (entries && entries.length > 0) {
      this.clearLyricTimeline();
    }
  }

  clearLyricTimeline(): void {
    this.lyricTimeline = null;
    this.lyricCursor = 0;
    this.lastLyricTime = -1;
    this.lyricOffsetSeconds = 0;
  }

  getDisplayText(time: number): string {
    if (this._srtTimeline) {
      const ms = time * 1000;
      const entry = this._srtTimeline.find(e => ms >= e.startMs && ms < e.endMs);
      return entry?.text ?? '';
    }

    if (!this.lyricTimeline || this.lyricTimeline.length === 0) {
      const segIdx = this.textSegments.length > 1
        ? Math.floor(time / this._segmentDuration) % this.textSegments.length
        : 0;
      return this.textSegments[segIdx] || '';
    }

    const t = Math.max(0, time + this.lyricOffsetSeconds);
    if (t < this.lastLyricTime) {
      this.lyricCursor = 0;
    }
    this.lastLyricTime = t;

    while (
      this.lyricCursor + 1 < this.lyricTimeline.length
      && this.lyricTimeline[this.lyricCursor + 1].time <= t
    ) {
      this.lyricCursor++;
    }

    while (
      this.lyricCursor > 0
      && this.lyricTimeline[this.lyricCursor].time > t
    ) {
      this.lyricCursor--;
    }

    if (t < this.lyricTimeline[0].time) return '';
    return this.lyricTimeline[this.lyricCursor].text;
  }

  getConfig() {
    return {
      userText: this.userText,
      textSegments: [...this.textSegments],
      currentText: this.getDisplayText(this.engine['_time']),
      segmentDuration: this._segmentDuration,
      timeline: this.lyricTimeline ? [...this.lyricTimeline] : null,
      offset: this.lyricOffsetSeconds,
      srtTimeline: this._srtTimeline ? [...this._srtTimeline] : null,
    };
  }

  applyConfig(config: Partial<ReturnType<LyricsManager['getConfig']>>): void {
    if (config.userText !== undefined) {
      this.setText(config.userText);
    }
    if (config.segmentDuration !== undefined) {
      this.segmentDuration = config.segmentDuration;
    }
    if (config.timeline !== undefined) {
      if (config.timeline && config.timeline.length > 0) {
        this.setLyricTimeline(config.timeline);
      } else {
        this.clearLyricTimeline();
      }
    }
    if (config.offset !== undefined) {
      this.lyricOffset = config.offset;
    }
    if (config.srtTimeline !== undefined) {
      this.setSrtTimeline(config.srtTimeline || null);
    }
  }

  get userTextValue(): string { return this.userText; }
  get textSegmentsValue(): string[] { return [...this.textSegments]; }
  get segmentDuration(): number { return this._segmentDuration; }
  set segmentDuration(val: number) { this._segmentDuration = val; }
  set lyricOffset(val: number) { this.lyricOffsetSeconds = val; }
  get lyricOffset(): number { return this.lyricOffsetSeconds; }
  get hasLyricTimeline(): boolean { return !!this.lyricTimeline && this.lyricTimeline.length > 0; }
  get lyricLineCount(): number { return this.lyricTimeline?.length ?? 0; }
}