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
    <div class="controls controls-right">
        <details class="collapsible-section" open>
            <summary class="panel-title">{{ t("postfx") }}</summary>

            <div class="control-group">
                <label>{{ t("shake") }} <span id="shake-val">0</span></label>
                <input type="range" id="shake-slider" min="0" max="1" step="0.05" value="0" />
            </div>

            <div class="control-group">
                <label>{{ t("zoom") }} <span id="zoom-val">0</span></label>
                <input type="range" id="zoom-slider" min="-1" max="1" step="0.05" value="0" />
            </div>

            <div class="control-group">
                <label>{{ t("tilt") }} <span id="tilt-val">0°</span></label>
                <input type="range" id="tilt-slider" min="-1" max="1" step="0.05" value="0" />
            </div>

            <div class="control-group">
                <label>{{ t("glitch") }} <span id="glitch-val">0</span></label>
                <input type="range" id="glitch-slider" min="0" max="1" step="0.05" value="0" />
            </div>

            <div class="control-group">
                <label>{{ t("hue_shift") }} <span id="hue-val">0°</span></label>
                <input type="range" id="hue-slider" min="-180" max="180" step="5" value="0" />
            </div>

            <div class="control-group" id="media-pos-group" style="display: none">
                <label>{{ t("media_position") }}</label>
                <div class="slider-row">
                    <span class="slider-label">{{ t("offset_x") }}</span>
                    <input type="range" id="media-x" min="-500" max="500" step="5" value="0" />
                    <span id="media-x-val">0</span>
                </div>
                <div class="slider-row">
                    <span class="slider-label">{{ t("offset_y") }}</span>
                    <input type="range" id="media-y" min="-500" max="500" step="5" value="0" />
                    <span id="media-y-val">0</span>
                </div>
                <div class="slider-row">
                    <span class="slider-label">{{ t("scale") }}</span>
                    <input type="range" id="media-scale" min="0.5" max="3" step="0.05" value="1" />
                    <span id="media-scale-val">1.0x</span>
                </div>
            </div>
        </details>

        <details class="collapsible-section" open>
            <summary class="panel-title">{{ t("render") }}</summary>

            <div class="control-group">
                <label>{{ t("render_scale_mode") }}</label>
                <select id="scale-mode-select">
                    <option value="contain">{{ t("scale_mode_contain") }}</option>
                    <option value="stretch">{{ t("scale_mode_stretch") }}</option>
                </select>
            </div>

            <div class="control-group">
                <label>{{ t("render_resolution") }}</label>
                <div class="resolution-controls">
                    <select id="resolution-select">
                        <option value="auto">{{ t("render_resolution_auto") }}</option>
                        <option value="1">{{ t("render_resolution_1x") }}</option>
                        <option value="1.5">{{ t("render_resolution_1_5x") }}</option>
                        <option value="2">{{ t("render_resolution_2x") }}</option>
                        <option value="custom">
                            {{ t("render_resolution_custom") }}
                        </option>
                    </select>
                    <div id="custom-resolution-group" class="custom-resolution" style="display: none">
                        <input type="number" id="custom-width" :placeholder="t('render_resolution_width')" step="1"
                            min="320" />
                        <span class="resolution-sep">x</span>
                        <input type="number" id="custom-height" :placeholder="t('render_resolution_height')" step="1"
                            min="240" />
                        <button class="btn btn-sm" id="apply-resolution-btn">
                            {{ t("render_resolution_apply") }}
                        </button>
                    </div>
                </div>
            </div>

            <div class="control-group">
                <label>{{ t("render_fps") }} <span id="fps-current">(auto)</span></label>
                <div class="fps-controls">
                    <select id="fps-select">
                        <option value="auto">{{ t("render_fps_auto") }}</option>
                        <option value="30">{{ t("render_fps_30") }}</option>
                        <option value="60">{{ t("render_fps_60") }}</option>
                        <option value="custom">{{ t("render_fps_custom") }}</option>
                    </select>
                    <div id="custom-fps-group" class="custom-fps" style="display: none">
                        <input type="number" id="custom-fps" :placeholder="t('render_fps_value')" step="1" min="15"
                            max="240" />
                        <button class="btn btn-sm" id="apply-fps-btn">
                            {{ t("render_resolution_apply") }}
                        </button>
                    </div>
                </div>
            </div>
        </details>

        <details class="collapsible-section" open>
            <summary class="panel-title">{{ t("export") }}</summary>

            <div class="control-group">
                <label class="effect-toggle">
                    <input type="checkbox" id="alpha-toggle" />
                    <span>{{ t("alpha_export") }}</span>
                </label>
            </div>

            <div class="control-group rec-group">
                <button id="rec-btn" class="btn rec-btn" :title="t('rec')">
                    <span class="rec-icon"></span>
                    <span id="rec-label">{{ t("rec") }}</span>
                </button>
                <span id="rec-timer" class="rec-timer" style="display: none"></span>
            </div>

            <div class="control-group">
                <div class="template-actions" style="gap: 8px; margin-top: 8px">
                    <button class="btn btn-sm" id="export-project-btn">
                        {{ t("export_project") }}
                    </button>
                    <button class="btn btn-sm" id="import-project-btn">
                        {{ t("import_project") }}
                    </button>
                </div>
            </div>
        </details>

        <details class="collapsible-section" open>
            <summary class="panel-title">{{ t("listen") }}</summary>

            <div class="control-group">
                <label class="effect-toggle nwc-toggle-row">
                    <input type="checkbox" id="nwc-listen-toggle" />
                    <span>{{ t("listen_wesingcap") }}</span>
                    <span class="help-tip" :data-tip="t('listen_wesingcap_tip')">?</span>
                    <button type="button" class="nwc-gear-btn" id="nwc-gear-btn" :title="t('nwc_settings_title')">
                        &#9881;
                    </button>
                </label>
            </div>

            <div class="control-group">
                <label class="effect-toggle">
                    <input type="checkbox" id="np-listen-toggle" />
                    <span>{{ t("listen_now_playing") }}</span>
                    <span class="help-tip" :data-tip="t('listen_np_tip')">?</span>
                </label>
            </div>

            <div class="control-group copy-url-row">
                <button id="copy-url-btn" class="btn copy-url-btn" :title="t('copy_url')">
                    {{ t("copy_url") }}
                </button>
                <span class="help-tip" :data-tip="t('copy_url_tip')">?</span>
            </div>
        </details>

        <div class="license-notice">
            <div class="license-title">{{ t("license_title") }}</div>
            <div class="license-text">
                {{ t("license_text") }}<br />
                {{ t("license_source") }}：
                <a href="https://github.com/yandujun363/pv-tool-agpl" target="_blank" rel="noopener noreferrer">
                    github.com/yandujun363/pv-tool-agpl
                </a>
            </div>
            <div class="license-copyright">
                {{ t("license_copyright") }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { t } from "../i18n";

export default defineComponent({
    name: "RightPanel",
    setup() {
        return { t };
    },
});
</script>