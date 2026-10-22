<template>
  <!-- Daftar ringkas dengan batang proporsional (pengganti kotak-kotak besar di Dashboard):
       label · batang emas · angka (· persen). Baris bisa diklik untuk membuka rincian. -->
  <div class="db">
    <component :is="dapatDiklik ? 'button' : 'div'" v-for="it in items" :key="it.label" type="button" class="db-baris"
      :class="{ 'db-klik': dapatDiklik }" @click="dapatDiklik && emit('pilih', it)">
      <span class="db-label">{{ it.label }}</span>
      <span class="db-batang"><span class="db-isi" :style="{ width: lebar(it) }" /></span>
      <span class="db-angka">{{ format(it.jumlah) }}</span>
      <span v-if="tampilPersen" class="db-persen">{{ persen(it) }}</span>
      <v-icon v-if="dapatDiklik" size="16" class="db-panah">mdi-chevron-right</v-icon>
    </component>
    <div v-if="!items.length" class="db-kosong">{{ kosong }}</div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  items: { type: Array, default: () => [] }, // [{ label, jumlah }]
  tampilPersen: Boolean, // persen terhadap total semua baris
  dapatDiklik: { type: Boolean, default: true },
  kosong: { type: String, default: "Tidak ada data pada periode ini" },
});
const emit = defineEmits(["pilih"]);

const maks = computed(() => Math.max(1, ...props.items.map((i) => Number(i.jumlah) || 0)));
const total = computed(() => props.items.reduce((n, i) => n + (Number(i.jumlah) || 0), 0) || 1);
// Batang relatif terhadap nilai terbesar; minimal 2% supaya angka kecil tetap terlihat
const lebar = (it) => `${Math.max(2, ((Number(it.jumlah) || 0) / maks.value) * 100)}%`;
const persen = (it) => `${(((Number(it.jumlah) || 0) / total.value) * 100).toFixed(1)}%`;
const format = (n) => Number(n || 0).toLocaleString("id-ID");
</script>

<style scoped>
.db-baris {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  text-align: left;
  background: transparent;
  transition: background 0.12s;
}

.db-baris + .db-baris {
  border-top: 1px solid var(--baba-border);
}

.db-klik:hover {
  background: var(--baba-gold-soft);
}

.db-label {
  flex: 0 0 110px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--baba-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.db-batang {
  flex: 1;
  height: 10px;
  border-radius: 999px;
  background: var(--baba-gold-soft);
  overflow: hidden;
}

.db-isi {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--baba-gold-dark), var(--baba-gold));
}

.db-angka {
  flex: 0 0 auto;
  min-width: 48px;
  text-align: right;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--baba-text);
}

.db-persen {
  flex: 0 0 48px;
  text-align: right;
  font-size: 0.75rem;
  color: var(--baba-muted);
}

.db-panah {
  flex-shrink: 0;
  color: var(--baba-gold-dark);
}

.db-kosong {
  padding: 16px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--baba-muted);
}

@media (max-width: 599.98px) {
  .db-baris {
    gap: 8px;
    padding: 8px 6px;
  }

  .db-label {
    flex-basis: 78px;
    font-size: 0.74rem;
  }

  .db-angka {
    min-width: 40px;
    font-size: 0.88rem;
  }

  .db-persen {
    flex-basis: 40px;
  }
}
</style>
