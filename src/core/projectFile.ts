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

import JSZip from 'jszip';
import type { UnifiedConfig } from './unifiedConfig';

export interface ProjectFile {
  version: string;
  config: UnifiedConfig;  // 直接使用 UnifiedConfig
  resources: {
    media?: { name: string; type: string; blobId: string };
    audio?: { name: string; type: string; blobId: string };
    lrc?: { name: string; content: string };
  };
  exportedAt: number;
}

const PROJECT_VERSION = '2.0.0';  // 升级版本号，区分新旧格式
const DB_NAME = 'PVToolCE';
const DB_VERSION = 1;
const STORE_NAME = 'resources';

interface ResourceRecord {
  id: string;
  name: string;
  type: 'media' | 'audio';
  mimeType: string;
  blob: Blob;
  createdAt: number;
}

class ResourceDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
    return this.initPromise;
  }

  async saveResource(id: string, name: string, type: 'media' | 'audio', mimeType: string, blob: Blob): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record: ResourceRecord = { id, name, type, mimeType, blob, createdAt: Date.now() };
      const request = store.put(record);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getResource(id: string): Promise<ResourceRecord | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async deleteResource(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAllResources(): Promise<ResourceRecord[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async clear(): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const resourceDB = new ResourceDB();

/**
 * 导出项目 - 使用 UnifiedConfig
 */
export async function exportProject(options: {
  config: UnifiedConfig;  // 直接传入完整配置
  mediaFile?: File | null;
  audioFile?: File | null;
  lrcContent?: string | null;
  lrcFileName?: string;
}): Promise<Blob> {
  const zip = new JSZip();
  
  const project: ProjectFile = {
    version: PROJECT_VERSION,
    config: options.config,
    resources: {},
    exportedAt: Date.now(),
  };

  // 保存配置文件
  zip.file('project.json', JSON.stringify(project, null, 2));

  // 保存资源文件到 zip
  if (options.mediaFile) {
    const ext = options.mediaFile.name.split('.').pop() || '';
    const fileName = `media.${ext}`;
    zip.file(fileName, options.mediaFile);
    project.resources.media = {
      name: options.mediaFile.name,
      type: options.mediaFile.type,
      blobId: '',
    };
  }

  if (options.audioFile) {
    const ext = options.audioFile.name.split('.').pop() || '';
    const fileName = `audio.${ext}`;
    zip.file(fileName, options.audioFile);
    project.resources.audio = {
      name: options.audioFile.name,
      type: options.audioFile.type,
      blobId: '',
    };
  }

  if (options.lrcContent) {
    zip.file('lyrics.lrc', options.lrcContent);
    project.resources.lrc = {
      name: options.lrcFileName || 'lyrics.lrc',
      content: options.lrcContent,
    };
  }

  // 更新 project.json（包含资源信息）
  zip.file('project.json', JSON.stringify(project, null, 2));

  return await zip.generateAsync({ type: 'blob' });
}

export interface ImportedProject {
  project: ProjectFile;
  mediaFile?: File;
  audioFile?: File;
  lrcContent?: string;
  lrcFileName?: string;
}

export async function importProject(file: File): Promise<ImportedProject> {
  const zip = await JSZip.loadAsync(file);
  
  const projectFile = zip.file('project.json');
  if (!projectFile) {
    throw new Error('Invalid project file: missing project.json');
  }
  
  const projectContent = await projectFile.async('string');
  const project: ProjectFile = JSON.parse(projectContent);
  
  // 兼容旧版本（v1.0.0）
  if (project.version === '1.0.0') {
    console.warn('Importing legacy project v1.0.0, converting to v2.0.0');
    // 转换旧格式到新格式
    const oldConfig = project.config as any;
    const newConfig = convertLegacyConfig(oldConfig);
    project.config = newConfig;
    project.version = PROJECT_VERSION;
  } else if (project.version !== PROJECT_VERSION) {
    console.warn(`Project version mismatch: expected ${PROJECT_VERSION}, got ${project.version}`);
  }
  
  const result: ImportedProject = { project };
  
  // 提取媒体文件
  const mediaFileEntry = zip.file(/^media\.[^.]+$/)[0];
  if (mediaFileEntry) {
    const blob = await mediaFileEntry.async('blob');
    const fileName = project.resources.media?.name || mediaFileEntry.name;
    result.mediaFile = new File([blob], fileName, { type: project.resources.media?.type || 'application/octet-stream' });
  }
  
  // 提取音频文件
  const audioFileEntry = zip.file(/^audio\.[^.]+$/)[0];
  if (audioFileEntry) {
    const blob = await audioFileEntry.async('blob');
    const fileName = project.resources.audio?.name || audioFileEntry.name;
    result.audioFile = new File([blob], fileName, { type: project.resources.audio?.type || 'application/octet-stream' });
  }
  
  // 提取 LRC 文件
  const lrcEntry = zip.file('lyrics.lrc');
  if (lrcEntry) {
    result.lrcContent = await lrcEntry.async('string');
    result.lrcFileName = project.resources.lrc?.name || 'lyrics.lrc';
  }
  
  return result;
}

/**
 * 转换旧版本配置 (v1.0.0) 到新版本 (v2.0.0)
 */
function convertLegacyConfig(old: any): UnifiedConfig {
  return {
    template: {
      name: old.template === 'custom' && old.templateConfig ? old.templateConfig.name : '',
      palette: old.templateConfig?.palette || {
        background: '#ffffff',
        primary: '#000000',
        secondary: '#666666',
        accent: '#ff0000',
        text: '#000000',
      },
      effects: old.templateConfig?.effects || [],
      bpm: old.bpm || 120,
      animationSpeed: old.animationSpeed || 2,
      bgOpacity: old.effectOpacity || 1,
      postfx: {
        shake: old.postfx?.shake || 0,
        zoom: old.postfx?.zoom || 0,
        tilt: old.postfx?.tilt || 0,
        glitch: old.postfx?.glitch || 0,
        hueShift: old.postfx?.hueShift || 0,
      },
      features: {
        mediaOutline: false,
        autoExtractColors: false,
        motionDetection: false,
        invertMedia: false,
        thresholdMedia: false,
      },
    },
    playback: {
      time: 0,
      paused: false,
      duration: 0,
    },
    text: {
      userText: old.text || '',
      textSegments: (old.text || '').split('/').filter((s: string) => s.trim()),
      currentText: '',
      segmentDuration: old.segmentDuration || 3,
    },
    lyric: {
      timeline: null,
      offset: 0,
      srtTimeline: null,
    },
    beat: {
      bpm: old.bpm || 120,
      reactivity: old.beatReactivity || 0.5,
      useAudio: false,
      currentIntensity: 0,
    },
    media: {
      hasMedia: false,
      type: null,
      url: null,
      offsetX: old.mediaOffset?.x || 0,
      offsetY: old.mediaOffset?.y || 0,
      scale: old.mediaOffset?.scale || 1,
      mode: old.mediaMode || 'fit',
    },
    effects: {
      alphaMode: old.alphaMode || false,
      effectOpacity: old.effectOpacity || 1,
      motionIntensity: old.motionIntensity || 1,
      beatReactivity: old.beatReactivity || 0.5,
    },
    postfx: {
      shake: old.postfx?.shake || 0,
      zoom: old.postfx?.zoom || 0,
      tilt: old.postfx?.tilt || 0,
      glitch: old.postfx?.glitch || 0,
      hueShift: old.postfx?.hueShift || 0,
    },
    features: {
      mediaOutline: false,
      autoExtractColors: false,
      motionDetection: false,
      invertMedia: false,
      thresholdMedia: false,
      alphaMode: old.alphaMode || false,
    },
    nowPlaying: {
      active: false,
      listening: false,
      track: null,
      time: 0,
      duration: 0,
      paused: false,
    },
    wesingCap: {
      active: false,
      listening: false,
      wsUrl: null,
      songTitle: '',
      time: 0,
      duration: 0,
      paused: false,
    },
    render: {
      screenWidth: 0,
      screenHeight: 0,
      resolution: 1,
      canvasColor: old.canvasColor || null,
    },
    motion: {
      enabled: false,
      targets: [],
      intensity: 1,
    },
  };
}

export async function saveResourceToIndexedDB(
  id: string,
  name: string,
  type: 'media' | 'audio',
  mimeType: string,
  blob: Blob
): Promise<void> {
  await resourceDB.saveResource(id, name, type, mimeType, blob);
}

export async function loadResourceFromIndexedDB(id: string): Promise<Blob | null> {
  const record = await resourceDB.getResource(id);
  return record?.blob || null;
}

export async function deleteResourceFromIndexedDB(id: string): Promise<void> {
  await resourceDB.deleteResource(id);
}

export async function getAllResources(): Promise<ResourceRecord[]> {
  return await resourceDB.getAllResources();
}

export async function clearAllResources(): Promise<void> {
  await resourceDB.clear();
}