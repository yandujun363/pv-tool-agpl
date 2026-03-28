// src/composables/useToast.ts
import { createApp } from 'vue';
import Toast from '../components/Toast.vue';

let toastInstance: any = null;

export function showToast(message: string, duration?: number) {
  if (toastInstance) {
    toastInstance.close?.();
  }
  
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  const app = createApp(Toast, {
    message,
    duration,
    onClose: () => {
      app.unmount();
      container.remove();
      toastInstance = null;
    }
  });
  
  toastInstance = app.mount(container);
}