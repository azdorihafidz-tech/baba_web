<template>
  <!-- Toko Saya › Kasir: jual parfum dari stok member ke pelanggan (ERP BABA Tahap 3). Tidak menambah RO. -->
  <div class="kasir">
    <v-alert v-if="galat" type="error" variant="tonal" density="compact" class="mb-2">{{ galat }}</v-alert>
    <div class="kasir-grid">
      <!-- Daftar barang -->
      <div>
        <v-text-field v-model="cari" density="compact" variant="outlined" hide-details clearable prepend-inner-icon="mdi-magnify" placeholder="Cari parfum" class="mb-2" />
        <div v-isi-layar="hp ? 260 : 24" class="baba-gulir">
          <div v-if="memuat" class="text-center py-6"><v-progress-circular indeterminate color="primary" /></div>
          <div v-else-if="!produk.length" class="text-center text-medium-emphasis py-6">Belum ada stok untuk dijual. Stok bertambah dari pesanan Anda di menu Belanja.</div>
          <div v-for="p in tampil" :key="p.item_id" class="baris-produk" data-uji="kasir-produk" @click="tambah(p)">
            <div class="flex-grow-1 min-w-0">
              <div class="font-weight-bold text-truncate">{{ p.nama }}</div>
              <div class="text-caption">Stok {{ p.stok - dipakai(p.item_id) }} · {{ rupiah(p.harga) }}</div>
            </div>
            <v-btn icon size="small" color="primary" variant="tonal" :disabled="dipakai(p.item_id) >= p.stok" aria-label="Tambah"><v-icon>mdi-plus</v-icon></v-btn>
          </div>
        </div>
      </div>

      <!-- Keranjang & bayar -->
      <v-card class="kartu-bayar" data-uji="kasir-keranjang">
        <div class="font-weight-bold mb-1">Keranjang</div>
        <div v-if="!keranjang.length" class="text-caption text-medium-emphasis mb-2">Ketuk parfum untuk menambahkan.</div>
        <div v-for="(k, n) in keranjang" :key="k.item_id" class="baris-kasir">
          <div class="flex-grow-1 min-w-0"><div class="text-body-2 font-weight-bold text-truncate">{{ k.nama }}</div>
            <input v-model.number="k.harga" type="number" min="0" class="input-harga" :aria-label="'Harga ' + k.nama" data-uji="kasir-harga" /></div>
          <div class="d-flex align-center ga-1">
            <v-btn icon size="x-small" variant="tonal" aria-label="Kurangi" @click="kurang(n)"><v-icon>mdi-minus</v-icon></v-btn>
            <span class="qty">{{ k.qty }}</span>
            <v-btn icon size="x-small" variant="tonal" aria-label="Tambah" :disabled="k.qty >= k.stok" @click="k.qty++"><v-icon>mdi-plus</v-icon></v-btn>
          </div>
        </div>
        <div class="d-flex justify-space-between font-weight-bold my-2"><span>Total</span><span data-uji="kasir-total">{{ rupiah(total) }}</span></div>
        <div class="d-flex ga-1 mb-2">
          <v-chip v-for="[k, l] in BAYAR" :key="k" size="small" :variant="bayar === k ? 'flat' : 'outlined'" :color="bayar === k ? 'primary' : undefined"
            :data-uji="'bayar-' + k" @click="bayar = k">{{ l }}</v-chip>
        </div>
        <v-text-field v-if="bayar === 'tunai'" v-model="diterima" label="Uang diterima (opsional)" type="number" density="compact" variant="outlined" hide-details class="mb-1" data-uji="kasir-diterima" />
        <div v-if="bayar === 'tunai' && Number(diterima) >= total && total > 0" class="text-caption mb-1">Kembalian {{ rupiah(Number(diterima) - total) }}</div>
        <v-expansion-panels variant="accordion" class="mb-2">
          <v-expansion-panel title="Pelanggan (opsional)">
            <v-expansion-panel-text>
              <v-text-field v-model="pelanggan.nama" label="Nama" density="compact" variant="outlined" maxlength="100" class="mb-1" />
              <v-text-field v-model="pelanggan.hp" label="Nomor HP" density="compact" variant="outlined" maxlength="30" inputmode="tel" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-checkbox v-model="simpanHarga" label="Ingat harga untuk berikutnya" density="compact" hide-details class="mb-1" />
        <v-btn block color="primary" :disabled="!keranjang.length" :loading="memproses" data-uji="kasir-simpan" @click="simpan">Simpan penjualan</v-btn>
      </v-card>
    </div>

    <!-- Transaksi terakhir -->
    <div class="bagian-judul">Transaksi terakhir</div>
    <div v-if="!riwayat.length" class="text-caption text-medium-emphasis">Belum ada penjualan.</div>
    <div v-for="r in riwayat" :key="r.nomor" class="baris-riwayat" data-uji="kasir-riwayat" @click="struk = r">
      <span>{{ r.nomor }} <span class="text-caption">· {{ waktu(r.tanggal) }} · {{ r.bayar_label }}</span></span>
      <span :class="{ 'text-decoration-line-through text-medium-emphasis': r.status === 'batal' }">{{ rupiah(r.total) }}</span>
    </div>

    <!-- Struk -->
    <v-dialog :model-value="!!struk" max-width="380" scrollable @update:model-value="(v) => !v && (struk = null)">
      <v-card v-if="struk">
        <v-card-text>
          <div id="struk-kasir" class="struk" data-uji="struk">
            <div class="text-center font-weight-bold">BABA PARFUME</div>
            <div class="text-center">{{ struk.penjual }}<span v-if="struk.penjual_no_id"> · {{ struk.penjual_no_id }}</span></div>
            <div class="text-center">{{ struk.nomor }} · {{ waktu(struk.tanggal) }}</div>
            <div v-if="struk.status === 'batal'" class="text-center font-weight-bold">*** DIBATALKAN ***</div>
            <hr />
            <div v-for="(i, n) in struk.item" :key="n"><div>{{ i.nama }}</div>
              <div class="d-flex justify-space-between"><span>{{ i.qty }} × {{ rupiah(i.harga) }}</span><span>{{ rupiah(i.subtotal) }}</span></div></div>
            <hr />
            <div class="d-flex justify-space-between font-weight-bold"><span>TOTAL</span><span>{{ rupiah(struk.total) }}</span></div>
            <div class="d-flex justify-space-between"><span>{{ struk.bayar_label }}</span><span>{{ struk.diterima !== null ? rupiah(struk.diterima) : '' }}</span></div>
            <div v-if="struk.kembali" class="d-flex justify-space-between"><span>Kembali</span><span>{{ rupiah(struk.kembali) }}</span></div>
            <div v-if="struk.pelanggan_nama">Pelanggan: {{ struk.pelanggan_nama }}</div>
            <div class="text-center mt-2">Terima kasih</div>
          </div>
        </v-card-text>
        <v-card-actions class="flex-wrap">
          <v-btn variant="tonal" @click="cetak"><v-icon start>mdi-printer</v-icon>Cetak</v-btn>
          <v-btn variant="tonal" @click="bagikan"><v-icon start>mdi-share-variant</v-icon>Bagikan</v-btn>
          <v-btn v-if="struk.boleh_batal" variant="text" color="error" :loading="memproses" data-uji="kasir-batal" @click="batal">Batalkan</v-btn>
          <v-spacer /><v-btn variant="text" @click="struk = null">Tutup</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="kabar.tampil" :color="kabar.warna" timeout="3000">{{ kabar.teks }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useDisplay } from "vuetify";
import { pesanGalat, rupiah, tokoApi } from "@/utils/tokoOnline";

const BAYAR = [["tunai", "Tunai"], ["transfer", "Transfer"], ["qris", "QRIS"]];
const { smAndDown } = useDisplay();
const hp = computed(() => smAndDown.value);
const produk = ref([]);
const riwayat = ref([]);
const keranjang = ref([]);
const cari = ref("");
const bayar = ref("tunai");
const diterima = ref("");
const simpanHarga = ref(true);
const pelanggan = reactive({ nama: "", hp: "" });
const memuat = ref(true);
const memproses = ref(false);
const galat = ref("");
const struk = ref(null);
const kabar = reactive({ tampil: false, teks: "", warna: "success" });

const tampil = computed(() => {
  const q = (cari.value || "").toLowerCase().trim();
  return produk.value.filter((p) => !q || p.nama.toLowerCase().includes(q));
});
const total = computed(() => keranjang.value.reduce((t, k) => t + k.qty * (Number(k.harga) || 0), 0));
const dipakai = (id) => keranjang.value.find((k) => k.item_id === id)?.qty || 0;
const waktu = (t) => (t ? new Date(t).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
const tampilkan = (teks, warna = "success") => Object.assign(kabar, { tampil: true, teks, warna });

function tambah(p) {
  const ada = keranjang.value.find((k) => k.item_id === p.item_id);
  if (ada) { if (ada.qty < p.stok) ada.qty++; return; }
  if (p.stok > 0) keranjang.value.push({ item_id: p.item_id, nama: p.nama, harga: p.harga, qty: 1, stok: p.stok });
}

function kurang(n) {
  const k = keranjang.value[n];
  if (k.qty > 1) k.qty--;
  else keranjang.value.splice(n, 1);
}

async function muat() {
  memuat.value = true;
  galat.value = "";
  try {
    const [p, r] = await Promise.all([tokoApi("get", "/kasir/produk"), tokoApi("get", "/kasir")]);
    produk.value = p.data || [];
    riwayat.value = (r.data || []).slice(0, 10);
  } catch (e) {
    galat.value = pesanGalat(e, "Kasir belum bisa dimuat.");
  } finally {
    memuat.value = false;
  }
}

async function simpan() {
  memproses.value = true;
  try {
    const r = await tokoApi("post", "/kasir", {
      item: keranjang.value.map((k) => ({ item_id: k.item_id, qty: k.qty, harga: Number(k.harga) || 0 })),
      bayar: bayar.value, diterima: bayar.value === "tunai" && diterima.value !== "" ? Number(diterima.value) : null,
      pelanggan_nama: pelanggan.nama, pelanggan_hp: pelanggan.hp, simpan_harga: simpanHarga.value,
    });
    struk.value = r.data;
    keranjang.value = [];
    diterima.value = "";
    Object.assign(pelanggan, { nama: "", hp: "" });
    tampilkan(r.pesan || "Penjualan tersimpan.");
    muat();
  } catch (e) {
    tampilkan(pesanGalat(e, "Penjualan gagal disimpan."), "error");
  } finally {
    memproses.value = false;
  }
}

async function batal() {
  memproses.value = true;
  try {
    const r = await tokoApi("post", `/kasir/${encodeURIComponent(struk.value.nomor)}/batal`, { alasan: "Dibatalkan di kasir" });
    struk.value = r.data;
    tampilkan(r.pesan || "Dibatalkan.");
    muat();
  } catch (e) {
    tampilkan(pesanGalat(e), "error");
  } finally {
    memproses.value = false;
  }
}

function teksStruk() {
  const s = struk.value;
  return [`BABA PARFUME — ${s.nomor}`, ...s.item.map((i) => `${i.nama} ${i.qty} x ${rupiah(i.harga)} = ${rupiah(i.subtotal)}`), `TOTAL ${rupiah(s.total)} (${s.bayar_label})`, "Terima kasih"].join("\n");
}

function cetak() {
  const isi = document.getElementById("struk-kasir")?.innerHTML || "";
  const w = window.open("", "_blank", "width=380,height=600");
  if (!w) { tampilkan("Jendela cetak diblokir. Pakai Bagikan.", "warning"); return; }
  w.document.write(`<html><head><title>${struk.value.nomor}</title><style>body{font-family:monospace;font-size:12px;width:58mm;margin:0 auto}
    .d-flex{display:flex}.justify-space-between{justify-content:space-between}.text-center{text-align:center}.font-weight-bold{font-weight:bold}</style></head><body>${isi}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

async function bagikan() {
  const teks = teksStruk();
  try {
    if (navigator.share) { await navigator.share({ text: teks }); return; }
  } catch { /* dibatalkan pengguna */ }
  window.open(`https://wa.me/?text=${encodeURIComponent(teks)}`, "_blank", "noopener");
}

onMounted(muat);
defineExpose({ muat });
</script>

<style scoped>
.kasir-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 12px;
}

@media (max-width: 959px) {
  .kasir-grid { grid-template-columns: minmax(0, 1fr); }
}

.baris-produk,
.baris-kasir,
.baris-riwayat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  border-bottom: 1px solid var(--baba-border);
}

.baris-produk,
.baris-riwayat { cursor: pointer; }

.baris-riwayat { justify-content: space-between; font-size: 0.9rem; }

.kartu-bayar {
  padding: 12px;
  border: 1px solid var(--baba-border);
  box-shadow: var(--baba-shadow) !important;
  align-self: start;
}

.input-harga {
  width: 110px;
  border: 1px solid var(--baba-border);
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 0.85rem;
}

.qty { min-width: 24px; text-align: center; font-weight: 800; }
.min-w-0 { min-width: 0; }
.bagian-judul { font-weight: 800; font-size: 0.85rem; margin: 14px 0 4px; }

.struk {
  font-family: ui-monospace, monospace;
  font-size: 0.8rem;
  line-height: 1.4;
}

.struk hr { border: 0; border-top: 1px dashed #999; margin: 6px 0; }
</style>
