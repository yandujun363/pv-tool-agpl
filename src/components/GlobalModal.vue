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
    <Teleport to="body">
        <div v-if="visible" class="pv-modal-overlay" @click.self="handleOverlayClick">
            <div class="pv-modal-box" :class="modalClass">
                <div class="pv-modal-body">
                    <slot>
                        <p class="pv-modal-title">{{ title }}</p>
                        <p>{{ message }}</p>
                    </slot>
                </div>
                <div class="pv-modal-footer" v-if="showFooter">
                    <slot name="footer">
                        <button v-if="showCancel" class="btn pv-modal-cancel" @click="cancel">
                            {{ cancelText }}
                        </button>
                        <button class="btn pv-modal-confirm" @click="confirm">
                            {{ confirmText }}
                        </button>
                    </slot>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Props {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    closeOnOverlay?: boolean;
    modalClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
    title: '',
    message: '',
    confirmText: '确定',
    cancelText: '取消',
    showCancel: false,
    closeOnOverlay: true,
    modalClass: '',
});

const emit = defineEmits<{
    confirm: [];
    cancel: [];
    close: [];
}>();

const visible = ref(false);
let resolvePromise: ((value: boolean) => void) | null = null;
let rejectPromise: ((value: boolean) => void) | null = null;

const showFooter = computed(() => props.showCancel || props.confirmText);

const open = (): Promise<boolean> => {
    visible.value = true;
    return new Promise((resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
    });
};

const close = () => {
    visible.value = false;
    resolvePromise?.(false);
    resolvePromise = null;
    rejectPromise = null;
    emit('close');
};

const confirm = () => {
    visible.value = false;
    resolvePromise?.(true);
    resolvePromise = null;
    rejectPromise = null;
    emit('confirm');
};

const cancel = () => {
    visible.value = false;
    resolvePromise?.(false);
    resolvePromise = null;
    rejectPromise = null;
    emit('cancel');
};

const handleOverlayClick = () => {
    if (props.closeOnOverlay) {
        close();
    }
};

const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && visible.value) {
        close();
    }
};

onMounted(() => {
    document.addEventListener('keydown', handleEsc);
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleEsc);
});

defineExpose({ open, close, confirm, cancel });
</script>