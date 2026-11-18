<template>
  <!-- Tombol "Kamus" di header: membuka penjelasan menu yang sedang dibuka (fungsi, syarat, akibat). -->
  <v-btn :icon="$vuetify.display.smAndDown" :variant="$vuetify.display.smAndDown ? 'text' : 'tonal'" size="small"
    color="#F6D365" class="mr-1 kamus-btn" aria-label="Kamus Menu" @click="buka = true">
    <v-icon>mdi-book-search-outline</v-icon>
    <span v-if="!$vuetify.display.smAndDown" class="ml-1">Kamus</span>
  </v-btn>

  <component :is="$vuetify.display.smAndDown ? VBottomSheet : VDialog" v-model="buka"
    v-bind="$vuetify.display.smAndDown ? { scrollable: true } : { maxWidth: 640, scrollable: true }">
    <v-card class="tk-card" :rounded="$vuetify.display.smAndDown ? 't-xl' : 'lg'">
      <div class="tk-head">
        <v-icon color="#F6D365" class="mr-2">{{ entri?.icon || 'mdi-book-search-outline' }}</v-icon>
        <div>
          <div class="tk-kecil">Kamus Menu</div>
          <div class="tk-menu">{{ entri?.menu || 'Kamus Menu' }}</div>
        </div>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" color="#F6D365" size="small" @click="buka = false" />
      </div>
      <v-card-text class="tk-body">
        <KamusIsi v-if="entri" :entri="entri" :is-superadmin="isSuperadmin" :hak="hakSaya" />
        <div v-else class="tk-kosong">Halaman ini belum punya penjelasan khusus. Buka Kamus Menu untuk mencari.</div>
      </v-card-text>
      <v-card-actions class="tk-foot">
        <v-btn variant="text" prepend-icon="mdi-book-search-outline" @click="keSemua">Semua kamus</v-btn>
        <v-spacer />
        <v-btn color="primary" variant="flat" @click="buka = false">Mengerti</v-btn>
      </v-card-actions>
    </v-card>
  </component>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { VBottomSheet, VDialog } from "vuetify/components";
import KamusIsi from "@/components/kamus/KamusIsi.vue";
import { cariKamus } from "@/kamus/isi.js";
import { bolehLihat } from "@/panduan/isi.js";
import { hakState, muatHak } from "@/utils/hakAkses";

const route = useRoute();
const router = useRouter();
const buka = ref(false);
const isSuperadmin = localStorage.getItem("mvo_type_id") === "superadmin";
if (!isSuperadmin) muatHak();
const hakSaya = computed(() => hakState.daftar.map((h) => h.hak));
const entri = computed(() => {
  const k = cariKamus(route.path);
  return k && bolehLihat(k.peran, isSuperadmin, hakSaya.value) ? k : null;
});

function keSemua() {
  buka.value = false;
  router.push({ path: "/admin/kamus", query: entri.value ? { id: entri.value.id } : {} });
}
</script>

<style scoped>
.tk-card { max-height: 88vh; }
.tk-head { display: flex; align-items: center; padding: 14px 16px; background: var(--baba-ink); border-bottom: 2px solid var(--baba-gold); }
.tk-kecil { font-size: 0.72rem; color: rgba(255, 255, 255, 0.6); }
.tk-menu { font-weight: 800; color: var(--baba-gold-light); }
.tk-body { padding: 16px !important; }
.tk-kosong { color: var(--baba-muted); }
.tk-foot { border-top: 1px solid var(--baba-border); padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px)); }
</style>
