// src/plugins/modal.ts
import type { App } from 'vue';
import GlobalModal from '../components/GlobalModal.vue';

export default {
  install(app: App) {
    // 注册全局组件
    app.component('GlobalModal', GlobalModal);
  }
};