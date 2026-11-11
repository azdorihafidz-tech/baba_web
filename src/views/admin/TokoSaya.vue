<template>
  <!-- Toko Saya (ERP BABA Tahap 2c): pesanan masuk dari downline, stok saya, rekening saya. Kasir = Tahap 3. -->
  <SegeraHadir v-if="tokoState.dimuat && !tokoState.aktif" />
  <div v-else class="toko-page">
    <Breadcrumb :items="[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Toko Saya' }]" />

    <v-tabs v-model="tab" density="compact" color="primary" class="mb-2" show-arrows>
      <v-tab value="masuk" data-uji="tab-masuk">Pesanan Masuk<v-badge v-if="jumlah.perlu" :content="jumlah.perlu" color="error" inline /></v-tab>
      <v-tab value="retur" data-uji="tab-retur">Retur<v-badge v-if="jumlahRetur" :content="jumlahRetur" color="error" inline /></v-tab>
      <v-tab value="stok" data-uji="tab-stok">Stok Saya</v-tab>
      <v-tab value="rekening" data-uji="tab-rekening">Rekening</v-tab>
      <v-tab value="kasir">Kasir <span class="chip-segera">Segera</span></v-tab>
    </v-tabs>

    <v-alert v-if="galat" type="error" variant="tonal" density="compact" class="mb-2">{{ galat }}</v-alert>

    <!-- ========== Pesanan masuk ========== -->
    <template v-if="tab === 'masuk'">
      <div class="d-flex flex-wrap ga-1 mb-2">
        <v-chip v-for="k in KELOMPOK" :key="k.id" size="small" :variant="kelompok === k.id ? 'flat' : 'outlined'"
          :color="kelompok === k.id ? 'primary' : undefined" @click="gantiKelompok(k.id)">{{ k.label }}</v-chip>
      </div>
      <div v-isi-layar="48" class="baba-gulir">
        <div v-if="memuatMasuk" class="text-center py-8"><v-progress-circular indeterminate color="primary" /></div>
        <div v-else-if="!daftar.length" class="text-center text-medium-emphasis py-8">Belum ada pesanan dari downline di daftar ini.</div>
        <v-card v-for="p in daftar" :key="p.nomor" class="kartu" data-uji="kartu-masuk" @click="buka(p.nomor)">
          <div class="d-flex justify-space-between align-start ga-2">
            <div>
              <div class="font-weight-bold">{{ p.nomor }}</div>
              <div class="text-caption">{{ p.pembeli.no_id }} · {{ p.pembeli.nama }} · {{ p.pembeli.jabatan }}</div>
            </div>
            <span class="chip-status" :class="`st-${p.status}`">{{ p.status_label }}</span>
          </div>
          <div class="text-body-2 text-truncate mt-1">{{ p.ringkas }}</div>
          <div class="d-flex justify-space-between align-center mt-1">
            <span class="text-caption" :class="{ 'text-error font-weight-bold': p.perlu_tindakan }">{{ p.perlu_tindakan ? 'Perlu tindakan' : `${caraBayar(p.cara_bayar)} · ${p.status_bayar_label}` }}</span>
            <strong>{{ p.ongkir === null ? rupiah(p.subtotal) + ' + ongkir' : rupiah(p.total) }}</strong>
          </div>
        </v-card>
      </div>
    </template>

    <!-- ========== Retur masuk ========== -->
    <template v-if="tab === 'retur'">
      <div v-isi-layar="48" class="baba-gulir">
        <div v-if="memuatRetur" class="text-center py-8"><v-progress-circular indeterminate color="primary" /></div>
        <div v-else-if="!returList.length" class="text-center text-medium-emphasis py-8">Belum ada retur dari downline.</div>
        <v-card v-for="rt in returList" :key="rt.nomor" class="kartu" data-uji="kartu-retur" @click="bukaRetur(rt.nomor)">
          <div class="d-flex justify-space-between align-start ga-2">
            <div><div class="font-weight-bold">{{ rt.nomor }}</div><div class="text-caption">{{ rt.pembeli?.no_id }} · {{ rt.pembeli?.nama }} · pesanan {{ rt.pesanan }}</div></div>
            <span class="chip-status" :class="`rt-${rt.status}`">{{ rt.status_label }}</span>
          </div>
          <div class="text-body-2 text-truncate mt-1">{{ rt.item.map((i) => i.nama + ' ×' + i.qty).join(', ') }} — {{ rt.alasan }}</div>
          <div class="text-right font-weight-bold">{{ rupiah(rt.nilai) }}</div>
        </v-card>
      </div>
    </template>

    <!-- ========== Stok saya ========== -->
    <template v-if="tab === 'stok'">
      <div v-isi-layar class="baba-gulir">
        <div v-if="memuatStok" class="text-center py-8"><v-progress-circular indeterminate color="primary" /></div>
        <template v-else>
          <div v-if="!stok.length" class="text-center text-medium-emphasis py-6">Belum ada stok. Stok bertambah otomatis saat pesanan Anda (Belanja) diterima.</div>
          <v-card v-for="s in stok" :key="s.item_id" class="kartu" data-uji="kartu-stok">
            <div class="d-flex justify-space-between align-center">
              <div><div class="font-weight-bold">{{ s.nama }}</div>
                <div class="text-caption">Modal rata-rata {{ rupiah(s.nilai_rata) }}<span v-if="s.dipesan"> · {{ s.dipesan }} dipesan downline</span></div></div>
              <div class="stok-angka">{{ s.qty }} <span class="text-caption">{{ s.satuan }}</span></div>
            </div>
          </v-card>
          <div v-if="mutasi.length" class="bagian-judul">Riwayat stok</div>
          <div v-for="(m, n) in mutasi" :key="n" class="baris-mutasi">
            <span class="text-caption">{{ tanggal(m.tanggal) }}</span>
            <span class="flex-grow-1">{{ m.nama }} <span class="text-caption">· {{ m.jenis_label }}<span v-if="m.catatan"> · {{ m.catatan }}</span></span></span>
            <strong :class="m.qty > 0 ? 'text-success' : 'text-error'">{{ m.qty > 0 ? '+' : '' }}{{ m.qty }}</strong>
          </div>
        </template>
      </div>
    </template>

    <!-- ========== Rekening ========== -->
    <template v-if="tab === 'rekening'">
      <v-card class="kartu" style="max-width: 560px">
        <div class="text-body-2 mb-2">Rekening ini tampil ke downline yang belanja ke Anda dengan cara bayar <strong>transfer</strong>.</div>
        <div v-for="r in rekening" :key="r.id" class="baris-rek" :class="{ 'text-disabled': !r.aktif }">
          <div><strong>{{ r.bank }} {{ r.nomor }}</strong><div class="text-caption">a.n. {{ r.atas_nama }}{{ r.aktif ? '' : ' · disembunyikan' }}</div></div>
          <v-btn size="small" variant="tonal" @click="aktifRek(r.id)">{{ r.aktif ? 'Sembunyikan' : 'Tampilkan' }}</v-btn>
        </div>
        <div v-if="!rekening.length" class="text-caption text-error mb-2">Belum ada rekening — downline hanya bisa bayar tunai.</div>
        <div class="bagian-judul">Tambah rekening</div>
        <v-text-field v-model="rekBaru.bank" label="Bank" density="compact" variant="outlined" maxlength="50" class="mb-1" />
        <v-text-field v-model="rekBaru.nomor" label="Nomor rekening" density="compact" variant="outlined" maxlength="40" inputmode="numeric" class="mb-1" />
        <v-text-field v-model="rekBaru.atas_nama" label="Atas nama" density="compact" variant="outlined" maxlength="100" class="mb-1" />
        <v-btn color="primary" :loading="memproses" data-uji="simpan-rekening" @click="simpanRek">Tambah rekening</v-btn>
      </v-card>
    </template>

    <template v-if="tab === 'kasir'">
      <v-card class="kartu" style="max-width: 560px">
        <div class="font-weight-bold mb-1">Kasir — segera hadir</div>
        <div class="text-body-2">Nanti Anda bisa menjual parfum dari stok Anda ke pelanggan langsung dari HP, lengkap dengan struk dan laporan transaksi, produk, dan kategori.</div>
      </v-card>
    </template>

    <!-- ========== Rincian pesanan masuk ========== -->
    <v-dialog v-model="rinciBuka" :fullscreen="hp" max-width="660" scrollable>
      <v-card class="panel-rinci">
        <div class="panel-kepala">
          <span class="panel-judul">{{ rinci?.nomor || 'Pesanan masuk' }}</span>
          <v-spacer />
          <v-btn icon variant="text" size="small" aria-label="Tutup" @click="rinciBuka = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="panel-isi">
          <div v-if="memuatRinci" class="text-center py-6"><v-progress-circular indeterminate color="primary" /></div>
          <template v-else-if="rinci">
            <div class="d-flex flex-wrap align-center ga-2 mb-2">
              <span class="chip-status" :class="`st-${rinci.status}`" data-uji="status-masuk">{{ rinci.status_label }}</span>
              <span class="text-caption">{{ tanggal(rinci.tanggal) }}</span>
            </div>
            <div class="text-body-2 mb-2">Pembeli: <strong>{{ rinci.pembeli.nama }}</strong> · {{ rinci.pembeli.no_id }} · {{ rinci.pembeli.jabatan }}</div>

            <!-- Tindakan -->
            <div v-if="rinci.boleh.ongkir" class="kotak-aksi">
              <div class="font-weight-bold mb-1">Isi ongkir</div>
              <div class="d-flex ga-2"><v-text-field v-model="ongkir" label="Ongkir (Rp)" density="compact" variant="outlined" inputmode="numeric" hide-details />
                <v-btn color="primary" :loading="memproses" data-uji="simpan-ongkir" @click="aksi('ongkir', { ongkir })">Simpan</v-btn></div>
            </div>
            <div v-if="rinci.boleh.cek_bukti" class="kotak-aksi" data-uji="kotak-cek-bukti">
              <div class="font-weight-bold mb-1">Cek bukti transfer {{ rupiah(rinci.total) }}</div>
              <div v-if="gambarBukti.memuat" class="text-caption">Memuat bukti…</div>
              <img v-else-if="gambarBukti.url && gambarBukti.gambar" :src="gambarBukti.url" alt="Bukti transfer" class="gambar-bukti" data-uji="gambar-bukti" />
              <a v-else-if="gambarBukti.url" :href="gambarBukti.url" target="_blank" rel="noopener">Buka bukti (PDF)</a>
              <div class="d-flex flex-wrap ga-2 mt-2">
                <v-btn color="success" :loading="memproses" data-uji="terima-bukti" @click="aksiBukti('terima')">Terima pembayaran</v-btn>
                <v-btn variant="outlined" color="error" @click="tolakBuka = !tolakBuka">Tolak…</v-btn>
              </div>
              <div v-if="tolakBuka" class="d-flex ga-2 mt-2"><v-text-field v-model="alasan" label="Alasan" density="compact" variant="outlined" hide-details maxlength="255" />
                <v-btn color="error" :loading="memproses" data-uji="tolak-bukti" @click="aksiBukti('tolak', { alasan })">Tolak</v-btn></div>
            </div>
            <div v-if="rinci.boleh.keluarkan" class="kotak-aksi">
              <div class="font-weight-bold mb-1">{{ rinci.cara_ambil === 'kirim' ? 'Kirim pesanan' : 'Siapkan untuk diambil' }}</div>
              <div v-if="stokKurang.length" class="text-caption text-error mb-1">Stok Anda kurang: {{ stokKurang.join(', ') }}.</div>
              <div class="text-caption mb-1">Stok Anda dikurangi saat tombol ini ditekan.</div>
              <template v-if="rinci.cara_ambil === 'kirim'">
                <v-text-field v-model="kurir" label="Kurir / ekspedisi" density="compact" variant="outlined" maxlength="50" class="mb-1" />
                <v-text-field v-model="resi" label="Nomor resi (bila ada)" density="compact" variant="outlined" maxlength="60" class="mb-1" />
              </template>
              <v-btn color="primary" :disabled="stokKurang.length > 0" :loading="memproses" data-uji="keluarkan"
                @click="aksi('keluarkan', { kurir, nomor_resi: resi })">{{ rinci.cara_ambil === 'kirim' ? 'Kirim' : 'Siap diambil' }}</v-btn>
            </div>
            <div v-if="rinci.boleh.tunai" class="kotak-aksi">
              <div class="font-weight-bold mb-1">Bayar tunai {{ rupiah(rinci.total) }}</div>
              <v-btn color="success" :loading="memproses" data-uji="tunai" @click="aksi('tunai')">Uang tunai sudah diterima</v-btn>
            </div>
            <div v-if="rinci.boleh.sudah_diambil" class="kotak-aksi">
              <v-btn color="success" :loading="memproses" data-uji="sudah-diambil" @click="aksi('sudah-diambil')">Sudah diambil pembeli</v-btn>
            </div>

            <div class="bagian-judul">Barang</div>
            <div v-for="i in rinci.item" :key="i.nama" class="baris-item">
              <span>{{ i.nama }} <span class="text-medium-emphasis">×{{ i.qty }}</span>
                <span v-if="rinci.boleh.keluarkan && stokPunya(i.item_id) !== null" class="text-caption" :class="{ 'text-error': stokPunya(i.item_id) < i.qty }"> · stok Anda {{ stokPunya(i.item_id) }}</span></span>
              <span>{{ rupiah(i.subtotal) }}</span>
            </div>
            <div class="baris-item text-medium-emphasis"><span>Ongkir</span><span>{{ rinci.ongkir === null ? 'belum diisi' : rupiah(rinci.ongkir) }}</span></div>
            <div class="baris-item font-weight-bold"><span>Total</span><span>{{ rupiah(rinci.total) }}</span></div>
            <div class="text-caption">Bayar: {{ caraBayar(rinci.cara_bayar) }} · {{ rinci.status_bayar_label }}</div>
            <div class="bagian-judul">{{ rinci.cara_ambil === 'kirim' ? 'Kirim ke' : 'Diambil sendiri' }}</div>
            <div v-if="rinci.kirim" class="text-body-2"><strong>{{ rinci.kirim.nama }}</strong> · {{ rinci.kirim.hp }}<div style="white-space: pre-line">{{ rinci.kirim.alamat }}</div>
              <div v-if="rinci.kurir">Kurir {{ rinci.kurir }}<span v-if="rinci.nomor_resi"> · Resi {{ rinci.nomor_resi }}</span></div></div>
            <div v-else class="text-body-2">Pembeli mengambil barang ke Anda.</div>
            <div v-if="rinci.catatan" class="text-caption mt-1">Catatan pembeli: {{ rinci.catatan }}</div>
            <div v-if="rinci.status === 'batal'" class="text-caption text-error mt-1">Dibatalkan: {{ rinci.batal_alasan }}</div>

            <div class="bagian-judul">Riwayat</div>
            <div v-for="(r, n) in rinci.riwayat" :key="n" class="text-caption"><strong>{{ r.status_label }}</strong> · {{ r.oleh }} · {{ tanggal(r.tanggal) }}<span v-if="r.catatan"> — {{ r.catatan }}</span></div>

            <div v-if="rinci.boleh.batal" class="mt-3">
              <v-btn size="small" variant="text" color="error" @click="batalBuka = !batalBuka">Batalkan pesanan…</v-btn>
              <div v-if="batalBuka" class="d-flex ga-2 mt-1"><v-text-field v-model="alasanBatal" label="Alasan (dikirim ke pembeli)" density="compact" variant="outlined" hide-details maxlength="255" />
                <v-btn color="error" :loading="memproses" data-uji="batal-masuk" @click="aksi('batal', { alasan: alasanBatal })">Batalkan</v-btn></div>
            </div>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ========== Rincian retur masuk ========== -->
    <v-dialog v-model="returBuka" :fullscreen="hp" max-width="560" scrollable>
      <v-card>
        <div class="panel-kepala"><span class="panel-judul">{{ returRinci?.nomor || 'Retur' }}</span><v-spacer />
          <v-btn icon variant="text" size="small" aria-label="Tutup" @click="returBuka = false"><v-icon>mdi-close</v-icon></v-btn></div>
        <v-card-text>
          <div v-if="!returRinci" class="text-center py-6"><v-progress-circular indeterminate color="primary" /></div>
          <template v-else>
            <div class="d-flex flex-wrap align-center ga-2 mb-2"><span class="chip-status" :class="`rt-${returRinci.status}`" data-uji="status-retur">{{ returRinci.status_label }}</span>
              <span class="text-caption">{{ tanggal(returRinci.tanggal) }} · pesanan {{ returRinci.pesanan }}</span></div>
            <div class="text-body-2 mb-2">Pembeli: <strong>{{ returRinci.pembeli?.nama }}</strong> · {{ returRinci.pembeli?.no_id }}</div>
            <div v-for="i in returRinci.item" :key="i.nama" class="baris-item"><span>{{ i.nama }} ×{{ i.qty }}</span><span>{{ rupiah(i.subtotal) }}</span></div>
            <div class="baris-item font-weight-bold"><span>Nilai retur</span><span>{{ rupiah(returRinci.nilai) }}</span></div>
            <div class="bagian-judul">Alasan</div><div class="text-body-2" style="white-space: pre-line">{{ returRinci.alasan }}</div>
            <img v-if="fotoRetur" :src="fotoRetur" alt="Foto retur" class="gambar-bukti mt-2" data-uji="foto-retur-masuk" />
            <div v-if="returRinci.catatan_penjual" class="text-caption mt-2">{{ returRinci.status === 'ditolak' ? 'Alasan ditolak' : 'Catatan' }}: {{ returRinci.catatan_penjual }}</div>
            <div v-if="returRinci.pengembalian_label" class="text-caption">Pengembalian: {{ returRinci.pengembalian_label }}</div>

            <div v-if="returRinci.boleh.putuskan" class="kotak-aksi mt-3">
              <div class="font-weight-bold mb-1">Putuskan retur</div>
              <div class="text-caption mb-2">Setujui setelah barang retur <strong>sudah kembali</strong> ke Anda. Stok Anda bertambah, stok pembeli berkurang.
                {{ returRinci.pesanan_lunas ? 'Pesanan sudah lunas: kembalikan dananya ke pembeli.' : 'Pesanan belum lunas: nilai retur memotong yang harus dibayar.' }}</div>
              <v-radio-group v-if="returRinci.pesanan_lunas" v-model="pengembalian" density="compact" hide-details class="mb-1">
                <v-radio value="transfer" label="Dana ditransfer kembali" /><v-radio value="tunai" label="Dana dikembalikan tunai" />
              </v-radio-group>
              <v-btn color="success" :loading="memproses" data-uji="setujui-retur" @click="putusRetur('setujui', { pengembalian })">Setujui retur</v-btn>
              <div class="d-flex ga-2 mt-2"><v-text-field v-model="alasanTolakRetur" label="Alasan ditolak" density="compact" variant="outlined" hide-details maxlength="255" />
                <v-btn color="error" variant="outlined" :loading="memproses" data-uji="tolak-retur" @click="putusRetur('tolak', { alasan: alasanTolakRetur })">Tolak</v-btn></div>
            </div>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="kabar.tampil" :color="kabar.warna" timeout="3500" data-uji="kabar">{{ kabar.teks }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/config";
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import SegeraHadir from "@/views/admin/SegeraHadir.vue";
import { muatToko, pesanGalat, rupiah, tokoApi, tokoState } from "@/utils/tokoOnline";

const KELOMPOK = [
  { id: "perlu", label: "Perlu tindakan" },
  { id: "berjalan", label: "Berjalan" },
  { id: "selesai", label: "Diterima" },
  { id: "batal", label: "Batal" },
  { id: "", label: "Semua" },
];
const route = useRoute();
const router = useRouter();
const { smAndDown } = useDisplay();
const hp = computed(() => smAndDown.value);

const tab = ref(["masuk", "retur", "stok", "rekening", "kasir"].includes(route.query.tab) ? route.query.tab : "masuk");
const returList = ref([]);
const jumlahRetur = ref(0);
const memuatRetur = ref(false);
const returBuka = ref(false);
const returRinci = ref(null);
const fotoRetur = ref("");
const pengembalian = ref("transfer");
const alasanTolakRetur = ref("");
const kelompok = ref("perlu");
const daftar = ref([]);
const jumlah = ref({});
const stok = ref([]);
const mutasi = ref([]);
const rekening = ref([]);
const rekBaru = reactive({ bank: "", nomor: "", atas_nama: "" });
const memuatMasuk = ref(false);
const memuatStok = ref(false);
const galat = ref("");
const rinci = ref(null);
const rinciBuka = ref(false);
const memuatRinci = ref(false);
const memproses = ref(false);
const ongkir = ref("");
const kurir = ref("");
const resi = ref("");
const alasan = ref("");
const alasanBatal = ref("");
const tolakBuka = ref(false);
const batalBuka = ref(false);
const gambarBukti = reactive({ url: "", gambar: true, memuat: false });
const kabar = reactive({ tampil: false, teks: "", warna: "success" });

const caraBayar = (c) => ({ transfer: "Transfer", tunai: "Tunai", tagihan: "Tagihan" }[c] || c);
const tanggal = (t) => (t ? new Date(t).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "");
const stokPunya = (itemId) => rinci.value?.stok?.find((s) => s.item_id === itemId)?.punya ?? null;
const stokKurang = computed(() => (rinci.value?.boleh?.keluarkan ? rinci.value.item : []).filter((i) => (stokPunya(i.item_id) ?? 0) < i.qty).map((i) => i.nama));

function tampilkan(teks, warna = "success") {
  Object.assign(kabar, { tampil: true, teks, warna });
}

async function muatMasuk() {
  memuatMasuk.value = true;
  galat.value = "";
  try {
    const r = await tokoApi("get", "/masuk", undefined, { kelompok: kelompok.value || undefined });
    daftar.value = r.data || [];
    jumlah.value = r.jumlah || {};
  } catch (e) {
    galat.value = pesanGalat(e, "Pesanan masuk belum bisa dimuat.");
  } finally {
    memuatMasuk.value = false;
  }
}

async function muatStok() {
  memuatStok.value = true;
  galat.value = "";
  try {
    const r = await tokoApi("get", "/stok");
    stok.value = r.data || [];
    mutasi.value = r.mutasi || [];
  } catch (e) {
    galat.value = pesanGalat(e, "Stok belum bisa dimuat.");
  } finally {
    memuatStok.value = false;
  }
}

async function muatRekening() {
  galat.value = "";
  try {
    rekening.value = (await tokoApi("get", "/rekening")).data || [];
  } catch (e) {
    galat.value = pesanGalat(e, "Rekening belum bisa dimuat.");
  }
}

async function muatRetur() {
  memuatRetur.value = true;
  galat.value = "";
  try {
    const r = await tokoApi("get", "/retur-masuk");
    returList.value = r.data || [];
    jumlahRetur.value = r.jumlah?.diajukan || 0;
  } catch (e) {
    galat.value = pesanGalat(e, "Retur belum bisa dimuat.");
  } finally {
    memuatRetur.value = false;
  }
}

function lepasFotoRetur() {
  if (fotoRetur.value) URL.revokeObjectURL(fotoRetur.value);
  fotoRetur.value = "";
}

async function bukaRetur(nomor) {
  returBuka.value = true;
  returRinci.value = null;
  lepasFotoRetur();
  alasanTolakRetur.value = "";
  pengembalian.value = "transfer";
  try {
    returRinci.value = (await tokoApi("get", `/retur-masuk/${encodeURIComponent(nomor)}`)).data;
    if (returRinci.value.ada_foto) {
      const token = Cookies.get("token") || localStorage.getItem("token") || "";
      const f = await axios.get(`${API_URL}/api/toko/retur-masuk/${encodeURIComponent(nomor)}/foto`, { responseType: "blob", headers: { Authorization: `Bearer ${token}` }, timeout: 60000 });
      fotoRetur.value = URL.createObjectURL(f.data);
    }
  } catch (e) {
    if (!returRinci.value) returBuka.value = false;
    tampilkan(pesanGalat(e, "Retur tidak bisa dibuka."), "error");
  }
}

async function putusRetur(aksi, data) {
  memproses.value = true;
  try {
    const r = await tokoApi("post", `/retur-masuk/${encodeURIComponent(returRinci.value.nomor)}/${aksi}`, data);
    returRinci.value = r.data;
    tampilkan(r.pesan || "Tersimpan.");
    muatRetur();
  } catch (e) {
    tampilkan(pesanGalat(e, "Gagal menyimpan."), "error");
  } finally {
    memproses.value = false;
  }
}

watch(returBuka, (b) => { if (!b) lepasFotoRetur(); });

function muatTab() {
  if (tab.value === "retur") muatRetur();
  else if (tab.value === "masuk") muatMasuk();
  else if (tab.value === "stok") muatStok();
  else if (tab.value === "rekening") muatRekening();
}

function gantiKelompok(k) {
  kelompok.value = k;
  muatMasuk();
}

function lepasGambar() {
  if (gambarBukti.url) URL.revokeObjectURL(gambarBukti.url);
  Object.assign(gambarBukti, { url: "", gambar: true, memuat: false });
}

async function muatGambar() {
  lepasGambar();
  const id = rinci.value?.boleh?.cek_bukti;
  if (!id) return;
  gambarBukti.memuat = true;
  try {
    const token = Cookies.get("token") || localStorage.getItem("token") || "";
    const r = await axios.get(`${API_URL}/api/toko/masuk/${encodeURIComponent(rinci.value.nomor)}/bayar/${id}/file`, {
      responseType: "blob", headers: { Authorization: `Bearer ${token}` }, timeout: 60000,
    });
    gambarBukti.gambar = (r.data.type || "").startsWith("image/");
    gambarBukti.url = URL.createObjectURL(r.data);
  } catch {
    tampilkan("Bukti belum bisa dimuat.", "error");
  } finally {
    gambarBukti.memuat = false;
  }
}

async function buka(nomor) {
  rinciBuka.value = true;
  memuatRinci.value = true;
  rinci.value = null;
  tolakBuka.value = false;
  batalBuka.value = false;
  if (route.query.nomor !== nomor) router.replace({ query: { nomor } });
  try {
    rinci.value = (await tokoApi("get", `/masuk/${encodeURIComponent(nomor)}`)).data;
    muatGambar();
  } catch (e) {
    rinciBuka.value = false;
    tampilkan(pesanGalat(e, "Pesanan tidak bisa dibuka."), "error");
  } finally {
    memuatRinci.value = false;
  }
}

watch(rinciBuka, (b) => {
  if (!b) {
    lepasGambar();
    if (route.query.nomor) router.replace({ query: {} });
  }
});

async function setelahAksi(r) {
  rinci.value = r.data;
  tampilkan(r.pesan || "Tersimpan.");
  tolakBuka.value = false;
  batalBuka.value = false;
  muatGambar();
  muatMasuk();
}

async function aksi(jenis, data = {}) {
  memproses.value = true;
  try {
    await setelahAksi(await tokoApi("post", `/masuk/${encodeURIComponent(rinci.value.nomor)}/${jenis}`, data));
  } catch (e) {
    tampilkan(pesanGalat(e, "Gagal menyimpan."), "error");
  } finally {
    memproses.value = false;
  }
}

async function aksiBukti(jenis, data = {}) {
  memproses.value = true;
  try {
    await setelahAksi(await tokoApi("post", `/masuk/${encodeURIComponent(rinci.value.nomor)}/bayar/${rinci.value.boleh.cek_bukti}/${jenis}`, data));
  } catch (e) {
    tampilkan(pesanGalat(e, "Gagal menyimpan."), "error");
  } finally {
    memproses.value = false;
  }
}

async function simpanRek() {
  memproses.value = true;
  try {
    rekening.value = (await tokoApi("post", "/rekening", { ...rekBaru })).data || [];
    Object.assign(rekBaru, { bank: "", nomor: "", atas_nama: "" });
    tampilkan("Rekening disimpan.");
  } catch (e) {
    tampilkan(pesanGalat(e, "Rekening gagal disimpan."), "error");
  } finally {
    memproses.value = false;
  }
}

async function aktifRek(id) {
  try {
    rekening.value = (await tokoApi("post", `/rekening/${id}/aktif`, {})).data || [];
  } catch (e) {
    tampilkan(pesanGalat(e), "error");
  }
}

watch(tab, () => muatTab());
watch(() => route.query.nomor, (n) => { if (n && n !== rinci.value?.nomor && tokoState.aktif) buka(String(n)); });
onBeforeUnmount(lepasGambar);

onMounted(async () => {
  await muatToko(true);
  if (!tokoState.aktif) return;
  if (route.query.nomor) {
    tab.value = "masuk";
    kelompok.value = "";
    buka(String(route.query.nomor));
  }
  muatTab();
  if (tab.value !== "masuk") tokoApi("get", "/masuk", undefined, { kelompok: "perlu" }).then((r) => { jumlah.value = r.jumlah || {}; }).catch(() => {});
  if (tab.value !== "retur") tokoApi("get", "/retur-masuk", undefined, { kelompok: "diajukan" }).then((r) => { jumlahRetur.value = r.jumlah?.diajukan || 0; }).catch(() => {});
  if (route.query.retur) { tab.value = "retur"; bukaRetur(String(route.query.retur)); }
});
</script>

<style scoped>
.kartu {
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid var(--baba-border);
  box-shadow: var(--baba-shadow) !important;
  cursor: pointer;
}

.chip-segera {
  margin-left: 4px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--baba-gold);
  color: var(--baba-ink);
  font-size: 0.62rem;
  font-weight: 800;
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
.rt-diajukan { background: rgba(var(--v-theme-warning), 0.2); }
.rt-disetujui { background: rgba(var(--v-theme-success), 0.18); color: rgb(var(--v-theme-success)); }
.rt-ditolak, .rt-batal { background: rgba(0, 0, 0, 0.08); color: rgba(0, 0, 0, 0.55); }

.stok-angka {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--baba-gold-dark);
  white-space: nowrap;
}

.bagian-judul {
  font-weight: 800;
  font-size: 0.85rem;
  margin: 12px 0 4px;
}

.baris-mutasi {
  display: flex;
  gap: 8px;
  align-items: baseline;
  padding: 4px 0;
  border-bottom: 1px solid var(--baba-border);
  font-size: 0.85rem;
}

.baris-rek {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--baba-border);
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

.kotak-aksi {
  border: 1px solid var(--baba-gold);
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 10px;
  background: rgba(230, 180, 34, 0.06);
}

.gambar-bukti {
  max-width: 100%;
  max-height: 320px;
  border-radius: 8px;
  border: 1px solid var(--baba-border);
}

.baris-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.9rem;
  padding: 2px 0;
}
</style>
