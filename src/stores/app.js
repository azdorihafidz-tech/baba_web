// Utilities
import { defineStore } from "pinia";
import CryptoJS from "crypto-js";

export const useAppStore = defineStore("app", {
  state: () => ({
    // STANDARD UI DESIGN
    colors: {
      primary: "#1a2d7c",
      secondary: "#ea252e",
      background: "#fff5e1",
      white: "#ffffff",
      black: "#000000",
      grey: "#9e9e9e",
      whitegrey: "#f5f5f5",
    },

    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },

    fontSizes: {
      xxs: "0.5rem",
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
    },

    fontFamilies: {
      sans: "Poppins, sans-serif",
      serif: "Poppins, serif",
      mono: "Poppins, monospace",
    },

    snackbar: {
      show: false,
      color: "",
      text: "",
      timeout: 0,
    },

    dataUser: {
      username: "",
      nama: "",
      otoritas: "",
    },

    dataNotifikasi: [],
    drawer: true,

    snackbar: {
      show: false,
      color: "",
      text: "",
      timeout: 0,
    },

    formatToCurrency(value) {
      return `Rp. ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
  }),

  actions: {
    showSnackbar(message, color, timeout) {
      this.snackbar.show = true;
      this.snackbar.color = color;
      this.snackbar.text = message;
      this.snackbar.timeout = timeout;
    },

    formatToCurrency(value) {
      return `Rp. ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
    },

    formatDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
  },
});
