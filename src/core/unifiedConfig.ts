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

import type { ColorPalette, EffectEntry, MotionTargetInfo, LyricLine } from './types';
import type { NowPlayingTrack } from './nowPlayingProvider';

/**
 * 完整的 PV Tool 运行时配置
 * 包含所有引擎状态、特效参数、播放状态等
 */
export interface UnifiedConfig {
  // ========== 模板相关 ==========
  template: {
    name: string;
    palette: ColorPalette;
    effects: EffectEntry[];
    bpm: number;
    animationSpeed: number;
    bgOpacity: number;
    postfx: {
      shake: number;
      zoom: number;
      tilt: number;
      glitch: number;
      hueShift: number;
    };
    features: {
      mediaOutline: boolean;
      autoExtractColors: boolean;
      motionDetection: boolean;
      invertMedia: boolean;
      thresholdMedia: boolean;
    };
  };

  // ========== 播放控制 ==========
  playback: {
    time: number;           // 当前播放时间 (秒)
    paused: boolean;        // 是否暂停
    duration: number;       // 总时长 (秒)
  };

  // ========== 文本内容 ==========
  text: {
    userText: string;       // 用户输入的原始文本
    textSegments: string[]; // 分割后的文本片段
    currentText: string;    // 当前显示的文本
    segmentDuration: number; // 片段切换时长
  };

  // ========== 歌词相关 ==========
  lyric: {
    timeline: LyricLine[] | null;
    offset: number;         // 时间偏移 (秒)
    srtTimeline: { startMs: number; endMs: number; text: string }[] | null;
  };

  // ========== 节拍相关 ==========
  beat: {
    bpm: number;
    reactivity: number;     // 响应强度 0-1
    useAudio: boolean;      // 是否使用音频分析
    currentIntensity: number; // 当前节拍强度
  };

  // ========== 媒体相关 ==========
  media: {
    hasMedia: boolean;
    type: 'image' | 'video' | null;
    url: string | null;
    offsetX: number;
    offsetY: number;
    scale: number;
    mode: 'fit' | 'free';
  };

  // ========== 视觉效果 ==========
  effects: {
    alphaMode: boolean;     // 透明背景模式
    effectOpacity: number;  // 效果层透明度
    motionIntensity: number; // 运动响应强度
    beatReactivity: number;  // 节拍响应强度 (已在 beat 中)
  };

  // ========== 后期特效 ==========
  postfx: {
    shake: number;
    zoom: number;
    tilt: number;
    glitch: number;
    hueShift: number;
  };

  // ========== 功能开关 ==========
  features: {
    mediaOutline: boolean;
    autoExtractColors: boolean;
    motionDetection: boolean;
    invertMedia: boolean;
    thresholdMedia: boolean;
    alphaMode: boolean;
  };

  // ========== Now Playing 集成 ==========
  nowPlaying: {
    active: boolean;
    listening: boolean;
    track: NowPlayingTrack | null;
    time: number;
    duration: number;
    paused: boolean;
  };

  // ========== WesingCap 集成 ==========
  wesingCap: {
    active: boolean;
    listening: boolean;
    wsUrl: string | null;
    songTitle: string;
    time: number;
    duration: number;
    paused: boolean;
  };

  // ========== 渲染设置 ==========
  render: {
    screenWidth: number;
    screenHeight: number;
    resolution: number;
    canvasColor: string | null;
    targetResolution?: number | { width: number; height: number } | 'auto';
    targetFps?: number | 'auto';
    recordingFps?: number;
  };

  // ========== 运动检测 ==========
  motion: {
    enabled: boolean;
    targets: MotionTargetInfo[];
    intensity: number;
  };
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: UnifiedConfig = {
  template: {
    name: '',
    palette: {
      background: '#ffffff',
      primary: '#000000',
      secondary: '#666666',
      accent: '#ff0000',
      text: '#000000',
    },
    effects: [],
    bpm: 120,
    animationSpeed: 2,
    bgOpacity: 1,
    postfx: {
      shake: 0,
      zoom: 0,
      tilt: 0,
      glitch: 0,
      hueShift: 0,
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
    userText: '',
    textSegments: [''],
    currentText: '',
    segmentDuration: 3,
  },
  lyric: {
    timeline: null,
    offset: 0,
    srtTimeline: null,
  },
  beat: {
    bpm: 120,
    reactivity: 0.5,
    useAudio: false,
    currentIntensity: 0,
  },
  media: {
    hasMedia: false,
    type: null,
    url: null,
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    mode: 'fit',
  },
  effects: {
    alphaMode: false,
    effectOpacity: 1,
    motionIntensity: 1,
    beatReactivity: 0.5,
  },
  postfx: {
    shake: 0,
    zoom: 0,
    tilt: 0,
    glitch: 0,
    hueShift: 0,
  },
  features: {
    mediaOutline: false,
    autoExtractColors: false,
    motionDetection: false,
    invertMedia: false,
    thresholdMedia: false,
    alphaMode: false,
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
    canvasColor: null,
    targetResolution: 'auto',
    targetFps: 'auto',
    recordingFps: 60,
  },
  motion: {
    enabled: false,
    targets: [],
    intensity: 1,
  },
};