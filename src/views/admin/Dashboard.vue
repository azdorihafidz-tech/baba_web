<template>
  <v-container>
    <v-card class="d-none d-md-block">

      <!-- Tabs -->
      <v-tabs v-model="tab" bg-color="#FFD700" color="blue" slider-color="blue" class="d-none d-md-flex">
        <v-tab value="dashboard-overview">DASHBOARD OVERVIEW</v-tab>
        <v-tab value="dashboard-accounts">DASHBOARD AKUN</v-tab>
        <v-tab value="dashboard-documents">DASHBOARD DOCUMENTS</v-tab>
        <v-tab value="dashboard-regions">DASHBOARD MVO</v-tab>
        <v-tab value="dashboard-star">DASHBOARD STAR</v-tab>
        <v-tab value="dashboard-growth">DASHBOARD GROWTH</v-tab>
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
      <v-card class="mb-3" elevation="3">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-center">
            <h2 class="text-h5 font-weight-bold text-center">
              Dashboard
            </h2>
          </div>
        </v-card-text>
      </v-card>

      <!-- Navigation -->
      <v-chip-group v-model="mobileActiveSection" mandatory color="primary" column
        class="d-flex flex-wrap justify-center gap-2 mb-3">
        <v-chip value="overview" size="small" variant="elevated" rounded="lg">
          <v-icon start size="18">mdi-view-dashboard</v-icon>
          OVERVIEW
        </v-chip>

        <v-chip value="documents" size="small" variant="elevated" rounded="lg">
          <v-icon start size="18">mdi-file-document</v-icon>
          DOCUMENTS
        </v-chip>

        <v-chip value="accounts" size="small" variant="elevated" rounded="lg">
          <v-icon start size="18">mdi-account</v-icon>
          AKUN
        </v-chip>

        <v-chip value="regions" size="small" variant="elevated" rounded="lg">
          <v-icon start size="18">mdi-map</v-icon>
          REGIONS
        </v-chip>

        <v-chip value="growth" size="small" variant="elevated" rounded="lg">
          <v-icon start size="18">mdi-chart-line</v-icon>
          GROWTH
        </v-chip>

        <v-chip value="star" size="small" variant="elevated" rounded="lg">
          <v-icon start size="18">mdi-star</v-icon>
          STAR
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
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style>