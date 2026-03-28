<template>
    <div id="init-overlay" class="init-overlay" style="display: flex">
        <div class="init-card">
            <div class="init-spinner"></div>
            <div class="init-text">
                <div class="init-title">{{ t("initializing") }}</div>
                <div class="init-desc">{{ t("initializing_desc") }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { t } from "../i18n";

export default defineComponent({
    name: "InitOverlay",
    setup() {
        return { t };
    },
});
</script>