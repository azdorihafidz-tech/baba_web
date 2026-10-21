<template>
  <Breadcrumb :items="itemsBreadcrumb" />
  <!-- Tombol Tambah Dokumentasi -->
  <div class="mb-4">
    <v-btn class="text-white font-semibold" @click="showDialogFormAddDokumentasi()" style="
    background: linear-gradient(135deg, #000000, #1a1a1a);
    color: #FFD700;
    border: 2px solid #FFD700;
    border-radius: 12px;
    padding: 10px 18px;
  ">
      <v-icon start style="color: #FFD700;">mdi-pen-plus</v-icon>
      <span class="ml-2">Tambah Dokumentasi</span>
    </v-btn>
  </div>

  <!-- Desktop View - Data Table -->
  <div class="d-none d-md-block">
    <CardDataTable :title="title">
      <template v-slot:search>
        <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Search" single-line
          hide-details variant="outlined" class="search-field" />
      </template>
      <template v-slot:datatable>
        <v-data-table class="bg-grey-lighten-4 text-no-wrap" hover :headers="datatable.headers" :items="datatable.items"
          :search="datatable.search" :loading="isTableLoading" :items-per-page="10"
          @update:options="updateCurrentPageInfo">
          <template v-slot:item.no="{ index }">
            {{ ((currentPage - 1) * itemsPerPage) + index + 1 }}
          </template>

          <template v-slot:item.file_path="{ item }">
            <v-tooltip :text="item.tipe_file === 'foto' ? 'Klik untuk melihat gambar' : 'Klik untuk melihat video'"
              location="top">
              <template v-slot:activator="{ props }">
                <v-btn icon variant="text" @click="showMediaDialog(item)" class="file-icon-btn" v-bind="props">
                  <v-icon size="32" :color="item.tipe_file === 'foto' ? '#FFD700' : '#4CAF50'">
                    {{ item.tipe_file === 'foto' ? 'mdi-file-image' : 'mdi-file-video' }}
                  </v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </template>

          <template v-slot:item.tipe_file="{ item }">
            <v-chip :color="item.tipe_file === 'foto' ? '#FFD700' : '#4CAF50'" class="text-black" size="small">
              <v-icon start size="small">{{ item.tipe_file === 'foto' ? 'mdi-camera' : 'mdi-video' }}</v-icon>
              {{ item.tipe_file === 'foto' ? 'Foto' : 'Video' }}
            </v-chip>
          </template>

          <template v-slot:item.keterangan="{ item }">
            <v-tooltip :text="item.keterangan" location="top">
              <template v-slot:activator="{ props }">
                <span v-bind="props" class="text-truncate" style="max-width: 200px; display: inline-block;">
                  {{ item.keterangan }}
                </span>
              </template>
            </v-tooltip>
          </template>

          <template v-slot:item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>

          <template v-slot:item.action="{ item }">
            <v-tooltip text="Download" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" color="#2196F3" @click="downloadDokumentasi(item)" class="mr-2 mb-2" v-bind="props"
                  icon>
                  <v-icon>mdi-download</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Edit" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" :color="app.colors.primary" @click="editDokumentasi(item.id)" class="mr-2 mb-2"
                  v-bind="props" icon>
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Hapus" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" :color="app.colors.secondary" @click="deleteDokumentasi(item.id)" class="mr-2 mb-2"
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
        <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Cari dokumentasi..."
          single-line hide-details variant="outlined" class="search-field-mobile" />
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="isTableLoading" indeterminate color="#FFD700" class="mb-4"></v-progress-linear>

    <div v-if="filteredItems.length === 0 && !isTableLoading" class="text-center pa-4">
      <v-icon size="64" color="grey">mdi-file-search</v-icon>
      <p class="text-grey mt-2">Tidak ada data dokumentasi ditemukan</p>
    </div>

    <v-card v-for="(item, index) in filteredItems" :key="item.id" class="mobile-header-card mb-3"
      @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">
      <!-- Header Card - Always Visible -->
      <v-card-text class="mobile-card-header">
        <v-row no-gutters align="center">
          <v-col cols="1" class="text-center">
            <span class="mobile-number">{{ index + 1 }}</span>
          </v-col>

          <v-col cols="2" class="text-center">
            <div class="mobile-media-preview" @click.stop="showMediaDialog(item)">
              <v-icon size="32" :color="item.tipe_file === 'foto' ? '#FFD700' : '#4CAF50'">
                {{ item.tipe_file === 'foto' ? 'mdi-file-image' : 'mdi-file-video' }}
              </v-icon>
            </div>
          </v-col>

          <v-col cols="7" class="pl-3">
            <div class="mobile-header-title">
              <strong>{{ item.file_name || 'File Tidak Tersedia' }}</strong>
            </div>
            <div class="mobile-header-preview">
              <v-chip size="small" :color="item.tipe_file === 'foto' ? '#FFD700' : '#4CAF50'" class="text-black">
                <v-icon start size="small">{{ item.tipe_file === 'foto' ? 'mdi-camera' : 'mdi-video' }}</v-icon>
                {{ item.tipe_file === 'foto' ? 'Foto' : 'Video' }}
              </v-chip>
            </div>
            <div class="mobile-date">
              <small>{{ formatDate(item.created_at) }}</small>
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
              <v-col cols="12" class="detail-label">
                <strong>Nama File:</strong>
              </v-col>
              <v-col cols="12" class="detail-value">
                {{ item.file_name || '-' }}
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="12" class="detail-label">
                <strong>Tipe File:</strong>
              </v-col>
              <v-col cols="12" class="detail-value">
                <v-chip :color="item.tipe_file === 'foto' ? '#FFD700' : '#4CAF50'" class="text-black" size="small">
                  <v-icon start size="small">{{ item.tipe_file === 'foto' ? 'mdi-camera' : 'mdi-video' }}</v-icon>
                  {{ item.tipe_file === 'foto' ? 'Foto' : 'Video' }}
                </v-chip>
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="12" class="detail-label">
                <strong>Keterangan:</strong>
              </v-col>
              <v-col cols="12" class="detail-value">
                {{ item.keterangan || '-' }}
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="12" class="detail-label">
                <strong>Tanggal Upload:</strong>
              </v-col>
              <v-col cols="12" class="detail-value">
                {{ formatDate(item.created_at) }}
              </v-col>
            </v-row>

            <!-- Action Buttons -->
            <v-divider class="mb-3"></v-divider>
            <div class="mobile-actions">
              <v-btn size="small" color="#2196F3" @click.stop="downloadDokumentasi(item)" class="mr-2 mb-2"
                prepend-icon="mdi-download">
                Download
              </v-btn>
              <v-btn size="small" :color="app.colors.primary" @click.stop="editDokumentasi(item.id)" class="mr-2 mb-2"
                prepend-icon="mdi-pencil">
                Edit
              </v-btn>
              <v-btn size="small" :color="app.colors.secondary" @click.stop="deleteDokumentasi(item.id)" class="mb-2"
                prepend-icon="mdi-delete">
                Hapus
              </v-btn>
            </div>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>
  </div>

  <!-- Dialog Tambah Dokumentasi -->
  <v-dialog v-model="isShowDialogAdd" persistent :width="$vuetify.display.mobile ? '95%' : '700'">
    <v-card class="custom-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-plus-circle</v-icon>
        <span class="dialog-title">TAMBAH DATA DOKUMENTASI</span>
      </v-card-title>
      <v-card-text class="dialog-content">
        <v-row>
          <v-col cols="12">
            <v-file-input label="Upload File Dokumentasi" v-model="modelAdd.file_dok"
              accept="image/jpeg,image/jpg,image/png,image/gif,video/mp4,video/avi,video/mov,video/wmv"
              prepend-icon="mdi-file-plus" class="mb-2 mt-4" show-size @change="previewAddFile"
              :error-messages="modelAdd.file_dokumentasi_error" clearable />
          </v-col>
        </v-row>
        <v-row v-if="modelAdd.preview_url">
          <v-col cols="12">
            <p class="text-subtitle-2 mb-2">Preview File:</p>
            <div v-if="modelAdd.file_type === 'image'">
              <v-img :src="modelAdd.preview_url" max-height="200" contain class="rounded mb-4"></v-img>
            </div>
            <div v-else-if="modelAdd.file_type === 'video'" class="video-preview">
              <video controls style="max-width: 100%; max-height: 200px;" class="rounded mb-4">
                <source :src="modelAdd.preview_url" type="video/mp4">
                Browser Anda tidak mendukung video.
              </video>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-select label="Tipe File" v-model="modelAdd.tipe_file" :items="tipeFileOptions" class="mb-2"
              :error-messages="modelAdd.tipe_file_error" :rules="[rules.required]" required />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-textarea label="Keterangan" v-model="modelAdd.keterangan" class="mb-2"
              :error-messages="modelAdd.keterangan_error" :rules="[rules.required]" required />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.secondary" @click="cancelAddDialog" class="ml-2">
          Batal
        </v-btn>
        <v-btn :color="app.colors.primary" @click="addDokumentasi()" :loading="isButtonLoading" class="ml-2">
          Simpan
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Edit Dokumentasi -->
  <v-dialog v-model="isShowDialogEdit" persistent :width="$vuetify.display.mobile ? '95%' : '700'">
    <v-card class="custom-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-pencil</v-icon>
        <span class="dialog-title">EDIT DATA DOKUMENTASI</span>
      </v-card-title>
      <v-card-text class="dialog-content">
        <v-row>
          <v-col cols="12">
            <v-file-input label="Upload File Dokumentasi Baru (Opsional)" v-model="modelEdit.file_dokumentasi"
              accept="image/jpeg,image/jpg,image/png,image/gif,video/mp4,video/avi,video/mov,video/wmv"
              prepend-icon="mdi-file-plus" class="mb-2 mt-4" show-size @change="previewEditFile" clearable />
          </v-col>
        </v-row>
        <v-row v-if="modelEdit.current_file_url">
          <v-col cols="12">
            <p class="text-subtitle-2 mb-2">File Saat Ini:</p>
            <div v-if="modelEdit.current_file_type === 'image'">
              <v-img :src="modelEdit.current_file_url" max-height="200" contain class="rounded mb-4"
                @error="handleMediaError">
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                  </div>
                </template>
                <template v-slot:error>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-icon size="64" color="grey">mdi-file-image-broken</v-icon>
                    <p class="ml-2">File tidak dapat dimuat</p>
                  </div>
                </template>
              </v-img>
            </div>
            <div v-else-if="modelEdit.current_file_type === 'video'" class="video-preview">
              <video controls style="max-width: 100%; max-height: 200px;" class="rounded mb-4">
                <source :src="modelEdit.current_file_url" type="video/mp4">
                Browser Anda tidak mendukung video.
              </video>
            </div>
          </v-col>
        </v-row>
        <v-row v-if="modelEdit.preview_url">
          <v-col cols="12">
            <p class="text-subtitle-2 mb-2">Preview File Baru:</p>
            <div v-if="modelEdit.file_type === 'image'">
              <v-img :src="modelEdit.preview_url" max-height="200" contain class="rounded mb-4"></v-img>
            </div>
            <div v-else-if="modelEdit.file_type === 'video'" class="video-preview">
              <video controls style="max-width: 100%; max-height: 200px;" class="rounded mb-4">
                <source :src="modelEdit.preview_url" type="video/mp4">
                Browser Anda tidak mendukung video.
              </video>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-select label="Tipe File" v-model="modelEdit.tipe_file" :items="tipeFileOptions" class="mb-2"
              :rules="[rules.required]" required />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-textarea label="Keterangan" v-model="modelEdit.keterangan" class="mb-2" :rules="[rules.required]"
              required />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.secondary" @click="cancelEditDialog" class="ml-2">
          Batal
        </v-btn>
        <v-btn :color="app.colors.primary" @click="updateDokumentasi()" :loading="isButtonLoading" class="ml-2">
          Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog View Media -->
  <v-dialog v-model="isShowDialogMedia" :max-width="$vuetify.display.mobile ? '95%' : '800px'">
    <v-card>
      <v-card-title class="dialog-header text-center">
        <v-icon class="mr-2" style="color: #FFD700;">
          {{ mediaPreviewData.tipe_file === 'foto' ? 'mdi-file-image' : 'mdi-file-video' }}
        </v-icon>
        <span class="dialog-title">PREVIEW {{ mediaPreviewData.tipe_file === 'foto' ? 'GAMBAR' : 'VIDEO' }}</span>
      </v-card-title>
      <v-card-text class="pa-4">
        <div class="text-center">
          <div v-if="mediaPreviewData.tipe_file === 'foto'">
            <v-img :src="mediaPreviewUrl" max-height="500" contain class="rounded" @error="handleMediaError">
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                </div>
              </template>
              <template v-slot:error>
                <div class="d-flex align-center justify-center fill-height">
                  <v-icon size="64" color="grey">mdi-file-image-broken</v-icon>
                  <p class="ml-2">File tidak dapat dimuat</p>
                </div>
              </template>
            </v-img>
          </div>
          <div v-else-if="mediaPreviewData.tipe_file === 'video'" class="video-preview">
            <video controls style="max-width: 100%; max-height: 500px;" class="rounded">
              <source :src="mediaPreviewUrl" type="video/mp4">
              Browser Anda tidak mendukung video.
            </video>
          </div>
        </div>
        <div class="mt-3 text-center">
          <p class="text-subtitle-1 font-weight-bold">{{ mediaPreviewData.file_name }}</p>
          <p class="text-body-2 text-grey">{{ mediaPreviewData.keterangan }}</p>
          <p class="text-caption text-grey">Upload: {{ formatDate(mediaPreviewData.created_at) }}</p>
        </div>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.primary" @click="isShowDialogMedia = false">
          Tutup
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Delete Confirmation -->
  <v-dialog v-model="isShowDialogDelete" :max-width="$vuetify.display.mobile ? '95%' : '500px'">
    <v-card :color="this.app.colors.background">
      <v-card-title class="text-h5">Apakah anda yakin ingin menghapus data dokumentasi ini?</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.primary" @click="isShowDialogDelete = false">
          Cancel
        </v-btn>
        <v-btn :color="app.colors.secondary" @click="confirmDeleteDokumentasi(modelDelete.id)"
          :loading="isButtonLoading">
          OK
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="contentSnackbar.snackbar" :color="contentSnackbar.color">
    {{ contentSnackbar.text }}
  </v-snackbar>
</template>

<script>
import { API_URL, FILE_URL } from "@/config";
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import CardDataTable from "@/components/ui/CardDataTable.vue";
import { useAppStore } from "@/stores/app.js";
import axios from "axios";
import Cookies from "js-cookie";

export default {
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
      currentPage: 1,
      itemsPerPage: 10,
      expandedMobileCard: null,
      contentSnackbar: {
        snackbar: false,
        text: "",
        color: "",
      },

      rules: {
        required: value => !!value || 'Field ini wajib diisi'
      },

      tipeFileOptions: [
        { title: 'Foto', value: 'foto' },
        { title: 'Video', value: 'video' }
      ],

      title: "DATA DOKUMENTASI",
      itemsBreadcrumb: [
        {
          title: "Dashboard",
          disabled: false,
          href: "/admin/dashboard",
        },
        {
          title: "Dokumentasi",
          disabled: false,
          href: "/admin/dokumentasi",
        },
      ],
      isShowDialogAdd: false,
      isShowDialogEdit: false,
      isShowDialogMedia: false,
      isButtonLoading: false,
      isShowDialogDelete: false,
      datatable: {
        search: "",
        headers: [
          { key: "no", title: "No", sortable: false },
          { key: "file_path", title: "File", sortable: false },
          { key: "file_name", title: "Nama File" },
          { key: "tipe_file", title: "Tipe File" },
          { key: "keterangan", title: "Keterangan" },
          { key: "created_at", title: "Tanggal Upload" },
          { key: "action", title: "Actions", sortable: false, align: "center" },
        ],
        items: [],
      },
      modelAdd: {
        file_dok: null,
        tipe_file: "",
        keterangan: "",
        preview_url: null,
        file_type: null,
        file_dok_error: "",
        tipe_file_error: "",
        keterangan_error: ""
      },

      modelEdit: {
        id: "",
        file_dokumentasi: null,
        tipe_file: "",
        keterangan: "",
        current_file_url: null,
        current_file_type: null,
        preview_url: null,
        file_type: null,
      },
      modelDelete: {
        id: "",
      },
      mediaPreviewUrl: "",
      mediaPreviewData: {},
      isTableLoading: true,
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
          (item.tipe_file && item.tipe_file.toLowerCase().includes(searchTerm)) ||
          (item.keterangan && item.keterangan.toLowerCase().includes(searchTerm)) ||
          (item.created_at && this.formatDate(item.created_at).toLowerCase().includes(searchTerm))
        );
      });
    }
  },

  methods: {
    // async downloadDokumentasi(item) {
    //   const token = Cookies.get("token");
    //   if (!token) {
    //     this.$router.push({ name: "Login" });
    //     return;
    //   }


    //   try {
    //     const link = document.createElement("a");
    //     link.href = item.file_path;              // URL file dari API
    //     link.setAttribute("download", item.file_name || "download");
    //     link.setAttribute("target", "_blank");   // supaya tetap bisa jika browser blok
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    //   } catch (error) {
    //   }
    // },

    async downloadDokumentasi(item) {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      try {
        const response = await fetch(
          `${FILE_URL}/api/dokumentasi/${item.id}/download`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Gagal download file");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", item.file_name || "download");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
      } catch (error) {
      }
    },

    getFileExtension(filename) {
      if (!filename) return 'bin';
      const parts = filename.split('.');
      return parts.length > 1 ? parts.pop().toLowerCase() : 'bin';
    },
    // Format tanggal untuk display
    formatDate(dateString) {
      if (!dateString) return '-';

      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return dateString;
      }
    },

    toggleMobileDetail(itemId) {
      if (this.expandedMobileCard === itemId) {
        this.expandedMobileCard = null;
      } else {
        this.expandedMobileCard = itemId;
      }
    },

    showSnackbar(response, isError = false) {
      this.contentSnackbar.snackbar = true;

      let message = '';
      if (response && response.data) {
        message = response.data.message || response.data.error || '';

        if (response.data.errors && Array.isArray(response.data.errors)) {
          message = response.data.errors.join(', ');
        } else if (response.data.errors && typeof response.data.errors === 'object') {
          const errorMessages = [];
          for (const field in response.data.errors) {
            if (Array.isArray(response.data.errors[field])) {
              errorMessages.push(...response.data.errors[field]);
            } else {
              errorMessages.push(response.data.errors[field]);
            }
          }
          message = errorMessages.join(', ');
        }
      }

      if (!message && response && response.message) {
        message = response.message;
      }

      if (!message) {
        message = isError ? 'Terjadi kesalahan tidak terduga' : 'Operasi berhasil';
      }

      this.contentSnackbar.text = message;
      this.contentSnackbar.color = isError ? this.app.colors.secondary : this.app.colors.primary;
    },

    updateCurrentPageInfo(options) {
      this.currentPage = options.page;
      this.itemsPerPage = options.itemsPerPage;
    },

    showDialogFormAddDokumentasi() {
      this.isShowDialogAdd = true;
      this.clearAddForm();
    },

    clearAddForm() {
      this.modelAdd.file_dok = null;
      this.modelAdd.tipe_file = "";
      this.modelAdd.keterangan = "";
      this.modelAdd.preview_url = null;
      this.modelAdd.file_type = null;
      this.modelAdd.file_dok_error = "";
      this.modelAdd.tipe_file_error = "";
      this.modelAdd.keterangan_error = "";
    },

    clearEditForm() {
      this.modelEdit.id = "";
      this.modelEdit.file_dokumentasi = null;
      this.modelEdit.tipe_file = "";
      this.modelEdit.keterangan = "";
      this.modelEdit.current_file_url = null;
      this.modelEdit.current_file_type = null;
      this.modelEdit.preview_url = null;
      this.modelEdit.file_type = null;
    },

    cancelAddDialog() {
      this.isShowDialogAdd = false;
      this.clearAddForm();
    },

    cancelEditDialog() {
      this.isShowDialogEdit = false;
      this.clearEditForm();
    },

    handleMediaError() {
      this.contentSnackbar.snackbar = true;
      this.contentSnackbar.text = "File tidak dapat dimuat";
      this.contentSnackbar.color = this.app.colors.secondary;
    },

    constructFileUrl(filePath) {
      if (!filePath) return null;


      if (filePath.startsWith('http')) {
        return filePath;
      }

      let cleanPath = filePath;
      if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
      }

      const baseUrl = FILE_URL;
      let fileUrl;

      if (cleanPath.startsWith('uploads/')) {
        fileUrl = `${baseUrl}/${cleanPath}`;
      } else if (cleanPath.startsWith('dokumentasi/')) {
        fileUrl = `${baseUrl}/${cleanPath}`;
      } else {
        fileUrl = `${baseUrl}/uploads/dokumentasi/${cleanPath}`;
      }

      return fileUrl;
    },

    showMediaDialog(item) {

      if (!item.file_path) {
        this.showError("Path file tidak tersedia");
        return;
      }

      this.expandedMobileCard = null;

      const fileUrl = this.constructFileUrl(item.file_path);


      if (fileUrl) {
        this.mediaPreviewUrl = fileUrl;
        this.mediaPreviewData = {
          file_name: item.file_name,
          tipe_file: item.tipe_file,
          keterangan: item.keterangan,
          created_at: item.created_at
        };
        this.isShowDialogMedia = true;
      } else {
        this.showError("Path file tidak valid");
      }
    },

    previewAddFile(event) {

      this.modelAdd.file_dok_error = "";

      let file = null;

      if (Array.isArray(event) && event.length > 0) {
        file = event[0];
      }
      else if (event instanceof File) {
        file = event;
      }
      else if (event && event.target && event.target.files && event.target.files.length > 0) {
        file = event.target.files[0];
      }
      else if (this.modelAdd.file_dok && this.modelAdd.file_dok instanceof File) {
        file = this.modelAdd.file_dok;
      }
      else if (event === null || event === undefined) {
        this.modelAdd.file_dok = null;
        this.modelAdd.preview_url = null;
        this.modelAdd.file_type = null;
        this.modelAdd.tipe_file = "";
        return;
      }


      if (file && file instanceof File) {
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const validVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
        const allValidTypes = [...validImageTypes, ...validVideoTypes];

        if (!allValidTypes.includes(file.type)) {
          this.modelAdd.file_dok_error = "Format file tidak didukung. Gunakan JPG, PNG, GIF untuk gambar atau MP4, AVI, MOV, WMV untuk video.";
          this.modelAdd.preview_url = null;
          this.modelAdd.file_dok = null;
          this.modelAdd.file_type = null;
          this.modelAdd.tipe_file = "";
          return;
        }

        const maxSize = validVideoTypes.includes(file.type) ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
          const maxSizeText = validVideoTypes.includes(file.type) ? '50MB' : '5MB';
          this.modelAdd.file_dok_error = `Ukuran file terlalu besar. Maksimal ${maxSizeText}.`;
          this.modelAdd.preview_url = null;
          this.modelAdd.file_dok = null;
          this.modelAdd.file_type = null;
          this.modelAdd.tipe_file = "";
          return;
        }

        this.modelAdd.file_type = validImageTypes.includes(file.type) ? 'image' : 'video';
        this.modelAdd.tipe_file = validImageTypes.includes(file.type) ? 'foto' : 'video';

        const reader = new FileReader();
        reader.onload = (e) => {
          this.modelAdd.preview_url = e.target.result;
        };
        reader.onerror = (e) => {
          this.modelAdd.file_dok_error = "Error membaca file";
          this.modelAdd.preview_url = null;
        };
        reader.readAsDataURL(file);

        this.modelAdd.file_dok = file;
      } else {
        this.modelAdd.preview_url = null;
        this.modelAdd.file_type = null;
        this.modelAdd.tipe_file = "";
      }
    },

    previewEditFile(event) {

      let file = null;

      if (Array.isArray(event) && event.length > 0) {
        file = event[0];
      }
      else if (event instanceof File) {
        file = event;
      }
      else if (event && event.target && event.target.files && event.target.files.length > 0) {
        file = event.target.files[0];
      }
      else if (this.modelEdit.file_dokumentasi && this.modelEdit.file_dokumentasi instanceof File) {
        file = this.modelEdit.file_dokumentasi;
      }
      else if (event === null || event === undefined) {
        this.modelEdit.file_dokumentasi = null;
        this.modelEdit.preview_url = null;
        this.modelEdit.file_type = null;
        return;
      }


      if (file && file instanceof File) {
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const validVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
        const allValidTypes = [...validImageTypes, ...validVideoTypes];

        if (!allValidTypes.includes(file.type)) {
          this.contentSnackbar.snackbar = true;
          this.contentSnackbar.text = "Format file tidak didukung. Gunakan JPG, PNG, GIF untuk gambar atau MP4, AVI, MOV, WMV untuk video.";
          this.contentSnackbar.color = this.app.colors.secondary;
          this.modelEdit.file_dokumentasi = null;
          this.modelEdit.preview_url = null;
          this.modelEdit.file_type = null;
          return;
        }

        const maxSize = validVideoTypes.includes(file.type) ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
          const maxSizeText = validVideoTypes.includes(file.type) ? '50MB' : '5MB';
          this.contentSnackbar.snackbar = true;
          this.contentSnackbar.text = `Ukuran file terlalu besar. Maksimal ${maxSizeText}.`;
          this.contentSnackbar.color = this.app.colors.secondary;
          this.modelEdit.file_dokumentasi = null;
          this.modelEdit.preview_url = null;
          this.modelEdit.file_type = null;
          return;
        }

        this.modelEdit.file_type = validImageTypes.includes(file.type) ? 'image' : 'video';

        const reader = new FileReader();
        reader.onload = (e) => {
          this.modelEdit.preview_url = e.target.result;
        };
        reader.onerror = (e) => {
          this.contentSnackbar.snackbar = true;
          this.contentSnackbar.text = "Error membaca file";
          this.contentSnackbar.color = this.app.colors.secondary;
          this.modelEdit.preview_url = null;
        };
        reader.readAsDataURL(file);

        this.modelEdit.file_dokumentasi = file;
      } else {
        this.modelEdit.preview_url = null;
        this.modelEdit.file_type = null;
      }
    },

    async addDokumentasi() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      if (!this.validateAddForm()) {
        return;
      }

      this.isButtonLoading = true;

      try {
        const formData = new FormData();

        if (this.modelAdd.file_dok instanceof File) {
          formData.append('file_dok', this.modelAdd.file_dok);
        } else {
          throw new Error("File dokumentasi tidak valid");
        }

        formData.append('tipe_file', this.modelAdd.tipe_file);
        formData.append('keterangan', this.modelAdd.keterangan.trim());

        // Tambahkan created_at dengan nilai yang diminta
        formData.append('created_at', '2025-09-29T03:13:52.000000Z');

        for (let pair of formData.entries()) {
        }

        const response = await axios.post(
          `${API_URL}/api/dokumentasi`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
              Accept: "application/json",
            },
          }
        );

        this.getAllDokumentasi();
        this.isShowDialogAdd = false;
        this.showSnackbar(response, false);

      } catch (error) {
        this.showSnackbar(error.response || error, true);
      } finally {
        this.isButtonLoading = false;
      }
    },

    getAllDokumentasi() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.isTableLoading = true;
      axios
        .get(`${API_URL}/api/dokumentasi`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((response) => {

          if (response.data.status === "success") {
            this.datatable.items = response.data.data.map(item => {

              const fileUrl = this.constructFileUrl(item.file_path);

              return {
                id: item.id,
                file_name: item.file_name,
                file_path: fileUrl || item.file_path,
                original_path: item.file_path,
                tipe_file: item.tipe_file,
                keterangan: item.keterangan,
                created_at: item.created_at || '2025-09-29T03:13:52.000000Z'
              };
            });

          } else {
            this.showSnackbar(response, true);
          }
        })
        .catch((error) => {
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isTableLoading = false;
        });
    },

    validateAddForm() {
      let isValid = true;

      this.modelAdd.file_dok_error = "";
      this.modelAdd.tipe_file_error = "";
      this.modelAdd.keterangan_error = "";


      if (!this.modelAdd.file_dok || !(this.modelAdd.file_dok instanceof File)) {
        this.modelAdd.file_dok_error = "File dokumentasi harus diisi";
        isValid = false;
      }

      if (!this.modelAdd.tipe_file) {
        this.modelAdd.tipe_file_error = "Tipe file harus dipilih";
        isValid = false;
      }

      if (!this.modelAdd.keterangan || !this.modelAdd.keterangan.trim()) {
        this.modelAdd.keterangan_error = "Keterangan harus diisi";
        isValid = false;
      }

      return isValid;
    },

    editDokumentasi(id) {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.expandedMobileCard = null;
      this.clearEditForm();
      this.isShowDialogEdit = true;

      axios
        .get(`${API_URL}/api/dokumentasi/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((response) => {

          if (response.data.status === "success") {
            this.modelEdit.id = response.data.data.id;
            this.modelEdit.file_name = response.data.data.file_name;
            this.modelEdit.tipe_file = response.data.data.tipe_file;
            this.modelEdit.keterangan = response.data.data.keterangan;

            const fileUrl = this.constructFileUrl(response.data.data.file_path);
            this.modelEdit.current_file_url = fileUrl;

            this.modelEdit.current_file_type = response.data.data.tipe_file === 'foto' ? 'image' : 'video';

          } else {
            this.showSnackbar(response, true);
            this.isShowDialogEdit = false;
          }
        })
        .catch((error) => {
          this.showSnackbar(error.response || error, true);
          this.isShowDialogEdit = false;
        });
    },

    async updateDokumentasi() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      if (!this.modelEdit.tipe_file) {
        this.showSnackbar({ data: { message: "Tipe file harus dipilih" } }, true);
        return;
      }

      if (!this.modelEdit.keterangan || !this.modelEdit.keterangan.trim()) {
        this.showSnackbar({ data: { message: "Keterangan harus diisi" } }, true);
        return;
      }

      this.isButtonLoading = true;

      try {
        const formData = new FormData();

        if (this.modelEdit.file_dokumentasi instanceof File) {
          formData.append('file_dok', this.modelEdit.file_dokumentasi);
        }

        formData.append('tipe_file', this.modelEdit.tipe_file);
        formData.append('keterangan', this.modelEdit.keterangan.trim());
        formData.append('_method', 'PUT');

        // Untuk update, kita tidak perlu mengirim created_at kecuali ingin mengubahnya
        // formData.append('created_at', '2025-09-29T03:13:52.000000Z');

        for (let pair of formData.entries()) {
        }

        const response = await axios.post(
          `${API_URL}/api/dokumentasi/${this.modelEdit.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
              Accept: "application/json",
            },
          }
        );

        this.getAllDokumentasi();
        this.isShowDialogEdit = false;
        this.showSnackbar(response, false);

      } catch (error) {
        this.showSnackbar(error.response || error, true);
      } finally {
        this.isButtonLoading = false;
      }
    },

    deleteDokumentasi(id) {
      this.expandedMobileCard = null;
      this.isShowDialogDelete = true;
      this.modelDelete.id = id;
    },

    confirmDeleteDokumentasi(id) {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.isButtonLoading = true;
      axios
        .delete(`${API_URL}/api/dokumentasi/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((response) => {
          this.getAllDokumentasi();
          this.showSnackbar(response, false);
        })
        .catch((error) => {
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isButtonLoading = false;
          this.isShowDialogDelete = false;
        });
    },
  },

  created() {
    this.getAllDokumentasi();
  },

  mounted() {
  },

  watch: {
    'datatable.search': {
      handler() {
        this.expandedMobileCard = null;
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
  background-color: var(--baba-gold-soft) !important;
  color: var(--baba-text) !important;
  font-weight: bold;
}

/* Custom styling for file icon button */
.file-icon-btn {
  background-color: #f5f5f5 !important;
  border: 2px solid #FFD700 !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.file-icon-btn:hover {
  background-color: #FFD700 !important;
  transform: scale(1.1);
}

.file-icon-btn:hover :deep(.v-icon) {
  color: #000000 !important;
}

/* Mobile Header Card */
.mobile-header-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.mobile-header-card:hover {
  border-color: #FFD700;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
}

.mobile-card-expanded {
  border-color: #FFD700 !important;
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3) !important;
}

.search-field-mobile {
  margin-top: 8px;
}

.mobile-card-header {
  padding: 16px !important;
}

/* Mobile Media Styling */
.mobile-media-preview {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
  padding: 8px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.mobile-media-preview:hover {
  transform: scale(1.05);
  border-color: #FFD700;
}

.mobile-header-title {
  font-size: 16px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.mobile-header-preview {
  font-size: 12px;
  margin-bottom: 2px;
}

.mobile-date {
  font-size: 10px;
  color: #666;
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
.dialog-header {
  background: var(--baba-ink) !important;
  color: #FFD700 !important;
  padding: 20px 24px !important;
  border-bottom: 2px solid #FFD700;
  font-weight: bold;
  font-size: 18px;
  text-align: center;
}

.dialog-content {
  padding: 24px !important;
  background-color: #f5f5f5;
}

.dialog-actions {
  padding: 16px 24px !important;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

/* Video Preview Styling */
.video-preview {
  text-align: center;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.video-preview video {
  border-radius: 8px;
}

/* Mobile Dialog Adjustments */
@media (max-width: 600px) {
  .dialog-content {
    padding: 16px !important;
  }

  .dialog-actions {
    padding: 12px 16px !important;
  }

  .dialog-header {
    padding: 16px !important;
    font-size: 16px;
  }
}

/* Custom styling untuk preview file */
.v-img {
  border: 2px solid #e0e0e0;
}

.v-img:hover {
  border-color: #FFD700;
}

/* Custom styling untuk required fields */
:deep(.v-text-field input:required),
:deep(.v-textarea input:required) {
  border-left: 3px solid #FFD700;
}

/* Loading state styling */
:deep(.v-progress-circular) {
  color: #FFD700 !important;
}

:deep(.v-progress-linear) {
  border-radius: 4px;
}

/* Error message styling */
:deep(.v-messages__message) {
  color: #d32f2f !important;
  font-size: 12px;
}

/* Success message styling */
.v-snackbar.success {
  background-color: #4caf50 !important;
}

/* Text truncate for long descriptions */
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive breakpoints */
@media (max-width: 960px) {
  .mobile-actions .v-btn {
    font-size: 12px;
    padding: 0 8px;
  }
}

@media (max-width: 600px) {
  .mobile-header-card {
    margin-left: 8px;
    margin-right: 8px;
  }

  .mobile-header-title {
    font-size: 14px;
  }

  .mobile-actions .v-btn {
    font-size: 11px;
  }
}

/* Styling untuk tombol download */
:deep(.v-btn--icon.v-btn--size-small) {
  transition: all 0.3s ease;
}

:deep(.v-btn--icon.v-btn--size-small):hover {
  transform: scale(1.1);
}

/* Warna khusus untuk tombol download */
.v-btn.download-btn {
  background-color: #2196F3 !important;
  color: white !important;
}

.v-btn.download-btn:hover {
  background-color: #1976D2 !important;
}

/* Mobile action buttons responsive */
@media (max-width: 600px) {
  .mobile-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mobile-actions .v-btn {
    width: 100%;
    justify-content: start;
  }
}
</style>