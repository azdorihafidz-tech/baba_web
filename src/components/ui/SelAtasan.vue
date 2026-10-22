<template>
  <!-- Isi sel kolom atasan: No ID (emas, tebal) lalu nama. Data lama tanpa No ID menampilkan kodenya. -->
  <div v-if="atasan" class="sel-atasan">
    <span class="sel-noid">{{ atasan.no_id || atasan.kode || '-' }}</span>
    <span class="sel-nama">{{ atasan.nama }}</span>
  </div>
  <span v-else class="sel-kosong">-</span>
</template>

<script setup>
defineProps({
  atasan: Object, // { no_id, nama, kode? } dari atasanPada() di utils/jalur.js
});
</script>

<style scoped>
.sel-atasan {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  padding: 4px 0;
}

.sel-noid {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--baba-gold-dark);
}

.sel-nama {
  font-size: 0.82rem;
  color: var(--baba-text);
}

.sel-kosong {
  color: var(--baba-muted);
}
</style>
