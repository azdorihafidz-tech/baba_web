<template>
  <Breadcrumb :items="[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Hak Akses' }]" />

  <div class="d-flex flex-wrap align-center ga-2 mb-3">
    <v-tabs v-model="tab" color="#B8890F" density="compact">
      <v-tab value="akun">Per akun</v-tab>
      <v-tab value="aktif">Hak aktif ({{ daftar.length }})</v-tab>
      <v-tab value="riwayat" @click="muatRiwayat">Riwayat</v-tab>
    </v-tabs>
    <v-spacer />
    <v-btn color="primary" prepend-icon="mdi-shield-plus" @click="bukaBeri">Beri hak</v-btn>
  </div>

  <!-- Per akun: semua kemampuan satu akun beserta asalnya -->
  <template v-if="tab === 'akun'">
    <v-autocomplete v-model="akunDilihat" :items="akunLihatItems" item-title="label" item-value="id" no-filter clearable
      :loading="memuatAkunLihat" label="Pilih akun" placeholder="Cari nama, No ID, atau username" variant="outlined"
      density="comfortable" prepend-inner-icon="mdi-account-search" hide-details class="mb-3"
      @update:search="cariAkunLihat" @update:model-value="muatKemampuan" />
    <v-progress-linear v-if="memuatKemampuan" indeterminate color="primary" class="mb-2" />
    <div v-isi-layar class="baba-gulir">
      <div v-if="!profil" class="kosong">
        <v-icon size="40">mdi-account-key-outline</v-icon>
        <p>Pilih akun untuk melihat apa saja yang bisa dilakukannya di aplikasi, beserta asal haknya.</p>
      </div>
      <template v-else>
        <v-card class="profil-kartu mb-3" variant="outlined">
          <div class="profil-nama">{{ profil.akun.nama }}</div>
          <div class="meta">{{ profil.akun.jabatan || '-' }} · {{ profil.akun.no_id || 'tanpa No ID' }} · {{ profil.akun.cabang || '-' }}
            <template v-if="profil.akun.kode"> · {{ profil.akun.kode }}</template></div>
          <div v-if="!profil.akun.aktif" class="profil-catatan">Akun belum aktif (belum diverifikasi): belum bisa login, jadi semua hak belum berlaku.</div>
        </v-card>
        <div v-for="g in kelompokKemampuan" :key="g.nama" class="kel">
          <div class="kel-judul">{{ g.nama }}</div>
          <div v-for="k in g.isi" :key="k.kode" class="kem-baris" :class="{ 'kem-tidak': !k.boleh }">
            <v-icon :color="k.boleh ? 'success' : undefined" size="20">{{ k.boleh ? 'mdi-check-circle' : 'mdi-close-circle-outline' }}</v-icon>
            <div class="kem-teks">
              <div class="kem-label">{{ k.label }}</div>
              <div class="meta">{{ k.ket }}</div>
            </div>
            <template v-if="k.kode === 'mutasi' && profil.akun.aktif">
              <v-btn v-if="k.boleh" size="small" variant="text" color="#B8890F" @click="lihatHakAktif(profil.akun)">Lihat</v-btn>
              <v-btn size="small" variant="text" color="#B8890F" prepend-icon="mdi-shield-plus" @click="beriUntuk(profil.akun)">Beri hak</v-btn>
            </template>
          </div>
        </div>
      </template>
    </div>
  </template>

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
            <b>Gerbong {{ h.cakupan_jabatan }} {{ h.cakupan_no_id }} · {{ h.cakupan_nama }}</b>
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
          :loading="memuatFounder" label="Cakupan: pemilik gerbong" variant="outlined" density="comfortable" class="mb-3"
          prepend-inner-icon="mdi-sitemap" persistent-hint :hint="hintCakupan"
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

const tab = ref("akun");
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

/* ---------- Per akun ---------- */
const akunDilihat = ref(null);
const akunLihatItems = ref([]);
const memuatAkunLihat = ref(false);
const profil = ref(null); // { akun, kemampuan[] }
const memuatKemampuan = ref(false);
const cariAkunLihat = debounce(async (q) => {
  if (q && akunLihatItems.value.some((x) => x.id === akunDilihat.value && x.label === q)) return;
  memuatAkunLihat.value = true;
  try {
    const { data } = await api.get("/hak-akses/cari-akun", { params: { q: q || "" } });
    akunLihatItems.value = gabung(akunLihatItems.value, data.data.map((u) => ({ ...u, label: labelAkun(u) })), akunDilihat.value);
  } finally {
    memuatAkunLihat.value = false;
  }
});
async function muatKemampuan(id) {
  if (!id) {
    profil.value = null;
    return;
  }
  memuatKemampuan.value = true;
  try {
    const { data } = await api.get(`/hak-akses/akun/${id}`);
    profil.value = { akun: data.akun, kemampuan: data.kemampuan };
  } catch (e) {
    toast(pesanError(e, "Gagal memuat hak akun"), "error");
  } finally {
    memuatKemampuan.value = false;
  }
}
// Kelompok sesuai urutan dari server: semua member, jabatan, posisi upline, hak tambahan, khusus superadmin
const kelompokKemampuan = computed(() => {
  const hasil = [];
  for (const k of profil.value?.kemampuan || []) {
    let g = hasil.find((x) => x.nama === k.kelompok);
    if (!g) hasil.push((g = { nama: k.kelompok, isi: [] }));
    g.isi.push(k);
  }
  return hasil;
});
function lihatHakAktif(akun) {
  tab.value = "aktif";
  cari.value = akun.no_id || akun.nama;
}
function beriUntuk(akun) {
  bukaBeri();
  const item = { ...akun, label: labelAkun(akun) };
  akunItems.value = [item, ...akunItems.value.filter((x) => x.id !== akun.id)];
  form.user_id = akun.id;
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
// Jabatan tertinggi yang bisa dipilih pemegang hak = 1 jenjang di bawah pemilik gerbong (jabatan_maks dari server)
const hintCakupan = computed(() => {
  const akar = founderItems.value.find((x) => x.id === form.cakupan_id);
  const maks = akar?.jabatan_maks;
  return akar && maks
    ? `Pemegang hak bisa memutasi seluruh akun di bawah ${akar.nama}, dengan jabatan paling tinggi ${maks}. ${akar.nama} sendiri tidak bisa dimutasi.`
    : "Pilih akun TM sampai Distributor. Pemegang hak bisa memutasi seluruh akun di bawahnya, dengan jabatan paling tinggi 1 jenjang di bawah akun itu.";
});

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
// Akar gerbong: akun TM sampai Distributor; pemegang hak bisa memutasi seluruh downline-nya
const cariFounder = debounce(async (q) => {
  if (q && founderItems.value.some((x) => x.id === form.cakupan_id && x.label === q)) return;
  memuatFounder.value = true;
  try {
    const { data } = await api.get("/hak-akses/cari-cakupan", { params: { q: q || "" } });
    founderItems.value = gabung(founderItems.value, data.data.map((u) => ({ ...u,
      label: `${labelAkun(u)} · ${u.jumlah_downline ? `${u.jumlah_downline} downline langsung` : "belum punya downline"}` })), form.cakupan_id);
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
    if (profil.value) muatKemampuan(profil.value.akun.id);
    else tab.value = "aktif";
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
    if (profil.value) muatKemampuan(profil.value.akun.id);
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

.profil-kartu {
  padding: 12px 14px;
  border-color: var(--baba-gold);
}

.profil-nama {
  font-weight: 700;
  font-size: 1.05rem;
}

.profil-catatan {
  margin-top: 6px;
  font-size: 0.85rem;
  color: var(--baba-danger);
}

.kel {
  margin-bottom: 14px;
}

.kel-judul {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--baba-gold-dark);
  margin-bottom: 4px;
}

.kem-baris {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 4px;
  border-bottom: 1px solid var(--baba-border);
  flex-wrap: wrap;
}

.kem-teks {
  flex: 1;
  min-width: 200px;
}

.kem-label {
  font-weight: 600;
}

.kem-tidak .kem-label {
  color: var(--baba-muted);
  font-weight: 500;
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
