<template>
  <v-container>
    <!-- ================= DESKTOP LAYOUT ================= -->
    <div class="d-none d-md-block">
      <div class="dash-heading">
        <h1 class="dash-title">Live Performance</h1>
        <p class="dash-sub">Ringkasan akun, dokumen, dan performa jaringan</p>
      </div>
    </div>

    <v-card class="d-none d-md-block dash-card">

      <!-- Tabs -->
      <v-tabs v-model="tab" bg-color="#141414" color="#F6D365" slider-color="#E6B422" class="d-none d-md-flex dash-tabs">
        <v-tab value="dashboard-overview" prepend-icon="mdi-view-dashboard-outline">Overview</v-tab>
        <v-tab value="dashboard-accounts" prepend-icon="mdi-account-outline">Akun</v-tab>
        <v-tab value="dashboard-documents" prepend-icon="mdi-file-document-outline">Dokumen</v-tab>
        <v-tab value="dashboard-regions" prepend-icon="mdi-map-outline">MVO</v-tab>
        <v-tab value="dashboard-star" prepend-icon="mdi-star-outline">Star</v-tab>
        <v-tab value="dashboard-growth" prepend-icon="mdi-chart-line">Growth</v-tab>
      </v-tabs>

      <!-- Tab Content -->
      <v-card-text>
        <v-tabs-window v-model="tab">

          <v-tabs-window-item value="dashboard-overview">
            <DashboardOverview @navigate-to-tab="handleNavigateToTab" />
          </v-tabs-window-item>

          <v-tabs-window-item value="dashboard-documents">
            <DashboardDocuments />
          </v-tabs-window-item>

          <v-tabs-window-item value="dashboard-accounts">
            <DashboardAccounts />
          </v-tabs-window-item>

          <v-tabs-window-item value="dashboard-regions">
            <DashboardRegions />
          </v-tabs-window-item>

          <v-tabs-window-item value="dashboard-growth">
            <DashboardGrowth />
          </v-tabs-window-item>

          <v-tabs-window-item value="dashboard-star">
            <DashboardStar />
          </v-tabs-window-item>

        </v-tabs-window>
      </v-card-text>
    </v-card>

    <!-- ================= MOBILE LAYOUT ================= -->
    <div class="d-block d-md-none">

      <!-- Header -->
      <div class="dash-heading">
        <h1 class="dash-title">Live Performance</h1>
        <p class="dash-sub">Ringkasan akun & dokumen</p>
      </div>

      <!-- Navigation: satu baris, bisa digeser -->
      <v-chip-group v-model="mobileActiveSection" mandatory selected-class="dash-chip-active" class="dash-chips mb-3">
        <v-chip v-for="s in mobileSections" :key="s.value" :value="s.value" variant="outlined" class="dash-chip">
          <v-icon start size="18">{{ s.icon }}</v-icon>
          {{ s.label }}
        </v-chip>
      </v-chip-group>

      <!-- Sections -->
      <div v-if="mobileActiveSection === 'overview'">
        <DashboardOverview @navigate-to-tab="handleNavigateToTab" />
      </div>

      <div v-if="mobileActiveSection === 'documents'">
        <DashboardDocuments />
      </div>

      <div v-if="mobileActiveSection === 'accounts'">
        <DashboardAccounts />
      </div>

      <div v-if="mobileActiveSection === 'regions'">
        <DashboardRegions />
      </div>

      <div v-if="mobileActiveSection === 'growth'">
        <DashboardGrowth />
      </div>

      <div v-if="mobileActiveSection === 'star'">
        <DashboardStar />
      </div>

    </div>

    <!-- Loading Overlay -->
    <v-overlay v-model="isLoading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64" />
    </v-overlay>

  </v-container>
</template>

<script>
import DashboardOverview from "./dashboard/DashboardOverview.vue";
import DashboardDocuments from "./dashboard/DashboardDocuments.vue";
import DashboardAccounts from "./dashboard/DashboardAccounts.vue";
import DashboardRegions from "./dashboard/DashboardRegions.vue";
import DashboardGrowth from "./dashboard/DashboardGrowth.vue";
import DashboardStar from "./dashboard/DashboardStar.vue";

export default {
  name: "Dashboard",

  components: {
    DashboardOverview,
    DashboardDocuments,
    DashboardAccounts,
    DashboardRegions,
    DashboardGrowth,
    DashboardStar,
  },

  data() {
    return {
      tab: "dashboard-overview",
      mobileActiveSection: "overview",
      mobileSections: [
        { value: "overview", label: "Overview", icon: "mdi-view-dashboard-outline" },
        { value: "accounts", label: "Akun", icon: "mdi-account-outline" },
        { value: "documents", label: "Dokumen", icon: "mdi-file-document-outline" },
        { value: "regions", label: "Wilayah", icon: "mdi-map-outline" },
        { value: "star", label: "Star", icon: "mdi-star-outline" },
        { value: "growth", label: "Growth", icon: "mdi-chart-line" },
      ],
      isLoading: false,
    };
  },

  methods: {
    /* ===== HANDLE NAVIGATE TO TAB ===== */
    handleNavigateToTab(section) {
      // Untuk Desktop
      this.tab = `dashboard-${section}`;

      // Untuk Mobile
      this.mobileActiveSection = section;
    }
  }
};
</script>

<style scoped>
.dash-heading {
  margin-bottom: 16px;
}

.dash-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--baba-text);
  line-height: 1.2;
}

.dash-sub {
  margin-top: 2px;
  font-size: 0.875rem;
  color: var(--baba-muted);
}

.dash-card {
  border: 1px solid var(--baba-border);
  box-shadow: var(--baba-shadow) !important;
  overflow: hidden;
}

.dash-tabs :deep(.v-tab) {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

/* HP: semua menu terlihat dalam grid 3 kolom */
.dash-chips :deep(.v-slide-group__content) {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 2px;
}

.dash-chip {
  margin: 0 !important;
  justify-content: center;
  height: 40px !important;
  background: var(--baba-surface);
  border-color: var(--baba-border) !important;
  color: var(--baba-text) !important;
  font-weight: 600;
}

.dash-chip-active {
  background: var(--baba-ink) !important;
  border-color: var(--baba-ink) !important;
  color: var(--baba-gold-light) !important;
}

@media (max-width: 959.98px) {
  .dash-title {
    font-size: 1.25rem;
  }
}
</style>