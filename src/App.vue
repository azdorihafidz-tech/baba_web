<template>
  <router-view />
  <Snackbar v-model="this.app.snackbar.show" :color="this.app.snackbar.color" :timeout="this.app.snackbar.timeout"
    :text="this.app.snackbar.text" />
</template>
<script>
import { useAppStore } from "@/stores/app.js";
import Snackbar from "@/components/ui/Snackbar.vue";

export default {
  components: {
    Snackbar,
  },

  setup() {
    const app = useAppStore();

    return {
      app,
    };
  },
};
</script>
