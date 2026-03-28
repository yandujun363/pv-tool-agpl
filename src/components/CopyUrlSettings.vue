<!-- src/components/CopyUrlSettings.vue -->
<template>
    <GlobalModal ref="modalRef">
        <p class="pv-modal-title">{{ t('copy_url_settings') }}</p>
        <label class="effect-toggle" style="margin-bottom: 8px">
            <input type="checkbox" v-model="includeBg" />
            <span>{{ t('copy_url_transparent_bg') }}</span>
        </label>
        <label class="effect-toggle" style="margin-bottom: 8px">
            <input type="checkbox" v-model="includeTemplate" />
            <span>{{ t('copy_url_use_template') }}</span>
        </label>

        <template #footer>
            <button class="btn pv-modal-confirm" @click="copyUrl">
                {{ t('copy_url_copy_btn') }}
            </button>
        </template>
    </GlobalModal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { t } from '../i18n';
import GlobalModal from './GlobalModal.vue';

const props = defineProps<{
    templateValue: string;
    npEnabled: boolean;
    nwcEnabled?: boolean;
    nwcAddress?: string;
}>();

const emit = defineEmits<{
    copy: [url: string];
}>();

const modalRef = ref<InstanceType<typeof GlobalModal>>();
const includeBg = ref(true);
const includeTemplate = ref(true);

const open = () => {
    return modalRef.value?.open();
};

const copyUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('panel', '0');
    if (includeBg.value) params.set('bg', '0');
    if (includeTemplate.value) params.set('t', props.templateValue);
    if (props.npEnabled) params.set('np', '1');
    if (props.nwcEnabled) {
        params.set('metabox-nexus-wesingcap', '1');
        if (props.nwcAddress?.trim()) {
            params.set('metabox-nexus-wesingcap-addr', props.nwcAddress);
        }
    }
    const url = baseUrl + '?' + params.toString();

    emit('copy', url);
    modalRef.value?.close();
};

defineExpose({ open });
</script>