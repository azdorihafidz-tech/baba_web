<template>
  <!-- Desktop: sidebar gelap -->
  <v-navigation-drawer v-model="drawerModel" color="#141414" app permanent class="baba-drawer d-none d-md-flex"
    :temporary="false" width="264">
    <div class="drawer-brand">
      <v-avatar size="44" class="drawer-logo">
        <v-img src="@/assets/newlogo.jpg" cover />
      </v-avatar>
      <div class="drawer-brand-text">
        <div class="drawer-brand-title">BABA PARFUME</div>
        <div class="drawer-brand-sub">Member Area</div>
      </div>
    </div>

    <v-list class="drawer-menu" density="comfortable" nav>
      <v-list-item v-for="[icon, text, url] in linkMenu" :key="url" :to="url" link class="drawer-item"
        :class="{ 'drawer-item-active': $route.path === url }" rounded="lg">
        <template v-slot:prepend>
          <v-icon class="drawer-icon">{{ icon }}</v-icon>
        </template>
        <v-list-item-title class="drawer-text">{{ text }}</v-list-item-title>
        <template v-if="lencana(url)" v-slot:append>
          <span class="menu-lencana" :title="`${lencana(url)} pesan baru`">{{ teksLencana(lencana(url)) }}</span>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <!-- HP: menu bawah berisi menu utama + "Lainnya" -->
  <v-bottom-navigation v-model="bottomNavModel" class="baba-bottom-nav d-flex d-md-none" grow app
    height="64" bg-color="#141414">
    <v-btn v-for="[icon, text, url] in displayedMobileMenu" :key="url" :value="url" :to="url" class="bottom-btn"
      :class="{ 'bottom-btn-active': $route.path === url }">
      <v-icon size="22">{{ icon }}</v-icon>
      <span class="bottom-label">{{ getShortText(text) }}</span>
      <span v-if="lencana(url)" class="bottom-lencana">{{ teksLencana(lencana(url)) }}</span>
    </v-btn>

    <v-btn v-if="hiddenMobileMenu.length" value="__more" class="bottom-btn"
      :class="{ 'bottom-btn-active': showMoreMenu || isHiddenRouteActive }" @click.prevent="toggleMoreMenu">
      <v-icon size="22">mdi-dots-grid</v-icon>
      <span class="bottom-label">Lainnya</span>
      <span v-if="lencanaLainnya" class="bottom-lencana">{{ teksLencana(lencanaLainnya) }}</span>
    </v-btn>
  </v-bottom-navigation>

  <!-- HP: panel menu lainnya dari bawah -->
  <v-bottom-sheet v-model="showMoreMenu" class="d-md-none">
    <v-card class="more-sheet" rounded="t-xl">
      <div class="more-handle"></div>
      <div class="more-title">Menu Lainnya</div>
      <div class="more-grid">
        <router-link v-for="[icon, text, url] in hiddenMobileMenu" :key="url" :to="url" class="more-tile"
          :class="{ 'more-tile-active': $route.path === url }" @click="closeMoreMenu">
          <span class="more-tile-icon"><v-icon size="24">{{ icon }}</v-icon>
            <span v-if="lencana(url)" class="tile-lencana">{{ teksLencana(lencana(url)) }}</span></span>
          <span class="more-tile-text">{{ text }}</span>
        </router-link>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { useAppStore } from "@/stores/app.js";
import { chatState, mulaiChat } from "@/utils/chatKoneksi";
import { MENU_HAK, muatHak, punyaHak } from "@/utils/hakAkses";

export default {
  setup() {
    const app = useAppStore();
    return { app, chatState };
  },
  data() {
    return {
      bottomNavModel: "",
      showMoreMenu: false,
      // Jumlah menu yang tampil langsung di menu bawah HP (sisanya di "Lainnya").
      maxMobileItems: 4,
      // Menu yang didahulukan di menu bawah HP, sesuai urutan ini.
      mobilePriority: [
        "Live Performance",
        "Input Data",
        "Verifikasi ID",
        "Akun Belum Approve",
        "Document Belum Approve",
      ],
      screenWidth: 0,
      allMenus: {
        DIREKSI: [
          ["mdi-view-dashboard", "Live Performance", "/admin/dashboard"],
          ["mdi-clipboard-text-outline", "Input Data", "/admin/mvo"],
          ["mdi-account", "Verifikasi ID", "/admin/user"],
          // ["mdi-city", "Ruang Kota", "/admin/masterheaders"], // spasi depan sudah dibuang
          ["mdi-format-list-bulleted-type", "Tipe Akun", "/admin/mvotype"],
          ["mdi-account-alert", "Akun Belum Approve", "/admin/mvobelumapprove"],
          // ["mdi-badge-account", "Master Jabatan", "/admin/jabatan"],
          ["mdi-domain", "Data Cabang", "/admin/provinsi"],
          ["mdi-domain", "Struktur Akun", "/admin/strukturhierarkiakun"],
          // ["mdi-file-document-multiple", "Document Akun", "/admin/mvodocument"],
          ["mdi-file-document-alert", "Document Belum Approve", "/admin/documentbelumapprove"],
          // ["mdi-file-document-alert", "Pending Approval Documen", "/admin/pendingapprovaldocumen"],
          ["mdi-account-switch", "Mutasi Jabatan", "/admin/mutasi"],
          ["mdi-shield-account", "Hak Akses", "/admin/hak-akses"],
          ["mdi-file-document", "Uploud Documentasi", "/admin/uplouddocumentasi"],
          ["mdi-store", "Store", "/admin/store"],
          ["mdi-chat", "Chat", "/admin/chat"],
          ["mdi-book-open-page-variant", "Panduan", "/admin/panduan"],
        ],
      },
      nonSuperadminMenus: [
        "Live Performance",
        "Input Data",
        "Document Belum Approve",
        "Akun Belum Approve",
        "Store",
        "Chat",
        "Panduan",
        "Struktur Akun",

      ],
      linkMenu: [],
    };
  },
  computed: {
    // Check if current screen is desktop
    isDesktop() {
      // Sama dengan breakpoint "md" Vuetify (d-md-flex / d-md-none di template).
      return this.screenWidth >= 960;
    },

    // Drawer model
    drawerModel: {
      get() {
        if (!this.isDesktop) {
          return false;
        }
        return this.app.drawer ?? true; // default true
      },
      set(value) {
        if (this.isDesktop) {
          this.app.drawer = value;
        }
      },
    },

    // Menu bawah HP: menu prioritas dulu, lalu sisanya sesuai urutan sidebar.
    orderedMobileMenu() {
      const rank = (item) => {
        const i = this.mobilePriority.indexOf(item[1]);
        return i === -1 ? this.mobilePriority.length : i;
      };
      return this.linkMenu
        .map((item, index) => ({ item, index }))
        .sort((a, b) => rank(a.item) - rank(b.item) || a.index - b.index)
        .map(({ item }) => item);
    },
    displayedMobileMenu() {
      // Kalau total menu muat (<= maxMobileItems + 1), tampilkan semua tanpa "Lainnya".
      if (this.orderedMobileMenu.length <= this.maxMobileItems + 1) {
        return this.orderedMobileMenu;
      }
      return this.orderedMobileMenu.slice(0, this.maxMobileItems);
    },
    hiddenMobileMenu() {
      return this.orderedMobileMenu.slice(this.displayedMobileMenu.length);
    },
    // Lencana menu yang tersembunyi di "Lainnya" (HP)
    lencanaLainnya() {
      return this.hiddenMobileMenu.reduce((n, item) => n + this.lencana(item[2]), 0);
    },
    isHiddenRouteActive() {
      return this.hiddenMobileMenu.some((item) => item[2] === this.$route.path);
    },
  },
  methods: {
    aturMenuMember() {
      this.linkMenu = this.allMenus.DIREKSI.filter((item) =>
        this.nonSuperadminMenus.includes(item[1]) || (MENU_HAK[item[1]] && punyaHak(MENU_HAK[item[1]]))
      );
    },
    // Jumlah pesan chat belum dibaca (lencana menu Chat)
    lencana(url) {
      return url === "/admin/chat" ? this.chatState.total : 0;
    },
    teksLencana(n) {
      return n > 99 ? "99+" : n;
    },
    toggleMoreMenu() {
      this.showMoreMenu = !this.showMoreMenu;
    },
    closeMoreMenu() {
      this.showMoreMenu = false;
    },
    getShortText(text) {
      const shortTexts = {
        "Live Performance": "Dashboard",
        "Input Data": "Input",
        "Verifikasi ID": "Verifikasi",
        "Tipe Akun": "Tipe Akun",
        "Ruang Kota": "Ruang Kota",
        "Akun Belum Approve": "Approval",
        "Master Jabatan": "Jabatan",
        "Data Cabang": "Cabang",
        "Struktur Akun": "Struktur",
        "Document Akun": "Dokumen",
        "Document Belum Approve": "Dokumen",
        "Uploud Documentasi": "Dokumentasi",
        "Mutasi Jabatan": "Mutasi",
        "Store": "Store",
      };
      return shortTexts[text] || text.split(" ")[0];
    },

    // Handle window resize
    handleResize() {
      this.screenWidth = window.innerWidth;

      if (this.isDesktop && (this.app.drawer === undefined || this.app.drawer === false)) {
        this.$nextTick(() => {
          this.app.drawer = true;
        });
      }
    },

    // Initialize screen width
    initializeScreen() {
      if (typeof window !== "undefined") {
        this.screenWidth = window.innerWidth;

        if (this.isDesktop && this.app.drawer === undefined) {
          this.app.drawer = true;
        }
      }
    },

    // Toggle drawer
    toggleDrawer() {
      if (this.isDesktop) {
        this.app.drawer = !this.app.drawer;
      }
    },
  },

  created() {
    const mvo_type_id = localStorage.getItem("mvo_type_id");

    if (mvo_type_id === "superadmin") {
      this.linkMenu = this.allMenus.DIREKSI;
    } else {
      this.aturMenuMember();
      // Menu tambahan dari hak akses (mis. Mutasi Jabatan untuk Founder yang diberi hak)
      muatHak().then(() => this.aturMenuMember());
    }

    this.bottomNavModel = this.$route.path;
  },

  mounted() {
    this.initializeScreen();
    mulaiChat(); // koneksi chat bersama untuk lencana pesan baru

    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.handleResize);
    }
  },
  beforeUnmount() {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.handleResize);
    }
  },
  watch: {
    "$route.path"(newPath) {
      this.bottomNavModel = newPath;
      mulaiChat(); // sambung ulang bila token login berganti
    },
    isDesktop(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal) {
          this.$nextTick(() => {
            this.app.drawer = true;
          });
        } else {
          this.app.drawer = false;
        }
      }
    },
  },
};
</script>


<style scoped>
/* ===== Desktop sidebar ===== */
.baba-drawer {
  border-right: none !important;
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 18px 18px;
  border-bottom: 1px solid rgba(230, 180, 34, 0.25);
}

.drawer-logo {
  border: 1.5px solid var(--baba-gold);
}

.drawer-brand-title {
  color: var(--baba-gold-light);
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.08em;
}

.drawer-brand-sub {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.75rem;
}

.drawer-menu {
  padding: 12px 10px;
  background: transparent;
}

.drawer-item {
  min-height: 44px;
  margin-bottom: 2px;
  color: rgba(255, 255, 255, 0.78) !important;
}

.drawer-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.drawer-icon {
  color: rgba(255, 255, 255, 0.6);
  opacity: 1;
}

.drawer-text {
  font-size: 0.9rem;
  font-weight: 500;
}

.drawer-item-active {
  background: rgba(230, 180, 34, 0.16) !important;
  color: var(--baba-gold-light) !important;
  box-shadow: inset 3px 0 0 var(--baba-gold);
}

.drawer-item-active .drawer-icon {
  color: var(--baba-gold);
}

.drawer-item-active .drawer-text {
  font-weight: 700;
}

/* ===== HP: menu bawah ===== */
.baba-bottom-nav {
  border-top: 1px solid rgba(230, 180, 34, 0.25);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.18) !important;
}

.bottom-btn {
  color: rgba(255, 255, 255, 0.62) !important;
  min-width: 0 !important;
  padding: 0 4px !important;
}

.bottom-btn :deep(.v-btn__content) {
  flex-direction: column;
  gap: 3px;
}

.bottom-label {
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.bottom-btn-active {
  color: var(--baba-gold-light) !important;
}

.bottom-btn-active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 28%;
  right: 28%;
  height: 3px;
  border-radius: 0 0 3px 3px;
  background: var(--baba-gold);
}

/* ===== HP: panel menu lainnya ===== */
.more-sheet {
  padding: 8px 16px calc(20px + env(safe-area-inset-bottom, 0px));
  background: var(--baba-surface);
}

.more-handle {
  width: 40px;
  height: 4px;
  border-radius: 4px;
  background: var(--baba-border);
  margin: 4px auto 12px;
}

.more-title {
  font-weight: 700;
  font-size: 1rem;
  color: var(--baba-text);
  margin-bottom: 12px;
}

.more-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.more-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 6px;
  border-radius: var(--baba-radius);
  border: 1px solid var(--baba-border);
  text-decoration: none;
  color: var(--baba-text);
  text-align: center;
  transition: background 0.15s;
}

.more-tile:active,
.more-tile-active {
  background: var(--baba-gold-soft);
  border-color: var(--baba-gold);
}

.more-tile-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--baba-ink);
  color: var(--baba-gold-light);
}

.more-tile-text {
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.2;
}

/* Lencana jumlah pesan chat belum dibaca */
.menu-lencana,
.bottom-lencana,
.tile-lencana {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgb(var(--v-theme-error));
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1;
}

.bottom-btn,
.more-tile-icon {
  position: relative;
}

.bottom-lencana,
.tile-lencana {
  position: absolute;
  top: 4px;
  right: calc(50% - 26px);
  min-width: 18px;
  height: 18px;
  font-size: 0.65rem;
}

.tile-lencana {
  top: -6px;
  right: -8px;
}
</style>
