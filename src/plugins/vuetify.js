/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import "@/styles/theme.scss";

// Composables
import { createVuetify } from "vuetify";
// import { VTreeview } from "vuetify/components/VTreeview";

// Tema BABA PARFUME: hitam-emas sesuai logo, isi halaman tetap terang.
// Token warna yang sama tersedia sebagai CSS variable di styles/theme.scss.
export default createVuetify({
  components: {
    // VTreeview,
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          primary: "#E6B422",
          "primary-darken-1": "#B8890F",
          secondary: "#1A1A1A",
          background: "#F6F4EF",
          surface: "#FFFFFF",
          error: "#C62828",
          success: "#2E7D32",
          warning: "#E08A00",
          info: "#1F6FB2",
        },
      },
    },
  },
  defaults: {
    VBtn: { rounded: "lg" },
    VCard: { rounded: "lg" },
    VTextField: { color: "primary" },
    VTextarea: { color: "primary" },
    VSelect: { color: "primary" },
    VAutocomplete: { color: "primary" },
    VCombobox: { color: "primary" },
    VFileInput: { color: "primary" },
    VChip: { rounded: "lg" },
  },
});
