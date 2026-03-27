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

export interface SrtEntry {
  index: number;
  startMs: number;
  endMs: number;
  text: string;
}

function parseTimestamp(ts: string): number {
  // Format: HH:MM:SS,mmm or HH:MM:SS.mmm
  const m = ts.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/);
  if (!m) return 0;
  return (
    parseInt(m[1]) * 3600000 +
    parseInt(m[2]) * 60000 +
    parseInt(m[3]) * 1000 +
    parseInt(m[4])
  );
}

export function parseSrt(content: string): SrtEntry[] {
  const entries: SrtEntry[] = [];
  const blocks = content.trim().replace(/\r\n/g, '\n').split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 3) continue;

    const index = parseInt(lines[0]);
    if (isNaN(index)) continue;

    const timeLine = lines[1];
    const arrowIdx = timeLine.indexOf('-->');
    if (arrowIdx < 0) continue;

    const startMs = parseTimestamp(timeLine.slice(0, arrowIdx));
    const endMs = parseTimestamp(timeLine.slice(arrowIdx + 3));
    const text = lines.slice(2).join('\n');

    entries.push({ index, startMs, endMs, text });
  }

  return entries.sort((a, b) => a.startMs - b.startMs);
}
