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

import { zh, type LocaleKey } from './zh';
import { ja } from './ja';
import { en } from './en';

export type Locale = 'zh' | 'ja' | 'en';

const locales: Record<Locale, Record<LocaleKey, string>> = { zh, ja, en };

function detectLocale(): Locale {
  // 1. 优先读取 URL 参数 ?lang=xxx
  const urlParams = new URLSearchParams(window.location.search);
  const paramLang = urlParams.get('lang');
  if (paramLang === 'ja') return 'ja';
  if (paramLang === 'en') return 'en';
  if (paramLang === 'zh') return 'zh';
  
  // 2. 如果没有参数，再从路径判断
  const path = window.location.pathname;
  if (path.includes('/ja/') || path.endsWith('/ja')) return 'ja';
  if (path.includes('/en/') || path.endsWith('/en')) return 'en';
  
  // 3. 默认中文
  return 'zh';
}

export const locale: Locale = detectLocale();

export function t(key: string, params?: Record<string, string | number | undefined>): string {
  let text = locales[locale]?.[key as LocaleKey] ?? locales.zh[key as LocaleKey] ?? key;
  
  if (params && Object.keys(params).length > 0) {
    text = text.replace(/\{([^}]+)\}/g, (match, paramKey) => {
      const trimmedKey = paramKey.trim();
      const value = params[trimmedKey];

      if (value === undefined) {
        console.warn(`Missing parameter "${trimmedKey}" for i18n key "${key}"`);
        return match;
      }
      
      return String(value);
    });
  }
  
  return text;
}

export { type LocaleKey };