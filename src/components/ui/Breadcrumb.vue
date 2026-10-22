<template>
  <!-- Kepala halaman ringkas (satu baris): ikon menu, jejak "Dashboard ›", dan judul.
       Dibuat tipis supaya ruang layar tetap untuk data. Judul & ikon diambil dari panduan
       (src/panduan/isi.js) supaya sama dengan nama menu di sidebar. -->
  <header class="baba-page-head" :title="kalimat || undefined">
    <div class="bph-ikon">
      <v-icon :size="$vuetify.display.smAndDown ? 18 : 20">{{ ikon }}</v-icon>
    </div>

    <div class="bph-teks">
      <nav class="bph-jejak" aria-label="Breadcrumb">
        <template v-for="(it, i) in jejak" :key="i">
          <router-link :to="it.ke" class="bph-tautan">
            <v-icon v-if="i === 0" size="13" class="mr-1">mdi-home-outline</v-icon>{{ it.title }}
          </router-link>
          <v-icon size="13" class="bph-pemisah">mdi-chevron-right</v-icon>
        </template>
      </nav>
      <h1 class="bph-judul">{{ judul }}</h1>
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { cariPanduan } from "@/panduan/isi.js";

const props = defineProps({
  // [{ title, href | to }] — item terakhir = halaman ini
  items: { type: Array, default: () => [] },
  judul: String, // menimpa judul dari panduan
  sub: String, // kalimat kegunaan (tooltip); bawaan dari panduan
  icon: String,
});

const route = useRoute();
const panduan = computed(() => cariPanduan(route.path));

const judul = computed(() => props.judul || panduan.value?.menu || props.items[props.items.length - 1]?.title || "");
const kalimat = computed(() => props.sub ?? panduan.value?.ringkas ?? "");
const ikon = computed(() => props.icon || panduan.value?.icon || "mdi-view-dashboard-outline");

// Halaman induk yang bisa diklik. Item terakhir (halaman ini, kadang dengan nama lama seperti "AKUN")
// dan item yang menaut ke halaman ini sendiri tidak ditampilkan.
const jejak = computed(() => {
  const sini = route.path.toLowerCase();
  const induk = props.items.slice(0, -1).filter((it) => {
    const ke = it.to || it.href;
    return ke && String(ke).toLowerCase() !== sini;
  });
  const daftar = induk.length ? induk : [{ title: "Dashboard", href: "/admin/dashboard" }];
  return daftar.map((it) => ({ title: it.title, ke: it.to || it.href }));
});
</script>

<style scoped>
.baba-page-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 14px 8px 8px;
  border-radius: 12px;
  background:
    radial-gradient(80% 160% at 100% 0%, rgba(230, 180, 34, 0.16) 0%, rgba(230, 180, 34, 0) 60%),
    linear-gradient(135deg, var(--baba-ink) 0%, var(--baba-ink-3) 100%);
  border-left: 3px solid var(--baba-gold);
  box-shadow: 0 6px 16px -12px rgba(0, 0, 0, 0.6);
}

.bph-ikon {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: var(--baba-ink);
  background: linear-gradient(145deg, var(--baba-gold-light), var(--baba-gold) 55%, var(--baba-gold-dark));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.bph-teks {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.bph-jejak {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 0.78rem;
}

.bph-tautan {
  display: inline-flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.15s;
}

.bph-tautan:hover {
  color: var(--baba-gold-light);
}

.bph-pemisah {
  color: var(--baba-gold);
  margin-left: 4px;
}

.bph-judul {
  margin: 0;
  min-width: 0;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.3;
  color: var(--baba-gold-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* HP: jejak kecil di atas judul, tinggi tetap ± 48px */
@media (max-width: 959.98px) {
  .baba-page-head {
    gap: 10px;
    margin-bottom: 10px;
    padding: 6px 12px 6px 6px;
    border-radius: 10px;
  }

  .bph-ikon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
  }

  .bph-teks {
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
  }

  .bph-jejak {
    font-size: 0.68rem;
  }

  .bph-pemisah {
    display: none;
  }

  .bph-judul {
    max-width: 100%;
    font-size: 0.98rem;
  }
}
</style>
