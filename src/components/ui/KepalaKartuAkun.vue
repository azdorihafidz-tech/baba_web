<template>
  <!-- Kepala kartu akun di HP (gaya baris Mutasi): jabatan + No ID + cabang, nama, lalu info (mis. jalur atasan).
       Kartu dibuka/ditutup oleh induknya; slot "tambahan" untuk chip status dsb. -->
  <div class="kka">
    <span v-if="nomor != null" class="kka-no">{{ nomor }}</span>
    <div class="kka-teks">
      <div class="kka-atas">
        <span v-if="jabatan" class="kka-badge">{{ jabatan }}</span>
        <span class="kka-noid">{{ noId || 'tanpa No ID' }}</span>
        <span v-if="cabang" class="kka-cab">{{ cabang }}</span>
      </div>
      <div class="kka-nama">{{ nama }}</div>
      <div v-if="info" class="kka-info">{{ info }}</div>
      <slot name="tambahan" />
    </div>
    <v-icon class="kka-panah" :class="{ terbuka }">mdi-chevron-down</v-icon>
  </div>
</template>

<script setup>
defineProps({
  nomor: [Number, String],
  jabatan: String,
  noId: String,
  cabang: String,
  nama: String,
  info: String,
  terbuka: Boolean,
});
</script>

<style scoped>
.kka {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
}

.kka-no {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  min-width: 26px;
  height: 26px;
  padding: 0 4px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--baba-gold-dark);
  background: var(--baba-gold-soft);
}

.kka-teks {
  flex: 1;
  min-width: 0;
}

.kka-atas {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kka-badge {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--baba-ink);
  color: var(--baba-gold-light);
  white-space: nowrap;
}

.kka-noid {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--baba-gold-dark);
  white-space: nowrap;
}

.kka-cab {
  margin-left: auto;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--baba-muted);
}

.kka-nama {
  margin-top: 2px;
  font-weight: 700;
  color: var(--baba-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kka-info {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  color: var(--baba-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kka-panah {
  flex-shrink: 0;
  color: var(--baba-gold-dark);
  transition: transform 0.2s;
}

.kka-panah.terbuka {
  transform: rotate(180deg);
}
</style>
