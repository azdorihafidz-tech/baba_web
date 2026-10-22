<template>
  <div class="panduan-page">
    <Breadcrumb :items="[{ title: 'Dashboard', to: '/admin/dashboard' }, { title: 'Panduan' }]" icon="mdi-book-open-page-variant"
      sub="Kegunaan dan cara pakai setiap menu. Di setiap halaman juga ada tombol ❓ Cara Pakai di bagian atas." />

    <v-text-field v-model="cari" label="Cari panduan, mis. approve, No ID, dokumen" variant="outlined"
      density="comfortable" prepend-inner-icon="mdi-magnify" hide-details clearable class="mb-4 cari" />

    <!-- Mulai cepat -->
    <v-card v-if="!cari" class="mulai-card mb-5">
      <div class="mulai-head">
        <v-icon color="#F6D365" class="mr-2">mdi-rocket-launch-outline</v-icon>
        <div>
          <div class="mulai-judul">{{ MULAI_CEPAT.judul }}</div>
          <div class="mulai-sub">{{ MULAI_CEPAT.ringkas }}</div>
        </div>
      </div>
      <v-card-text>
        <div class="alur">
          <div v-for="a in MULAI_CEPAT.alur" :key="a.judul" class="alur-item">
            <div class="alur-judul">{{ a.judul }}</div>
            <div class="alur-isi">{{ a.isi }}</div>
          </div>
        </div>

        <div class="sub-judul">Istilah penting</div>
        <div v-for="i in MULAI_CEPAT.istilah" :key="i.t" class="istilah">
          <b>{{ i.t }}</b> — {{ i.j }}
        </div>

        <div class="sub-judul">Masuk & menggunakan aplikasi</div>
        <div v-for="i in MULAI_CEPAT.akses" :key="i.t" class="istilah">
          <b>{{ i.t }}</b> — {{ i.j }}
        </div>
      </v-card-text>
    </v-card>

    <div class="sub-judul mb-2">Panduan per menu</div>
    <v-expansion-panels v-model="terbuka" multiple class="daftar">
      <v-expansion-panel v-for="p in daftar" :key="p.id" :value="p.id" :id="`panduan-${p.id}`" class="panel">
        <v-expansion-panel-title>
          <div class="panel-title">
            <span class="panel-icon"><v-icon size="20">{{ p.icon }}</v-icon></span>
            <div>
              <div class="panel-menu">{{ p.menu }}
                <span v-if="p.peran === 'superadmin'" class="badge-sa">Superadmin</span>
              </div>
              <div class="panel-ringkas">{{ p.ringkas }}</div>
            </div>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <PanduanIsi :panduan="p" :is-superadmin="isSuperadmin" />
          <div class="d-flex justify-end mt-2">
            <v-btn v-if="p.route" variant="tonal" color="primary" size="small" append-icon="mdi-arrow-right"
              :to="p.route">Buka menu {{ p.menu }}</v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div v-if="!daftar.length" class="kosong">Tidak ada panduan yang cocok dengan "{{ cari }}".</div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import PanduanIsi from "@/components/panduan/PanduanIsi.vue";
import { MULAI_CEPAT, PANDUAN, bolehLihat } from "@/panduan/isi.js";

const route = useRoute();
const isSuperadmin = localStorage.getItem("mvo_type_id") === "superadmin";
const cari = ref("");
const terbuka = ref([]);

// Teks lengkap satu panduan (untuk pencarian)
const teksPanduan = (p) =>
  [p.menu, p.ringkas, p.kegunaan, ...(p.langkah || []).flatMap((l) => [l.judul, ...l.isi.map((x) => (typeof x === "string" ? x : x.teks))]),
    ...(p.tips || []).map((x) => (typeof x === "string" ? x : x.teks)), ...(p.tanya || []).flatMap((q) => [q.t, q.j])]
    .join(" ")
    .toLowerCase();

const daftar = computed(() => {
  const q = (cari.value || "").toLowerCase().trim();
  return PANDUAN.filter((p) => bolehLihat(p.peran, isSuperadmin)).filter((p) => !q || teksPanduan(p).includes(q));
});

onMounted(async () => {
  // /admin/panduan?menu=<id> → buka & gulir ke panduan tersebut
  const id = route.query.menu;
  if (id && daftar.value.some((p) => p.id === id)) {
    terbuka.value = [id];
    await nextTick();
    setTimeout(() => document.getElementById(`panduan-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
  }
});
</script>

<style scoped>
.cari {
  max-width: 560px;
}

.mulai-card {
  border: 1px solid var(--baba-border);
  box-shadow: var(--baba-shadow) !important;
  overflow: hidden;
}

.mulai-head {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: var(--baba-ink);
  border-bottom: 2px solid var(--baba-gold);
}

.mulai-judul {
  font-weight: 800;
  color: var(--baba-gold-light);
}

.mulai-sub {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.alur {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.alur-item {
  padding: 12px;
  border-radius: 12px;
  background: var(--baba-gold-soft);
}

.alur-judul {
  font-weight: 800;
  color: var(--baba-gold-dark);
  margin-bottom: 4px;
}

.alur-isi {
  font-size: 0.875rem;
}

.sub-judul {
  margin: 16px 0 6px;
  font-weight: 800;
  color: var(--baba-text);
}

.istilah {
  font-size: 0.9rem;
  margin-bottom: 6px;
}

.panel {
  border: 1px solid var(--baba-border);
  margin-bottom: 8px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--baba-ink);
  color: var(--baba-gold-light);
  flex-shrink: 0;
}

.panel-menu {
  font-weight: 800;
}

.panel-ringkas {
  font-size: 0.82rem;
  color: var(--baba-muted);
}

.badge-sa {
  margin-left: 6px;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--baba-gold-soft);
  color: var(--baba-gold-dark);
  font-size: 0.7rem;
  font-weight: 700;
}

.kosong {
  color: var(--baba-muted);
  padding: 16px 0;
}
</style>
