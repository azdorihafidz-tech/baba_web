<template>
  <div class="kode-box">
    <div class="kode-title">Aturan No ID</div>
    <v-row dense>
      <v-col cols="12" md="4">
        <v-select label="Cara penomoran" :items="modeOptions" item-title="text" item-value="value"
          :model-value="model.kode_mode" @update:model-value="ubah('kode_mode', $event)" density="compact"
          variant="outlined" clearable hide-details="auto" />
      </v-col>
      <v-col v-if="pakaiAwalan" cols="12" md="2">
        <v-text-field label="Awalan" :model-value="model.kode_awalan"
          @update:model-value="ubah('kode_awalan', ($event || '').toUpperCase())" density="compact" variant="outlined"
          maxlength="5" hide-details="auto" />
      </v-col>
      <template v-if="model.kode_mode === 'rentang'">
        <v-col cols="6" md="3">
          <v-text-field label="Nomor awal" type="number" :model-value="model.kode_mulai"
            @update:model-value="ubah('kode_mulai', $event)" density="compact" variant="outlined" min="1" max="999"
            hide-details="auto" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field label="Nomor akhir" type="number" :model-value="model.kode_akhir"
            @update:model-value="ubah('kode_akhir', $event)" density="compact" variant="outlined" min="1" max="999"
            hide-details="auto" />
        </v-col>
      </template>
    </v-row>
    <div class="kode-contoh">{{ contoh }}</div>
  </div>
</template>

<script>
/**
 * Isian aturan No ID per jabatan (dipakai di dialog Tipe Akun).
 * v-model berisi objek dengan kode_mode, kode_awalan, kode_mulai, kode_akhir.
 */
export default {
  props: {
    modelValue: { type: Object, required: true },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      modeOptions: [
        { text: "Nomor urut (TM01, M01, R01)", value: "urut" },
        { text: "Rentang nomor (B01–B50)", value: "rentang" },
        { text: "Turunan dari No ID atasan (B51-01)", value: "turunan" },
      ],
    };
  },
  computed: {
    model() {
      return this.modelValue;
    },
    pakaiAwalan() {
      return ["urut", "rentang"].includes(this.model.kode_mode);
    },
    contoh() {
      const m = this.model;
      const pad = (n) => String(n ?? "").padStart(2, "0");
      if (m.kode_mode === "urut") return `Contoh: ${m.kode_awalan || "?"}01, ${m.kode_awalan || "?"}02, …`;
      if (m.kode_mode === "rentang") {
        return `Contoh: ${m.kode_awalan || "?"}${pad(m.kode_mulai || 1)} sampai ${m.kode_awalan || "?"}${pad(m.kode_akhir || 1)}`;
      }
      if (m.kode_mode === "turunan") return "Contoh: atasan B51 → B51-01, B51-02, …";
      return "Jabatan ini tidak memakai No ID otomatis.";
    },
  },
  methods: {
    ubah(field, value) {
      this.$emit("update:modelValue", { ...this.model, [field]: value });
    },
  },
};
</script>

<style scoped>
.kode-box {
  border: 1px dashed var(--baba-border);
  border-radius: var(--baba-radius);
  padding: 12px 12px 8px;
  margin-bottom: 8px;
}

.kode-title {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--baba-gold-dark);
  margin-bottom: 8px;
}

.kode-contoh {
  margin-top: 6px;
  font-size: 0.8rem;
  color: var(--baba-muted);
}
</style>
