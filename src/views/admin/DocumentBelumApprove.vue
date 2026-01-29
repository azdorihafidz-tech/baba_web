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
        <v-data-table <v-data-table class="bg-grey-lighten-4 text-no-wrap" hover :headers="datatable.headers"
          :items="filteredItems" :search="datatable.search" :loading="isTableLoading">
          <template v-slot:item.mvo_code="{ item }">
            {{ getMvoCode(item.mvo_id) }}
          </template>
          <template v-slot:item.mvo_nama="{ item }">
            {{ getMvoNama(item.mvo_id) }}
          </template>
          <template v-slot:item.file_path="{ item }">
            <div class="d-flex align-center">
              <!-- Image Preview -->
              <div v-if="isImageFile(item.file_path)" class="mr-3">
                <v-img :src="getFullFileUrl(item.file_path)" width="50" height="50" class="rounded"
                  @error="handleImageError" />
              </div>
              <!-- PDF Icon -->
              <div v-else-if="isPdfFile(item.file_path)" class="mr-3">
                <v-icon size="50" color="red">mdi-file-pdf-box</v-icon>
              </div>
              <!-- Other File Icon -->
              <div v-else class="mr-3">
                <v-icon size="50" color="blue">mdi-file-document</v-icon>
              </div>
              <!-- File Info and Actions -->
              <div>
                <div class="text-caption">{{ item.file_name }}</div>
                <v-btn size="x-small" color="primary" variant="text" @click="viewFile(item.file_path)"
                  class="pa-0 ma-0">
                  <v-icon size="16" class="mr-1">mdi-eye</v-icon>
                  View
                </v-btn>
                <v-btn size="x-small" color="success" variant="text"
                  @click="downloadFile(item.file_path, item.file_name)" class="pa-0 ma-0 ml-2">
                  <v-icon size="16" class="mr-1">mdi-download</v-icon>
                  Download
                </v-btn>
              </div>
            </div>
          </template>
          <!-- Template for pointbintang -->
          <template v-slot:item.pointbintang="{ item }">
            {{ item.pointbintang || '-' }}
          </template>
          <!-- Template for status_inputan with color coding -->
          <template v-slot:item.status_inputan="{ item }">
            <v-chip :color="getStatusColor(item.status_inputan)" size="small" variant="flat">
              {{ getStatusText(item.status_inputan) }}
            </v-chip>
          </template>

          <!-- Status Admin (Approval 2) -->
          <template v-slot:item.status_inputan_2="{ item }">
            <v-chip
              :color="item.status_inputan_2?.toLowerCase() === 'approved' ? 'success' : (item.status_inputan?.toLowerCase() === 'approved' ? 'warning' : 'grey')"
              size="small" variant="flat">
              <template v-if="item.status_inputan_2?.toLowerCase() === 'approved'">
                Disetujui
              </template>
              <template v-else-if="item.status_inputan?.toLowerCase() === 'approved'">
                Menunggu
              </template>
              <template v-else>
                Pending MVO
              </template>
            </v-chip>
          </template>
          <!-- Template for actions -->
          <template v-slot:item.actions="{ item }">
            <div class="d-flex justify-center align-center">

              <!-- Edit Button -->
              <v-btn v-if="canEditDocument(item)" size="small" color="red" variant="elevated" class="mr-2"
                @click="openEditDialog(item)" :disabled="isButtonLoading">
                <v-icon size="16" class="mr-1">mdi-pencil</v-icon>
                Edit
              </v-btn>

              <!-- Approve Button -->
              <v-btn v-if="canApproveDocument(item)" size="small" :color="getApproveButtonColor(item)"
                variant="elevated" @click="approveDocument(item)" :disabled="isButtonLoading">
                <v-icon size="16" class="mr-1">mdi-check-circle</v-icon>
                {{ getApproveButtonText() }}
              </v-btn>

              <v-chip v-else :color="getApproveButtonColor(item)" size="small" variant="flat">
                <v-icon size="16" class="mr-1">mdi-check</v-icon>
                {{ getApprovedChipText() }}
              </v-chip>

            </div>
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
      <v-icon size="64" color="grey">mdi-file-document-outline</v-icon>
      <p class="text-grey mt-2">
        <template v-if="otoritas === 'mvo'">
          Tidak ada dokumen yang menunggu approval MVO
        </template>
        <template v-else-if="otoritas === 'superadmin'">
          Tidak ada dokumen yang menunggu approval Admin
        </template>
        <template v-else>
          Tidak ada dokumen ditemukan
        </template>
      </p>
    </div>

    <v-card v-for="(item, index) in paginatedMobileItems" :key="item.id" class="mobile-document-card mb-3"
      @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">
      <!-- Header Card - Always Visible -->
      <v-card-text class="mobile-card-header">
        <v-row no-gutters align="center">
          <v-col cols="1" class="text-center">
            <span class="mobile-number">{{ ((currentMobilePage - 1) * itemsPerMobilePage) + index + 1 }}</span>
          </v-col>

          <v-col cols="9" class="pl-3">
            <div class="mobile-document-name">
              <strong>{{ item.file_name || 'File Tidak Tersedia' }}</strong>
            </div>
            <div class="mobile-document-preview">
              <v-chip color="primary" size="x-small" variant="flat" class="mr-1 mb-1">
                {{ getMvoCode(item.mvo_id) }}
              </v-chip>

              <!-- Status MVO -->
              <v-chip :color="getStatusColor(item.status_inputan)" size="x-small" variant="flat" class="mr-1 mb-1">
                {{ getStatusText(item.status_inputan) }}
              </v-chip>

              <!-- Status Admin (hanya untuk superadmin) -->
              <v-chip v-if="otoritas === 'superadmin'"
                :color="item.status_inputan_2?.toLowerCase() === 'approved' ? 'success' : 'warning'" size="x-small"
                variant="flat" class="mr-1 mb-1">
                Admin: {{ item.status_inputan_2?.toLowerCase() === 'approved' ? 'OK' : 'Pending' }}
              </v-chip>

              <v-chip v-if="item.pointbintang" color="warning" size="x-small" variant="flat" class="mr-1 mb-1">
                {{ item.pointbintang }} Poin
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
                <strong>Kode Akun:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                <v-chip color="primary" size="small" variant="flat">
                  {{ getMvoCode(item.mvo_id) }}
                </v-chip>
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>Nama Akun:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                {{ getMvoNama(item.mvo_id) }}
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>Nama File:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                {{ item.file_name || '-' }}
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>Poin/Bintang:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                <v-chip v-if="item.pointbintang" color="warning" size="small" variant="flat">
                  {{ item.pointbintang }} Poin
                </v-chip>
                <span v-else>-</span>
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="6" class="detail-label">
                <strong>Status MVO:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                <v-chip :color="getStatusColor(item.status_inputan)" size="small" variant="flat">
                  {{ getStatusText(item.status_inputan) }}
                </v-chip>
              </v-col>
            </v-row>

            <!-- Status Admin Row - TAMBAH INI (hanya untuk superadmin) -->
            <v-row class="mb-3" v-if="otoritas === 'superadmin'">
              <v-col cols="6" class="detail-label">
                <strong>Status Admin:</strong>
              </v-col>
              <v-col cols="6" class="detail-value">
                <v-chip
                  :color="item.status_inputan_2?.toLowerCase() === 'approved' ? 'success' : (item.status_inputan?.toLowerCase() === 'approved' ? 'warning' : 'grey')"
                  size="small" variant="flat">
                  <template v-if="item.status_inputan_2?.toLowerCase() === 'approved'">
                    Disetujui
                  </template>
                  <template v-else-if="item.status_inputan?.toLowerCase() === 'approved'">
                    Menunggu
                  </template>
                  <template v-else>
                    Pending MVO
                  </template>
                </v-chip>
              </v-col>
            </v-row>
            <!-- File Preview Section -->
            <v-row class="mb-3">
              <v-col cols="12">
                <div class="detail-label mb-2">
                  <strong>Preview File:</strong>
                </div>
                <div class="file-preview-mobile d-flex align-center">
                  <!-- Image Preview -->
                  <div v-if="isImageFile(item.file_path)" class="mr-3">
                    <v-img :src="getFullFileUrl(item.file_path)" width="60" height="60" class="rounded border"
                      @error="handleImageError" />
                  </div>
                  <!-- PDF Icon -->
                  <div v-else-if="isPdfFile(item.file_path)" class="mr-3 text-center">
                    <v-icon size="60" color="red">mdi-file-pdf-box</v-icon>
                  </div>
                  <!-- Other File Icon -->
                  <div v-else class="mr-3 text-center">
                    <v-icon size="60" color="blue">mdi-file-document</v-icon>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex-grow-1">
                    <v-btn size="small" color="primary" variant="outlined" @click="viewFile(item.file_path)"
                      class="mb-2 mr-2" block>
                      <v-icon size="16" class="mr-1">mdi-eye</v-icon>
                      View File
                    </v-btn>
                    <v-btn size="small" color="success" variant="outlined"
                      @click="downloadFile(item.file_path, item.file_name)" block>
                      <v-icon size="16" class="mr-1">mdi-download</v-icon>
                      Download
                    </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- Action Section -->
            <v-row class="mb-3">
              <v-col cols="12">
                <div class="detail-label mb-2">
                  <strong>Aksi:</strong>
                </div>
                <div class="action-buttons-mobile d-flex gap-2">
                  <!-- Edit Button Mobile -->
                  <v-btn v-if="canEditDocument(item)" color="warning" variant="elevated" @click="openEditDialog(item)"
                    :disabled="isButtonLoading" class="flex-grow-1">
                    <v-icon size="16" class="mr-1">mdi-pencil</v-icon>
                    Edit
                  </v-btn>

                  <!-- Approve Button Mobile -->
                  <v-btn v-if="canApproveDocument(item)" :color="getApproveButtonColor(item)" variant="elevated"
                    @click="approveDocument(item)" :disabled="isButtonLoading" class="flex-grow-1">
                    <v-icon size="16" class="mr-1">mdi-check-circle</v-icon>
                    {{ getApproveButtonText() }}
                  </v-btn>
                  <v-chip v-else :color="getApproveButtonColor(item)" size="large" variant="flat"
                    class="w-100 justify-center">
                    <v-icon size="16" class="mr-1">mdi-check</v-icon>
                    {{ getApprovedChipText() }}
                  </v-chip>
                </div>
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

  <!-- Dialog untuk View File -->
  <v-dialog v-model="isShowFileDialog" max-width="800px">
    <v-card>
      <v-card-title class="dialog-header">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-file-eye</v-icon>
        <span class="dialog-title">PREVIEW FILE</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="isShowFileDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-0">
        <div v-if="previewFile.type === 'image'" class="text-center">
          <v-img :src="previewFile.url" max-height="600" contain />
        </div>
        <div v-else-if="previewFile.type === 'pdf'" class="text-center">
          <iframe :src="previewFile.url" width="100%" height="600px" style="border: none;"></iframe>
        </div>
        <div v-else class="text-center pa-4">
          <v-icon size="100" color="grey">mdi-file-document</v-icon>
          <div class="mt-4">File tidak dapat di-preview. Silakan download untuk melihat.</div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Dialog Edit Document -->
  <v-dialog v-model="isShowEditDialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="edit-dialog-header">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-pencil</v-icon>
        <span class="dialog-title">EDIT DOKUMEN BELUM APPROVE</span>
      </v-card-title>
      <v-card-text class="pa-6">
        <v-form ref="editForm" v-model="isEditFormValid">
          <v-row>
            <!-- MVO Account -->
            <!-- <v-col cols="12">
              <v-select v-model="editModel.mvo_id" :items="mvoOptions" item-title="code" item-value="id"
                label="Pilih Akun MVO" variant="outlined" :rules="[v => !!v || 'Akun MVO harus dipilih']" />
            </v-col> -->

            <!-- File Name -->
            <v-col cols="12">
              <v-text-field v-model="editModel.file_name" label="Nama File" variant="outlined"
                :rules="[v => !!v || 'Nama file harus diisi']" />
            </v-col>

            <!-- Point Bintang -->
            <v-col cols="12">
              <v-text-field v-model="editModel.pointbintang" label="Poin Bintang (0-5)" type="number" min="0" max="5"
                variant="outlined" :rules="[v => v >= 0 && v <= 5 || 'Poin harus antara 0-5']" />
            </v-col>

            <!-- File Upload -->
            <v-col cols="12">
              <v-file-input v-model="editModel.file_path" label="Upload File Baru (Opsional)" variant="outlined"
                prepend-icon="mdi-paperclip" show-size accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" :clearable="false">
                <template v-slot:selection="{ fileNames }">
                  <v-chip v-for="fileName in fileNames" :key="fileName" size="small" class="me-2">
                    {{ fileName }}
                  </v-chip>
                </template>
              </v-file-input>
              <div class="text-caption text-grey">
                * Biarkan kosong jika tidak ingin mengganti file
              </div>
            </v-col>

            <!-- Current File Preview -->
            <v-col cols="12" v-if="editModel.current_file_path">
              <div class="text-caption mb-2">File Saat Ini:</div>
              <div class="d-flex align-center">
                <div v-if="isImageFile(editModel.current_file_path)" class="mr-3">
                  <v-img :src="getFullFileUrl(editModel.current_file_path)" width="50" height="50" class="rounded" />
                </div>
                <div v-else-if="isPdfFile(editModel.current_file_path)" class="mr-3">
                  <v-icon size="50" color="red">mdi-file-pdf-box</v-icon>
                </div>
                <div v-else class="mr-3">
                  <v-icon size="50" color="blue">mdi-file-document</v-icon>
                </div>
                <div class="text-caption">{{ getFileNameFromPath(editModel.current_file_path) }}</div>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-center pa-4">
        <v-btn color="grey-darken-1" variant="outlined" @click="closeEditDialog" :disabled="isButtonLoading"
          class="mr-2">
          <v-icon size="16" class="mr-1">mdi-close</v-icon>
          Batal
        </v-btn>
        <v-btn color="warning" variant="elevated" @click="saveEditDocument" :loading="isButtonLoading"
          :disabled="!isEditFormValid">
          <v-icon size="16" class="mr-1">mdi-content-save</v-icon>
          Simpan Perubahan
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Konfirmasi Approve -->
  <v-dialog v-model="isShowDialogApprove" max-width="500px" persistent>
    <v-card>
      <v-card-title class="approve-dialog-header">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-check-circle</v-icon>
        <span class="dialog-title">KONFIRMASI APPROVE</span>
      </v-card-title>
      <v-card-text class="text-center pa-6">
        <v-icon size="80" color="warning" class="mb-4">mdi-help-circle-outline</v-icon>
        <div class="text-h6 mb-2">Apakah Anda yakin?</div>
        <div class="text-body-2 text-grey-darken-1">
          <template v-if="otoritas === 'mvo'">
            Dokumen yang sudah di-approve akan diteruskan ke Admin untuk approval kedua.
          </template>
          <template v-else-if="otoritas === 'superadmin'">
            Dokumen yang sudah di-approve Admin tidak dapat dibatalkan.
          </template>
          <template v-else>
            Dokumen yang sudah di-approve tidak dapat dibatalkan.
          </template>
        </div>
      </v-card-text>
      <v-card-actions class="justify-center pa-4">
        <v-btn color="grey-darken-1" variant="outlined" @click="isShowDialogApprove = false" :disabled="isButtonLoading"
          class="mr-2">
          <v-icon size="16" class="mr-1">mdi-close</v-icon>
          Batal
        </v-btn>
        <v-btn color="success" variant="elevated" @click="confirmApproveDocument(modelApprove)"
          :loading="isButtonLoading">
          <v-icon size="16" class="mr-1">mdi-check</v-icon>
          Ya, Approve
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

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
  name: 'MvoDocumentPage',
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
      currentMobilePage: 1,
      itemsPerMobilePage: 5,

      contentSnackbar: {
        snackbar: false,
        text: "",
        color: "",
      },

      title: "DATA DOKUMEN AKUN - BELUM DISETUJUI",
      itemsBreadcrumb: [
        {
          title: "Dashboard",
          disabled: false,
          href: "/admin/dashboard",
        },
        {
          title: "Document",
          disabled: false,
          href: "/admin/mvo-document",
        },
      ],

      isShowFileDialog: false,
      isShowEditDialog: false,
      isShowDialogApprove: false,
      isButtonLoading: false,
      isEditFormValid: false,

      modelApprove: {
        id: null,
        pointbintang: null
      },

      editModel: {
        id: null,
        mvo_id: null,
        file_name: '',
        pointbintang: null,
        file_path: null,
        current_file_path: ''
      },

      datatable: {
        search: "",
        headers: [
          { key: "mvo_code", title: "Kode Akun" },
          { key: "mvo_nama", title: "Nama Akun" },
          { key: "file_name", title: "Nama File" },
          { key: "pointbintang", title: "Poin Per Bintang", align: "center" },
          { key: "status_inputan", title: "Status MVO", align: "center" },
          { key: "status_inputan_2", title: "Status Admin", align: "center" },
          { key: "file_path", title: "File Preview", sortable: false, width: "250px" },
          { key: "actions", title: "Actions", sortable: false, align: "center", width: "200px" },
        ],
        items: [],
      },

      isTableLoading: true,
      mvoOptions: [],
      mvoNamaOptions: [],

      previewFile: {
        url: '',
        type: '',
        name: ''
      },
      otoritas: "",
    };
  },

  computed: {
    filteredItems() {
      let filtered = this.datatable.items;

      if (this.otoritas === 'mvo') {
        filtered = filtered.filter(item => {
          const status = item.status_inputan?.toLowerCase();
          return status !== 'approved';
        });
      } else if (this.otoritas === 'superadmin') {
        filtered = filtered.filter(item => {
          const status1 = item.status_inputan?.toLowerCase();
          const status2 = item.status_inputan_2?.toLowerCase();
          return status1 === 'approved' && (!status2 || status2 !== 'approved');
        });
      }

      if (this.datatable.search) {
        const searchTerm = this.datatable.search.toLowerCase();
        filtered = filtered.filter(item => {
          const mvoCode = this.getMvoCode(item.mvo_id);
          const mvoNama = this.getMvoNama(item.mvo_id);

          return (
            (item.file_name && item.file_name.toLowerCase().includes(searchTerm)) ||
            (mvoCode && mvoCode.toLowerCase().includes(searchTerm)) ||
            (mvoNama && mvoNama.toLowerCase().includes(searchTerm)) ||
            (item.pointbintang && item.pointbintang.toString().includes(searchTerm))
          );
        });
      }

      return filtered;
    },

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
    // Edit Document Methods
    canEditDocument(item) {
      // MVO bisa edit sebelum approve
      if (this.otoritas === 'mvo') {
        return item.status_inputan?.toLowerCase() !== 'approved';
      }
      // Superadmin bisa edit sebelum approve final
      if (this.otoritas === 'superadmin') {
        return item.status_inputan_2?.toLowerCase() !== 'approved';
      }
      return false;
    },

    openEditDialog(item) {
      this.editModel = {
        id: item.id,
        mvo_id: item.mvo_id,
        file_name: item.file_name,
        pointbintang: item.pointbintang,
        file_path: null,
        current_file_path: item.file_path
      };
      this.isShowEditDialog = true;
    },

    closeEditDialog() {
      this.isShowEditDialog = false;
      this.editModel = {
        id: null,
        mvo_id: null,
        file_name: '',
        pointbintang: null,
        file_path: null,
        current_file_path: ''
      };
      if (this.$refs.editForm) {
        this.$refs.editForm.resetValidation();
      }
    },

    async saveEditDocument() {
      const token = Cookies.get("token");
      if (!token) {
        await this.$router.push({ name: "Login" });
        return;
      }

      this.isButtonLoading = true;

      const formData = new FormData();
      formData.append('mvo_id', this.editModel.mvo_id);
      formData.append('file_name', this.editModel.file_name);
      formData.append('pointbintang', this.editModel.pointbintang);

      // Append file only if new file is selected
      if (this.editModel.file_path) {
        formData.append('file_path', this.editModel.file_path);
      }

      try {
        const response = await axios.post(
          `https://babaapi.babaparfume.id/api/mvo-document/${this.editModel.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        await this.getAllDocuments();
        this.showSnackbar(response.data.message || "Dokumen berhasil diperbarui");
        this.closeEditDialog();
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error memperbarui dokumen", 'error');
      } finally {
        this.isButtonLoading = false;
      }
    },

    getFileNameFromPath(filePath) {
      if (!filePath) return '';
      return filePath.split('/').pop() || filePath;
    },

    toggleMobileDetail(itemId) {
      if (this.expandedMobileCard === itemId) {
        this.expandedMobileCard = null;
      } else {
        this.expandedMobileCard = itemId;
      }
    },

    getStatusColor(status) {
      switch (status?.toLowerCase()) {
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
      switch (status?.toLowerCase()) {
        case 'approved':
          return 'Disetujui';
        case 'pending':
          return 'Menunggu';
        case 'rejected':
          return 'Ditolak';
        default:
          return status || 'Belum Disetujui';
      }
    },

    getMvoCode(mvoId) {
      const mvo = this.mvoOptions.find(item => item.id == mvoId);
      return mvo ? mvo.code : 'Unknown';
    },

    getMvoNama(mvoId) {
      const mvo = this.mvoNamaOptions.find(item => item.id == mvoId);
      return mvo ? mvo.nama : 'Unknown';
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
      if (!filePath) return '';
      return `https://babaapi.babaparfume.id/project/public/${filePath}`;
    },

    handleImageError(event) {
      event.target.src = '/placeholder-image.png';
    },

    viewFile(filePath) {
      const fullUrl = this.getFullFileUrl(filePath);

      if (this.isImageFile(filePath)) {
        this.previewFile = {
          url: fullUrl,
          type: 'image',
          name: filePath
        };
      } else if (this.isPdfFile(filePath)) {
        this.previewFile = {
          url: fullUrl,
          type: 'pdf',
          name: filePath
        };
      } else {
        this.previewFile = {
          url: fullUrl,
          type: 'other',
          name: filePath
        };
      }

      this.isShowFileDialog = true;
    },

    downloadFile(filePath, fileName) {
      const fullUrl = this.getFullFileUrl(filePath);
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = fileName || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    // Approve methods
    approveDocument(item) {
      this.isShowDialogApprove = true;
      this.modelApprove.id = item.id;
      this.modelApprove.pointbintang = item.pointbintang;
    },

    async confirmApproveDocument(model) {
      const token = Cookies.get("token");
      if (!token) {
        await this.$router.push({ name: "Login" });
        return;
      }

      this.isButtonLoading = true;

      let endpoint = '';
      let successMessage = '';
      let requestData = {};

      if (this.otoritas === 'mvo') {
        endpoint = `https://babaapi.babaparfume.id/api/mvo-documents/${model.id}/approve`;
        successMessage = "Dokumen berhasil disetujui oleh MVO";
        if (model.pointbintang) {
          requestData.pointbintang = model.pointbintang;
        }
      } else if (this.otoritas === 'superadmin') {
        endpoint = `https://babaapi.babaparfume.id/api/superadmin/${model.id}/approvedoc`;
        successMessage = "Dokumen berhasil disetujui oleh Superadmin";
      } else {
        this.showSnackbar("Anda tidak memiliki akses untuk approve", 'error');
        this.isButtonLoading = false;
        this.isShowDialogApprove = false;
        return;
      }

      try {
        const response = await axios.put(endpoint, requestData, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            'Content-Type': 'application/json',
          },
        });

        await this.getAllDocuments();
        this.showSnackbar(response.data.message || successMessage);
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error approving document", 'error');
      } finally {
        this.isButtonLoading = false;
        this.isShowDialogApprove = false;
      }
    },

    canApproveDocument(document) {
      if (this.otoritas === 'mvo') {
        return document.status_inputan?.toLowerCase() !== 'approved';
      } else if (this.otoritas === 'superadmin') {
        return document.status_inputan?.toLowerCase() === 'approved' &&
          document.status_inputan_2?.toLowerCase() !== 'approved';
      }
      return false;
    },

    getApproveButtonColor(document) {
      if (this.otoritas === 'mvo') {
        return document.status_inputan?.toLowerCase() === 'approved' ? 'success' : 'green';
      } else if (this.otoritas === 'superadmin') {
        return document.status_inputan_2?.toLowerCase() === 'approved' ? 'success' : 'green';
      }
      return 'grey';
    },

    getApproveButtonText() {
      return this.otoritas === 'mvo' ? 'Approve MVO' : 'Approve';
    },

    getApprovedChipText() {
      return this.otoritas === 'mvo' ? 'Sudah Disetujui MVO' : 'Sudah Disetujui Admin';
    },

    updatePageTitle() {
      if (this.otoritas === 'mvo') {
        this.title = "DATA DOKUMEN AKUN - MENUNGGU APPROVAL MVO";
      } else if (this.otoritas === 'superadmin') {
        this.title = "DATA DOKUMEN AKUN - MENUNGGU APPROVAL ADMIN";
      } else {
        this.title = "DATA DOKUMEN AKUN";
      }
    },

    showSnackbar(message, type = 'success') {
      this.contentSnackbar.snackbar = true;
      this.contentSnackbar.text = message;
      this.contentSnackbar.color = type === 'success' ? this.app.colors.primary : this.app.colors.secondary;
    },

    // API methods
    async getAllMvo() {
      const token = Cookies.get("token");
      if (!token) {
        await this.$router.push({ name: "Login" });
        return;
      }

      try {
        const response = await axios.get("https://babaapi.babaparfume.id/api/mvo", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === "success") {
          this.mvoOptions = response.data.data;
          this.mvoNamaOptions = response.data.data;
        }
      } catch (error) {
        console.error("Error fetching:", error);
        this.showSnackbar("Error loading data", 'error');
      }
    },

    async getAllDocuments() {
      const token = Cookies.get("token");
      if (!token) {
        await this.$router.push({ name: "Login" });
        return;
      }

      this.isTableLoading = true;

      try {
        const response = await axios.get("https://babaapi.babaparfume.id/api/mvo-document", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === "success") {
          this.datatable.items = response.data.data;
        } else {
          this.showSnackbar(response.data.message || "Error loading documents", 'error');
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error loading documents", 'error');
      } finally {
        this.isTableLoading = false;
      }
    },
  },

  async created() {
    this.otoritas = localStorage.getItem("otoritas") || "";
    this.updatePageTitle();
    await this.getAllDocuments();
    await this.getAllMvo();
  },

  watch: {
    'datatable.search': {
      handler() {
        this.expandedMobileCard = null;
        this.currentMobilePage = 1;
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

/* Custom Dialog Styling */
.dialog-header {
  background: linear-gradient(135deg, #1a1a1a 30%, #b8941f 80%, #d4af37 100%) !important;
  color: #FFD700 !important;
  padding: 20px 24px !important;
  border-bottom: 2px solid #FFD700;
  font-weight: bold;
  font-size: 18px;
  text-align: center;
}

.approve-dialog-header {
  background: linear-gradient(135deg, #1a1a1a 30%, #2e7d32 80%, #4caf50 100%) !important;
  color: #FFD700 !important;
  padding: 20px 24px !important;
  border-bottom: 2px solid #4caf50;
  font-weight: bold;
  font-size: 18px;
  text-align: center;
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

/* Mobile Document Cards */
.mobile-document-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
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

.mobile-document-name {
  font-size: 16px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 4px;
  word-break: break-word;
}

.mobile-document-preview {
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

/* File Preview Mobile Styling */
.file-preview-mobile {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  min-height: 80px;
}

.file-preview-mobile .v-img {
  border: 2px solid #e0e0e0;
  border-radius: 4px;
}

/* Action Buttons Mobile */
.action-buttons-mobile {
  width: 100%;
}

.action-buttons-mobile .v-btn {
  height: 40px;
}

.action-buttons-mobile .v-chip {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Chip styling */
:deep(.v-chip) {
  font-weight: 500;
  text-transform: uppercase;
}

/* Custom row styling for desktop */
:deep(.v-data-table__tr:hover) {
  background-color: #f5f5f5 !important;
}

/* File preview section styling */
.border {
  border: 1px solid #e0e0e0 !important;
}

/* Button styling improvements */
.v-btn.v-btn--block {
  width: 100%;
}

/* Responsive breakpoints */
@media (max-width: 960px) {
  .mobile-document-preview .v-chip {
    font-size: 10px;
  }

  .detail-label,
  .detail-value {
    font-size: 13px;
  }
}

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

  .file-preview-mobile {
    padding: 8px;
  }

  .action-buttons-mobile .v-btn {
    height: 36px;
    font-size: 12px;
  }

  .action-buttons-mobile .v-chip {
    height: 36px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .mobile-card-header {
    padding: 12px !important;
  }

  .mobile-card-details {
    padding: 12px !important;
  }

  .mobile-document-name {
    font-size: 13px;
  }

  .file-preview-mobile .v-img {
    width: 50px !important;
    height: 50px !important;
  }

  .file-preview-mobile .v-icon {
    font-size: 50px !important;
  }
}
</style>