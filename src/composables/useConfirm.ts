// src/composables/useConfirm.ts
import { createApp } from 'vue';
import GlobalModal from '../components/GlobalModal.vue';

export function showConfirm(options: {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    const app = createApp(GlobalModal, {
      title: options.title || '',
      message: options.message,
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      showCancel: true,
      onConfirm: () => {
        app.unmount();
        container.remove();
        resolve(true);
      },
      onCancel: () => {
        app.unmount();
        container.remove();
        resolve(false);
      },
      onClose: () => {
        app.unmount();
        container.remove();
        resolve(false);
      }
    });
    
    const instance = app.mount(container);
    
    // 自动打开模态框
    if (instance && (instance as any).open) {
      (instance as any).open();
    }
  });
}