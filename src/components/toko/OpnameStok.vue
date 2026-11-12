<template>
  <!-- Toko Saya › Stok Saya › Stok opname (ERP BABA Tahap 7f): member mencatat sendiri barang yang berkurang (rusak, hilang, dll.).
       Hanya mengurangi stok, tanpa persetujuan, tidak mengubah RO. -->
  <div class="opname">
    <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-clipboard-check-outline" :disabled="!stok.length" data-uji="opname-buka" @click="buka">Stok opname</v-btn>

    <div v-if="riwayat.length" class="bagian-judul">Riwayat stok opname</div>
    <div v-for="r in riwayat" :key="r.nomor" class="baris-riwayat" data-uji="opname-riwayat" @click="lihat = r">
      <span>{{ r.nomor }} <span class="text-caption">· {{ waktu(r.tanggal) }} · {{ r.item.length }} barang</span></span>
      <strong class="text-error">−{{ rupiah(r.total_nilai) }}</strong>
    </div>

    <!-- Lembar opname -->
    <v-dialog v-model="dialog" :fullscreen="hp" max-width="640" scrollable>
      <v-card data-uji="opname-lembar">
        <v-card-title class="d-flex align-center">
          <span class="flex-grow-1">Stok opname</span>
          <v-btn icon variant="text" aria-label="Tutup" @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <div class="text-body-2 mb-2">Hitung barang di rak lalu isi <strong>Fisik</strong>. Barang yang berkurang wajib diberi penyebab. Stok yang <strong>lebih</strong> tidak bisa dicatat sendiri — hubungi admin gudang.</div>
          <div v-for="b in baris" :key="b.item_id" class="baris-opname" :class="{ kurang: b.fisik !== '' && Number(b.fisik) < b.qty, salah: b.fisik !== '' && Number(b.fisik) > b.qty }" data-uji="opname-baris">
            <div class="d-flex align-center ga-2">
              <div class="flex-grow-1 min-w-0">
                <div class="font-weight-bold text-truncate">{{ b.nama }}</div>
                <div class="text-caption">Stok {{ b.qty }} {{ b.satuan }}<span v-if="b.dipesan"> · {{ b.dipesan }} dipesan downline</span></div>
              </div>
              <input v-model="b.fisik" type="number" min="0" step="1" inputmode="numeric" class="input-fisik" :aria-label="'Fisik ' + b.nama" data-uji="opname-fisik" />
            </div>
            <div v-if="b.fisik !== '' && Number(b.fisik) > b.qty" class="text-caption text-error">Lebih dari stok. Tidak bisa dicatat sendiri — hubungi admin gudang.</div>
            <div v-else-if="b.fisik !== '' && Number(b.fisik) < b.qty" class="mt-1">
              <div class="text-caption text-error">Kurang {{ b.qty - Number(b.fisik) }} · ≈ {{ rupiah((b.qty - Number(b.fisik)) * b.nilai_rata) }}</div>
              <v-select v-model="b.penyebab" :items="PENYEBAB" item-title="label" item-value="kode" label="Penyebab" density="compact" variant="outlined" hide-details class="mt-1" data-uji="opname-penyebab" />
              <v-text-field v-model="b.catatan" label="Catatan (opsional)" density="compact" variant="outlined" hide-details maxlength="255" class="mt-1" />
            </div>
          </div>
          <v-text-field v-model="catatan" label="Catatan opname (opsional)" density="compact" variant="outlined" hide-details maxlength="255" class="mt-3" />
          <v-file-input v-model="foto" label="Foto bukti (opsional)" accept="image/jpeg,image/png,image/webp" capture="environment" density="compact" variant="outlined" hide-details class="mt-2" prepend-icon="mdi-camera" data-uji="opname-foto" />
          <v-alert v-if="galat" type="error" variant="tonal" density="compact" class="mt-2" data-uji="opname-galat">{{ galat }}</v-alert>
        </v-card-text>
        <v-card-actions class="bilah-opname">
          <div class="flex-grow-1 text-body-2"><strong data-uji="opname-ringkas">{{ ringkas.jumlah }} barang berkurang</strong><div class="text-caption">≈ {{ rupiah(ringkas.nilai) }} (modal)</div></div>
          <v-btn color="primary" variant="flat" :disabled="!bisaSimpan" :loading="memproses" data-uji="opname-simpan" @click="simpan">Simpan opname</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Rincian / hasil -->
    <v-dialog :model-value="!!lihat" max-width="420" scrollable @update:model-value="(v) => !v && (lihat = null)">
      <v-card v-if="lihat" data-uji="opname-rinci">
        <v-card-text>
          <div class="text-center font-weight-bold">STOK OPNAME</div>
          <div class="text-center">{{ lihat.nomor }} · {{ waktu(lihat.tanggal) }}</div>
          <hr class="my-2" />
          <div v-for="(i, n) in lihat.item" :key="n" class="mb-1">
            <div class="font-weight-bold">{{ i.nama }}</div>
            <div class="d-flex justify-space-between text-body-2"><span>{{ i.stok_sebelum }} → {{ i.fisik }} (−{{ i.qty }}) · {{ i.penyebab_label }}</span><span>{{ rupiah(i.nilai) }}</span></div>
            <div v-if="i.catatan" class="text-caption">{{ i.catatan }}</div>
          </div>
          <hr class="my-2" />
          <div class="d-flex justify-space-between font-weight-bold"><span>Total (modal)</span><span>{{ rupiah(lihat.total_nilai) }}</span></div>
          <div v-if="lihat.catatan" class="text-caption mt-1">{{ lihat.catatan }}</div>
          <div v-if="lihat.ada_foto" class="mt-2"><v-btn size="small" variant="text" prepend-icon="mdi-image" :loading="memuatFoto" @click="bukaFoto">Lihat foto</v-btn></div>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="tonal" prepend-icon="mdi-printer" data-uji="opname-cetak" @click="cetak">Cetak<span v-if="printerSiap()" class="text-caption ml-1">({{ printerState.nama }})</span></v-btn>
          <v-spacer /><v-btn variant="text" @click="lihat = null">Tutup</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="kabar.tampil" :color="kabar.warna" timeout="3500">{{ kabar.teks }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useDisplay } from "vuetify";
import { pesanGalat, rupiah, tokoApi, tokenSaya } from "@/utils/tokoOnline";
import { API_URL } from "@/config";
import { buatStruk, cetakBytes, printerSiap, printerState, rupiahStruk } from "@/utils/printer";

const props = defineProps({ stok: { type: Array, default: () => [] } });
const emit = defineEmits(["tersimpan"]);
const PENYEBAB = [
  { kode: "rusak", label: "Rusak / pecah / bocor" }, { kode: "hilang", label: "Hilang" }, { kode: "susut", label: "Susut / menguap" },
  { kode: "tester", label: "Tester / promosi" }, { kode: "kedaluwarsa", label: "Kedaluwarsa" }, { kode: "salah_catat", label: "Salah catat" },
];
const { smAndDown } = useDisplay();
const hp = computed(() => smAndDown.value);
const dialog = ref(false);
const baris = ref([]);
const catatan = ref("");
const foto = ref(null);
const galat = ref("");
const memproses = ref(false);
const riwayat = ref([]);
const lihat = ref(null);
const memuatFoto = ref(false);
const kabar = reactive({ tampil: false, teks: "", warna: "success" });
const waktu = (t) => (t ? new Date(t).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "");

const berkurang = computed(() => baris.value.filter((b) => b.fisik !== "" && Number(b.fisik) < b.qty));
const ringkas = computed(() => ({ jumlah: berkurang.value.length, nilai: berkurang.value.reduce((t, b) => t + (b.qty - Number(b.fisik)) * b.nilai_rata, 0) }));
const adaSalah = computed(() => baris.value.some((b) => b.fisik !== "" && (Number(b.fisik) > b.qty || Number(b.fisik) < 0 || !Number.isInteger(Number(b.fisik)))));
const bisaSimpan = computed(() => ringkas.value.jumlah > 0 && !adaSalah.value && berkurang.value.every((b) => b.penyebab));

function buka() {
  baris.value = props.stok.filter((s) => s.qty > 0).map((s) => ({ ...s, fisik: "", penyebab: null, catatan: "" }));
  catatan.value = "";
  foto.value = null;
  galat.value = "";
  dialog.value = true;
}

async function simpan() {
  memproses.value = true;
  galat.value = "";
  try {
    const f = new FormData();
    f.append("item", JSON.stringify(berkurang.value.map((b) => ({ item_id: b.item_id, fisik: Number(b.fisik), penyebab: b.penyebab, catatan: b.catatan }))));
    f.append("catatan", catatan.value || "");
    const file = Array.isArray(foto.value) ? foto.value[0] : foto.value;
    if (file) f.append("foto", file);
    const r = await tokoApi("post", "/stok/opname", f);
    dialog.value = false;
    lihat.value = r.data;
    Object.assign(kabar, { tampil: true, teks: r.pesan || "Stok opname tersimpan.", warna: "success" });
    emit("tersimpan");
    muat();
  } catch (e) {
    galat.value = pesanGalat(e, "Stok opname gagal disimpan.");
  } finally {
    memproses.value = false;
  }
}

async function muat() {
  try {
    riwayat.value = (await tokoApi("get", "/stok/opname")).data || [];
  } catch {
    riwayat.value = [];
  }
}

async function bukaFoto() {
  memuatFoto.value = true;
  try {
    const r = await fetch(`${API_URL}/api/toko/stok/opname/${encodeURIComponent(lihat.value.nomor)}/foto`, { headers: { Authorization: `Bearer ${tokenSaya()}` } });
    if (!r.ok) throw new Error("Foto tidak bisa dibuka.");
    window.open(URL.createObjectURL(await r.blob()), "_blank");
  } catch (e) {
    Object.assign(kabar, { tampil: true, teks: e.message, warna: "error" });
  } finally {
    memuatFoto.value = false;
  }
}

async function cetak() {
  const o = lihat.value;
  if (printerSiap()) {
    try {
      await cetakBytes(buatStruk({ judul: "STOK OPNAME", sub: [o.penjual ? o.penjual + (o.penjual_no_id ? ` - ${o.penjual_no_id}` : "") : ""], nomor: o.nomor, waktu: waktu(o.tanggal),
        baris: o.item.map((i) => ({ nama: `${i.nama} (${i.penyebab_label})`, qty: i.qty, harga: i.qty ? i.nilai / i.qty : 0, subtotal: i.nilai })),
        ringkas: [["TOTAL (modal)", rupiahStruk(o.total_nilai), true]], catatan: o.catatan ? [o.catatan] : [], kaki: "Dicatat di Toko Saya" }));
      Object.assign(kabar, { tampil: true, teks: "Tercetak.", warna: "success" });
    } catch (e) {
      Object.assign(kabar, { tampil: true, teks: `Gagal cetak: ${e.message}`, warna: "error" });
    }
    return;
  }
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const w = window.open("", "_blank", "width=420,height=640");
  if (!w) { Object.assign(kabar, { tampil: true, teks: "Jendela cetak diblokir browser.", warna: "warning" }); return; }
  w.document.write(`<html><head><title>${esc(o.nomor)}</title><style>body{font-family:monospace;font-size:12px;width:72mm;margin:0 auto}td{padding:2px 0}</style></head><body>
    <div style="text-align:center;font-weight:bold">STOK OPNAME</div><div style="text-align:center">${esc(o.nomor)} · ${esc(waktu(o.tanggal))}</div><hr/>
    <table style="width:100%">${o.item.map((i) => `<tr><td>${esc(i.nama)}<br/>${i.stok_sebelum} → ${i.fisik} (−${i.qty}) · ${esc(i.penyebab_label)}</td><td style="text-align:right">${esc(rupiah(i.nilai))}</td></tr>`).join("")}</table>
    <hr/><div style="display:flex;justify-content:space-between;font-weight:bold"><span>Total (modal)</span><span>${esc(rupiah(o.total_nilai))}</span></div>${o.catatan ? `<div>${esc(o.catatan)}</div>` : ""}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

onMounted(muat);
defineExpose({ muat });
</script>

<style scoped>
.baris-opname { border-bottom: 1px solid var(--baba-border); padding: 8px 2px; }
.baris-opname.kurang { background: rgba(220, 38, 38, 0.05); }
.baris-opname.salah { background: rgba(220, 38, 38, 0.12); }
.input-fisik { width: 84px; border: 1px solid var(--baba-border); border-radius: 6px; padding: 4px 6px; text-align: right; font-size: 1rem; }
.bilah-opname { border-top: 1px solid var(--baba-border); position: sticky; bottom: 0; background: var(--baba-surface); }
.baris-riwayat { display: flex; justify-content: space-between; gap: 8px; padding: 8px 4px; border-bottom: 1px solid var(--baba-border); cursor: pointer; font-size: 0.9rem; }
.bagian-judul { font-weight: 800; font-size: 0.85rem; margin: 14px 0 4px; }
.min-w-0 { min-width: 0; }
</style>
