<template>
  <div class="mutasi-page">
    <Breadcrumb :items="[{ title: 'Dashboard', to: '/admin/dashboard' }, { title: 'Mutasi Jabatan' }]"
      sub="Naikkan, turunkan, atau pindahkan upline member beserta anggotanya" />

    <v-alert v-if="!isSuperadmin" type="info" variant="tonal">Halaman ini khusus superadmin.</v-alert>

    <v-tabs v-if="isSuperadmin" v-model="tab" color="#B8890F" class="mb-4">
      <v-tab value="baru" prepend-icon="mdi-account-switch">Mutasi Baru</v-tab>
      <v-tab value="saran" prepend-icon="mdi-chart-timeline-variant" @click="muatSaranAwal">Saran RO</v-tab>
      <v-tab value="riwayat" prepend-icon="mdi-history" @click="muatRiwayat">Riwayat</v-tab>
    </v-tabs>

    <v-window v-if="isSuperadmin" v-model="tab">
      <!-- ================= MUTASI BARU ================= -->
      <v-window-item value="baru">
        <!-- 1. Pilih member -->
        <v-card class="step-card mb-4">
          <div class="step-head"><span class="step-no">1</span> Pilih member</div>
          <v-card-text>
            <!-- Daftar member langsung tampil; pilih dengan mengetuk baris -->
            <DaftarPilihMember v-if="!member" :api="api" url="/mutasi/cari-member" filter-jabatan filter-cabang
              placeholder="Cari nama / No ID / username" kosong="Tidak ada member yang cocok"
              @pilih="pilihDariDaftar" />

            <template v-else>
              <div class="member-info">
                <div><span class="lbl">Nama</span><b>{{ member.nama }}</b></div>
                <div><span class="lbl">Jabatan</span><b>{{ member.jabatan }}</b></div>
                <div><span class="lbl">No ID</span><b>{{ member.no_id || '-' }}</b></div>
                <div><span class="lbl">Upline</span><b>{{ member.atasan_nama ? `${member.atasan_nama} (${member.atasan_no_id || '-'})` : '-' }}</b></div>
                <div><span class="lbl">Cabang</span><b>{{ member.cabang || '-' }}</b></div>
              </div>
              <v-btn variant="tonal" color="#B8890F" size="small" prepend-icon="mdi-account-switch" class="mt-3"
                @click="gantiMember">Ganti member</v-btn>
            </template>
          </v-card-text>
        </v-card>

        <!-- 2. Posisi baru -->
        <v-card v-if="member" class="step-card mb-4">
          <div class="step-head"><span class="step-no">2</span> Posisi baru</div>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-select v-model="jabatanBaru" :items="jabatanItems" item-title="label" item-value="id"
                  label="Jabatan baru" variant="outlined" density="comfortable" hide-details
                  @update:model-value="gantiJabatan" />
              </v-col>
            </v-row>

            <div class="atasan-label mt-4">Upline baru</div>
            <!-- Atasan terpilih + tombol ganti; daftar calon atasan tampil saat memilih -->
            <div v-if="!pilihAtasanTerbuka" class="atasan-terpilih">
              <div v-if="atasanTerpilih" class="atasan-teks">
                <b>{{ atasanTerpilih.nama }}</b>
                <span class="atasan-meta">{{ atasanTerpilih.no_id || '-' }}<template v-if="atasanTerpilih.jabatan"> · {{ atasanTerpilih.jabatan }}</template></span>
              </div>
              <div v-else class="atasan-teks atasan-kosong">{{ bolehTanpaAtasan ? 'Tanpa upline' : 'Belum dipilih' }}</div>
              <v-btn variant="tonal" color="#B8890F" size="small" prepend-icon="mdi-account-arrow-up"
                @click="pilihAtasanTerbuka = true">{{ atasanTerpilih ? 'Ganti upline' : 'Pilih upline' }}</v-btn>
            </div>
            <template v-else>
              <p class="hint mb-2">Calon upline yang sah untuk jabatan ini. Cabang {{ member.cabang }} ditampilkan paling atas.</p>
              <DaftarPilihMember :api="api" url="/mutasi/kandidat-atasan"
                :params="{ mvo_type_id: jabatanBaru, user_id: memberId, cabang_utama: member.cabang }"
                :terpilih-id="atasanBaru" placeholder="Cari nama / No ID upline"
                kosong="Tidak ada calon upline untuk jabatan ini" @pilih="pilihAtasan" />
              <div class="d-flex flex-wrap ga-2 mt-2">
                <v-btn v-if="bolehTanpaAtasan" variant="text" size="small" @click="pilihAtasan(null)">Tanpa upline</v-btn>
                <v-btn v-if="atasanTerpilih" variant="text" size="small" @click="pilihAtasanTerbuka = false">Batal</v-btn>
              </div>
            </template>
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
                :loading="loadingPenampung" no-filter clearable label="Upline penampung untuk anggota yang tidak ikut"
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
      <!-- ================= SARAN RO ================= -->
      <v-window-item value="saran">
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          Saran dihitung dari RO (repeat order) dokumen yang <b>sudah di-approve</b> dalam periode aturan.
          Sistem hanya memberi saran — perubahan jabatan tetap lewat tombol <b>Proses</b> (Mutasi Baru).
        </v-alert>

        <v-expansion-panels v-model="panelAturan" class="mb-4">
          <v-expansion-panel value="aturan" class="step-card">
            <v-expansion-panel-title><b>Atur target per jabatan</b></v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="hint mb-3">Kosongkan target bila jabatan tersebut tidak perlu diberi saran.
                "Tim" = RO sendiri + seluruh downline-nya.</p>
              <div v-for="a in aturanRo" :key="a.mvo_type_id" class="aturan-row">
                <div class="aturan-nama">{{ a.jabatan }}</div>
                <v-text-field v-model.number="a.periode_bulan" type="number" min="1" max="24" label="Periode (bulan)"
                  density="compact" variant="outlined" hide-details />
                <v-select v-model="a.basis" :items="basisItems" item-title="text" item-value="value" label="Basis RO"
                  density="compact" variant="outlined" hide-details />
                <v-text-field v-model="a.target_naik" type="number" min="0" label="Naik bila RO ≥" density="compact"
                  variant="outlined" hide-details clearable />
                <v-text-field v-model="a.target_turun" type="number" min="0" label="Turun bila RO <"
                  density="compact" variant="outlined" hide-details clearable />
              </div>
              <div class="d-flex justify-end mt-3">
                <v-btn color="primary" :loading="loadingAturan" prepend-icon="mdi-content-save" @click="simpanAturan">
                  Simpan Aturan</v-btn>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-card class="step-card">
          <v-card-text>
            <div class="saran-filter mb-3">
              <v-chip-group v-model="filterSaran" mandatory selected-class="chip-aktif" @update:model-value="muatSaran">
                <v-chip value="" variant="outlined">Semua</v-chip>
                <v-chip value="naik" variant="outlined">▲ Layak naik ({{ ringkasSaran.naik }})</v-chip>
                <v-chip value="turun" variant="outlined">▼ Perlu turun ({{ ringkasSaran.turun }})</v-chip>
                <v-chip value="aman" variant="outlined">● Aman ({{ ringkasSaran.aman }})</v-chip>
              </v-chip-group>
              <div class="saran-cari">
                <v-text-field v-model="filterCabang" label="Cabang" density="compact" variant="outlined" hide-details
                  clearable style="max-width: 130px;" @update:model-value="muatSaranDebounce" />
                <v-text-field v-model="filterCari" label="Cari nama / No ID" density="compact" variant="outlined"
                  prepend-inner-icon="mdi-magnify" hide-details clearable @update:model-value="muatSaranDebounce" />
              </div>
            </div>

            <v-data-table :headers="headersSaran" :items="saran" :loading="loadingSaran" :items-per-page="10"
              density="comfortable" :mobile="$vuetify.display.smAndDown"
              no-data-text="Belum ada saran. Atur target per jabatan terlebih dahulu.">
              <template #item.ro="{ item }">
                <b>{{ formatAngka(item.ro) }}</b>
                <div class="hint">{{ item.basis === 'tim' ? 'Tim' : 'Pribadi' }} · {{ item.periode_bulan }} bln</div>
              </template>
              <template #item.target="{ item }">
                <div v-if="item.target_naik !== null" class="hint">Naik ≥ {{ formatAngka(item.target_naik) }}</div>
                <div v-if="item.target_turun !== null" class="hint">Turun &lt; {{ formatAngka(item.target_turun) }}</div>
              </template>
              <template #item.saran="{ item }">
                <span class="saran" :class="`saran-${item.saran}`">
                  {{ item.saran === 'naik' ? `▲ Naik ke ${item.saran_ke}` : item.saran === 'turun' ? `▼ Turun ke ${item.saran_ke}` : '● Aman' }}
                </span>
              </template>
              <template #item.aksi="{ item }">
                <v-btn v-if="item.saran !== 'aman'" size="small" color="primary" variant="tonal" @click="prosesSaran(item)">
                  Proses</v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-window-item>

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
import DaftarPilihMember from "@/components/mutasi/DaftarPilihMember.vue";

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
const member = computed(() => memberItems.value.find((m) => m.id === memberId.value) || null);

function pilihDariDaftar(m) {
  memberItems.value = [m];
  memberId.value = m.id;
  pilihMember();
}

function gantiMember() {
  reset();
  memberItems.value = [];
}

/* ---------- 2. posisi baru ---------- */
const jabatanList = ref([]);
const jabatanBaru = ref(null);
const atasanBaru = ref(null);
const atasanTerpilih = ref(null); // { id, nama, no_id, jabatan }
const pilihAtasanTerbuka = ref(false);
// Jabatan teratas (TM, MVO) boleh tanpa atasan — sama dengan aturan di MutasiController::kandidatAtasan
const bolehTanpaAtasan = computed(() => (jabatanList.value.find((j) => String(j.id) === String(jabatanBaru.value))?.level ?? 99) <= 1);

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
  return data.data.map((u) => ({ ...u, label: `${u.nama} — ${u.no_id || "-"} — ${u.jabatan}` }));
}

// Pilihan yang sedang terpilih tetap ada di daftar (supaya labelnya tampil), tapi hanya
// di atas bila cocok dengan kata yang dicari, agar hasil pencarian tidak tertutup.
function gabungTerpilih(terpilih, items, q) {
  const lain = items.filter((i) => !terpilih || i.id !== terpilih.id);
  if (!terpilih) return lain;
  const cocok = !q || terpilih.label.toLowerCase().includes(q.toLowerCase());
  return cocok ? [terpilih, ...lain] : [...lain, terpilih];
}

function pilihMember() {
  pratinjau.value = null;
  ikutState.value = {};
  penampung.value = null;
  penampungItems.value = [];
  if (!member.value) return;
  const m = member.value;
  jabatanBaru.value = String(m.mvo_type_id);
  atasanBaru.value = m.parent_id || null;
  atasanTerpilih.value = m.parent_id ? { id: m.parent_id, nama: m.atasan_nama, no_id: m.atasan_no_id } : null;
  pilihAtasanTerbuka.value = false;
  jadwalkanPratinjau();
}

// Jabatan berubah → atasan lama belum tentu sah, jadi daftar calon atasan langsung dibuka
function gantiJabatan() {
  atasanBaru.value = null;
  atasanTerpilih.value = null;
  pilihAtasanTerbuka.value = true;
  jadwalkanPratinjau();
}

function pilihAtasan(a) {
  atasanBaru.value = a ? a.id : null;
  atasanTerpilih.value = a;
  pilihAtasanTerbuka.value = false;
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
    penampungItems.value = [{ id: penampung.value, label: `${member.value.atasan_nama} — ${member.value.atasan_no_id || "-"} (upline lama)` }];
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
    const items = await ambilKandidat(typeId, q || "");
    penampungItems.value = gabungTerpilih(terpilih, items, q);
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
        penampungItems.value = [{ id: penampung.value, label: `${member.value.atasan_nama} — ${member.value.atasan_no_id || "-"} (upline lama)` }];
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
  { title: "Upline", key: "atasan", sortable: false },
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
  atasanTerpilih.value = null;
  pilihAtasanTerbuka.value = false;
  penampung.value = null;
  penampungItems.value = [];
  ikutState.value = {};
  pratinjau.value = null;
  catatan.value = "";
}

/* ---------- saran RO ---------- */
const aturanRo = ref([]);
const loadingAturan = ref(false);
const panelAturan = ref(null);
const saran = ref([]);
const ringkasSaran = ref({ naik: 0, turun: 0, aman: 0 });
const loadingSaran = ref(false);
const filterSaran = ref("");
const filterCabang = ref("");
const filterCari = ref("");
const basisItems = [
  { text: "Pribadi", value: "pribadi" },
  { text: "Tim (+ downline)", value: "tim" },
];
const headersSaran = [
  { title: "Nama", key: "nama" },
  { title: "Jabatan", key: "jabatan" },
  { title: "No ID", key: "no_id" },
  { title: "Cabang", key: "cabang" },
  { title: "RO", key: "ro" },
  { title: "Target", key: "target", sortable: false },
  { title: "Saran", key: "saran" },
  { title: "", key: "aksi", sortable: false, align: "end" },
];
const formatAngka = (n) => Number(n ?? 0).toLocaleString("id-ID");

async function muatAturan() {
  try {
    const { data } = await api.get("/saran-mutasi/aturan");
    aturanRo.value = data.data;
    // Belum ada target sama sekali → buka panel aturan supaya admin langsung mengisinya
    if (!data.data.some((a) => a.target_naik !== null || a.target_turun !== null)) panelAturan.value = "aturan";
  } catch (e) {
    toast(pesanError(e, "Gagal memuat aturan"), "error");
  }
}

async function simpanAturan() {
  loadingAturan.value = true;
  try {
    const { data } = await api.put("/saran-mutasi/aturan", { aturan: aturanRo.value });
    aturanRo.value = data.data;
    toast(data.message);
    muatSaran();
  } catch (e) {
    toast(pesanError(e, "Gagal menyimpan aturan"), "error");
  } finally {
    loadingAturan.value = false;
  }
}

async function muatSaran() {
  loadingSaran.value = true;
  try {
    const { data } = await api.get("/saran-mutasi", {
      params: { status: filterSaran.value || "", cabang: filterCabang.value || "", q: filterCari.value || "" },
    });
    saran.value = data.data;
    ringkasSaran.value = data.ringkasan;
  } catch (e) {
    toast(pesanError(e, "Gagal memuat saran"), "error");
  } finally {
    loadingSaran.value = false;
  }
}
const muatSaranDebounce = debounce(muatSaran, 400);

function muatSaranAwal() {
  if (!aturanRo.value.length) muatAturan();
  muatSaran();
}

// Buka Mutasi Baru dengan member & jabatan tujuan dari saran
async function prosesSaran(item) {
  try {
    const { data } = await api.get("/mutasi/cari-member", { params: { id: item.id } });
    const m = data.data[0];
    if (!m) return toast("Member tidak ditemukan", "error");
    memberItems.value = [{ ...m, label: `${m.nama} — ${m.no_id || "tanpa No ID"} — ${m.jabatan}` }];
    memberId.value = m.id;
    tab.value = "baru";
    pilihMember();
    jabatanBaru.value = String(item.saran_ke_id);
    catatan.value = `Saran RO: ${item.saran === "naik" ? "naik" : "turun"} (RO ${formatAngka(item.ro)})`;
    gantiJabatan();
  } catch (e) {
    toast(pesanError(e, "Gagal membuka mutasi"), "error");
  }
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
  { title: "Upline", key: "atasan", sortable: false },
  { title: "Anggota", key: "anggota", sortable: false },
  { title: "No ID berubah", key: "jumlah_no_id_berubah" },
  { title: "Oleh", key: "created_by" },
];
const headersDetail = [
  { title: "Nama", key: "nama" },
  { title: "No ID", key: "no_id", sortable: false },
  { title: "Upline", key: "atasan", sortable: false },
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

.atasan-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--baba-muted);
  margin-bottom: 6px;
}

.atasan-terpilih {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--baba-radius);
  border: 1px solid var(--baba-border);
  background: #fff;
}

.atasan-teks {
  flex: 1;
  min-width: 0;
}

.atasan-meta {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--baba-gold-dark);
}

.atasan-kosong {
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

.aturan-row {
  display: grid;
  grid-template-columns: 110px repeat(4, minmax(0, 1fr));
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.aturan-nama {
  font-weight: 700;
}

.saran-filter {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
}

.saran-cari {
  display: flex;
  gap: 8px;
  flex: 1 1 320px;
  max-width: 460px;
}

.chip-aktif {
  background: var(--baba-ink) !important;
  color: var(--baba-gold-light) !important;
  border-color: var(--baba-ink) !important;
}

.saran {
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.saran-naik {
  background: #e8f5e9;
  color: #2e7d32;
}

.saran-turun {
  background: #fdecea;
  color: #c62828;
}

.saran-aman {
  background: #f1f1f1;
  color: var(--baba-muted);
}

@media (max-width: 959.98px) {
  .aturan-row {
    grid-template-columns: 1fr 1fr;
    padding-bottom: 10px;
    border-bottom: 1px dashed var(--baba-border);
  }

  .aturan-nama {
    grid-column: 1 / -1;
  }

  .saran-cari {
    max-width: none;
  }
}
</style>
