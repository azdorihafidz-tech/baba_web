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
      <p class="meta mt-3">
        Unggah perubahan dari file ini sedang disiapkan. Sementara itu, ubah jabatan & upline lewat menu Mutasi Jabatan.
      </p>
    </v-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/config";
import Breadcrumb from "@/components/ui/Breadcrumb.vue";

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
@media (max-width: 959px) {
  .isian {
    grid-template-columns: 1fr;
  }
}
</style>
