// PV Tool — Copyright (c) 2026 DanteAlighieri13210914
// Licensed under AGPL-3.0. For commercial use, see COMMERCIAL.md

import type { TemplateConfig } from './types';

const STORAGE_KEY = 'pv-tool-custom-templates';
const SHARE_KEY = 'PV2026';

// ── LocalStorage persistence ──

export function loadCustomTemplates(): TemplateConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TemplateConfig[];
  } catch {
    return [];
  }
}

export function saveCustomTemplates(templates: TemplateConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function addCustomTemplate(template: TemplateConfig): TemplateConfig[] {
  const list = loadCustomTemplates();
  list.push(template);
  saveCustomTemplates(list);
  return list;
}

export function removeCustomTemplate(index: number): TemplateConfig[] {
  const list = loadCustomTemplates();
  list.splice(index, 1);
  saveCustomTemplates(list);
  return list;
}

// ── Share code: serialize → compress → XOR encrypt → base64 ──

function xorCipher(data: Uint8Array, key: string): Uint8Array {
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key.charCodeAt(i % key.length);
  }
  return result;
}

async function compressBytes(data: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream('deflate');
  const writer = cs.writable.getWriter();
  writer.write(data as unknown as BufferSource);
  writer.close();
  const reader = cs.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    result.set(c, offset);
    offset += c.length;
  }
  return result;
}

async function decompressBytes(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate');
  const writer = ds.writable.getWriter();
  writer.write(data as unknown as BufferSource);
  writer.close();
  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    result.set(c, offset);
    offset += c.length;
  }
  return result;
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function encodeShareCode(template: TemplateConfig): Promise<string> {
  const json = JSON.stringify(template);
  const raw = new TextEncoder().encode(json);
  const compressed = await compressBytes(raw);
  const encrypted = xorCipher(compressed, SHARE_KEY);
  return uint8ToBase64(encrypted);
}

export async function decodeShareCode(code: string): Promise<TemplateConfig> {
  const cleaned = code.trim().replace(/\s+/g, '');
  const encrypted = base64ToUint8(cleaned);
  const compressed = xorCipher(encrypted, SHARE_KEY);
  const raw = await decompressBytes(compressed);
  const json = new TextDecoder().decode(raw);
  const template = JSON.parse(json) as TemplateConfig;
  if (!template.name || !template.palette || !Array.isArray(template.effects)) {
    throw new Error('Invalid template data');
  }
  return template;
}


// ── JSON format (human-readable, no compression, no encryption) ──
// yandujun363

/**
 * 导出为 JSON 格式（人类可读）
 */
export function encodeShareCodeJSON(template: TemplateConfig): string {
  return JSON.stringify(template);
}

/**
 * 从 JSON 格式导入
 */
export async function decodeShareCodeJSON(code: string): Promise<TemplateConfig> {
  const template = JSON.parse(code) as TemplateConfig;
  if (!template.name || !template.palette || !Array.isArray(template.effects)) {
    throw new Error('Invalid template data');
  }
  return template;
}

/**
 * 智能解码：自动检测是原版二进制还是 JSON
 */
export async function decodeShareCodeSmart(code: string): Promise<TemplateConfig> {
  const trimmed = code.trim();
  
  // 尝试 JSON 格式：先测试整个字符串能否通过 JSON 解析
  try {
    JSON.parse(trimmed);
    // JSON 解析成功，尝试解码为 TemplateConfig
    return await decodeShareCodeJSON(trimmed);
  } catch {
    // JSON 解析失败或解码失败，回退到原版二进制格式
    return await decodeShareCode(trimmed);
  }
}