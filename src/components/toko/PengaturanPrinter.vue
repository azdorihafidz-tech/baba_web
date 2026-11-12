<template>
  <!-- Toko Saya › Printer (Tahap 6c): pilih printer Bluetooth di aplikasi Android, lebar kertas, cetak otomatis, tes cetak. -->
  <div class="printer-saya" data-uji="printer-saya">
    <v-alert v-if="!apk && diAplikasi()" type="warning" variant="tonal" class="mb-3" data-uji="printer-perbarui">
      Aplikasi di HP ini belum mendukung printer. Perbarui aplikasi BABA PARFUME ke versi terbaru (tutup lalu buka lagi aplikasi — akan muncul tawaran <strong>Versi baru tersedia</strong>).
    </v-alert>
    <template v-else-if="!apk">
      <v-alert type="info" variant="tonal" class="mb-3" data-uji="printer-browser">
        Cetak struk langsung ke <strong>printer Bluetooth</strong> hanya bisa dari <strong>aplikasi Android BABA PARFUME</strong>.
        Di browser, struk tetap bisa dicetak lewat tombol <strong>Cetak</strong> (printer yang terpasang di perangkat) atau dikirim lewat <strong>Bagikan</strong>.
      </v-alert>
      <PasangAplikasi />
    </template>

    <template v-else>
      <v-card variant="outlined" class="mb-3">
        <v-card-text>
          <div class="font-weight-bold mb-1">Printer struk</div>
          <div class="text-caption mb-2">Pairing printer dulu di <strong>Pengaturan › Bluetooth</strong> HP (PIN biasanya 0000 atau 1234), lalu tekan <strong>Muat daftar printer</strong>.</div>
          <v-alert v-if="!info.izin" type="warning" variant="tonal" density="compact" class="mb-2">
            Izinkan akses <strong>Perangkat di sekitar</strong> (Bluetooth) supaya aplikasi bisa memakai printer.
            <template #append><v-btn size="small" color="primary" data-uji="printer-izin" @click="izinkan">Izinkan</v-btn></template>
          </v-alert>
          <v-alert v-else-if="info.ada === false" type="error" variant="tonal" density="compact" class="mb-2">HP ini tidak punya Bluetooth.</v-alert>
          <v-alert v-else-if="!info.bluetooth" type="warning" variant="tonal" density="compact" class="mb-2">Bluetooth HP sedang mati. Nyalakan Bluetooth lalu tekan Muat daftar printer.</v-alert>
          <v-radio-group v-if="info.printer.length" :model-value="printerState.mac" hide-details class="mb-2" data-uji="printer-daftar"
            @update:model-value="pilih">
            <v-radio v-for="p in info.printer" :key="p.mac" :value="p.mac" :label="p.nama" />
          </v-radio-group>
          <div v-else-if="info.izin && info.bluetooth" class="text-medium-emphasis text-caption mb-2" data-uji="printer-kosong">Belum ada printer yang di-pairing di HP ini.</div>
          <div class="d-flex flex-wrap ga-2">
            <v-btn variant="tonal" prepend-icon="mdi-refresh" data-uji="printer-muat" @click="muatDaftar">Muat daftar printer</v-btn>
            <v-btn color="primary" prepend-icon="mdi-printer" :disabled="!printerState.mac" :loading="mencetak" data-uji="printer-tes" @click="tesCetak">Tes cetak</v-btn>
          </div>
        </v-card-text>
      </v-card>

      <v-card variant="outlined">
        <v-card-text>
          <div class="font-weight-bold mb-1">Kertas & cetak otomatis</div>
          <v-btn-toggle :model-value="printerState.lebar" mandatory density="compact" color="primary" class="mb-2" data-uji="printer-lebar"
            @update:model-value="(v) => simpanPrinter({ lebar: v })">
            <v-btn :value="58">58 mm</v-btn><v-btn :value="80">80 mm</v-btn>
          </v-btn-toggle>
          <v-switch :model-value="printerState.otomatis" color="primary" hide-details inset label="Cetak struk otomatis setelah jual di Kasir" data-uji="printer-otomatis"
            @update:model-value="(v) => simpanPrinter({ otomatis: !!v })" />
          <div class="text-caption text-medium-emphasis">Pengaturan ini hanya untuk HP ini.</div>
        </v-card-text>
      </v-card>
    </template>
    <v-snackbar v-model="kabar.tampil" :color="kabar.warna" timeout="3500">{{ kabar.teks }}</v-snackbar>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import PasangAplikasi from "@/components/ui/PasangAplikasi.vue";
import { diAplikasi } from "@/utils/pasangAplikasi";
import { adaPrinterApk, buatStruk, cetakBytes, daftarPrinter, mintaIzin, printerState, simpanPrinter } from "@/utils/printer";

const apk = adaPrinterApk();
const info = reactive({ izin: true, bluetooth: true, ada: true, printer: [] });
const mencetak = ref(false);
const kabar = reactive({ tampil: false, teks: "", warna: "success" });
const tampilkan = (teks, warna = "success") => Object.assign(kabar, { tampil: true, teks, warna });

function muatDaftar() {
  Object.assign(info, { ada: true }, daftarPrinter());
  if (printerState.mac && info.printer.length && !info.printer.some((p) => p.mac === printerState.mac)) {
    tampilkan("Printer tersimpan tidak lagi di-pairing di HP ini. Pilih printer lagi.", "warning");
  }
}

async function izinkan() {
  if (await mintaIzin()) muatDaftar();
  else tampilkan("Izin Bluetooth belum diberikan.", "warning");
}

function pilih(mac) {
  const p = info.printer.find((x) => x.mac === mac);
  simpanPrinter({ mac, nama: p?.nama || mac });
  tampilkan(`Printer ${p?.nama || mac} dipilih.`);
}

async function tesCetak() {
  mencetak.value = true;
  try {
    await cetakBytes(buatStruk({ judul: "BABA PARFUME", sub: ["Tes printer Toko Saya", printerState.nama], waktu: new Date().toLocaleString("id-ID"),
      baris: [{ nama: "Contoh parfum 50 ml", qty: 1, harga: 150000, subtotal: 150000 }], ringkas: [["TOTAL", "Rp150.000", true]], kaki: "Printer siap dipakai" }));
    tampilkan("Tes cetak terkirim ke printer.");
  } catch (e) {
    tampilkan(e.message, "error");
  } finally {
    mencetak.value = false;
  }
}

onMounted(() => { if (apk) muatDaftar(); });
</script>
