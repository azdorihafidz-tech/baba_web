<template>
  <v-card class="mt-2 baba-table-card" elevation="0">
    <div class="baba-table-head">
      <span class="baba-table-title">{{ title }}</span>
    </div>
    <div class="baba-table-search">
      <slot name="search" />
    </div>
    <div class="baba-table-body">
      <slot name="datatable" />
    </div>
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
.baba-table-card {
  border: 1px solid var(--baba-border);
  border-radius: var(--baba-radius) !important;
  box-shadow: var(--baba-shadow) !important;
  overflow: hidden;
}

.baba-table-head {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  background: var(--baba-ink);
  border-bottom: 2px solid var(--baba-gold);
}

.baba-table-title {
  color: var(--baba-gold-light);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.04em;
}

.baba-table-search {
  padding: 14px 18px 4px;
}

.baba-table-search:empty {
  display: none;
}

.baba-table-body {
  padding: 0;
}

@media (max-width: 599.98px) {
  .baba-table-head {
    padding: 12px 14px;
  }

  .baba-table-title {
    font-size: 0.95rem;
  }

  .baba-table-search {
    padding: 12px 14px 0;
  }
}
</style>
