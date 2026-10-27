<template>
  <!-- Baris filter daftar (seragam di semua menu daftar): kolom cari, pilihan cabang,
       tombol status (opsional), dan tombol jabatan dengan jumlahnya.
       HP (< 960px): kolom cari + tombol Saring (panel dari bawah) supaya daftar dapat ruang lebih banyak
       (keputusan user 27 Okt 2026); filter yang aktif tampil sebagai chip kecil yang bisa dihapus. -->
  <div class="fd">
    <!-- ===== Desktop: semua terlihat langsung ===== -->
    <template v-if="!hp">
      <div class="fd-baris">
        <v-text-field v-model="teks" :placeholder="placeholder" density="compact" variant="outlined" hide-details
          clearable prepend-inner-icon="mdi-magnify" class="fd-cari" />
        <v-select v-if="adaCabang" :model-value="cabang || 'Semua'" :items="['Semua', ...daftarCabang]"
          density="compact" variant="outlined" hide-details label="Cabang" class="fd-cabang"
          @update:model-value="pilihCabang" />
      </div>
      <div v-if="daftarStatus.length" class="fd-chips">
        <button v-for="s in daftarStatus" :key="String(s.value)" type="button" class="fd-chip fd-chip--status"
          :class="{ aktif: statusAktif(s) }" @click="emit('update:status', s.value)">
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
    </template>

    <!-- ===== HP: cari + Saring ===== -->
    <template v-else>
      <div class="fd-baris">
        <v-text-field v-model="teks" :placeholder="placeholder" density="compact" variant="outlined" hide-details
          clearable prepend-inner-icon="mdi-magnify" class="fd-cari" />
        <button v-if="bisaSaring" type="button" class="fd-saring" :class="{ aktif: aktif.length }"
          aria-label="Saring daftar" @click="panel = true">
          <v-icon size="18">mdi-tune-variant</v-icon>
          <span>Saring</span>
          <span v-if="aktif.length" class="fd-saring-angka">{{ aktif.length }}</span>
        </button>
      </div>
      <!-- Filter yang sedang aktif: ketuk ✕ untuk menghapus -->
      <div v-if="aktif.length" class="fd-aktif">
        <button v-for="a in aktif" :key="a.kunci" type="button" class="fd-aktif-chip" @click="hapus(a.kunci)">
          {{ a.label }} <v-icon size="14">mdi-close</v-icon>
        </button>
        <button v-if="aktif.length > 1" type="button" class="fd-aktif-reset" @click="resetSemua">Hapus semua</button>
      </div>

      <v-bottom-sheet v-model="panel" scrollable>
        <v-card class="fd-sheet" rounded="t-xl">
          <div class="fd-sheet-head">
            <v-icon color="#F6D365" class="mr-2">mdi-tune-variant</v-icon>
            <div class="fd-sheet-judul">Saring daftar</div>
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" color="#F6D365" size="small" aria-label="Tutup" @click="panel = false" />
          </div>
          <v-card-text class="fd-sheet-isi">
            <template v-if="adaCabang">
              <div class="fd-label">Cabang</div>
              <v-select :model-value="cabang || 'Semua'" :items="['Semua', ...daftarCabang]" density="compact"
                variant="outlined" hide-details @update:model-value="pilihCabang" />
            </template>
            <template v-if="daftarStatus.length">
              <div class="fd-label">Status</div>
              <div class="fd-chips fd-chips--sheet">
                <button v-for="s in daftarStatus" :key="String(s.value)" type="button" class="fd-chip fd-chip--status"
                  :class="{ aktif: statusAktif(s) }" @click="emit('update:status', s.value)">
                  {{ s.label }} <b v-if="s.jumlah != null">{{ s.jumlah }}</b>
                </button>
              </div>
            </template>
            <template v-if="daftarJabatan.length">
              <div class="fd-label">Jabatan</div>
              <div class="fd-chips fd-chips--sheet">
                <button type="button" class="fd-chip" :class="{ aktif: !jabatan }" @click="emit('update:jabatan', null)">
                  Semua <b>{{ totalJabatan }}</b>
                </button>
                <button v-for="j in daftarJabatan" :key="j.id" type="button" class="fd-chip"
                  :class="{ aktif: String(jabatan) === String(j.id) }" @click="emit('update:jabatan', j.id)">
                  {{ j.name }} <b>{{ j.jumlah }}</b>
                </button>
              </div>
            </template>
          </v-card-text>
          <v-card-actions class="fd-sheet-foot">
            <v-btn variant="text" :disabled="!aktif.length" @click="resetSemua">Hapus semua</v-btn>
            <v-spacer />
            <v-btn color="primary" variant="flat" @click="panel = false">Tampilkan hasil</v-btn>
          </v-card-actions>
        </v-card>
      </v-bottom-sheet>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { useDisplay } from "vuetify";

const props = defineProps({
  q: { type: String, default: "" }, // v-model:q (dikirim 350 ms setelah berhenti mengetik)
  jabatan: [String, Number], // v-model:jabatan (id tbl_mvo_type, null = semua)
  cabang: { type: String, default: "" }, // v-model:cabang ('' = semua)
  status: [String, Number], // v-model:status (opsional; pilihan pertama = bawaan)
  daftarJabatan: { type: Array, default: () => [] }, // [{ id, name, jumlah }]
  daftarCabang: { type: Array, default: () => [] }, // ['BDG', 'MDN', …] — disembunyikan bila hanya satu
  daftarStatus: { type: Array, default: () => [] }, // [{ value, label, jumlah }]
  placeholder: { type: String, default: "Cari nama / No ID" },
});
const emit = defineEmits(["update:q", "update:jabatan", "update:cabang", "update:status"]);

const { mdAndUp } = useDisplay();
const hp = computed(() => !mdAndUp.value);
const panel = ref(false);
const teks = ref(props.q);
const totalJabatan = computed(() => props.daftarJabatan.reduce((n, j) => n + Number(j.jumlah || 0), 0));
const adaCabang = computed(() => props.daftarCabang.length > 1);
const bisaSaring = computed(() => adaCabang.value || props.daftarStatus.length || props.daftarJabatan.length);

const sama = (a, b) => String(a ?? "") === String(b ?? "");
const statusAktif = (s) => sama(props.status, s.value);
// Status bawaan = pilihan pertama (mis. "Perlu tindakan" di Akun Belum Approve, "Semua status" di Verifikasi ID)
const statusBawaan = computed(() => props.daftarStatus[0]?.value ?? "");

/** Filter yang sedang aktif (selain bawaan), untuk chip kecil & angka di tombol Saring. */
const aktif = computed(() => {
  const hasil = [];
  if (props.cabang) hasil.push({ kunci: "cabang", label: `Cabang ${props.cabang}` });
  if (props.daftarStatus.length && !sama(props.status, statusBawaan.value)) {
    const s = props.daftarStatus.find(statusAktif);
    if (s) hasil.push({ kunci: "status", label: s.label });
  }
  if (props.jabatan) {
    const j = props.daftarJabatan.find((x) => sama(x.id, props.jabatan));
    hasil.push({ kunci: "jabatan", label: j?.name || "Jabatan" });
  }
  return hasil;
});

function pilihCabang(v) {
  emit("update:cabang", v === "Semua" ? "" : v);
}
function hapus(kunci) {
  if (kunci === "cabang") emit("update:cabang", "");
  if (kunci === "status") emit("update:status", statusBawaan.value);
  if (kunci === "jabatan") emit("update:jabatan", null);
}
function resetSemua() {
  aktif.value.forEach((a) => hapus(a.kunci));
}

// Tinggi baris filter berubah (chip aktif muncul/hilang) → daftar di bawahnya (v-isi-layar) dihitung ulang
watch(() => aktif.value.length, () => nextTick(() => window.dispatchEvent(new Event("resize"))));

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
  min-width: 0;
}

.fd-cabang {
  flex: 0 0 140px;
}

/* Tombol turun ke baris berikut bila tidak muat: semua jabatan selalu terlihat */
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

/* ===== HP ===== */
.fd-saring {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--baba-border);
  border-radius: 8px;
  background: #fff;
  color: var(--baba-text);
  font-size: 0.85rem;
  font-weight: 700;
}

.fd-saring.aktif {
  background: var(--baba-ink);
  border-color: var(--baba-ink);
  color: var(--baba-gold-light);
}

.fd-saring-angka {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--baba-gold);
  color: var(--baba-ink);
  font-size: 0.7rem;
  line-height: 18px;
  text-align: center;
}

.fd-aktif {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.fd-aktif-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px 2px 10px;
  border-radius: 999px;
  background: var(--baba-gold-soft);
  border: 1px solid var(--baba-gold);
  color: var(--baba-text);
  font-size: 0.75rem;
  font-weight: 600;
}

.fd-aktif-reset {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--baba-gold-dark);
  padding: 2px 4px;
}

.fd-sheet {
  max-height: 85vh;
}

.fd-sheet-head {
  display: flex;
  align-items: center;
  padding: 12px 8px 12px 16px;
  background: var(--baba-ink);
  border-bottom: 2px solid var(--baba-gold);
}

.fd-sheet-judul {
  font-weight: 800;
  color: var(--baba-gold-light);
}

.fd-sheet-isi {
  padding: 8px 16px 16px !important;
}

.fd-label {
  margin: 14px 0 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--baba-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.fd-chips--sheet {
  margin-top: 0;
}

.fd-chips--sheet .fd-chip {
  padding: 7px 14px;
  font-size: 0.85rem;
}

.fd-sheet-foot {
  border-top: 1px solid var(--baba-border);
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
}
</style>
