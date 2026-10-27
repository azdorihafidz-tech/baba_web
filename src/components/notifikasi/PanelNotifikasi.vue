<template>
  <v-card class="pn-card" :rounded="hp ? 't-xl' : 'lg'">
    <div class="pn-head">
      <v-icon color="#F6D365" class="mr-2">mdi-bell-outline</v-icon>
      <div class="pn-judul">Notifikasi</div>
      <v-spacer />
      <v-btn v-if="notifState.belumDibaca" variant="text" size="small" color="#F6D365" class="pn-semua"
        @click="tandaiDibaca()">Tandai semua dibaca</v-btn>
      <v-btn v-if="hp" icon="mdi-close" variant="text" color="#F6D365" size="small" aria-label="Tutup"
        @click="emit('tutup')" />
    </div>

    <div class="pn-isi">
      <div v-if="notifState.memuat && !notifState.daftar.length" class="pn-kosong">
        <v-progress-circular indeterminate size="22" width="2" color="primary" />
      </div>
      <div v-else-if="!notifState.daftar.length" class="pn-kosong">
        <v-icon size="36" color="grey-lighten-1">mdi-bell-sleep-outline</v-icon>
        <div>Belum ada notifikasi.</div>
      </div>

      <button v-for="n in notifState.daftar" :key="n.id" type="button" class="pn-item"
        :class="{ 'pn-baru': !n.dibaca_at }" @click="buka(n)">
        <span class="pn-ikon"><v-icon size="20">{{ IKON_NOTIFIKASI[n.jenis] || 'mdi-bell-outline' }}</v-icon></span>
        <span class="pn-teks">
          <span class="pn-item-judul">{{ n.judul }}</span>
          <span v-if="n.isi" class="pn-item-isi">{{ n.isi }}</span>
          <span class="pn-waktu">{{ waktuLalu(n.created_at) }}</span>
        </span>
        <span v-if="!n.dibaca_at" class="pn-titik" aria-label="Belum dibaca"></span>
      </button>

      <div v-if="notifState.adaLagi" class="pn-lagi">
        <v-btn variant="text" size="small" :loading="notifState.memuat" @click="muatNotifikasiLama">Muat lebih lama</v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { useRouter } from "vue-router";
import { IKON_NOTIFIKASI, muatNotifikasiLama, notifState, tandaiDibaca, waktuLalu } from "@/utils/notifikasi";

defineProps({ hp: { type: Boolean, default: false } });
const emit = defineEmits(["tutup"]);
const router = useRouter();

// Klik: tandai dibaca, lalu buka halaman terkait (bila ada)
function buka(n) {
  if (!n.dibaca_at) tandaiDibaca(n.id);
  if (n.url) {
    emit("tutup");
    router.push(n.url);
  }
}
</script>

<style scoped>
.pn-card {
  display: flex;
  flex-direction: column;
  max-height: min(560px, 80vh);
  overflow: hidden;
}

.pn-head {
  display: flex;
  align-items: center;
  padding: 10px 8px 10px 14px;
  background: var(--baba-ink);
  border-bottom: 2px solid var(--baba-gold);
  flex-shrink: 0;
}

.pn-judul {
  font-weight: 800;
  color: var(--baba-gold-light);
}

.pn-semua {
  text-transform: none;
  letter-spacing: 0;
  font-size: 0.78rem;
}

.pn-isi {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.pn-kosong {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 32px 16px;
  color: var(--baba-muted);
  font-size: 0.88rem;
}

.pn-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid var(--baba-border);
  background: var(--baba-surface);
  color: var(--baba-text);
  cursor: pointer;
}

.pn-item:hover {
  background: var(--baba-bg);
}

.pn-baru {
  background: var(--baba-gold-soft);
}

.pn-ikon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--baba-ink);
  color: var(--baba-gold-light);
}

.pn-teks {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1 1 auto;
}

.pn-item-judul {
  font-weight: 700;
  font-size: 0.88rem;
  line-height: 1.3;
}

.pn-item-isi {
  font-size: 0.82rem;
  line-height: 1.35;
  color: var(--baba-muted);
  overflow-wrap: anywhere;
}

.pn-waktu {
  font-size: 0.72rem;
  color: var(--baba-gold-dark);
  font-weight: 600;
}

.pn-titik {
  flex-shrink: 0;
  width: 9px;
  height: 9px;
  margin-top: 6px;
  border-radius: 50%;
  background: rgb(var(--v-theme-error));
}

.pn-lagi {
  display: flex;
  justify-content: center;
  padding: 6px;
}
</style>
