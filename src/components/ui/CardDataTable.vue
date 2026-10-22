<template>
  <v-card class="mt-2 baba-table-card" elevation="0">
    <div class="baba-table-head">
      <span class="baba-table-title">{{ title }}</span>
    </div>
    <div class="baba-table-search">
      <slot name="search" />
    </div>
    <div ref="body" class="baba-table-body">
      <slot name="datatable" />
    </div>
  </v-card>
</template>

<script>
import { aturTinggiIsiLayar } from "@/plugins/isiLayar";

// Ruang untuk music player yang melayang di kanan bawah, supaya tombol halaman tidak tertutup
const RUANG_PLAYER = 76;

export default {
  props: {
    title: String,
  },
  mounted() {
    window.addEventListener("resize", this.aturTinggi);
    requestAnimationFrame(this.aturTinggi);
    setTimeout(this.aturTinggi, 600);
  },
  updated() {
    this.aturTinggi();
  },
  unmounted() {
    window.removeEventListener("resize", this.aturTinggi);
  },
  methods: {
    // Isi tabel digulir di dalam kartu: tinggi tabel = sisa layar dikurangi baris tombol halaman
    aturTinggi() {
      const body = this.$refs.body;
      const wrapper = body && body.querySelector(".v-table__wrapper");
      if (!wrapper) return;
      const footer = body.querySelector(".v-data-table-footer");
      aturTinggiIsiLayar(wrapper, (footer ? footer.offsetHeight : 0) + RUANG_PLAYER);
    },
  },
};
</script>

<style scoped>
.baba-table-card {
  border: 1px solid var(--baba-border);
  border-radius: var(--baba-radius) !important;
  box-shadow: var(--baba-shadow) !important;
  overflow: hidden;
}

.baba-table-head {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  background: var(--baba-ink);
  border-bottom: 2px solid var(--baba-gold);
}

.baba-table-title {
  color: var(--baba-gold-light);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.04em;
}

.baba-table-search {
  padding: 14px 18px 4px;
}

.baba-table-search:empty {
  display: none;
}

.baba-table-body {
  padding: 0;
}

.baba-table-body :deep(.v-table__wrapper) {
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--baba-gold-dark) transparent;
}

/* Judul kolom tetap terlihat saat isi tabel digulir.
   :where() menjaga spesifisitas rendah agar aturan kolom kanan yang dikunci di tiap halaman tetap berlaku. */
.baba-table-body :deep(:where(.v-table__wrapper > table > thead > tr > th)) {
  position: sticky !important;
  top: 0 !important;
  z-index: 2;
}

@media (max-width: 599.98px) {
  .baba-table-head {
    padding: 12px 14px;
  }

  .baba-table-title {
    font-size: 0.95rem;
  }

  .baba-table-search {
    padding: 12px 14px 0;
  }
}
</style>
