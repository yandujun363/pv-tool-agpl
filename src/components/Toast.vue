<!-- src/components/Toast.vue -->
<template>
    <div v-if="visible" class="pv-toast">
        {{ message }}
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

const props = defineProps<{
    message: string;
    duration?: number;
}>();

const emit = defineEmits<{
    close: [];
}>();

const visible = ref(true);

onMounted(() => {
    setTimeout(() => {
        visible.value = false;
        setTimeout(() => emit('close'), 300);
    }, props.duration || 2200);
});
</script>