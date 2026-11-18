<template>
  <div class="kamus-page">
    <Breadcrumb :items="[{ title: 'Dashboard', to: '/admin/dashboard' }, { title: 'Kamus Menu' }]" icon="mdi-book-search-outline"
      sub="Fungsi, syarat supaya muncul, alur, dan akibat setiap menu. Langkah klik ada di Panduan." />

    <v-text-field v-model="cari" label="Cari dengan kata sehari-hari, mis. ro belum masuk, belanja ke upline" variant="outlined"
      density="comfortable" prepend-inner-icon="mdi-magnify" hide-details clearable class="mb-2 cari" data-uji="kamus-cari" />
    <div v-if="!cari" class="contoh mb-4">
      <v-chip v-for="c in CONTOH" :key="c" size="small" variant="outlined" class="mr-1 mb-1" @click="cari = c">{{ c }}</v-chip>
    </div>

    <template v-if="cari">
      <div class="sub-judul mb-2">Hasil pencarian</div>
      <div v-if="!hasil.length" class="kosong">Tidak ada yang cocok dengan "{{ cari }}". Coba kata yang lebih umum (akun, dokumen, ro, belanja).</div>
    </template>

    <template v-for="g in kelompokTampil" :key="g.nama">
      <div class="sub-judul mb-2 mt-3">{{ g.nama }}</div>
      <v-expansion-panels v-model="terbuka" multiple class="daftar">
        <v-expansion-panel v-for="e in g.isi" :key="e.id" :value="e.id" :id="`kamus-${e.id}`" class="panel" :data-uji="`kamus-${e.id}`">
          <v-expansion-panel-title>
            <div class="panel-title">
              <span class="panel-icon"><v-icon size="20">{{ e.icon }}</v-icon></span>
              <div>
                <div class="panel-menu">{{ e.menu }}
                  <span v-if="e.peran === 'superadmin'" class="badge-sa">Superadmin</span>
                  <span v-else-if="String(e.peran || '').startsWith('hak:')" class="badge-sa">Hak akses</span>
                </div>
                <div class="panel-ringkas">{{ e.ringkas }}</div>
              </div>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <KamusIsi :entri="e" :is-superadmin="isSuperadmin" :hak="hakSaya" />
            <div class="d-flex justify-end flex-wrap ga-2 mt-3">
              <v-btn v-if="panduanAda(e)" variant="text" size="small" prepend-icon="mdi-help-circle-outline" :to="{ path: '/admin/panduan', query: { menu: panduanAda(e).id } }">Cara pakai</v-btn>
              <v-btn v-if="e.route" variant="tonal" color="primary" size="small" append-icon="mdi-arrow-right" :to="e.route">Buka menu ini</v-btn>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import KamusIsi from "@/components/kamus/KamusIsi.vue";
import { KAMUS, KELOMPOK, cariKamusTeks } from "@/kamus/isi.js";
import { bolehLihat, cariPanduan } from "@/panduan/isi.js";
import { hakState, muatHak } from "@/utils/hakAkses";

const CONTOH = ["ro belum masuk", "belanja ke upline", "retur", "akun belum aktif", "menu tidak muncul", "pindah upline", "lupa password"];
const route = useRoute();
const isSuperadmin = localStorage.getItem("mvo_type_id") === "superadmin";
if (!isSuperadmin) muatHak();
const hakSaya = computed(() => hakState.daftar.map((h) => h.hak));
const cari = ref("");
const terbuka = ref([]);

const bolehDilihat = computed(() => KAMUS.filter((e) => bolehLihat(e.peran, isSuperadmin, hakSaya.value)));
const hasil = computed(() => cariKamusTeks(cari.value, bolehDilihat.value));
const kelompokTampil = computed(() => {
  if (cari.value) return hasil.value.length ? [{ nama: `${hasil.value.length} entri`, isi: hasil.value }] : [];
  return KELOMPOK.map((nama) => ({ nama, isi: bolehDilihat.value.filter((e) => e.kelompok === nama) })).filter((g) => g.isi.length);
});
const panduanAda = (e) => (e.route ? cariPanduan(e.route) : null);

watch(cari, (q) => { if (q && hasil.value.length) terbuka.value = [hasil.value[0].id]; });

onMounted(async () => {
  const id = route.query.id;
  if (id && bolehDilihat.value.some((e) => e.id === id)) {
    terbuka.value = [id];
    await nextTick();
    document.getElementById(`kamus-${id}`)?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
});
</script>

<style scoped>
.kamus-page { max-width: 980px; margin: 0 auto; }
.sub-judul { font-weight: 800; color: var(--baba-ink); }
.panel-title { display: flex; gap: 12px; align-items: flex-start; }
.panel-icon { width: 34px; height: 34px; border-radius: 8px; background: var(--baba-ink); color: var(--baba-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.panel-menu { font-weight: 700; }
.panel-ringkas { font-size: 0.85rem; color: var(--baba-muted); }
.badge-sa { font-size: 0.68rem; background: var(--baba-gold); color: var(--baba-ink); border-radius: 4px; padding: 1px 6px; margin-left: 6px; font-weight: 700; }
.kosong { color: var(--baba-muted); padding: 12px 0; }
</style>
