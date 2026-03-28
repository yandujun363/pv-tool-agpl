<!--
  SPDX-License-Identifier: AGPL-3.0-only
  
  PV Tool — AGPL Community Edition
  Based on the last AGPL-3.0 version published on 2026-03-18
  
  Copyright (c) 2026 DanteAlighieri13210914
  Copyright (c) 2026 Contributors to PV Tool AGPL Community Edition
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published
  by the Free Software Foundation, version 3 of the License.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Affero General Public License for more details.
  
  You should have received a copy of the GNU Affero General Public License
  along with this program. If not, see <https://www.gnu.org/licenses/agpl-3.0.txt>.

  Source repository: https://github.com/yandujun363/pv-tool-agpl
-->

<template>
    <div class="controls">
        <details class="collapsible-section" open>
            <summary class="panel-title">{{ t("template") }}</summary>
            <div class="control-group">
                <select id="template-select">
                    <option v-for="(tp, i) in templates" :key="i" :value="i">
                        {{ tplNameLocal(tp) }}
                    </option>
                    <option value="custom">{{ t("custom") }}</option>
                </select>
                <div class="template-actions">
                    <button class="btn btn-sm" id="tpl-delete" :title="t('delete_tpl')" style="display: none">
                        {{ t("delete_tpl") }}
                    </button>
                    <button class="btn btn-sm" id="tpl-export" :title="t('export_code')" style="display: none">
                        {{ t("export_code") }}
                    </button>
                </div>
                <div id="tpl-delete-confirm" class="tpl-inline-input" style="display: none">
                    <span class="tpl-confirm-text" id="tpl-delete-text"></span>
                    <button class="btn btn-sm btn-danger" id="tpl-delete-ok">
                        {{ t("delete_tpl") }}
                    </button>
                    <button class="btn btn-sm" id="tpl-delete-cancel">
                        {{ t("cancel") }}
                    </button>
                </div>
            </div>

            <div class="control-group">
                <label>{{ t("canvas_color") }}</label>
                <div class="color-swatches" id="canvas-color-swatches">
                    <button class="swatch swatch-active" data-color="" :title="t('follow_template')">
                        <span class="swatch-auto">A</span>
                    </button>
                    <button class="swatch" data-color="#ffffff" :title="t('white')"
                        style="background: #ffffff"></button>
                    <button class="swatch" data-color="#000000" :title="t('black')"
                        style="background: #000000"></button>
                    <button class="swatch" data-color="#1122ee" :title="t('blue')" style="background: #1122ee"></button>
                    <button class="swatch" data-color="#8b1a1a" :title="t('red')" style="background: #8b1a1a"></button>
                    <button class="swatch" data-color="#EEDD11" :title="t('yellow')"
                        style="background: #eedd11"></button>
                    <button class="swatch" data-color="#f5c6d0" :title="t('pink')" style="background: #f5c6d0"></button>
                    <button class="swatch" data-color="#ED1C24" :title="t('p5red')"
                        style="background: #ed1c24"></button>
                </div>
            </div>

            <div class="control-group">
                <label>{{ t("text_label") }}</label>
                <textarea id="text-input" rows="1"
                    placeholder="深夜東京/の6畳半夢/を見てた/灯りの灯らない蛍光灯/明日には消えてる電脳城/に/開幕戦/打ち上げて/いなくなんないよね/ここには誰もいない/ここには誰もいないから"></textarea>
            </div>

            <div class="control-group">
                <label>{{ t("seg_duration") }} <span id="seg-val">3.0s</span></label>
                <input type="range" id="seg-slider" min="1" max="10" step="0.5" value="3" />
            </div>

            <div class="control-group">
                <label>{{ t("anim_speed") }} <span id="speed-val">2.0x</span></label>
                <input type="range" id="speed-slider" min="0" max="4" step="0.1" value="2" />
            </div>

            <div class="control-group">
                <label>{{ t("motion_intensity") }}
                    <span id="motion-val">1.0x</span></label>
                <input type="range" id="motion-slider" min="0" max="2" step="0.1" value="1" />
            </div>

            <div class="control-group">
                <label>{{ t("bg_opacity") }} <span id="opacity-val">100%</span></label>
                <input type="range" id="opacity-slider" min="0" max="1" step="0.05" value="1" />
            </div>

            <div class="control-group">
                <label>{{ t("media") }}</label>
                <div class="file-pick">
                    <button class="btn btn-sm" id="media-pick-btn">
                        {{ t("choose_file") }}
                    </button>
                    <span class="file-pick-name" id="media-pick-name">{{
                        t("no_file")
                        }}</span>
                    <input type="file" id="media-input" accept="image/*,video/mp4,video/webm,video/mov" hidden />
                </div>
            </div>

            <div class="control-group" id="media-mode-group" style="display: none">
                <label>{{ t("media_mode") }}</label>
                <select id="media-mode">
                    <option value="fit">{{ t("auto_fit") }}</option>
                    <option value="free">{{ t("free_mode") }}</option>
                </select>
                <button id="media-apply" class="btn">{{ t("apply") }}</button>
            </div>

            <div class="control-group">
                <label>{{ t("audio") }}</label>
                <div class="file-pick">
                    <button class="btn btn-sm" id="audio-pick-btn">
                        {{ t("choose_file") }}
                    </button>
                    <span class="file-pick-name" id="audio-pick-name">{{
                        t("no_file")
                        }}</span>
                    <input type="file" id="audio-input" accept="audio/*" hidden />
                </div>
            </div>

            <div class="control-group" id="audio-controls" style="display: none">
                <div class="audio-row">
                    <button id="audio-toggle" class="btn">{{ t("pause") }}</button>
                    <span id="audio-status" class="audio-status">{{
                        t("playing")
                        }}</span>
                </div>
            </div>

            <div class="control-group">
                <label>LRC</label>
                <div class="file-pick">
                    <button class="btn btn-sm" id="lrc-pick-btn">
                        {{ t("lrc_import") }}
                    </button>
                    <span class="file-pick-name" id="lrc-pick-name">{{
                        t("no_file")
                        }}</span>
                    <input type="file" id="lrc-input" accept=".lrc,text/plain" hidden />
                </div>
            </div>

            <div class="control-group">
                <label>{{ t("timer_label") }}
                    <span id="playback-time">00:00 / 00:00</span></label>
                <input type="range" id="seek-slider" min="0" max="1" step="0.001" value="0" />
            </div>

            <div class="control-group">
                <label>{{ t("bpm") }} <span id="bpm-val">120</span></label>
                <input type="range" id="bpm-slider" min="30" max="240" step="1" value="120" />
            </div>

            <div class="control-group">
                <label>{{ t("beat_react") }} <span id="beat-val">0.5</span></label>
                <input type="range" id="beat-slider" min="0" max="1" step="0.05" value="0.5" />
            </div>
        </details>

        <div class="hide-hint" id="hide-hint">
            {{ t("hint_press") }} <kbd>H</kbd> {{ t("hint_hide_panels") }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { templates } from "../templates";
import { t, locale } from "../i18n";
import { tplNameLocal } from "../app";

export default defineComponent({
    name: "ControlPanel",
    setup() {
        return {
            templates,
            locale,
            tplNameLocal,
            t,
        };
    },
});
</script>