<template>
  <!-- Kursi baru untuk pemegang lama kursi tujuan: jabatan, No ID (kosong / milik orang ketiga), upline -->
  <div class="kursi-tujuan">
    <v-select v-model="jabatan" :items="jabatanItems" item-title="label" item-value="id"
      :label="`Jabatan baru ${orang.nama}`" variant="outlined" density="comfortable" hide-details
      @update:model-value="gantiJabatan" />

    <div class="kt-label mt-3">No ID {{ orang.nama }}</div>
    <v-btn-toggle v-model="mode" mandatory density="comfortable" color="#B8890F" variant="outlined" class="mb-2"
      @update:model-value="gantiMode">
      <v-btn value="otomatis" size="small">Otomatis</v-btn>
      <v-btn value="pilih" size="small">Pilih No ID</v-btn>
    </v-btn-toggle>
    <div v-if="mode === 'otomatis'" class="hint">Diberi nomor kosong berikutnya untuk jabatan & upline baru.</div>
    <template v-else>
      <v-autocomplete v-model="noId" :items="nomorItems" item-title="label" item-value="no_id" :loading="loadingNomor"
        :label="`No ID tujuan ${orang.nama}`" variant="outlined" density="comfortable" hide-details
        prepend-inner-icon="mdi-identifier" :no-filter="turunan"
        :no-data-text="turunan ? 'Ketik No ID atau nama untuk mencari kursi' : 'Tidak ada nomor untuk jabatan ini'"
        @update:search="cariNomor" @update:model-value="pilihNoId" />
    </template>

    <v-alert v-if="pemegang" type="info" variant="tonal" density="compact" class="mt-2">
      {{ noId }} dipegang <b>{{ pemegang.nama }}</b> ({{ pemegang.jabatan }}). Rotasi kursi:
      {{ orang.nama }} menempati {{ noId }}, dan {{ pemegang.nama }} menempati kursi lama {{ namaMember }}
      ({{ noIdMember || '-' }}).
    </v-alert>

    <template v-else>
      <div class="kt-label mt-3">Upline baru {{ orang.nama }}</div>
      <div v-if="!pilihAtasanTerbuka" class="kt-atasan">
        <div class="kt-atasan-teks">
          <template v-if="atasan"><b>{{ atasan.nama }}</b>
            <span class="kt-meta">{{ atasan.no_id || '-' }}<template v-if="atasan.jabatan"> · {{ atasan.jabatan }}</template></span>
          </template>
          <span v-else class="kt-kosong">{{ bolehTanpaAtasan ? 'Tanpa upline' : 'Belum dipilih' }}</span>
        </div>
        <v-btn variant="tonal" color="#B8890F" size="small" prepend-icon="mdi-account-arrow-up"
          @click="pilihAtasanTerbuka = true">{{ atasan ? 'Ganti upline' : 'Pilih upline' }}</v-btn>
      </div>
      <template v-else>
        <DaftarPilihMember :api="api" url="/mutasi/kandidat-atasan"
          :params="{ mvo_type_id: jabatan, user_id: orang.id, cabang_utama: orang.cabang }" :terpilih-id="atasan?.id"
          placeholder="Cari nama / No ID upline" kosong="Tidak ada calon upline untuk jabatan ini" @pilih="pilihAtasan" />
        <div class="d-flex flex-wrap ga-2 mt-2">
          <v-btn v-if="bolehTanpaAtasan" variant="text" size="small" @click="pilihAtasan(null)">Tanpa upline</v-btn>
          <v-btn v-if="atasan" variant="text" size="small" @click="pilihAtasanTerbuka = false">Batal</v-btn>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import DaftarPilihMember from "@/components/mutasi/DaftarPilihMember.vue";
import { labelNomor, nomorMenurutRencana } from "@/utils/rencanaMutasi";

const props = defineProps({
  api: { type: Function, required: true },
  orang: { type: Object, required: true }, // pemegang lama: { id, nama, mvo_type_id, parent_id, cabang }
  jabatanList: { type: Array, default: () => [] },
  memberId: [Number, String], // orang yang mengambil kursi pemegang lama
  namaMember: String,
  noIdMember: String,
  barisRencana: { type: Array, default: () => [] }, // keadaan sesudah langkah rencana sebelumnya
});
// ubah: { mvo_type_id, parent_id, no_id_tujuan, pemegang, lengkap }; tukar: memilih kursi lama member = tukar posisi
const emit = defineEmits(["ubah", "tukar"]);

const jabatan = ref(String(props.orang.mvo_type_id));
const mode = ref("otomatis");
const noId = ref(null);
const nomorList = ref([]);
const loadingNomor = ref(false);
const atasan = ref(null);
const pilihAtasanTerbuka = ref(false);

const jabatanItems = computed(() => props.jabatanList.map((j) => ({ ...j, label: `${j.name} — ${j.jabatan || ""}` })));
const aturan = computed(() => props.jabatanList.find((j) => String(j.id) === String(jabatan.value)));
const turunan = computed(() => aturan.value?.mode === "turunan");
const bolehTanpaAtasan = computed(() => (aturan.value?.level ?? 99) <= 1);
const nomorRencana = computed(() => nomorMenurutRencana(nomorList.value, props.barisRencana));
const nomorItems = computed(() => nomorRencana.value
  .filter((n) => !n.pemegang || n.pemegang.id !== props.orang.id)
  .map((n) => ({
    ...n,
    label: n.pemegang?.id === props.memberId ? `${n.no_id} — ${n.pemegang.nama} (kursi lama, = Tukar posisi)` : labelNomor(n, null),
  })));
const pemegang = computed(() => {
  const p = nomorRencana.value.find((n) => n.no_id === noId.value)?.pemegang;
  return p && p.id !== props.orang.id && p.id !== props.memberId ? p : null;
});

function kirim() {
  emit("ubah", {
    mvo_type_id: jabatan.value,
    parent_id: atasan.value?.id ?? null,
    no_id_tujuan: mode.value === "pilih" ? noId.value : null,
    pemegang: pemegang.value,
    lengkap: !!jabatan.value && (mode.value === "otomatis" || !!noId.value)
      && (!!pemegang.value || !!atasan.value || bolehTanpaAtasan.value),
  });
}

async function muatNomor(q = "") {
  loadingNomor.value = true;
  try {
    const params = { mvo_type_id: jabatan.value, user_id: props.orang.id };
    if (turunan.value) Object.assign(params, { q, parent_id: q ? undefined : atasan.value?.id });
    const { data } = await props.api.get("/mutasi/nomor", { params });
    const terpilih = nomorList.value.find((n) => n.no_id === noId.value);
    nomorList.value = terpilih && !data.data.some((n) => n.no_id === terpilih.no_id) ? [terpilih, ...data.data] : data.data;
  } catch (e) {
    nomorList.value = [];
  } finally {
    loadingNomor.value = false;
  }
}

let tunda;
function cariNomor(q) {
  if (!turunan.value || mode.value !== "pilih") return;
  if (q && nomorItems.value.some((n) => n.no_id === noId.value && n.label === q)) return;
  clearTimeout(tunda);
  tunda = setTimeout(() => muatNomor(q || ""), 350);
}

function gantiJabatan() {
  atasan.value = null;
  pilihAtasanTerbuka.value = true;
  noId.value = null;
  nomorList.value = [];
  if (mode.value === "pilih") muatNomor();
  kirim();
}

function gantiMode(v) {
  noId.value = null;
  if (v === "pilih") muatNomor();
  kirim();
}

function pilihNoId(v) {
  const p = nomorRencana.value.find((n) => n.no_id === v)?.pemegang;
  if (p && p.id === props.memberId) {
    noId.value = null;
    emit("tukar");
    return;
  }
  kirim();
}

function pilihAtasan(a) {
  atasan.value = a;
  pilihAtasanTerbuka.value = false;
  if (turunan.value && mode.value === "pilih") {
    noId.value = null;
    muatNomor();
  }
  kirim();
}

// Upline awal = upline sekarang (menurut rencana bila ada; selain itu nama diambil dari daftar member)
onMounted(async () => {
  if (props.orang.parent_id && props.orang.atasan_nama !== undefined) {
    atasan.value = { id: props.orang.parent_id, nama: props.orang.atasan_nama, no_id: null };
  } else if (props.orang.parent_id) {
    try {
      const { data } = await props.api.get("/mutasi/cari-member", { params: { id: props.orang.id } });
      const m = data.data[0];
      if (m?.parent_id) atasan.value = { id: m.parent_id, nama: m.atasan_nama, no_id: m.atasan_no_id };
    } catch (e) {
      atasan.value = { id: props.orang.parent_id, nama: "Upline sekarang", no_id: null };
    }
  }
  kirim();
});
</script>

<style scoped>
.kursi-tujuan {
  margin-top: 12px;
  padding: 12px;
  border: 1px dashed var(--baba-gold-dark);
  border-radius: var(--baba-radius);
  background: var(--baba-gold-soft);
}

.kt-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--baba-muted);
  margin-bottom: 6px;
}

.kt-atasan {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--baba-radius);
  border: 1px solid var(--baba-border);
  background: #fff;
}

.kt-atasan-teks {
  flex: 1;
  min-width: 0;
}

.kt-meta {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--baba-gold-dark);
}

.kt-kosong,
.hint {
  font-size: 0.8rem;
  color: var(--baba-muted);
}
</style>
