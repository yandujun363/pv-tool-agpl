// core/projectFile.ts
import JSZip from 'jszip';
import type { TemplateConfig } from './types';

export interface ProjectFile {
  version: string;
  config: {
    template: string | number;  // template index or 'custom'
    templateConfig?: TemplateConfig;  // for custom templates
    canvasColor: string | null;
    text: string;
    segmentDuration: number;
    animationSpeed: number;
    motionIntensity: number;
    effectOpacity: number;
    postfx: {
      shake: number;
      zoom: number;
      tilt: number;
      glitch: number;
      hueShift: number;
    };
    beatReactivity: number;
    bpm: number;
    alphaMode: boolean;
    mediaMode: 'fit' | 'free';
    mediaOffset: { x: number; y: number; scale: number };
    effects: string[]; // effect indices that are enabled
  };
  resources: {
    media?: { name: string; type: string; blobId: string };
    audio?: { name: string; type: string; blobId: string };
    lrc?: { name: string; content: string };
  };
  exportedAt: number;
}

const PROJECT_VERSION = '1.0.0';
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

export async function exportProject(options: {
  template: string | number;
  templateConfig?: TemplateConfig;
  canvasColor: string | null;
  text: string;
  segmentDuration: number;
  animationSpeed: number;
  motionIntensity: number;
  effectOpacity: number;
  postfx: {
    shake: number;
    zoom: number;
    tilt: number;
    glitch: number;
    hueShift: number;
  };
  beatReactivity: number;
  bpm: number;
  alphaMode: boolean;
  mediaMode: 'fit' | 'free';
  mediaOffset: { x: number; y: number; scale: number };
  effects: string[];
  mediaFile?: File | null;
  audioFile?: File | null;
  lrcContent?: string | null;
  lrcFileName?: string;
}): Promise<Blob> {
  const zip = new JSZip();
  const project: ProjectFile = {
    version: PROJECT_VERSION,
    config: {
      template: options.template,
      templateConfig: options.templateConfig,
      canvasColor: options.canvasColor,
      text: options.text,
      segmentDuration: options.segmentDuration,
      animationSpeed: options.animationSpeed,
      motionIntensity: options.motionIntensity,
      effectOpacity: options.effectOpacity,
      postfx: options.postfx,
      beatReactivity: options.beatReactivity,
      bpm: options.bpm,
      alphaMode: options.alphaMode,
      mediaMode: options.mediaMode,
      mediaOffset: options.mediaOffset,
      effects: options.effects,
    },
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
      blobId: '', // 不存储 blobId，直接打包文件
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
  
  if (project.version !== PROJECT_VERSION) {
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