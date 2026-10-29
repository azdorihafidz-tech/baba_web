<template>
  <Breadcrumb :items="[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Excel Struktur' }]" />

  <div v-isi-layar class="baba-gulir">
    <v-card class="kartu mb-3" variant="outlined">
      <div class="kartu-judul"><v-icon color="#B8890F">mdi-microsoft-excel</v-icon> Unduh Excel Struktur</div>
      <p class="meta mb-3">
        Seluruh struktur akun aktif dalam satu file Excel berbentuk pohon: urut dari Owner ke bawah, nama menjorok sesuai
        jenjang, dan baris bisa dilipat per tim. File ini juga menjadi template untuk mengubah struktur.
      </p>
      <div class="isian">
        <v-select v-model="cabang" :items="daftarCabang" item-title="label" item-value="code" label="Cabang"
          variant="outlined" density="comfortable" hide-details />
        <v-text-field v-model="tim" label="Tim (opsional)" placeholder="No ID / No Member ketua tim, mis. B07"
          variant="outlined" density="comfortable" hide-details clearable prepend-inner-icon="mdi-account-group" />
        <v-btn color="primary" size="large" prepend-icon="mdi-download" :loading="memuat" @click="unduh">Unduh Excel</v-btn>
      </div>
      <v-alert v-if="galat" type="error" variant="tonal" density="compact" class="mt-3">{{ galat }}</v-alert>
      <v-alert v-if="selesai" type="success" variant="tonal" density="compact" class="mt-3">{{ selesai }}</v-alert>
    </v-card>

    <v-card class="kartu mb-3" variant="outlined">
      <div class="kartu-judul"><v-icon color="#B8890F">mdi-file-upload-outline</v-icon> Unggah perubahan</div>
      <p class="meta mb-3">
        Isi kolom kuning (BARU) di file unduhan, simpan, lalu unggah di sini. Semua perubahan diperiksa dulu dan
        ditampilkan sebagai pratinjau; belum ada yang tersimpan.
      </p>
      <div class="isian isian--unggah">
        <v-file-input v-model="berkas" accept=".xlsx" label="File Excel Struktur (.xlsx)" variant="outlined"
          density="comfortable" hide-details prepend-icon="" prepend-inner-icon="mdi-microsoft-excel" show-size
          @update:model-value="hasil = null; galatUnggah = ''" />
        <v-btn color="primary" size="large" prepend-icon="mdi-clipboard-check-outline" :loading="memeriksa"
          :disabled="!fileDipilih" @click="periksa">Periksa</v-btn>
      </div>
      <v-alert v-if="galatUnggah" type="error" variant="tonal" density="compact" class="mt-3">{{ galatUnggah }}</v-alert>
      <v-alert v-if="tersimpan" type="success" variant="tonal" class="mt-3">
        <div>{{ tersimpan }}</div>
        <div class="meta mt-1">File yang tadi sudah tidak berlaku. Unduh ulang Excel terbaru sebelum mengubah lagi.</div>
        <v-btn class="mt-2" size="small" variant="outlined" color="#B8890F" prepend-icon="mdi-history" to="/admin/mutasi?tab=riwayat">
          Lihat di Riwayat Mutasi
        </v-btn>
      </v-alert>

      <template v-if="hasil">
        <v-alert v-if="hasil.galat.length" type="error" variant="tonal" density="compact" class="mt-3">
          Ditemukan {{ hasil.galat.length }} masalah. Perbaiki di Excel, simpan, lalu unggah dan periksa lagi.
        </v-alert>
        <v-alert v-else type="success" variant="tonal" density="compact" class="mt-3">
          Tidak ada masalah: {{ hasil.info.berubah }} baris diubah, {{ hasil.info.akun_terdampak }} akun terdampak,
          {{ hasil.info.no_id_berubah }} No ID berubah, {{ hasil.info.kode_baru }} kode akun baru.
        </v-alert>
        <div v-if="hasil.info.keterangan" class="meta mt-2">File: {{ hasil.info.keterangan }}</div>

        <div v-if="hasil.galat.length" class="galat-daftar mt-3">
          <div v-for="(g, i) in hasil.galat" :key="i" class="galat-baris">
            <span class="galat-chip">{{ g.baris ? `Baris ${g.baris}` : 'File' }}</span>
            <div><b v-if="g.nama">{{ g.nama }}: </b>{{ g.pesan }}</div>
          </div>
        </div>

        <div v-if="hasil.boleh_simpan" class="simpan-baris mt-3">
          <v-text-field v-model="catatan" label="Catatan (opsional)" placeholder="mis. Penataan struktur Oktober"
            variant="outlined" density="comfortable" hide-details maxlength="500" />
          <v-btn color="primary" size="large" prepend-icon="mdi-content-save" :loading="menyimpan" @click="konfirmasi = true">
            Simpan {{ hasil.info.berubah }} perubahan
          </v-btn>
        </div>

        <template v-if="hasil.perubahan.length">
          <div class="kartu-judul mt-4"><v-icon color="#B8890F">mdi-eye-outline</v-icon> Pratinjau ({{ hasil.perubahan.length }} akun)</div>
          <div v-if="!compact" class="tabel-wrap">
            <table class="tabel">
              <thead>
                <tr><th>Baris</th><th>Nama</th><th>Status</th><th>Jabatan</th><th>No ID</th><th>Upline</th><th>Cabang</th><th>Kode Akun</th></tr>
              </thead>
              <tbody>
                <tr v-for="p in hasil.perubahan" :key="p.id" :class="{ 'baris-kosong': p.kosong }">
                  <td>{{ p.baris || '' }}</td>
                  <td><div class="nama">{{ p.nama }}</div><div class="meta">{{ p.no_member }}</div></td>
                  <td><span class="status" :class="`status--${p.peran}`">{{ labelPeran(p.peran) }}</span></td>
                  <td v-html="lamaBaru(p.jabatan_lama, p.jabatan_baru)" />
                  <td v-html="lamaBaru(p.no_id_lama, p.no_id_baru)" />
                  <td v-html="lamaBaru(p.upline_lama, p.upline_baru)" />
                  <td v-html="lamaBaru(p.cabang_lama, p.cabang_baru)" />
                  <td v-html="lamaBaru(p.kode_lama, p.kode_baru)" />
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="kartu-hp-daftar">
            <div v-for="p in hasil.perubahan" :key="p.id" class="kartu-hp" :class="{ 'baris-kosong': p.kosong }">
              <div class="d-flex align-center ga-2">
                <span class="status" :class="`status--${p.peran}`">{{ labelPeran(p.peran) }}</span>
                <span v-if="p.baris" class="meta">Baris {{ p.baris }}</span>
              </div>
              <div class="nama mt-1">{{ p.nama }} <span class="meta">{{ p.no_member }}</span></div>
              <div class="detail-label">Jabatan</div><div class="detail-value" v-html="lamaBaru(p.jabatan_lama, p.jabatan_baru)" />
              <div class="detail-label">No ID</div><div class="detail-value" v-html="lamaBaru(p.no_id_lama, p.no_id_baru)" />
              <div class="detail-label">Upline</div><div class="detail-value" v-html="lamaBaru(p.upline_lama, p.upline_baru)" />
              <template v-if="p.cabang_lama !== p.cabang_baru">
                <div class="detail-label">Cabang</div><div class="detail-value" v-html="lamaBaru(p.cabang_lama, p.cabang_baru)" />
              </template>
              <template v-if="p.kode_lama !== p.kode_baru">
                <div class="detail-label">Kode Akun</div><div class="detail-value" v-html="lamaBaru(p.kode_lama, p.kode_baru)" />
              </template>
            </div>
          </div>
        </template>
      </template>
    </v-card>

    <v-dialog v-model="konfirmasi" max-width="460">
      <v-card>
        <v-card-title class="text-h6">Simpan perubahan struktur?</v-card-title>
        <v-card-text v-if="hasil">
          <b>{{ hasil.info.berubah }} baris</b> dari Excel disimpan sekaligus: {{ hasil.info.akun_terdampak }} akun terdampak,
          {{ hasil.info.no_id_berubah }} No ID berubah, {{ hasil.info.kode_baru }} kode akun baru. Akun yang berubah dan
          upline-nya mendapat notifikasi. Perubahan tercatat di Riwayat Mutasi.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="konfirmasi = false">Batal</v-btn>
          <v-btn color="primary" variant="flat" :loading="menyimpan" @click="simpan">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card class="kartu" variant="outlined">
      <div class="kartu-judul"><v-icon color="#B8890F">mdi-information-outline</v-icon> Isi file</div>
      <ul class="daftar">
        <li><b>Sheet Struktur</b> — No Member, Struktur (No ID · Nama, menjorok sesuai jenjang), Jabatan, No ID, Upline,
          Cabang, Kode Akun, jumlah Downline & Tim, dan Jalur (No ID dari atas).</li>
        <li><b>Kolom kuning (BARU)</b> — Jabatan BARU, Upline BARU, No ID BARU, Cabang BARU. Kosong = tidak berubah.</li>
        <li><b>Sheet Petunjuk</b> — cara mencari, melipat tim, dan contoh mengisi perubahan.</li>
        <li><b>Sheet Daftar</b> — pilihan jabatan & kode cabang.</li>
      </ul>
      <div class="kartu-judul mt-3"><v-icon color="#B8890F">mdi-magnify</v-icon> Mencari di Excel</div>
      <ul class="daftar">
        <li>Ctrl+F lalu ketik nama, No ID, atau No Member.</li>
        <li>Satu tim: saring kolom <b>Jalur (No ID)</b> → Text Filters → Contains → No ID ketua tim.</li>
        <li>Tanda − / + di kiri nomor baris melipat atau membuka tim.</li>
      </ul>
    </v-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { useDisplay } from "vuetify";
import { API_URL } from "@/config";
import Breadcrumb from "@/components/ui/Breadcrumb.vue";

const { smAndDown } = useDisplay();
const compact = computed(() => smAndDown.value);

const api = axios.create({ baseURL: `${API_URL}/api`, timeout: 120000 });
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token") || Cookies.get("token");
  cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

const cabang = ref("");
const tim = ref("");
const daftarCabang = ref([{ code: "", label: "Semua cabang" }]);
const memuat = ref(false);
const galat = ref("");
const selesai = ref("");

onMounted(async () => {
  try {
    const { data } = await api.get("/provinsi");
    const isi = (data.data || []).map((p) => ({ code: p.code, label: `${p.code} · ${p.name}` }));
    isi.sort((a, b) => a.code.localeCompare(b.code));
    daftarCabang.value = [{ code: "", label: "Semua cabang" }, ...isi];
  } catch {
    // daftar cabang gagal dimuat: tetap bisa unduh semua cabang
  }
});

async function unduh() {
  memuat.value = true;
  galat.value = "";
  selesai.value = "";
  try {
    const params = {};
    if (cabang.value) params.cabang = cabang.value;
    if (tim.value?.trim()) params.tim = tim.value.trim();
    const res = await api.get("/struktur-excel/ekspor", { params, responseType: "blob" });
    const nama = /filename="?([^";]+)"?/i.exec(res.headers["content-disposition"] || "")?.[1] || "Struktur-Akun.xlsx";
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = nama;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    selesai.value = `File ${nama} sudah diunduh.`;
  } catch (e) {
    let pesan = "Gagal mengunduh file.";
    const d = e.response?.data;
    if (d instanceof Blob) {
      try {
        pesan = JSON.parse(await d.text()).message || pesan;
      } catch {
        // bukan JSON
      }
    }
    galat.value = pesan;
  } finally {
    memuat.value = false;
  }
}

// Unggah & periksa (belum menyimpan)
const berkas = ref(null);
const memeriksa = ref(false);
const galatUnggah = ref("");
const hasil = ref(null);
const fileDipilih = computed(() => (Array.isArray(berkas.value) ? berkas.value[0] : berkas.value) || null);

const PERAN = {
  dipindah: "Diubah",
  mengisi: "Mengisi kursi",
  tetap: "Tetap di kursi",
  ikut: "Ikut upline",
  kosong: "Kursi kosong",
};
const labelPeran = (p) => PERAN[p] || p;
const esc = (s) => String(s ?? "-").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const lamaBaru = (a, b) => (a || "-") === (b || "-") ? esc(a) : `<span class="lama">${esc(a)}</span> → <b>${esc(b)}</b>`;

// Simpan: file yang sama diperiksa ulang di server lalu disimpan dalam satu transaksi
const catatan = ref("");
const konfirmasi = ref(false);
const menyimpan = ref(false);
const tersimpan = ref("");

async function simpan() {
  if (!fileDipilih.value) return;
  menyimpan.value = true;
  galatUnggah.value = "";
  try {
    const fd = new FormData();
    fd.append("file", fileDipilih.value);
    if (catatan.value?.trim()) fd.append("catatan", catatan.value.trim());
    const { data } = await api.post("/struktur-excel/simpan", fd);
    konfirmasi.value = false;
    tersimpan.value = data.message;
    hasil.value = null;
    berkas.value = null;
    catatan.value = "";
  } catch (e) {
    konfirmasi.value = false;
    const d = e.response?.data;
    if (d?.galat) {
      hasil.value = d; // data berubah sejak diperiksa: tampilkan masalah terbaru
    }
    galatUnggah.value = d?.message || "Gagal menyimpan. Tidak ada perubahan yang tersimpan.";
  } finally {
    menyimpan.value = false;
  }
}

async function periksa() {
  if (!fileDipilih.value) return;
  memeriksa.value = true;
  galatUnggah.value = "";
  tersimpan.value = "";
  hasil.value = null;
  try {
    const fd = new FormData();
    fd.append("file", fileDipilih.value);
    const { data } = await api.post("/struktur-excel/periksa", fd);
    hasil.value = data;
  } catch (e) {
    galatUnggah.value = e.response?.data?.message || "Gagal memeriksa file.";
  } finally {
    memeriksa.value = false;
  }
}
</script>

<style scoped>
.kartu {
  padding: 16px;
  border-color: var(--baba-border);
}
.kartu-judul {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--baba-ink);
}
.meta {
  font-size: 0.85rem;
  color: var(--baba-muted);
}
.isian {
  display: grid;
  grid-template-columns: 220px minmax(200px, 320px) auto;
  gap: 12px;
  align-items: center;
}
.daftar {
  padding-left: 20px;
  font-size: 0.9rem;
  line-height: 1.6;
}
.isian--unggah {
  grid-template-columns: minmax(240px, 552px) auto;
}
.simpan-baris {
  display: grid;
  grid-template-columns: minmax(240px, 552px) auto;
  gap: 12px;
  align-items: center;
}
.galat-daftar {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.galat-baris {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 0.88rem;
  padding: 8px 10px;
  border: 1px solid var(--baba-border);
  border-left: 3px solid var(--baba-danger);
  border-radius: 8px;
  background: var(--baba-surface);
}
.galat-chip {
  flex: none;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--baba-ink);
  color: var(--baba-gold);
  white-space: nowrap;
}
.tabel-wrap {
  max-height: 60vh;
  overflow: auto;
  border: 1px solid var(--baba-border);
  border-radius: 8px;
}
.tabel {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.tabel th {
  position: sticky;
  top: 0;
  background: var(--baba-ink);
  color: var(--baba-gold);
  text-align: left;
  padding: 8px 10px;
  white-space: nowrap;
}
.tabel td {
  padding: 7px 10px;
  border-top: 1px solid var(--baba-border);
  vertical-align: top;
}
.nama {
  font-weight: 600;
  color: var(--baba-ink);
}
.baris-kosong {
  background: var(--baba-gold-soft);
}
.status {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--baba-bg);
  color: var(--baba-muted);
  white-space: nowrap;
}
.status--dipindah,
.status--mengisi {
  background: var(--baba-gold-soft);
  color: var(--baba-gold-dark);
}
.status--kosong {
  background: var(--baba-danger);
  color: #fff;
}
.tabel :deep(.lama),
.kartu-hp :deep(.lama) {
  color: var(--baba-muted);
  text-decoration: line-through;
}
.kartu-hp-daftar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.kartu-hp {
  padding: 10px 12px;
  border: 1px solid var(--baba-border);
  border-radius: 10px;
  background: var(--baba-surface);
}
@media (max-width: 959px) {
  .isian,
  .isian--unggah,
  .simpan-baris {
    grid-template-columns: 1fr;
  }
}
</style>
