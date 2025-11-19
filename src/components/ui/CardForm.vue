<template>
  <v-card color="#fff5e1">
    <v-toolbar flat color="#ea252e" dark class="mb-1">
      <v-toolbar-title class="toolbar-title">{{ title }}</v-toolbar-title>
    </v-toolbar>
    <v-card-text class="px-8 pt-6">
      <slot name="content" />
    </v-card-text>
    <v-divider color="#000000" thickness="3"></v-divider>
    <v-card-actions>
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
.toolbar-title {
  letter-spacing: 1.5px;
}
</style>
