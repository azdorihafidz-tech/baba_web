<template>
  <!-- Tombol "Cara Pakai" di header: membuka panduan halaman yang sedang dibuka -->
  <v-btn :icon="$vuetify.display.smAndDown" :variant="$vuetify.display.smAndDown ? 'text' : 'tonal'" size="small"
    color="#F6D365" class="mr-1 cara-pakai-btn" aria-label="Cara Pakai" @click="buka = true">
    <v-icon>mdi-help-circle-outline</v-icon>
    <span v-if="!$vuetify.display.smAndDown" class="ml-1">Cara Pakai</span>
  </v-btn>

  <!-- HP: panel dari bawah, desktop: dialog di tengah -->
  <component :is="$vuetify.display.smAndDown ? VBottomSheet : VDialog" v-model="buka"
    v-bind="$vuetify.display.smAndDown ? { scrollable: true } : { maxWidth: 620, scrollable: true }">
    <v-card class="cp-card" :rounded="$vuetify.display.smAndDown ? 't-xl' : 'lg'">
      <div class="cp-head">
        <v-icon color="#F6D365" class="mr-2">{{ panduan?.icon || 'mdi-book-open-page-variant' }}</v-icon>
        <div class="cp-title">
          <div class="cp-kecil">Cara Pakai</div>
          <div class="cp-menu">{{ panduan?.menu || 'Panduan' }}</div>
        </div>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" color="#F6D365" size="small" @click="buka = false" />
      </div>

      <v-card-text class="cp-body">
        <PanduanIsi v-if="panduan" :panduan="panduan" :is-superadmin="isSuperadmin" />
        <div v-else class="cp-kosong">
          Belum ada panduan khusus untuk halaman ini. Lihat semua panduan di menu Panduan.
        </div>
      </v-card-text>

      <v-card-actions class="cp-foot">
        <v-btn variant="text" prepend-icon="mdi-book-open-page-variant" @click="keSemua">Semua panduan</v-btn>
        <v-spacer />
        <v-btn color="primary" variant="flat" @click="buka = false">Mengerti</v-btn>
      </v-card-actions>
    </v-card>
  </component>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
// Impor eksplisit: komponen dipilih dinamis (bottom sheet di HP, dialog di desktop)
import { VBottomSheet, VDialog } from "vuetify/components";
import PanduanIsi from "@/components/panduan/PanduanIsi.vue";
import { bolehLihat, cariPanduan } from "@/panduan/isi.js";

const route = useRoute();
const router = useRouter();
const buka = ref(false);
const isSuperadmin = localStorage.getItem("mvo_type_id") === "superadmin";
// Panduan khusus superadmin tidak ditampilkan ke member (mis. member membuka URL /admin/mutasi)
const panduan = computed(() => {
  const p = cariPanduan(route.path);
  return p && bolehLihat(p.peran, isSuperadmin) ? p : null;
});

function keSemua() {
  buka.value = false;
  router.push({ path: "/admin/panduan", query: panduan.value ? { menu: panduan.value.id } : {} });
}
</script>

<style scoped>
.cp-card {
  max-height: 88vh;
}

.cp-head {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: var(--baba-ink);
  border-bottom: 2px solid var(--baba-gold);
}

.cp-kecil {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.6);
}

.cp-menu {
  font-weight: 800;
  color: var(--baba-gold-light);
}

.cp-body {
  padding: 16px !important;
}

.cp-kosong {
  color: var(--baba-muted);
}

.cp-foot {
  border-top: 1px solid var(--baba-border);
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
}
</style>
