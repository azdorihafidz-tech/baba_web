<template>
  <!-- Aplikasi di HP. Android: unduh APK (cadangan: pasang dari Chrome). iPhone: petunjuk Safari.
       Komputer (prop qr): kode QR ke file APK. Tidak tampil bila sedang dibuka sebagai aplikasi. -->
  <template v-if="!pasangState.terpasang">
    <!-- Android: APK -->
    <div v-if="android && pasangState.apk" class="pasang-apk">
      <v-btn :size="size" variant="flat" color="#E6B422" class="text-black" prepend-icon="mdi-android" :block="block"
        :href="APK_URL" download="baba-parfume.apk" @click="petunjukApk = true">Download Aplikasi Android</v-btn>
      <div class="versi">Versi {{ pasangState.apk.versionName }}</div>
    </div>

    <!-- Android tanpa APK di server / iPhone: pasang ke layar utama (PWA) -->
    <v-btn v-else-if="(android && pasangState.bisaPasang) || iphone" :size="size" :variant="variant" color="#E6B422"
      prepend-icon="mdi-cellphone-arrow-down" :block="block" @click="tekan">
      {{ iphone ? 'Pasang di iPhone' : 'Pasang aplikasi' }}</v-btn>

    <!-- Komputer: pindai dengan HP Android -->
    <div v-else-if="qr && komputer && pasangState.apk && gambarQr" class="pasang-qr">
      <img :src="gambarQr" alt="Kode QR unduh aplikasi Android" width="132" height="132" />
      <div class="qr-teks">
        <div class="qr-judul"><v-icon size="18" class="mr-1">mdi-android</v-icon>Aplikasi Android</div>
        <div>Pindai kode ini dengan kamera HP Android untuk mengunduh aplikasi BABA PARFUME.</div>
        <div class="versi">Versi {{ pasangState.apk.versionName }}</div>
      </div>
    </div>

    <v-dialog v-model="petunjuk" max-width="420">
      <v-card>
        <v-card-title class="text-h6" style="padding: 16px 20px 4px">Pasang di iPhone</v-card-title>
        <v-card-text style="padding: 8px 20px">
          <ol class="langkah">
            <li>Buka halaman ini di <b>Safari</b>.</li>
            <li>Ketuk tombol <b>Bagikan</b> <v-icon size="18">mdi-export-variant</v-icon> di bagian bawah layar.</li>
            <li>Gulir lalu pilih <b>Tambahkan ke Layar Utama</b> <v-icon size="18">mdi-plus-box-outline</v-icon>.</li>
            <li>Ketuk <b>Tambah</b>. Ikon BABA PARFUME muncul di layar utama.</li>
          </ol>
          <div class="text-caption text-medium-emphasis mt-2">Buka aplikasi lewat ikon itu: tampil layar penuh dan selalu versi terbaru.</div>
        </v-card-text>
        <v-card-actions style="padding: 8px 16px 16px">
          <v-spacer />
          <v-btn color="primary" variant="flat" @click="petunjuk = false">Mengerti</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="petunjukApk" max-width="440">
      <v-card>
        <v-card-title class="text-h6" style="padding: 16px 20px 4px">Memasang aplikasi Android</v-card-title>
        <v-card-text style="padding: 8px 20px">
          <ol class="langkah">
            <li>Tunggu unduhan <b>baba-parfume.apk</b> selesai (lihat notifikasi atau folder <b>Download</b>).</li>
            <li>Ketuk file itu, lalu ketuk <b>Instal</b>.</li>
            <li>Bila muncul <b>“Instal aplikasi tidak dikenal”</b>: ketuk <b>Setelan</b>, aktifkan <b>Izinkan dari sumber ini</b>, kembali, lalu ketuk <b>Instal</b>.</li>
            <li>Bila muncul peringatan <b>Play Protect</b>: ketuk <b>Detail lainnya</b> › <b>Tetap instal</b>.</li>
            <li>Buka <b>BABA PARFUME</b> dari layar utama HP, lalu login seperti biasa.</li>
          </ol>
        </v-card-text>
        <v-card-actions style="padding: 8px 16px 16px">
          <v-spacer />
          <v-btn color="primary" variant="flat" @click="petunjukApk = false">Mengerti</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
</template>

<script setup>
import { onMounted, ref } from "vue";
import QRCode from "qrcode";
import { APK_URL, diAndroid, diIphone, muatInfoApk, pasang, pasangState } from "@/utils/pasangAplikasi";

const props = defineProps({
  size: { type: String, default: "default" },
  variant: { type: String, default: "outlined" },
  block: { type: Boolean, default: false },
  qr: { type: Boolean, default: false }, // tampilkan kode QR di komputer
});

const iphone = diIphone();
const android = diAndroid();
const komputer = !iphone && !android;
const petunjuk = ref(false);
const petunjukApk = ref(false);
const gambarQr = ref("");

onMounted(async () => {
  if (pasangState.terpasang) return;
  await muatInfoApk();
  if (props.qr && komputer && pasangState.apk) {
    gambarQr.value = await QRCode.toDataURL(`${window.location.origin}${APK_URL}`, {
      margin: 1, width: 264, color: { dark: "#141414", light: "#ffffff" },
    }).catch(() => "");
  }
});

function tekan() {
  if (android && pasangState.bisaPasang) pasang();
  else petunjuk.value = true;
}
</script>

<style scoped>
.langkah {
  padding-left: 20px;
  line-height: 1.7;
}

.pasang-apk {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.versi {
  font-size: 0.72rem;
  opacity: 0.65;
  margin-top: 2px;
}

.pasang-qr {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px 10px 10px;
  border: 1px solid var(--baba-gold);
  border-radius: 12px;
  text-align: left;
  max-width: 420px;
  font-size: 0.82rem;
  line-height: 1.4;
}

.pasang-qr img {
  border-radius: 8px;
  background: #fff;
  flex-shrink: 0;
}

.qr-judul {
  display: flex;
  align-items: center;
  font-weight: 800;
  color: var(--baba-gold);
  margin-bottom: 4px;
}
</style>
