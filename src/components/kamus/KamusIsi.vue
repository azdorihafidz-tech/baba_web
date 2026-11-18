<template>
  <!-- Isi satu entri Kamus Menu: Fungsi → Supaya muncul → Alur → Akibat tombol → Wajib → Jangan → Menu mirip -->
  <div class="ki">
    <p class="ki-fungsi" v-html="tebal(entri.fungsi)" />
    <div class="ki-siapa"><v-icon size="16">mdi-account-key</v-icon> {{ labelPeran(entri.peran) }}</div>

    <template v-if="syarat.length">
      <div class="ki-judul">Supaya menu ini muncul & bisa dipakai</div>
      <ul><li v-for="(s, i) in syarat" :key="i" v-html="tebal(s)" /></ul>
    </template>

    <template v-if="alur.length">
      <div class="ki-judul">Alur</div>
      <ul><li v-for="(s, i) in alur" :key="i" v-html="tebal(s)" /></ul>
    </template>

    <template v-if="tombol.length">
      <div class="ki-judul">Apa yang terjadi kalau tombol diklik</div>
      <div v-for="(b, i) in tombol" :key="i" class="ki-tombol">
        <div class="ki-t">{{ b.t }}</div>
        <div class="ki-j" v-html="tebal(b.j)" />
      </div>
    </template>

    <template v-if="wajib.length">
      <div class="ki-judul">Wajib</div>
      <ul><li v-for="(s, i) in wajib" :key="i" v-html="tebal(s)" /></ul>
    </template>

    <template v-if="jangan.length">
      <div class="ki-judul">Jangan</div>
      <ul class="ki-jangan"><li v-for="(s, i) in jangan" :key="i" v-html="tebal(s)" /></ul>
    </template>

    <template v-if="entri.mirip?.length">
      <div class="ki-judul">Menu yang mirip & bedanya</div>
      <ul><li v-for="(m, i) in entri.mirip" :key="i"><b>{{ m.t }}</b> — {{ m.j }}</li></ul>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { bolehLihat, labelPeran } from "@/panduan/isi.js";

const props = defineProps({
  entri: { type: Object, required: true },
  isSuperadmin: { type: Boolean, default: false },
  hak: { type: Array, default: () => [] },
});

const lihat = (x) => typeof x === "string" || bolehLihat(x.peran, props.isSuperadmin, props.hak);
const teks = (x) => (typeof x === "string" ? x : x.teks);
const saring = (arr) => (arr || []).filter(lihat).map(teks);
const syarat = computed(() => saring(props.entri.syarat));
const alur = computed(() => saring(props.entri.alur));
const wajib = computed(() => saring(props.entri.wajib));
const jangan = computed(() => saring(props.entri.jangan));
const tombol = computed(() => (props.entri.tombol || []).filter((b) => !b.peran || bolehLihat(b.peran, props.isSuperadmin, props.hak)));

/** Teks dari data sendiri (bukan input pengguna): escape HTML, lalu **tebal** → <b>. */
function tebal(s) {
  const aman = String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return aman.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
}
</script>

<style scoped>
.ki-fungsi { margin-bottom: 8px; }
.ki-siapa { font-size: 0.8rem; color: var(--baba-gold-dark); margin-bottom: 10px; display: flex; gap: 4px; align-items: center; }
.ki-judul { font-weight: 800; margin: 14px 0 6px; color: var(--baba-ink); }
ul { padding-left: 20px; margin: 0; }
li { margin-bottom: 4px; }
.ki-tombol { border-left: 3px solid var(--baba-gold); padding: 4px 10px; margin-bottom: 6px; background: var(--baba-bg); border-radius: 4px; }
.ki-t { font-weight: 700; }
.ki-j { font-size: 0.92rem; }
.ki-jangan li::marker { color: rgb(var(--v-theme-error)); }
</style>
