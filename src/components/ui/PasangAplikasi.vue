<template>
  <!-- Tombol pasang aplikasi ke layar utama: Android = jendela pasang Chrome, iPhone = petunjuk Safari.
       Tidak tampil bila sudah dibuka sebagai aplikasi atau browser tidak mendukung. -->
  <template v-if="!pasangState.terpasang && (pasangState.bisaPasang || iphone)">
    <v-btn :size="size" :variant="variant" color="#E6B422" prepend-icon="mdi-cellphone-arrow-down" :block="block"
      @click="tekan">{{ pasangState.bisaPasang ? 'Pasang aplikasi' : 'Pasang di iPhone' }}</v-btn>

    <v-dialog v-model="petunjuk" max-width="420">
      <v-card>
        <v-card-title class="text-h6" style="padding: 16px 20px 4px">Pasang di iPhone</v-card-title>
        <v-card-text style="padding: 8px 20px">
          <ol class="langkah-ios">
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
  </template>
</template>

<script setup>
import { ref } from "vue";
import { diIphone, pasang, pasangState } from "@/utils/pasangAplikasi";

defineProps({
  size: { type: String, default: "default" },
  variant: { type: String, default: "outlined" },
  block: { type: Boolean, default: false },
});

const iphone = diIphone();
const petunjuk = ref(false);

function tekan() {
  if (pasangState.bisaPasang) pasang();
  else petunjuk.value = true;
}
</script>

<style scoped>
.langkah-ios {
  padding-left: 20px;
  line-height: 1.7;
}
</style>
