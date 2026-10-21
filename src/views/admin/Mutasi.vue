<template>
  <div class="mutasi-page">
    <Breadcrumb :items="[{ title: 'Dashboard', to: '/admin/dashboard' }, { title: 'Mutasi Jabatan' }]" />

    <div class="page-heading">
      <h1 class="page-title">Mutasi Jabatan</h1>
      <p class="page-sub">Naikkan, turunkan, atau pindahkan atasan member beserta anggotanya</p>
    </div>

    <v-alert v-if="!isSuperadmin" type="info" variant="tonal">Halaman ini khusus superadmin.</v-alert>

    <v-tabs v-if="isSuperadmin" v-model="tab" color="#B8890F" class="mb-4">
      <v-tab value="baru" prepend-icon="mdi-account-switch">Mutasi Baru</v-tab>
      <v-tab value="riwayat" prepend-icon="mdi-history" @click="muatRiwayat">Riwayat</v-tab>
    </v-tabs>

    <v-window v-if="isSuperadmin" v-model="tab">
      <!-- ================= MUTASI BARU ================= -->
      <v-window-item value="baru">
        <!-- 1. Pilih member -->
        <v-card class="step-card mb-4">
          <div class="step-head"><span class="step-no">1</span> Pilih member</div>
          <v-card-text>
            <v-autocomplete v-model="memberId" :items="memberItems" item-title="label" item-value="id"
              :loading="loadingMember" no-filter clearable label="Cari nama / No ID / username" variant="outlined"
              density="comfortable" prepend-inner-icon="mdi-magnify" hide-details
              no-data-text="Ketik minimal 2 huruf untuk mencari"
              @update:search="cariMember" @update:model-value="pilihMember" />

            <div v-if="member" class="member-info mt-3">
              <div><span class="lbl">Jabatan</span><b>{{ member.jabatan }}</b></div>
              <div><span class="lbl">No ID</span><b>{{ member.no_id || '-' }}</b></div>
              <div><span class="lbl">Atasan</span><b>{{ member.atasan_nama ? `${member.atasan_nama} (${member.atasan_no_id || '-'})` : '-' }}</b></div>
              <div><span class="lbl">Cabang</span><b>{{ member.cabang || '-' }}</b></div>
            </div>
          </v-card-text>
        </v-card>

        <!-- 2. Posisi baru -->
        <v-card v-if="member" class="step-card mb-4">
          <div class="step-head"><span class="step-no">2</span> Posisi baru</div>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="5">
                <v-select v-model="jabatanBaru" :items="jabatanItems" item-title="label" item-value="id"
                  label="Jabatan baru" variant="outlined" density="comfortable" hide-details
                  @update:model-value="gantiJabatan" />
              </v-col>
              <v-col cols="12" md="7">
                <v-autocomplete v-model="atasanBaru" :items="atasanItems" item-title="label" item-value="id"
                  :loading="loadingAtasan" no-filter clearable label="Atasan baru" variant="outlined"
                  density="comfortable" hide-details prepend-inner-icon="mdi-account-arrow-up"
                  :no-data-text="'Ketik nama / No ID atasan'" @update:search="cariAtasan"
                  @update:model-value="jadwalkanPratinjau" />
                <div v-if="bolehTanpaAtasan" class="hint mt-1">Kosongkan bila jabatan ini tidak punya atasan.</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 3. Anggota -->
        <v-card v-if="member && anakLangsung.length" class="step-card mb-4">
          <div class="step-head"><span class="step-no">3</span> Anggota yang ikut
            <span class="head-note">{{ anakLangsung.length }} anggota langsung</span></div>
          <v-card-text>
            <p class="hint mb-2">Centang = ikut pindah bersama timnya. Yang tidak dicentang pindah ke penampung.</p>
            <div class="anak-list">
              <label v-for="a in anakLangsung" :key="a.id" class="anak-item"
                :class="{ 'anak-off': !ikutState[a.id], 'anak-blok': a.boleh_ikut === false }">
                <v-checkbox-btn :model-value="!!ikutState[a.id]" :disabled="a.boleh_ikut === false" color="#B8890F"
                  @update:model-value="toggleIkut(a.id, $event)" />
                <div class="anak-text">
                  <div class="anak-nama">{{ a.nama }}</div>
                  <div class="anak-meta">{{ a.jabatan_lama }} · {{ a.no_id_lama || '-' }}
                    <span v-if="a.jumlah_tim"> · beserta {{ a.jumlah_tim }} anggota</span></div>
                  <div v-if="a.boleh_ikut === false" class="anak-alasan">Jenjang tidak cocok dengan jabatan baru — harus ke penampung</div>
                </div>
              </label>
            </div>

            <div v-if="adaTidakIkut" class="mt-4">
              <v-autocomplete v-model="penampung" :items="penampungItems" item-title="label" item-value="id"
                :loading="loadingPenampung" no-filter clearable label="Atasan penampung untuk anggota yang tidak ikut"
                variant="outlined" density="comfortable" hide-details prepend-inner-icon="mdi-account-group"
                @update:search="cariPenampung" @update:model-value="jadwalkanPratinjau" />
            </div>
          </v-card-text>
        </v-card>

        <!-- 4. Pratinjau -->
        <v-card v-if="member && pratinjau" class="step-card mb-4">
          <div class="step-head"><span class="step-no">{{ anakLangsung.length ? 4 : 3 }}</span> Pratinjau perubahan
            <v-progress-circular v-if="loadingPratinjau" indeterminate size="16" width="2" color="#B8890F" class="ml-2" />
          </div>
          <v-card-text>
            <v-alert v-for="(e, i) in pratinjau.errors" :key="i" type="warning" variant="tonal" density="compact"
              class="mb-2">{{ e }}</v-alert>

            <div v-if="!pratinjau.errors.length" class="ringkas mb-3">
              <span class="r-chip">Anggota: <b>{{ pratinjau.ringkasan.jumlah_anggota }}</b></span>
              <span class="r-chip">Ikut: <b>{{ pratinjau.ringkasan.jumlah_ikut }}</b></span>
              <span class="r-chip">Tidak ikut: <b>{{ pratinjau.ringkasan.jumlah_tidak_ikut }}</b></span>
              <span class="r-chip r-gold">No ID berubah: <b>{{ pratinjau.ringkasan.no_id_berubah }}</b></span>
            </div>

            <v-switch v-model="hanyaBerubah" color="#B8890F" density="compact" hide-details
              label="Tampilkan hanya yang berubah" class="mb-2" />

            <v-data-table :headers="headersPratinjau" :items="barisTampil" :items-per-page="10" density="comfortable"
              :mobile="$vuetify.display.smAndDown" class="tabel-pratinjau">
              <template #item.nama="{ item }">
                <span :style="{ paddingLeft: Math.min(item.depth, 4) * 10 + 'px' }">{{ item.nama }}</span>
              </template>
              <template #item.peran="{ item }">
                <span class="peran" :class="`peran-${item.peran}`">{{ labelPeran[item.peran] }}</span>
              </template>
              <template #item.jabatan="{ item }">
                <span v-if="item.jabatan_lama === item.jabatan_baru">{{ item.jabatan_lama }}</span>
                <span v-else>{{ item.jabatan_lama }} → <b class="baru">{{ item.jabatan_baru }}</b></span>
              </template>
              <template #item.no_id="{ item }">
                <span v-if="!item.no_id_baru || item.no_id_lama === item.no_id_baru">{{ item.no_id_lama || '-' }}</span>
                <span v-else>{{ item.no_id_lama || '-' }} → <b class="baru">{{ item.no_id_baru }}</b></span>
              </template>
              <template #item.atasan="{ item }">
                <span v-if="item.atasan_lama === item.atasan_baru">{{ item.atasan_lama || '-' }}</span>
                <span v-else>{{ item.atasan_lama || '-' }} → <b class="baru">{{ item.atasan_baru || '-' }}</b></span>
              </template>
            </v-data-table>

            <v-textarea v-model="catatan" label="Catatan (opsional, mis. alasan mutasi)" variant="outlined" rows="2"
              auto-grow class="mt-4" hide-details />

            <div class="d-flex justify-end mt-4" style="gap: 8px;">
              <v-btn variant="text" @click="reset">Batal</v-btn>
              <v-btn color="primary" :disabled="!bisaSimpan" :loading="loadingSimpan" prepend-icon="mdi-content-save"
                @click="konfirmasi = true">Simpan Mutasi</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- ================= RIWAYAT ================= -->
      <v-window-item value="riwayat">
        <v-card class="step-card">
          <v-card-text>
            <v-text-field v-model="cariRiwayat" label="Cari nama / No ID" variant="outlined" density="comfortable"
              prepend-inner-icon="mdi-magnify" hide-details clearable class="mb-3" @update:model-value="muatRiwayatDebounce" />
            <v-data-table :headers="headersRiwayat" :items="riwayat" :loading="loadingRiwayat" :items-per-page="10"
              density="comfortable" :mobile="$vuetify.display.smAndDown" hover @click:row="(e, { item }) => bukaDetail(item)">
              <template #item.created_at="{ item }">{{ formatTanggal(item.created_at) }}</template>
              <template #item.jabatan="{ item }">
                <span v-if="item.jabatan_lama === item.jabatan_baru">{{ item.jabatan_lama }}</span>
                <span v-else>{{ item.jabatan_lama }} → <b class="baru">{{ item.jabatan_baru }}</b></span>
              </template>
              <template #item.no_id="{ item }">
                <span v-if="item.no_id_lama === item.no_id_baru">{{ item.no_id_lama || '-' }}</span>
                <span v-else>{{ item.no_id_lama || '-' }} → <b class="baru">{{ item.no_id_baru }}</b></span>
              </template>
              <template #item.atasan="{ item }">{{ item.atasan_lama || '-' }} → {{ item.atasan_baru || '-' }}</template>
              <template #item.anggota="{ item }">{{ item.jumlah_ikut }} ikut · {{ item.jumlah_tidak_ikut }} tidak</template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>

    <!-- Konfirmasi simpan -->
    <v-dialog v-model="konfirmasi" max-width="460">
      <v-card>
        <v-card-title class="text-h6">Simpan mutasi?</v-card-title>
        <v-card-text v-if="pratinjau">
          <b>{{ member?.nama }}</b> menjadi <b>{{ dipindah?.jabatan_baru }}</b> dengan No ID
          <b>{{ dipindah?.no_id_baru }}</b>. {{ pratinjau.ringkasan.no_id_berubah }} No ID akan berubah.
          Perubahan tercatat di riwayat.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="konfirmasi = false">Batal</v-btn>
          <v-btn color="primary" variant="flat" :loading="loadingSimpan" @click="simpan">Ya, simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Detail riwayat -->
    <v-dialog v-model="detail.show" max-width="900">
      <v-card>
        <v-card-title class="text-h6">Rincian mutasi</v-card-title>
        <v-card-text>
          <v-data-table :headers="headersDetail" :items="detail.items" :loading="detail.loading" :items-per-page="10"
            density="compact" :mobile="$vuetify.display.smAndDown">
            <template #item.no_id="{ item }">{{ item.no_id_lama || '-' }} → <b class="baru">{{ item.no_id_baru }}</b></template>
            <template #item.atasan="{ item }">{{ item.atasan_lama || '-' }} → {{ item.atasan_baru || '-' }}</template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="detail.show = false">Tutup</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" :timeout="5000">{{ snack.text }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/config";
import Breadcrumb from "@/components/ui/Breadcrumb.vue";

const api = axios.create({ baseURL: `${API_URL}/api`, timeout: 60000 });
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token") || Cookies.get("token");
  cfg.headers.Authorization = `Bearer ${token}`;
  cfg.headers.Accept = "application/json";
  return cfg;
});

const tab = ref("baru");
const snack = reactive({ show: false, text: "", color: "success" });
const toast = (text, color = "success") => Object.assign(snack, { show: true, text, color });
const pesanError = (e, fallback) => e?.response?.data?.message || e?.response?.data?.errors?.[0] || fallback;

const debounce = (fn, ms = 350) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

/* ---------- 1. member ---------- */
const memberId = ref(null);
const memberItems = ref([]);
const loadingMember = ref(false);
const member = computed(() => memberItems.value.find((m) => m.id === memberId.value) || null);

const cariMember = debounce(async (q) => {
  if (!q || q.length < 2 || (member.value && q === member.value.label)) return;
  loadingMember.value = true;
  try {
    const { data } = await api.get("/mutasi/cari-member", { params: { q } });
    memberItems.value = data.data.map((m) => ({ ...m, label: `${m.nama} — ${m.no_id || "tanpa No ID"} — ${m.jabatan}` }));
  } catch (e) {
    toast(pesanError(e, "Gagal mencari member"), "error");
  } finally {
    loadingMember.value = false;
  }
});

/* ---------- 2. posisi baru ---------- */
const jabatanList = ref([]);
const jabatanBaru = ref(null);
const atasanBaru = ref(null);
const atasanItems = ref([]);
const loadingAtasan = ref(false);
const bolehTanpaAtasan = ref(false);

const jabatanItems = computed(() => jabatanList.value.map((j) => ({ ...j, label: `${j.name} — ${j.jabatan || ""}` })));

async function muatJabatan() {
  try {
    const { data } = await api.get("/mutasi/jabatan");
    jabatanList.value = data.data;
  } catch (e) {
    toast(pesanError(e, "Gagal memuat jabatan"), "error");
  }
}

async function ambilKandidat(typeId, q) {
  const { data } = await api.get("/mutasi/kandidat-atasan", { params: { mvo_type_id: typeId, user_id: memberId.value, q } });
  return {
    boleh: data.boleh_tanpa_atasan,
    items: data.data.map((u) => ({ ...u, label: `${u.nama} — ${u.no_id || "-"} — ${u.jabatan}` })),
  };
}

// Pilihan yang sedang terpilih tetap ada di daftar (supaya labelnya tampil), tapi hanya
// di atas bila cocok dengan kata yang dicari, agar hasil pencarian tidak tertutup.
function gabungTerpilih(terpilih, items, q) {
  const lain = items.filter((i) => !terpilih || i.id !== terpilih.id);
  if (!terpilih) return lain;
  const cocok = !q || terpilih.label.toLowerCase().includes(q.toLowerCase());
  return cocok ? [terpilih, ...lain] : [...lain, terpilih];
}

const cariAtasan = debounce(async (q) => {
  if (!jabatanBaru.value) return;
  const terpilih = atasanItems.value.find((a) => a.id === atasanBaru.value);
  if (terpilih && q === terpilih.label) return;
  loadingAtasan.value = true;
  try {
    const r = await ambilKandidat(jabatanBaru.value, q || "");
    bolehTanpaAtasan.value = r.boleh;
    atasanItems.value = gabungTerpilih(terpilih, r.items, q);
  } catch (e) {
    toast(pesanError(e, "Gagal memuat kandidat atasan"), "error");
  } finally {
    loadingAtasan.value = false;
  }
});

function pilihMember() {
  pratinjau.value = null;
  ikutState.value = {};
  penampung.value = null;
  penampungItems.value = [];
  if (!member.value) return;
  jabatanBaru.value = String(member.value.mvo_type_id);
  atasanBaru.value = member.value.parent_id || null;
  atasanItems.value = member.value.parent_id
    ? [{ id: member.value.parent_id, label: `${member.value.atasan_nama} — ${member.value.atasan_no_id || "-"}` }]
    : [];
  cariAtasan("");
  jadwalkanPratinjau();
}

function gantiJabatan() {
  atasanBaru.value = null;
  atasanItems.value = [];
  cariAtasan("");
  jadwalkanPratinjau();
}

/* ---------- 3. anggota ---------- */
const ikutState = ref({});
const penampung = ref(null);
const penampungItems = ref([]);
const loadingPenampung = ref(false);

const anakLangsung = computed(() => (pratinjau.value?.baris || []).filter((b) => b.anak_langsung));
const adaTidakIkut = computed(() => anakLangsung.value.some((a) => !ikutState.value[a.id]));

function toggleIkut(id, nilai) {
  ikutState.value = { ...ikutState.value, [id]: nilai };
  if (adaTidakIkut.value && !penampung.value && pratinjau.value?.ringkasan?.atasan_lama_id) {
    // Saran awal: atasan lama orang yang dipindah
    penampung.value = pratinjau.value.ringkasan.atasan_lama_id;
    penampungItems.value = [{ id: penampung.value, label: `${member.value.atasan_nama} — ${member.value.atasan_no_id || "-"} (atasan lama)` }];
  }
  cariPenampung("");
  jadwalkanPratinjau();
}

const cariPenampung = debounce(async (q) => {
  const lepas = anakLangsung.value.find((a) => !ikutState.value[a.id]);
  if (!lepas) return;
  const terpilih = penampungItems.value.find((a) => a.id === penampung.value);
  if (terpilih && q === terpilih.label) return;
  const typeId = jabatanList.value.find((j) => j.name === lepas.jabatan_lama)?.id;
  if (!typeId) return;
  loadingPenampung.value = true;
  try {
    const r = await ambilKandidat(typeId, q || "");
    penampungItems.value = gabungTerpilih(terpilih, r.items, q);
  } catch (e) {
    toast(pesanError(e, "Gagal memuat penampung"), "error");
  } finally {
    loadingPenampung.value = false;
  }
});

/* ---------- 4. pratinjau & simpan ---------- */
const pratinjau = ref(null);
const loadingPratinjau = ref(false);
const hanyaBerubah = ref(true);
const catatan = ref("");
const konfirmasi = ref(false);
const loadingSimpan = ref(false);
const labelPeran = { dipindah: "Dipindah", ikut: "Ikut", tidak_ikut: "Tidak ikut" };

const payload = () => ({
  user_id: memberId.value,
  mvo_type_id: jabatanBaru.value,
  parent_id: atasanBaru.value,
  penampung_id: adaTidakIkut.value ? penampung.value : null,
  tidak_ikut: anakLangsung.value.filter((a) => !ikutState.value[a.id]).map((a) => a.id),
  catatan: catatan.value,
});

let urutPratinjau = 0;
const jadwalkanPratinjau = debounce(async () => {
  if (!memberId.value || !jabatanBaru.value) return;
  const nomor = ++urutPratinjau;
  loadingPratinjau.value = true;
  try {
    const { data } = await api.post("/mutasi/pratinjau", payload());
    if (nomor !== urutPratinjau) return; // abaikan respons lama
    // Anggota langsung yang belum punya status: ikut bila jenjangnya cocok
    const st = { ...ikutState.value };
    data.baris.filter((b) => b.anak_langsung).forEach((b) => {
      if (!(b.id in st)) st[b.id] = b.boleh_ikut !== false;
    });
    const berubah = JSON.stringify(st) !== JSON.stringify(ikutState.value);
    ikutState.value = st;
    pratinjau.value = data;
    if (berubah) {
      if (adaTidakIkut.value && !penampung.value && data.ringkasan?.atasan_lama_id) {
        penampung.value = data.ringkasan.atasan_lama_id;
        penampungItems.value = [{ id: penampung.value, label: `${member.value.atasan_nama} — ${member.value.atasan_no_id || "-"} (atasan lama)` }];
      }
      jadwalkanPratinjau();
    }
  } catch (e) {
    if (nomor === urutPratinjau) {
      pratinjau.value = { errors: e?.response?.data?.errors || [pesanError(e, "Gagal membuat pratinjau")], baris: [], ringkasan: {} };
    }
  } finally {
    if (nomor === urutPratinjau) loadingPratinjau.value = false;
  }
}, 300);

const dipindah = computed(() => pratinjau.value?.baris?.find((b) => b.peran === "dipindah"));
const barisTampil = computed(() => {
  const b = pratinjau.value?.baris || [];
  return hanyaBerubah.value
    ? b.filter((x) => x.peran === "dipindah" || x.no_id_lama !== x.no_id_baru || x.atasan_lama !== x.atasan_baru)
    : b;
});
const bisaSimpan = computed(() => pratinjau.value && !pratinjau.value.errors.length && !loadingPratinjau.value);

const headersPratinjau = [
  { title: "Nama", key: "nama" },
  { title: "Status", key: "peran" },
  { title: "Jabatan", key: "jabatan", sortable: false },
  { title: "No ID", key: "no_id", sortable: false },
  { title: "Atasan", key: "atasan", sortable: false },
];

async function simpan() {
  loadingSimpan.value = true;
  try {
    const { data } = await api.post("/mutasi", payload());
    konfirmasi.value = false;
    toast(data.message);
    reset();
    tab.value = "riwayat";
    muatRiwayat();
  } catch (e) {
    konfirmasi.value = false;
    toast(pesanError(e, "Gagal menyimpan mutasi"), "error");
    jadwalkanPratinjau();
  } finally {
    loadingSimpan.value = false;
  }
}

function reset() {
  memberId.value = null;
  jabatanBaru.value = null;
  atasanBaru.value = null;
  atasanItems.value = [];
  penampung.value = null;
  penampungItems.value = [];
  ikutState.value = {};
  pratinjau.value = null;
  catatan.value = "";
}

/* ---------- riwayat ---------- */
const riwayat = ref([]);
const loadingRiwayat = ref(false);
const cariRiwayat = ref("");
const detail = reactive({ show: false, items: [], loading: false });

const headersRiwayat = [
  { title: "Tanggal", key: "created_at" },
  { title: "Nama", key: "nama" },
  { title: "Jabatan", key: "jabatan", sortable: false },
  { title: "No ID", key: "no_id", sortable: false },
  { title: "Atasan", key: "atasan", sortable: false },
  { title: "Anggota", key: "anggota", sortable: false },
  { title: "No ID berubah", key: "jumlah_no_id_berubah" },
  { title: "Oleh", key: "created_by" },
];
const headersDetail = [
  { title: "Nama", key: "nama" },
  { title: "No ID", key: "no_id", sortable: false },
  { title: "Atasan", key: "atasan", sortable: false },
  { title: "Keterangan", key: "keterangan" },
];

async function muatRiwayat() {
  loadingRiwayat.value = true;
  try {
    const { data } = await api.get("/mutasi", { params: { q: cariRiwayat.value || "" } });
    riwayat.value = data.data;
  } catch (e) {
    toast(pesanError(e, "Gagal memuat riwayat"), "error");
  } finally {
    loadingRiwayat.value = false;
  }
}
const muatRiwayatDebounce = debounce(muatRiwayat);

async function bukaDetail(item) {
  Object.assign(detail, { show: true, items: [], loading: true });
  try {
    const { data } = await api.get(`/mutasi/${item.id}`);
    detail.items = data.data;
  } catch (e) {
    toast(pesanError(e, "Gagal memuat rincian"), "error");
  } finally {
    detail.loading = false;
  }
}

const formatTanggal = (s) => (s ? new Date(s.replace(" ", "T")).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-");

const isSuperadmin = localStorage.getItem("mvo_type_id") === "superadmin";
if (isSuperadmin) muatJabatan();
</script>

<style scoped>
.page-heading {
  margin-bottom: 12px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--baba-text);
}

.page-sub {
  font-size: 0.875rem;
  color: var(--baba-muted);
}

.step-card {
  border: 1px solid var(--baba-border);
  box-shadow: var(--baba-shadow) !important;
}

.step-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 0;
  font-weight: 700;
  color: var(--baba-text);
}

.step-no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--baba-ink);
  color: var(--baba-gold-light);
  font-size: 0.85rem;
}

.head-note {
  margin-left: auto;
  font-weight: 500;
  font-size: 0.8rem;
  color: var(--baba-muted);
}

.member-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 8px;
  padding: 12px;
  border-radius: var(--baba-radius);
  background: var(--baba-gold-soft);
}

.member-info .lbl {
  display: block;
  font-size: 0.75rem;
  color: var(--baba-muted);
}

.hint {
  font-size: 0.8rem;
  color: var(--baba-muted);
}

.anak-list {
  display: grid;
  gap: 8px;
}

.anak-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--baba-border);
  border-radius: 12px;
  cursor: pointer;
}

.anak-item :deep(.v-selection-control) {
  flex: 0 0 auto;
}

.anak-text {
  flex: 1 1 auto;
  min-width: 0;
  text-align: left;
}

.anak-off {
  background: #fafafa;
}

.anak-blok {
  cursor: not-allowed;
}

.anak-nama {
  font-weight: 700;
}

.anak-meta {
  font-size: 0.8rem;
  color: var(--baba-muted);
}

.anak-alasan {
  font-size: 0.78rem;
  color: var(--baba-danger);
}

.ringkas {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.r-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: #f1f1f1;
  font-size: 0.85rem;
}

.r-gold {
  background: var(--baba-gold-soft);
  color: var(--baba-gold-dark);
}

.baru {
  color: var(--baba-gold-dark);
}

.peran {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
}

.peran-dipindah {
  background: var(--baba-ink);
  color: var(--baba-gold-light);
}

.peran-ikut {
  background: #e8f5e9;
  color: #2e7d32;
}

.peran-tidak_ikut {
  background: #fff3e0;
  color: #c77700;
}

@media (max-width: 959.98px) {
  .page-title {
    font-size: 1.25rem;
  }
}
</style>
