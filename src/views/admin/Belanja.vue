<template>
  <!-- Belanja parfum ke gudang BABA (ERP). Selama toko belum dibuka: halaman "Segera hadir". -->
  <SegeraHadir v-if="tokoState.dimuat && !tokoState.aktif" />
  <div v-else class="belanja-page">
    <Breadcrumb :items="[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Belanja' }]" />

    <div class="belanja-alat">
      <v-text-field v-model="cari" density="compact" variant="outlined" hide-details clearable
        prepend-inner-icon="mdi-magnify" placeholder="Cari parfum" class="belanja-cari" />
      <v-btn color="primary" class="tombol-keranjang" data-uji="buka-keranjang" @click="bukaKeranjang">
        <v-badge :content="jumlahBarang" :model-value="jumlahBarang > 0" color="error" floating>
          <v-icon>mdi-cart-outline</v-icon>
        </v-badge>
        <span class="ml-2">{{ jumlahBarang ? rupiah(totalKeranjang) : 'Keranjang' }}</span>
      </v-btn>
    </div>

    <div v-if="pilihSumber" class="belanja-sumber" data-uji="pilih-sumber">
      <span class="text-caption mr-1">Belanja ke:</span>
      <v-chip v-for="[nilai, label] in [['gudang', 'Gudang'], ['upline', 'Upline']]" :key="nilai" size="small" :data-uji="'sumber-' + nilai"
        :variant="sumber === nilai ? 'flat' : 'outlined'" :color="sumber === nilai ? 'primary' : undefined" @click="sumber = nilai">{{ label }}</v-chip>
    </div>
    <div v-if="sumber === 'upline' && opsi?.upline" class="text-caption mb-2" data-uji="info-upline">Upline: <strong>{{ opsi.upline.label }}</strong> — stok dan harga mengikuti stok upline Anda.</div>
    <div v-if="kategoriAda.length > 1" class="belanja-kategori">
      <v-chip v-for="k in ['Semua', ...kategoriAda]" :key="k" size="small" :variant="kategori === k ? 'flat' : 'outlined'"
        :color="kategori === k ? 'primary' : undefined" @click="kategori = k">{{ k }}</v-chip>
    </div>

    <v-alert v-if="galat" type="error" variant="tonal" density="compact" class="mb-3">
      {{ galat }} <v-btn size="small" variant="text" @click="muat">Coba lagi</v-btn>
    </v-alert>
    <v-alert v-if="isSuperadmin" type="info" variant="tonal" density="compact" class="mb-3" data-uji="info-superadmin">
      Akun superadmin hanya bisa melihat katalog. Untuk belanja, masuk dengan akun member.
    </v-alert>

    <div v-isi-layar class="baba-gulir">
      <div v-if="memuat" class="text-center py-8"><v-progress-circular indeterminate color="primary" /></div>
      <div v-else-if="!tampil.length && !galat" class="text-center text-medium-emphasis py-8">
        {{ produk.length ? 'Tidak ada parfum yang cocok.' : (sumber === 'upline' ? 'Upline Anda belum punya stok parfum.' : 'Belum ada parfum yang dijual untuk akun Anda.') }}
      </div>
      <div v-else class="produk-grid">
        <v-card v-for="p in tampil" :key="p.id" class="produk-kartu" :class="{ habis: p.stok <= 0 }" data-uji="produk">
          <div class="produk-foto">
            <img v-if="p.foto" :src="p.foto" :alt="p.nama" loading="lazy" />
            <v-icon v-else size="44" color="grey">mdi-bottle-tonic-outline</v-icon>
            <span v-if="p.kategori" class="produk-kat">{{ p.kategori }}</span>
          </div>
          <div class="produk-isi">
            <div class="produk-nama">{{ p.nama }}</div>
            <div class="produk-harga">{{ rupiah(p.harga) }}</div>
            <div class="produk-label">{{ p.label_harga }}</div>
            <div class="produk-stok" :class="{ 'text-error': p.stok <= 0 }">{{ p.stok > 0 ? `Stok ${p.stok}` : 'Stok habis' }}</div>
            <div class="produk-aksi">
              <template v-if="jumlahDiKeranjang(p.id)">
                <v-btn icon size="x-small" variant="tonal" aria-label="Kurangi" @click="aturKeranjang(p.id, jumlahDiKeranjang(p.id) - 1, p.stok)"><v-icon>mdi-minus</v-icon></v-btn>
                <span class="produk-qty">{{ jumlahDiKeranjang(p.id) }}</span>
                <v-btn icon size="x-small" variant="tonal" aria-label="Tambah" :disabled="jumlahDiKeranjang(p.id) >= p.stok" @click="aturKeranjang(p.id, jumlahDiKeranjang(p.id) + 1, p.stok)"><v-icon>mdi-plus</v-icon></v-btn>
              </template>
              <v-btn v-else-if="p.stok > 0" block size="small" color="primary" data-uji="tambah" @click="aturKeranjang(p.id, 1, p.stok)">
                <v-icon start>mdi-cart-plus</v-icon>Tambah
              </v-btn>
              <v-btn v-else block size="small" variant="tonal" disabled data-uji="tambah">Habis</v-btn>
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <!-- Keranjang & checkout: HP = panel dari bawah, desktop = jendela -->
    <component :is="hp ? VBottomSheet : VDialog" v-model="panel" :max-width="hp ? undefined : 560" scrollable>
      <v-card class="panel-keranjang">
        <div class="panel-kepala">
          <v-btn v-if="langkah === 2" icon variant="text" size="small" aria-label="Kembali" @click="langkah = 1"><v-icon>mdi-arrow-left</v-icon></v-btn>
          <span class="panel-judul">{{ langkah === 1 ? 'Keranjang' : 'Checkout' }}</span>
          <v-spacer />
          <v-btn icon variant="text" size="small" aria-label="Tutup" @click="panel = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="panel-isi">
          <!-- Langkah 1: keranjang -->
          <template v-if="langkah === 1">
            <div v-if="!barisKeranjang.length" class="text-center text-medium-emphasis py-6">Keranjang masih kosong.</div>
            <div v-for="b in barisKeranjang" :key="b.id" class="baris-keranjang">
              <div class="flex-grow-1 min-w-0">
                <div class="font-weight-bold text-truncate">{{ b.nama }}</div>
                <div class="text-caption">{{ rupiah(b.harga) }} · {{ b.label_harga }}</div>
                <div v-if="b.qty > b.stok" class="text-caption text-error">Stok tinggal {{ b.stok }}</div>
              </div>
              <div class="d-flex align-center ga-1">
                <v-btn icon size="x-small" variant="tonal" aria-label="Kurangi" @click="aturKeranjang(b.id, b.qty - 1, b.stok)"><v-icon>mdi-minus</v-icon></v-btn>
                <span class="produk-qty">{{ b.qty }}</span>
                <v-btn icon size="x-small" variant="tonal" aria-label="Tambah" :disabled="b.qty >= b.stok" @click="aturKeranjang(b.id, b.qty + 1, b.stok)"><v-icon>mdi-plus</v-icon></v-btn>
                <v-btn icon size="x-small" variant="text" color="error" aria-label="Hapus" @click="aturKeranjang(b.id, 0)"><v-icon>mdi-delete-outline</v-icon></v-btn>
              </div>
            </div>
            <v-alert v-if="hilang" type="info" variant="tonal" density="compact" class="mt-2">Sebagian barang di keranjang sudah tidak dijual dan dihapus.</v-alert>
          </template>

          <!-- Langkah 2: checkout -->
          <template v-else>
            <div class="bagian-judul">Cara terima barang</div>
            <v-radio-group v-model="form.cara_ambil" hide-details density="compact" class="mb-1">
              <v-radio value="ambil" :label="sumber === 'upline' ? 'Ambil sendiri ke upline' : 'Ambil sendiri di gudang'" />
              <v-radio value="kirim" :label="sumber === 'upline' ? 'Dikirim (ongkir diisi upline)' : 'Dikirim (ongkir diisi gudang)'" />
            </v-radio-group>
            <div v-if="form.cara_ambil === 'ambil' && gudang && sumber === 'gudang'" class="text-caption mb-2">📍 {{ gudang.nama }}{{ gudang.alamat ? ' — ' + gudang.alamat : '' }}</div>
            <template v-if="form.cara_ambil === 'kirim'">
              <v-text-field v-model="form.kirim_nama" label="Nama penerima" density="compact" variant="outlined" maxlength="100" class="mb-1" />
              <v-text-field v-model="form.kirim_hp" label="Nomor HP penerima" density="compact" variant="outlined" maxlength="30" inputmode="tel" class="mb-1" />
              <v-textarea v-model="form.kirim_alamat" label="Alamat lengkap" density="compact" variant="outlined" rows="2" auto-grow maxlength="1000" class="mb-1" />
            </template>

            <div class="bagian-judul">Cara bayar</div>
            <v-radio-group v-model="form.cara_bayar" hide-details density="compact" class="mb-1">
              <v-radio value="transfer" label="Transfer + unggah bukti" :disabled="!adaRekening" />
              <v-radio v-if="sumber === 'upline'" value="tunai" label="Tunai (bayar langsung ke upline)" />
              <v-radio v-if="opsi?.tagihan && sumber === 'gudang'" value="tagihan" :disabled="opsi.tagihan.sisa < totalKeranjang"
                :label="`Tagihan (bayar dalam ${opsi.tagihan.tempo_hari} hari)`" />
            </v-radio-group>
            <div v-if="opsi?.tagihan && sumber === 'gudang'" class="text-caption mb-1" :class="{ 'text-error': opsi.tagihan.sisa < totalKeranjang }">
              Sisa batas tagihan {{ rupiah(opsi.tagihan.sisa) }} dari {{ rupiah(opsi.tagihan.batas) }}.
            </div>
            <div v-if="opsi && !adaRekening" class="text-caption text-error mb-1">{{ sumber === 'upline' ? 'Upline belum mencantumkan rekening — pilih tunai.' : 'Gudang belum mencantumkan rekening transfer.' }}</div>
            <div v-if="form.cara_bayar === 'transfer' && adaRekening" class="text-caption mb-2">
              Rekening tujuan tampil setelah pesanan dibuat{{ opsi?.jam_batas_bayar ? `; bayar dalam ${opsi.jam_batas_bayar} jam` : '' }}.
            </div>

            <v-textarea v-model="form.catatan" :label="sumber === 'upline' ? 'Catatan untuk upline (opsional)' : 'Catatan untuk gudang (opsional)'" density="compact" variant="outlined" rows="1" auto-grow maxlength="500" />
            <v-alert v-if="galatCheckout" type="error" variant="tonal" density="compact" class="mt-2" data-uji="galat-checkout">{{ galatCheckout }}</v-alert>
          </template>
        </v-card-text>
        <div v-if="barisKeranjang.length" class="panel-bawah">
          <div class="d-flex justify-space-between mb-2">
            <span>{{ jumlahBarang }} barang{{ form.cara_ambil === 'kirim' && langkah === 2 ? ' + ongkir' : '' }}</span>
            <strong>{{ rupiah(totalKeranjang) }}</strong>
          </div>
          <v-btn v-if="langkah === 1" block color="primary" :disabled="adaKelebihan" data-uji="lanjut-checkout" @click="keCheckout">Checkout</v-btn>
          <v-btn v-else block color="primary" :loading="mengirim" :disabled="!opsi" data-uji="buat-pesanan" @click="buatPesanan">Buat Pesanan</v-btn>
        </div>
      </v-card>
    </component>

    <v-snackbar v-model="kabar.tampil" :color="kabar.warna" timeout="3500">{{ kabar.teks }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import { VBottomSheet } from "vuetify/components/VBottomSheet";
import { VDialog } from "vuetify/components/VDialog";
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import SegeraHadir from "@/views/admin/SegeraHadir.vue";
import {
  aturKeranjang, jumlahDiKeranjang, keranjang, kosongkanKeranjang, muatToko, muatUlangKeranjang, pakaiKeranjang, pesanGalat, rupiah, tokoApi, tokoState,
} from "@/utils/tokoOnline";

const router = useRouter();
const isSuperadmin = localStorage.getItem("mvo_type_id") === "superadmin";
const { smAndDown } = useDisplay();
const hp = computed(() => smAndDown.value);

const produk = ref([]);
const memuat = ref(true);
const galat = ref("");
const cari = ref("");
const kategori = ref("Semua");
const panel = ref(false);
const langkah = ref(1);
const opsi = ref(null);
const sumber = ref("gudang");
const pilihSumber = computed(() => !!(opsi.value?.sumber?.gudang && opsi.value?.sumber?.upline && opsi.value?.upline));
const hilang = ref(false);
const mengirim = ref(false);
const galatCheckout = ref("");
const kabar = reactive({ tampil: false, teks: "", warna: "success" });

const ALAMAT_KEY = "alamat_kirim_terakhir";
let alamatLama = {};
try { alamatLama = JSON.parse(localStorage.getItem(ALAMAT_KEY) || "{}") || {}; } catch { alamatLama = {}; }
const form = reactive({ cara_ambil: "ambil", cara_bayar: "transfer", kirim_nama: alamatLama.nama || "", kirim_hp: alamatLama.hp || "", kirim_alamat: alamatLama.alamat || "", catatan: "" });

const kategoriAda = computed(() => [...new Set(produk.value.map((p) => p.kategori).filter(Boolean))]);
const tampil = computed(() => {
  const q = (cari.value || "").toLowerCase().trim();
  return produk.value.filter((p) => (kategori.value === "Semua" || p.kategori === kategori.value) && (!q || p.nama.toLowerCase().includes(q)));
});
const barisKeranjang = computed(() => keranjang.isi.map((k) => {
  const p = produk.value.find((x) => x.id === k.id);
  return p ? { ...p, qty: k.qty } : null;
}).filter(Boolean));
const jumlahBarang = computed(() => barisKeranjang.value.reduce((s, b) => s + b.qty, 0));
const totalKeranjang = computed(() => barisKeranjang.value.reduce((s, b) => s + b.qty * b.harga, 0));
const adaKelebihan = computed(() => barisKeranjang.value.some((b) => b.qty > b.stok));
const gudang = computed(() => {
  const id = barisKeranjang.value[0]?.gudang_id;
  return opsi.value?.gudang?.find((g) => g.id === id) || opsi.value?.gudang?.[0] || null;
});
const adaRekening = computed(() => ((sumber.value === "upline" ? opsi.value?.upline?.rekening : gudang.value?.rekening) || []).length > 0);

async function muat() {
  const diminta = sumber.value;
  memuat.value = true;
  galat.value = "";
  try {
    pakaiKeranjang(diminta);
    const r = await tokoApi("get", "/katalog", undefined, diminta === "upline" ? { sumber: "upline" } : undefined);
    if (diminta !== sumber.value) return; // sumber sudah diganti saat menunggu — hasil lama dibuang
    produk.value = r.data || [];
    // barang yang sudah tidak dijual dibuang dari keranjang
    muatUlangKeranjang();
    const ada = new Set(produk.value.map((p) => p.id));
    const sebelum = keranjang.isi.length;
    keranjang.isi.filter((k) => !ada.has(k.id)).forEach((k) => aturKeranjang(k.id, 0));
    hilang.value = keranjang.isi.length < sebelum;
  } catch (e) {
    if (diminta === sumber.value) galat.value = pesanGalat(e, "Katalog belum bisa dimuat.");
  } finally {
    if (diminta === sumber.value) memuat.value = false;
  }
}

function bukaKeranjang() {
  langkah.value = 1;
  galatCheckout.value = "";
  panel.value = true;
}

async function keCheckout() {
  galatCheckout.value = "";
  langkah.value = 2;
  if (!opsi.value) await muatOpsi(true);
  if (sumber.value === "upline") { if (form.cara_bayar === "tagihan" || !adaRekening.value) form.cara_bayar = adaRekening.value ? "transfer" : "tunai"; }
  else if (form.cara_bayar === "tunai") form.cara_bayar = "transfer";
  if (sumber.value === "gudang" && !adaRekening.value && opsi.value?.tagihan) form.cara_bayar = "tagihan";
}

async function buatPesanan() {
  galatCheckout.value = "";
  if (form.cara_ambil === "kirim" && (!form.kirim_nama.trim() || !form.kirim_hp.trim() || form.kirim_alamat.trim().length < 10)) {
    galatCheckout.value = "Isi nama penerima, nomor HP, dan alamat lengkap.";
    return;
  }
  mengirim.value = true;
  try {
    const r = await tokoApi("post", "/pesanan", { ...form, sumber: sumber.value, item: barisKeranjang.value.map((b) => ({ produk_online_id: b.id, qty: b.qty })) });
    if (form.cara_ambil === "kirim") {
      try { localStorage.setItem(ALAMAT_KEY, JSON.stringify({ nama: form.kirim_nama, hp: form.kirim_hp, alamat: form.kirim_alamat })); } catch { /* abaikan */ }
    }
    kosongkanKeranjang();
    panel.value = false;
    router.push({ path: "/admin/pesanan-saya", query: { nomor: r.data.nomor, baru: 1 } });
  } catch (e) {
    galatCheckout.value = pesanGalat(e, "Pesanan gagal dibuat.");
    if (e?.response?.status === 422) muat(); // stok / harga mungkin berubah
  } finally {
    mengirim.value = false;
  }
}

async function muatOpsi(tampilkanGalat = false) {
  try {
    opsi.value = await tokoApi("get", "/checkout-opsi");
    // hanya boleh ke upline → langsung upline
    if (opsi.value?.sumber && !opsi.value.sumber.gudang && opsi.value.sumber.upline && opsi.value.upline) sumber.value = "upline";
  } catch (e) {
    if (tampilkanGalat) galatCheckout.value = pesanGalat(e, "Pilihan checkout belum bisa dimuat.");
  }
}

watch(sumber, () => { muat(); });
watch(() => tokoState.aktif, (aktif) => { if (aktif && !produk.value.length) muat(); });

onMounted(async () => {
  await muatToko(true);
  if (tokoState.aktif) {
    // katalog & pilihan checkout dimuat bersamaan; bila hanya boleh ke upline, muatOpsi mengganti sumber → katalog dimuat ulang (watch)
    muat();
    if (!isSuperadmin) muatOpsi();
  } else memuat.value = false;
});
</script>

<style scoped>
.belanja-alat {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.belanja-cari {
  flex: 1;
  max-width: 420px;
}

.tombol-keranjang {
  height: 40px !important;
  white-space: nowrap;
}

.belanja-sumber {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.belanja-kategori {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.produk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 12px;
}

@media (max-width: 599px) {
  .produk-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
}

.produk-kartu {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--baba-border);
  box-shadow: var(--baba-shadow) !important;
  overflow: hidden;
}

.produk-kartu.habis .produk-foto {
  opacity: 0.55;
}

.produk-foto {
  position: relative;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--baba-bg);
}

.produk-foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.produk-kat {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--baba-ink);
  color: var(--baba-gold-light);
  font-size: 0.7rem;
  font-weight: 700;
}

.produk-isi {
  padding: 8px 10px 10px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.produk-nama {
  font-weight: 700;
  font-size: 0.9rem;
  line-height: 1.25;
  min-height: 2.5em;
}

.produk-harga {
  font-weight: 800;
  color: var(--baba-gold-dark);
  font-size: 1.05rem;
  margin-top: 4px;
}

.produk-label,
.produk-stok {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.produk-aksi {
  margin-top: auto;
  padding-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.produk-qty {
  min-width: 28px;
  text-align: center;
  font-weight: 800;
}

.panel-keranjang {
  max-height: 88dvh;
}

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

.panel-isi {
  overflow-y: auto;
}

.baris-keranjang {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--baba-border);
}

.min-w-0 {
  min-width: 0;
}

.bagian-judul {
  font-weight: 800;
  font-size: 0.85rem;
  margin-top: 6px;
}

.panel-bawah {
  padding: 10px 16px 14px;
  border-top: 1px solid var(--baba-border);
}
</style>
