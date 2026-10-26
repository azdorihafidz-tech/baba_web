<template>
  <Breadcrumb :items="[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Hak Akses' }]" />

  <div class="d-flex flex-wrap align-center ga-2 mb-3">
    <v-tabs v-model="tab" color="#B8890F" density="compact">
      <v-tab value="aktif">Hak aktif ({{ daftar.length }})</v-tab>
      <v-tab value="riwayat" @click="muatRiwayat">Riwayat</v-tab>
    </v-tabs>
    <v-spacer />
    <v-btn color="primary" prepend-icon="mdi-shield-plus" @click="bukaBeri">Beri hak</v-btn>
  </div>

  <!-- Hak aktif -->
  <template v-if="tab === 'aktif'">
    <v-text-field v-model="cari" density="compact" variant="outlined" hide-details clearable class="mb-3"
      prepend-inner-icon="mdi-magnify" placeholder="Cari nama / No ID pemegang atau Founder" />
    <v-progress-linear v-if="memuat" indeterminate color="primary" class="mb-2" />
    <div v-isi-layar class="baba-gulir">
      <div v-if="!memuat && !tersaring.length" class="kosong">
        <v-icon size="40">mdi-shield-account-outline</v-icon>
        <p>{{ daftar.length ? 'Tidak ada yang cocok.' : 'Belum ada akun yang diberi hak tambahan.' }}</p>
      </div>
      <div class="kartu-grid">
        <v-card v-for="h in tersaring" :key="h.id" class="hak-kartu" variant="outlined">
          <div class="hak-atas">
            <span class="hak-chip">{{ h.label }}</span>
            <v-spacer />
            <v-btn size="small" variant="text" color="error" prepend-icon="mdi-shield-remove" @click="bukaCabut(h)">Cabut</v-btn>
          </div>
          <div class="hak-baris">
            <span class="lbl">Pemegang</span>
            <b>{{ h.nama }}</b>
            <span class="meta">{{ h.jabatan || '-' }} · {{ h.no_id || 'tanpa No ID' }} · {{ h.cabang || '-' }}</span>
          </div>
          <div class="hak-baris">
            <span class="lbl">Cakupan</span>
            <b>Gerbong {{ h.cakupan_no_id }} · {{ h.cakupan_nama }}</b>
            <span class="meta">{{ h.jumlah_gerbong }} akun di bawahnya · {{ h.cakupan_cabang || '-' }}</span>
          </div>
          <div v-if="h.catatan" class="hak-catatan">{{ h.catatan }}</div>
          <div class="hak-kaki">Diberikan {{ tanggal(h.created_at) }} oleh {{ h.created_by || '-' }}</div>
        </v-card>
      </div>
    </div>
  </template>

  <!-- Riwayat -->
  <template v-else>
    <v-progress-linear v-if="memuatRiwayat" indeterminate color="primary" class="mb-2" />
    <div v-isi-layar class="baba-gulir">
      <div v-if="!memuatRiwayat && !riwayat.length" class="kosong"><p>Belum ada riwayat.</p></div>
      <div v-for="r in riwayat" :key="r.id" class="riwayat-baris">
        <span class="aksi-chip" :class="r.aksi === 'beri' ? 'aksi-beri' : 'aksi-cabut'">{{ r.aksi === 'beri' ? 'Diberi' : 'Dicabut' }}</span>
        <div class="riwayat-isi">
          <div><b>{{ r.label }}</b> · {{ r.nama }} ({{ r.no_id || '-' }}) · gerbong {{ r.cakupan_no_id }} · {{ r.cakupan_nama }}</div>
          <div class="meta">{{ tanggal(r.created_at, true) }} oleh {{ r.oleh_nama || '-' }}<template v-if="r.catatan"> · {{ r.catatan }}</template></div>
        </div>
      </div>
    </div>
  </template>

  <!-- Dialog Beri hak -->
  <v-dialog v-model="dialogBeri" max-width="560" :fullscreen="$vuetify.display.xs">
    <v-card>
      <v-card-title class="d-flex align-center">Beri hak<v-spacer /><v-btn icon="mdi-close" variant="text" @click="dialogBeri = false" /></v-card-title>
      <v-card-text>
        <v-autocomplete v-model="form.user_id" :items="akunItems" item-title="label" item-value="id" no-filter clearable
          :loading="memuatAkun" label="Akun yang diberi hak" variant="outlined" density="comfortable" class="mb-3"
          prepend-inner-icon="mdi-account" hint="Cari nama, No ID, atau username. Contoh: akun Founder itu sendiri." persistent-hint
          @update:search="cariAkun" />
        <v-select v-model="form.hak" :items="hakItems" item-title="label" item-value="kode" label="Hak" variant="outlined"
          density="comfortable" class="mb-3" prepend-inner-icon="mdi-shield-key" />
        <v-autocomplete v-model="form.cakupan_id" :items="founderItems" item-title="label" item-value="id" no-filter clearable
          :loading="memuatFounder" label="Cakupan: gerbong Founder" variant="outlined" density="comfortable" class="mb-3"
          prepend-inner-icon="mdi-sitemap" persistent-hint
          hint="Pemegang hak hanya bisa memutasi akun di bawah Founder ini (GM ke bawah). Founder-nya sendiri tidak bisa dimutasi."
          @update:search="cariFounder" />
        <v-textarea v-model="form.catatan" label="Catatan (opsional)" variant="outlined" density="comfortable" rows="2" auto-grow hide-details />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogBeri = false">Batal</v-btn>
        <v-btn color="primary" variant="flat" :loading="menyimpan" :disabled="!form.user_id || !form.hak || !form.cakupan_id" @click="simpanBeri">Simpan</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Cabut -->
  <v-dialog v-model="dialogCabut" max-width="480">
    <v-card v-if="dicabut">
      <v-card-title>Cabut hak?</v-card-title>
      <v-card-text>
        <p class="mb-3">Hak <b>{{ dicabut.label }}</b> milik <b>{{ dicabut.nama }}</b> untuk gerbong
          <b>{{ dicabut.cakupan_no_id }} · {{ dicabut.cakupan_nama }}</b> akan dicabut. Menu terkait hilang dari akunnya.</p>
        <v-textarea v-model="alasanCabut" label="Alasan (opsional)" variant="outlined" density="comfortable" rows="2" auto-grow hide-details />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogCabut = false">Batal</v-btn>
        <v-btn color="error" variant="flat" :loading="menyimpan" @click="simpanCabut">Cabut</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snack.show" :color="snack.color" :timeout="5000">{{ snack.text }}</v-snackbar>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/config";
import Breadcrumb from "@/components/ui/Breadcrumb.vue";

const api = axios.create({ baseURL: `${API_URL}/api`, timeout: 60000 });
api.interceptors.request.use((cfg) => {
  const token = Cookies.get("token") || localStorage.getItem("token");
  cfg.headers.Authorization = `Bearer ${token}`;
  cfg.headers.Accept = "application/json";
  return cfg;
});

const snack = reactive({ show: false, text: "", color: "success" });
const toast = (text, color = "success") => Object.assign(snack, { show: true, text, color });
const pesanError = (e, fallback) => e?.response?.data?.message || fallback;
const debounce = (fn, ms = 350) => {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};
const tanggal = (v, jam = false) => (v ? (jam ? String(v).slice(0, 16).replace("T", " ") : String(v).slice(0, 10)) : "-");
const labelAkun = (u) => `${u.no_id || "tanpa No ID"} · ${u.nama} — ${u.jabatan || "-"} · ${u.cabang || "-"}`;

const tab = ref("aktif");
const daftar = ref([]);
const hakTersedia = ref({});
const memuat = ref(false);
const cari = ref("");
const tersaring = computed(() => {
  const q = (cari.value || "").toLowerCase().trim();
  if (!q) return daftar.value;
  return daftar.value.filter((h) => [h.nama, h.no_id, h.cakupan_nama, h.cakupan_no_id].some((x) => String(x || "").toLowerCase().includes(q)));
});

async function muat() {
  memuat.value = true;
  try {
    const { data } = await api.get("/hak-akses");
    daftar.value = data.data;
    hakTersedia.value = data.hak || {};
  } catch (e) {
    toast(pesanError(e, "Gagal memuat hak akses"), "error");
  } finally {
    memuat.value = false;
  }
}

const riwayat = ref([]);
const memuatRiwayat = ref(false);
async function muatRiwayat() {
  memuatRiwayat.value = true;
  try {
    riwayat.value = (await api.get("/hak-akses/riwayat")).data.data;
  } catch (e) {
    toast(pesanError(e, "Gagal memuat riwayat"), "error");
  } finally {
    memuatRiwayat.value = false;
  }
}

/* ---------- Beri hak ---------- */
const dialogBeri = ref(false);
const menyimpan = ref(false);
const form = reactive({ user_id: null, hak: "mutasi", cakupan_id: null, catatan: "" });
const hakItems = computed(() => Object.entries(hakTersedia.value).map(([kode, label]) => ({ kode, label })));
const akunItems = ref([]);
const founderItems = ref([]);
const memuatAkun = ref(false);
const memuatFounder = ref(false);

// Pilihan yang sedang terpilih tetap ada di daftar supaya labelnya tampil
const gabung = (lama, baru, id) => {
  const terpilih = lama.find((x) => x.id === id);
  return terpilih && !baru.some((x) => x.id === id) ? [terpilih, ...baru] : baru;
};
const cariAkun = debounce(async (q) => {
  if (q && akunItems.value.some((x) => x.id === form.user_id && x.label === q)) return;
  memuatAkun.value = true;
  try {
    const { data } = await api.get("/hak-akses/cari-akun", { params: { q: q || "" } });
    akunItems.value = gabung(akunItems.value, data.data.map((u) => ({ ...u, label: labelAkun(u) })), form.user_id);
  } finally {
    memuatAkun.value = false;
  }
});
const cariFounder = debounce(async (q) => {
  if (q && founderItems.value.some((x) => x.id === form.cakupan_id && x.label === q)) return;
  memuatFounder.value = true;
  try {
    const { data } = await api.get("/hak-akses/cari-founder", { params: { q: q || "" } });
    founderItems.value = gabung(founderItems.value, data.data.map((u) => ({ ...u, label: labelAkun(u) })), form.cakupan_id);
  } finally {
    memuatFounder.value = false;
  }
});

function bukaBeri() {
  Object.assign(form, { user_id: null, hak: hakItems.value[0]?.kode || "mutasi", cakupan_id: null, catatan: "" });
  dialogBeri.value = true;
  cariAkun("");
  cariFounder("");
}

async function simpanBeri() {
  menyimpan.value = true;
  try {
    const { data } = await api.post("/hak-akses", { ...form });
    toast(data.message);
    dialogBeri.value = false;
    muat();
    if (riwayat.value.length) muatRiwayat();
  } catch (e) {
    toast(pesanError(e, "Gagal memberi hak"), "error");
  } finally {
    menyimpan.value = false;
  }
}

/* ---------- Cabut ---------- */
const dialogCabut = ref(false);
const dicabut = ref(null);
const alasanCabut = ref("");
function bukaCabut(h) {
  dicabut.value = h;
  alasanCabut.value = "";
  dialogCabut.value = true;
}
async function simpanCabut() {
  menyimpan.value = true;
  try {
    const { data } = await api.delete(`/hak-akses/${dicabut.value.id}`, { data: { catatan: alasanCabut.value } });
    toast(data.message);
    dialogCabut.value = false;
    muat();
    if (riwayat.value.length) muatRiwayat();
  } catch (e) {
    toast(pesanError(e, "Gagal mencabut hak"), "error");
  } finally {
    menyimpan.value = false;
  }
}

onMounted(muat);
</script>

<style scoped>
.kartu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.hak-kartu {
  padding: 12px 14px;
  border-color: var(--baba-gold);
}

.hak-atas {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.hak-chip {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: var(--baba-gold-soft);
  color: var(--baba-gold-dark);
}

.hak-baris {
  display: flex;
  flex-direction: column;
  margin-top: 6px;
}

.hak-baris .lbl {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--baba-muted);
}

.meta {
  font-size: 0.82rem;
  color: var(--baba-muted);
}

.hak-catatan {
  margin-top: 8px;
  font-size: 0.85rem;
  font-style: italic;
}

.hak-kaki {
  margin-top: 8px;
  font-size: 0.75rem;
  color: var(--baba-muted);
}

.kosong {
  text-align: center;
  padding: 32px 0;
  color: var(--baba-muted);
}

.riwayat-baris {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 4px;
  border-bottom: 1px solid var(--baba-border);
}

.riwayat-isi {
  min-width: 0;
}

.aksi-chip {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.aksi-beri {
  background: var(--baba-gold-soft);
  color: var(--baba-gold-dark);
}

.aksi-cabut {
  border: 1px solid var(--baba-danger);
  color: var(--baba-danger);
}
</style>
