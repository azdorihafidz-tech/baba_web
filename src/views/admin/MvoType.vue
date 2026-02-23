<template>
  <Breadcrumb :items="itemsBreadcrumb" />
  <!-- Tombol Tambah Tipe Akun -->
  <div class="mb-4">
    <v-btn class="text-white font-semibold" @click="showDialogFormAddMvoType()" style="
      background: linear-gradient(135deg, #000000, #1a1a1a);
      color: #FFD700;
      border: 2px solid #FFD700;
      border-radius: 12px;
      padding: 10px 18px;
    ">
      <v-icon start style="color: #FFD700;">mdi-pen-plus</v-icon>
      <span class="ml-2">Tambah Tipe Akun</span>
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
          <template v-slot:item.star_number="{ item }">
            <v-chip color="amber" text-color="white" small>
              <v-icon left small>mdi-star</v-icon>
              {{ item.jlh_bintang || 0 }}
            </v-chip>
          </template>

          <template v-slot:item.star_icon="{ item }">
            <div class="d-flex justify-center">
              <v-icon v-for="n in 8" :key="n" :color="n <= (item.jlh_bintang || 0) ? '#FFD700' : '#e0e0e0'" small>
                mdi-star
              </v-icon>
            </div>
          </template>
          <template v-slot:item.action="{ item }">
            <v-tooltip text="Edit" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" :color="app.colors.primary" @click="editMvoType(item.id)" class="mr-2 mb-2"
                  v-bind="props" icon>
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Hapus" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" :color="app.colors.secondary" @click="deleteMvoType(item.id)" class="mr-2 mb-2"
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
        <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Cari Tipe Akun..." single-line
          hide-details variant="outlined" class="search-field-mobile" />
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="isTableLoading" indeterminate color="#FFD700" class="mb-4"></v-progress-linear>

    <div v-if="filteredItems.length === 0 && !isTableLoading" class="text-center pa-4">
      <v-icon size="64" color="grey">mdi-format-list-bulleted-type</v-icon>
      <p class="text-grey mt-2">Tidak ada data Tipe Akun ditemukan</p>
    </div>

    <v-card v-for="(item, index) in filteredItems" :key="item.id" class="mobile-mvo-card mb-3"
      @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">
      <!-- Header Card - Always Visible -->
      <v-card-text class="mobile-card-header">
        <v-row no-gutters align="center">
          <v-col cols="1" class="text-center">
            <span class="mobile-number">{{ index + 1 }}</span>
          </v-col>

          <v-col cols="9" class="pl-3">
            <div class="mobile-mvo-name">
              <strong>{{ item.name || 'Nama Tipe Akun Tidak Tersedia' }}</strong>
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
                <strong>Nama Tipe Akun:</strong>
              </v-col>
              <v-col cols="12" class="detail-value">
                {{ item.name || '-' }}
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="12" class="detail-label">
                <strong>Level:</strong>
              </v-col>
              <v-col cols="12" class="detail-value">
                <v-chip :color="getLevelColor(item.level)" small>{{ item.level || '-' }}</v-chip>
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="12" class="detail-label">
                <strong>Rating Bintang:</strong>
              </v-col>
              <v-col cols="12" class="detail-value">
                <div class="d-flex align-center gap-2">
                  <v-chip color="amber" text-color="white" small>
                    <v-icon left small>mdi-star</v-icon>
                    {{ item.jlh_bintang || 0 }} Bintang
                  </v-chip>
                  <div class="star-display">
                    <v-icon v-for="n in 8" :key="n" :color="n <= (item.jlh_bintang || 0) ? '#FFD700' : '#e0e0e0'" small>
                      mdi-star
                    </v-icon>
                  </div>
                </div>
              </v-col>
            </v-row>

            <v-row class="mb-3">
              <v-col cols="12" class="detail-label">
                <strong>Jabatan:</strong>
              </v-col>
              <v-col cols="12" class="detail-value jabatan-text">
                {{ item.jabatan || 'Tidak ada Jabatan' }}
              </v-col>
            </v-row>

            <!-- Action Buttons -->
            <v-divider class="mb-3"></v-divider>
            <div class="mobile-actions">
              <v-btn size="small" :color="app.colors.primary" @click.stop="editMvoType(item.id)" class="mr-2 mb-2"
                prepend-icon="mdi-pencil">
                Edit
              </v-btn>
              <v-btn size="small" :color="app.colors.secondary" @click.stop="deleteMvoType(item.id)" class="mb-2"
                prepend-icon="mdi-delete">
                Hapus
              </v-btn>
            </div>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>
  </div>

  <!-- Dialog Tambah Tipe Akun -->
  <v-dialog v-model="isShowDialogAdd" persistent :width="$vuetify.display.mobile ? '95%' : '700'">
    <v-card class="custom-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-plus-circle</v-icon>
        <span class="dialog-title">TAMBAH DATA TIPE AKUN</span>
      </v-card-title>
      <v-card-text class="dialog-content">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field label="Name" v-model="modelAdd.name" class="mb-2 mt-4" :rules="[rules.required]" required />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field label="Level" v-model="modelAdd.level" class="mb-2 mt-4" :rules="[rules.required]" required />
          </v-col>
          <v-col cols="12" md="6">
            <v-select label="Rating Bintang" v-model="modelAdd.jlh_bintang" :items="[1, 2, 3, 4, 5, 6, 7, 8]"
              class="mb-2 mt-4" :rules="[rules.required]" required item-title="text" item-value="value">
              <template v-slot:selection="{ item }">
                <div class="d-flex align-center">
                  <v-icon color="#FFD700" class="mr-1" small>mdi-star</v-icon>
                  <span>{{ item.value }} Bintang</span>
                </div>
              </template>
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props" :title="`${item.value} Bintang`">
                  <template v-slot:prepend>
                    <div class="d-flex align-center">
                      <v-icon v-for="n in item.value" :key="n" color="#FFD700" small class="mr-1">
                        mdi-star
                      </v-icon>
                    </div>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-textarea label="Jabatan" v-model="modelAdd.jabatan" class="mb-2" rows="3" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.secondary" @click="isShowDialogAdd = false" class="ml-2">
          Batal
        </v-btn>
        <v-btn :color="app.colors.primary" @click="addMvoType()" :loading="isButtonLoading" class="ml-2">
          Simpan
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Edit Tipe Akun -->
  <v-dialog v-model="isShowDialogEdit" persistent :width="$vuetify.display.mobile ? '95%' : '700'">
    <v-card class="custom-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-pencil</v-icon>
        <span class="dialog-title">EDIT DATA TIPE AKUN</span>
      </v-card-title>
      <v-card-text class="dialog-content">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field label="Name" v-model="modelEdit.name" class="mb-2 mt-4" :rules="[rules.required]" required />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field label="Level" v-model="modelEdit.level" class="mb-2 mt-4" :rules="[rules.required]"
              required />
          </v-col>
          <v-col cols="12" md="6">
            <v-select label="Rating Bintang" v-model="modelEdit.jlh_bintang" :items="[1, 2, 3, 4, 5, 6, 7, 8]"
              class="mb-2 mt-4" :rules="[rules.required]" required item-title="text" item-value="value">
              <template v-slot:selection="{ item }">
                <div class="d-flex align-center">
                  <v-icon color="#FFD700" class="mr-1" small>mdi-star</v-icon>
                  <span>{{ item.value }} Bintang</span>
                </div>
              </template>
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props" :title="`${item.value} Bintang`">
                  <template v-slot:prepend>
                    <div class="d-flex align-center">
                      <v-icon v-for="n in item.value" :key="n" color="#FFD700" small class="mr-1">
                        mdi-star
                      </v-icon>
                    </div>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-textarea label="Jabatan" v-model="modelEdit.jabatan" class="mb-2" rows="3" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.secondary" @click="isShowDialogEdit = false" class="ml-2">
          Batal
        </v-btn>
        <v-btn :color="app.colors.primary" @click="updateMvoType()" :loading="isButtonLoading" class="ml-2">
          Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Delete Confirmation -->
  <v-dialog v-model="isShowDialogDelete" :max-width="$vuetify.display.mobile ? '95%' : '500px'">
    <v-card :color="this.app.colors.background">
      <v-card-title class="text-h5">Apakah anda yakin ingin menghapus data Tipe Akun ini?</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.primary" @click="isShowDialogDelete = false">
          Cancel
        </v-btn>
        <v-btn :color="app.colors.secondary" @click="confirmDeleteMvoType(modelDelete.id)" :loading="isButtonLoading">
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
import CardForm from "@/components/ui/CardForm.vue";
import { useAppStore } from "@/stores/app.js";
import axios from "axios";
import Cookies from "js-cookie";

export default {
  components: {
    Breadcrumb,
    CardDataTable,
    CardForm,
  },

  setup() {
    const app = useAppStore();
    return {
      app,
    };
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

      title: "DATA Tipe Akun",
      itemsBreadcrumb: [
        {
          title: "Dashboard",
          disabled: false,
          href: "/admin/dashboard",
        },
        {
          title: "Tipe Akun",
          disabled: false,
          href: "/admin/mvo-type",
        },
      ],
      isShowDialogAdd: false,
      isShowDialogEdit: false,
      isButtonLoading: false,
      isShowDialogDelete: false,
      datatable: {
        search: "",
        headers: [
          { key: "no", title: "No", sortable: false },
          { key: "name", title: "Name" },
          { key: "level", title: "Level" },
          { key: "star_number", title: "Bintang", align: "center" }, // Kolom bintang + angka
          { key: "star_icon", title: "Rating", sortable: false, align: "center" }, // Kolom icon bintang
          { key: "jabatan", title: "Jabatan" },
          { key: "action", title: "Actions", sortable: false, align: "center" },
        ],
        items: [],
      },
      modelAdd: {
        name: "",
        level: "",
        jabatan: "",
        jlh_bintang: 1, // Tambahkan ini
      },
      modelEdit: {
        id: "",
        name: "",
        level: "",
        jabatan: "",
        jlh_bintang: 1, // Tambahkan ini
      },
      modelDelete: {
        id: "",
      },
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
          (item.name && item.name.toLowerCase().includes(searchTerm)) ||
          (item.level && item.level.toLowerCase().includes(searchTerm)) ||
          (item.jabatan && item.jabatan.toLowerCase().includes(searchTerm)) ||
          (item.jlh_bintang && item.jlh_bintang.toString().includes(searchTerm))
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

    // Get jabatan preview for mobile cards
    getjabatanPreview(jabatan) {
      if (!jabatan) return 'Tidak ada Jabatan';
      return jabatan.length > 30 ? jabatan.substring(0, 30) + '...' : jabatan;
    },

    // Get level color for chips
    getLevelColor(level) {
      if (!level) return 'grey';
      const levelStr = level.toString().toLowerCase();
      if (levelStr.includes('1') || levelStr.includes('basic')) return 'green';
      if (levelStr.includes('2') || levelStr.includes('intermediate')) return 'orange';
      if (levelStr.includes('3') || levelStr.includes('advanced')) return 'red';
      return 'blue';
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

    showDialogFormAddMvoType() {
      this.isShowDialogAdd = true;
      this.clearAddForm();
    },

    clearAddForm() {
      this.modelAdd.name = "";
      this.modelAdd.level = "";
      this.modelAdd.jabatan = "";
      this.modelAdd.jlh_bintang = 1;
    },

    clearEditForm() {
      this.modelEdit.id = "";
      this.modelEdit.name = "";
      this.modelEdit.level = "";
      this.modelEdit.jabatan = "";
      this.modelEdit.jlh_bintang = 1;
    },

    getAllMvoType() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.isTableLoading = true;
      axios.get("https://babaapi.babaparfume.id/api/mvo-type", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.data.status === "success") {
            this.datatable.items = response.data.data;
            console.log('Data Tipe Akun berhasil dimuat:', this.datatable.items.length, 'item');
          } else {
            this.showSnackbar(response, true);
          }
        })
        .catch((error) => {
          console.error('Error loading Tipe Akun:', error);
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isTableLoading = false;
        });
    },

    addMvoType() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      // Basic validation
      if (!this.modelAdd.name || !this.modelAdd.level) {
        this.showSnackbar({ data: { message: "Name dan Level harus diisi" } }, true);
        return;
      }

      this.isButtonLoading = true;

      const payload = {
        name: this.modelAdd.name, // atau modelEdit untuk update
        level: this.modelAdd.level,
        jabatan: this.modelAdd.jabatan,
        jlh_bintang: this.modelAdd.jlh_bintang, // Ganti ke jlh_bintang
      };

      axios.post("https://babaapi.babaparfume.id/api/mvo-type", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          console.log('Response add Tipe Akun:', response.data);
          this.getAllMvoType();
          this.isShowDialogAdd = false;
          this.showSnackbar(response, false);
          this.clearAddForm();
        })
        .catch((error) => {
          console.error('Error add Tipe Akun:', error.response);
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isButtonLoading = false;
        });
    },

    editMvoType(id) {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      // Close mobile expansion if open
      this.expandedMobileCard = null;

      this.clearEditForm();
      this.isShowDialogEdit = true;

      console.log('Mengambil data Tipe Akun dengan ID:', id);

      axios.get(`https://babaapi.babaparfume.id/api/mvo-type/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.data.status === "success") {
            const data = response.data.data;
            console.log('Data Tipe Akun yang diterima:', data);

            this.modelEdit.id = data.id;
            this.modelEdit.name = data.name;
            this.modelEdit.level = data.level;
            this.modelEdit.jabatan = data.jabatan;
            this.modelEdit.jlh_bintang = data.jlh_bintang || 1;
          } else {
            this.showSnackbar(response, true);
            this.isShowDialogEdit = false;
          }
        })
        .catch((error) => {
          console.error('Error saat mengambil data Tipe Akun:', error);
          this.showSnackbar(error.response || error, true);
          this.isShowDialogEdit = false;
        });
    },

    updateMvoType() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      // Basic validation
      if (!this.modelEdit.name || !this.modelEdit.level) {
        this.showSnackbar({ data: { message: "Name dan Level harus diisi" } }, true);
        return;
      }

      const payload = {
        name: this.modelEdit.name,
        level: this.modelEdit.level,
        jabatan: this.modelEdit.jabatan,
        jlh_bintang: this.modelEdit.jlh_bintang,
      };

      console.log('Data yang akan dikirim untuk update Tipe Akun:', payload);

      this.isButtonLoading = true;
      axios.put(`https://babaapi.babaparfume.id/api/mvo-type/${this.modelEdit.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          console.log('Response update Tipe Akun:', response.data);
          this.getAllMvoType();
          this.showSnackbar(response, false);
          this.isShowDialogEdit = false;
          this.clearEditForm();
        })
        .catch((error) => {
          console.error('Error update Tipe Akun:', error.response);
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isButtonLoading = false;
        });
    },

    deleteMvoType(id) {
      // Close mobile expansion if open
      this.expandedMobileCard = null;

      this.isShowDialogDelete = true;
      this.modelDelete.id = id;
    },

    confirmDeleteMvoType(id) {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.isButtonLoading = true;
      axios.delete(`https://babaapi.babaparfume.id/api/mvo-type/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
        .then((response) => {
          console.log('Response delete Tipe Akun:', response.data);
          this.getAllMvoType();
          this.showSnackbar(response, false);
        })
        .catch((error) => {
          console.error('Error delete Tipe Akun:', error.response);
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isButtonLoading = false;
          this.isShowDialogDelete = false;
        });
    },
  },

  created() {
    console.log('Tipe Akun component created, loading initial data...');
    this.getAllMvoType();
  },

  mounted() {
    console.log('Tipe Akun component mounted');
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
/* Star display styling */
.star-display {
  display: flex;
  gap: 2px;
}

.gap-2 {
  gap: 8px;
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

/* Desktop Table Styling */
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-field-mobile {
  margin-top: 8px;
}

/* Mobile Tipe Akun Cards */
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
  font-size: 14px;
  color: #666;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.level-badge {
  font-size: 12px;
  font-weight: bold;
  color: #FFD700;
  background: rgba(255, 215, 0, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  width: fit-content;
}

.jabatan-preview {
  font-style: italic;
  font-size: 13px;
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

.jabatan-text {
  text-align: justify;
  max-height: 120px;
  overflow-y: auto;
  padding: 8px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
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

/* Custom chip styling for levels */
:deep(.v-chip) {
  font-weight: bold;
  font-size: 12px;
}

/* Responsive breakpoints */
@media (max-width: 960px) {
  .mobile-actions .v-btn {
    font-size: 12px;
    padding: 0 8px;
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

  .level-badge {
    font-size: 11px;
    padding: 1px 6px;
  }

  .mobile-mvo-preview {
    gap: 2px;
  }
}

/* Custom scrollbar untuk jabatan text */
.jabatan-text::-webkit-scrollbar {
  width: 4px;
}

.jabatan-text::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.jabatan-text::-webkit-scrollbar-thumb {
  background: #FFD700;
  border-radius: 4px;
}

.jabatan-text::-webkit-scrollbar-thumb:hover {
  background: #b8941f;
}

/* Hover effects untuk mobile cards */
.mobile-mvo-card .mobile-card-header:hover .mobile-mvo-name {
  color: #FFD700;
  transition: color 0.3s ease;
}

/* Animation untuk expand/collapse */
.v-expand-transition-enter-active,
.v-expand-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced mobile responsiveness */
@media (max-width: 480px) {
  .mobile-card-header {
    padding: 12px !important;
  }

  .mobile-card-details {
    padding: 12px !important;
  }

  .mobile-mvo-name {
    font-size: 15px;
  }

  .mobile-number {
    width: 20px;
    height: 20px;
    font-size: 11px;
  }
}
</style>