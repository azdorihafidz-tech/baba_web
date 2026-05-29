<template>
  <Breadcrumb :items="itemsBreadcrumb" />
  <v-btn class="text-white font-semibold mb-4" @click="showDialogFormAddDocument()" style="
    background: linear-gradient(135deg, #000000, #1a1a1a);
    color: #FFD700;
    border: 2px solid #FFD700;
    border-radius: 12px;
    padding: 10px 18px;
  ">
    <v-icon start style="color: #FFD700;">mdi-pen-plus</v-icon>
    <span class="ml-2">Tambah Dokumen Akun</span>
  </v-btn>



  <!-- Desktop View - Data Table -->
  <div class="d-none d-md-block">
    <CardDataTable :title="title">
      <template v-slot:search>
        <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Search" single-line
          hide-details variant="outlined" class="search-field" />
      </template>
      <template v-slot:datatable>
        <v-data-table class="bg-grey-lighten-4 text-no-wrap" hover :headers="datatable.headers" :items="datatable.items"
          :search="datatable.search" :loading="isTableLoading">
          <template v-slot:item.mvo_code="{ item }">
            {{ getMvoCode(item.mvo_id) }}
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
          <template v-slot:item.action="{ item }">
            <v-tooltip text="Edit" color="#1976D2" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" color="primary" @click="showDialogFormEditDocument(item)" class="mr-2 mb-2"
                  v-bind="props" icon>
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <!-- Approve Button -->
            <v-tooltip v-if="item.status_inputan !== 'approved'" text="Approve" color="#2E7D32" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" color="success" @click="approveDocument(item.id)" class="mr-2 mb-2" v-bind="props"
                  icon>
                  <v-icon>mdi-check-circle</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Hapus" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" :color="app.colors.secondary" @click="deleteDocument(item.id)" class="mr-2 mb-2"
                  v-bind="props" icon>
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
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
      <v-icon size="64" color="grey">mdi-file-search</v-icon>
      <p class="text-grey mt-2">Tidak ada dokumen ditemukan</p>
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
            <div class="mobile-mvo-code">
              <strong>MVO:</strong> {{ getMvoCode(item.mvo_id) }}
            </div>
            <div class="mobile-status-preview">
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
            <v-row class="mb-3">
              <v-col cols="12">
                <div class="mobile-file-preview">
                  <div class="d-flex align-center">
                    <!-- Image Preview -->
                    <div v-if="isImageFile(item.file_path)" class="mr-3">
                      <v-img :src="getFullFileUrl(item.file_path)" width="60" height="60"
                        class="rounded mobile-preview-img" @error="handleImageError" />
                    </div>
                    <!-- PDF Icon -->
                    <div v-else-if="isPdfFile(item.file_path)" class="mr-3">
                      <v-icon size="60" color="red">mdi-file-pdf-box</v-icon>
                    </div>
                    <!-- Other File Icon -->
                    <div v-else class="mr-3">
                      <v-icon size="60" color="blue">mdi-file-document</v-icon>
                    </div>
                    <!-- File Actions -->
                    <div class="flex-grow-1">
                      <div class="text-caption mb-2">{{ item.file_name }}</div>
                      <div class="d-flex">
                        <v-btn size="x-small" color="primary" variant="outlined" @click.stop="viewFile(item.file_path)"
                          class="mr-1" density="comfortable">
                          <v-icon size="14" class="mr-1">mdi-eye</v-icon>
                          View
                        </v-btn>
                        <v-btn size="x-small" color="success" variant="outlined"
                          @click.stop="downloadFile(item.file_path, item.file_name)" density="comfortable">
                          <v-icon size="14" class="mr-1">mdi-download</v-icon>
                          Download
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- Document Details -->
            <v-row class="mb-2">
              <v-col cols="5" class="detail-label">MVO Code:</v-col>
              <v-col cols="7" class="detail-value">{{ getMvoCode(item.mvo_id) || '-' }}</v-col>
            </v-row>
            <v-row class="mb-2">
              <v-col cols="5" class="detail-label">Poin Bintang:</v-col>
              <v-col cols="7" class="detail-value">{{ item.pointbintang || '-' }}</v-col>
            </v-row>
            <v-row class="mb-2">
              <v-col cols="5" class="detail-label">Status:</v-col>
              <v-col cols="7">
                <v-chip :color="getStatusColor(item.status_inputan)" size="small" variant="flat">
                  {{ getStatusText(item.status_inputan) }}
                </v-chip>
              </v-col>
            </v-row>

            <!-- Action Buttons -->
            <v-divider class="mb-3"></v-divider>
            <div class="mobile-actions">
              <v-btn size="small" color="primary" @click.stop="showDialogFormEditDocument(item)" class="mr-2 mb-2"
                prepend-icon="mdi-pencil">
                Edit
              </v-btn>
              <v-btn v-if="item.status_inputan !== 'approved'" size="small" color="success"
                @click.stop="approveDocument(item.id)" class="mr-2 mb-2" prepend-icon="mdi-check-circle">
                Approve
              </v-btn>
              <v-btn size="small" :color="app.colors.secondary" @click.stop="deleteDocument(item.id)" class="mb-2"
                prepend-icon="mdi-delete">
                Hapus
              </v-btn>
            </div>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>
  </div>

  <!-- Dialog Tambah Dokumen MVO -->
  <v-dialog v-model="isShowDialogAdd" persistent :width="$vuetify.display.mobile ? '95%' : '700'">
    <v-card class="custom-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-plus-circle</v-icon>
        <span class="dialog-title">TAMBAH DOKUMEN</span>
      </v-card-title>

      <v-card-text class="dialog-content">
        <!-- 1. MVO -->
        <v-row>
          <v-col cols="12">
            <v-autocomplete label="MVO Code" v-model="selectedMvo"
              :items="mvoOptions.filter(mvo => mvo.code.includes('MVO'))" item-title="code" item-value="id" clearable
              outlined :loading="isMvoLoading" @update:model-value="onMvoSelected" />
          </v-col>
        </v-row>

        <!-- 2. Dist Code -->
        <v-row>
          <v-col cols="12">
            <v-autocomplete label="Dist Code" v-model="selectedDist" :items="distOptions" item-title="code"
              item-value="id" clearable outlined @update:model-value="onDistSelected" />
          </v-col>
        </v-row>

        <!-- 3. FO Code -->
        <v-row>
          <v-col cols="12">
            <v-autocomplete label="FO Code" v-model="selectedFo" :items="foOptions" item-title="code" item-value="id"
              clearable outlined />
          </v-col>
        </v-row>

        <!-- Nama File -->
        <v-row>
          <v-col cols="12">
            <v-text-field label="Nama File" v-model="modelAdd.file_name" class="mb-2" />
          </v-col>
        </v-row>

        <!-- Poin Per Bintang -->
        <v-row>
          <v-col cols="12">
            <v-text-field label="Poin Per Bintang" v-model="modelAdd.pointbintang" type="number" min="0" max="5"
              step="1" class="mb-2" hint="Masukkan poin yang diberikan per bintang (maksimal 5)" persistent-hint
              :rules="[v => !v || (v >= 0 && v <= 5) || 'Poin harus antara 0-5']" />
          </v-col>
        </v-row>

        <!-- Upload File -->
        <v-row>
          <v-col cols="12">
            <v-file-input label="Upload File" v-model="modelAdd.file" class="mb-2"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" @change="handleFileChange" />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.secondary" @click="isShowDialogAdd = false" class="ml-2">
          Batal
        </v-btn>
        <v-btn :color="app.colors.primary" @click="addDocument()" :loading="isButtonLoading" class="ml-2">
          Simpan
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Delete Confirmation -->
  <v-dialog v-model="isShowDialogDelete" :max-width="$vuetify.display.mobile ? '95%' : '500px'">
    <v-card :color="app.colors.background">
      <v-card-title class="text-h5">Apakah anda yakin ingin menghapus dokumen ini?</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.primary" @click="isShowDialogDelete = false">
          Cancel
        </v-btn>
        <v-btn :color="app.colors.secondary" @click="confirmDeleteDocument(modelDelete.id)" :loading="isButtonLoading">
          OK
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Approve Confirmation -->
  <v-dialog v-model="isShowDialogApprove" :max-width="$vuetify.display.mobile ? '95%' : '500px'">
    <v-card :color="app.colors.background">
      <v-card-title class="text-h5">Apakah anda yakin ingin approve dokumen ini?</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.primary" @click="isShowDialogApprove = false">
          Cancel
        </v-btn>
        <v-btn color="success" @click="confirmApproveDocument(modelApprove.id)" :loading="isButtonLoading">
          Approve
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog untuk View File -->
  <v-dialog v-model="isShowFileDialog" :max-width="$vuetify.display.mobile ? '95%' : '800px'">
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
          <v-img :src="previewFile.url" :max-height="$vuetify.display.mobile ? 300 : 600" contain />
        </div>
        <div v-else-if="previewFile.type === 'pdf'" class="text-center">
          <iframe :src="previewFile.url" width="100%" :height="$vuetify.display.mobile ? '400px' : '600px'"
            style="border: none;"></iframe>
        </div>
        <div v-else class="text-center pa-4">
          <v-icon size="100" color="grey">mdi-file-document</v-icon>
          <div class="mt-4">File tidak dapat di-preview. Silakan download untuk melihat.</div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Dialog Edit Dokumen MVO -->
  <v-dialog v-model="isShowDialogEdit" persistent :width="$vuetify.display.mobile ? '95%' : '700'">
    <v-card class="custom-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-pencil-circle</v-icon>
        <span class="dialog-title">EDIT DOKUMEN</span>
      </v-card-title>

      <v-card-text class="dialog-content">
        <!-- 1. MVO -->
        <v-row>
          <v-col cols="12">
            <v-autocomplete label="MVO Code" v-model="selectedMvoEdit"
              :items="mvoOptions.filter(mvo => mvo.code.includes('MVO'))" item-title="code" item-value="id" clearable
              outlined :loading="isMvoLoading" @update:model-value="onMvoSelectedEdit" />
          </v-col>
        </v-row>

        <!-- 2. Dist Code -->
        <v-row>
          <v-col cols="12">
            <v-autocomplete label="Dist Code" v-model="selectedDistEdit" :items="distOptionsEdit" item-title="code"
              item-value="id" clearable outlined @update:model-value="onDistSelectedEdit" />
          </v-col>
        </v-row>

        <!-- 3. FO Code -->
        <v-row>
          <v-col cols="12">
            <v-autocomplete label="FO Code" v-model="selectedFoEdit" :items="foOptionsEdit" item-title="code"
              item-value="id" clearable outlined @update:model-value="onFoSelectedEdit" />
          </v-col>
        </v-row>

        <!-- Nama File -->
        <v-row>
          <v-col cols="12">
            <v-text-field label="Nama File" v-model="modelEdit.file_name" class="mb-2" />
          </v-col>
        </v-row>

        <!-- Poin Per Bintang -->
        <v-row>
          <v-col cols="12">
            <v-text-field label="Poin Per Bintang" v-model="modelEdit.pointbintang" type="number" min="0" max="5"
              step="1" class="mb-2" hint="Masukkan poin yang diberikan per bintang (maksimal 5)" persistent-hint
              :rules="[v => !v || (v >= 0 && v <= 5) || 'Poin harus antara 0-5']" />
          </v-col>
        </v-row>

        <!-- Current File Info -->
        <v-row v-if="modelEdit.current_file_path">
          <v-col cols="12">
            <v-card class="mb-3 pa-3" color="grey-lighten-4">
              <v-card-title class="text-subtitle-2 pa-0">File Saat Ini:</v-card-title>
              <div class="d-flex align-center mt-2">
                <!-- Image Preview -->
                <div v-if="isImageFile(modelEdit.current_file_path)" class="mr-3">
                  <v-img :src="getFullFileUrl(modelEdit.current_file_path)" width="60" height="60" class="rounded"
                    @error="handleImageError" />
                </div>
                <!-- PDF Icon -->
                <div v-else-if="isPdfFile(modelEdit.current_file_path)" class="mr-3">
                  <v-icon size="60" color="red">mdi-file-pdf-box</v-icon>
                </div>
                <!-- Other File Icon -->
                <div v-else class="mr-3">
                  <v-icon size="60" color="blue">mdi-file-document</v-icon>
                </div>
                <!-- File Actions -->
                <div>
                  <v-btn size="small" color="primary" variant="text" @click="viewFile(modelEdit.current_file_path)"
                    class="pa-0 ma-0">
                    <v-icon size="16" class="mr-1">mdi-eye</v-icon>
                    View
                  </v-btn>
                  <v-btn size="small" color="success" variant="text"
                    @click="downloadFile(modelEdit.current_file_path, modelEdit.file_name)" class="pa-0 ma-0 ml-2">
                    <v-icon size="16" class="mr-1">mdi-download</v-icon>
                    Download
                  </v-btn>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Upload File Baru (Opsional) -->
        <v-row>
          <v-col cols="12">
            <v-file-input label="Upload File Baru (Opsional)" v-model="modelEdit.file" class="mb-2"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" @change="handleFileChangeEdit"
              hint="Biarkan kosong jika tidak ingin mengganti file" persistent-hint />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.secondary" @click="isShowDialogEdit = false; clearEditForm()" class="ml-2">
          Batal
        </v-btn>
        <v-btn :color="app.colors.primary" @click="updateDocument()" :loading="isButtonLoading" class="ml-2">
          Update
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
import CardForm from "@/components/ui/CardForm.vue";
import { useAppStore } from "@/stores/app.js";
import axios from "axios";
import Cookies from "js-cookie";

export default {
  name: 'MvoDocumentPage',
  components: {
    Breadcrumb,
    CardDataTable,
    CardForm,
  },

  setup() {
    const app = useAppStore();
    return { app };
  },

  data() {
    return {
      expandedMobileCard: null, // For mobile card expansion
      contentSnackbar: {
        snackbar: false,
        text: "",
        color: "",
      },

      title: "DATA DOKUMEN AKUN",
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
      isShowDialogAdd: false,
      isButtonLoading: false,
      isShowDialogDelete: false,
      isShowDialogApprove: false,
      isShowFileDialog: false,
      isMvoLoading: false,
      isFoLoading: false,

      selectedMvo: null,
      selectedDist: null,
      selectedFo: null,

      distOptions: [],
      foOptions: [],

      isShowDialogEdit: false,
      modelEdit: {
        id: "",
        mvo_id: "",
        file_name: "",
        file: null,
        pointbintang: "",
        current_file_path: "", // untuk menyimpan file path yang sudah ada
      },
      selectedMvoEdit: null,
      selectedDistEdit: null,
      selectedFoEdit: null,
      distOptionsEdit: [],
      foOptionsEdit: [],
      // FO Filter properties
      filteredMvoOptions: [],

      datatable: {
        search: "",
        headers: [
          { key: "mvo_code", title: "Kode Akun" },
          { key: "file_name", title: "Nama File" },
          { key: "pointbintang", title: "Poin Per Bintang", align: "center" },
          { key: "status_inputan", title: "Status", align: "center" },
          { key: "file_path", title: "File Preview", sortable: false, width: "250px" },
          { key: "action", title: "Actions", sortable: false, align: "center" },
        ],
        items: [],
      },
      modelAdd: {
        fo_id: "",
        file_name: "",
        file: null,
        pointbintang: "",
      },
      modelDelete: {
        id: "",
      },
      modelApprove: {
        id: "",
      },
      isTableLoading: true,
      mvoOptions: [],
      selectedMvoDetails: null,
      selectedMvoHierarchy: [],
      selectedHierarchy: [],

      addExpandedLevels: new Set(),

      previewFile: {
        url: '',
        type: '',
        name: ''
      },
    };
  },

  computed: {
    // Filtered items for mobile search
    filteredItems() {
      if (!this.datatable.search) {
        return this.datatable.items;
      }

      const searchTerm = this.datatable.search.toLowerCase();
      return this.datatable.items.filter(item => {
        const mvoCode = this.getMvoCode(item.mvo_id);
        return (
          (item.file_name && item.file_name.toLowerCase().includes(searchTerm)) ||
          (mvoCode && mvoCode.toLowerCase().includes(searchTerm)) ||
          (item.pointbintang && item.pointbintang.toString().includes(searchTerm)) ||
          (item.status_inputan && item.status_inputan.toLowerCase().includes(searchTerm))
        );
      });
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
          return status || 'Tidak Diketahui';
      }
    },

    // Dialog management
    showDialogFormAddDocument() {
      this.isShowDialogAdd = true;
      this.clearAddForm(); // Panggil clear form dulu
      this.getAllMvo();
      this.getAllFo();

      // Double check setelah clear
      setTimeout(() => {
      }, 100);
    },

    clearAddForm() {

      this.modelAdd = {
        fo_id: "",
        file_name: "",
        file: null,
        pointbintang: "",
      };

      // Reset selected values
      this.selectedMvo = null;
      this.selectedDist = null;
      this.selectedFo = null;

      // Reset options
      this.distOptions = [];
      this.foOptions = [];

      this.selectedMvoDetails = null;
      this.selectedMvoHierarchy = [];
      this.selectedHierarchy = [];
      this.addExpandedLevels = new Set();

    },

    // FO Filter Methods
    async getAllFo() {
      const token = Cookies.get("token");
      if (!token) {
        await this.$router.push({ name: "Login" });
        return;
      }

      this.isFoLoading = true;

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/mvo", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === "success") {
          // Filter to get only root level MVOs as FO options
          this.foOptions = response.data.data.filter(mvo => mvo.code.startsWith("FO"));
        } else {
          this.showSnackbar(response.data.message || "Error loading FO data", 'error');
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error loading FO data", 'error');
      } finally {
        this.isFoLoading = false;
      }
    },

    onFoSelected(foId) {
      this.selectedFo = foId;
      this.modelAdd.fo_id = foId;  // SET FO_ID


      if (!foId) {
        this.modelAdd.fo_id = "";
      }
    },

    clearFoFilter() {
      this.selectedFo = null;
      this.filteredMvoOptions = this.mvoOptions.filter(mvo => mvo.code.startsWith("DIST"));
    },

    filterMvoOptionsByFo(foId) {
      if (!foId) {
        this.filteredMvoOptions = this.mvoOptions.filter(mvo => mvo.code.startsWith("DIST"));
        return;
      }

      this.filteredMvoOptions = this.mvoOptions.filter(mvo => {
        return this.isMvoUnderFo(mvo, foId) && mvo.code.startsWith("DIST");
      });
    },

    isMvoUnderFo(mvo, foId) {
      let currentMvo = mvo;

      while (currentMvo) {
        if (currentMvo.id == foId) {
          return true;
        }

        if (!currentMvo.parent_id) {
          return currentMvo.id == foId;
        }

        currentMvo = this.mvoOptions.find(parentMvo => parentMvo.id == currentMvo.parent_id);
      }

      return false;
    },

    buildMvoHierarchy(mvoId) {
      const hierarchy = [];
      let currentMvo = this.mvoOptions.find(mvo => mvo.id == mvoId);

      while (currentMvo) {
        hierarchy.unshift(currentMvo); // push ke depan biar urut dari root → anak
        if (!currentMvo.parent_id) break;
        currentMvo = this.mvoOptions.find(mvo => mvo.id == currentMvo.parent_id);
      }

      this.selectedMvoHierarchy = hierarchy;
    },

    onMvoSelected(mvoId) {

      this.selectedMvo = mvoId;
      this.modelAdd.mvo_id = mvoId; // SINKRONKAN DENGAN modelAdd.mvo_id


      if (!mvoId) {
        this.distOptions = [];
        this.selectedDist = null;
        this.foOptions = [];
        this.selectedFo = null;
        this.modelAdd.mvo_id = ""; // Reset juga modelAdd.mvo_id
        return;
      }

      // Cari semua DIST yang parent_id sama dengan mvoId
      this.distOptions = this.mvoOptions.filter(mvo => mvo.parent_id == mvoId && mvo.code.startsWith('DIST'));

      // Reset pilihan DIST dan FO
      this.selectedDist = null;
      this.foOptions = [];
      this.selectedFo = null;
    },

    onDistSelected(distId) {
      this.selectedDist = distId;
      if (!distId) {
        this.foOptions = [];
        this.selectedFo = null;
        return;
      }
      // Cari semua FO yang parent_id sama dengan distId
      this.foOptions = this.mvoOptions.filter(mvo => mvo.parent_id == distId && mvo.code.startsWith('FO'));

      // Reset pilihan FO
      this.selectedFo = null;
    },

    // File handling methods
    handleFileChange(event) {
      if (event && event.length > 0) {
        this.modelAdd.file = event[0];
        if (!this.modelAdd.file_name) {
          this.modelAdd.file_name = event[0].name;
        }
      }
    },

    getMvoCode(mvoId) {
      const mvo = this.mvoOptions.find(item => item.id == mvoId);
      return mvo ? mvo.code : 'Unknown';
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
      return `http://127.0.0.1:8000/project/public/${filePath}`;
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

    // Utility methods
    showSnackbar(message, type = 'success') {
      this.contentSnackbar.snackbar = true;
      this.contentSnackbar.text = message;
      this.contentSnackbar.color = type === 'success' ? this.app.colors.primary : this.app.colors.secondary;
    },

    validateAddForm() {

      // Cek dengan detail
      // const foIdEmpty = !this.modelAdd.fo_id || this.modelAdd.fo_id === "" || this.modelAdd.fo_id === null || this.modelAdd.fo_id === undefined;

      // if (foIdEmpty) {
      //   this.showSnackbar("FO harus dipilih", 'error');
      //   return false;
      // }

      if (!this.modelAdd.file_name || this.modelAdd.file_name.trim() === "") {
        this.showSnackbar("Nama File harus diisi", 'error');
        return false;
      }

      if (!this.modelAdd.file) {
        this.showSnackbar("File harus dipilih", 'error');
        return false;
      }

      // Validasi poin per bintang maksimal 5
      if (this.modelAdd.pointbintang && (isNaN(this.modelAdd.pointbintang) || this.modelAdd.pointbintang < 0 || this.modelAdd.pointbintang > 5)) {
        this.showSnackbar("Poin Per Bintang harus berupa angka antara 0-5", 'error');
        return false;
      }

      return true;
    },

    // API methods
    async getAllMvo() {
      const token = Cookies.get("token");
      if (!token) {
        await this.$router.push({ name: "Login" });
        return;
      }

      this.isMvoLoading = true;

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/mvo", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === "success") {
          this.mvoOptions = response.data.data;

          // pisahkan sesuai prefix
          this.distOptions = [];
          this.foOptions = [];
        }
      } catch (error) {
      } finally {
        this.isMvoLoading = false;
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
        const response = await axios.get("http://127.0.0.1:8000/api/mvo-document", {
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

    async addDocument() {
      const token = Cookies.get("token");
      if (!token) {
        await this.$router.push({ name: "Login" });
        return;
      }

      if (!this.validateAddForm()) {
        return;
      }

      this.isButtonLoading = true;

      // Debug log sebelum kirim

      const formData = new FormData();
      formData.append('mvo_id', this.selectedFo || this.modelAdd.fo_id);
      formData.append('file_name', this.modelAdd.file_name);
      formData.append('file_path', this.modelAdd.file); // Sesuai dengan API request

      if (this.modelAdd.pointbintang && this.modelAdd.pointbintang !== "") {
        formData.append('pointbintang', this.modelAdd.pointbintang);
      }

      // Debug FormData
      for (let [key, value] of formData.entries()) {
      }

      try {
        const response = await axios.post("http://127.0.0.1:8000/api/mvo-document", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        await this.getAllDocuments();
        this.isShowDialogAdd = false;
        this.showSnackbar(response.data.message || "Dokumen MVO berhasil ditambah");
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Harap isi poin dengan nilai maksimal 5", 'error');
      } finally {
        this.isButtonLoading = false;
      }
    },

    deleteDocument(id) {
      this.expandedMobileCard = null; // Close mobile expansion
      this.isShowDialogDelete = true;
      this.modelDelete.id = id;
    },

    async confirmDeleteDocument(id) {
      const token = Cookies.get("token");
      if (!token) {
        await this.$router.push({ name: "Login" });
        return;
      }

      this.isButtonLoading = true;

      try {
        const response = await axios.delete(`http://127.0.0.1:8000/api/mvo-document/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        await this.getAllDocuments();
        this.showSnackbar(response.data.message || "Dokumen berhasil dihapus");
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error deleting document", 'error');
      } finally {
        this.isButtonLoading = false;
        this.isShowDialogDelete = false;
      }
    },

    approveDocument(id) {
      this.expandedMobileCard = null; // Close mobile expansion
      this.isShowDialogApprove = true;
      this.modelApprove.id = id;
    },

    async confirmApproveDocument(id) {
      const token = Cookies.get("token");
      if (!token) {
        await this.$router.push({ name: "Login" });
        return;
      }

      this.isButtonLoading = true;
      try {
        const response = await axios.put(`http://127.0.0.1:8000/api/mvo-documents/${id}/approve`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            'Content-Type': 'application/json',
          },
        });

        await this.getAllDocuments();
        this.showSnackbar(response.data.message || "Dokumen berhasil diapprove");
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error approving document", 'error');
      } finally {
        this.isButtonLoading = false;
        this.isShowDialogApprove = false;
      }
    },

    // Dialog Edit Management
    showDialogFormEditDocument(item) {

      // Close mobile expansion
      this.expandedMobileCard = null;

      this.isShowDialogEdit = true;

      // Populate form dengan data yang sudah ada
      this.modelEdit = {
        id: item.id,
        mvo_id: item.mvo_id,
        file_name: item.file_name,
        file: null, // File baru (opsional)
        pointbintang: item.pointbintang || "",
        current_file_path: item.file_path,
      };

      // Set selected values
      this.selectedMvoEdit = item.mvo_id;

      // Load MVO options dan setup hierarchy untuk edit
      this.getAllMvo().then(() => {
        this.setupEditHierarchy(item.mvo_id);
      });
    },

    setupEditHierarchy(mvoId) {
      // Cari MVO yang dipilih
      const selectedMvo = this.mvoOptions.find(mvo => mvo.id == mvoId);
      if (!selectedMvo) return;

      // Build hierarchy untuk menentukan DIST dan FO options
      this.buildEditHierarchy(selectedMvo);
    },

    buildEditHierarchy(mvo) {
      // Reset options
      this.distOptionsEdit = [];
      this.foOptionsEdit = [];
      this.selectedDistEdit = null;
      this.selectedFoEdit = null;

      // Jika MVO yang dipilih adalah level MVO (parent dari DIST)
      if (mvo.code.startsWith('MVO')) {
        this.distOptionsEdit = this.mvoOptions.filter(item =>
          item.parent_id == mvo.id && item.code.startsWith('DIST')
        );

        // Cari DIST yang menjadi parent dari FO saat ini
        const currentFo = this.findParentByLevel(mvo.id, 'FO');
        if (currentFo) {
          const currentDist = this.mvoOptions.find(item => item.id == currentFo.parent_id);
          if (currentDist) {
            this.selectedDistEdit = currentDist.id;
            this.onDistSelectedEdit(currentDist.id);
            this.selectedFoEdit = currentFo.id;
          }
        }
      }
      // Jika MVO yang dipilih adalah level DIST
      else if (mvo.code.startsWith('DIST')) {
        this.selectedDistEdit = mvo.id;
        this.foOptionsEdit = this.mvoOptions.filter(item =>
          item.parent_id == mvo.id && item.code.startsWith('FO')
        );
      }
      // Jika MVO yang dipilih adalah level FO
      else if (mvo.code.startsWith('FO')) {
        this.selectedFoEdit = mvo.id;

        // Cari parent DIST
        const parentDist = this.mvoOptions.find(item => item.id == mvo.parent_id);
        if (parentDist) {
          this.selectedDistEdit = parentDist.id;
          this.foOptionsEdit = this.mvoOptions.filter(item =>
            item.parent_id == parentDist.id && item.code.startsWith('FO')
          );

          // Cari parent MVO
          const parentMvo = this.mvoOptions.find(item => item.id == parentDist.parent_id);
          if (parentMvo) {
            this.selectedMvoEdit = parentMvo.id;
            this.distOptionsEdit = this.mvoOptions.filter(item =>
              item.parent_id == parentMvo.id && item.code.startsWith('DIST')
            );
          }
        }
      }
    },

    findParentByLevel(mvoId, targetLevel) {
      const allChildren = this.getAllChildren(mvoId);
      return allChildren.find(child => child.code.startsWith(targetLevel));
    },

    getAllChildren(parentId) {
      let children = [];
      const directChildren = this.mvoOptions.filter(mvo => mvo.parent_id == parentId);

      directChildren.forEach(child => {
        children.push(child);
        children = children.concat(this.getAllChildren(child.id));
      });

      return children;
    },

    onMvoSelectedEdit(mvoId) {
      this.selectedMvoEdit = mvoId;
      this.modelEdit.mvo_id = mvoId;

      if (!mvoId) {
        this.distOptionsEdit = [];
        this.selectedDistEdit = null;
        this.foOptionsEdit = [];
        this.selectedFoEdit = null;
        return;
      }

      // Cari semua DIST yang parent_id sama dengan mvoId
      this.distOptionsEdit = this.mvoOptions.filter(mvo =>
        mvo.parent_id == mvoId && mvo.code.startsWith('DIST')
      );

      // Reset pilihan DIST dan FO
      this.selectedDistEdit = null;
      this.foOptionsEdit = [];
      this.selectedFoEdit = null;
    },

    onDistSelectedEdit(distId) {
      this.selectedDistEdit = distId;
      if (!distId) {
        this.foOptionsEdit = [];
        this.selectedFoEdit = null;
        return;
      }

      // Cari semua FO yang parent_id sama dengan distId
      this.foOptionsEdit = this.mvoOptions.filter(mvo =>
        mvo.parent_id == distId && mvo.code.startsWith('FO')
      );

      // Reset pilihan FO
      this.selectedFoEdit = null;
    },

    onFoSelectedEdit(foId) {
      this.selectedFoEdit = foId;
      // Untuk edit, kita tetap menggunakan FO sebagai mvo_id
      if (foId) {
        this.modelEdit.mvo_id = foId;
      }
    },

    clearEditForm() {
      this.modelEdit = {
        id: "",
        mvo_id: "",
        file_name: "",
        file: null,
        pointbintang: "",
        current_file_path: "",
      };

      this.selectedMvoEdit = null;
      this.selectedDistEdit = null;
      this.selectedFoEdit = null;
      this.distOptionsEdit = [];
      this.foOptionsEdit = [];
    },

    handleFileChangeEdit(event) {
      if (event && event.length > 0) {
        this.modelEdit.file = event[0];
      }
    },

    validateEditForm() {

      if (!this.modelEdit.mvo_id || this.modelEdit.mvo_id === "") {
        this.showSnackbar("MVO harus dipilih", 'error');
        return false;
      }

      if (!this.modelEdit.file_name || this.modelEdit.file_name.trim() === "") {
        this.showSnackbar("Nama File harus diisi", 'error');
        return false;
      }

      // Validasi poin per bintang maksimal 5 untuk edit juga
      if (this.modelEdit.pointbintang && (isNaN(this.modelEdit.pointbintang) || this.modelEdit.pointbintang < 0 || this.modelEdit.pointbintang > 5)) {
        this.showSnackbar("Poin Per Bintang harus berupa angka antara 0-5", 'error');
        return false;
      }

      return true;
    },

    // API Update Method
    async updateDocument() {
      const token = Cookies.get("token");
      if (!token) {
        await this.$router.push({ name: "Login" });
        return;
      }

      if (!this.validateEditForm()) {
        return;
      }

      this.isButtonLoading = true;


      const formData = new FormData();
      formData.append('mvo_id', this.selectedFoEdit || this.modelEdit.mvo_id);
      formData.append('file_name', this.modelEdit.file_name);

      // Jika ada file baru, kirim file baru, jika tidak tetap gunakan yang lama
      if (this.modelEdit.file) {
        formData.append('file_path', this.modelEdit.file);
      }

      if (this.modelEdit.pointbintang && this.modelEdit.pointbintang !== "") {
        formData.append('pointbintang', this.modelEdit.pointbintang);
      }

      // Debug FormData
      for (let [key, value] of formData.entries()) {
      }

      try {
        const response = await axios.post(
          `http://127.0.0.1:8000/api/mvo-document/${this.modelEdit.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        await this.getAllDocuments();
        this.isShowDialogEdit = false;
        this.showSnackbar(response.data.message || "Dokumen MVO berhasil diupdate");
        this.clearEditForm();
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error updating document", 'error');
      } finally {
        this.isButtonLoading = false;
      }
    },
  },

  async created() {
    await this.getAllDocuments();
    await this.getAllMvo();
    await this.getAllFo();
  },

  watch: {
    // Watch untuk close mobile expansion ketika search berubah
    'datatable.search': {
      handler() {
        this.expandedMobileCard = null;
      }
    }
  }
};
</script>

<style scoped>
/* Custom styling for black and gold elegant table */
:deep(.v-data-table) {
  border: 1px solid #000000;
}

:deep(.v-data-table__th) {
  background-color: #888888 !important;
  color: #FFD700 !important;
  font-weight: bold;
}

/* Mobile Header Card */
.mobile-header-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
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
  line-height: 1.3;
}

.mobile-mvo-code {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}

.mobile-status-preview {
  margin-top: 4px;
}

.mobile-card-details {
  padding: 16px !important;
  background-color: #f8f9fa;
}

.mobile-file-preview {
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.mobile-preview-img {
  border: 1px solid #ddd;
}

.detail-label {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.detail-value {
  color: #666;
  font-size: 14px;
}

.mobile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mobile-actions .v-btn {
  flex: 1;
  min-width: auto;
}

/* Icon rotation animation */
.rotate-180 {
  transform: rotate(180deg);
}

.transition-all {
  transition: transform 0.3s ease;
}

/* Custom Dialog Styling */
</style>