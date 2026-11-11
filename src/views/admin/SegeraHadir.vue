<template>
  <!-- Belanja / Pesanan Saya / Toko Saya: dilayani ERP BABA, belum dibuka (Tahap 0 rancangan ERP). -->
  <div class="segera-page">
    <Breadcrumb :items="[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: info.judul }]" />

    <v-card class="segera-card">
      <div class="segera-head">
        <span class="segera-ikon"><v-icon size="40">{{ info.icon }}</v-icon></span>
        <div>
          <div class="segera-judul">{{ info.judul }}</div>
          <span class="segera-chip">Segera hadir</span>
        </div>
      </div>
      <v-card-text>
        <p class="segera-ringkas">{{ info.ringkas }}</p>
        <ul class="segera-daftar">
          <li v-for="b in info.nanti" :key="b">{{ b }}</li>
        </ul>
        <p class="text-medium-emphasis mb-0">Menu ini sedang disiapkan dan belum bisa dipakai. Fitur lain tetap berjalan seperti biasa.</p>

        <!-- Superadmin: status sambungan aplikasi member → ERP BABA -->
        <div v-if="isSuperadmin" class="sambungan" :class="tokoState.sambungan?.ok ? 'ok' : 'gagal'">
          <v-icon size="18" class="mr-1">{{ tokoState.sambungan?.ok ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
          <span><b>Sambungan ke ERP:</b> {{ tokoState.sambungan?.pesan || (tokoState.dimuat ? 'Belum diperiksa' : 'Memeriksa…') }}</span>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import { muatToko, tokoState } from "@/utils/tokoOnline";

const route = useRoute();
const isSuperadmin = localStorage.getItem("mvo_type_id") === "superadmin";

const DATA = {
  belanja: {
    judul: "Belanja", icon: "mdi-cart-outline",
    ringkas: "Belanja parfum BABA langsung dari aplikasi ini, seperti belanja online.",
    nanti: ["Pilih parfum dari katalog (aroma, ukuran, harga sesuai jabatan)", "Masukkan ke keranjang lalu checkout", "Bayar dengan transfer + unggah bukti, atau tagihan bila diizinkan", "Pilih diambil sendiri atau dikirim"],
  },
  "pesanan-saya": {
    judul: "Pesanan Saya", icon: "mdi-package-variant-closed",
    ringkas: "Pantau pesanan Anda sampai barang diterima.",
    nanti: ["Status: menunggu bayar, dibayar, disiapkan, dikirim, diterima", "Konfirmasi barang diterima", "Ajukan retur bila ada barang yang bermasalah", "RO bertambah otomatis dari pesanan Anda"],
  },
  "toko-saya": {
    judul: "Toko Saya", icon: "mdi-storefront-outline",
    ringkas: "Kelola stok parfum Anda dan jual ke pelanggan dari HP.",
    nanti: ["Lihat stok parfum milik Anda", "Kasir sederhana untuk menjual ke pelanggan", "Laporan transaksi, produk, dan kategori"],
  },
};

const info = computed(() => DATA[route.meta.menuToko] || DATA.belanja);

onMounted(() => muatToko(true));
</script>

<style scoped>
.segera-card {
  max-width: 720px;
  border: 1px solid var(--baba-border);
  box-shadow: var(--baba-shadow) !important;
  overflow: hidden;
}

.segera-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--baba-ink);
  border-bottom: 2px solid var(--baba-gold);
}

.segera-ikon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--baba-gold-light);
}

.segera-judul {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--baba-gold-light);
}

.segera-chip {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--baba-gold);
  color: var(--baba-ink);
  font-size: 0.75rem;
  font-weight: 800;
}

.segera-ringkas {
  font-weight: 700;
  margin-bottom: 8px;
}

.segera-daftar {
  padding-left: 20px;
  margin-bottom: 12px;
  line-height: 1.7;
}

.sambungan {
  display: flex;
  align-items: center;
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.875rem;
}

.sambungan.ok {
  background: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
}

.sambungan.gagal {
  background: rgba(var(--v-theme-error), 0.08);
  color: rgb(var(--v-theme-error));
}
</style>
