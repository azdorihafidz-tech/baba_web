<template>
  <div class="pi">
    <p class="pi-kegunaan">{{ panduan.kegunaan }}</p>
    <div class="pi-siapa">
      <v-icon size="16">mdi-account-key</v-icon>
      {{ panduan.peran === 'superadmin' ? 'Khusus superadmin' : 'Semua member' }}
    </div>

    <template v-for="(l, i) in langkah" :key="i">
      <div class="pi-judul">{{ l.judul }}</div>
      <ol class="pi-langkah">
        <li v-for="(s, j) in l.isi" :key="j">{{ s }}</li>
      </ol>
    </template>

    <template v-if="tips.length">
      <div class="pi-judul">Tips & hal penting</div>
      <ul class="pi-tips">
        <li v-for="(t, i) in tips" :key="i">{{ t }}</li>
      </ul>
    </template>

    <template v-if="gambar.length">
      <div class="pi-judul">Contoh tampilan</div>
      <figure v-for="g in gambar" :key="g.src" class="pi-gambar">
        <img :src="g.src" :alt="g.ket" loading="lazy" @click="perbesar = g" />
        <figcaption>{{ g.ket }}</figcaption>
      </figure>
    </template>

    <template v-if="tanya.length">
      <div class="pi-judul">Pertanyaan umum</div>
      <div v-for="(q, i) in tanya" :key="i" class="pi-tanya">
        <div class="pi-t">{{ q.t }}</div>
        <div class="pi-j">{{ q.j }}</div>
      </div>
    </template>

    <v-dialog :model-value="!!perbesar" max-width="900" @update:model-value="perbesar = null">
      <v-card v-if="perbesar">
        <img :src="perbesar.src" :alt="perbesar.ket" style="width: 100%; display: block;" />
        <v-card-text class="text-caption">{{ perbesar.ket }}</v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { bolehLihat } from "@/panduan/isi.js";

const props = defineProps({
  panduan: { type: Object, required: true },
  isSuperadmin: { type: Boolean, default: false },
});

const perbesar = ref(null);
const teks = (x) => (typeof x === "string" ? x : x.teks);
const lihat = (x) => typeof x === "string" || bolehLihat(x.peran, props.isSuperadmin);

// Langkah/tips khusus superadmin disembunyikan dari member
const langkah = computed(() =>
  (props.panduan.langkah || [])
    .filter((l) => bolehLihat(l.peran, props.isSuperadmin))
    .map((l) => ({ judul: l.judul, isi: l.isi.filter(lihat).map(teks) }))
    .filter((l) => l.isi.length),
);
const tips = computed(() => (props.panduan.tips || []).filter(lihat).map(teks));
const tanya = computed(() => (props.panduan.tanya || []).filter((q) => bolehLihat(q.peran, props.isSuperadmin)));
const gambar = computed(() => props.panduan.gambar || []);
</script>

<style scoped>
.pi {
  color: var(--baba-text);
  font-size: 0.92rem;
  line-height: 1.55;
}

.pi-kegunaan {
  margin-bottom: 8px;
}

.pi-siapa {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--baba-gold-soft);
  color: var(--baba-gold-dark);
  font-size: 0.78rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.pi-judul {
  margin: 16px 0 6px;
  font-weight: 800;
  color: var(--baba-text);
}

.pi-langkah,
.pi-tips {
  padding-left: 22px;
}

.pi-langkah li,
.pi-tips li {
  margin-bottom: 6px;
}

.pi-langkah li::marker {
  color: var(--baba-gold-dark);
  font-weight: 800;
}

.pi-gambar {
  margin: 0 0 12px;
}

.pi-gambar img {
  width: 100%;
  border: 1px solid var(--baba-border);
  border-radius: 12px;
  cursor: zoom-in;
}

.pi-gambar figcaption {
  font-size: 0.78rem;
  color: var(--baba-muted);
  margin-top: 4px;
}

.pi-tanya {
  padding: 10px 12px;
  border-radius: 12px;
  background: #f7f6f2;
  margin-bottom: 8px;
}

.pi-t {
  font-weight: 700;
}

.pi-j {
  color: var(--baba-muted);
}
</style>
