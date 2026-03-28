// src/composables/useFileImport.ts
import { ref } from "vue";

export function useFileImport() {
  const inputRef = ref<HTMLInputElement>();
  const file = ref<File | null>(null);

  const trigger = () => {
    inputRef.value?.click();
  };

  const handleChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    file.value = target.files?.[0] || null;
  };

  return {
    inputRef,
    file,
    trigger,
    handleChange,
  };
}
