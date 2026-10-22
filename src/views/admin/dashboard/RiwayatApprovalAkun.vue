<template>
  <!-- Dashboard › Akun: ringkasan & riwayat persetujuan akun baru (approve upline, tunda, tolak, pulihkan, aktivasi) -->
  <v-card class="riwayat-card mt-4" elevation="0">
    <div class="riwayat-head">
      <v-icon color="#F6D365" class="mr-2">mdi-history</v-icon>
      <span>Riwayat Persetujuan Akun</span>
      <v-spacer />
      <span class="riwayat-periode">{{ mulai }} s/d {{ selesai }}</span>
    </div>

    <div class="riwayat-ringkas">
      <div v-for="r in RINGKAS" :key="r.aksi" class="ringkas-item" :class="`ringkas--${r.aksi}`">
        <v-icon size="18">{{ r.icon }}</v-icon>
        <div>
          <div class="ringkas-angka">{{ ringkasan[r.aksi] ?? 0 }}</div>
          <div class="ringkas-label">{{ r.label }}</div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="riwayat-kosong">
      <v-progress-circular indeterminate size="20" width="2" color="#B8890F" class="mr-2" /> Memuat…
    </div>
    <div v-else-if="!data.length" class="riwayat-kosong">Belum ada riwayat pada periode ini.</div>
    <div v-else class="riwayat-daftar">
      <div v-for="h in data" :key="h.id" class="riwayat-baris">
        <span class="riwayat-aksi" :class="`aksi--${h.aksi}`">{{ labelAksi(h) }}</span>
        <div class="riwayat-teks">
          <div class="riwayat-nama">
            <b>{{ h.nama }}</b>
            <span class="noid-teks ml-1">{{ h.no_id || '-' }}</span>
            <span class="riwayat-meta"> · {{ h.jabatan }} · {{ h.cabang }}</span>
          </div>
          <div class="riwayat-meta">
            oleh {{ h.oleh_nama || '-' }} · {{ formatWaktu(h.created_at) }}
            <template v-if="h.alasan"> · “{{ h.alasan }}”</template>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, watch } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/config";

const props = defineProps({
  mulai: String, // Y-m-d (rentang tanggal Dashboard › Akun)
  selesai: String,
});

const RINGKAS = [
  { aksi: "approve", label: "Disetujui upline", icon: "mdi-check-circle" },
  { aksi: "aktivasi", label: "Diaktivasi", icon: "mdi-account-check" },
  { aksi: "tunda", label: "Ditunda", icon: "mdi-pause-circle" },
  { aksi: "tolak", label: "Ditolak", icon: "mdi-close-circle" },
];
const LEVEL = { 1: "MVO", 2: "Regional", 3: "Founder", 4: "GM", 5: "Supplier", 6: "Distributor" };

const ringkasan = ref({});
const data = ref([]);
const loading = ref(false);

const labelAksi = (h) => ({
  approve: `Disetujui${LEVEL[h.level] ? " " + LEVEL[h.level] : ""}`,
  aktivasi: "Diaktivasi",
  tunda: "Ditunda",
  tolak: "Ditolak",
  pulihkan: "Dipulihkan",
}[h.aksi] || h.aksi);

const formatWaktu = (s) => (s ? new Date(s.replace(" ", "T")).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-");

async function muat() {
  loading.value = true;
  try {
    const res = await axios.get(`${API_URL}/api/approval-akun/riwayat`, {
      headers: { Authorization: `Bearer ${Cookies.get("token")}`, Accept: "application/json" },
      params: { mulai: props.mulai, selesai: props.selesai, limit: 20 },
    });
    ringkasan.value = res.data.ringkasan || {};
    data.value = res.data.data || [];
  } catch {
    data.value = [];
  } finally {
    loading.value = false;
  }
}

watch(() => [props.mulai, props.selesai], muat, { immediate: true });
</script>

<style scoped>
.riwayat-card {
  border: 1px solid var(--baba-border);
  border-radius: var(--baba-radius) !important;
  overflow: hidden;
}

.riwayat-head {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--baba-ink);
  border-bottom: 2px solid var(--baba-gold);
  color: var(--baba-gold-light);
  font-weight: 700;
}

.riwayat-periode {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
}

.riwayat-ringkas {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding: 12px;
}

.ringkas-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--baba-gold-soft);
  color: var(--baba-gold-dark);
}

.ringkas--aktivasi {
  background: rgba(46, 125, 50, 0.1);
  color: #2e7d32;
}

.ringkas--tunda {
  background: rgba(239, 108, 0, 0.12);
  color: #e65100;
}

.ringkas--tolak {
  background: rgba(198, 40, 40, 0.1);
  color: #c62828;
}

.ringkas-angka {
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1.1;
}

.ringkas-label {
  font-size: 0.72rem;
  font-weight: 600;
}

.riwayat-daftar {
  max-height: 420px;
  overflow-y: auto;
  border-top: 1px solid var(--baba-border);
}

.riwayat-baris {
  display: flex;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--baba-border);
}

.riwayat-aksi {
  flex-shrink: 0;
  align-self: flex-start;
  min-width: 92px;
  text-align: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--baba-gold-soft);
  color: var(--baba-gold-dark);
}

.aksi--aktivasi {
  background: rgba(46, 125, 50, 0.12);
  color: #2e7d32;
}

.aksi--tunda {
  background: rgba(239, 108, 0, 0.14);
  color: #e65100;
}

.aksi--tolak {
  background: rgba(198, 40, 40, 0.12);
  color: #c62828;
}

.aksi--pulihkan {
  background: #eceff1;
  color: #455a64;
}

.riwayat-teks {
  min-width: 0;
}

.riwayat-nama {
  font-size: 0.88rem;
}

.riwayat-meta {
  font-size: 0.76rem;
  color: var(--baba-muted);
}

.riwayat-kosong {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  font-size: 0.85rem;
  color: var(--baba-muted);
}

@media (max-width: 599.98px) {
  .riwayat-ringkas {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .riwayat-aksi {
    min-width: 76px;
  }
}
</style>
