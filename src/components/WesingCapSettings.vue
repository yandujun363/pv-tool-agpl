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
    <GlobalModal ref="modalRef" :close-on-overlay="false" modal-class="nwc-settings-box">
        <p class="pv-modal-title">{{ t('nwc_settings_title') }}</p>
        <label class="nwc-addr-label">{{ t('nwc_ws_addr') }}</label>
        <input type="text" class="nwc-addr-input" v-model="address" :placeholder="t('nwc_ws_addr_placeholder')" />

        <div class="nwc-settings-branding">
            <a href="https://vtb.link/wesingcap" target="_blank" rel="noopener">
                VTB-TOOLS Metabox Nexus WesingCap
            </a>
            <span class="nwc-powered-by">
                Powered by
                <a href="https://space.bilibili.com/40879764" target="_blank" rel="noopener">
                    VTB-LIVE &amp; VTB-LINK
                </a>
            </span>
        </div>

        <template #footer>
            <button class="btn pv-modal-cancel" @click="cancel">{{ t('cancel') }}</button>
            <button class="btn pv-modal-confirm" @click="save">{{ t('nwc_save') }}</button>
        </template>
    </GlobalModal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { t } from '../i18n';
import GlobalModal from './GlobalModal.vue';

const emit = defineEmits<{
    save: [address: string];
}>();

const modalRef = ref<InstanceType<typeof GlobalModal>>();
const address = ref('');

const open = (currentAddr: string = '') => {
    address.value = currentAddr;
    return modalRef.value?.open();
};

const save = () => {
    emit('save', address.value.trim());
    modalRef.value?.close();
};

const cancel = () => {
    modalRef.value?.close();
};

defineExpose({ open });
</script>