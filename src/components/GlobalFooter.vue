<template>
    <footer class="global-footer">
        <div class="footer-content">
            <span>{{ t("license_copyright") }}</span>
            <span class="footer-links">
                <a href="https://github.com/yandujun363/pv-tool-agpl" target="_blank" rel="noopener noreferrer">{{
                    t("license_source") }}</a>
                <a href="https://www.gnu.org/licenses/agpl-3.0.txt" target="_blank"
                    rel="noopener noreferrer">AGPL-3.0</a>
            </span>
        </div>
    </footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { t } from "../i18n";

export default defineComponent({
    name: "GlobalFooter",
    setup() {
        return { t };
    },
});
</script>