<template>
  <div class="panels-wrapper" id="panels-wrapper">
    <ControlPanel />
    <RightPanel />
    <BottomPanel />
  </div>

  <MobileToggle />

  <div id="pv-container"></div>

  <InitOverlay />

  <GlobalFooter />
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import ControlPanel from "./components/ControlPanel.vue";
import RightPanel from "./components/RightPanel.vue";
import BottomPanel from "./components/BottomPanel.vue";
import MobileToggle from "./components/MobileToggle.vue";
import InitOverlay from "./components/InitOverlay.vue";
import GlobalFooter from "./components/GlobalFooter.vue";
import { initApp } from "./app";

export default defineComponent({
  name: "App",
  components: {
    ControlPanel,
    RightPanel,
    BottomPanel,
    MobileToggle,
    InitOverlay,
    GlobalFooter,
  },
  setup() {
    onMounted(() => {
      initApp();
    });
  },
});
</script>