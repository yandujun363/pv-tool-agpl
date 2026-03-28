<!-- src/components/WesingCapSettings.vue -->
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