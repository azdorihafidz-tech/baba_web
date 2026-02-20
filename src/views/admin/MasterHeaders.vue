<template>
  <Breadcrumb :items="itemsBreadcrumb" />
  <!-- Tombol Tambah Gambar Header -->
  <div class="mb-4">
    <v-btn class="text-white font-semibold" @click="showDialogFormAddGambarHeader()" style="
    background: linear-gradient(135deg, #000000, #1a1a1a);
    color: #FFD700;
    border: 2px solid #FFD700;
    border-radius: 12px;
    padding: 10px 18px;
  ">
      <v-icon start style="color: #FFD700;">mdi-pen-plus</v-icon>
      <span class="ml-2">Tambah Gambar Header</span>
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
        <v-data-table <v-data-table class="bg-grey-lighten-4 text-no-wrap" hover :headers="datatable.headers"
          :items="datatable.items" :search="datatable.search" :loading="isTableLoading" :items-per-page="10"
          @update:options="updateCurrentPageInfo">
          <template v-slot:item.no="{ index }">
            {{ ((currentPage - 1) * itemsPerPage) + index + 1 }}
          </template>

          <template v-slot:item.path_gambar_header="{ item }">
            <v-tooltip text="Klik untuk melihat gambar" location="top">
              <template v-slot:activator="{ props }">
                <v-btn icon variant="text" @click="showImageDialog(item.path_gambar_header)" class="file-icon-btn"
                  v-bind="props">
                  <v-icon size="32" color="#FFD700">mdi-file-image</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </template>

          <!-- 🔹 Kolom Action -->
          <template v-slot:item.action="{ item }">
            <v-tooltip text="Edit" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" :color="app.colors.primary" @click="editGambarHeader(item.id)" class="mr-2 mb-2"
                  v-bind="props" icon>
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Hapus" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" :color="app.colors.secondary" @click="deleteGambarHeader(item.id)" class="mr-2 mb-2"
                  v-bind="props" icon>
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <!-- 🔹 Tombol Chat -->
            <v-tooltip text="Buka Chat" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" color="primary" @click="$router.push('/admin/chat')" class="mb-2" v-bind="props"
                  icon>
                  <v-icon>mdi-chat</v-icon>
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
        <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Cari gambar header..."
          single-line hide-details variant="outlined" class="search-field-mobile" />
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="isTableLoading" indeterminate color="#FFD700" class="mb-4"></v-progress-linear>

    <div v-if="filteredItems.length === 0 && !isTableLoading" class="text-center pa-4">
      <v-icon size="64" color="grey">mdi-image-search</v-icon>
      <p class="text-grey mt-2">Tidak ada data gambar header ditemukan</p>
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
            <div class="mobile-image-preview" @click.stop="showImageDialog(item.path_gambar_header)">
              <v-img :src="item.path_gambar_header" aspect-ratio="1" cover class="mobile-thumbnail"
                @error="handleImageError">
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-icon color="grey">mdi-image</v-icon>
                  </div>
                </template>
                <template v-slot:error>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-icon color="red">mdi-image-broken</v-icon>
                  </div>
                </template>
              </v-img>
            </div>
          </v-col>

          <v-col cols="7" class="pl-3">
            <div class="mobile-header-title">
              <strong>{{ item.cabang || 'Cabang Tidak Tersedia' }}</strong>
            </div>
            <div class="mobile-header-preview">
              <v-chip size="small" color="#FFD700" class="text-black">
                <v-icon start size="small">mdi-camera</v-icon>
                Header Image
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
              <v-col cols="12" class="detail-label">
                <strong>Cabang:</strong>
              </v-col>
              <v-col cols="12" class="detail-value">
                {{ item.cabang || '-' }}
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="12" class="detail-label">
                <strong>Gambar Header:</strong>
              </v-col>
              <v-col cols="12" class="detail-value">
                <div class="mobile-image-detail" @click.stop="showImageDialog(item.path_gambar_header)">
                  <v-img :src="item.path_gambar_header" max-height="150" contain class="mobile-detail-image"
                    @error="handleImageError">
                    <template v-slot:placeholder>
                      <div class="d-flex align-center justify-center fill-height">
                        <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                      </div>
                    </template>
                    <template v-slot:error>
                      <div class="d-flex align-center justify-center fill-height">
                        <v-icon size="48" color="grey">mdi-image-broken</v-icon>
                        <p class="ml-2 text-grey">Gambar tidak dapat dimuat</p>
                      </div>
                    </template>
                  </v-img>
                  <div class="image-overlay">
                    <v-icon color="white" size="32">mdi-magnify</v-icon>
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- Action Buttons -->
            <v-divider class="mb-3"></v-divider>
            <div class="mobile-actions">
              <v-btn size="small" :color="app.colors.primary" @click.stop="editGambarHeader(item.id)" class="mr-2 mb-2"
                prepend-icon="mdi-pencil">
                Edit
              </v-btn>
              <v-btn size="small" :color="app.colors.secondary" @click.stop="deleteGambarHeader(item.id)" class="mb-2"
                prepend-icon="mdi-delete">
                Hapus
              </v-btn>
            </div>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>
  </div>

  <!-- Dialog Tambah Gambar Header -->
  <v-dialog v-model="isShowDialogAdd" persistent :width="$vuetify.display.mobile ? '95%' : '700'">
    <v-card class="custom-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-plus-circle</v-icon>
        <span class="dialog-title">TAMBAH DATA GAMBAR HEADER</span>
      </v-card-title>
      <v-card-text class="dialog-content">
        <v-row>
          <v-col cols="12">
            <v-file-input label="Upload Gambar Header" v-model="modelAdd.gambar_file"
              accept="image/jpeg,image/jpg,image/png,image/gif" prepend-icon="mdi-camera" class="mb-2 mt-4" show-size
              @change="previewAddImage" :error-messages="modelAdd.gambar_file_error" clearable />
          </v-col>
        </v-row>
        <v-row v-if="modelAdd.preview_url">
          <v-col cols="12">
            <p class="text-subtitle-2 mb-2">Preview Gambar:</p>
            <v-img :src="modelAdd.preview_url" max-height="200" contain class="rounded mb-4"></v-img>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field label="Cabang" v-model="modelAdd.cabang" class="mb-2" :error-messages="modelAdd.cabang_error"
              :rules="[rules.required]" required />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.secondary" @click="cancelAddDialog" class="ml-2">
          Batal
        </v-btn>
        <v-btn :color="app.colors.primary" @click="addGambarHeader()" :loading="isButtonLoading" class="ml-2">
          Simpan
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Edit Gambar Header -->
  <v-dialog v-model="isShowDialogEdit" persistent :width="$vuetify.display.mobile ? '95%' : '700'">
    <v-card class="custom-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-pencil</v-icon>
        <span class="dialog-title">EDIT DATA GAMBAR HEADER</span>
      </v-card-title>
      <v-card-text class="dialog-content">
        <v-row>
          <v-col cols="12">
            <v-file-input label="Upload Gambar Header Baru (Opsional)" v-model="modelEdit.gambar_file"
              accept="image/jpeg,image/jpg,image/png,image/gif" prepend-icon="mdi-camera" class="mb-2 mt-4" show-size
              @change="previewEditImage" clearable />
          </v-col>
        </v-row>
        <v-row v-if="modelEdit.current_image_url">
          <v-col cols="12">
            <p class="text-subtitle-2 mb-2">Gambar Saat Ini:</p>
            <v-img :src="modelEdit.current_image_url" max-height="200" contain class="rounded mb-4"
              @error="handleImageError">
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                </div>
              </template>
              <template v-slot:error>
                <div class="d-flex align-center justify-center fill-height">
                  <v-icon size="64" color="grey">mdi-image-broken</v-icon>
                  <p class="ml-2">Gambar tidak dapat dimuat</p>
                </div>
              </template>
            </v-img>
          </v-col>
        </v-row>
        <v-row v-if="modelEdit.preview_url">
          <v-col cols="12">
            <p class="text-subtitle-2 mb-2">Preview Gambar Baru:</p>
            <v-img :src="modelEdit.preview_url" max-height="200" contain class="rounded mb-4"></v-img>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field label="Cabang" v-model="modelEdit.cabang" class="mb-2" :rules="[rules.required]" required />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.secondary" @click="cancelEditDialog" class="ml-2">
          Batal
        </v-btn>
        <v-btn :color="app.colors.primary" @click="updateGambarHeader()" :loading="isButtonLoading" class="ml-2">
          Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog View Image -->
  <v-dialog v-model="isShowDialogImage" :max-width="$vuetify.display.mobile ? '95%' : '800px'">
    <v-card>
      <v-card-title class="dialog-header text-center">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-image</v-icon>
        <span class="dialog-title">PREVIEW GAMBAR HEADER</span>
      </v-card-title>
      <v-card-text class="pa-4">
        <div class="text-center">
          <v-img :src="imagePreviewUrl" max-height="500" contain class="rounded" @error="handleImageError">
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
              </div>
            </template>
            <template v-slot:error>
              <div class="d-flex align-center justify-center fill-height">
                <v-icon size="64" color="grey">mdi-image-broken</v-icon>
                <p class="ml-2">Gambar tidak dapat dimuat</p>
              </div>
            </template>
          </v-img>
        </div>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.primary" @click="isShowDialogImage = false">
          Tutup
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Delete Confirmation -->
  <v-dialog v-model="isShowDialogDelete" :max-width="$vuetify.display.mobile ? '95%' : '500px'">
    <v-card :color="this.app.colors.background">
      <v-card-title class="text-h5">Apakah anda yakin ingin menghapus data gambar header ini?</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.primary" @click="isShowDialogDelete = false">
          Cancel
        </v-btn>
        <v-btn :color="app.colors.secondary" @click="confirmDeleteGambarHeader(modelDelete.id)"
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
      expandedMobileCard: null, // For mobile card expansion
      contentSnackbar: {
        snackbar: false,
        text: "",
        color: "",
      },

      // Validation rules
      rules: {
        required: value => !!value || 'Field ini wajib diisi'
      },

      title: "DATA GAMBAR HEADER",
      itemsBreadcrumb: [
        {
          title: "Dashboard",
          disabled: false,
          href: "/admin/dashboard",
        },
        {
          title: "Gambar Header",
          disabled: false,
          href: "/admin/gambar-header",
        },
      ],
      isShowDialogAdd: false,
      isShowDialogEdit: false,
      isShowDialogImage: false,
      isButtonLoading: false,
      isShowDialogDelete: false,
      datatable: {
        search: "",
        headers: [
          { key: "no", title: "No", sortable: false },
          { key: "path_gambar_header", title: "Gambar", sortable: false },
          { key: "cabang", title: "Cabang" },
          { key: "action", title: "Actions", sortable: false, align: "center" },
        ],
        items: [],
      },
      modelAdd: {
        gambar_file: null,
        cabang: "",
        preview_url: null,
        gambar_file_error: "",
        cabang_error: ""
      },
      modelEdit: {
        id: "",
        gambar_file: null,
        cabang: "",
        current_image_url: null,
        preview_url: null,
      },
      modelDelete: {
        id: "",
      },
      imagePreviewUrl: "",
      isTableLoading: true,
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
        return (
          (item.cabang && item.cabang.toLowerCase().includes(searchTerm))
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

    // Helper method to display snackbar with API response
    showSnackbar(response, isError = false) {
      this.contentSnackbar.snackbar = true;

      // Extract message from different possible response structures
      let message = '';
      if (response && response.data) {
        message = response.data.message || response.data.error || '';

        // Handle cases where API returns array of errors
        if (response.data.errors && Array.isArray(response.data.errors)) {
          message = response.data.errors.join(', ');
        } else if (response.data.errors && typeof response.data.errors === 'object') {
          // Handle validation errors object
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

      // Fallback to response message if no specific message found
      if (!message && response && response.message) {
        message = response.message;
      }

      // Set default message if still no message found
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

    showDialogFormAddGambarHeader() {
      this.isShowDialogAdd = true;
      this.clearAddForm();
    },

    clearAddForm() {
      this.modelAdd.gambar_file = null;
      this.modelAdd.cabang = "";
      this.modelAdd.preview_url = null;
      this.modelAdd.gambar_file_error = "";
      this.modelAdd.cabang_error = "";
    },

    clearEditForm() {
      this.modelEdit.id = "";
      this.modelEdit.gambar_file = null;
      this.modelEdit.cabang = "";
      this.modelEdit.current_image_url = null;
      this.modelEdit.preview_url = null;
    },

    cancelAddDialog() {
      this.isShowDialogAdd = false;
      this.clearAddForm();
    },

    cancelEditDialog() {
      this.isShowDialogEdit = false;
      this.clearEditForm();
    },

    handleImageError() {
      console.log('Image failed to load');
      this.contentSnackbar.snackbar = true;
      this.contentSnackbar.text = "Gambar tidak dapat dimuat";
      this.contentSnackbar.color = this.app.colors.secondary;
    },

    // Konstruksi URL gambar dengan multiple fallback
    constructImageUrl(imagePath) {
      if (!imagePath) return null;

      console.log('Original image path:', imagePath);

      // Jika sudah berupa URL lengkap
      if (imagePath.startsWith('http')) {
        return imagePath;
      }

      // Hapus prefix yang tidak perlu
      let cleanPath = imagePath;
      if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
      }

      const baseUrl = 'https://babaapi.babaparfume.id/project/public';
      let imageUrl;

      if (cleanPath.startsWith('uploads/header/')) {
        imageUrl = `${baseUrl}/${cleanPath}`;
      } else if (cleanPath.startsWith('uploads/')) {
        imageUrl = `${baseUrl}/${cleanPath}`;
      } else if (cleanPath.startsWith('gambar_header/')) {
        imageUrl = `${baseUrl}/${cleanPath}`;
      } else if (cleanPath.startsWith('header/')) {
        imageUrl = `${baseUrl}/uploads/${cleanPath}`;
      } else {
        imageUrl = `${baseUrl}/uploads/header/${cleanPath}`;
      }

      console.log('Constructed image URL:', imageUrl);
      return imageUrl;
    },

    showImageDialog(imagePath) {
      console.log('showImageDialog called with imagePath:', imagePath);

      if (!imagePath) {
        this.showError("Path gambar tidak tersedia");
        return;
      }

      // Close mobile expansion if open
      this.expandedMobileCard = null;

      // Jika imagePath sudah berupa URL lengkap (dari processed items)
      let imageUrl = imagePath;

      // Jika masih berupa path relatif, konstruksi URL
      if (!imagePath.startsWith('http')) {
        imageUrl = this.constructImageUrl(imagePath);
      }

      console.log('Final image URL for dialog:', imageUrl);

      if (imageUrl) {
        this.imagePreviewUrl = imageUrl;
        this.isShowDialogImage = true;
      } else {
        this.showError("Path gambar tidak valid");
      }
    },

    // Event handler untuk file input
    previewAddImage(event) {
      console.log('previewAddImage called');

      // Reset error
      this.modelAdd.gambar_file_error = "";

      // Dapatkan file dari berbagai kemungkinan struktur event
      let file = null;
      if (event && event.length > 0) {
        file = event[0];
      } else if (event && event.target && event.target.files && event.target.files.length > 0) {
        file = event.target.files[0];
      } else if (event instanceof File) {
        file = event;
      } else if (this.modelAdd.gambar_file instanceof File) {
        file = this.modelAdd.gambar_file;
      }

      console.log('Selected file:', file);

      if (file) {
        // Validasi tipe file
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          this.modelAdd.gambar_file_error = "Format file tidak didukung. Gunakan JPG, PNG, atau GIF.";
          this.modelAdd.preview_url = null;
          this.modelAdd.gambar_file = null;
          return;
        }

        // Validasi ukuran file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.modelAdd.gambar_file_error = "Ukuran file terlalu besar. Maksimal 5MB.";
          this.modelAdd.preview_url = null;
          this.modelAdd.gambar_file = null;
          return;
        }

        // Buat preview
        const reader = new FileReader();
        reader.onload = (e) => {
          this.modelAdd.preview_url = e.target.result;
        };
        reader.onerror = (e) => {
          console.error('FileReader error:', e);
          this.modelAdd.gambar_file_error = "Error membaca file";
          this.modelAdd.preview_url = null;
        };
        reader.readAsDataURL(file);

        // Pastikan file tersimpan di model
        this.modelAdd.gambar_file = file;
      } else {
        this.modelAdd.preview_url = null;
      }
    },

    previewEditImage(event) {
      console.log('previewEditImage called');

      // Dapatkan file dari berbagai kemungkinan struktur event
      let file = null;
      if (event && event.length > 0) {
        file = event[0];
      } else if (event && event.target && event.target.files && event.target.files.length > 0) {
        file = event.target.files[0];
      } else if (event instanceof File) {
        file = event;
      } else if (this.modelEdit.gambar_file instanceof File) {
        file = this.modelEdit.gambar_file;
      }

      console.log('Selected file for edit:', file);

      if (file) {
        // Validasi tipe file
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
          this.contentSnackbar.snackbar = true;
          this.contentSnackbar.text = "Format file tidak didukung. Gunakan JPG, PNG, atau GIF.";
          this.contentSnackbar.color = this.app.colors.secondary;
          this.modelEdit.gambar_file = null;
          this.modelEdit.preview_url = null;
          return;
        }

        // Validasi ukuran file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          this.contentSnackbar.snackbar = true;
          this.contentSnackbar.text = "Ukuran file terlalu besar. Maksimal 5MB.";
          this.contentSnackbar.color = this.app.colors.secondary;
          this.modelEdit.gambar_file = null;
          this.modelEdit.preview_url = null;
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          this.modelEdit.preview_url = e.target.result;
        };
        reader.onerror = (e) => {
          console.error('FileReader error:', e);
          this.contentSnackbar.snackbar = true;
          this.contentSnackbar.text = "Error membaca file";
          this.contentSnackbar.color = this.app.colors.secondary;
        };
        reader.readAsDataURL(file);

        // Pastikan file tersimpan di model
        this.modelEdit.gambar_file = file;
      } else {
        this.modelEdit.preview_url = null;
      }
    },

    getAllGambarHeader() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.isTableLoading = true;
      axios
        .get("https://babaapi.babaparfume.id/api/gambar-header", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((response) => {
          console.log('API Response:', response.data);

          if (response.data.status === "success") {
            this.datatable.items = response.data.data.map(item => {
              console.log('Processing item:', item);

              // Konstruksi URL gambar yang benar
              const imageUrl = this.constructImageUrl(item.path_gambar_header);

              return {
                id: item.id,
                cabang: item.cabang,
                path_gambar_header: imageUrl || item.path_gambar_header,
                original_path: item.path_gambar_header, // Simpan path asli juga
              };
            });

            console.log('Processed items:', this.datatable.items);
          } else {
            this.showSnackbar(response, true);
          }
        })
        .catch((error) => {
          console.error('Get data error:', error);
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isTableLoading = false;
        });
    },

    validateAddForm() {
      let isValid = true;

      // Reset errors
      this.modelAdd.gambar_file_error = "";
      this.modelAdd.cabang_error = "";

      // Validasi gambar
      if (!this.modelAdd.gambar_file) {
        this.modelAdd.gambar_file_error = "Gambar harus diisi";
        isValid = false;
      }

      // Validasi cabang
      if (!this.modelAdd.cabang || !this.modelAdd.cabang.trim()) {
        this.modelAdd.cabang_error = "Cabang harus diisi";
        isValid = false;
      }

      return isValid;
    },

    async addGambarHeader() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      // Validasi form
      if (!this.validateAddForm()) {
        return;
      }

      this.isButtonLoading = true;

      try {
        const formData = new FormData();

        // Pastikan file ada dan valid
        if (this.modelAdd.gambar_file instanceof File) {
          formData.append('path_gambar_header', this.modelAdd.gambar_file);
        } else {
          throw new Error("File gambar tidak valid");
        }

        formData.append('cabang', this.modelAdd.cabang.trim());

        console.log('Sending FormData:');
        for (let pair of formData.entries()) {
          console.log(pair[0], ':', pair[1]);
        }

        const response = await axios.post(
          "https://babaapi.babaparfume.id/api/gambar-header",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
              Accept: "application/json",
            },
          }
        );

        console.log('Add response:', response.data);

        this.getAllGambarHeader();
        this.isShowDialogAdd = false;
        this.showSnackbar(response, false);

      } catch (error) {
        console.error('Add gambar header error:', error);
        this.showSnackbar(error.response || error, true);
      } finally {
        this.isButtonLoading = false;
      }
    },

    editGambarHeader(id) {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      // Close mobile expansion if open
      this.expandedMobileCard = null;

      this.clearEditForm();
      this.isShowDialogEdit = true;

      axios
        .get(`https://babaapi.babaparfume.id/api/gambar-header/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((response) => {
          console.log('Edit data response:', response.data);

          if (response.data.status === "success") {
            this.modelEdit.id = response.data.data.id;
            this.modelEdit.cabang = response.data.data.cabang;

            // Konstruksi URL gambar
            const imageUrl = this.constructImageUrl(response.data.data.path_gambar_header);
            this.modelEdit.current_image_url = imageUrl;

            console.log('Edit dialog image URL:', imageUrl);
          } else {
            this.showSnackbar(response, true);
            this.isShowDialogEdit = false;
          }
        })
        .catch((error) => {
          console.error('Edit load error:', error);
          this.showSnackbar(error.response || error, true);
          this.isShowDialogEdit = false;
        });
    },

    async updateGambarHeader() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      // Basic validation
      if (!this.modelEdit.cabang || !this.modelEdit.cabang.trim()) {
        this.showSnackbar({ data: { message: "Cabang harus diisi" } }, true);
        return;
      }

      this.isButtonLoading = true;

      try {
        const formData = new FormData();

        if (this.modelEdit.gambar_file instanceof File) {
          formData.append('path_gambar_header', this.modelEdit.gambar_file);
        }
        formData.append('cabang', this.modelEdit.cabang.trim());
        formData.append('_method', 'POST');

        console.log('Update FormData:');
        for (let pair of formData.entries()) {
          console.log(pair[0], ':', pair[1]);
        }

        const response = await axios.post(
          `https://babaapi.babaparfume.id/api/gambar-header/${this.modelEdit.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
              Accept: "application/json",
            },
          }
        );

        console.log('Update response:', response.data);

        this.getAllGambarHeader();
        this.isShowDialogEdit = false;
        this.showSnackbar(response, false);

      } catch (error) {
        console.error('Update error:', error);
        this.showSnackbar(error.response || error, true);
      } finally {
        this.isButtonLoading = false;
      }
    },

    deleteGambarHeader(id) {
      // Close mobile expansion if open
      this.expandedMobileCard = null;

      this.isShowDialogDelete = true;
      this.modelDelete.id = id;
    },

    confirmDeleteGambarHeader(id) {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.isButtonLoading = true;
      axios
        .delete(`https://babaapi.babaparfume.id/api/gambar-header/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((response) => {
          this.getAllGambarHeader();
          this.showSnackbar(response, false);
        })
        .catch((error) => {
          console.error('Delete error:', error);
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isButtonLoading = false;
          this.isShowDialogDelete = false;
        });
    },
  },

  created() {
    console.log('Gambar Header component created, loading initial data...');
    this.getAllGambarHeader();
  },

  mounted() {
    console.log('Gambar Header component mounted');
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
/* Desktop Table Styling */
:deep(.v-data-table) {
  border: 1px solid #000000;
}

:deep(.v-data-table__th) {
  background-color: #888888 !important;
  color: #FFD700 !important;
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

/* Mobile Image Styling */
.mobile-image-preview {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.mobile-image-preview:hover {
  transform: scale(1.05);
}

.mobile-thumbnail {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  width: 48px;
  height: 48px;
  overflow: hidden;
}

.mobile-thumbnail:hover {
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

/* Mobile Image Detail Styling */
.mobile-image-detail {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.mobile-image-detail:hover {
  border-color: #FFD700;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.mobile-detail-image {
  background-color: #f5f5f5;
  border-radius: 8px;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.mobile-image-detail:hover .image-overlay {
  opacity: 1;
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
  background: linear-gradient(135deg, #1a1a1a 30%, #b8941f 80%, #d4af37 100%) !important;
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

/* Custom styling untuk preview gambar */
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

  .mobile-thumbnail {
    width: 40px;
    height: 40px;
  }

  .mobile-header-title {
    font-size: 14px;
  }

  .mobile-actions .v-btn {
    font-size: 11px;
  }
}
</style>