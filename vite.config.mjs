// Plugins
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Fonts from "unplugin-fonts/vite";
import Layouts from "vite-plugin-vue-layouts-next";
import Vue from "@vitejs/plugin-vue";
import VueRouter from "unplugin-vue-router/vite";
import { VueRouterAutoImports } from "unplugin-vue-router";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import { VitePWA } from "vite-plugin-pwa";

// Utilities
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    VueRouter(),
    Layouts(),
    Vue({
      template: { transformAssetUrls },
    }),
    Vuetify({
      autoImport: true,
      styles: {
        configFile: "src/styles/settings.scss",
      },
    }),
    Components(),
    Fonts({
      google: {
        families: [
          {
            name: "Roboto",
            styles: "wght@100;300;400;500;700;900",
          },
        ],
      },
    }),
    AutoImport({
      imports: [
        "vue",
        VueRouterAutoImports,
        {
          pinia: ["defineStore", "storeToRefs"],
        },
      ],
      eslintrc: {
        enabled: true,
      },
      vueTemplate: true,
    }),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"],
      // File unduhan APK & bukti kepemilikan aplikasi Android tidak boleh diganti halaman aplikasi oleh service worker
      workbox: {
        navigateFallbackDenylist: [/^\/unduh\//, /^\/\.well-known\//],
      },
      // Dipasang di HP (Android: Pasang aplikasi; iPhone: Tambahkan ke Layar Utama) dan dipakai APK Android (TWA)
      manifest: {
        id: "/",
        name: "BABA PARFUME",
        short_name: "BABA PARFUME",
        description: "APLIKASI PENDATAAN AKUN MEMBER BABA PARFUME",
        lang: "id",
        start_url: "/admin/dashboard",
        scope: "/",
        theme_color: "#141414",
        background_color: "#141414",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          // Android memotong ikon menjadi bulat/kotak: versi ini hanya daun dengan jarak aman
          { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      }

    }),
  ],
  optimizeDeps: {
    exclude: ["vuetify", "vue-router", "unplugin-vue-router/runtime", "unplugin-vue-router/data-loaders", "unplugin-vue-router/data-loaders/basic"],
  },
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    port: 3000,
    // Port 3001 dipakai server chat (chatroom-baba): jangan pindah port diam-diam bila 3000 terpakai
    strictPort: true,
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: "modern-compiler",
      },
      scss: {
        api: "modern-compiler",
      },
    },
  },
});
