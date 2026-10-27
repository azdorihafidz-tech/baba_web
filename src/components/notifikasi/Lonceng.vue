<template>
  <!-- Desktop: daftar turun dari tombol; HP: panel dari bawah -->
  <v-menu v-if="!$vuetify.display.smAndDown" v-model="buka" location="bottom end" offset="8"
    :close-on-content-click="false" width="380">
    <template #activator="{ props }">
      <v-btn icon variant="text" size="small" color="#F6D365" class="mr-1 lonceng-btn" aria-label="Notifikasi"
        v-bind="props">
        <v-icon>{{ notifState.belumDibaca ? 'mdi-bell-ring-outline' : 'mdi-bell-outline' }}</v-icon>
        <span v-if="notifState.belumDibaca" class="lonceng-angka">{{ teksAngka }}</span>
      </v-btn>
    </template>
    <PanelNotifikasi @tutup="buka = false" />
  </v-menu>

  <template v-else>
    <v-btn icon variant="text" size="small" color="#F6D365" class="mr-1 lonceng-btn" aria-label="Notifikasi"
      @click="buka = true">
      <v-icon>{{ notifState.belumDibaca ? 'mdi-bell-ring-outline' : 'mdi-bell-outline' }}</v-icon>
      <span v-if="notifState.belumDibaca" class="lonceng-angka">{{ teksAngka }}</span>
    </v-btn>
    <v-bottom-sheet v-model="buka" scrollable>
      <PanelNotifikasi hp @tutup="buka = false" />
    </v-bottom-sheet>
  </template>

  <!-- Notifikasi baru masuk (realtime) -->
  <v-snackbar v-model="kabar.tampil" location="top" :timeout="5000" color="#141414" class="lonceng-kabar">
    <div class="d-flex align-center">
      <v-icon color="#F6D365" class="mr-2">mdi-bell-ring-outline</v-icon>
      <span>{{ kabar.judul }}</span>
    </div>
    <template #actions>
      <v-btn variant="text" color="#F6D365" @click="kabar.tampil = false; buka = true">Lihat</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import PanelNotifikasi from "@/components/notifikasi/PanelNotifikasi.vue";
import { dengarChat } from "@/utils/chatKoneksi";
import { muatNotifikasi, notifState, resetNotifikasi, terimaNotifikasi } from "@/utils/notifikasi";
import { muatTugas } from "@/utils/tugasMenunggu";
import { bunyikan } from "@/utils/suara";

const buka = ref(false);
const kabar = reactive({ tampil: false, judul: "" });
const teksAngka = computed(() => (notifState.belumDibaca > 99 ? "99+" : notifState.belumDibaca));

// Daftar dimuat ulang setiap lonceng dibuka (jumlah belum dibaca sudah ikut angka menu)
watch(buka, (v) => { if (v) muatNotifikasi(); });

let berhenti = null;
onMounted(() => {
  resetNotifikasi(); // akun yang login bisa berganti
  muatTugas(true);
  berhenti = dengarChat((event, data) => {
    if (event !== "notifikasi") return;
    terimaNotifikasi(data);
    bunyikan("notifikasi");
    kabar.judul = data?.judul || "Notifikasi baru";
    kabar.tampil = !buka.value;
    muatTugas(true); // angka merah di menu ikut berubah (mis. pendaftar baru)
  });
});
onBeforeUnmount(() => berhenti?.());
</script>

<style scoped>
.lonceng-btn {
  position: relative;
}

.lonceng-angka {
  position: absolute;
  top: -2px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: rgb(var(--v-theme-error));
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  pointer-events: none;
}
</style>
