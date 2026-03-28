<!-- src/components/GlobalModal.vue -->
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