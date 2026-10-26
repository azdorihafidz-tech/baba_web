<template>
  <Breadcrumb :items="itemsBreadcrumb" />
  <!-- Tombol Tambah Tipe Akun -->
  <div class="mb-4">
    <v-btn class="text-white font-semibold" @click="showDialogFormAddMvoType()" style="
      background: linear-gradient(135deg, #000000, #1a1a1a);
      color: #E6B422;
      border: 2px solid #E6B422;
      border-radius: 12px;
      padding: 10px 18px;
    ">
      <v-icon start style="color: #E6B422;">mdi-pen-plus</v-icon>
      <span class="ml-2">Tambah Tipe Akun</span>
    </v-btn>
  </div>

  <!-- Owner: puncak di atas TM, satu orang (bukan tipe akun di tabel) -->
  <div class="owner-strip mb-4">
    <v-icon size="20" class="owner-ikon">mdi-crown</v-icon>
    <div class="owner-teks">
      <b>OWNER</b> · puncak struktur, di atas Top Management (jenjang 0). No ID <b>OW01</b>
      <template v-if="owner"> · dipegang {{ owner.nama }}</template>.
      <span class="owner-catatan">Hanya satu orang dan bukan tipe akun, jadi tidak ada di tabel ini.</span>
    </div>
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
          <template v-slot:item.level="{ item }">
            <span class="jenjang-chip" :class="{ 'jenjang-luar': isLuarStruktur(item) }">{{ labelJenjang(item) }}</span>
          </template>
          <template v-slot:item.kode_no_id="{ item }">
            <span v-if="item.kode_mode" class="kode-chip">{{ formatKode(item) }}</span>
            <span v-else>-</span>
          </template>

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
              <v-icon v-for="n in 8" :key="n" :color="n <= (item.jlh_bintang || 0) ? '#E6B422' : '#e0e0e0'" small>
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

    <v-progress-linear v-if="isTableLoading" indeterminate color="#E6B422" class="mb-4"></v-progress-linear>

    <!-- Daftar digulir di dalam kotaknya; kolom cari & tombol halaman tetap terlihat -->
    <div v-isi-layar class="baba-gulir">
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
                  <span class="jenjang-chip" :class="{ 'jenjang-luar': isLuarStruktur(item) }">{{ labelJenjang(item) }}</span>
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
                      <v-icon v-for="n in 8" :key="n" :color="n <= (item.jlh_bintang || 0) ? '#E6B422' : '#e0e0e0'" small>
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
              </div>
            </v-card-text>
          </div>
        </v-expand-transition>
      </v-card>
    </div>
  </div>

  <!-- Dialog Tambah Tipe Akun -->
  <v-dialog v-model="isShowDialogAdd" persistent :width="$vuetify.display.mobile ? '95%' : '700'">
    <v-card class="custom-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2" style="color: #E6B422;">mdi-plus-circle</v-icon>
        <span class="dialog-title">TAMBAH DATA TIPE AKUN</span>
      </v-card-title>
      <v-card-text class="dialog-content">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field label="Name" v-model="modelAdd.name" class="mb-2 mt-4" :rules="[rules.required]" required />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field label="Level (jenjang, 0 = puncak)" v-model="modelAdd.level" type="number" min="0"
              class="mb-2 mt-4" :rules="[rules.wajibAngka]" required />
          </v-col>
          <v-col cols="12" md="6">
            <v-select label="Rating Bintang" v-model="modelAdd.jlh_bintang" :items="[1, 2, 3, 4, 5, 6, 7, 8]"
              class="mb-2 mt-4" :rules="[rules.required]" required item-title="text" item-value="value">
              <template v-slot:selection="{ item }">
                <div class="d-flex align-center">
                  <v-icon color="#E6B422" class="mr-1" small>mdi-star</v-icon>
                  <span>{{ item.value }} Bintang</span>
                </div>
              </template>
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props" :title="`${item.value} Bintang`">
                  <template v-slot:prepend>
                    <div class="d-flex align-center">
                      <v-icon v-for="n in item.value" :key="n" color="#E6B422" small class="mr-1">
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
            <KodeNoIdFields v-model="modelAdd.kode" />
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
        <v-icon class="mr-2" style="color: #E6B422;">mdi-pencil</v-icon>
        <span class="dialog-title">EDIT DATA TIPE AKUN</span>
      </v-card-title>
      <v-card-text class="dialog-content">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field label="Name" v-model="modelEdit.name" class="mb-2 mt-4" :rules="[rules.required]" required
              :disabled="tipeDipakai" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field label="Level (jenjang, 0 = puncak)" v-model="modelEdit.level" type="number" min="0"
              class="mb-2 mt-4" :rules="[rules.wajibAngka]" required :disabled="tipeDipakai" />
          </v-col>
          <v-col v-if="tipeDipakai" cols="12">
            <v-alert type="info" variant="tonal" density="compact">
              Tipe ini dipakai {{ modelEdit.jumlah_akun }} akun, jadi Name, Level, cara penomoran, dan awalan No ID
              dikunci (kode akun, approval, dan No ID bergantung padanya). Jabatan, rating bintang, dan rentang nomor
              tetap bisa diubah.
            </v-alert>
          </v-col>
          <v-col cols="12" md="6">
            <v-select label="Rating Bintang" v-model="modelEdit.jlh_bintang" :items="[1, 2, 3, 4, 5, 6, 7, 8]"
              class="mb-2 mt-4" :rules="[rules.required]" required item-title="text" item-value="value">
              <template v-slot:selection="{ item }">
                <div class="d-flex align-center">
                  <v-icon color="#E6B422" class="mr-1" small>mdi-star</v-icon>
                  <span>{{ item.value }} Bintang</span>
                </div>
              </template>
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props" :title="`${item.value} Bintang`">
                  <template v-slot:prepend>
                    <div class="d-flex align-center">
                      <v-icon v-for="n in item.value" :key="n" color="#E6B422" small class="mr-1">
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
            <KodeNoIdFields v-model="modelEdit.kode" :kunci="tipeDipakai" />
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

  <v-snackbar v-model="contentSnackbar.snackbar" :color="contentSnackbar.color">
    {{ contentSnackbar.text }}
  </v-snackbar>
</template>

<script>
import { API_URL } from "@/config";
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import CardDataTable from "@/components/ui/CardDataTable.vue";
import CardForm from "@/components/ui/CardForm.vue";
import KodeNoIdFields from "@/components/ui/KodeNoIdFields.vue";
import { useAppStore } from "@/stores/app.js";
import { muatOwner, owner } from "@/utils/owner";
import axios from "axios";
import Cookies from "js-cookie";

export default {
  components: {
    Breadcrumb,
    CardDataTable,
    CardForm,
    KodeNoIdFields,
  },

  setup() {
    const app = useAppStore();
    muatOwner();
    return {
      app,
      owner,
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
        required: value => !!value || 'Field ini wajib diisi',
        // Level boleh 0 (TM = puncak)
        wajibAngka: value => (value !== '' && value !== null && value !== undefined && !isNaN(Number(value))) || 'Level wajib diisi angka (0 = puncak)',
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
      datatable: {
        search: "",
        headers: [
          { key: "no", title: "No", sortable: false },
          { key: "name", title: "Name" },
          { key: "level", title: "Jenjang" },
          { key: "star_number", title: "Bintang", align: "center" }, // Kolom bintang + angka
          { key: "star_icon", title: "Rating", sortable: false, align: "center" }, // Kolom icon bintang
          { key: "jabatan", title: "Jabatan" },
          { key: "kode_no_id", title: "Kode No ID", sortable: false },
          { key: "action", title: "Actions", sortable: false, align: "center" },
        ],
        items: [],
      },
      modelAdd: {
        name: "",
        level: "",
        jabatan: "",
        jlh_bintang: 1, // Tambahkan ini
        kode: { kode_mode: null, kode_awalan: "", kode_mulai: null, kode_akhir: null },
      },
      modelEdit: {
        id: "",
        jumlah_akun: 0,
        name: "",
        level: "",
        jabatan: "",
        jlh_bintang: 1, // Tambahkan ini
        kode: { kode_mode: null, kode_awalan: "", kode_mulai: null, kode_akhir: null },
      },
      isTableLoading: true,
    };
  },

  computed: {
    tipeDipakai() {
      return Number(this.modelEdit.jumlah_akun) > 0;
    },
    // Filtered items for mobile search
    filteredItems() {
      if (!this.datatable.search) {
        return this.datatable.items;
      }

      const searchTerm = this.datatable.search.toLowerCase();
      return this.datatable.items.filter(item => {
        return (
          (item.name && item.name.toLowerCase().includes(searchTerm)) ||
          (item.level != null && String(item.level).includes(searchTerm)) ||
          (item.jabatan && item.jabatan.toLowerCase().includes(searchTerm)) ||
          (item.jlh_bintang && item.jlh_bintang.toString().includes(searchTerm))
        );
      });
    }
  },

  methods: {
    levelTerisi(v) {
      return v !== "" && v !== null && v !== undefined;
    },
    isLuarStruktur(item) {
      return String(item.name || "").toLowerCase() === "superadmin";
    },
    // Jenjang: 0 = jabatan teratas (TM), tepat di bawah Owner. SUPERADMIN tidak termasuk struktur jabatan.
    labelJenjang(item) {
      if (this.isLuarStruktur(item)) return "Di luar struktur";
      if (item.level === null || item.level === undefined || item.level === "") return "-";
      return Number(item.level) === 0 ? "0 · Di bawah Owner" : String(item.level);
    },
    // Ringkasan aturan No ID untuk kolom tabel: "B01–B50", "TM01, TM02, …", "Turunan upline"
    formatKode(item) {
      const pad = (n) => String(n ?? "").padStart(2, "0");
      if (item.kode_mode === "urut") return `${item.kode_awalan}01, ${item.kode_awalan}02, …`;
      if (item.kode_mode === "rentang") return `${item.kode_awalan}${pad(item.kode_mulai)}–${item.kode_awalan}${pad(item.kode_akhir)}`;
      if (item.kode_mode === "turunan") return "Turunan upline";
      return "-";
    },

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
      this.modelAdd.kode = { kode_mode: null, kode_awalan: "", kode_mulai: null, kode_akhir: null };
    },

    clearEditForm() {
      this.modelEdit.jumlah_akun = 0;
      this.modelEdit.id = "";
      this.modelEdit.name = "";
      this.modelEdit.level = "";
      this.modelEdit.jabatan = "";
      this.modelEdit.jlh_bintang = 1;
      this.modelEdit.kode = { kode_mode: null, kode_awalan: "", kode_mulai: null, kode_akhir: null };
    },

    getAllMvoType() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.isTableLoading = true;
      axios.get(`${API_URL}/api/mvo-type`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.data.status === "success") {
            this.datatable.items = response.data.data;
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

    addMvoType() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      // Basic validation
      if (!this.modelAdd.name || !this.levelTerisi(this.modelAdd.level)) {
        this.showSnackbar({ data: { message: "Name dan Level harus diisi" } }, true);
        return;
      }

      this.isButtonLoading = true;

      const payload = {
        name: this.modelAdd.name, // atau modelEdit untuk update
        level: this.modelAdd.level,
        jabatan: this.modelAdd.jabatan,
        jlh_bintang: this.modelAdd.jlh_bintang, // Ganti ke jlh_bintang
        ...this.modelAdd.kode,
      };

      axios.post(`${API_URL}/api/mvo-type`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          this.getAllMvoType();
          this.isShowDialogAdd = false;
          this.showSnackbar(response, false);
          this.clearAddForm();
        })
        .catch((error) => {
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


      axios.get(`${API_URL}/api/mvo-type/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.data.status === "success") {
            const data = response.data.data;

            this.modelEdit.id = data.id;
            this.modelEdit.name = data.name;
            this.modelEdit.level = data.level;
            // jumlah_akun ikut di daftar (khusus superadmin) → kunci field yang tidak boleh diubah
            this.modelEdit.jumlah_akun = this.datatable.items.find((t) => t.id === data.id)?.jumlah_akun || 0;
            this.modelEdit.jabatan = data.jabatan;
            this.modelEdit.jlh_bintang = data.jlh_bintang || 1;
            this.modelEdit.kode = { kode_mode: data.kode_mode, kode_awalan: data.kode_awalan || "", kode_mulai: data.kode_mulai, kode_akhir: data.kode_akhir };
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

    updateMvoType() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      // Basic validation
      if (!this.modelEdit.name || !this.levelTerisi(this.modelEdit.level)) {
        this.showSnackbar({ data: { message: "Name dan Level harus diisi" } }, true);
        return;
      }

      const payload = {
        name: this.modelEdit.name,
        level: this.modelEdit.level,
        jabatan: this.modelEdit.jabatan,
        jlh_bintang: this.modelEdit.jlh_bintang,
        ...this.modelEdit.kode,
      };


      this.isButtonLoading = true;
      axios.put(`${API_URL}/api/mvo-type/${this.modelEdit.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          this.getAllMvoType();
          this.showSnackbar(response, false);
          this.isShowDialogEdit = false;
          this.clearEditForm();
        })
        .catch((error) => {
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isButtonLoading = false;
        });
    },
  },

  created() {
    this.getAllMvoType();
  },

  mounted() {
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
.owner-strip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--baba-ink);
  color: #fff;
  border-left: 4px solid var(--baba-gold);
  font-size: 0.9rem;
  line-height: 1.45;
}

.owner-ikon {
  color: var(--baba-gold);
  margin-top: 1px;
}

.owner-teks b {
  color: var(--baba-gold);
}

.owner-catatan {
  display: block;
  font-size: 0.8rem;
  opacity: 0.7;
}

.jenjang-chip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  background: var(--baba-gold-soft);
  color: var(--baba-gold-dark);
}

.jenjang-luar {
  background: #eceff1;
  color: #607d8b;
}

.kode-chip {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 8px;
  background: var(--baba-gold-soft);
  color: var(--baba-gold-dark);
  font-weight: 700;
  font-size: 0.8rem;
  white-space: nowrap;
}

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
  background-color: var(--baba-gold-soft) !important;
  color: var(--baba-text) !important;
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
  border-color: #E6B422;
  box-shadow: 0 4px 12px rgba(230, 180, 34, 0.2);
}

.mobile-card-expanded {
  border-color: #E6B422 !important;
  box-shadow: 0 4px 16px rgba(230, 180, 34, 0.3) !important;
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
  color: #E6B422;
  background: rgba(230, 180, 34, 0.1);
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
  background: var(--baba-ink) !important;
  color: #E6B422 !important;
  padding: 20px 24px !important;
  border-bottom: 2px solid #E6B422;
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
  border-left: 3px solid #E6B422;
}

/* Loading state styling */
:deep(.v-progress-circular) {
  color: #E6B422 !important;
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
  background: #E6B422;
  border-radius: 4px;
}

.jabatan-text::-webkit-scrollbar-thumb:hover {
  background: #b8941f;
}

/* Hover effects untuk mobile cards */
.mobile-mvo-card .mobile-card-header:hover .mobile-mvo-name {
  color: #E6B422;
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
