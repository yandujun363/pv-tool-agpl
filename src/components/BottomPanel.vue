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
    <div class="controls controls-bottom" id="custom-panel" style="display: none">
        <details class="collapsible-section" open>
            <summary class="panel-title">{{ t("effects_library") }}</summary>
            <div class="control-group">
                <div class="template-actions">
                    <button class="btn btn-sm" id="tpl-save" :title="t('save_tpl')">
                        {{ t("save_tpl") }}
                    </button>
                    <button class="btn btn-sm" id="tpl-import" :title="t('import_code')">
                        {{ t("import_code") }}
                    </button>
                </div>
            </div>
            <div class="control-group" id="tpl-save-input" style="display: none">
                <div class="tpl-inline-input">
                    <input type="text" id="tpl-name-input" :placeholder="t('tpl_name_placeholder')" />
                    <button class="btn btn-sm" id="tpl-save-ok">
                        {{ t("confirm") }}
                    </button>
                    <button class="btn btn-sm" id="tpl-save-cancel">
                        {{ t("cancel") }}
                    </button>
                </div>
            </div>
            <div class="control-group" id="share-code-group" style="display: none">
                <label id="share-code-label">{{ t("share_code") }}</label>
                <input type="text" id="share-code-text" :placeholder="t('paste_code')" />
                <div class="template-actions">
                    <button class="btn btn-sm" id="share-code-ok">
                        {{ t("confirm") }}
                    </button>
                    <button class="btn btn-sm" id="share-code-cancel">
                        {{ t("cancel") }}
                    </button>
                </div>
            </div>
            <div id="effect-grid">
                <template v-for="(items, cat) in effectCategories" :key="cat">
                    <details class="effect-category" open>
                        <summary class="effect-category-title">
                            {{ t(`ecat_${cat}`) || cat }}
                        </summary>
                        <div class="effect-grid">
                            <label v-for="item in items" :key="item.idx" class="effect-toggle">
                                <input type="checkbox" :data-effect-idx="item.idx" />
                                <span>{{ t(item.key) || item.fallback }}</span>
                            </label>
                        </div>
                    </details>
                </template>
            </div>
        </details>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { t } from "../i18n";
import { effectCategories } from "../app";

export default defineComponent({
    name: "BottomPanel",
    setup() {
        return {
            effectCategories,
            t,
        };
    },
});
</script>