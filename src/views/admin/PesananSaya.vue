<template>
  <!-- Pesanan Saya (ERP BABA). Selama toko belum dibuka: halaman "Segera hadir". -->
  <SegeraHadir v-if="tokoState.dimuat && !menuTokoTerbuka(route.path)" />
  <div v-else class="pesanan-page">
    <Breadcrumb :items="[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Pesanan Saya' }]" />

    <div class="pesanan-alat">
      <v-chip v-for="k in KELOMPOK" :key="k.id" size="small" :variant="kelompok === k.id ? 'flat' : 'outlined'"
        :color="kelompok === k.id ? 'primary' : undefined" @click="gantiKelompok(k.id)">
        {{ k.label }}<span v-if="k.id === 'berjalan' && jumlah.berjalan" class="ml-1">({{ jumlah.berjalan }})</span>
      </v-chip>
      <v-spacer />
      <v-btn size="small" color="primary" variant="tonal" to="/admin/belanja"><v-icon start>mdi-cart-outline</v-icon>Belanja</v-btn>
    </div>

    <v-alert v-if="jumlah.perlu_bayar" type="warning" variant="tonal" density="compact" class="mb-2">
      {{ jumlah.perlu_bayar }} pesanan menunggu pembayaran Anda.
    </v-alert>
    <div v-if="tagihan" class="info-tagihan mb-2">
      Tagihan belum lunas <strong>{{ rupiah(tagihan.terpakai) }}</strong> · sisa batas {{ rupiah(tagihan.sisa) }} dari {{ rupiah(tagihan.batas) }}
    </div>
    <v-alert v-if="galat" type="error" variant="tonal" density="compact" class="mb-2">
      {{ galat }} <v-btn size="small" variant="text" @click="muat()">Coba lagi</v-btn>
    </v-alert>

    <div v-isi-layar="48" class="baba-gulir">
      <div v-if="memuat" class="text-center py-8"><v-progress-circular indeterminate color="primary" /></div>
      <div v-else-if="!daftar.length && !galat" class="text-center text-medium-emphasis py-8">Belum ada pesanan di daftar ini.</div>
      <v-card v-for="p in daftar" :key="p.nomor" class="kartu-pesanan" data-uji="kartu-pesanan" @click="buka(p.nomor)">
        <div class="d-flex justify-space-between align-start ga-2">
          <div>
            <div class="font-weight-bold">{{ p.nomor }}</div>
            <div class="text-caption">{{ tanggal(p.tanggal) }} · {{ p.cara_ambil === 'kirim' ? 'Dikirim' : 'Ambil sendiri' }} · {{ caraBayar(p.cara_bayar) }}</div>
          </div>
          <span class="chip-status" :class="`st-${p.status}`">{{ p.status_label }}</span>
        </div>
        <div class="text-body-2 text-truncate mt-1">{{ p.ringkas }}</div>
        <div class="d-flex justify-space-between align-center mt-1">
          <span class="text-caption" :class="{ 'text-warning font-weight-bold': perluBayar(p) }">{{ perluBayar(p) ? 'Perlu dibayar' : p.status_bayar_label }}</span>
          <strong>{{ p.ongkir === null ? rupiah(p.subtotal) + ' + ongkir' : rupiah(p.total) }}</strong>
        </div>
      </v-card>
      <div v-if="jumlahHalaman > 1" class="d-flex justify-center mt-2">
        <v-pagination v-model="halaman" :length="jumlahHalaman" density="compact" total-visible="5" @update:model-value="muat()" />
      </div>
    </div>

    <!-- Rincian pesanan -->
    <v-dialog v-model="rinciBuka" :fullscreen="hp" max-width="640" scrollable>
      <v-card class="panel-rinci">
        <div class="panel-kepala">
          <span class="panel-judul">{{ rinci?.nomor || 'Pesanan' }}</span>
          <v-spacer />
          <v-btn icon variant="text" size="small" aria-label="Tutup" @click="tutupRinci"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="panel-isi">
          <div v-if="memuatRinci" class="text-center py-6"><v-progress-circular indeterminate color="primary" /></div>
          <template v-else-if="rinci">
            <div class="d-flex flex-wrap align-center ga-2 mb-2">
              <span class="chip-status" :class="`st-${rinci.status}`" data-uji="status-rinci">{{ rinci.status_label }}</span>
              <span class="text-caption">{{ tanggal(rinci.tanggal) }} · {{ rinci.sumber_nama }}</span>
            </div>
            <v-alert v-if="pesanStatus" :type="pesanStatus.jenis" variant="tonal" density="compact" class="mb-3">{{ pesanStatus.teks }}</v-alert>

            <!-- Bayar -->
            <div v-if="rinci.boleh.unggah_bukti" class="kotak-bayar mb-3" data-uji="kotak-bayar">
              <div class="font-weight-bold mb-1">Transfer {{ rupiah(rinci.sisa_bayar) }} ke:</div>
              <div v-for="r in rinci.rekening" :key="r.nomor" class="rekening">
                <div><strong>{{ r.bank }} {{ r.nomor }}</strong><div class="text-caption">a.n. {{ r.atas_nama }}</div></div>
                <v-btn size="x-small" variant="tonal" @click="salin(r.nomor)">Salin</v-btn>
              </div>
              <div v-if="rinci.batas_bayar && rinci.cara_bayar === 'transfer'" class="text-caption mt-1">Bayar sebelum {{ tanggal(rinci.batas_bayar) }} — lewat itu pesanan batal otomatis.</div>
              <div v-if="rinci.cara_bayar === 'tagihan' && rinci.jatuh_tempo" class="text-caption mt-1">Jatuh tempo {{ tanggalSaja(rinci.jatuh_tempo) }}.</div>
              <input ref="inputBukti" type="file" accept="image/*,application/pdf" class="d-none" data-uji="input-bukti" @change="pilihBukti" />
              <v-btn class="mt-2" block color="primary" :loading="mengunggah" data-uji="unggah-bukti" @click="$refs.inputBukti.click()">
                <v-icon start>mdi-upload</v-icon>Unggah bukti transfer
              </v-btn>
              <div class="text-caption mt-1">Foto atau PDF, maksimal 4 MB.</div>
            </div>

            <div class="bagian-judul">Barang</div>
            <div v-for="i in rinci.item" :key="i.nama" class="baris-item">
              <span>{{ i.nama }} <span class="text-medium-emphasis">×{{ i.qty }}</span></span>
              <span>{{ rupiah(i.subtotal) }}</span>
            </div>
            <div class="baris-item text-medium-emphasis"><span>Subtotal</span><span>{{ rupiah(rinci.subtotal) }}</span></div>
            <div class="baris-item text-medium-emphasis"><span>Ongkir</span><span>{{ rinci.ongkir === null ? 'menunggu gudang' : rupiah(rinci.ongkir) }}</span></div>
            <div class="baris-item font-weight-bold"><span>Total</span><span>{{ rinci.ongkir === null ? '—' : rupiah(rinci.total) }}</span></div>
            <div class="text-caption mt-1">Pembayaran: {{ caraBayar(rinci.cara_bayar) }} · {{ rinci.status_bayar_label }}</div>

            <div class="bagian-judul">{{ rinci.cara_ambil === 'kirim' ? 'Pengiriman' : 'Ambil di' }}</div>
            <div v-if="rinci.kirim" class="text-body-2">
              <strong>{{ rinci.kirim.nama }}</strong> · {{ rinci.kirim.hp }}<div style="white-space: pre-line">{{ rinci.kirim.alamat }}</div>
              <div v-if="rinci.kurir" class="mt-1">Kurir {{ rinci.kurir }}<span v-if="rinci.nomor_resi"> · Resi <strong>{{ rinci.nomor_resi }}</strong>
                <v-btn size="x-small" variant="text" @click="salin(rinci.nomor_resi)">Salin</v-btn></span></div>
            </div>
            <div v-else class="text-body-2">{{ rinci.alamat_ambil }}</div>
            <div v-if="rinci.catatan" class="text-caption mt-1">Catatan: {{ rinci.catatan }}</div>

            <div v-if="rinci.nilai_retur > 0" class="baris-item text-success"><span>Retur disetujui</span><span>− {{ rupiah(rinci.nilai_retur) }}</span></div>

            <template v-if="rinci.retur && rinci.retur.length">
              <div class="bagian-judul">Retur</div>
              <div v-for="rt in rinci.retur" :key="rt.nomor" class="baris-retur" data-uji="baris-retur">
                <span>{{ rt.nomor }} · {{ rupiah(rt.nilai) }}</span>
                <span class="d-flex align-center ga-1"><span class="chip-status" :class="`rt-${rt.status}`">{{ rt.status_label }}</span>
                  <v-btn v-if="rt.status === 'diajukan'" size="x-small" variant="text" color="error" :loading="memproses" data-uji="batal-retur" @click="batalRetur(rt.nomor)">Batalkan</v-btn></span>
              </div>
            </template>

            <template v-if="rinci.bukti.length">
              <div class="bagian-judul">Bukti transfer</div>
              <div v-for="(b, n) in rinci.bukti" :key="n" class="text-caption">
                {{ tanggal(b.tanggal) }} · {{ rupiah(b.nominal) }} ·
                <span :class="{ 'text-success': b.status === 'diterima', 'text-error': b.status === 'ditolak' }">{{ b.status_label }}</span>
                <span v-if="b.alasan"> — {{ b.alasan }}</span>
              </div>
            </template>

            <div class="bagian-judul">Riwayat</div>
            <div v-for="(r, n) in rinci.riwayat" :key="n" class="riwayat">
              <span class="titik" />
              <div><div class="text-body-2"><strong>{{ r.status_label }}</strong> <span class="text-caption">· {{ r.oleh }} · {{ tanggal(r.tanggal) }}</span></div>
                <div v-if="r.catatan" class="text-caption">{{ r.catatan }}</div></div>
            </div>
          </template>
        </v-card-text>
        <div v-if="rinci && (rinci.boleh.terima || rinci.boleh.batal || rinci.boleh.retur)" class="panel-bawah d-flex ga-2">
          <v-btn v-if="rinci.boleh.retur" variant="outlined" class="flex-grow-1" data-uji="ajukan-retur" @click="bukaRetur">Ajukan retur</v-btn>
          <v-btn v-if="rinci.boleh.batal" variant="outlined" color="error" class="flex-grow-1" data-uji="batal" @click="tanyaBatal = true">Batalkan</v-btn>
          <v-btn v-if="rinci.boleh.terima" color="success" class="flex-grow-1" :loading="memproses" data-uji="terima" @click="tanyaTerima = true">Pesanan Diterima</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="tanyaBatal" max-width="420">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-bold">Batalkan pesanan {{ rinci?.nomor }}?</v-card-title>
        <v-card-text><v-text-field v-model="alasanBatal" label="Alasan (opsional)" density="compact" variant="outlined" maxlength="200" hide-details /></v-card-text>
        <v-card-actions><v-spacer /><v-btn variant="text" @click="tanyaBatal = false">Tidak</v-btn>
          <v-btn color="error" :loading="memproses" data-uji="ya-batal" @click="aksi('batal', { alasan: alasanBatal })">Ya, batalkan</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Ajukan retur -->
    <v-dialog v-model="returBuka" :fullscreen="hp" max-width="520" scrollable>
      <v-card>
        <div class="panel-kepala"><span class="panel-judul">Ajukan retur {{ rinci?.nomor }}</span><v-spacer />
          <v-btn icon variant="text" size="small" aria-label="Tutup" @click="returBuka = false"><v-icon>mdi-close</v-icon></v-btn></div>
        <v-card-text>
          <div class="text-caption mb-2">Pilih barang dan jumlah yang dikembalikan. Kirim / bawa barangnya ke penjual; penjual menyetujui setelah barang diperiksa.</div>
          <div v-for="i in (rinci?.item || []).filter((x) => x.bisa_retur > 0)" :key="i.id" class="baris-keranjang">
            <div class="flex-grow-1"><div class="font-weight-bold">{{ i.nama }}</div><div class="text-caption">{{ rupiah(i.harga) }} · bisa diretur {{ i.bisa_retur }}</div></div>
            <div class="d-flex align-center ga-1">
              <v-btn icon size="x-small" variant="tonal" aria-label="Kurangi" :disabled="!formRetur.qty[i.id]" @click="formRetur.qty[i.id] = (formRetur.qty[i.id] || 0) - 1"><v-icon>mdi-minus</v-icon></v-btn>
              <span class="produk-qty" data-uji="qty-retur">{{ formRetur.qty[i.id] || 0 }}</span>
              <v-btn icon size="x-small" variant="tonal" aria-label="Tambah" data-uji="tambah-retur" :disabled="(formRetur.qty[i.id] || 0) >= i.bisa_retur" @click="formRetur.qty[i.id] = (formRetur.qty[i.id] || 0) + 1"><v-icon>mdi-plus</v-icon></v-btn>
            </div>
          </div>
          <v-textarea v-model="formRetur.alasan" label="Alasan retur" density="compact" variant="outlined" rows="2" auto-grow maxlength="500" class="mt-3" data-uji="alasan-retur" />
          <input ref="inputFotoRetur" type="file" accept="image/*" class="d-none" data-uji="foto-retur" @change="pilihFotoRetur" />
          <v-btn size="small" variant="tonal" @click="$refs.inputFotoRetur.click()"><v-icon start>mdi-camera</v-icon>{{ formRetur.foto ? 'Ganti foto' : 'Tambah foto (opsional)' }}</v-btn>
          <span v-if="formRetur.foto" class="text-caption ml-2">Foto dipilih</span>
          <div class="d-flex justify-space-between mt-3"><span>Nilai retur</span><strong>{{ rupiah(nilaiRetur) }}</strong></div>
          <v-alert v-if="galatRetur" type="error" variant="tonal" density="compact" class="mt-2" data-uji="galat-retur">{{ galatRetur }}</v-alert>
        </v-card-text>
        <div class="panel-bawah"><v-btn block color="primary" :loading="memproses" :disabled="nilaiRetur <= 0" data-uji="kirim-retur" @click="kirimRetur">Kirim pengajuan retur</v-btn></div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="tanyaTerima" max-width="420">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-bold">Barang sudah Anda terima?</v-card-title>
        <v-card-text>Tekan Ya bila semua barang sudah sampai dengan baik.</v-card-text>
        <v-card-actions><v-spacer /><v-btn variant="text" @click="tanyaTerima = false">Belum</v-btn>
          <v-btn color="success" :loading="memproses" data-uji="ya-terima" @click="aksi('terima')">Ya, sudah diterima</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="kabar.tampil" :color="kabar.warna" timeout="3500" data-uji="kabar">{{ kabar.teks }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import SegeraHadir from "@/views/admin/SegeraHadir.vue";
import { menuTokoTerbuka, muatToko, pesanGalat, rupiah, tokoApi, tokoState } from "@/utils/tokoOnline";

const KELOMPOK = [
  { id: "berjalan", label: "Berjalan" },
  { id: "selesai", label: "Diterima" },
  { id: "batal", label: "Batal" },
  { id: "", label: "Semua" },
];

const route = useRoute();
const router = useRouter();
const { smAndDown } = useDisplay();
const hp = computed(() => smAndDown.value);

const kelompok = ref("berjalan");
const daftar = ref([]);
const jumlah = ref({});
const tagihan = ref(null);
const halaman = ref(1);
const jumlahHalaman = ref(1);
const memuat = ref(true);
const galat = ref("");
const rinci = ref(null);
const rinciBuka = ref(false);
const memuatRinci = ref(false);
const mengunggah = ref(false);
const memproses = ref(false);
const tanyaBatal = ref(false);
const tanyaTerima = ref(false);
const alasanBatal = ref("");
const kabar = reactive({ tampil: false, teks: "", warna: "success" });
const inputBukti = ref(null);
const returBuka = ref(false);
const galatRetur = ref("");
const formRetur = reactive({ qty: {}, alasan: "", foto: null });
const nilaiRetur = computed(() => (rinci.value?.item || []).reduce((t, i) => t + (formRetur.qty[i.id] || 0) * i.harga, 0));

function bukaRetur() {
  Object.assign(formRetur, { qty: {}, alasan: "", foto: null });
  galatRetur.value = "";
  returBuka.value = true;
}

async function pilihFotoRetur(ev) {
  const file = ev.target.files?.[0];
  ev.target.value = "";
  if (!file) return;
  const siap = await perkecilFoto(file);
  if (siap.size > 4 * 1024 * 1024) { galatRetur.value = "Foto maksimal 4 MB."; return; }
  formRetur.foto = siap;
}

async function kirimRetur() {
  galatRetur.value = "";
  const item = Object.entries(formRetur.qty).filter(([, q]) => q > 0).map(([id, qty]) => ({ id: Number(id), qty }));
  if (formRetur.alasan.trim().length < 5) { galatRetur.value = "Tulis alasan retur (minimal 5 huruf)."; return; }
  const fd = new FormData();
  fd.append("alasan", formRetur.alasan.trim());
  fd.append("item", JSON.stringify(item));
  if (formRetur.foto) fd.append("foto", formRetur.foto, formRetur.foto.name || "retur.jpg");
  memproses.value = true;
  try {
    const r = await tokoApi("post", `/pesanan/${encodeURIComponent(rinci.value.nomor)}/retur`, fd);
    returBuka.value = false;
    tampilkan(r.pesan || "Retur diajukan.");
    await buka(rinci.value.nomor);
  } catch (e) {
    galatRetur.value = pesanGalat(e, "Retur gagal diajukan.");
  } finally {
    memproses.value = false;
  }
}

async function batalRetur(nomor) {
  memproses.value = true;
  try {
    const r = await tokoApi("post", `/retur/${encodeURIComponent(nomor)}/batal`, {});
    tampilkan(r.pesan || "Retur dibatalkan.");
    await buka(rinci.value.nomor);
  } catch (e) {
    tampilkan(pesanGalat(e), "error");
  } finally {
    memproses.value = false;
  }
}

const perluBayar = (p) => p.status_bayar === "belum" && ((p.cara_bayar === "transfer" && p.status === "menunggu_bayar")
  || (p.cara_bayar === "tagihan" && ["disiapkan", "dikirim", "siap_diambil", "diterima"].includes(p.status)));

// penjual = gudang atau upline (pesanan ke upline, Tahap 2c)
const PESAN_STATUS = (penjual, p) => ({
  menunggu_ongkir: { jenis: "info", teks: `${penjual === "gudang" ? "Gudang" : "Upline"} sedang menghitung ongkir. Anda akan diberi tahu lewat lonceng setelah ongkir diisi.` },
  menunggu_cek: { jenis: "info", teks: `Bukti transfer sedang dicek ${penjual}.` },
  disiapkan: { jenis: "info", teks: `Pesanan sedang disiapkan ${penjual}.${p.cara_bayar === "tunai" && p.status_bayar !== "lunas" ? " Bayar tunai langsung ke upline Anda." : ""}` },
  dikirim: { jenis: "success", teks: "Pesanan sedang dikirim. Tekan Pesanan Diterima setelah barang sampai." },
  siap_diambil: { jenis: "success", teks: `Pesanan siap diambil di ${penjual}. Tekan Pesanan Diterima setelah barang Anda ambil.` },
});
const pesanStatus = computed(() => {
  const p = rinci.value;
  if (!p) return null;
  if (p.status === "batal") return { jenis: "warning", teks: `Dibatalkan: ${p.batal_alasan || "-"}` };
  if (p.status === "diterima") return { jenis: "success", teks: p.diterima_otomatis ? "Pesanan diterima otomatis." : "Pesanan sudah diterima. Terima kasih!" };
  return PESAN_STATUS(p.sumber === "upline" ? "upline" : "gudang", p)[p.status] || null;
});
const caraBayar = (c) => ({ transfer: "Transfer", tagihan: "Tagihan", tunai: "Tunai" }[c] || c);

const tanggal = (t) => (t ? new Date(t).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "");
const tanggalSaja = (t) => (t ? new Date(t + "T00:00:00").toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "");

function tampilkan(teks, warna = "success") {
  Object.assign(kabar, { tampil: true, teks, warna });
}

async function muat() {
  memuat.value = true;
  galat.value = "";
  try {
    const r = await tokoApi("get", "/pesanan", undefined, { kelompok: kelompok.value || undefined, page: halaman.value });
    daftar.value = r.data || [];
    jumlah.value = r.jumlah || {};
    tagihan.value = r.tagihan && r.tagihan.terpakai > 0 ? r.tagihan : null;
    jumlahHalaman.value = r.jumlah_halaman || 1;
  } catch (e) {
    galat.value = pesanGalat(e, "Daftar pesanan belum bisa dimuat.");
  } finally {
    memuat.value = false;
  }
}

function gantiKelompok(k) {
  kelompok.value = k;
  halaman.value = 1;
  muat();
}

async function buka(nomor) {
  rinciBuka.value = true;
  memuatRinci.value = true;
  rinci.value = null;
  if (route.query.nomor !== nomor) router.replace({ query: { nomor } });
  try {
    rinci.value = (await tokoApi("get", `/pesanan/${encodeURIComponent(nomor)}`)).data;
  } catch (e) {
    rinciBuka.value = false;
    tampilkan(pesanGalat(e, "Pesanan tidak bisa dibuka."), "error");
  } finally {
    memuatRinci.value = false;
  }
}

function tutupRinci() {
  rinciBuka.value = false;
}

watch(rinciBuka, (buka) => { if (!buka && route.query.nomor) router.replace({ query: {} }); });

async function salin(teks) {
  try {
    await navigator.clipboard.writeText(teks);
    tampilkan("Disalin.");
  } catch {
    tampilkan(teks, "info");
  }
}

/** Foto besar diperkecil (sisi terpanjang 1600 px, JPEG) supaya cepat terkirim dari HP. */
function perkecilFoto(file) {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.size < 900 * 1024) return resolve(file);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const skala = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * skala);
      c.height = Math.round(img.height * skala);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => resolve(b ? new File([b], "bukti.jpg", { type: "image/jpeg" }) : file), "image/jpeg", 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

async function pilihBukti(ev) {
  const file = ev.target.files?.[0];
  ev.target.value = "";
  if (!file || !rinci.value) return;
  const siap = await perkecilFoto(file);
  if (siap.size > 4 * 1024 * 1024) {
    tampilkan("Ukuran bukti maksimal 4 MB.", "error");
    return;
  }
  const fd = new FormData();
  fd.append("file", siap, siap.name || "bukti");
  mengunggah.value = true;
  try {
    const r = await tokoApi("post", `/pesanan/${encodeURIComponent(rinci.value.nomor)}/bukti`, fd);
    rinci.value = r.data;
    tampilkan(r.pesan || "Bukti terkirim.");
    muat();
    muatToko(true);
  } catch (e) {
    tampilkan(pesanGalat(e, "Bukti gagal diunggah."), "error");
  } finally {
    mengunggah.value = false;
  }
}

async function aksi(jenis, data = {}) {
  if (!rinci.value) return;
  memproses.value = true;
  try {
    const r = await tokoApi("post", `/pesanan/${encodeURIComponent(rinci.value.nomor)}/${jenis}`, data);
    rinci.value = r.data;
    tampilkan(r.pesan || "Tersimpan.");
    muat();
    muatToko(true);
  } catch (e) {
    tampilkan(pesanGalat(e, "Gagal menyimpan."), "error");
  } finally {
    memproses.value = false;
    tanyaBatal.value = false;
    tanyaTerima.value = false;
    alasanBatal.value = "";
  }
}

// lonceng / tautan dengan ?nomor= saat halaman sudah terbuka
watch(() => route.query.nomor, (n) => { if (n && n !== rinci.value?.nomor && menuTokoTerbuka(route.path)) buka(String(n)); });

onMounted(async () => {
  await muatToko(true);
  if (!menuTokoTerbuka(route.path)) {
    memuat.value = false;
    return;
  }
  if (route.query.baru) tampilkan("Pesanan dibuat. Lihat langkah berikutnya di bawah.");
  muat();
  if (route.query.nomor) buka(String(route.query.nomor));
});
</script>

<style scoped>
.pesanan-alat {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-bottom: 8px;
}

.info-tagihan {
  font-size: 0.85rem;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(230, 180, 34, 0.12);
}

.kartu-pesanan {
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid var(--baba-border);
  box-shadow: var(--baba-shadow) !important;
  cursor: pointer;
}

.chip-status {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
  background: rgba(var(--v-theme-primary), 0.18);
  color: var(--baba-ink);
}

.st-menunggu_ongkir, .st-menunggu_bayar { background: rgba(var(--v-theme-warning), 0.2); }
.st-menunggu_cek { background: rgba(var(--v-theme-info), 0.18); }
.st-diterima { background: rgba(var(--v-theme-success), 0.18); color: rgb(var(--v-theme-success)); }
.st-batal { background: rgba(0, 0, 0, 0.08); color: rgba(0, 0, 0, 0.55); }

.panel-kepala {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 12px;
  background: var(--baba-ink);
  border-bottom: 2px solid var(--baba-gold);
  color: var(--baba-gold-light);
}

.panel-kepala .v-btn {
  color: var(--baba-gold-light);
}

.panel-judul {
  font-weight: 800;
  font-size: 1.05rem;
}

.kotak-bayar {
  border: 1px solid var(--baba-gold);
  border-radius: 12px;
  padding: 10px 12px;
  background: rgba(230, 180, 34, 0.06);
}

.rekening {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.bagian-judul {
  font-weight: 800;
  font-size: 0.85rem;
  margin: 12px 0 4px;
}

.baris-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.9rem;
  padding: 2px 0;
}

.baris-retur {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  padding: 3px 0;
}

.rt-diajukan { background: rgba(var(--v-theme-warning), 0.2); }
.rt-disetujui { background: rgba(var(--v-theme-success), 0.18); color: rgb(var(--v-theme-success)); }
.rt-ditolak, .rt-batal { background: rgba(0, 0, 0, 0.08); color: rgba(0, 0, 0, 0.55); }

.baris-keranjang {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--baba-border);
}

.produk-qty {
  min-width: 28px;
  text-align: center;
  font-weight: 800;
}

.riwayat {
  display: flex;
  gap: 10px;
  padding: 4px 0;
}

.titik {
  flex: 0 0 10px;
  height: 10px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--baba-gold);
}

.panel-bawah {
  padding: 10px 16px 14px;
  border-top: 1px solid var(--baba-border);
}
</style>
