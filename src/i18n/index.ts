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

export function t(key: LocaleKey): string {
  return locales[locale]?.[key] ?? locales.zh[key] ?? key;
}

export { type LocaleKey };