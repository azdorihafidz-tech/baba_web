<template>
  <!-- Daftar member yang langsung tampil (tanpa harus mengetik), bisa dicari & disaring, dimuat bertahap saat digulir.
       Dipakai di Mutasi: langkah 1 (pilih member) dan langkah 2 (pilih atasan baru). -->
  <div class="dpm">
    <div class="dpm-filter">
      <v-text-field v-model="q" :placeholder="placeholder" density="compact" variant="outlined" hide-details
        clearable prepend-inner-icon="mdi-magnify" class="dpm-cari" />
      <v-select v-if="filterCabang" v-model="cabang" :items="pilihanCabang" density="compact" variant="outlined"
        hide-details label="Cabang" class="dpm-cabang" />
    </div>

    <div v-if="filterJabatan && meta.jabatan.length" class="dpm-chips">
      <button type="button" class="dpm-chip" :class="{ aktif: !jabatan }" @click="jabatan = null">
        Semua <b>{{ totalSemua }}</b>
      </button>
      <button v-for="j in meta.jabatan" :key="j.id" type="button" class="dpm-chip"
        :class="{ aktif: String(jabatan) === String(j.id) }" @click="jabatan = j.id">
        {{ j.name }} <b>{{ j.jumlah }}</b>
      </button>
    </div>

    <div class="dpm-daftar baba-gulir" @scroll="cekGulir">
      <button v-for="m in items" :key="m.id" type="button" class="dpm-baris"
        :class="{ aktif: terpilihId != null && String(m.id) === String(terpilihId) }" @click="emit('pilih', m)">
        <div class="dpm-teks">
          <div class="dpm-atas">
            <span class="dpm-badge">{{ m.jabatan }}</span>
            <span class="dpm-noid">{{ m.no_id || 'tanpa No ID' }}</span>
            <span v-if="m.cabang" class="dpm-cab">{{ m.cabang }}</span>
          </div>
          <div class="dpm-nama">{{ m.nama }}</div>
          <div class="dpm-info">
            Atasan: {{ m.atasan_nama ? `${m.atasan_nama} (${m.atasan_no_id || '-'})` : '—' }}
            · {{ m.jumlah_anggota || 0 }} anggota langsung
          </div>
        </div>
        <v-icon class="dpm-panah">{{ terpilihId != null && String(m.id) === String(terpilihId) ? 'mdi-check-circle' : 'mdi-chevron-right' }}</v-icon>
      </button>

      <div v-if="loading" class="dpm-status">
        <v-progress-circular indeterminate size="18" width="2" color="#B8890F" class="mr-2" /> Memuat…
      </div>
      <div v-else-if="!items.length" class="dpm-status">{{ kosong }}</div>
      <div v-else-if="adaLagi" class="dpm-status">
        <v-btn variant="text" size="small" color="#B8890F" @click="muat(false)">Muat lagi</v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";

const props = defineProps({
  api: { type: Function, required: true }, // instance axios dengan token
  url: { type: String, required: true },
  params: { type: Object, default: () => ({}) }, // parameter tetap (mis. mvo_type_id jabatan tujuan)
  filterJabatan: Boolean, // tombol filter jabatan (butuh ?meta=1 di endpoint)
  filterCabang: Boolean,
  terpilihId: [Number, String],
  placeholder: { type: String, default: "Cari nama / No ID" },
  kosong: { type: String, default: "Tidak ada data" },
});
const emit = defineEmits(["pilih"]);

const q = ref("");
const jabatan = ref(null);
const cabang = ref("Semua");
const items = ref([]);
const adaLagi = ref(false);
const loading = ref(false);
const meta = ref({ jabatan: [], cabang: [] });

const totalSemua = computed(() => meta.value.jabatan.reduce((n, j) => n + Number(j.jumlah), 0));
const pilihanCabang = computed(() => ["Semua", ...meta.value.cabang]);

let urut = 0;
async function muat(ulang) {
  const nomor = ulang ? ++urut : urut;
  const butuhMeta = props.filterJabatan && !meta.value.jabatan.length;
  loading.value = true;
  try {
    const { data } = await props.api.get(props.url, {
      params: {
        ...props.params,
        q: q.value || undefined,
        mvo_type_id: jabatan.value || props.params.mvo_type_id || undefined,
        cabang: cabang.value !== "Semua" ? cabang.value : undefined,
        offset: ulang ? 0 : items.value.length,
        limit: 30,
        meta: butuhMeta ? 1 : undefined,
      },
    });
    if (nomor !== urut) return; // abaikan respons lama
    items.value = ulang ? data.data : [...items.value, ...data.data];
    adaLagi.value = !!data.ada_lagi;
    if (data.meta) meta.value = data.meta;
  } catch (e) {
    if (nomor === urut) adaLagi.value = false;
  } finally {
    if (nomor === urut) loading.value = false;
  }
}

// Muat berikutnya otomatis saat digulir mendekati bawah
function cekGulir(e) {
  const el = e.target;
  if (adaLagi.value && !loading.value && el.scrollTop + el.clientHeight >= el.scrollHeight - 120) muat(false);
}

let tunda;
watch(q, () => {
  clearTimeout(tunda);
  tunda = setTimeout(() => muat(true), 350);
});
watch([jabatan, cabang], () => muat(true));
watch(() => JSON.stringify(props.params), () => muat(true));
onMounted(() => muat(true));
</script>

<style scoped>
.dpm-filter {
  display: flex;
  gap: 8px;
}

.dpm-cari {
  flex: 1;
}

.dpm-cabang {
  flex: 0 0 140px;
}

.dpm-chips {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}

.dpm-chips::-webkit-scrollbar {
  display: none;
}

.dpm-chip {
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

.dpm-chip b {
  margin-left: 4px;
  color: var(--baba-gold-dark);
}

.dpm-chip.aktif {
  background: var(--baba-ink);
  border-color: var(--baba-ink);
  color: var(--baba-gold-light);
}

.dpm-chip.aktif b {
  color: #fff;
}

.dpm-daftar {
  margin-top: 10px;
  max-height: min(56vh, 520px);
  border: 1px solid var(--baba-border);
  border-radius: 12px;
  background: #fff;
  /* .baba-gulir memberi ruang bawah untuk music player */
  padding: 0 0 72px;
  margin-left: 0;
  margin-right: 0;
}

.dpm-baris {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 10px 14px;
  border-bottom: 1px solid var(--baba-border);
  background: #fff;
  transition: background 0.12s;
}

.dpm-baris:hover {
  background: var(--baba-gold-soft);
}

.dpm-baris.aktif {
  background: var(--baba-gold-soft);
  box-shadow: inset 4px 0 0 var(--baba-gold);
}

.dpm-teks {
  flex: 1;
  min-width: 0;
}

.dpm-atas {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dpm-badge {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--baba-ink);
  color: var(--baba-gold-light);
}

.dpm-noid {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--baba-gold-dark);
}

.dpm-cab {
  margin-left: auto;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--baba-muted);
}

.dpm-nama {
  margin-top: 2px;
  font-weight: 700;
  color: var(--baba-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dpm-info {
  font-size: 0.76rem;
  color: var(--baba-muted);
}

.dpm-panah {
  flex-shrink: 0;
  color: var(--baba-gold-dark);
}

.dpm-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  font-size: 0.85rem;
  color: var(--baba-muted);
}

@media (max-width: 599.98px) {
  .dpm-filter {
    flex-wrap: wrap;
  }

  .dpm-cabang {
    flex: 1 1 100%;
  }
}
</style>
