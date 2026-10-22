<template>
  <Breadcrumb :items="itemsBreadcrumb" />

  <!-- Tombol Tambah User -->
  <div class="mb-4">
    <v-btn class="text-dark font-semibold" @click="openAddDialog()" style="
    background: linear-gradient(135deg, #000000, #1a1a1a);
    color: #E6B422;
    border: 2px solid #E6B422;
    border-radius: 12px;
    padding: 10px 18px;
  ">
      <v-icon start style="color: #E6B422;">mdi-account-plus</v-icon>
      <span class="ml-2">Tambah User</span>
    </v-btn>
  </div>

  <!-- Desktop View - Data Table -->
  <div class="d-none d-md-block">
    <CardDataTable :title="title">
      <template v-slot:search>
        <FilterDaftar v-model:q="searchInput" v-model:jabatan="filterJabatan" v-model:cabang="filterCabang"
          v-model:status="filterAktivasi" :daftar-jabatan="filterMeta.jabatan" :daftar-cabang="filterMeta.cabang"
          :daftar-status="daftarStatusAktivasi" placeholder="Cari nama / username / No ID" />
      </template>

      <template v-slot:datatable>
        <v-data-table-server class="bg-grey-lighten-4 text-no-wrap custom-data-table" hover :headers="datatable.headers"
          :items="datatable.items" :items-length="totalItems" :loading="isTableLoading"
          :items-per-page="pagination.itemsPerPage" :page="pagination.page" :sort-by="pagination.sortBy"
          :items-per-page-options="[10, 25, 50, 100]" @update:options="onTableOptionsUpdate">

          <!-- Kolom atasan TM … Distributor: No ID · Nama dari struktur atasan -->
          <template v-for="lvl in jalurLevels" :key="lvl.key" #[`item.${lvl.key}`]="{ item }">
            <SelAtasan :atasan="atasanPada(item, lvl)" />
          </template>

          <template v-slot:item.no="{ index }">
            {{ ((pagination.page - 1) * pagination.itemsPerPage) + index + 1 }}
          </template>

          <template v-slot:item.jlh_bintang="{ item }">
            <div>
              <v-icon v-for="n in Number(item.jlh_bintang)" :key="n" color="amber" size="18">
                mdi-star
              </v-icon>
            </div>
          </template>

          <template v-slot:item.mvo_type_id="{ item }">
            <v-chip :color="getAuthorityColor(item.mvo_type_id)" :text-color="getAuthorityTextColor(item.mvo_type_id)"
              size="small" variant="flat">
              {{ item.mvo_type_id ? item.mvo_type_id.toUpperCase() : '-' }}
            </v-chip>
          </template>

          <template v-slot:item.cabang="{ item }">
            {{ item.cabang || '-' }}
          </template>

          <template v-slot:item.aktivasi="{ item }">
            <v-chip :color="item.aktivasi == 1 ? 'green' : 'red'" text-color="white" size="small" variant="flat">
              {{ item.aktivasi == 1 ? 'Active' : 'Inactive' }}
            </v-chip>
            <!-- Status dari menu Akun Belum Approve (ditunda / ditolak + alasan) -->
            <v-tooltip v-if="item.aktivasi != 1 && item.status_approval?.status" location="top"
              :text="`${item.status_approval.oleh_nama}: ${item.status_approval.alasan || '-'}`">
              <template #activator="{ props }">
                <span v-bind="props" class="status-mini ml-1"
                  :class="item.status_approval.status === 'ditolak' ? 'status-tolak' : 'status-tunda'">
                  {{ item.status_approval.status === 'ditolak' ? 'Ditolak' : 'Ditunda' }}
                </span>
              </template>
            </v-tooltip>
          </template>

          <template v-slot:item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>

          <template v-slot:item.jabatan="{ item }">
            {{ getJabatanNameById(item.mvo_type_id) || item.mvo_type_id || '-' }}
          </template>

          <template v-slot:item.action="{ item }">
            <v-tooltip text="Edit" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" :color="app.colors.primary" @click="editUser(item.id)" class="mr-2 mb-2"
                  v-bind="props" icon>
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Hapus" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" :color="app.colors.secondary" @click="deleteUser(item.id)" class="mr-2 mb-2"
                  v-bind="props" icon>
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Aktivasi" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" color="success" @click="aktivasiUser(item.id)" class="mr-2 mb-2" v-bind="props"
                  icon>
                  <v-icon>mdi-account-check</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </template>
        </v-data-table-server>
      </template>
    </CardDataTable>
  </div>

  <!-- Mobile View - Cards -->
  <div class="d-block d-md-none">
    <v-card class="mobile-header-card mb-4">
      <v-card-text>
        <FilterDaftar v-model:q="searchInput" v-model:jabatan="filterJabatan" v-model:cabang="filterCabang"
          v-model:status="filterAktivasi" :daftar-jabatan="filterMeta.jabatan" :daftar-cabang="filterMeta.cabang"
          :daftar-status="daftarStatusAktivasi" class="search-field-mobile" placeholder="Cari nama / username / No ID" />
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="isTableLoading" indeterminate color="#E6B422" class="mb-4"></v-progress-linear>

    <!-- Daftar digulir di dalam kotaknya; kolom cari & tombol halaman tetap terlihat -->
    <div v-isi-layar="64" class="baba-gulir">
      <div v-if="datatable.items.length === 0 && !isTableLoading" class="text-center pa-4">
        <v-icon size="64" color="grey">mdi-account-search</v-icon>
        <p class="text-grey mt-2">Tidak ada data user ditemukan</p>
      </div>

      <v-card v-for="(item, index) in datatable.items" :key="item.id" class="mobile-user-card mb-3"
        @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">

        <v-card-text class="pa-0">
          <KepalaKartuAkun :nomor="((pagination.page - 1) * pagination.itemsPerPage) + index + 1"
            :jabatan="getJabatanNameById(item.mvo_type_id) || item.mvo_type_id" :no-id="item.no_id" :cabang="item.cabang"
            :nama="item.nama" :info="[item.username, jalurRingkas(item)].filter(Boolean).join(' · ')"
            :terbuka="expandedMobileCard === item.id">
            <template #tambahan>
              <span class="status-mini" :class="Number(item.aktivasi) === 1 ? 'status-aktif' : 'status-belum'">
                {{ Number(item.aktivasi) === 1 ? 'Aktif' : 'Belum aktif' }}
              </span>
              <span v-if="Number(item.aktivasi) !== 1 && item.status_approval?.status" class="status-mini ml-1"
                :class="item.status_approval.status === 'ditolak' ? 'status-tolak' : 'status-tunda'">
                {{ item.status_approval.status === 'ditolak' ? 'Ditolak' : 'Ditunda' }}: {{ item.status_approval.alasan }}
              </span>
            </template>
          </KepalaKartuAkun>
        </v-card-text>
        <v-expand-transition>
          <div v-show="expandedMobileCard === item.id">
            <v-divider></v-divider>
            <v-card-text class="mobile-card-details">
              <v-row class="mb-2">
                <v-col cols="4" class="detail-label">NO ID:</v-col>
                <v-col cols="8" class="detail-value">{{ item.no_id || '-' }}</v-col>
              </v-row>
              <v-row class="mb-2">
                <v-col cols="4" class="detail-label">Cabang:</v-col>
                <v-col cols="8" class="detail-value">{{ item.cabang || '-' }}</v-col>
              </v-row>
              <v-row class="mb-2">
                <v-col cols="4" class="detail-label">Jabatan:</v-col>
                <v-col cols="8" class="detail-value">{{ getJabatanNameById(item.mvo_type_id) || item.mvo_type_id || '-'
                }}</v-col>
              </v-row>
              <v-row class="mb-2">
                <v-col cols="4" class="detail-label">Bintang:</v-col>
                <v-col cols="8" class="detail-value">
                  <div class="d-flex">
                    <v-icon v-for="n in Number(item.jlh_bintang)" :key="n" color="amber" size="18">
                      mdi-star
                    </v-icon>
                    <span v-if="!item.jlh_bintang || Number(item.jlh_bintang) === 0">-</span>
                  </div>
                </v-col>
              </v-row>
              <v-row v-for="lvl in jalurLevels.slice().reverse()" :key="`mob-${lvl.key}`" class="mb-2">
                <v-col cols="4" class="detail-label">{{ lvl.title }}:</v-col>
                <v-col cols="8" class="detail-value">{{ teksAtasan(item, lvl) }}</v-col>
              </v-row>
              <v-row class="mb-2">
                <v-col cols="4" class="detail-label">Tgl Registrasi:</v-col>
                <v-col cols="8" class="detail-value">{{ formatDate(item.created_at) }}</v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col cols="4" class="detail-label">Status:</v-col>
                <v-col cols="8">
                  <v-chip :color="item.aktivasi == 1 ? 'green' : 'red'" text-color="white" size="small" variant="flat">
                    {{ item.aktivasi == 1 ? 'Active' : 'Inactive' }}
                  </v-chip>
                </v-col>
              </v-row>

              <v-divider class="mb-3"></v-divider>
              <div class="mobile-actions">
                <v-btn size="small" :color="app.colors.primary" @click.stop="editUser(item.id)" class="mr-2 mb-2"
                  prepend-icon="mdi-pencil">Edit</v-btn>
                <v-btn size="small" :color="app.colors.secondary" @click.stop="deleteUser(item.id)" class="mr-2 mb-2"
                  prepend-icon="mdi-delete">Hapus</v-btn>
                <v-btn size="small" color="success" @click.stop="aktivasiUser(item.id)" class="mb-2"
                  prepend-icon="mdi-account-check">Aktivasi</v-btn>
              </div>
            </v-card-text>
          </div>
        </v-expand-transition>
      </v-card>

    </div>
    <div v-if="totalPages > 1" class="d-flex justify-center mt-3 mb-3">
      <v-pagination v-model="pagination.page" :length="totalPages" :total-visible="5" density="comfortable"
        @update:modelValue="loadItems" />
    </div>
  </div>

  <!-- Dialog Tambah / Edit User (unified) -->
  <v-dialog v-model="dialog.show" persistent :width="$vuetify.display.mobile ? '95%' : '900'">
    <v-card class="custom-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2" style="color: #E6B422;">
          {{ isEditMode ? 'mdi-account-edit' : 'mdi-account-plus' }}
        </v-icon>
        <span class="dialog-title">{{ isEditMode ? 'EDIT DATA USER' : 'TAMBAH DATA USER' }}</span>
      </v-card-title>

      <v-card-text class="dialog-content">
        <!-- DATA PRIBADI -->
        <div class="input-box">
          <div class="input-box-title">DATA PRIBADI</div>
          <v-row>
            <!-- No ID dibuat otomatis saat verifikasi; saat edit boleh diubah manual (dicek format & keunikan) -->
            <v-col v-if="isEditMode" :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="No ID" v-model="form.no_id" class="mb-2 mt-4" type="text" density="compact"
                prepend-inner-icon="mdi-card-account-details" variant="outlined" color="amber"
                base-color="grey-lighten-1" maxlength="16"
                hint="Dibuat otomatis saat verifikasi. Ubah hanya bila perlu." persistent-hint />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Nama Lengkap" v-model="form.nama" class="mb-2 mt-4" density="compact"
                prepend-inner-icon="mdi-account" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Nama Panggilan" v-model="form.nama_panggilan" class="mb-2" density="compact"
                prepend-inner-icon="mdi-account-outline" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Tempat Lahir" v-model="form.tempat_lahir" class="mb-2" density="compact"
                prepend-inner-icon="mdi-map-marker" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Tanggal Lahir" v-model="form.tgl_lahir" class="mb-2" type="date" density="compact"
                prepend-inner-icon="mdi-calendar" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Nomor HP" v-model="form.nohp" class="mb-2" @input="validatePhone" density="compact"
                prepend-inner-icon="mdi-phone" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Jenis Kelamin" v-model="form.jenis_kelamin" :items="jenisKelaminOptions"
                item-title="text" item-value="value" density="compact" prepend-inner-icon="mdi-gender-male-female"
                variant="outlined" color="amber" base-color="grey-lighten-1" clearable />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-textarea label="Alamat Lengkap" v-model="form.alamat" rows="2" auto-grow density="compact"
                prepend-inner-icon="mdi-home" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>
          </v-row>
        </div>

        <!-- STRUKTUR UPLINE -->
        <div class="box-glass">
          <div class="input-box-title">STRUKTUR UPLINE</div>
          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Jabatan" v-model="form.mvo_type_id" :items="jabatanOptions" item-title="text"
                item-value="value" :return-object="false" density="compact" prepend-inner-icon="mdi-account-group"
                variant="outlined" color="amber" base-color="grey-lighten-1" clearable />
            </v-col>
            <!-- Top Management: judul jabatan (mis. Head Office) + singkatan untuk label turunan (MVO HO) -->
            <template v-if="isTopManagement">
              <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                <v-text-field label="Judul Jabatan (mis. Head Office)" v-model="form.jabatan_khusus" density="compact"
                  prepend-inner-icon="mdi-briefcase" variant="outlined" color="amber" base-color="grey-lighten-1"
                  maxlength="100" />
              </v-col>
              <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                <v-text-field label="Singkatan (mis. HO)" v-model="form.singkatan_jabatan" density="compact"
                  prepend-inner-icon="mdi-format-letter-case-upper" variant="outlined" color="amber"
                  base-color="grey-lighten-1" maxlength="20" hint="Dipakai untuk label bawahan, contoh: MVO HO"
                  persistent-hint />
              </v-col>
            </template>
            <v-col v-if="form.mvo_type_id" :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Cabang (Provinsi)" v-model="form.cabang" :items="cabangOptions" item-title="text"
                item-value="value" density="compact" prepend-inner-icon="mdi-map-marker" variant="outlined"
                color="amber" base-color="grey-lighten-1" clearable :loading="loadingProvinsi"
                @update:modelValue="onCabangChange" />
            </v-col>

            <template v-for="lvl in cascadeLevels" :key="`form-${lvl.key}`">
              <v-col v-if="isCascadeVisible(lvl)" :cols="$vuetify.display.mobile ? 12 : 6">
                <v-select :label="lvl.formLabel" v-model="form[lvl.key]" :items="cascadeOptions[lvl.key]"
                  item-title="text" item-value="value" :loading="cascadeLoading[lvl.key]"
                  @update:modelValue="onCascadeChange(lvl, $event)" density="compact" variant="outlined" color="amber"
                  base-color="grey-lighten-1" clearable />
              </v-col>
            </template>

            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Username" v-model="form.username" type="text" density="compact"
                prepend-inner-icon="mdi-at" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>
          </v-row>

          <v-row>
            <v-col v-if="isEditMode" :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field v-model="form.password" :type="passwordVisible ? 'text' : 'password'" density="compact"
                label="Password (kosongkan jika tidak ingin diubah)" prepend-inner-icon="mdi-lock"
                :append-inner-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="passwordVisible = !passwordVisible" variant="outlined" color="amber"
                base-color="grey-lighten-1" />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-file-input :label="isEditMode ? 'Foto Profil (kosongkan jika tidak ingin diubah)' : 'Foto Profil'"
                v-model="form.path_gambar_profile" accept="image/png, image/jpeg, image/jpg" variant="outlined"
                density="compact" prepend-inner-icon="mdi-camera" color="amber" base-color="grey-lighten-1"
                @change="handleFotoProfileChange" hint="Format: PNG, JPG, JPEG • Maksimal 2 MB" persistent-hint />
            </v-col>
          </v-row>

          <v-row v-if="previewFotoProfile">
            <v-col cols="12" class="text-center">
              <v-img :src="previewFotoProfile" :max-width="isEditMode ? 150 : 100" :height="isEditMode ? 150 : 100"
                class="mx-auto my-2 rounded-xl" contain />
            </v-col>
          </v-row>
        </div>
      </v-card-text>

      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.secondary" @click="dialog.show = false" class="ml-2">Batal</v-btn>
        <v-btn :color="app.colors.primary" @click="submitUser()" :loading="isButtonLoading" class="ml-2">
          {{ isEditMode ? 'Update' : 'Simpan' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Delete Confirmation -->
  <v-dialog v-model="isShowDialogDelete" :max-width="$vuetify.display.mobile ? '95%' : '500px'">
    <v-card :color="this.app.colors.background">
      <!-- Dicek dulu ke server (GET /user/{id}/cek-hapus): data terkait harus dibereskan sebelum hapus permanen -->
      <v-card-title class="text-h6">Hapus akun {{ modelDelete.nama }}</v-card-title>
      <v-card-text>
        <div v-if="modelDelete.memeriksa" class="d-flex align-center">
          <v-progress-circular indeterminate size="18" width="2" color="#B8890F" class="mr-2" /> Memeriksa data terkait…
        </div>
        <template v-else-if="modelDelete.alasan.length">
          <v-alert type="warning" variant="tonal" density="compact" class="mb-2">
            Akun ini belum bisa dihapus. Bereskan dulu:
          </v-alert>
          <ul class="alasan-hapus">
            <li v-for="(a, i) in modelDelete.alasan" :key="i">{{ a }}</li>
          </ul>
        </template>
        <div v-else>Akun akan dihapus permanen (salinannya tersimpan di riwayat). Lanjutkan?</div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.primary" @click="isShowDialogDelete = false">
          {{ modelDelete.alasan.length ? 'Tutup' : 'Batal' }}
        </v-btn>
        <v-btn v-if="!modelDelete.memeriksa && !modelDelete.alasan.length" :color="app.colors.secondary"
          @click="confirmDeleteUser(modelDelete.id)" :loading="isButtonLoading">Ya, hapus</v-btn>
        <v-spacer></v-spacer>
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
import { useAppStore } from "@/stores/app.js";
import axios from "axios";
import Cookies from "js-cookie";
import { JALUR_LEVELS, atasanPada, teksAtasan, jalurRingkas } from "@/utils/jalur.js";

const API_BASE = `${API_URL}/api`;

const CASCADE_LEVELS = [
  { key: "upline_1", level: 1, endpoint: "mvo", formLabel: "Pilih MVO", detailLabel: "MVO" },
  { key: "upline_2", level: 2, endpoint: "regional", formLabel: "Pilih Regional", detailLabel: "Regional" },
  { key: "upline_3", level: 3, endpoint: "founder", formLabel: "Pilih Founder", detailLabel: "Founder" },
  { key: "upline_4", level: 4, endpoint: "gm", formLabel: "Pilih GM", detailLabel: "General Manager" },
  { key: "upline_5", level: 5, endpoint: "supplier", formLabel: "Pilih Supplier", detailLabel: "Supplier" },
  { key: "upline_6", level: 6, endpoint: "distributor", formLabel: "Pilih Distributor", detailLabel: "Distributor" },
];

const buildEmptyForm = () => ({
  id: "",
  no_id: "",
  jabatan_khusus: "",
  singkatan_jabatan: "",
  nama: "",
  nama_panggilan: "",
  tempat_lahir: "",
  tgl_lahir: "",
  jenis_kelamin: "",
  nohp: "",
  alamat: "",
  mvo_type_id: "",
  username: "",
  password: "",
  path_gambar_profile: null,
  cabang: "",
  upline_1: "",
  upline_2: "",
  upline_3: "",
  upline_4: "",
  upline_5: "",
  upline_6: "",
});

const buildEmptyCascadeMap = (defaultValue) =>
  CASCADE_LEVELS.reduce((acc, lvl) => {
    acc[lvl.key] = typeof defaultValue === "function" ? defaultValue() : defaultValue;
    return acc;
  }, {});

export default {
  components: { Breadcrumb, CardDataTable },

  setup() {
    const app = useAppStore();
    return { app };
  },

  data() {
    return {
      pagination: {
        page: 1,
        itemsPerPage: 10,
        sortBy: [{ key: "id", order: "desc" }],
      },
      totalItems: 0,
      searchInput: "",
      // Filter daftar (FilterDaftar): jabatan, cabang, status aktivasi; jumlah dari backend (?meta=1)
      filterJabatan: null,
      filterCabang: "",
      filterAktivasi: "",
      filterMeta: { jabatan: [], cabang: [], aktivasi: {} },
      debouncedSearch: "",
      _searchTimer: null,
      expandedMobileCard: null,
      contentSnackbar: { snackbar: false, text: "", color: "" },

      passwordVisible: false,

      title: "DATA USER",
      itemsBreadcrumb: [
        { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
        { title: "User", disabled: false, href: "/admin/user" },
      ],

      dialog: { show: false, mode: "add" },
      isButtonLoading: false,
      isShowDialogDelete: false,

      previewFotoProfile: null,
      loadingProvinsi: false,

      cascadeOptions: buildEmptyCascadeMap(() => []),
      cascadeLoading: buildEmptyCascadeMap(false),

      jenisKelaminOptions: [
        { text: "Laki-laki", value: "L" },
        { text: "Perempuan", value: "P" },
      ],
      cabangOptions: [],
      jabatanOptions: [],
      mvoTypeList: [],

      datatable: {
        headers: [
          { key: "no", title: "No", sortable: false },
          { key: "no_id", title: "NO ID" },
          { key: "username", title: "Username" },
          { key: "nama", title: "Nama Lengkap" },
          { key: "jabatan", title: "Jabatan" },
          { key: "cabang", title: "Cabang" },
          { key: "jlh_bintang", title: "Bintang" },
          ...JALUR_LEVELS.map((l) => ({ key: l.key, title: l.short, sortable: false })),
          { key: "aktivasi", title: "Aktivasi", align: "center" },
          { key: "created_at", title: "Tanggal Registrasi", align: "center" },
          { key: "action", title: "Actions", sortable: false, align: "center" },
        ],
        items: [],
      },

      form: buildEmptyForm(),
      modelDelete: { id: "", nama: "", alasan: [], memeriksa: false },
      isTableLoading: false,
    };
  },

  computed: {
    // Jabatan Top Management (TM) dipilih → tampilkan judul & singkatan jabatan
    isTopManagement() {
      const j = this.jabatanOptions.find(o => o.value == this.form.mvo_type_id);
      return !!j && j.name === "TM";
    },
    cascadeLevels: () => CASCADE_LEVELS,
    jalurLevels: () => JALUR_LEVELS,

    daftarStatusAktivasi() {
      const a = this.filterMeta.aktivasi || {};
      const n = (k) => Number(a[k] ?? 0);
      return [
        { value: "", label: "Semua status", jumlah: n(0) + n(1) },
        { value: 0, label: "Belum aktif", jumlah: n(0) },
        { value: 1, label: "Aktif", jumlah: n(1) },
      ];
    },

    isEditMode() {
      return this.dialog.mode === "edit";
    },

    hideUpline() {
      const jabatan = this.jabatanOptions.find(j => j.value == this.form.mvo_type_id);
      return jabatan ? `upline_${jabatan.level}` : null;
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.totalItems / this.pagination.itemsPerPage));
    },
  },

  methods: {
    atasanPada,
    jalurRingkas,

    gantiFilter() {
      this.expandedMobileCard = null;
      this.pagination.page = 1;
      this.loadItems();
    },
    teksAtasan,
    // ========== HELPERS ==========
    formatDate(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("id-ID");
    },

    getNamaAfterStrip(value) {
      if (!value) return "";
      const parts = value.split(" - ");
      return parts.length > 1 ? parts[1] : value;
    },

    mapUserWithBintang(users) {
      return users.map(u => {
        const mvo = this.mvoTypeList.find(m => m.id == u.mvo_type_id);
        return { ...u, jlh_bintang: mvo ? mvo.jlh_bintang : 0 };
      });
    },

    showSnackbar(text, color = "success") {
      this.contentSnackbar.text = text;
      this.contentSnackbar.color = color;
      this.contentSnackbar.snackbar = true;
    },

    toggleMobileDetail(itemId) {
      this.expandedMobileCard = this.expandedMobileCard === itemId ? null : itemId;
    },

    validatePhone(event) {
      this.form.nohp = event.target.value.replace(/[^0-9]/g, "");
    },

    handleFotoProfileChange() {
      const file = this.form.path_gambar_profile;
      if (!file) {
        this.previewFotoProfile = null;
        return;
      }
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        this.showSnackbar("Format file harus PNG, JPG, atau JPEG", "error");
        this.form.path_gambar_profile = null;
        this.previewFotoProfile = null;
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.showSnackbar("Ukuran file maksimal 2MB", "error");
        this.form.path_gambar_profile = null;
        this.previewFotoProfile = null;
        return;
      }
      const reader = new FileReader();
      reader.onload = e => { this.previewFotoProfile = e.target.result; };
      reader.readAsDataURL(file);
    },

    onTableOptionsUpdate(options) {
      const newSort = options.sortBy || this.pagination.sortBy;
      const pageChanged = this.pagination.page !== options.page;
      const ippChanged = this.pagination.itemsPerPage !== options.itemsPerPage;
      const sortChanged = JSON.stringify(this.pagination.sortBy) !== JSON.stringify(newSort);
      if (!pageChanged && !ippChanged && !sortChanged) return;
      this.pagination.page = sortChanged ? 1 : options.page;
      this.pagination.itemsPerPage = options.itemsPerPage;
      this.pagination.sortBy = newSort;
      this.loadItems();
    },

    getAuthorityColor() { return "#E6B422"; },
    getAuthorityTextColor() { return "white"; },

    getJabatanNameById(id) {
      if (!id) return "";
      const jabatan = this.jabatanOptions.find(j => j.value == id);
      return jabatan ? jabatan.text : "";
    },

    isCascadeVisible(lvl) {
      if (!this.form.cabang) return false;
      if (this.hideUpline === lvl.key) return false;
      if (lvl.level === 1) return true;
      const prevKey = `upline_${lvl.level - 1}`;
      return !!this.form[prevKey];
    },

    // ========== CASCADE LOGIC (unified) ==========
    resetCascadeFrom(level) {
      for (let i = level; i <= CASCADE_LEVELS.length; i++) {
        this.form[`upline_${i}`] = "";
      }
    },

    onCabangChange(val) {
      this.resetCascadeFrom(1);
      this.loadCascade(CASCADE_LEVELS[0], val);
    },

    onCascadeChange(lvl, val) {
      this.resetCascadeFrom(lvl.level + 1);
      const next = CASCADE_LEVELS[lvl.level];
      if (next) this.loadCascade(next, val);
    },

    buildCascadePayload(targetLevel, currentValue) {
      const payload = { cabang: this.form.cabang };
      for (let i = 1; i < targetLevel.level; i++) {
        const key = `upline_${i}`;
        payload[key] = i === targetLevel.level - 1 ? currentValue : this.form[key];
      }
      return payload;
    },

    async loadCascade(lvl, currentValue) {
      this.cascadeLoading[lvl.key] = true;
      try {
        const payload = lvl.level === 1
          ? { cabang: currentValue }
          : this.buildCascadePayload(lvl, currentValue);
        const res = await axios.post(`${API_BASE}/get/${lvl.endpoint}`, payload);
        this.cascadeOptions[lvl.key] = res.data.data.map(i => ({
          text: `${i.code} - ${i.nama}`,
          value: `${i.code} - ${i.nama}`,
        }));
      } catch {
        // Pertahankan perilaku lama: snackbar hanya ditampilkan untuk mode "add".
        if (!this.isEditMode) {
          const labelMap = {
            mvo: "MVO", regional: "Regional", founder: "Founder",
            gm: "GM", supplier: "Supplier", distributor: "Distributor",
          };
          this.showSnackbar(`Gagal memuat data ${labelMap[lvl.endpoint]}`, "error");
        }
      } finally {
        this.cascadeLoading[lvl.key] = false;
      }
    },

    // ========== DATA FETCHING ==========
    async fetchProvinsiData() {
      this.loadingProvinsi = true;
      try {
        const response = await axios.get(`${API_BASE}/provinsi`, {
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          timeout: 10000,
        });
        if (response.data.status === "success" && response.data.data) {
          this.cabangOptions = response.data.data.map(p => ({ text: p.code, value: p.code }));
        }
      } catch (error) {
        let message = "Gagal memuat data provinsi";
        if (error.response) {
          message = `Error ${error.response.status}: ${error.response.data?.message || "Server error"}`;
        } else if (error.code === "ECONNABORTED") {
          message = "Timeout saat memuat data provinsi";
        } else if (error.code === "ERR_NETWORK") {
          message = "Tidak dapat terhubung ke server provinsi";
        }
        this.showSnackbar(message, "error");
      } finally {
        this.loadingProvinsi = false;
      }
    },

    async getAllMvoType() {
      try {
        const response = await axios.get(`${API_BASE}/mvo-type`, {
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          timeout: 10000,
        });
        if (response.data.status === "success" && response.data.data) {
          this.mvoTypeList = response.data.data;
          this.jabatanOptions = response.data.data.map(item => ({
            text: item.jabatan,
            value: item.id,
            name: item.name,
            level: Number(item.level),
          }));
          if (this.datatable.items.length > 0) {
            this.datatable.items = this.mapUserWithBintang(this.datatable.items);
          }
        } else {
          this.showSnackbar("Gagal memuat data jabatan", "error");
        }
      } catch {
        this.showSnackbar("Gagal memuat data jabatan", "error");
      }
    },

    getUserCabang() {
      try {
        const headerData = JSON.parse(localStorage.getItem("headerData"));
        return headerData?.cabang || null;
      } catch { return null; }
    },

    getUserLogin() {
      try { return JSON.parse(localStorage.getItem("user")); }
      catch { return null; }
    },

    async loadItems() {
      const token = Cookies.get("token");
      if (!token) { this.$router.push({ name: "Login" }); return; }

      this.isTableLoading = true;
      const userCabang = this.getUserCabang();

      const sort = (this.pagination.sortBy && this.pagination.sortBy[0]) || { key: "id", order: "desc" };
      const params = {
        page: this.pagination.page,
        per_page: this.pagination.itemsPerPage,
        search: this.debouncedSearch || "",
        mvo_type_id: this.filterJabatan || undefined,
        cabang: this.filterCabang || undefined,
        aktivasi: this.filterAktivasi === "" ? undefined : this.filterAktivasi,
        meta: 1,
        sort_by: sort.key,
        sort_desc: sort.order === "desc",
      };
      if (userCabang) params.user_cabang = userCabang;

      try {
        const response = await axios.get(`${API_BASE}/user`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        if (response.data.status === "success") {
          this.datatable.items = this.mapUserWithBintang(response.data.data || []);
          this.totalItems = response.data.meta?.total ?? this.datatable.items.length;
          if (response.data.filter) this.filterMeta = response.data.filter;
        } else {
          this.showSnackbar(response.data.message);
        }
      } catch {
        // perilaku lama: tidak menampilkan snackbar saat error
      } finally {
        this.isTableLoading = false;
      }
    },

    // ========== DIALOG / FORM ==========
    resetForm() {
      this.form = buildEmptyForm();
      this.previewFotoProfile = null;
      this.cascadeOptions = buildEmptyCascadeMap(() => []);
    },

    openAddDialog() {
      this.dialog.mode = "add";
      this.dialog.show = true;
      this.resetForm();
      if (this.cabangOptions.length === 0) this.fetchProvinsiData();
      if (this.jabatanOptions.length === 0) this.getAllMvoType();
    },

    async editUser(id) {
      const token = Cookies.get("token");
      if (!token) { this.$router.push({ name: "Login" }); return; }

      this.expandedMobileCard = null;
      this.dialog.mode = "edit";
      this.resetForm();
      this.dialog.show = true;

      if (this.cabangOptions.length === 0) await this.fetchProvinsiData();
      if (this.jabatanOptions.length === 0) await this.getAllMvoType();

      try {
        const response = await axios.get(`${API_BASE}/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status !== "success") {
          this.showSnackbar(response.data.message);
          this.dialog.show = false;
          return;
        }

        const u = response.data.data;
        this.form.id = u.id;
        this.form.no_id = u.no_id || "";
        this.form.nama = u.nama || "";
        this.form.nama_panggilan = u.nama_panggilan || "";
        this.form.tempat_lahir = u.tempat_lahir || "";
        this.form.tgl_lahir = u.tgl_lahir || "";
        this.form.jenis_kelamin = u.jenis_kelamin || "";
        this.form.nohp = u.nohp || "";
        this.form.alamat = u.alamat || "";
        this.form.mvo_type_id = u.mvo_type_id ? parseInt(u.mvo_type_id) : "";
        this.form.username = u.username || "";
        this.form.password = "";
        this.form.cabang = u.cabang || "";
        this.form.jabatan_khusus = u.jabatan_khusus || "";
        this.form.singkatan_jabatan = u.singkatan_jabatan || "";
        this.form.path_gambar_profile = null;
        if (u.path_gambar_profile) this.previewFotoProfile = u.path_gambar_profile;

        // Load cascade options sequentially supaya value tampil tanpa klik ulang
        const savedUplines = CASCADE_LEVELS.map(lvl => u[lvl.key] || "");
        if (this.form.cabang) {
          await this.loadCascade(CASCADE_LEVELS[0], this.form.cabang);
          this.form.upline_1 = savedUplines[0];
        }
        for (let i = 1; i < CASCADE_LEVELS.length; i++) {
          if (!savedUplines[i - 1]) break;
          await this.loadCascade(CASCADE_LEVELS[i], savedUplines[i - 1]);
          this.form[CASCADE_LEVELS[i].key] = savedUplines[i];
        }
      } catch {
        this.dialog.show = false;
      }
    },

    buildUserFormData() {
      const getUplineText = (val, key) => {
        if (!val) return "";
        const opt = this.cascadeOptions[key].find(o => o.value === val);
        return opt ? opt.text : val;
      };

      const formData = new FormData();
      for (const [key, value] of Object.entries(this.form)) {
        if (key === "id") continue;
        if (key.startsWith("upline_") && key !== "upline_7") {
          formData.append(key, getUplineText(value, key) || "");
        } else {
          formData.append(key, value ?? "");
        }
      }
      return formData;
    },

    extractErrorMessage(err, fallback) {
      if (err?.response?.data) {
        const data = err.response.data;
        if (data.errors && typeof data.errors === "object") {
          return Object.values(data.errors).flat().join(" ");
        }
        if (data.message) return data.message;
      }
      if (err?.code === "ECONNABORTED") return "Koneksi timeout. Silakan coba lagi.";
      if (err?.code === "ERR_NETWORK") return "Masalah jaringan. Periksa koneksi internet Anda.";
      if (err?.message) return err.message;
      return fallback;
    },

    async submitUser() {
      this.isButtonLoading = true;

      const formData = this.buildUserFormData();
      const requestConfig = {
        headers: { "Content-Type": "multipart/form-data", Accept: "application/json", Authorization: `Bearer ${localStorage.getItem("token") || Cookies.get("token") || ""}` },
        timeout: 30000,
      };

      let url = `${API_BASE}/user`;
      if (this.isEditMode) {
        url = `${API_BASE}/user/${this.form.id}`;
        formData.append("_method", "PUT");
      }

      const fallbackMsg = this.isEditMode ? "Update user gagal" : "Tambah user gagal";
      const successMsg = this.isEditMode ? "User berhasil diupdate!" : "User berhasil ditambahkan!";

      try {
        const response = await axios.post(url, formData, requestConfig);
        if (response.status === 200 || response.status === 201) {
          this.showSnackbar(successMsg, "success");
          this.loadItems();
          this.dialog.show = false;
          this.resetForm();
        } else {
          this.showSnackbar(`Unexpected response status: ${response.status}`, "error");
        }
      } catch (error) {
        this.showSnackbar(this.extractErrorMessage(error, fallbackMsg), "error");
      } finally {
        this.isButtonLoading = false;
      }
    },

    async deleteUser(id) {
      this.expandedMobileCard = null;
      const item = this.datatable.items.find((u) => u.id === id);
      Object.assign(this.modelDelete, { id, nama: item?.nama || "", alasan: [], memeriksa: true });
      this.isShowDialogDelete = true;
      try {
        const { data } = await axios.get(`${API_BASE}/user/${id}/cek-hapus`, {
          headers: { Authorization: `Bearer ${Cookies.get("token")}`, Accept: "application/json" },
        });
        this.modelDelete.alasan = data.alasan || [];
      } catch (err) {
        this.modelDelete.alasan = [err.response?.data?.message || "Gagal memeriksa data terkait."];
      } finally {
        this.modelDelete.memeriksa = false;
      }
    },

    confirmDeleteUser(id) {
      const token = Cookies.get("token");
      if (!token) { this.$router.push({ name: "Login" }); return; }

      this.isButtonLoading = true;
      axios.delete(`${API_BASE}/user/${id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
        .then(() => {
          this.loadItems();
          this.showSnackbar("User berhasil dihapus", "success");
        })
        .catch(err => { this.showSnackbar(err.response?.data?.message, "error"); })
        .finally(() => {
          this.isButtonLoading = false;
          this.isShowDialogDelete = false;
        });
    },

    aktivasiUser(id) {
      const token = Cookies.get("token");
      if (!token) { this.$router.push({ name: "Login" }); return; }

      this.expandedMobileCard = null;
      this.isButtonLoading = true;

      axios.post(`${API_BASE}/user/aktivasi/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
        .then((response) => {
          this.loadItems();
          this.showSnackbar(response.data?.message || "Status aktivasi berhasil diubah", "success");
        })
        .catch(error => { this.showSnackbar(error.response?.data?.message, "error"); })
        .finally(() => { this.isButtonLoading = false; });
    },
  },

  created() {
    // Dari tombol Verifikasi di Akun Belum Approve: /admin/user?cari=<username>
    if (this.$route.query.cari) {
      this.searchInput = String(this.$route.query.cari);
      this.debouncedSearch = this.searchInput;
    }
    this.loadItems();
    this.fetchProvinsiData();
    this.getAllMvoType();
  },

  beforeUnmount() {
    if (this._searchTimer) clearTimeout(this._searchTimer);
  },

  watch: {
    "form.mvo_type_id"() {
      // Reset semua upline jika jabatan diubah
      this.resetCascadeFrom(1);
    },
    filterJabatan() {
      this.gantiFilter();
    },
    filterCabang() {
      this.gantiFilter();
    },
    filterAktivasi() {
      this.gantiFilter();
    },
    searchInput(val) {
      this.expandedMobileCard = null;
      if (this._searchTimer) clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => {
        this.debouncedSearch = (val || "").trim();
        this.pagination.page = 1;
        this.loadItems();
      }, 300);
    },
  },
};
</script>

<style scoped>
.alasan-hapus {
  padding-left: 18px;
  font-size: 0.88rem;
  line-height: 1.45;
}

.alasan-hapus li + li {
  margin-top: 6px;
}

.box-glass {
  position: relative;
  padding: 22px 18px;
  margin-bottom: 26px;
  border-radius: 18px;
  border: 1px solid rgba(230, 180, 34, 0.4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.box-glass-title {
  font-size: 14px;
  font-weight: bold;
  color: #E6B422;
  margin-bottom: 14px;
}

.input-box {
  border: 2px solid #E6B422;
  border-radius: 14px;
  padding: 20px 16px 16px 16px;
  margin-top: 16px;
  margin-bottom: 24px;
  position: relative;
}

.input-box-title {
  position: absolute;
  top: -12px;
  left: 18px;
  background: #1e1e1e;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: #E6B422;
  letter-spacing: 1px;
}

:deep(.v-data-table) {
  border: 1px solid #000000;
}

:deep(.v-data-table__th) {
  background-color: var(--baba-gold-soft) !important;
  color: var(--baba-text) !important;
  font-weight: bold;
}

/* Freeze kolom Actions (kolom terakhir) ke kanan */
:deep(.custom-data-table table > thead > tr > th:last-child),
:deep(.custom-data-table table > tbody > tr > td:last-child) {
  position: sticky !important;
  right: 0;
  z-index: 3;
  box-shadow: -4px 0 6px -2px rgba(0, 0, 0, 0.15);
}

:deep(.custom-data-table table > thead > tr > th:last-child) {
  background-color: var(--baba-gold-soft) !important;
  z-index: 4;
}

:deep(.custom-data-table table > tbody > tr > td:last-child) {
  background-color: #ffffff !important;
}

:deep(.custom-data-table table > tbody > tr:hover > td:last-child) {
  background-color: #f8f9fa !important;
}

.search-field-mobile {
  margin-top: 8px;
}

.mobile-user-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #ffffff;
}

.mobile-user-card:hover {
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

.mobile-username {
  font-size: 16px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.mobile-name {
  font-size: 14px;
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

.rotate-180 {
  transform: rotate(180deg);
}

.transition-all {
  transition: transform 0.3s ease;
}

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

:deep(.v-text-field input:required),
:deep(.v-select input:required),
:deep(.v-autocomplete input:required) {
  border-left: 3px solid #E6B422;
}

:deep(.v-progress-circular) {
  color: #E6B422 !important;
}

:deep(.v-progress-linear) {
  border-radius: 4px;
}

:deep(.v-messages__message) {
  color: #d32f2f !important;
  font-size: 12px;
}

.v-snackbar.success {
  background-color: #4caf50 !important;
}

.jabatan-display {
  color: #1976d2;
  font-weight: 500;
}

.jabatan-empty {
  color: #9e9e9e;
  font-style: italic;
}

@media (max-width: 960px) {
  .mobile-actions .v-btn {
    font-size: 12px;
    padding: 0 8px;
  }
}

@media (max-width: 600px) {
  .mobile-user-card {
    margin-left: 8px;
    margin-right: 8px;
  }

  .mobile-header-card {
    margin-left: 8px;
    margin-right: 8px;
  }
}
</style>
