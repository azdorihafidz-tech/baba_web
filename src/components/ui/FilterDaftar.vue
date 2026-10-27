<template>
  <!-- Baris filter daftar (seragam di semua menu daftar): kolom cari, pilihan cabang,
       tombol status (opsional), dan tombol jabatan dengan jumlahnya. -->
  <div class="fd">
    <div class="fd-baris">
      <v-text-field v-model="teks" :placeholder="placeholder" density="compact" variant="outlined" hide-details
        clearable prepend-inner-icon="mdi-magnify" class="fd-cari" />
      <v-select v-if="daftarCabang.length > 1" :model-value="cabang || 'Semua'" :items="['Semua', ...daftarCabang]"
        density="compact" variant="outlined" hide-details label="Cabang" class="fd-cabang"
        @update:model-value="emit('update:cabang', $event === 'Semua' ? '' : $event)" />
    </div>

    <div v-if="daftarStatus.length" class="fd-chips">
      <button v-for="s in daftarStatus" :key="String(s.value)" type="button" class="fd-chip fd-chip--status"
        :class="{ aktif: String(status ?? '') === String(s.value ?? '') }" @click="emit('update:status', s.value)">
        {{ s.label }} <b v-if="s.jumlah != null">{{ s.jumlah }}</b>
      </button>
    </div>

    <div v-if="daftarJabatan.length" class="fd-chips">
      <button type="button" class="fd-chip" :class="{ aktif: !jabatan }" @click="emit('update:jabatan', null)">
        Semua <b>{{ totalJabatan }}</b>
      </button>
      <button v-for="j in daftarJabatan" :key="j.id" type="button" class="fd-chip"
        :class="{ aktif: String(jabatan) === String(j.id) }" @click="emit('update:jabatan', j.id)">
        {{ j.name }} <b>{{ j.jumlah }}</b>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  q: { type: String, default: "" }, // v-model:q (dikirim 350 ms setelah berhenti mengetik)
  jabatan: [String, Number], // v-model:jabatan (id tbl_mvo_type, null = semua)
  cabang: { type: String, default: "" }, // v-model:cabang ('' = semua)
  status: [String, Number], // v-model:status (opsional)
  daftarJabatan: { type: Array, default: () => [] }, // [{ id, name, jumlah }]
  daftarCabang: { type: Array, default: () => [] }, // ['BDG', 'MDN', …] — disembunyikan bila hanya satu
  daftarStatus: { type: Array, default: () => [] }, // [{ value, label, jumlah }]
  placeholder: { type: String, default: "Cari nama / No ID" },
});
const emit = defineEmits(["update:q", "update:jabatan", "update:cabang", "update:status"]);

const teks = ref(props.q);
const totalJabatan = computed(() => props.daftarJabatan.reduce((n, j) => n + Number(j.jumlah || 0), 0));

let tunda;
watch(teks, (v) => {
  clearTimeout(tunda);
  tunda = setTimeout(() => emit("update:q", v || ""), 350);
});
watch(() => props.q, (v) => {
  if ((v || "") !== (teks.value || "")) teks.value = v;
});
</script>

<style scoped>
.fd-baris {
  display: flex;
  gap: 8px;
}

.fd-cari {
  flex: 1;
}

.fd-cabang {
  flex: 0 0 140px;
}

/* Tombol turun ke baris berikut bila tidak muat: semua jabatan selalu terlihat
   (dulu digeser ke samping tanpa scrollbar, tidak bisa digeser dengan mouse di layar sempit) */
.fd-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.fd-chip {
  flex-shrink: 0;
  border: 1px solid var(--baba-border);
  background: #fff;
  color: var(--baba-text);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.15s;
}

.fd-chip b {
  margin-left: 4px;
  color: var(--baba-gold-dark);
}

.fd-chip.aktif {
  background: var(--baba-ink);
  border-color: var(--baba-ink);
  color: var(--baba-gold-light);
}

.fd-chip.aktif b {
  color: #fff;
}

.fd-chip--status.aktif {
  background: var(--baba-gold);
  border-color: var(--baba-gold);
  color: var(--baba-ink);
}

.fd-chip--status.aktif b {
  color: var(--baba-ink);
}

@media (max-width: 599.98px) {
  .fd-baris {
    flex-wrap: wrap;
  }

  .fd-cabang {
    flex: 1 1 100%;
  }
}
</style>
