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
    <footer class="global-footer">
        <div class="footer-content">
            <span>{{ t("license_copyright") }}</span>
            <span class="footer-links">
                <a href="https://github.com/yandujun363/pv-tool-agpl" target="_blank" rel="noopener noreferrer">{{
                    t("license_source") }}</a>
                <a href="https://www.gnu.org/licenses/agpl-3.0.txt" target="_blank"
                    rel="noopener noreferrer">AGPL-3.0</a>
            </span>
        </div>
    </footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { t } from "../i18n";

export default defineComponent({
    name: "GlobalFooter",
    setup() {
        return { t };
    },
});
</script>