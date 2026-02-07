<template>
  <!-- Desktop Sidebar - Simplified version like document 2 -->
  <v-navigation-drawer v-model="drawerModel" color="#1a1a1a" app permanent class="dark-sidebar d-none d-md-flex"
    :temporary="false">
    <v-list-item prepend-avatar="@/assets/newlogo.jpg" class="mb-2 mt-1 item-title logo-section" title="BABA PARFUME">
      <template v-slot:title>
        <span class="logo-text">BABA PARFUME</span>
      </template>
    </v-list-item>

    <v-divider thickness="4" color="#d4af37" class="border-opacity-75 divider-gold"></v-divider>

    <v-list class="menu-list">
      <v-list-item v-for="[icon, text, url] in linkMenu" :key="icon" :to="url" link class="menu-item"
        :class="{ 'menu-item-active': $route.path === url }">
        <template v-slot:prepend>
          <v-icon class="menu-icon">{{ icon }}</v-icon>
        </template>

        <v-list-item-title class="menu-text">
          {{ text }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <!-- Mobile Bottom Navigation - Enhanced from document 1 -->
  <v-bottom-navigation v-model="bottomNavModel" class="d-flex d-md-none mobile-bottom-nav justify-space-between"
    height="70" app>
    <!-- Menu kiri -->
    <v-btn v-for="[icon, text, url] in displayedMobileMenu.slice(0, Math.ceil((maxMobileItems - 1) / 2))" :key="icon"
      :value="url" :to="url" class="bottom-nav-btn" :class="{ 'bottom-nav-active': $route.path === url }">
      <v-icon size="22">{{ icon }}</v-icon>
      <span class="bottom-nav-label">{{ getShortText(text) }}</span>
    </v-btn>

    <!-- Spacer untuk FAB -->
    <div class="fab-spacer"></div>

    <!-- Menu kanan -->
    <v-btn v-for="[icon, text, url] in displayedMobileMenu.slice(Math.ceil((maxMobileItems - 1) / 2))" :key="icon"
      :value="url" :to="url" class="bottom-nav-btn" :class="{ 'bottom-nav-active': $route.path === url }">
      <v-icon size="22">{{ icon }}</v-icon>
      <span class="bottom-nav-label">{{ getShortText(text) }}</span>
    </v-btn>

    <!-- FAB Tengah - Tombol More dengan Warna -->
    <div class="fab-wrapper">
      <v-btn class="fab-btn fab-gradient" size="large" elevation="8" @click="toggleMoreMenu"
        :class="{ 'fab-active': showMoreMenu }">
        <v-icon class="fab-icon" :class="{ 'fab-icon-rotated': showMoreMenu }">
          {{ showMoreMenu ? 'mdi-close' : 'mdi-dots-horizontal' }}
        </v-icon>
      </v-btn>
    </div>
  </v-bottom-navigation>

  <!-- Dialog untuk menu lebih banyak pada mobile -->
  <v-dialog v-model="showMoreMenu" max-width="420" class="d-flex d-md-none">
    <v-card class="more-menu-card">
      <!-- Header -->
      <v-card-title class="more-menu-title">
        <v-icon class="me-2" color="#d4af37">mdi-menu</v-icon>
        <span class="title-text">Menu Lainnya</span>
        <v-btn icon size="small" @click="showMoreMenu = false" class="close-btn">
          <v-icon color="black">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Garis Pemisah -->
      <v-divider class="divider-gold"></v-divider>

      <!-- List Menu -->
      <v-list class="more-menu-list">
        <v-list-item v-for="[icon, text, url] in hiddenMobileMenu" :key="icon" :to="url" @click="closeMoreMenu"
          class="more-menu-item" rounded="lg">
          <template v-slot:prepend>
            <v-icon class="more-menu-icon" color="#d4af37">{{ icon }}</v-icon>
          </template>

          <v-list-item-title class="more-menu-text">{{ text }}</v-list-item-title>
        </v-list-item>

        <!-- Jika tidak ada menu tersembunyi -->
        <v-list-item v-if="hiddenMobileMenu.length === 0" class="no-items">
          <v-list-item-title class="text-center text-grey">
            Semua menu sudah tampil di bawah
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script>
import { useAppStore } from "@/stores/app.js";

export default {
  setup() {
    const app = useAppStore();
    return { app };
  },
  data() {
    return {
      bottomNavModel: "",
      showMoreMenu: false,
      maxMobileItems: 3,
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
          // ["mdi-file-document-multiple", "Document Akun", "/admin/mvodocument"],
          ["mdi-file-document-alert", "Document Belum Approve", "/admin/documentbelumapprove"],
          ["mdi-file-document", "Uploud Documentasi", "/admin/uplouddocumentasi"],
          ["mdi-store", "Store", "/admin/store"],
          ["mdi-chat", "Chat", "/admin/chat"],
          ["mdi-book-open", "Tutorial", "/admin/tutorial"],
        ],
      },
      nonSuperadminMenus: [
        "Live Performance",
        "Input Data",
        "Document Belum Approve",
        "Chat",
        "Tutorial",

      ],
      linkMenu: [],
    };
  },
  computed: {
    // Check if current screen is desktop
    isDesktop() {
      return this.screenWidth >= 768;
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

    displayedMobileMenu() {
      return this.linkMenu.slice(0, this.maxMobileItems - 1);
    },
    hiddenMobileMenu() {
      return this.linkMenu.slice(this.maxMobileItems - 1);
    },
  },
  methods: {
    toggleMoreMenu() {
      this.showMoreMenu = !this.showMoreMenu;
    },
    closeMoreMenu() {
      this.showMoreMenu = false;
    },
    getShortText(text) {
      const shortTexts = {
        "Input Data": "Input",
        "Live Performance": "Performance",
        "Verifikasi ID": "Verifikasi",
        "Tipe Akun": "Type",
        "Ruang Kota": "Ruang Kota",
        "Akun Belum Approve": "Pending",
        "Master Jabatan": "Jobs",
        "Data Cabang": "Branch",
        "Document Akun": "Docs",
        "Document Belum Approve": "Review",
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
    const otoritas = localStorage.getItem("otoritas");

    if (otoritas === "superadmin") {
      this.linkMenu = this.allMenus.DIREKSI;
    } else {
      this.linkMenu = this.allMenus.DIREKSI.filter((item) =>
        this.nonSuperadminMenus.includes(item[1])
      );
    }

    this.bottomNavModel = this.$route.path;
  },

  mounted() {
    this.initializeScreen();

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
/* ========== DESKTOP SIDEBAR STYLES - SIMPLE VERSION ========== */
/* Sidebar Container - Desktop Only */
.dark-sidebar {
  background: linear-gradient(135deg, #1a1a1a 30%, #b8941f 0%, #2e2c27 100%) !important;
  border-bottom: 2px solid #3a3a3a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(212, 175, 55, 0.1);
  backdrop-filter: blur(10px);
}

/* Logo Section */
.logo-section {
  background: linear-gradient(135deg, #2d2d2d 0%, #3a3a3a 100%);
  border-radius: 8px;
  margin: 8px;
  padding: 16px 12px !important;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.1);
}

.logo-text {
  color: #d4af37 !important;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 1px;
  text-shadow: 0 1px 3px rgba(212, 175, 55, 0.3);
}

/* Gold Divider */
.divider-gold {
  background: linear-gradient(90deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%) !important;
  margin: 8px 16px;
  border-radius: 2px;
  box-shadow: 0 1px 4px rgba(212, 175, 55, 0.3);
}

/* Menu List */
.menu-list {
  padding: 16px 8px;
  background: transparent;
}

/* Menu Items - Desktop */
.menu-item {
  margin: 4px 0;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  border: 1px solid transparent;
}

.menu-item:hover {
  background: linear-gradient(135deg, #3a3a3a 0%, #4a4a4a 100%) !important;
  border: 1px solid rgba(212, 175, 55, 0.3);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.15);
}

.menu-item-active {
  background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%) !important;
  border: 1px solid #d4af37;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
}

.menu-item-active:hover {
  background: linear-gradient(135deg, #f4d03f 0%, #d4af37 100%) !important;
  transform: translateX(2px);
}

/* Menu Icons - Desktop */
.menu-icon {
  color: #b8b8b8;
  transition: all 0.3s ease;
  font-size: 22px;
}

.menu-item:hover .menu-icon {
  color: #d4af37;
  transform: scale(1.1);
}

.menu-item-active .menu-icon {
  color: #ddd !important;
  font-weight: bold;
}

/* Menu Text - Desktop */
.menu-text {
  color: #e0e0e0 !important;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.menu-item:hover .menu-text {
  color: #ffffff !important;
  font-weight: 600;
}

.menu-item-active .menu-text {
  color: #ddd !important;
  font-weight: 700;
}

/* ========== MOBILE BOTTOM NAVIGATION STYLES - ENHANCED VERSION ========== */
.mobile-bottom-nav {
  background: #1a1a1a !important;
  border-top: 1px solid #ddd;
  position: relative;
  overflow: visible !important;
}

.fab-wrapper {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

/* ========== FAB STYLING WITH COLORS ========== */

/* Base FAB Button */
.fab-btn {
  border-radius: 50%;
  width: 64px !important;
  height: 64px !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 3px solid rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
}

/* Default Theme - Premium Gold Gradient */
.fab-gradient {
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%) !important;
  /* box-shadow:
    0 8px 24px rgba(212, 175, 55, 0.4),
    0 4px 12px rgba(212, 175, 55, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2); */
}

/* .fab-gradient:hover {
  background: linear-gradient(135deg, #f4d03f 0%, #d4af37 50%, #d4af37 100%) !important;
  transform: scale(1.1) translateY(-3px);
  box-shadow:
    0 12px 32px rgba(212, 175, 55, 0.5),
    0 6px 16px rgba(212, 175, 55, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.3);
} */

/* Active State - Red Gradient when menu open */
.fab-active {
  background: linear-gradient(135deg, #ffffff 100%) !important;

  border: 3px solid rgba(255, 255, 255, 0.2);
}



/* FAB Icon Styling */
.fab-icon {
  color: #1a1a1a !important;
  font-size: 26px;
  font-weight: 800;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-icon-rotated {
  transform: rotate(180deg) scale(1.1);
}

/* Pulse Animation Effect */
.fab-btn::after {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4af37, #f4d03f);
  opacity: 0;
  z-index: -1;
  animation: fab-pulse 2s infinite;
}

@keyframes fab-pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.7;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.3;
  }

  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* Ripple Effect on Click */
.fab-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.fab-btn:active::before {
  width: 120%;
  height: 120%;
}

.fab-spacer {
  flex: 0 0 70px;
}

/* Bottom Nav Buttons */
.bottom-nav-btn {
  color: #d4af37 !important;
  transition: all 0.3s ease;
  border-radius: 8px !important;
  margin: 2px;
  min-width: 60px;
  flex-direction: column;
  height: 60px !important;
}

.bottom-nav-btn:hover {
  color: #d4af37 !important;
  background: rgba(212, 175, 55, 0.1) !important;
  transform: translateY(-2px);
}

.bottom-nav-active {
  color: #d4af37 !important;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%) !important;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
}

.bottom-nav-label {
  font-size: 10px;
  font-weight: 500;
  margin-top: 2px;
  letter-spacing: 0.5px;
}

/* More Menu Dialog Styles */
.more-menu-card {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
}

.more-menu-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  background: linear-gradient(135deg, #1a1a1a, #333333);
  color: white;
  padding: 16px;
  font-size: 18px;
}

.title-text {
  flex: 1;
}

.close-btn {
  margin-left: auto;
}

.more-menu-list {
  padding: 8px;
}

.more-menu-item {
  transition: all 0.3s ease;
  margin-bottom: 6px;
}

.more-menu-item:hover {
  background-color: rgba(212, 175, 55, 0.08);
  transform: translateX(4px);
}

.more-menu-icon {
  font-size: 22px;
}

.more-menu-text {
  font-size: 16px;
  font-weight: 500;
}

.no-items {
  padding: 20px;
}

/* Custom Scrollbar */
.dark-sidebar ::-webkit-scrollbar {
  width: 6px;
}

.dark-sidebar ::-webkit-scrollbar-track {
  background: #2d2d2d;
  border-radius: 3px;
}

.dark-sidebar ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #d4af37 0%, #b8941f 100%);
  border-radius: 3px;
}

.dark-sidebar ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #f4d03f 0%, #d4af37 100%);
}

/* Responsive Behavior */
@media (max-width: 767.98px) {
  .dark-sidebar {
    display: none !important;
  }
}

@media (min-width: 768px) {
  .mobile-bottom-nav {
    display: none !important;
  }
}
</style>