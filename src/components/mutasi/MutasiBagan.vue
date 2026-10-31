<template>
  <div class="bagan" :class="{ 'sedang-geser': !!geser, 'mode-ketuk': ketuk }">
    <!-- Pilih tim -->
    <div class="bg-atas">
      <v-autocomplete v-model="pilihTim" v-model:search="teksCari" :items="hasilCari" item-title="label" item-value="id" no-filter clearable
        :loading="mencari" label="Buka tim" placeholder="Ketik nama / No ID / No Member, atau pilih dari daftar" variant="outlined"
        density="comfortable" hide-details prepend-inner-icon="mdi-sitemap" class="bg-cari" no-data-text="Tidak ada akun yang cocok."
        @update:search="cari" @update:model-value="bukaTim" @update:focused="(f) => f && !hasilCari.length && cari('')">
        <template #item="{ props: ip, item }">
          <v-list-item v-bind="ip" title="" class="bg-pilih">
            <span class="kursi" :class="`jab-${String(item.raw.jab || '').toLowerCase()}`">{{ item.raw.jab }}</span> <b class="ml-1">{{ item.raw.judul }}</b>
            <div class="meta">{{ item.raw.sub }}</div>
          </v-list-item>
        </template>
        <template #append-item>
          <div v-if="adaLagi" class="meta px-4 py-2">Menampilkan 50 akun pertama. Ketik nama / No ID, atau pilih jabatan & cabang untuk menyaring.</div>
        </template>
      </v-autocomplete>
      <v-select v-model="saringCabang" :items="daftarCabang" label="Cabang" clearable variant="outlined" density="comfortable" hide-details
        class="bg-cabang" @update:model-value="cari(teksCari, true)" />
      <span v-if="panel.length" class="meta">{{ panel.length === 1 ? 'Buka tim kedua untuk memindah antar tim.' : 'Dua tim terbuka.' }}</span>
    </div>
    <div class="bg-jab">
      <span class="meta">Jabatan:</span>
      <v-chip size="small" :variant="saringJab ? 'outlined' : 'flat'" :color="saringJab ? undefined : 'primary'" @click="pilihJab(null)">Semua</v-chip>
      <v-chip v-for="j in metaJabatan" :key="j.id" size="small" :variant="saringJab === j.id ? 'flat' : 'outlined'"
        :color="saringJab === j.id ? 'primary' : undefined" @click="pilihJab(j.id)">{{ j.name }} <span class="ml-1 jml">{{ j.jumlah }}</span></v-chip>
    </div>

    <div v-if="!panel.length" class="kosong-info">
      <v-icon size="40">mdi-sitemap-outline</v-icon>
      <p>Pilih ketua tim (mis. Regional atau Founder) untuk menampilkan bagannya. Geser orang ke kursi lain; kursi (jabatan + No ID)
        tetap di tempatnya.</p>
    </div>

    <div v-else class="bg-isi">
      <!-- Bagan per tim -->
      <div class="bg-panel-wrap">
        <div v-for="(p, pi) in panel" :key="p.akar" class="bg-panel">
          <div class="bg-panel-kepala">
            <b>{{ asli[p.akar]?.owner ? 'Seluruh struktur' : `Tim ${asli[p.akar]?.no_id || ''} ${asli[p.akar]?.nama || ''}` }}</b>
            <v-spacer />
            <v-btn size="x-small" variant="text" @click="bukaSemua(p, true)">Buka semua</v-btn>
            <v-btn size="x-small" variant="text" @click="bukaSemua(p, false)">Tutup</v-btn>
            <v-btn size="x-small" variant="text" icon="mdi-close" :title="`Tutup tim ${asli[p.akar]?.no_id || ''}`" @click="tutupPanel(pi)" />
          </div>
          <div v-isi-layar="16" class="bg-pohon baba-gulir">
            <!-- Upline tim (tujuan "+ downline") -->
            <div v-if="!uplinePanel(p).owner" class="bg-baris bg-upline">
              <span class="meta">Upline:</span>
              <span class="nama">{{ uplinePanel(p).label }}</span>
              <span class="bg-plus" :class="{ sorot: sorot === `u${pi}` }" @dragover.prevent="sorot = `u${pi}`" @dragleave="sorot = null"
                @drop.prevent="keDownline(uplinePanel(p).id)" @click="ketukDownline(uplinePanel(p).id)">+ downline</span>
            </div>
            <template v-for="(bg, bi) in tampilan[pi]" :key="bi">
            <div v-if="bg.judul" class="bg-sub">{{ bg.judul }}</div>
            <div v-for="r in bg.rows" :key="r.n.id" class="bg-baris" :style="{ paddingLeft: `${8 + r.depth * 18}px` }"
              :class="{ berubah: r.n.berubah, kosong: r.n.kosong, calon: r.calon, sorot: sorot === `k${r.n.id}`, dipilih: dipilih === r.n.id }"
              @dragover.prevent="geser?.jenis === 'orang' && (sorot = `k${r.n.id}`)" @dragleave="sorot = null"
              @drop.prevent="keKursi(r.n)" @click="ketukKursi(r.n)">
              <button class="bg-lipat" :class="{ tak: !r.punyaAnak }" @click.stop="lipat(r.n.id)">
                <v-icon size="16">{{ buka.has(r.n.id) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
              </button>
              <span class="kursi" :class="kelasJab(r.n.mvo_type_id)">{{ namaJab(r.n.mvo_type_id) }} · {{ r.n.no_id || 'baru' }}</span>
              <span v-if="r.n.kosong" class="kosong-teks">Kursi kosong — geser orang ke sini</span>
              <span v-else class="orang" :draggable="!r.n.owner" :title="r.n.owner ? '' : 'Geser orang ini ke kursi lain'"
                @dragstart="mulai($event, 'orang', r.n.id)" @dragend="selesai" @click.stop="ketukOrang(r.n)">
                <span class="nm">{{ noMember(r.n.id) }}</span> {{ r.n.nama }}
              </span>
              <span v-if="r.n.berubah && r.n.no_id_lama !== r.n.no_id && !r.n.kosong" class="ubah-noid">{{ r.n.no_id_lama || '-' }} → {{ r.n.no_id }}</span>
              <span v-if="r.calon" class="label-calon">calon naik</span>
              <v-spacer />
              <span v-if="r.tim" class="tim">{{ r.tim }}</span>
              <span v-if="!r.n.kosong" class="bg-plus" :class="{ sorot: sorot === `d${r.n.id}` }" @dragover.prevent.stop="sorot = `d${r.n.id}`"
                @dragleave="sorot = null" @drop.prevent.stop="keDownline(r.n.id)" @click.stop="ketukDownline(r.n.id)">+ downline</span>
            </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Bangku tunggu & rencana -->
      <div class="bg-samping">
        <div class="bangku" :class="{ sorot: sorot === 'bangku' }" @dragover.prevent="geser?.jenis === 'orang' && (sorot = 'bangku')"
          @dragleave="sorot = null" @drop.prevent="keBangku" @click="ketukBangku">
          <div class="judul-kecil"><v-icon size="18">mdi-seat-outline</v-icon> Bangku tunggu</div>
          <div v-if="!bangku.length" class="meta">Geser orang ke sini untuk mengeluarkannya dulu dari kursinya.</div>
          <div v-for="o in bangku" :key="o.id" class="orang bangku-orang" :class="{ dipilih: dipilih === o.id }" draggable="true"
            @dragstart="mulai($event, 'orang', o.id)" @dragend="selesai" @click.stop="ketukOrang(o)">
            <span class="nm">{{ noMember(o.id) }}</span> {{ o.nama }} <span class="meta">({{ o.jabatan }} {{ o.no_id_lama }})</span>
          </div>
        </div>

        <div class="rencana">
          <div class="judul-kecil"><v-icon size="18">mdi-format-list-checks</v-icon> Rencana</div>
          <div v-if="!langkah.length" class="meta">Belum ada perubahan.</div>
          <ol v-else class="daftar-langkah">
            <li v-for="(l, i) in langkah" :key="i">{{ l.teks }}</li>
          </ol>
          <div v-for="k in kursiKosong" :key="k.id" class="peringatan kotak-naik" :class="{ dibiarkan: k.dibiarkan }">
            <div v-if="k.dibiarkan">Kursi <b>{{ k.jabatan }} {{ k.no_id }}</b> <b>dibiarkan kosong</b>; {{ k.jumlah_downline }} downline tetap di kursinya.
              <v-btn v-if="!k.tersimpan" size="x-small" variant="text" :disabled="memuat" @click="jadiBiarkan(k, false)">Batalkan</v-btn></div>
            <div v-else>Kursi <b>{{ k.jabatan }} {{ k.no_id || '(baru)' }}</b> kosong, masih ada {{ k.jumlah_downline }} downline — <b>siapa yang naik?</b></div>
            <div class="calon-list">
              <v-btn v-for="c in k.calon" :key="c.id" size="small" variant="outlined" class="calon-btn" :disabled="!k.no_id || memuat"
                @click="isiKursi(c.id, k)">{{ c.jabatan }} {{ c.no_id }} · {{ c.nama }}<span class="meta ml-1">({{ c.jumlah_tim }} tim)</span></v-btn>
            </div>
            <div class="meta">Atau {{ ketuk ? 'ketuk orang lain lalu ketuk' : 'geser orang lain ke' }} kursi merah itu.</div>
            <!-- Sama dengan kotak kursi kosong di Mutasi Baru -->
            <div class="kk-tombol">
              <v-btn v-if="k.no_id" size="small" variant="tonal" color="#B8890F" prepend-icon="mdi-account-search" :disabled="memuat"
                @click="bukaPilihKursi('orang', k)">Pilih orang lain…</v-btn>
              <v-btn v-if="!k.dibiarkan && k.no_id" size="small" variant="tonal" prepend-icon="mdi-seat-outline" :disabled="memuat"
                @click="jadiBiarkan(k, true)">Biarkan kosong</v-btn>
              <v-btn v-if="k.jumlah_downline" size="small" variant="text" prepend-icon="mdi-account-group" :disabled="memuat"
                @click="bukaPilihKursi('tim', k)">Pindahkan tim ke upline lain</v-btn>
            </div>
          </div>
          <div v-if="kursiBebas.length" class="meta mt-2">
            Kursi kosong tanpa downline (nomornya bebas dipakai lagi): {{ kursiBebas.map((k) => `${k.jabatan} ${k.no_id}`).join(', ') }}.
          </div>
          <div v-if="bangku.length" class="peringatan">{{ bangku.length }} orang di bangku tunggu: tempatkan dulu ke kursi.</div>
          <div v-if="ringkas" class="meta mt-2 ringkas">{{ ringkas }}</div>
          <div class="tombol">
            <v-btn size="small" variant="outlined" prepend-icon="mdi-undo" :disabled="!langkah.length || memuat" @click="batal">Batal</v-btn>
            <v-btn size="small" variant="outlined" prepend-icon="mdi-restore" :disabled="!langkah.length || memuat" @click="ulang">Ulang dari awal</v-btn>
          </div>
          <v-btn block color="primary" class="mt-2" prepend-icon="mdi-content-save" :disabled="!bolehSimpan" :loading="memuat"
            @click="dialogSimpan = true">Simpan{{ jumlahAkun ? ` (${jumlahAkun} akun)` : '' }}</v-btn>
        </div>
      </div>
    </div>

    <!-- Kursi kosong: pengganti dari member mana saja, atau upline baru untuk seluruh downline-nya -->
    <v-dialog v-model="pilihKursi.show" max-width="640" scrollable>
      <v-card v-if="pilihKursi.kursi">
        <v-card-title class="text-h6 text-wrap">{{ pilihKursi.jenis === 'orang'
          ? `Pilih pengganti kursi ${pilihKursi.kursi.jabatan} ${pilihKursi.kursi.no_id}`
          : `Pindahkan downline kursi ${pilihKursi.kursi.jabatan} ${pilihKursi.kursi.no_id || '(baru)'}` }}</v-card-title>
        <v-card-text>
          <p class="meta mb-2">{{ pilihKursi.jenis === 'orang'
            ? `Pengganti boleh dari jaringan atau cabang mana saja. Jabatannya menjadi ${pilihKursi.kursi.jabatan}; ${pilihKursi.kursi.jumlah_downline} downline kursi itu pindah ke orang ini.`
            : `Pilih upline baru untuk ${pilihKursi.kursi.jumlah_downline} downline kursi ini (beserta timnya). Daftar hanya berisi upline dengan jenjang yang sah; kursi lalu dihapus.` }}</p>
          <DaftarPilihMember v-if="pilihKursi.jenis === 'orang'" :api="api" url="/mutasi/cari-member" filter-jabatan filter-cabang
            placeholder="Cari nama / No ID / No Member" kosong="Tidak ada member yang cocok" @pilih="pilihPengganti" />
          <DaftarPilihMember v-else :api="api" url="/mutasi/kandidat-atasan" :params="{ mvo_type_id: pilihKursi.kursi.downline_type }"
            placeholder="Cari nama / No ID upline" kosong="Tidak ada calon upline" @pilih="pilihPenampung" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="pilihKursi.show = false">Batal</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Menu saat orang dilepas di atas orang lain / + downline -->
    <v-dialog v-model="dialogMenu" max-width="500" scrollable>
      <v-card v-if="menu">
        <v-card-title class="text-h6 text-wrap">{{ namaOrang(menu.P) }} → {{ menu.namaU }}</v-card-title>
        <v-card-text>
          <p class="meta mb-2">{{ menu.infoP }}. Pilih yang akan dilakukan:</p>
          <v-radio-group v-model="menu.aksi" hide-details class="menu-aksi">
            <v-radio v-for="o in menu.opsi" :key="o.aksi" :value="o.aksi">
              <template #label><div><b>{{ o.judul }}</b><div class="meta">{{ o.ket }}</div></div></template>
            </v-radio>
          </v-radio-group>
          <v-select v-if="menu.aksi === 'sendiri'" v-model="menu.jabSendiri" :items="menu.pilihSendiri" item-title="name" item-value="id"
            label="Jabatan baru" variant="outlined" density="comfortable" hide-details class="mt-3" />
          <v-select v-if="menu.aksi === 'gerbong'" v-model="menu.jabGerbong" :items="menu.pilihGerbong" item-title="name" item-value="id"
            label="Jabatan baru" variant="outlined" density="comfortable" hide-details class="mt-3" />
          <!-- Pilih No ID (sama dengan Mutasi Baru): Otomatis, atau salah satu nomor kosong untuk jabatan & upline itu -->
          <v-select v-if="menu.aksi === 'sendiri' || menu.aksi === 'tim'" v-model="menu.noId" :items="menu.pilihNoId" item-title="teks"
            item-value="no_id" label="No ID" variant="outlined" density="comfortable" class="mt-3" :loading="menu.memuatNoId"
            hint="Otomatis = No ID lama dipertahankan bila masih sesuai, atau nomor kosong berikutnya." persistent-hint />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogMenu = false">Batal</v-btn>
          <v-btn color="primary" variant="flat" :disabled="!menu.aksi" @click="terapkanMenu">Terapkan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Simpan -->
    <v-dialog v-model="dialogSimpan" max-width="720" scrollable>
      <v-card>
        <v-card-title class="text-h6">Simpan Mutasi Bagan?</v-card-title>
        <v-card-text>
          <p class="mb-2">{{ ringkas }}. Akun yang berubah dan upline-nya mendapat notifikasi; tercatat di Riwayat dengan Jenis Mutasi Bagan.</p>
          <table class="tabel">
            <thead><tr><th>Nama</th><th>Jabatan</th><th>No ID</th><th>Upline</th></tr></thead>
            <tbody>
              <tr v-for="b in perubahan" :key="b.id">
                <td>{{ b.nama }}</td>
                <td v-html="lamaBaru(b.jabatan_lama, b.jabatan_baru)" />
                <td v-html="lamaBaru(b.no_id_lama, b.no_id_baru)" />
                <td v-html="lamaBaru(b.atasan_lama || 'Owner', b.atasan_baru || 'Owner')" />
              </tr>
            </tbody>
          </table>
          <v-text-field v-model="catatan" class="mt-3" label="Catatan (opsional)" variant="outlined" density="comfortable" hide-details maxlength="500" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogSimpan = false">Batal</v-btn>
          <v-btn color="primary" variant="flat" :loading="memuat" @click="simpan">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- HP: orang yang sedang dipilih + jalan pintas -->
    <div v-if="ketuk && dipilih != null" class="hint-ketuk">
      <div class="hint-teks"><b>{{ namaOrang(dipilih) }}</b> dipilih. Ketuk kursi tujuan, + downline, atau:</div>
      <div class="d-flex ga-2 mt-1">
        <v-btn size="small" variant="flat" color="primary" prepend-icon="mdi-seat-outline" @click="ketukBangku">Ke bangku tunggu</v-btn>
        <v-btn size="small" variant="outlined" color="#F6D365" @click="dipilih = null">Batal pilih</v-btn>
      </div>
    </div>

    <v-snackbar v-model="pesan.show" :color="pesan.warna" :timeout="pesan.warna === 'error' ? 7000 : 3500" location="top">{{ pesan.teks }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/config";
import { noMember } from "@/utils/noMember";
import { owner, muatOwner } from "@/utils/owner";
import DaftarPilihMember from "@/components/mutasi/DaftarPilihMember.vue";

const props = defineProps({ ketuk: { type: Boolean, default: false } }); // HP: ketuk orang → ketuk tujuan
const emit = defineEmits(["tersimpan"]);

const api = axios.create({ baseURL: `${API_URL}/api`, timeout: 60000 });
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token") || Cookies.get("token");
  cfg.headers.Authorization = `Bearer ${token}`;
  cfg.headers.Accept = "application/json";
  return cfg;
});

const pesan = reactive({ show: false, teks: "", warna: "success" });
const toast = (teks, warna = "error") => Object.assign(pesan, { show: true, teks, warna });

// Jabatan (aturan No ID)
const jabatan = ref([]);
const gerbong = ref([]); // pemegang hak Mutasi: akar gerbongnya (superadmin: kosong)
const jab = (t) => jabatan.value.find((j) => j.id === String(t));
const namaJab = (t) => (t === "superadmin" ? "OWNER" : jab(t)?.name || "-");
const levelJab = (t) => (t === "superadmin" ? -1 : jab(t)?.level ?? 99);
const kelasJab = (t) => `jab-${(namaJab(t) || "").toLowerCase()}`;

// Data asli (semua tim yang dibuka + upline-nya) dan panel tim
const asli = ref({});
const panel = ref([]);
const buka = ref(new Set());

// Rencana: baris langkah "atur" per akun, hasil pratinjau terakhir, dan riwayat langkah untuk Batal
const baris = ref({});
const biarkan = ref([]); // No ID kursi kosong yang dibiarkan kosong (langkah "kosongkan" sesudah langkah atur)
const hasil = ref(null);
const langkah = ref([]);
const memuat = ref(false);
const catatan = ref("");

onMounted(async () => {
  if (isSuperadmin) muatOwner();
  try {
    const { data } = await api.get("/mutasi/jabatan");
    jabatan.value = data.data;
    gerbong.value = data.cakupan || [];
  } catch {
    toast("Gagal memuat daftar jabatan.");
  }
});

// Cari & buka tim: daftar tampil tanpa mengetik, disaring jabatan & cabang; superadmin juga bisa membuka seluruh struktur (Owner)
const isSuperadmin = localStorage.getItem("mvo_type_id") === "superadmin";
const pilihTim = ref(null);
const teksCari = ref("");
const hasilCari = ref([]);
const adaLagi = ref(false);
const mencari = ref(false);
const saringJab = ref(null);
const saringCabang = ref(null);
const metaJabatan = ref([]);
const daftarCabang = ref([]);
let tundaCari = null;
let nomorCari = 0;
let totalAkun = 0;
function cari(q, segera = false) {
  clearTimeout(tundaCari);
  tundaCari = setTimeout(async () => {
    q = (q || "").trim();
    // Teks dari pilihan yang baru dipilih bukan pencarian
    if (q && hasilCari.value.some((m) => m.label === q)) return;
    const no = ++nomorCari;
    mencari.value = true;
    try {
      const { data } = await api.get("/mutasi/cari-member", {
        params: { q: q || undefined, mvo_type_id: saringJab.value || undefined, cabang: saringCabang.value || undefined, limit: 50, meta: 1 },
      });
      if (no !== nomorCari) return;
      metaJabatan.value = data.meta?.jabatan || [];
      if (!daftarCabang.value.length) daftarCabang.value = data.meta?.cabang || [];
      const daftar = data.data.map((m) => ({
        ...m, jab: m.jabatan, judul: `${m.no_id || ""} · ${m.nama}`,
        sub: `${noMember(m.id)} · ${m.cabang || "-"} · Upline ${m.atasan_no_id ? `${m.atasan_no_id} ${m.atasan_nama}` : "Owner"} · ${m.jumlah_anggota || 0} downline langsung`,
        label: `${m.jabatan} ${m.no_id || ""} · ${m.nama}`,
      }));
      if (!saringCabang.value) totalAkun = metaJabatan.value.reduce((s, j) => s + j.jumlah, 0); // jumlah nasional
      // Owner: tampil di daftar awal (tanpa saringan), atau bila yang diketik cocok (owner / OW01 / nama / No Member Owner)
      const o = owner.value;
      const ql = q.toLowerCase();
      const cocokOwner = !q ? !saringJab.value && !saringCabang.value
        : (ql.length >= 2 && ["owner", "seluruh struktur", "semua"].some((k) => k.startsWith(ql) || ql.startsWith(k)))
          || (!!o && `${o.no_id} ${o.nama} ${noMember(o.id)}`.toLowerCase().includes(ql));
      if (isSuperadmin && cocokOwner) {
        daftar.unshift({ id: "owner", mvo_type_id: "superadmin", jab: "OWNER", judul: `${o?.no_id || "OW01"} · ${o?.nama || "Owner"} — Seluruh struktur`,
          sub: `${totalAkun.toLocaleString("id-ID")} akun aktif di bawah Owner · buka bertahap lewat tanda ›, atau Buka semua`, label: "OWNER · Seluruh struktur" });
      }
      // Pemegang hak: ketua gerbongnya sendiri di atas (bisa dibuka seluruhnya)
      if (!saringJab.value && !saringCabang.value) {
        const cocok = (c) => !q || `${c.no_id} ${c.nama}`.toLowerCase().includes(q.toLowerCase());
        daftar.unshift(...gerbong.value.filter(cocok).map((c) => ({ id: c.id, jab: c.jabatan,
          judul: `${c.no_id || ""} · ${c.nama}`, sub: "Seluruh gerbong Anda", label: `${c.jabatan} ${c.no_id || ""} · ${c.nama}` })));
      }
      hasilCari.value = daftar;
      adaLagi.value = !!data.ada_lagi;
    } catch {
      if (no === nomorCari) hasilCari.value = [];
    } finally {
      if (no === nomorCari) mencari.value = false;
    }
  }, segera ? 0 : 350);
}
function pilihJab(id) {
  saringJab.value = id;
  cari(teksCari.value, true);
}
async function bukaTim(id) {
  if (!id) return;
  const kunci = id; // "owner" atau id ketua tim (dipakai lagi setelah simpan)
  if (panel.value.some((p) => p.kunci === id)) {
    pilihTim.value = null;
    return;
  }
  memuat.value = true;
  try {
    const { data } = await api.get("/mutasi/bagan", { params: { akar: id } });
    const a = { ...asli.value };
    for (const n of data.data) a[n.id] = n;
    if (data.upline && !a[data.upline.id]) a[data.upline.id] = { ...data.upline, luar: true };
    asli.value = a;
    if (id === "owner") id = data.data.find((n) => n.owner).id;
    const p = { kunci, akar: id, upline: data.upline?.id ?? null, ids: new Set(data.data.map((n) => n.id)) };
    panel.value = panel.value.length >= 2 ? [panel.value[0], p] : [...panel.value, p];
    // Tim kecil langsung terbuka semua; tim besar sampai downline langsung ketua tim
    const b = new Set(buka.value);
    b.add(id);
    for (const n of data.data) if (data.data.length <= 150 || n.parent_id === id) b.add(n.id);
    buka.value = b;
  } catch (e) {
    toast(e.response?.data?.message || "Gagal memuat tim.");
  } finally {
    memuat.value = false;
    pilihTim.value = null;
    teksCari.value = "";
  }
}
function tutupPanel(i) {
  panel.value = panel.value.filter((_, j) => j !== i);
}

// Keadaan akhir menurut pratinjau
const akhir = computed(() => {
  const m = new Map();
  for (const n of Object.values(asli.value)) {
    m.set(n.id, { ...n, kosong: !!n.kosong, peran: null, berubah: false, no_id_lama: n.no_id });
  }
  for (const b of hasil.value?.baris || []) {
    m.set(b.id, {
      id: b.id, nama: b.nama, no_id: b.no_id_baru, no_id_lama: b.no_id_lama, mvo_type_id: b.mvo_type_id, parent_id: b.parent_id,
      kosong: b.kosong, peran: b.peran, asal_id: b.asal_id, luar: asli.value[b.id]?.luar,
      berubah: !b.kosong && (b.no_id_baru !== b.no_id_lama || b.jabatan_baru !== b.jabatan_lama || b.atasan_baru !== b.atasan_lama),
    });
  }
  return m;
});
const urutNoId = (a, b) => levelJab(a.mvo_type_id) - levelJab(b.mvo_type_id)
  || String(a.no_id || "").localeCompare(String(b.no_id || ""), undefined, { numeric: true }) || a.nama?.localeCompare(b.nama || "");
const idOwner = computed(() => Object.values(asli.value).find((n) => n.owner)?.id ?? null);
const anak = computed(() => {
  const m = new Map();
  for (const n of akhir.value.values()) {
    if (n.peran === "tunggu" || n.owner) continue;
    const up = n.parent_id ?? idOwner.value;
    if (up == null) continue;
    if (!m.has(up)) m.set(up, []);
    m.get(up).push(n);
  }
  for (const l of m.values()) l.sort(urutNoId);
  return m;
});
const kursiKosong = computed(() => hasil.value?.ringkasan?.kursi_kosong || []);
const idKosong = computed(() => new Set(kursiKosong.value.map((k) => k.id)));
const bangku = computed(() => hasil.value?.ringkasan?.bangku || []);
const kursiBebas = computed(() => {
  // Nomor yang masih dipakai orang, atau kursi kosong yang masih punya downline (menunggu / dibiarkan)
  const dipegang = new Set([...akhir.value.values()].map((n) => n.no_id));
  return (hasil.value?.baris || []).filter((b) => !b.kosong && b.no_id_lama && b.no_id_lama !== b.no_id_baru && !dipegang.has(b.no_id_lama))
    .map((b) => ({ no_id: b.no_id_lama, jabatan: b.jabatan_lama }));
});
const tim = (id) => {
  let j = 0;
  const tumpuk = [...(anak.value.get(id) || [])];
  while (tumpuk.length) {
    const n = tumpuk.pop();
    if (!n.kosong) j++;
    tumpuk.push(...(anak.value.get(n.id) || []));
  }
  return j;
};

// Akar panel = kursi ketua tim: pemegang No ID kursinya sekarang, kursi kosongnya, atau orangnya
function akarPanel(p) {
  const a = asli.value[p.akar];
  for (const n of akhir.value.values()) {
    if (!n.kosong && n.id !== p.akar && a.no_id && n.no_id === a.no_id && n.mvo_type_id === a.mvo_type_id) return n.id;
  }
  for (const n of akhir.value.values()) if (n.kosong && n.asal_id === p.akar) return n.id;
  return p.akar;
}
function uplinePanel(p) {
  const akar = akhir.value.get(akarPanel(p));
  const id = akar?.parent_id ?? null;
  const u = id != null ? akhir.value.get(id) : null;
  return { id: id ?? "owner", owner: !!akar?.owner, label: u ? `${namaJab(u.mvo_type_id)} ${u.no_id || ""} · ${u.nama}` : "Owner" };
}
function barisPanel(p) {
  return barisDari(akarPanel(p));
}
function barisDari(akar) {
  const hasilBaris = [];
  const jalan = (id, depth) => {
    const n = akhir.value.get(id);
    if (!n) return;
    const kids = anak.value.get(id) || [];
    hasilBaris.push({ n, depth, punyaAnak: kids.length > 0, tim: tim(id), calon: n.parent_id != null && idKosong.value.has(n.parent_id) && !n.kosong });
    if (buka.value.has(id)) for (const c of kids) jalan(c.id, depth + 1);
  };
  jalan(akar, 0);
  return hasilBaris;
}
// Isi setiap panel: pohon tim, lalu anggota tim yang kini berada di bawah upline lain (mis. kursi yang ikut
// orang yang naik ke luar tim) supaya kursi kosong & calon naiknya tetap terlihat dan bisa digeser.
// Semua keturunan (menurut susunan akhir), tidak peduli baris itu sedang terbuka atau tertutup
function keturunanSemua(akar) {
  const hasilSet = new Set([akar]);
  const tumpuk = [akar];
  while (tumpuk.length) {
    for (const c of anak.value.get(tumpuk.pop()) || []) {
      if (!hasilSet.has(c.id)) {
        hasilSet.add(c.id);
        tumpuk.push(c.id);
      }
    }
  }
  return hasilSet;
}
const tampilan = computed(() => {
  const utama = panel.value.map((p) => barisPanel(p));
  const terlihat = new Set(utama.flatMap((rows) => rows.map((r) => r.n.id)));
  // Masih di dalam pohon salah satu panel (walau barisnya tertutup) = bukan "pindah ke luar tim"
  const dalamPohon = new Set(panel.value.flatMap((p) => [...keturunanSemua(akarPanel(p))]));
  return panel.value.map((p, i) => {
    const bagian = [{ judul: null, rows: utama[i] }];
    const milik = (n) => p.ids.has(n.id) || (n.kosong && p.ids.has(n.asal_id));
    const luar = [...akhir.value.values()].filter((n) => milik(n) && !dalamPohon.has(n.id) && !terlihat.has(n.id) && n.peran !== "tunggu");
    const setLuar = new Set(luar.map((n) => n.id));
    for (const n of luar.filter((x) => !setLuar.has(x.parent_id)).sort(urutNoId)) {
      const up = n.parent_id != null ? akhir.value.get(n.parent_id) : null;
      const rows = barisDari(n.id).filter((r) => !terlihat.has(r.n.id));
      rows.forEach((r) => terlihat.add(r.n.id));
      bagian.push({ judul: `Pindah ke luar tim ini — sekarang di bawah ${up ? `${up.no_id || ""} ${up.nama || "kursi kosong"}`.trim() : "Owner"}`, rows });
    }
    return bagian;
  });
});
function lipat(id) {
  const b = new Set(buka.value);
  b.has(id) ? b.delete(id) : b.add(id);
  buka.value = b;
}
function bukaSemua(p, ya) {
  const b = new Set(buka.value);
  const tumpuk = [akarPanel(p)];
  while (tumpuk.length) {
    const id = tumpuk.pop();
    ya ? b.add(id) : b.delete(id);
    tumpuk.push(...(anak.value.get(id) || []).map((n) => n.id));
  }
  if (!ya) b.add(akarPanel(p));
  buka.value = b;
}
// Setelah setiap perubahan: buka cabang yang berisi kursi kosong / akun yang berubah supaya terlihat
function bukaYangBerubah() {
  const b = new Set(buka.value);
  for (const n of akhir.value.values()) {
    if (!n.berubah && !n.kosong) continue;
    let cur = n.parent_id;
    for (let i = 0; cur != null && i < 12; i++) {
      b.add(cur);
      cur = akhir.value.get(cur)?.parent_id;
    }
    if (n.kosong) b.add(n.id);
  }
  buka.value = b;
}

const namaOrang = (id) => akhir.value.get(id)?.nama || asli.value[id]?.nama || bangku.value.find((o) => o.id === id)?.nama || "";
// No ID kursi (keadaan awal) yang sekarang ditempati orang ini; null = bangku tunggu / kursi baru di rencana
function kursiDari(id) {
  const r = baris.value[id];
  const a = asli.value[id];
  if (!r) return a?.no_id ?? null;
  if (r.tunggu) return null;
  if (r.no_id) return r.no_id;
  if (r.lepas || (r.mvo_type_id && r.mvo_type_id !== a?.mvo_type_id)) return null;
  return a?.no_id ?? null;
}

// Terapkan perubahan: periksa ke server dulu; bila melanggar aturan, bagan tidak berubah
function rapikan(r) {
  const a = asli.value[r.user_id];
  const x = { ...r };
  for (const k of Object.keys(x)) if (x[k] === undefined || x[k] === false) delete x[k];
  if (a && x.no_id === a.no_id) delete x.no_id;
  if (a && x.mvo_type_id === a.mvo_type_id && !x.lepas) delete x.mvo_type_id;
  if (a && "parent_id" in x && x.parent_id === a.parent_id && !x.lepas) delete x.parent_id;
  return Object.keys(x).length > 1 ? x : null;
}
const langkahBagan = (akun, kosong) => [{ jenis: "atur", sumber: "bagan", judul: "Mutasi Bagan", akun },
  ...kosong.map((no) => ({ jenis: "kosongkan", no_id_tujuan: no }))];
async function ubah(tambahan, teks, kosongBaru = biarkan.value) {
  const baru = { ...baris.value };
  for (const [id, r] of Object.entries(tambahan)) {
    const x = rapikan({ user_id: Number(id), ...r });
    if (x) baru[id] = x;
    else delete baru[id];
  }
  memuat.value = true;
  try {
    let data = null;
    const akun = Object.values(baru);
    if (akun.length) {
      const res = await api.post("/mutasi/pratinjau", { langkah: langkahBagan(akun, kosongBaru) })
        .catch((e) => ({ data: e.response?.data || { errors: ["Gagal memeriksa perubahan."] } }));
      data = res.data;
      if (data?.errors?.length) {
        const sisa = data.errors.filter((e) => !/^Tidak ada perubahan/.test(e));
        if (sisa.length) {
          toast(`Tidak bisa: ${sisa.slice(0, 2).join(" ")}`);
          return false;
        }
        data = null; // semua kembali seperti semula
      }
    }
    langkah.value = [...langkah.value, { teks, baris: baris.value, hasil: hasil.value, biarkan: biarkan.value }];
    baris.value = data ? baru : {};
    // Kursi yang sudah terisi lagi tidak perlu dicatat "dibiarkan"
    biarkan.value = data ? kosongBaru.filter((no) => (data.ringkasan?.kursi_kosong || []).some((k) => k.no_id === no)) : [];
    hasil.value = data;
    bukaYangBerubah();
    return true;
  } finally {
    memuat.value = false;
  }
}
function batal() {
  const l = langkah.value.at(-1);
  if (!l) return;
  baris.value = l.baris;
  biarkan.value = l.biarkan || [];
  hasil.value = l.hasil;
  langkah.value = langkah.value.slice(0, -1);
}
function ulang() {
  baris.value = {};
  biarkan.value = [];
  hasil.value = null;
  langkah.value = [];
}

// Seret (desktop)
const geser = ref(null);
const sorot = ref(null);
function mulai(e, jenis, id) {
  geser.value = { jenis, id };
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", String(id));
}
function selesai() {
  geser.value = null;
  sorot.value = null;
}
function ambilGeser() {
  const g = geser.value;
  selesai();
  return g;
}

// Ketuk (HP): ketuk orang, lalu ketuk kursi / + downline / bangku
const dipilih = ref(null);
function ketukOrang(n) {
  if (!props.ketuk) return;
  if (n.owner && dipilih.value == null) return;
  const diBangku = bangku.value.some((o) => o.id === n.id);
  if (dipilih.value != null && dipilih.value !== n.id && !diBangku) return ketukKursi(akhir.value.get(n.id));
  dipilih.value = dipilih.value === n.id ? null : n.id;
}
function ketukKursi(n) {
  if (!props.ketuk || dipilih.value == null || dipilih.value === n.id) return;
  geser.value = { jenis: "orang", id: dipilih.value };
  dipilih.value = null;
  keKursi(n);
}
function ketukDownline(u) {
  if (!props.ketuk || dipilih.value == null) return;
  geser.value = { jenis: "orang", id: dipilih.value };
  dipilih.value = null;
  keDownline(u);
}
function ketukBangku() {
  if (!props.ketuk || dipilih.value == null) return;
  geser.value = { jenis: "orang", id: dipilih.value };
  dipilih.value = null;
  keBangku();
}

// Orang → kursi kosong: langsung mengisi. Orang → orang lain: menu pilihan.
function keKursi(target) {
  const g = ambilGeser();
  if (!g || g.jenis !== "orang" || g.id === target.id) return;
  const P = g.id;
  if (target.owner) return bukaMenu(P, target.id, null);
  if (target.kosong) {
    if (!target.no_id) return toast("Kursi ini belum bernomor. Pakai + downline pada upline-nya.");
    return ubah({ [P]: { no_id: target.no_id } }, `${namaOrang(P)} mengisi kursi ${target.no_id} (${namaJab(target.mvo_type_id)})`);
  }
  bukaMenu(P, target.id, target.id);
}
// Orang → + downline
function keDownline(u) {
  const g = ambilGeser();
  if (!g || g.jenis !== "orang" || g.id === u) return;
  if (typeof u === "number" && u < 0) return toast("Isi dulu kursi kosong ini sebelum menambah downline di bawahnya.");
  bukaMenu(g.id, u, null);
}
// Kursi kosong dibiarkan kosong (timnya tetap, No ID tidak berubah) / dibatalkan
function jadiBiarkan(k, ya) {
  const no = k.no_id;
  const daftar = ya ? [...new Set([...biarkan.value, no])] : biarkan.value.filter((x) => x !== no);
  ubah({}, ya ? `Kursi ${no} (${k.jabatan}) dibiarkan kosong` : `Kursi ${no} tidak jadi dibiarkan kosong`, daftar);
}
// Kotak kursi kosong: Pilih orang lain… / Pindahkan tim ke upline lain (sama dengan Mutasi Baru)
const pilihKursi = reactive({ show: false, jenis: "orang", kursi: null });
function bukaPilihKursi(jenis, k) {
  Object.assign(pilihKursi, { show: true, jenis, kursi: k });
}
function pilihPengganti(m) {
  const k = pilihKursi.kursi;
  pilihKursi.show = false;
  ubah({ [m.id]: { ...(baris.value[m.id] || {}), no_id: k.no_id } }, `${m.nama} mengisi kursi ${k.no_id} (${k.jabatan})`);
}
function pilihPenampung(u) {
  const k = pilihKursi.kursi;
  pilihKursi.show = false;
  const tambahan = {};
  for (const c of anak.value.get(k.id) || []) {
    if (c.kosong) continue;
    const r = { ...(baris.value[c.id] || {}), parent_id: u.id };
    delete r.lepas;
    delete r.tunggu;
    tambahan[c.id] = r;
  }
  if (!Object.keys(tambahan).length) return toast("Kursi ini tidak punya downline orang untuk dipindah.");
  ubah(tambahan, `Downline kursi ${k.no_id || k.jabatan} (${Object.keys(tambahan).length} orang) dipindah ke ${u.nama}`);
}
function isiKursi(P, k) {
  ubah({ [P]: { no_id: k.no_id } }, `${namaOrang(P)} naik mengisi kursi ${k.no_id} (${k.jabatan})`);
}

// Menu: P dilepas di atas U (calon upline; null/Owner = langsung di bawah Owner); Q = orang yang ditimpa (tukar / bangku)
const menu = ref(null);
const dialogMenu = ref(false);
function bukaMenu(P, u, Q) {
  const U = u === "owner" || akhir.value.get(u)?.owner ? null : u;
  const nU = U != null ? akhir.value.get(U) : null;
  const namaU = U == null ? "Owner" : `${namaJab(nU?.mvo_type_id)} ${nU?.no_id || ""} · ${namaOrang(U)}`;
  const lv = U == null ? -1 : levelJab(nU?.mvo_type_id);
  const bolehDi = (j) => !!j && (U == null ? j.level <= 1 : j.mode === "turunan" ? j.level === lv + 1 : j.level > lv);
  const nP = akhir.value.get(P);
  const diBangku = bangku.value.some((o) => o.id === P);
  const tP = String(nP?.mvo_type_id ?? bangku.value.find((o) => o.id === P)?.mvo_type_id ?? "");
  const lvP = levelJab(tP);
  const timP = diBangku ? 0 : tim(P);
  const sendiri = jabatan.value.filter(bolehDi);
  const gerbong = !diBangku && timP > 0 && !baris.value[P] ? sendiri.filter((j) => Math.abs(j.level - lvP) === 1) : [];
  const opsi = [];
  const samaJab = Q != null && String(akhir.value.get(Q)?.mvo_type_id) === tP;
  // Tukar beserta tim (sama dengan Tukar posisi di Mutasi Baru): hanya jabatan sama & keduanya belum diubah di rencana ini
  if (Q != null && samaJab && !diBangku && !baris.value[P] && !baris.value[Q] && kursiDari(P) && kursiDari(Q)) {
    opsi.push({ aksi: "tukar_tim", judul: `Tukar posisi beserta timnya dengan ${namaOrang(Q)}`,
      ket: "Saling bertukar kursi (No ID & upline); tim masing-masing ikut orangnya. Jabatan tidak berubah." });
  }
  if (Q != null && kursiDari(P) && kursiDari(Q)) {
    opsi.push({ aksi: "tukar", judul: `Tukar posisi, tim tetap di kursinya`, ket: "Saling bertukar jabatan, No ID, dan upline. Downline tetap di kursinya (pindah ke orang yang kini menempati kursi itu)." });
  }
  if (sendiri.length) {
    opsi.push({ aksi: "sendiri", judul: `Naik / turun sendiri menjadi downline ${namaU}`,
      ket: timP ? `Pindah ke kursi baru; kursi lamanya kosong dan ${timP} orang timnya tetap di sana — lalu pilih siapa yang naik.` : "Pindah ke kursi baru dengan jabatan pilihan." });
  }
  if (!diBangku && timP > 0 && bolehDi(jab(tP)) && nP?.parent_id !== U) {
    opsi.push({ aksi: "tim", judul: `Pindah beserta timnya, tetap ${namaJab(tP)}`, ket: `Kursi ${nP?.no_id || ""} dan ${timP} orang timnya ikut ke bawah ${namaU}.` });
  }
  if (gerbong.length) {
    opsi.push({ aksi: "gerbong", judul: "Naik / turun beserta seluruh timnya (1 jenjang)",
      ket: `${namaOrang(P)} dan ${timP} orang timnya sama-sama naik/turun 1 jenjang (mis. GM jadi FO, Supplier jadi GM).` });
  }
  if (Q != null) {
    opsi.push({ aksi: "bangku", judul: `Ambil kursi ${namaOrang(Q)}; ${namaOrang(Q)} ke bangku tunggu`, ket: "Pemegang lama ditempatkan belakangan." });
  }
  if (!opsi.length) return toast(`Tidak ada jabatan yang bisa berada di bawah ${namaU}.`);
  const bawah = (l) => l.find((j) => j.level === lv + 1)?.id || l[0]?.id || null;
  menu.value = {
    P, U, Q, namaU, opsi, pilihSendiri: sendiri, pilihGerbong: gerbong,
    jabSendiri: bawah(sendiri), jabGerbong: gerbong.find((j) => j.level === lv + 1)?.id || gerbong[0]?.id || null,
    infoP: diBangku
      ? `${namaOrang(P)} di bangku tunggu (sebelumnya ${bangku.value.find((o) => o.id === P)?.jabatan || namaJab(tP)} ${bangku.value.find((o) => o.id === P)?.no_id_lama || ""})`
      : `${namaOrang(P)} sekarang ${namaJab(tP)} ${nP?.no_id || ""}${timP ? ` dengan ${timP} orang timnya` : ""}`,
    // Bawaan: jabatan sama dengan Q = tukar beserta tim (atau tukar biasa); jabatan tidak berubah di bawah U = pindah beserta tim
    aksi: opsi.some((o) => o.aksi === "tukar_tim") ? "tukar_tim"
      : samaJab && opsi.some((o) => o.aksi === "tukar") ? "tukar"
      : opsi.some((o) => o.aksi === "tim") && String(bawah(sendiri)) === tP ? "tim"
      : opsi.some((o) => o.aksi === "sendiri") ? "sendiri" : opsi[0].aksi,
  };
  menu.value.noId = null;
  menu.value.pilihNoId = [{ teks: "Otomatis", no_id: null }];
  dialogMenu.value = true;
}

// Pilihan No ID di menu: nomor kosong menurut server, dikurangi nomor yang sudah dipakai di rencana ini
let urutMuatNoId = 0;
watch(() => menu.value && dialogMenu.value && [menu.value.aksi, menu.value.jabSendiri], async () => {
  const m = menu.value;
  if (!m || !dialogMenu.value || (m.aksi !== "sendiri" && m.aksi !== "tim")) return;
  const jabNo = m.aksi === "sendiri" ? m.jabSendiri : akhir.value.get(m.P)?.mvo_type_id;
  const nomor = ++urutMuatNoId;
  m.memuatNoId = true;
  try {
    const { data } = await api.get("/mutasi/nomor", { params: { mvo_type_id: jabNo, parent_id: m.U ?? undefined } });
    if (nomor !== urutMuatNoId) return;
    const dipakai = new Set([...akhir.value.values()].map((n) => n.no_id).filter(Boolean));
    const bebas = (data.data || []).filter((n) => !n.pemegang && !n.kursiKosong && !dipakai.has(n.no_id));
    m.pilihNoId = [{ teks: "Otomatis", no_id: null }, ...bebas.map((n) => ({ teks: `${n.no_id} — kosong`, no_id: n.no_id }))];
    if (m.noId && !bebas.some((n) => n.no_id === m.noId)) m.noId = null;
  } catch {
    m.pilihNoId = [{ teks: "Otomatis", no_id: null }];
  } finally {
    if (nomor === urutMuatNoId) m.memuatNoId = false;
  }
}, { immediate: false });

function terapkanMenu() {
  const { P, U, Q, namaU, aksi, jabSendiri, jabGerbong, noId } = menu.value;
  dialogMenu.value = false;
  if (aksi === "tukar_tim") {
    const upP = akhir.value.get(P)?.parent_id ?? null;
    const upQ = akhir.value.get(Q)?.parent_id ?? null;
    return ubah({ [P]: { no_id: kursiDari(Q), parent_id: upQ, bawa_tim: true }, [Q]: { no_id: kursiDari(P), parent_id: upP, bawa_tim: true } },
      `Tukar posisi beserta tim: ${namaOrang(P)} ↔ ${namaOrang(Q)}`);
  }
  if (aksi === "tukar") {
    const kQ = kursiDari(Q);
    const kP = kursiDari(P);
    return ubah({ [P]: { no_id: kQ }, [Q]: { no_id: kP } }, `Tukar posisi: ${namaOrang(P)} ↔ ${namaOrang(Q)}`);
  }
  if (aksi === "bangku") {
    const kQ = kursiDari(Q);
    if (!kQ) return toast(`Kursi ${namaOrang(Q)} baru dibuat di rencana ini, jadi belum bisa ditempati orang lain. Tekan Batal atau simpan dulu.`);
    return ubah({ [P]: { no_id: kQ }, [Q]: { tunggu: true } }, `${namaOrang(P)} menempati kursi ${kQ}; ${namaOrang(Q)} ke bangku tunggu`);
  }
  if (aksi === "tim") {
    const r = { ...(baris.value[P] || {}), parent_id: U };
    delete r.lepas;
    delete r.tunggu;
    if (noId) r.no_id = noId;
    return ubah({ [P]: r }, `${namaOrang(P)} beserta timnya pindah ke bawah ${namaU}${noId ? ` (No ID ${noId})` : ''}`);
  }
  if (aksi === "gerbong") {
    return ubah({ [P]: { parent_id: U, mvo_type_id: jabGerbong, gerbong: true } }, `${namaOrang(P)} beserta timnya menjadi ${namaJab(jabGerbong)} di bawah ${namaU}`);
  }
  return ubah({ [P]: { parent_id: U, mvo_type_id: jabSendiri, lepas: true, ...(noId ? { no_id: noId } : {}) } },
    `${namaOrang(P)} menjadi ${namaJab(jabSendiri)}${noId ? ` ${noId}` : ''} di bawah ${namaU}`);
}

// Orang → bangku tunggu
function keBangku() {
  const g = ambilGeser();
  if (!g || g.jenis !== "orang") return;
  if (bangku.value.some((o) => o.id === g.id)) return;
  ubah({ [g.id]: { tunggu: true } }, `${namaOrang(g.id)} ke bangku tunggu`);
}

// Ringkasan & simpan
const perubahan = computed(() => (hasil.value?.baris || []).filter((b) => !b.kosong && b.peran !== "tunggu"
  && (b.no_id_baru !== b.no_id_lama || b.jabatan_baru !== b.jabatan_lama || b.atasan_baru !== b.atasan_lama)));
const jumlahAkun = computed(() => Object.keys(baris.value).length);
const ringkas = computed(() => (hasil.value ? `${jumlahAkun.value} akun digeser, ${perubahan.value.length} akun terdampak, `
  + `${hasil.value.ringkasan?.no_id_berubah || 0} No ID berubah` : ""));
const bolehSimpan = computed(() => jumlahAkun.value > 0 && !!hasil.value && !kursiKosong.value.some((k) => !k.dibiarkan) && !bangku.value.length && !memuat.value);
const dialogSimpan = ref(false);
const esc = (s) => String(s ?? "-").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const lamaBaru = (a, b) => ((a || "-") === (b || "-") ? esc(a) : `<span class="lama">${esc(a)}</span> → <b>${esc(b)}</b>`);

async function simpan() {
  memuat.value = true;
  try {
    const { data } = await api.post("/mutasi", {
      langkah: langkahBagan(Object.values(baris.value), biarkan.value),
      catatan: catatan.value?.trim() || null,
    });
    dialogSimpan.value = false;
    toast(data.message, "success");
    const akar = panel.value.map((p) => p.kunci);
    ulang();
    catatan.value = "";
    panel.value = [];
    asli.value = {};
    for (const id of akar) await bukaTim(id);
    emit("tersimpan");
  } catch (e) {
    toast(e.response?.data?.message || "Gagal menyimpan. Tidak ada perubahan yang tersimpan.");
  } finally {
    memuat.value = false;
  }
}

defineExpose({ bukaTim });
</script>

<style scoped>
.bg-atas {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.bg-cari {
  flex: 1 1 320px;
  max-width: 520px;
}
.bg-cabang {
  flex: 0 1 200px;
  min-width: 160px;
}
.bg-jab {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: -4px 0 12px;
}
.bg-jab .jml {
  opacity: 0.7;
  font-size: 0.72rem;
}
.bg-pilih .kursi {
  cursor: pointer;
}
.meta {
  font-size: 0.8rem;
  color: var(--baba-muted);
}
.kosong-info {
  text-align: center;
  color: var(--baba-muted);
  padding: 40px 16px;
}
.bg-isi {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 12px;
}
.bg-panel-wrap {
  display: flex;
  gap: 12px;
  min-width: 0;
}
.bg-panel {
  flex: 1 1 0;
  min-width: 0;
  border: 1px solid var(--baba-border);
  border-radius: 10px;
  background: var(--baba-surface);
  overflow: hidden;
}
.bg-panel-kepala {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px 6px 12px;
  background: var(--baba-ink);
  color: var(--baba-gold);
  font-size: 0.85rem;
}
.bg-panel-kepala .v-btn {
  color: var(--baba-gold-light);
}
.bg-pohon {
  overflow: auto;
}
.bg-baris {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 3px 8px;
  border-bottom: 1px solid var(--baba-border);
  font-size: 0.85rem;
  white-space: nowrap;
}
.bg-upline {
  background: var(--baba-bg);
}
.bg-sub {
  padding: 6px 10px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--baba-gold-dark);
  background: var(--baba-gold-soft);
  border-top: 2px solid var(--baba-gold);
  border-bottom: 1px solid var(--baba-border);
}
.bg-baris.berubah {
  background: var(--baba-gold-soft);
}
.bg-baris.kosong {
  background: color-mix(in srgb, var(--baba-danger) 10%, transparent);
}
.bg-baris.calon .orang {
  outline: 2px solid var(--baba-gold);
}
.bg-baris.sorot {
  box-shadow: inset 0 0 0 2px var(--baba-gold-dark);
}
.bg-baris.dipilih .orang,
.orang.dipilih {
  background: var(--baba-ink);
  color: var(--baba-gold);
}
.bg-lipat {
  width: 20px;
  display: inline-flex;
  justify-content: center;
}
.bg-lipat.tak {
  visibility: hidden;
}
.kursi {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  border-left: 3px solid currentColor;
  background: color-mix(in srgb, currentColor 12%, transparent);
}
.kotak-naik.dibiarkan {
  border-left-color: var(--baba-muted);
  background: #f6f6f4;
  color: inherit;
}
.kotak-naik .kk-tombol {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.kotak-naik .calon-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 6px 0 4px;
}
.calon-btn {
  text-transform: none;
  letter-spacing: 0;
  max-width: 100%;
}
.menu-aksi :deep(.v-label) {
  opacity: 1;
  white-space: normal;
}
.menu-aksi :deep(.v-radio) {
  margin-bottom: 8px;
  align-items: flex-start;
}
.jab-tm { color: var(--baba-jab-tm); }
.jab-mvo { color: var(--baba-jab-mvo); }
.jab-regional { color: var(--baba-jab-regional); }
.jab-fo { color: var(--baba-jab-fo); }
.jab-gm { color: var(--baba-jab-gm); }
.jab-supplier { color: var(--baba-jab-supplier); }
.jab-dist { color: var(--baba-jab-dist); }
.jab-reseller { color: var(--baba-jab-reseller); }
.jab-owner { color: var(--baba-ink); }
.orang {
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--baba-border);
  background: var(--baba-surface);
  color: var(--baba-ink);
  cursor: grab;
  overflow: hidden;
  text-overflow: ellipsis;
}
.orang .nm {
  font-size: 0.72rem;
  color: var(--baba-muted);
}
.kosong-teks {
  color: var(--baba-danger);
  font-weight: 600;
}
.ubah-noid {
  font-size: 0.75rem;
  color: var(--baba-gold-dark);
  font-weight: 700;
}
.label-calon {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
  background: var(--baba-gold);
  color: var(--baba-ink);
}
.tim {
  font-size: 0.72rem;
  color: var(--baba-muted);
}
.bg-plus {
  display: none;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px dashed var(--baba-gold-dark);
  color: var(--baba-gold-dark);
  cursor: copy;
}
.sedang-geser .bg-plus,
.mode-ketuk .bg-plus {
  display: inline-block;
}
.bg-plus.sorot {
  background: var(--baba-gold);
  color: var(--baba-ink);
}
.bg-samping {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.bangku,
.rencana {
  border: 1px solid var(--baba-border);
  border-radius: 10px;
  background: var(--baba-surface);
  padding: 10px 12px;
}
.bangku {
  border-style: dashed;
  min-height: 90px;
}
.bangku.sorot {
  border-color: var(--baba-gold-dark);
  background: var(--baba-gold-soft);
}
.bangku-orang {
  display: block;
  margin-top: 6px;
}
.judul-kecil {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--baba-ink);
}
.daftar-langkah {
  padding-left: 18px;
  font-size: 0.82rem;
}
.peringatan {
  margin-top: 8px;
  font-size: 0.8rem;
  padding: 6px 8px;
  border-radius: 8px;
  border-left: 3px solid var(--baba-danger);
  background: color-mix(in srgb, var(--baba-danger) 8%, transparent);
}
.tombol {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}
.hint-ketuk {
  position: fixed;
  left: 12px;
  right: 12px;
  top: 72px; /* di bawah header aplikasi; bawah layar terisi menu & pemutar musik */
  z-index: 20;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--baba-ink);
  color: var(--baba-gold-light);
  box-shadow: var(--baba-shadow);
  font-size: 0.85rem;
}
.tabel {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}
.tabel th {
  text-align: left;
  background: var(--baba-ink);
  color: var(--baba-gold);
  padding: 6px 8px;
}
.tabel td {
  padding: 5px 8px;
  border-top: 1px solid var(--baba-border);
}
.tabel :deep(.lama) {
  color: var(--baba-muted);
  text-decoration: line-through;
}
@media (max-width: 959px) {
  .bg-isi {
    grid-template-columns: 1fr;
  }
  .bg-panel-wrap {
    flex-direction: column;
  }
  .bg-panel {
    flex: none;
  }
  /* HP: baris dua tingkat — kursi, jumlah tim & + downline di atas; orangnya selebar baris di bawah */
  .mode-ketuk .bg-baris:not(.bg-upline) {
    flex-wrap: wrap;
    row-gap: 4px;
    padding-top: 6px;
    padding-bottom: 6px;
  }
  .mode-ketuk .bg-baris .orang,
  .mode-ketuk .bg-baris .kosong-teks {
    order: 5;
    flex: 1 0 calc(100% - 26px);
    margin-left: 26px;
    white-space: normal;
  }
}
</style>
