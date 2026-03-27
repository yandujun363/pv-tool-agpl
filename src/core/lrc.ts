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

import type { LyricLine } from './types';

const TIME_TAG_RE = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
const META_TAG_RE = /^\s*\[[a-zA-Z]+:.*\]\s*$/;

function parseTimeToSeconds(minStr: string, secStr: string, fracStr?: string): number {
  const min = Number.parseInt(minStr, 10);
  const sec = Number.parseInt(secStr, 10);
  let frac = 0;

  if (fracStr) {
    if (fracStr.length === 1) frac = Number.parseInt(fracStr, 10) / 10;
    else if (fracStr.length === 2) frac = Number.parseInt(fracStr, 10) / 100;
    else frac = Number.parseInt(fracStr.slice(0, 3), 10) / 1000;
  }

  return min * 60 + sec + frac;
}

export function parseLrc(content: string): LyricLine[] {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/);
  const result: LyricLine[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || META_TAG_RE.test(line)) continue;

    TIME_TAG_RE.lastIndex = 0;
    const times: number[] = [];

    let match: RegExpExecArray | null;
    while ((match = TIME_TAG_RE.exec(line)) !== null) {
      times.push(parseTimeToSeconds(match[1], match[2], match[3]));
    }

    if (times.length === 0) continue;

    const text = line.replace(TIME_TAG_RE, '').trim();
    for (const time of times) {
      result.push({ time, text });
    }
  }

  result.sort((a, b) => a.time - b.time);
  return result;
}

export function formatTime(time: number): string {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);
  const ms = Math.floor((time % 1) * 100);
  return `[${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}]`;
}

export function formatLrc(lines: LyricLine[]): string {
  return lines.map((line) => `${formatTime(line.time)} ${line.text}`).join('\n');
}
