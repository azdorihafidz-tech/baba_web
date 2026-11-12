<template>
  <!-- Toko Saya › Laporan: transaksi, produk, kategori (ERP BABA Tahap 3, rancangan §8). -->
  <div class="laporan">
    <div class="d-flex flex-wrap align-center ga-2 mb-2">
      <v-chip v-for="[k, l] in JENIS" :key="k" size="small" :variant="jenis === k ? 'flat' : 'outlined'" :color="jenis === k ? 'primary' : undefined"
        :data-uji="'lap-' + k" @click="jenis = k">{{ l }}</v-chip>
      <v-spacer />
      <input v-model="dari" type="date" class="input-tgl" aria-label="Dari tanggal" data-uji="lap-dari" />
      <span class="text-caption">s/d</span>
      <input v-model="sampai" type="date" class="input-tgl" aria-label="Sampai tanggal" data-uji="lap-sampai" />
    </div>
    <v-alert v-if="galat" type="error" variant="tonal" density="compact" class="mb-2">{{ galat }}</v-alert>
    <div v-if="hasil" class="ringkas mb-2" data-uji="lap-ringkas">
      <div><span>Penjualan</span><strong>{{ rupiah(hasil.ringkas.penjualan) }}</strong></div>
      <div><span>Laba kotor</span><strong>{{ rupiah(hasil.ringkas.laba) }}</strong></div>
      <div><span>Transaksi</span><strong>{{ hasil.ringkas.transaksi }}</strong></div>
      <div><span>Botol terjual</span><strong>{{ hasil.ringkas.botol_terjual }}</strong></div>
      <div><span>Pembelian</span><strong>{{ rupiah(hasil.ringkas.pembelian) }}</strong></div>
      <div v-if="hasil.ringkas.kerugian_stok"><span>Kerugian stok (opname)</span><strong class="text-error" data-uji="lap-kerugian">{{ rupiah(hasil.ringkas.kerugian_stok) }}</strong></div>
      <div v-if="hasil.ringkas.kerugian_stok"><span>Laba bersih</span><strong data-uji="lap-laba-bersih">{{ rupiah(hasil.ringkas.laba_bersih) }}</strong></div>
    </div>
    <div v-isi-layar="24" class="baba-gulir">
      <div v-if="memuat" class="text-center py-6"><v-progress-circular indeterminate color="primary" /></div>
      <template v-else-if="hasil">
        <div v-if="!hasil.data.length" class="text-center text-medium-emphasis py-6">Tidak ada data pada rentang ini.</div>
        <template v-if="hasil.jenis === 'transaksi'">
          <div v-for="(r, n) in hasil.data" :key="n" class="baris" data-uji="lap-baris">
            <div class="flex-grow-1 min-w-0"><div class="font-weight-bold">{{ r.jenis === 'jual' ? 'Jual' : r.jenis === 'opname' ? 'Stok opname' : 'Beli' }} · {{ r.nomor }}</div>
              <div class="text-caption text-truncate">{{ tanggal(r.tanggal) }} · {{ r.keterangan }}</div></div>
            <strong :class="r.jenis === 'jual' ? 'text-success' : r.jenis === 'opname' ? 'text-error' : ''">{{ r.jenis === 'jual' ? '+' : '−' }}{{ rupiah(Math.abs(r.nilai)) }}</strong>
          </div>
        </template>
        <template v-else-if="hasil.jenis === 'produk'">
          <div v-for="r in hasil.data" :key="r.item_id" class="baris" data-uji="lap-baris">
            <div class="flex-grow-1 min-w-0"><div class="font-weight-bold text-truncate">{{ r.nama }}</div>
              <div class="text-caption">Terjual {{ r.terjual }} · dibeli {{ r.dibeli }} · stok {{ r.stok }} · laba {{ rupiah(r.laba) }}</div></div>
            <strong>{{ rupiah(r.omzet) }}</strong>
          </div>
        </template>
        <template v-else>
          <div v-for="r in hasil.data" :key="r.kategori" class="baris" data-uji="lap-baris">
            <div class="flex-grow-1"><div class="font-weight-bold">{{ r.kategori }}</div><div class="text-caption">Terjual {{ r.terjual }} · laba {{ rupiah(r.laba) }}</div></div>
            <strong>{{ rupiah(r.omzet) }}</strong>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { pesanGalat, rupiah, tokoApi } from "@/utils/tokoOnline";

const JENIS = [["transaksi", "Transaksi"], ["produk", "Produk"], ["kategori", "Kategori"]];
const isoLokal = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const kini = new Date();
const jenis = ref("transaksi");
const dari = ref(isoLokal(new Date(kini.getFullYear(), kini.getMonth(), 1)));
const sampai = ref(isoLokal(kini));
const hasil = ref(null);
const memuat = ref(false);
const galat = ref("");
const tanggal = (t) => (t ? new Date(t).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "");

async function muat() {
  memuat.value = true;
  galat.value = "";
  try {
    hasil.value = await tokoApi("get", "/laporan", undefined, { jenis: jenis.value, dari: dari.value, sampai: sampai.value });
  } catch (e) {
    galat.value = pesanGalat(e, "Laporan belum bisa dimuat.");
    hasil.value = null;
  } finally {
    memuat.value = false;
  }
}

watch([jenis, dari, sampai], muat);
onMounted(muat);
defineExpose({ muat });
</script>

<style scoped>
.input-tgl {
  border: 1px solid var(--baba-border);
  border-radius: 8px;
  padding: 4px 6px;
  font-size: 0.85rem;
  max-width: 140px;
}

.ringkas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}

.ringkas > div {
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--baba-border);
  background: rgba(230, 180, 34, 0.06);
  font-size: 0.8rem;
}

.ringkas strong { font-size: 1rem; }

.baris {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 2px;
  border-bottom: 1px solid var(--baba-border);
}

.min-w-0 { min-width: 0; }
</style>
