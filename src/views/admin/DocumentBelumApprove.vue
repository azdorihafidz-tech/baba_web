<template>
  <div class="pending-approval-management">
    <Breadcrumb :items="itemsBreadcrumb" />

    <!-- Export Button (optional) -->
    <v-btn class="text-white ml-2 font-semibold export-btn" @click="exportExcel" v-if="mvo_type_id === 'superadmin'">
      <v-icon start style="color: #FFD700;">mdi-file-export</v-icon>
      <span class="ml-2">Excel</span>
    </v-btn>

    <!-- Desktop View - Data Table -->
    <div class="d-none d-md-block">
      <CardDataTable :title="title">
        <template v-slot:search>
          <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Search" single-line
            hide-details variant="outlined" class="search-field" />
        </template>

        <template v-slot:datatable>
          <v-data-table class="bg-grey-lighten-4 text-no-wrap custom-data-table" hover :headers="datatable.headers"
            :items="datatable.items" :search="datatable.search" :loading="isTableLoading" :items-per-page="10"
            @update:options="updateCurrentPageInfo">

            <template v-slot:item.no="{ index }">
              {{ ((currentPage - 1) * itemsPerPage) + index + 1 }}
            </template>

            <template v-slot:item.mvo_code="{ item }">
              {{ getMvoCodeById(item.mvo_id) }}
            </template>

            <template v-slot:item.star_number="{ item }">
              <v-chip color="amber" text-color="white" size="small">
                <v-icon start size="small">mdi-star</v-icon>
                {{ item.pointbintang || 0 }}
              </v-chip>
            </template>

            <template v-slot:item.star_icon="{ item }">
              <div class="d-flex justify-center">
                <v-icon v-for="n in 8" :key="n" :color="n <= (item.pointbintang || 0) ? '#FFD700' : '#e0e0e0'"
                  size="small">
                  mdi-star
                </v-icon>
              </div>
            </template>

            <template v-slot:item.status_inputan="{ item }">
              <v-chip :color="getStatusColor(item.status_inputan)" size="small" variant="flat">
                {{ getStatusText(item.status_inputan) }}
              </v-chip>
            </template>

            <!-- NEW: Status MVO Column -->
            <template v-slot:item.status_mvo="{ item }">
              <v-chip :color="getMvoStatusColor(item)" size="small" variant="flat" class="text-caption">
                {{ getMvoStatusText(item) }}
              </v-chip>
            </template>

            <!-- NEW: Status Regional Column -->
            <template v-slot:item.status_regional="{ item }">
              <v-chip :color="getRegionalStatusColor(item)" size="small" variant="flat" class="text-caption">
                {{ getRegionalStatusText(item) }}
              </v-chip>
            </template>

            <template v-slot:item.approval_status="{ item }">
              <v-chip :color="getApprovalStatusColor(item)" size="small" variant="flat" class="text-caption">
                {{ getApprovalStatusText(item) }}
              </v-chip>
            </template>

            <template v-slot:item.file_path="{ item }">
              <div class="d-flex align-center">
                <div v-if="isImageFile(item.file_path)" class="mr-3">
                  <v-img :src="getFullFileUrl(item.file_path)" width="40" height="40" class="rounded" />
                </div>
                <div v-else-if="isPdfFile(item.file_path)" class="mr-3">
                  <v-icon size="40" color="red">mdi-file-pdf-box</v-icon>
                </div>
                <div v-else class="mr-3">
                  <v-icon size="40" color="blue">mdi-file-document</v-icon>
                </div>
                <div>
                  <div class="text-caption">{{ item.file_name }}</div>
                  <div class="d-flex">
                    <v-btn size="x-small" color="success" variant="text"
                      @click="downloadFile(item.file_path, item.file_name)" class="pa-0 ma-0 ml-2">
                      <v-icon size="14" class="mr-1">mdi-download</v-icon>
                      Download
                    </v-btn>
                    <v-btn size="x-small" color="primary" variant="text" @click="viewFile(item.file_path)"
                      class="pa-0 ma-0 ml-2">
                      <v-icon size="14" class="mr-1">mdi-eye</v-icon>
                      Lihat
                    </v-btn>
                  </div>
                </div>
              </div>
            </template>

            <template v-slot:item.upline_1="{ item }">
              {{ item.upline_1 || '-' }}
            </template>

            <template v-slot:item.upline_2="{ item }">
              {{ item.upline_2 || '-' }}
            </template>


            <!-- Actions column untuk tombol Approve -->
            <!-- Actions column untuk tombol Approve -->
            <template v-slot:item.actions="{ item }">
              <v-btn v-if="canApproveDocument(item)" size="small" color="success" @click="approveDocument(item)"
                :loading="approvingId === item.id" :disabled="approvingId === item.id">
                <v-icon start size="small">mdi-check-circle</v-icon>
                Approve
              </v-btn>
              <v-chip v-else-if="isDocumentFullyApproved(item)" size="small" color="success" variant="flat">
                <v-icon start size="small">mdi-check-circle</v-icon>
                Sudah Approve
              </v-chip>
              <v-chip v-else size="small" color="grey" variant="flat">
                <v-icon start size="small">mdi-information</v-icon>
                Menunggu
              </v-chip>
            </template>
          </v-data-table>
        </template>
      </CardDataTable>
    </div>

    <!-- Mobile View - Cards -->
    <div class="d-block d-md-none">
      <v-card class="mobile-header-card mb-4">
        <v-card-text>
          <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Cari dokumen..." single-line
            hide-details variant="outlined" class="search-field-mobile" />
        </v-card-text>
      </v-card>

      <v-progress-linear v-if="isTableLoading" indeterminate color="#FFD700" class="mb-4"></v-progress-linear>

      <div v-if="filteredItems.length === 0 && !isTableLoading" class="text-center pa-4">
        <v-icon size="64" color="grey">mdi-file-document-off</v-icon>
        <p class="text-grey mt-2">Tidak ada dokumen belum approval</p>
      </div>

      <v-card v-for="(item, index) in filteredItems" :key="item.id" class="mobile-document-card mb-3"
        @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">

        <!-- Header Card - Always Visible -->
        <v-card-text class="mobile-card-header">
          <v-row no-gutters align="center">
            <v-col cols="2" class="text-center">
              <span class="mobile-number">{{ index + 1 }}</span>
            </v-col>

            <v-col cols="8" class="pl-3">
              <div class="mobile-document-name">
                <strong>{{ item.file_name }}</strong>
              </div>
              <div class="mobile-document-code">
                <strong>{{ getMvoCodeById(item.mvo_id) }}</strong>
              </div>
              <div class="mobile-status-preview mt-1">
                <v-chip :color="getStatusColor(item.status_inputan)" size="x-small" variant="flat">
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

              <!-- File Preview Section -->
              <div class="mobile-info-section mb-3">
                <h4 class="text-subtitle-2 mb-2 text-primary">
                  <v-icon size="16" class="mr-1">mdi-file</v-icon>
                  File Preview
                </h4>
                <div class="d-flex align-center">
                  <div v-if="isImageFile(item.file_path)" class="mr-3">
                    <v-img :src="getFullFileUrl(item.file_path)" width="60" height="60" class="rounded" />
                  </div>
                  <div v-else-if="isPdfFile(item.file_path)" class="mr-3">
                    <v-icon size="60" color="red">mdi-file-pdf-box</v-icon>
                  </div>
                  <div v-else class="mr-3">
                    <v-icon size="60" color="blue">mdi-file-document</v-icon>
                  </div>
                </div>
              </div>

              <!-- Document Info Section -->
              <div class="mobile-info-section mb-3">
                <h4 class="text-subtitle-2 mb-2 text-primary">
                  <v-icon size="16" class="mr-1">mdi-information</v-icon>
                  Informasi Dokumen
                </h4>
                <v-row class="mb-2">
                  <v-col cols="5" class="detail-label">Kode MVO:</v-col>
                  <v-col cols="7" class="detail-value">{{ getMvoCodeById(item.mvo_id) }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="5" class="detail-label">Rating Star:</v-col>
                  <v-col cols="7" class="detail-value">
                    <v-chip color="amber" text-color="white" size="x-small">
                      <v-icon start size="small">mdi-star</v-icon>
                      {{ item.pointbintang || 0 }}
                    </v-chip>
                  </v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="12" class="detail-label mb-1">Visualisasi Star:</v-col>
                  <v-col cols="12">
                    <div class="star-display">
                      <v-icon v-for="n in 8" :key="n" :color="n <= (item.pointbintang || 0) ? '#FFD700' : '#e0e0e0'"
                        size="small">
                        mdi-star
                      </v-icon>
                    </div>
                  </v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="5" class="detail-label">Tanggal Input:</v-col>
                  <v-col cols="7" class="detail-value">{{ formatDate(item.tanggal_repeat_order) }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="5" class="detail-label">Range Point:</v-col>
                  <v-col cols="7" class="detail-value">{{ item.repeat_order || '-' }}</v-col>
                </v-row>
              </div>

              <!-- Upline Section -->
              <div class="mobile-info-section mb-3">
                <h4 class="text-subtitle-2 mb-2 text-primary">
                  <v-icon size="16" class="mr-1">mdi-account-supervisor</v-icon>
                  Informasi Upline
                </h4>
                <v-row class="mb-2">
                  <v-col cols="5" class="detail-label">MVO:</v-col>
                  <v-col cols="7" class="detail-value">{{ item.upline_1 || '-' }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="5" class="detail-label">Regional:</v-col>
                  <v-col cols="7" class="detail-value">{{ item.upline_2 || '-' }}</v-col>
                </v-row>
              </div>

              <!-- Status Section -->
              <div class="mobile-info-section mb-3">
                <h4 class="text-subtitle-2 mb-2 text-primary">
                  <v-icon size="16" class="mr-1">mdi-check-decagram</v-icon>
                  Status
                </h4>
                <v-row class="mb-2">
                  <v-col cols="5" class="detail-label">Status MVO:</v-col>
                  <v-col cols="7" class="detail-value">
                    <v-chip :color="getMvoStatusColor(item)" size="x-small" variant="flat">
                      {{ getMvoStatusText(item) }}
                    </v-chip>
                  </v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="5" class="detail-label">Status Regional:</v-col>
                  <v-col cols="7" class="detail-value">
                    <v-chip :color="getRegionalStatusColor(item)" size="x-small" variant="flat">
                      {{ getRegionalStatusText(item) }}
                    </v-chip>
                  </v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="5" class="detail-label">Approval:</v-col>
                  <v-col cols="7" class="detail-value">
                    <v-chip :color="getApprovalStatusColor(item)" size="x-small" variant="flat">
                      {{ getApprovalStatusText(item) }}
                    </v-chip>
                  </v-col>
                </v-row>
              </div>

              <!-- Action Buttons -->
              <v-divider class="mb-3"></v-divider>
              <div class="mobile-actions">
                <v-btn size="small" color="success" @click.stop="downloadFile(item.file_path, item.file_name)"
                  class="mr-1 mb-2" prepend-icon="mdi-download">
                  Download
                </v-btn>
                <v-btn size="small" color="primary" @click.stop="viewFile(item.file_path)" class="mb-2"
                  prepend-icon="mdi-eye">
                  Lihat File
                </v-btn>

                <!-- Tombol Approve untuk Mobile -->
                <v-btn v-if="canApproveDocument(item)" size="small" color="success" @click.stop="approveDocument(item)"
                  :loading="approvingId === item.id" :disabled="approvingId === item.id" class="mb-2"
                  prepend-icon="mdi-check-circle">
                  Approve
                </v-btn>
              </div>
            </v-card-text>
          </div>
        </v-expand-transition>
      </v-card>
    </div>

    <!-- Snackbar -->
    <v-snackbar v-model="contentSnackbar.snackbar" :color="contentSnackbar.color">
      {{ contentSnackbar.text }}
    </v-snackbar>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDialog.show" max-width="500">
      <v-card>
        <v-card-title class="text-h6 bg-warning text-white">
          <v-icon start>mdi-alert</v-icon>
          Konfirmasi Approval
        </v-card-title>
        <v-card-text class="pt-4">
          <p class="text-body-1 mb-3">Apakah Anda yakin ingin menyetujui dokumen ini?</p>
          <div class="bg-grey-lighten-4 pa-3 rounded">
            <p class="mb-1"><strong>Nama File:</strong> {{ confirmDialog.document?.file_name }}</p>
            <p class="mb-1"><strong>Kode MVO:</strong> {{ getMvoCodeById(confirmDialog.document?.mvo_id) }}</p>
            <p class="mb-0"><strong>Anda Login Sebagai:</strong> {{ getLoggedInMvoCode() }}</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="confirmDialog.show = false" :disabled="confirmDialog.loading">
            Batal
          </v-btn>
          <v-btn color="success" variant="flat" @click="confirmApprove" :loading="confirmDialog.loading">
            <v-icon start>mdi-check</v-icon>
            Ya, Setujui
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import CardDataTable from "@/components/ui/CardDataTable.vue";
import { useAppStore } from "@/stores/app.js";
import axios from "axios";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";

export default {
  name: "PendingApprovalDocuments",
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
      expandedMobileCard: null,
      allMvoData: [],
      contentSnackbar: {
        snackbar: false,
        text: "",
        color: "",
      },
      mvo_type_id: "",
      mvo_id: "", // ID MVO user yang login
      title: "DOKUMEN BELUM APPROVAL",
      itemsBreadcrumb: [
        {
          title: "Dashboard",
          disabled: false,
          href: "/admin/dashboard",
        },
        {
          title: "Dokumen Belum Approval",
          disabled: false,
          href: "/admin/document-belum-approve",
        },
      ],

      // State management
      isTableLoading: true,
      approvingId: null, // Track which document is being approved

      // Confirmation Dialog
      confirmDialog: {
        show: false,
        document: null,
        loading: false,
      },

      // Pagination
      currentPage: 1,
      itemsPerPage: 10,

      // Data models
      datatable: {
        search: "",
        headers: [
          { key: "no", title: "No", sortable: false },
          { key: "mvo_code", title: "Kode MVO" },
          { key: "file_name", title: "Nama File" },
          { key: "star_number", title: "Bintang", align: "center" },
          { key: "star_icon", title: "Rating Star", sortable: false, align: "center" },
          { key: "tanggal_repeat_order", title: "Tanggal Input", align: "center" },
          { key: "repeat_order", title: "Range Point", align: "center" },
          { key: "status_mvo", title: "Status MVO", align: "center", width: "150px" },
          { key: "status_regional", title: "Status Regional", align: "center", width: "150px" },
          { key: "approval_status", title: "Status Approval", align: "center", width: "200px" },
          { key: "upline_1", title: "MVO" },
          { key: "upline_2", title: "Regional" },
          { key: "file_path", title: "File Preview", sortable: false, width: "200px" },
          { key: "actions", title: "Actions", sortable: false, align: "center", width: "150px" },
        ],
        items: [],
      },
    };
  },

  computed: {
    filteredItems() {
      if (!this.datatable.search) {
        return this.datatable.items;
      }

      const searchTerm = this.datatable.search.toLowerCase();
      return this.datatable.items.filter(item => {
        return (
          (item.file_name && item.file_name.toLowerCase().includes(searchTerm)) ||
          (this.getMvoCodeById(item.mvo_id) && this.getMvoCodeById(item.mvo_id).toLowerCase().includes(searchTerm)) ||
          (item.upline_1 && item.upline_1.toLowerCase().includes(searchTerm)) ||
          (item.upline_2 && item.upline_2.toLowerCase().includes(searchTerm)) ||
          (item.upline_3 && item.upline_3.toLowerCase().includes(searchTerm))
        );
      });
    }
  },

  methods: {
    isDocumentFullyApproved(item) {
      // Jika status_inputan sudah approved, berarti sudah fully approved
      return item.status_inputan?.toLowerCase() === 'approved';
    },
    toggleMobileDetail(itemId) {
      if (this.expandedMobileCard === itemId) {
        this.expandedMobileCard = null;
      } else {
        this.expandedMobileCard = itemId;
      }
    },

    updateCurrentPageInfo(options) {
      this.currentPage = options.page;
      this.itemsPerPage = options.itemsPerPage;
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('id-ID');
    },

    showSnackbar(message, color = 'primary') {
      this.contentSnackbar.snackbar = true;
      this.contentSnackbar.text = message;
      this.contentSnackbar.color = color === 'primary' ? this.app.colors.primary : this.app.colors.secondary;
    },

    getAuthHeaders() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return null;
      }
      return {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
    },

    async getPendingApprovalDocuments() {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isTableLoading = true;
      try {
        const response = await axios.get("https://babaapi.babaparfume.id/api/mvo-document", { headers });

        if (response.data.status === "success") {
          this.datatable.items = response.data.data || [];
        } else {
          this.showSnackbar(response.data.message || "Error loading data", "error");
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error loading data", "error");
      } finally {
        this.isTableLoading = false;
      }
    },

    async getAllMvo() {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      try {
        const response = await axios.get("https://babaapi.babaparfume.id/api/mvo", { headers });
        if (response.data.status === "success") {
          this.allMvoData = response.data.data;

          // Debug: cari MVO dengan ID yang login
          const loggedInMvo = this.allMvoData.find(item => item.code === this.mvo_id);
        }
      } catch (error) {
      }
    },

    exportExcel() {
      const exportData = this.datatable.items.map((item, index) => ({
        'No': index + 1,
        'Kode MVO': this.getMvoCodeById(item.mvo_id),
        'Nama File': item.file_name,
        'Rating Star': item.pointbintang || 0,
        'Tanggal Input': this.formatDate(item.tanggal_repeat_order),
        'Range Point': item.repeat_order || '-',
        'Status MVO': this.getMvoStatusText(item),
        'Status Regional': this.getRegionalStatusText(item),
        'Status Approval': this.getApprovalStatusText(item),
        'MVO': item.upline_1 || '-',
        'Regional': item.upline_2 || '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Pending Approval Documents");
      XLSX.writeFile(workbook, `Dokumen_Pending_Approval_${new Date().toISOString().split('T')[0]}.xlsx`);
    },

    getMvoCodeById(mvoId) {
      const mvo = this.allMvoData.find(item => item.id == mvoId);
      return mvo ? mvo.code : 'Unknown';
    },

    getStatusColor(status) {
      if (!status) return 'warning';
      switch (status.toLowerCase()) {
        case 'approved': return 'success';
        case 'pending': return 'warning';
        case 'rejected': return 'error';
        default: return 'warning';
      }
    },

    getStatusText(status) {
      if (!status) return 'Pending Approval';
      switch (status.toLowerCase()) {
        case 'approved': return 'Disetujui';
        case 'pending': return 'Menunggu';
        case 'rejected': return 'Ditolak';
        default: return 'Pending Approval';
      }
    },

    getMvoTypeLabel(mvoType) {
      const labels = {
        'mvo': 'MVO',
        'regional': 'Regional',
      };
      return labels[mvoType?.toLowerCase()] || mvoType;
    },

    /**
     * NEW METHOD: Get MVO Status
     */
    getMvoStatusText(item) {
      // Cek apakah ada upline_1 (MVO)
      if (!item.upline_1) {
        return 'Tidak Ada MVO';
      }

      // Cek status approval MVO (upline_1)
      if (item.approval_doc_upline_1 === null) {
        return 'Menunggu Approval';
      } else {
        return 'Sudah Disetujui';
      }
    },

    getMvoStatusColor(item) {
      if (!item.upline_1) {
        return 'grey';
      }

      if (item.approval_doc_upline_1 === null) {
        return 'warning';
      } else {
        return 'success';
      }
    },

    /**
     * NEW METHOD: Get Regional Status
     */
    getRegionalStatusText(item) {
      // Cek apakah ada upline_2 (Regional)
      if (!item.upline_2) {
        return 'Tidak Ada Regional';
      }

      // Cek status approval Regional (upline_2)
      if (item.approval_doc_upline_2 === null) {
        return 'Menunggu Approval';
      } else {
        return 'Sudah Disetujui';
      }
    },

    getRegionalStatusColor(item) {
      if (!item.upline_2) {
        return 'grey';
      }

      if (item.approval_doc_upline_2 === null) {
        return 'warning';
      } else {
        return 'success';
      }
    },

    /**
     * Mendapatkan kode MVO user yang sedang login
     */
    getLoggedInMvoCode() {

      // Di localStorage, mvo_id sudah berupa code (MVO-JKT-001)
      // Jadi langsung return saja
      return this.mvo_id;
    },

    /**
     * Mendapatkan label level berdasarkan nomor level
     */
    getLevelLabel(level) {
      const labels = {
        1: 'MVO',
        2: 'Regional',
      };
      return labels[level] || `Level ${level}`;
    },

    /**
     * UPDATED METHOD: Get approval status text
     * Logika baru: Jika MVO dan Regional sudah approve, tampilkan "Menunggu Approval Admin"
     */
    getApprovalStatusText(item) {
      // Jika sudah fully approved oleh admin
      if (item.status_inputan?.toLowerCase() === 'approved') {
        return 'Sudah Disetujui';
      }

      // Cek apakah MVO dan Regional sudah approve semua
      const mvoApproved = !item.upline_1 || item.approval_doc_upline_1 === 1;
      const regionalApproved = !item.upline_2 || item.approval_doc_upline_2 === 1;

      // Jika MVO dan Regional sudah approve semua, berarti menunggu admin
      if (mvoApproved && regionalApproved) {
        return 'Menunggu Approval Admin';
      }

      // Cari level tertinggi yang ada (tidak null) dari upline
      let highestLevel = 0;
      for (let level = 7; level >= 1; level--) {
        if (item[`upline_${level}`]) {
          highestLevel = level;
          break;
        }
      }

      // Loop dari level tertinggi ke terendah untuk cek approval
      for (let level = highestLevel; level >= 1; level--) {
        const approvalField = `approval_doc_upline_${level}`;
        const uplineField = `upline_${level}`;

        // Jika upline ada dan approval masih null
        if (item[uplineField] && item[approvalField] === null) {
          return `Menunggu Approval ${this.getLevelLabel(level)}`;
        }
      }

      // Jika semua sudah approve tapi status_inputan belum diupdate, tetap menunggu admin
      return 'Menunggu Approval Admin';
    },

    /**
     * UPDATED METHOD: Get approval status color
     */
    getApprovalStatusColor(item) {
      if (item.status_inputan?.toLowerCase() === 'approved') {
        return 'success';
      }

      // Cek apakah MVO dan Regional sudah approve semua
      const mvoApproved = !item.upline_1 || item.approval_doc_upline_1 === 1;
      const regionalApproved = !item.upline_2 || item.approval_doc_upline_2 === 1;

      // Jika sudah approve semua, menunggu admin (gunakan warna info/biru)
      if (mvoApproved && regionalApproved) {
        return 'info';
      }

      // Cari level tertinggi yang ada
      let highestLevel = 0;
      for (let level = 7; level >= 1; level--) {
        if (item[`upline_${level}`]) {
          highestLevel = level;
          break;
        }
      }

      // Cari level yang sedang menunggu approval
      for (let level = highestLevel; level >= 1; level--) {
        const approvalField = `approval_doc_upline_${level}`;
        const uplineField = `upline_${level}`;

        if (item[uplineField] && item[approvalField] === null) {
          return 'warning';
        }
      }

      return 'info';
    },

    isImageFile(filePath) {
      if (!filePath) return false;
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
      return imageExtensions.some(ext => filePath.toLowerCase().includes(ext));
    },

    isPdfFile(filePath) {
      if (!filePath) return false;
      return filePath.toLowerCase().includes('.pdf');
    },

    getFullFileUrl(filePath) {
      return `https://babaapi.babaparfume.id/project/public/${filePath}`;
    },

    viewFile(filePath) {
      const fullUrl = this.getFullFileUrl(filePath);
      window.open(fullUrl, '_blank');
    },

    downloadFile(filePath, fileName) {
      const fullUrl = this.getFullFileUrl(filePath);
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    /**
     * Approval Logic - TIDAK DIUBAH
     */
    canApproveDocument(item) {
      // Jika sudah approved semua, tidak bisa approve lagi
      if (item.status_inputan?.toLowerCase() === 'approved') {
        return false;
      }

      // Ambil kode MVO user yang login
      const loggedInMvoCode = this.getLoggedInMvoCode();

      if (!loggedInMvoCode) {
        return false;
      }

      // Cari level tertinggi yang ada (tidak null) dari upline
      let highestLevel = 0;
      for (let level = 7; level >= 1; level--) {
        if (item[`upline_${level}`]) {
          highestLevel = level;
          break;
        }
      }


      // Loop dari level tertinggi ke terendah untuk cek approval
      for (let level = highestLevel; level >= 1; level--) {
        const approvalField = `approval_doc_upline_${level}`;
        const uplineField = `upline_${level}`;


        // Jika upline ada dan approval masih null
        if (item[uplineField] && item[approvalField] === null) {
          // IMPORTANT: Extract code dari upline
          // Format: "MVO-JKT-001 - Rudi Hartono" → "MVO-JKT-001"
          const uplineCode = item[uplineField].split(' - ')[0].trim();


          // Cek apakah user yang login adalah orang di level ini
          if (uplineCode === loggedInMvoCode) {
            return true;
          } else {
            // Bukan giliran user ini
            return false;
          }
        }

        // Jika approval sudah ada, lanjut ke level berikutnya (ke bawah)
      }

      // Jika semua sudah approve
      return false;
    },

    /**
     * Menampilkan konfirmasi sebelum approve
     */
    approveDocument(item) {
      this.confirmDialog.document = item;
      this.confirmDialog.show = true;
    },

    /**
     * Proses approval setelah konfirmasi - TIDAK DIUBAH
     */
    async confirmApprove() {
      const item = this.confirmDialog.document;
      if (!item) return;

      this.confirmDialog.loading = true;
      this.approvingId = item.id;

      const headers = this.getAuthHeaders();
      if (!headers) {
        this.confirmDialog.loading = false;
        this.approvingId = null;
        return;
      }

      try {
        const documentMvoCode = this.getMvoCodeById(item.mvo_id); // Code dari dokumen
        const loggedInMvoCode = this.getLoggedInMvoCode(); // Code user yang login
        const documentId = item.id;


        // Validasi data sebelum kirim
        if (!documentMvoCode || documentMvoCode === 'Unknown') {
          this.showSnackbar("Error: Kode MVO dokumen tidak valid", "error");
          this.confirmDialog.loading = false;
          this.approvingId = null;
          return;
        }

        if (!loggedInMvoCode) {
          this.showSnackbar("Error: Kode MVO user tidak valid", "error");
          this.confirmDialog.loading = false;
          this.approvingId = null;
          return;
        }

        if (!documentId) {
          this.showSnackbar("Error: ID dokumen tidak valid", "error");
          this.confirmDialog.loading = false;
          this.approvingId = null;
          return;
        }

        // IMPORTANT: Berdasarkan API Postman, 'code' adalah code dari USER YANG LOGIN
        // bukan code dari dokumen!
        const formData = new FormData();
        formData.append('code', loggedInMvoCode); // Gunakan code user yang login
        formData.append('id', String(documentId));

        for (let pair of formData.entries()) {
        }

        // Kirim request ke API dengan FormData
        const response = await axios.post(
          "https://babaapi.babaparfume.id/api/approveDokumen",
          formData,
          {
            headers: {
              ...headers,
              'Content-Type': 'multipart/form-data'
            }
          }
        );


        if (response.data.status === "success") {
          this.showSnackbar("Dokumen berhasil disetujui!", "success");
          this.contentSnackbar.color = "success";

          // Reload data untuk update tabel
          await this.getPendingApprovalDocuments();

          // Tutup dialog
          this.confirmDialog.show = false;
        } else {
          this.showSnackbar(response.data.message || "Gagal menyetujui dokumen", "error");
        }
      } catch (error) {

        const errorMessage = error.response?.data?.message ||
          error.response?.data?.error ||
          "Terjadi kesalahan saat menyetujui dokumen";

        this.showSnackbar(errorMessage, "error");
      } finally {
        this.confirmDialog.loading = false;
        this.approvingId = null;
      }
    },
  },

  async created() {
    this.mvo_type_id = localStorage.getItem("mvo_type_id") || "";
    this.mvo_id = localStorage.getItem("mvo_id") || ""; // Ambil mvo_id dari localStorage


    // Load MVO data first, then load documents
    await this.getAllMvo();
    await this.getPendingApprovalDocuments();

    // Check each document
    this.datatable.items.forEach((item, index) => {
      const canApprove = this.canApproveDocument(item);
    });
  },
};
</script>

<style scoped>
/* Star display styling */
.star-display {
  display: flex;
  gap: 2px;
}

/* Desktop star column */
:deep(.v-data-table) .v-icon.mdi-star {
  font-size: 16px;
  margin: 0 1px;
}

/* Mobile star styling */
.mobile-card-details .star-display .v-icon {
  font-size: 14px;
}

.pending-approval-management {
  padding: 16px;
}

.export-btn {
  background: linear-gradient(135deg, #000000, #1a1a1a);
  color: #FFD700;
  border: 2px solid #FFD700;
  border-radius: 12px;
  padding: 10px 18px;
  margin-bottom: 20px;
}

:deep(.custom-data-table) {
  border: 1px solid #000000;
}

:deep(.custom-data-table .v-data-table__th) {
  background-color: #888888 !important;
  color: #FFD700 !important;
  font-weight: bold;
}

:deep(.custom-data-table .v-data-table__td) {
  background-color: #ffffff !important;
  color: #1a1a1a !important;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 16px !important;
}

:deep(.custom-data-table .v-data-table__tr:hover) {
  background-color: #f8f9fa !important;
}

/* Mobile Cards Styles */
.mobile-header-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-field-mobile {
  margin-top: 8px;
}

.mobile-document-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  background: #ffffff;
}

.mobile-document-card:hover {
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

.mobile-number {
  font-weight: bold;
}

.mobile-document-name {
  font-size: 16px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.mobile-document-code {
  font-size: 12px;
  color: #9e9e9e;
}

.mobile-status-preview {
  margin-top: 4px;
}

.mobile-card-details {
  padding: 16px !important;
  background-color: #f8f9fa;
}

.mobile-info-section {
  background-color: transparent;
  padding: 0;
  border: none;
  margin-bottom: 16px;
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

.mobile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rotate-180 {
  transform: rotate(180deg);
}

.transition-all {
  transition: all 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .mobile-document-card {
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

  .mobile-document-name {
    font-size: 14px;
  }

  .mobile-actions .v-btn {
    font-size: 12px;
    padding: 0 8px;
  }
}

:deep(.v-progress-circular) {
  color: #FFD700 !important;
}

:deep(.v-progress-linear) {
  border-radius: 4px;
}
</style>
