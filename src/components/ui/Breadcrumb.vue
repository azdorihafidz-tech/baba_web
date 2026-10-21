<template>
  <v-breadcrumbs density="compact" class="baba-breadcrumb mb-4">
    <template v-slot:divider>
      <v-icon icon="mdi-chevron-right" size="16"></v-icon>
    </template>
  </v-breadcrumbs>
</template>

<style scoped>
.baba-breadcrumb {
  padding: 4px 2px !important;
  font-size: 0.85rem;
  color: var(--baba-muted);
}

.baba-breadcrumb :deep(.v-breadcrumbs-item) {
  padding: 0 2px;
}

.baba-breadcrumb :deep(.v-breadcrumbs-item:last-child) {
  color: var(--baba-text);
  font-weight: 700;
  opacity: 1;
}

.baba-breadcrumb :deep(.v-breadcrumbs-divider) {
  color: var(--baba-gold-dark);
  padding: 0 4px;
}
</style>
