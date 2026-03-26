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

import type { TemplateConfig } from '../core/types';
import { blueBoldTemplate } from './blueBold';
import { kineticSplitTemplate } from './kineticSplit';
import { bluePlaneTemplate } from './bluePlane';
import { rainCityTemplate } from './rainCity';
import { geometricTemplate } from './geometric';
import { cyberpunkHudTemplate } from './cyberpunkHud';
import { emotionCinemaTemplate } from './emotionCinema';
import { hystericNightTemplate } from './hystericNight';
import { cyberGrungeTemplate } from './cyberGrunge';
import { spiderWebTemplate } from './spiderWeb';
import { staggeredTextTplTemplate } from './staggeredTextTpl';
import { calmVillainTemplate } from './calmVillain';
import { girlyCloudTemplate } from './girlyClouds';
import { sweetPinkTemplate } from './sweetPink';
import { flyMeToTheMoonTemplate } from './flyMeToTheMoon';
import { kawaiPixelTemplate } from './kawaiPixel';

export const templates: TemplateConfig[] = [
  blueBoldTemplate,          // 0  蓝色冲击
  kineticSplitTemplate,      // 1  斩击
  bluePlaneTemplate,         // 2  蓝色构成(建议配合视频使用)
  cyberGrungeTemplate,       // 3  赛博废墟
  geometricTemplate,         // 4  几何
  rainCityTemplate,          // 5  黑客帝国
  cyberpunkHudTemplate,      // 6  夜之城监控(建议配合视频使用)
  emotionCinemaTemplate,     // 7  情绪电影(建议配合视频使用)
  hystericNightTemplate,     // 8  歇斯底里之夜(光敏慎点)
  spiderWebTemplate,         // 9  蛛网
  staggeredTextTplTemplate,  // 10 错落文字
  calmVillainTemplate,       // 11 冷静的反派
  girlyCloudTemplate,        // 12 少女云朵
  sweetPinkTemplate,         // 13 格子花边
  flyMeToTheMoonTemplate,    // 14 Fly Me to the Moon
  kawaiPixelTemplate,        // 15 Kawaii像素
];

export function getTemplate(name: string): TemplateConfig | undefined {
  return templates.find(t => t.name === name);
}