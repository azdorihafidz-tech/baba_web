<template>
  <Breadcrumb :items="itemsBreadcrumb" />

  <!-- Desktop View - Data Table -->
  <div class="d-none d-md-block">
    <CardDataTable :title="title">
      <template v-slot:search>
        <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Search" single-line
          hide-details variant="outlined" class="search-field" />
      </template>
      <template v-slot:datatable>
        <v-data-table class="bg-grey-lighten-4 text-no-wrap" hover :headers="datatable.headers" :items="filteredItems"
          :search="datatable.search" :loading="isTableLoading">

          <!-- Template for code with color coding based on level -->
          <template v-slot:item.code="{ item }">
            <v-chip :color="getCodeColor(item.code)" size="small" variant="flat">
              {{ item.code }}
            </v-chip>
          </template>

          <!-- Template for class_member -->
          <template v-slot:item.class_member="{ item }">
            <v-chip :color="getClassColor(item.class_member)" size="small" variant="flat">
              {{ item.class_member || '-' }}
            </v-chip>
          </template>

          <!-- Template for status_inputan -->
          <template v-slot:item.status_inputan="{ item }">
            <v-chip :color="getStatusColor(item.status_inputan)" size="small" variant="flat">
              {{ getStatusText(item.status_inputan) }}
            </v-chip>
          </template>

          <!-- Template for level -->
          <template v-slot:item.level="{ item }">
            <v-chip color="info" size="small" variant="flat">
              Level {{ item.level }}
            </v-chip>
          </template>

          <!-- Template for formatted date -->
          <template v-slot:item.tgl_lahir="{ item }">
            {{ formatDate(item.tgl_lahir) }}
          </template>

          <!-- Template for parent info -->
          <template v-slot:item.parent_info="{ item }">
            {{ getParentInfo(item.parent_id) }}
          </template>

        </v-data-table>
      </template>
    </CardDataTable>
  </div>

  <!-- Mobile View - Cards -->
  <div class="d-block d-md-none">
    <v-card class="mobile-header-card mb-4">
      <v-card-text>
        <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Cari data akun..." single-line
          hide-details variant="outlined" class="search-field-mobile" />
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="isTableLoading" indeterminate color="#FFD700" class="mb-4"></v-progress-linear>

    <div v-if="filteredItems.length === 0 && !isTableLoading" class="text-center pa-4">
      <v-icon size="64" color="grey">mdi-account-search</v-icon>
      <p class="text-grey mt-2">Tidak ada data akun belum approve ditemukan</p>
    </div>

    <v-card v-for="(item, index) in paginatedMobileItems" :key="item.id" class="mobile-mvo-card mb-3"
      @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">
      <!-- Header Card - Always Visible -->
      <v-card-text class="mobile-card-header">
        <v-row no-gutters align="center">
          <v-col cols="1" class="text-center">
            <span class="mobile-number">{{ ((currentMobilePage - 1) * itemsPerMobilePage) + index + 1 }}</span>
          </v-col>

          <v-col cols="9" class="pl-3">
            <div class="mobile-mvo-name">
              <strong>{{ item.nama || 'Nama Tidak Tersedia' }}</strong>
            </div>
            <div class="mobile-mvo-preview">
              <v-chip :color="getCodeColor(item.code)" size="x-small" variant="flat" class="mr-1 mb-1">
                {{ item.code }}
              </v-chip>
              <v-chip :color="getStatusColor(item.status_inputan)" size="x-small" variant="flat" class="mr-1 mb-1">
                {{ getStatusText(item.status_inputan) }}
              </v-chip>
            </div>
          </v-col>

          <v-col cols="2" class="text-center">
            <v-icon :class="{ 'rotate-180': expandedMobileCard === item.id }" class="transition-all">
              mdi-chevron-down
            </v-icon>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Detail Card - Expandable -->
      <v-expand-transition>
        <div v-show="expandedMobileCard === item.id">
          <v-divider></v-divider>
          <v-card-text class="mobile-card-details">
            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>Kode:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                <v-chip :color="getCodeColor(item.code)" size="small" variant="flat">
                  {{ item.code }}
                </v-chip>
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>Nama Lengkap:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                {{ item.nama || '-' }}
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>Nama Panggilan:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                {{ item.nama_panggilan || '-' }}
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>No. ID:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                {{ item.nomor_id || '-' }}
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>Tempat Lahir:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                {{ item.tempat_lahir || '-' }}
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>Tanggal Lahir:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                {{ formatDate(item.tgl_lahir) }}
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>Class:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                <v-chip :color="getClassColor(item.class_member)" size="small" variant="flat">
                  {{ item.class_member || '-' }}
                </v-chip>
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>No. HP:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                {{ item.nohp || '-' }}
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>Jaringan:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                {{ item.jaringan_mvo || '-' }}
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>Level:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                <v-chip color="info" size="small" variant="flat">
                  Level {{ item.level }}
                </v-chip>
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>Parent:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                {{ getParentInfo(item.parent_id) }}
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>Status:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                <v-chip :color="getStatusColor(item.status_inputan)" size="small" variant="flat">
                  {{ getStatusText(item.status_inputan) }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>

    <!-- Mobile Pagination -->
    <div v-if="filteredMobileItems.length > itemsPerMobilePage" class="mobile-pagination mt-4">
      <v-pagination v-model="currentMobilePage" :length="totalMobilePages" :total-visible="5" color="#FFD700"
        class="custom-pagination"></v-pagination>
    </div>
  </div>

  <v-snackbar v-model="contentSnackbar.snackbar" :color="contentSnackbar.color">
    {{ contentSnackbar.text }}
  </v-snackbar>
</template>

<script>
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import CardDataTable from "@/components/ui/CardDataTable.vue";
import { useAppStore } from "@/stores/app.js";
import axios from "axios";
import Cookies from "js-cookie";

export default {
  name: 'MvoDataPage',
  components: {
    Breadcrumb,
    CardDataTable,
  },

  setup() {
    const app = useAppStore();
    return { app };
  },

  data() {
    return {
      expandedMobileCard: null, // For mobile card expansion
      currentMobilePage: 1, // Mobile pagination
      itemsPerMobilePage: 5, // Items per mobile page

      contentSnackbar: {
        snackbar: false,
        text: "",
        color: "",
      },

      title: "DATA AKUN - BELUM DISETUJUI",
      itemsBreadcrumb: [
        {
          title: "Dashboard",
          disabled: false,
          href: "/admin/dashboard",
        },
        {
          title: "Akun Belum Approve",
          disabled: false,
          href: "/admin/mvo-data",
        },
      ],

      datatable: {
        search: "",
        headers: [
          { key: "code", title: "Kode", width: "150px" },
          { key: "nama", title: "Nama Lengkap" },
          { key: "nama_panggilan", title: "Nama Panggilan" },
          { key: "nomor_id", title: "No. ID" },
          { key: "tempat_lahir", title: "Tempat Lahir" },
          { key: "tgl_lahir", title: "Tanggal Lahir" },
          { key: "class_member", title: "Class", align: "center" },
          { key: "nohp", title: "No. HP" },
          { key: "jaringan_mvo", title: "Jaringan" },
          { key: "level", title: "Level", align: "center" },
          { key: "parent_info", title: "Parent" },
          { key: "status_inputan", title: "Status", align: "center" },
        ],
        items: [],
      },

      isTableLoading: true,
      allMvoData: [], // Store all MVO data for parent lookup
    };
  },

  computed: {
    // Filter untuk menampilkan hanya data yang belum di-approve atau status null
    filteredItems() {
      let filtered = this.datatable.items.filter(item => {
        const status = item.status_inputan?.toLowerCase();
        return !status || status !== 'approved';
      });

      // Apply search filter
      if (this.datatable.search) {
        const searchTerm = this.datatable.search.toLowerCase();
        filtered = filtered.filter(item => {
          return (
            (item.nama && item.nama.toLowerCase().includes(searchTerm)) ||
            (item.nama_panggilan && item.nama_panggilan.toLowerCase().includes(searchTerm)) ||
            (item.code && item.code.toLowerCase().includes(searchTerm)) ||
            (item.nomor_id && item.nomor_id.toLowerCase().includes(searchTerm)) ||
            (item.tempat_lahir && item.tempat_lahir.toLowerCase().includes(searchTerm)) ||
            (item.nohp && item.nohp.toLowerCase().includes(searchTerm)) ||
            (item.jaringan_mvo && item.jaringan_mvo.toLowerCase().includes(searchTerm))
          );
        });
      }

      return filtered;
    },

    // Mobile specific computed properties
    filteredMobileItems() {
      return this.filteredItems;
    },

    totalMobilePages() {
      return Math.ceil(this.filteredMobileItems.length / this.itemsPerMobilePage);
    },

    paginatedMobileItems() {
      const start = (this.currentMobilePage - 1) * this.itemsPerMobilePage;
      const end = start + this.itemsPerMobilePage;
      return this.filteredMobileItems.slice(start, end);
    }
  },

  methods: {
    // Mobile card toggle method
    toggleMobileDetail(itemId) {
      if (this.expandedMobileCard === itemId) {
        this.expandedMobileCard = null;
      } else {
        this.expandedMobileCard = itemId;
      }
    },

    // Status color and text methods
    getStatusColor(status) {
      if (!status) return 'grey';
      switch (status.toLowerCase()) {
        case 'approved':
          return 'success';
        case 'pending':
          return 'warning';
        case 'rejected':
          return 'error';
        default:
          return 'grey';
      }
    },

    getStatusText(status) {
      if (!status) return 'Belum Disetujui';
      switch (status.toLowerCase()) {
        case 'approved':
          return 'Disetujui';
        case 'pending':
          return 'Menunggu';
        case 'rejected':
          return 'Ditolak';
        default:
          return status;
      }
    },

    // Code color based on prefix
    getCodeColor(code) {
      if (!code) return 'grey';
      if (code.startsWith('FND')) return 'primary';
      if (code.startsWith('MVO')) return 'success';
      if (code.startsWith('DIST')) return 'warning';
      return 'info';
    },

    // Class member color
    getClassColor(classType) {
      if (!classType) return 'grey';
      switch (classType.toUpperCase()) {
        case 'GOLD':
          return 'amber';
        case 'SILVER':
          return 'blue-grey';
        case 'BRONZE':
          return 'brown';
        case 'PLATINUM':
          return 'purple';
        default:
          return 'blue';
      }
    },

    // Format date
    formatDate(dateString) {
      if (!dateString) return '-';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (error) {
        return '-';
      }
    },

    // Get parent information
    getParentInfo(parentId) {
      if (!parentId) return 'Root';
      const parent = this.allMvoData.find(item => item.id == parentId);
      return parent ? parent.code : `ID: ${parentId}`;
    },

    // Utility methods
    showSnackbar(message, type = 'success') {
      this.contentSnackbar.snackbar = true;
      this.contentSnackbar.text = message;
      this.contentSnackbar.color = type === 'success' ? this.app.colors.primary : this.app.colors.secondary;
    },

    // API methods
    async getAllMvoData() {
      const token = Cookies.get("token");
      if (!token) {
        await this.$router.push({ name: "Login" });
        return;
      }

      this.isTableLoading = true;

      try {
        const response = await axios.get("https://babaapi.teknosof.com/api/mvo", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === "success") {
          this.allMvoData = response.data.data; // Store all data for parent lookup
          this.datatable.items = response.data.data;
        } else {
          this.showSnackbar(response.data.message || "Error loading MVO data", 'error');
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error loading MVO data", 'error');
        console.error("Error fetching MVO data:", error);
      } finally {
        this.isTableLoading = false;
      }
    },
  },

  async created() {
    await this.getAllMvoData();
  },

  watch: {
    // Watch untuk close mobile expansion ketika search berubah
    'datatable.search': {
      handler() {
        this.expandedMobileCard = null;
        this.currentMobilePage = 1; // Reset pagination when searching
      }
    }
  }
};
</script>

<style scoped>
/* Desktop Table Styling */
:deep(.v-data-table) {
  border: 1px solid #000000;
}

:deep(.v-data-table__th) {
  background-color: #888888 !important;
  color: #FFD700 !important;
  font-weight: bold;
}

/* Custom row styling */
:deep(.v-data-table__tr:hover) {
  background-color: #f5f5f5 !important;
}

/* Chip styling */
:deep(.v-chip) {
  font-weight: 500;
  text-transform: uppercase;
}

/* Mobile Header Card */
.mobile-header-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-field-mobile {
  margin-top: 8px;
}

/* Mobile MVO Cards */
.mobile-mvo-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #ffffff;
}

.mobile-mvo-card:hover {
  border-color: #FFD700;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
}

.mobile-card-expanded {
  border-color: #FFD700 !important;
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3) !important;
}

.mobile-card-header {
  padding: 16px !important;
}

.mobile-mvo-name {
  font-size: 16px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.mobile-mvo-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.mobile-card-details {
  padding: 16px !important;
  background-color: #f8f9fa;
}

.detail-label {
  font-weight: bold;
  color: #333;
  font-size: 14px;
  margin-bottom: 4px;
}

.detail-value {
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  display: flex;
  align-items: center;
}

/* Icon rotation animation */
.rotate-180 {
  transform: rotate(180deg);
}

.transition-all {
  transition: transform 0.3s ease;
}

/* Mobile Pagination */
.mobile-pagination {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.custom-pagination :deep(.v-pagination__item) {
  background-color: #f5f5f5;
  color: #333;
}

.custom-pagination :deep(.v-pagination__item--is-active) {
  background-color: #FFD700 !important;
  color: #000 !important;
}

/* Loading state styling */
:deep(.v-progress-circular) {
  color: #FFD700 !important;
}

:deep(.v-progress-linear) {
  border-radius: 4px;
}

/* Responsive breakpoints */
@media (max-width: 960px) {
  .mobile-mvo-preview .v-chip {
    font-size: 10px;
  }
}

@media (max-width: 600px) {
  .mobile-mvo-card {
    margin-left: 8px;
    margin-right: 8px;
  }

  .mobile-header-card {
    margin-left: 8px;
    margin-right: 8px;
  }

  .detail-label,
  .detail-value {
    font-size: 12px;
  }

  .mobile-mvo-name {
    font-size: 14px;
  }
}
</style>