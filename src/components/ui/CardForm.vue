<template>
  <v-card class="baba-form-card">
    <v-toolbar flat color="#141414" class="baba-form-toolbar">
      <v-toolbar-title class="toolbar-title">{{ title }}</v-toolbar-title>
    </v-toolbar>
    <v-card-text class="px-5 px-sm-8 pt-6">
      <slot name="content" />
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions class="px-5 py-3">
      <v-spacer></v-spacer>
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    title: String,
  },
};
</script>

<style scoped>
.baba-form-toolbar {
  border-bottom: 2px solid var(--baba-gold);
}

.toolbar-title {
  color: var(--baba-gold-light);
  font-weight: 700;
  letter-spacing: 0.04em;
}
</style>
