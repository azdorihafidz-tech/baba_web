<template>
</template>

<script>
import { useAppStore } from "@/stores/app.js";

export default {
  setup() {
    const app = useAppStore();

    return {
      app,
    };
  },
};
</script>
