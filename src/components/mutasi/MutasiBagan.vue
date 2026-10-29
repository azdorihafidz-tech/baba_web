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
              <span class="kursi" :class="kelasJab(r.n.mvo_type_id)" :draggable="!r.n.kosong && !r.n.owner" :title="r.n.owner ? 'Owner' : 'Geser kursi ini beserta timnya'"
                @dragstart="mulai($event, 'kursi', r.n.id)" @dragend="selesai">
                <v-icon v-if="!r.n.kosong && !r.n.owner" size="14" class="pegangan">mdi-drag-vertical</v-icon>{{ namaJab(r.n.mvo_type_id) }} · {{ r.n.no_id || 'baru' }}
              </span>
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
          <div v-if="kursiKosong.length" class="peringatan">
            <div v-for="k in kursiKosong" :key="k.id">Kursi <b>{{ k.no_id || k.jabatan }}</b> ({{ k.jabatan }}) kosong, masih ada
              {{ k.jumlah_downline }} downline: geser salah satu orang ke kursi ini (calon naik bertanda emas).</div>
          </div>
          <div v-if="bangku.length" class="peringatan">{{ bangku.length }} orang di bangku tunggu: tempatkan dulu ke kursi.</div>
          <div v-if="ringkas" class="meta mt-2">{{ ringkas }}</div>
          <div class="tombol">
            <v-btn size="small" variant="outlined" prepend-icon="mdi-undo" :disabled="!langkah.length || memuat" @click="batal">Batal</v-btn>
            <v-btn size="small" variant="outlined" prepend-icon="mdi-restore" :disabled="!langkah.length || memuat" @click="ulang">Ulang dari awal</v-btn>
          </div>
          <v-btn block color="primary" class="mt-2" prepend-icon="mdi-content-save" :disabled="!bolehSimpan" :loading="memuat"
            @click="dialogSimpan = true">Simpan{{ jumlahAkun ? ` (${jumlahAkun} akun)` : '' }}</v-btn>
        </div>
      </div>
    </div>

    <!-- Kursi berisi: tukar atau pemegang ke bangku -->
    <v-dialog v-model="dialogPilihan" max-width="440">
      <v-card v-if="pilihan">
        <v-card-title class="text-h6">Kursi {{ akhir.get(pilihan.Q)?.no_id }} sudah ditempati</v-card-title>
        <v-card-text>
          <b>{{ namaOrang(pilihan.P) }}</b> digeser ke kursi <b>{{ namaOrang(pilihan.Q) }}</b>. Apa yang terjadi pada {{ namaOrang(pilihan.Q) }}?
        </v-card-text>
        <v-card-actions class="flex-column align-stretch ga-2 px-4 pb-4">
          <v-btn color="primary" variant="flat" prepend-icon="mdi-swap-horizontal" :disabled="!kursiDari(pilihan.P)" @click="pilihKursiBerisi('tukar')">
            Tukar posisi
          </v-btn>
          <v-btn variant="outlined" prepend-icon="mdi-seat-outline" @click="pilihKursiBerisi('bangku')">
            {{ namaOrang(pilihan.Q) }} ke bangku tunggu
          </v-btn>
          <v-btn variant="text" @click="dialogPilihan = false">Batal</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Downline baru: pilih jabatan -->
    <v-dialog v-model="dialogJabatan" max-width="420">
      <v-card v-if="calonDownline">
        <v-card-title class="text-h6">Jadikan downline {{ calonDownline.namaU }}</v-card-title>
        <v-card-text>
          <p class="mb-3"><b>{{ namaOrang(calonDownline.P) }}</b> pindah sendiri ke kursi baru di bawah {{ calonDownline.namaU }}; timnya tetap di kursi lama.</p>
          <v-select v-model="calonDownline.jabatan" :items="calonDownline.pilihan" item-title="name" item-value="id" label="Jabatan"
            variant="outlined" density="comfortable" hide-details />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogJabatan = false">Batal</v-btn>
          <v-btn color="primary" variant="flat" :disabled="!calonDownline.jabatan" @click="simpanDownline">Pindahkan</v-btn>
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
import { computed, onMounted, reactive, ref } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/config";
import { noMember } from "@/utils/noMember";

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
const hasil = ref(null);
const langkah = ref([]);
const memuat = ref(false);
const catatan = ref("");

onMounted(async () => {
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
      const total = metaJabatan.value.reduce((s, j) => s + j.jumlah, 0);
      const cocokOwner = !q || /^(ow|own|owne|owner|ow01|seluruh|semua)/i.test(q);
      if (isSuperadmin && !saringJab.value && !saringCabang.value && cocokOwner) {
        daftar.unshift({ id: "owner", mvo_type_id: "superadmin", jab: "OWNER", judul: "Seluruh struktur (mulai dari Owner)",
          sub: `${total.toLocaleString("id-ID")} akun aktif — buka bertahap lewat tanda ›, atau Buka semua`, label: "OWNER · Seluruh struktur" });
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
    m.set(n.id, { ...n, kosong: false, peran: null, berubah: false, no_id_lama: n.no_id });
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
const tampilan = computed(() => {
  const utama = panel.value.map((p) => barisPanel(p));
  const terlihat = new Set(utama.flatMap((rows) => rows.map((r) => r.n.id)));
  return panel.value.map((p, i) => {
    const bagian = [{ judul: null, rows: utama[i] }];
    const milik = (n) => p.ids.has(n.id) || (n.kosong && p.ids.has(n.asal_id));
    const luar = [...akhir.value.values()].filter((n) => milik(n) && !terlihat.has(n.id) && n.peran !== "tunggu");
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
async function ubah(tambahan, teks) {
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
      const res = await api.post("/mutasi/pratinjau", { langkah: [{ jenis: "atur", sumber: "bagan", judul: "Mutasi Bagan", akun }] })
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
    langkah.value = [...langkah.value, { teks, baris: baris.value, hasil: hasil.value }];
    baris.value = data ? baru : {};
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
  hasil.value = l.hasil;
  langkah.value = langkah.value.slice(0, -1);
}
function ulang() {
  baris.value = {};
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

// Orang → kursi
const pilihan = ref(null);
const dialogPilihan = ref(false);
function keKursi(target) {
  const g = ambilGeser();
  if (!g || g.jenis !== "orang" || g.id === target.id) return;
  if (target.owner) return toast("Kursi Owner tidak bisa ditempati. Untuk menaruh orang langsung di bawah Owner, pakai + downline pada baris Owner.");
  const P = g.id;
  if (target.kosong) {
    if (!target.no_id) return toast("Kursi ini belum bernomor. Pakai + downline pada upline-nya.");
    return ubah({ [P]: { no_id: target.no_id } }, `${namaOrang(P)} mengisi kursi ${target.no_id} (${namaJab(target.mvo_type_id)})`);
  }
  if (!kursiDari(target.id)) {
    return toast(`Kursi ${target.nama} baru dibuat di rencana ini, jadi belum bisa ditempati orang lain. Tekan Batal atau simpan dulu.`);
  }
  pilihan.value = { P, Q: target.id };
  dialogPilihan.value = true;
}
function pilihKursiBerisi(aksi) {
  const { P, Q } = pilihan.value;
  dialogPilihan.value = false;
  const kQ = kursiDari(Q);
  const kP = kursiDari(P);
  if (aksi === "tukar") {
    return ubah({ [P]: { no_id: kQ }, [Q]: { no_id: kP } }, `Tukar posisi: ${namaOrang(P)} ↔ ${namaOrang(Q)}`);
  }
  return ubah({ [P]: { no_id: kQ }, [Q]: { tunggu: true } }, `${namaOrang(P)} menempati kursi ${kQ}; ${namaOrang(Q)} ke bangku tunggu`);
}

// Orang / kursi → + downline
const calonDownline = ref(null);
const dialogJabatan = ref(false);
function keDownline(u) {
  const g = ambilGeser();
  if (!g) return;
  if (typeof u === "number" && u < 0) return toast("Isi dulu kursi kosong ini sebelum menambah downline di bawahnya.");
  if (g.id === u) return;
  const U = u === "owner" || akhir.value.get(u)?.owner ? null : u;
  const namaU = U == null ? "Owner" : `${akhir.value.get(U)?.no_id || ""} ${namaOrang(U)}`.trim();
  if (g.jenis === "kursi") {
    const r = { ...(baris.value[g.id] || {}), parent_id: U };
    delete r.lepas;
    delete r.tunggu;
    return ubah({ [g.id]: r }, `Kursi ${akhir.value.get(g.id)?.no_id || ""} ${namaOrang(g.id)} beserta timnya pindah ke bawah ${namaU}`);
  }
  const lv = U == null ? -1 : levelJab(akhir.value.get(U)?.mvo_type_id);
  const boleh = jabatan.value.filter((j) => (U == null ? j.level <= 1 : j.mode === "turunan" ? j.level === lv + 1 : j.level > lv));
  if (!boleh.length) return toast(`Tidak ada jabatan yang bisa berada di bawah ${namaU}.`);
  const sekarang = akhir.value.get(g.id)?.mvo_type_id ?? bangku.value.find((o) => o.id === g.id)?.mvo_type_id;
  calonDownline.value = {
    P: g.id, U, namaU, pilihan: boleh,
    // Bawaan: satu jenjang tepat di bawah upline; bila tidak ada, jabatan orang itu sekarang
    jabatan: (boleh.find((j) => j.level === lv + 1) || boleh.find((j) => j.id === String(sekarang)) || boleh[0]).id,
  };
  dialogJabatan.value = true;
}
function simpanDownline() {
  const { P, U, namaU, jabatan: j } = calonDownline.value;
  dialogJabatan.value = false;
  ubah({ [P]: { parent_id: U, mvo_type_id: j, lepas: true } }, `${namaOrang(P)} menjadi ${namaJab(j)} di bawah ${namaU}`);
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
const bolehSimpan = computed(() => jumlahAkun.value > 0 && !!hasil.value && !kursiKosong.value.length && !bangku.value.length && !memuat.value);
const dialogSimpan = ref(false);
const esc = (s) => String(s ?? "-").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const lamaBaru = (a, b) => ((a || "-") === (b || "-") ? esc(a) : `<span class="lama">${esc(a)}</span> → <b>${esc(b)}</b>`);

async function simpan() {
  memuat.value = true;
  try {
    const { data } = await api.post("/mutasi", {
      langkah: [{ jenis: "atur", sumber: "bagan", judul: "Mutasi Bagan", akun: Object.values(baris.value) }],
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
  padding: 2px 8px 2px 4px;
  border-radius: 6px;
  border-left: 3px solid currentColor;
  background: color-mix(in srgb, currentColor 12%, transparent);
  cursor: grab;
}
.pegangan {
  opacity: 0.6;
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
