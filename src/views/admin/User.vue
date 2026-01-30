<template>
  <Breadcrumb :items="itemsBreadcrumb" />
  <!-- Tombol Tambah User -->
  <div class="mb-4">
    <v-btn class="text-dark font-semibold" @click="showDialogFormAddUser()" style="
    background: linear-gradient(135deg, #000000, #1a1a1a);
    color: #FFD700;
    border: 2px solid #FFD700;
    border-radius: 12px;
    padding: 10px 18px;
  ">
      <v-icon start style="color: #FFD700;">mdi-account-plus</v-icon>
      <span class="ml-2">Tambah User</span>
    </v-btn>

  </div>

  <!-- Desktop View - Data Table -->
  <div class="d-none d-md-block">
    <CardDataTable :title="title">
      <!-- Search -->
      <template v-slot:search>
        <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Search" single-line
          hide-details variant="outlined" class="search-field" />
      </template>

      <!-- Data Table -->
      <template v-slot:datatable>
        <v-data-table class="bg-grey-lighten-4 text-no-wrap" hover :headers="datatable.headers" :items="datatable.items"
          :search="datatable.search" :loading="isTableLoading" :items-per-page="10"
          @update:options="updateCurrentpageInfo">
          <!-- Kolom Nomor Urut -->
          <template v-slot:item.no="{ index }">
            {{ ((currentPage - 1) * itemsPerPage) + index + 1 }}
          </template>

          <!-- Kolom Otoritas -->
          <template v-slot:item.otoritas="{ item }">
            <v-chip :color="getAuthorityColor(item.otoritas)" :text-color="getAuthorityTextColor(item.otoritas)"
              size="small" variant="flat">
              {{ item.otoritas ? item.otoritas.toUpperCase() : '-' }}
            </v-chip>
          </template>

          <!-- Kolom Cabang -->
          <template v-slot:item.cabang="{ item }">
            {{ getProvinceCodeById(item.cabang) || item.cabang || '-' }}
          </template>

          <!-- Kolom Aktivasi -->
          <template v-slot:item.aktivasi="{ item }">
            <v-chip :color="item.aktivasi == 1 ? 'green' : 'red'" text-color="white" size="small" variant="flat">
              {{ item.aktivasi == 1 ? 'Active' : 'Inactive' }}
            </v-chip>
          </template>

          <!-- Kolom Jabatan -->
          <template v-slot:item.jabatan="{ item }">
            {{ getJabatanNameById(item.jabatan_id) || item.jabatan_id || '-' }}
          </template>

          <!-- Kolom Aksi -->
          <template v-slot:item.action="{ item }">
            <!-- Tombol Edit -->
            <v-tooltip text="Edit" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" :color="app.colors.primary" @click="editUser(item.id)" class="mr-2 mb-2"
                  v-bind="props" icon>
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <!-- Tombol Hapus -->
            <v-tooltip text="Hapus" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" :color="app.colors.secondary" @click="deleteUser(item.id)" class="mr-2 mb-2"
                  v-bind="props" icon>
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <!-- Tombol Aktivasi -->
            <v-tooltip text="Aktivasi" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" color="success" @click="aktivasiUser(item.id)" class="mr-2 mb-2" v-bind="props"
                  icon>
                  <v-icon>mdi-account-check</v-icon>
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
        <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Cari user..." single-line
          hide-details variant="outlined" class="search-field-mobile" />
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="isTableLoading" indeterminate color="#FFD700" class="mb-4"></v-progress-linear>

    <div v-if="filteredItems.length === 0 && !isTableLoading" class="text-center pa-4">
      <v-icon size="64" color="grey">mdi-account-search</v-icon>
      <p class="text-grey mt-2">Tidak ada data user ditemukan</p>
    </div>

    <v-card v-for="(item, index) in filteredItems" :key="item.id" class="mobile-user-card mb-3"
      @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">
      <!-- Header Card - Always Visible -->
      <v-card-text class="mobile-card-header">
        <v-row no-gutters align="center">
          <v-col cols="1" class="text-center">
            <span class="mobile-number">{{ index + 1 }}</span>
          </v-col>

          <v-col cols="9" class="pl-3">
            <div class="mobile-username">
              <strong>Username:</strong> {{ item.username }}
            </div>
            <div class="mobile-name">
              <strong>Nama:</strong> {{ item.nama }}
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
            <v-row class="mb-2">
              <v-col cols="4" class="detail-label">Nomer ID:</v-col>
              <v-col cols="8" class="detail-value">{{ item.no_id || '-' }}</v-col>
            </v-row>
            <v-row class="mb-2">
              <v-col cols="4" class="detail-label">Cabang:</v-col>
              <v-col cols="8" class="detail-value">{{ getProvinceCodeById(item.cabang) || item.cabang || '-' }}</v-col>
            </v-row>
            <v-row class="mb-2">
              <v-col cols="4" class="detail-label">Otoritas:</v-col>
              <v-col cols="8">
                <v-chip :color="getAuthorityColor(item.otoritas)" :text-color="getAuthorityTextColor(item.otoritas)"
                  size="small" variant="flat">
                  {{ item.otoritas ? item.otoritas.toUpperCase() : '-' }}
                </v-chip>
              </v-col>
            </v-row>
            <v-row class="mb-2">
              <v-col cols="4" class="detail-label">Jabatan:</v-col>
              <v-col cols="8" class="detail-value">{{ getJabatanNameById(item.jabatan_id) || item.jabatan_id || '-'
              }}</v-col>
            </v-row>
            <v-row class="mb-3">
              <v-col cols="4" class="detail-label">Status:</v-col>
              <v-col cols="8">
                <v-chip :color="item.aktivasi == 1 ? 'green' : 'red'" text-color="white" size="small" variant="flat">
                  {{ item.aktivasi == 1 ? 'Active' : 'Inactive' }}
                </v-chip>
              </v-col>
            </v-row>

            <!-- Action Buttons -->
            <v-divider class="mb-3"></v-divider>
            <div class="mobile-actions">
              <v-btn size="small" :color="app.colors.primary" @click.stop="editUser(item.id)" class="mr-2 mb-2"
                prepend-icon="mdi-pencil">
                Edit
              </v-btn>
              <v-btn size="small" :color="app.colors.secondary" @click.stop="deleteUser(item.id)" class="mr-2 mb-2"
                prepend-icon="mdi-delete">
                Hapus
              </v-btn>
              <v-btn size="small" color="success" @click.stop="aktivasiUser(item.id)" class="mb-2"
                prepend-icon="mdi-account-check">
                Aktivasi
              </v-btn>
            </div>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>
  </div>

  <!-- Dialog Tambah User -->
  <v-dialog v-model="isShowDialogAdd" persistent :width="$vuetify.display.mobile ? '95%' : '900'">
    <v-card class="custom-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-account-plus</v-icon>
        <span class="dialog-title">TAMBAH DATA USER</span>
      </v-card-title>
      <v-card-text class="dialog-content">
        <v-row>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Nomer ID" v-model="modelAdd.no_id" class="mb-2 mt-4" type="text"
              :rules="[rules.required, rules.no_id]" required maxlength="16" @input="validateNoIdAdd" />
          </v-col>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Nama Lengkap" v-model="modelAdd.nama" class="mb-2 mt-4" :rules="[rules.required]"
              required />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Nama Panggilan" v-model="modelAdd.nama_panggilan" class="mb-2" />
          </v-col>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Tempat Lahir" v-model="modelAdd.tempat_lahir" class="mb-2" />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Tanggal Lahir" v-model="modelAdd.tgl_lahir" class="mb-2" type="date" />
          </v-col>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Nomor HP" v-model="modelAdd.nohp" class="mb-2" @input="validatePhoneAdd" />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-select label="Jenis Kelamin" v-model="modelAdd.jenis_kelamin" :items="jenisKelaminOptions"
              item-title="text" item-value="value" class="mb-2" variant="outlined" clearable />
          </v-col>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-select label="Class Member" v-model="modelAdd.class_member" :items="classMemberOptions" item-title="text"
              item-value="description" class="mb-2" variant="outlined" clearable />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-textarea label="Alamat Lengkap" v-model="modelAdd.alamat" class="mb-2" rows="2" auto-grow />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Username" v-model="modelAdd.username" class="mb-2" type="text"
              :rules="[rules.required]" required />
          </v-col>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Password" v-model="modelAdd.password" class="mb-2" type="password"
              :rules="[rules.required, rules.minPassword]" required />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-autocomplete label="Cabang (Provinsi)" v-model="modelAdd.cabang" :items="provinsiOptions"
              item-title="code" item-value="id" class="mb-2" variant="outlined" :loading="isProvinsiLoading"
              no-data-text="Tidak ada data provinsi" :rules="[rules.required]" required />
          </v-col>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-autocomplete label="Otoritas" v-model="modelAdd.otoritas" :items="otoritasOptions" item-title="text"
              item-value="value" class="mb-2" variant="outlined" :rules="[rules.required]" required />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-autocomplete label="Jabatan" v-model="modelAdd.jabatan_id" :items="jabatanOptions" item-title="nama"
              item-value="id" class="mb-2" variant="outlined" :loading="isJabatanLoading"
              no-data-text="Tidak ada data jabatan" />
          </v-col>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-file-input label="Foto Profil" v-model="modelAdd.path_gambar_profile"
              accept="image/png, image/jpeg, image/jpg" variant="outlined" class="mb-2" prepend-icon=""
              prepend-inner-icon="mdi-camera" @change="handleFotoProfileAddChange" />
          </v-col>
        </v-row>
        <v-row v-if="previewFotoProfileAdd">
          <v-col cols="12" class="text-center">
            <v-img :src="previewFotoProfileAdd" max-width="150" height="150" class="mx-auto rounded-xl" contain />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.secondary" @click="isShowDialogAdd = false" class="ml-2">
          Batal
        </v-btn>
        <v-btn :color="app.colors.primary" @click="addUser()" :loading="isButtonLoading" class="ml-2">
          Simpan
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Edit User -->
  <v-dialog v-model="isShowDialogEdit" persistent :width="$vuetify.display.mobile ? '95%' : '900'">
    <v-card class="custom-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-account-edit</v-icon>
        <span class="dialog-title">EDIT DATA USER</span>
      </v-card-title>
      <v-card-text class="dialog-content">
        <v-row>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Nomer ID" v-model="modelEdit.no_id" class="mb-2 mt-4" type="text"
              :rules="[rules.required, rules.no_id]" required maxlength="16" @input="validateNoIdEdit" />
          </v-col>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Nama Lengkap" v-model="modelEdit.nama" class="mb-2 mt-4" :rules="[rules.required]"
              required />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Nama Panggilan" v-model="modelEdit.nama_panggilan" class="mb-2" />
          </v-col>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Tempat Lahir" v-model="modelEdit.tempat_lahir" class="mb-2" />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Tanggal Lahir" v-model="modelEdit.tgl_lahir" class="mb-2" type="date" />
          </v-col>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Nomor HP" v-model="modelEdit.nohp" class="mb-2" @input="validatePhoneEdit" />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-select label="Jenis Kelamin" v-model="modelEdit.jenis_kelamin" :items="jenisKelaminOptions"
              item-title="text" item-value="value" class="mb-2" variant="outlined" clearable />
          </v-col>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-select label="Class Member" v-model="modelEdit.class_member" :items="classMemberOptions"
              item-title="text" item-value="value" class="mb-2" variant="outlined" clearable />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-textarea label="Alamat Lengkap" v-model="modelEdit.alamat" class="mb-2" rows="2" auto-grow />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Username" v-model="modelEdit.username" class="mb-2" type="text"
              :rules="[rules.required]" required />
          </v-col>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-text-field label="Password (kosongkan jika tidak ingin diubah)" v-model="modelEdit.password" class="mb-2"
              type="password" :rules="[rules.minPasswordOptional]" />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-select label="Cabang (Provinsi)" v-model="modelEdit.cabang" :items="provinsiOptions" item-title="code"
              item-value="id" class="mb-2" variant="outlined" :loading="isProvinsiLoading"
              no-data-text="Tidak ada data provinsi" :rules="[rules.required]" required />
          </v-col>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-select label="Otoritas" v-model="modelEdit.otoritas" :items="otoritasOptions" item-title="text"
              item-value="value" class="mb-2" variant="outlined" :rules="[rules.required]" required />
          </v-col>
        </v-row>
        <v-row>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-select label="Jabatan" v-model="modelEdit.jabatan_id" :items="jabatanOptions" item-title="nama"
              item-value="id" class="mb-2" variant="outlined" :loading="isJabatanLoading"
              no-data-text="Tidak ada data jabatan" />
          </v-col>
          <v-col :cols="$vuetify.display.mobile ? 12 : 6">
            <v-file-input label="Foto Profil (kosongkan jika tidak ingin diubah)"
              v-model="modelEdit.path_gambar_profile" accept="image/png, image/jpeg, image/jpg" variant="outlined"
              class="mb-2" prepend-icon="" prepend-inner-icon="mdi-camera" @change="handleFotoProfileEditChange" />
          </v-col>
        </v-row>
        <v-row v-if="previewFotoProfileEdit">
          <v-col cols="12" class="text-center">
            <v-img :src="previewFotoProfileEdit" max-width="150" height="150" class="mx-auto rounded-xl" contain />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.secondary" @click="isShowDialogEdit = false" class="ml-2">
          Batal
        </v-btn>
        <v-btn :color="app.colors.primary" @click="updateUser()" :loading="isButtonLoading" class="ml-2">
          Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Delete Confirmation -->
  <v-dialog v-model="isShowDialogDelete" :max-width="$vuetify.display.mobile ? '95%' : '500px'">
    <v-card :color="this.app.colors.background">
      <v-card-title class="text-h5">Apakah anda yakin ingin menghapus data user ini?</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.primary" @click="isShowDialogDelete = false">
          Cancel
        </v-btn>
        <v-btn :color="app.colors.secondary" @click="confirmDeleteUser(modelDelete.id)" :loading="isButtonLoading">
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
      expandedMobileCard: null,
      contentSnackbar: {
        snackbar: false,
        text: "",
        color: "",
      },

      rules: {
        required: value => !!value || 'Field ini wajib diisi',
        minPassword: value => (value && value.length >= 6) || 'Password minimal 6 karakter',
        minPasswordOptional: value => (!value || value.length >= 6) || 'Password minimal 6 karakter',
        // no_id: value => {
        //   if (!value) return 'Nomer ID wajib diisi';
        //   if (!/^\d+$/.test(value)) return 'Nomer ID harus berupa angka';
        //   if (value.length !== 5) return 'Nomer ID Maksimal 16 digit';
        //   return true;
        // }
      },

      title: "DATA USER",
      itemsBreadcrumb: [
        {
          title: "Dashboard",
          disabled: false,
          href: "/admin/dashboard",
        },
        {
          title: "User",
          disabled: false,
          href: "/admin/user",
        },
      ],
      isShowDialogAdd: false,
      isShowDialogEdit: false,
      isButtonLoading: false,
      isShowDialogDelete: false,
      isProvinsiLoading: false,
      isJabatanLoading: false,
      previewFotoProfileAdd: null,
      previewFotoProfileEdit: null,
      otoritasOptions: [
        { text: "Founder", value: "founder" },
        { text: "Distributor", value: "distributor" },
        { text: "MVO", value: "mvo" }
      ],
      jenisKelaminOptions: [
        { text: 'Laki-laki', value: 'L' },
        { text: 'Perempuan', value: 'P' }
      ],
      classMemberOptions: [],
      provinsiOptions: [],
      jabatanOptions: [],
      datatable: {
        search: "",
        headers: [
          { key: "no", title: "No", sortable: false },
          { key: "username", title: "Username" },
          { key: "nama", title: "Nama Lengkap" },
          { key: "no_id", title: "Nomer ID" },
          { key: "cabang", title: "Cabang" },
          { key: "otoritas", title: "Otoritas", align: "center" },
          { key: "jabatan", title: "Jabatan", align: "center" },
          { key: "aktivasi", title: "Aktivasi", align: "center" },
          { key: "action", title: "Actions", sortable: false, align: "center" }
        ],
        items: [],
      },
      modelAdd: {
        username: "",
        password: "",
        nama: "",
        nama_panggilan: "",
        no_id: "",
        tempat_lahir: "",
        tgl_lahir: "",
        jenis_kelamin: "",
        nohp: "",
        alamat: "",
        class_member: "",
        cabang: "",
        otoritas: "",
        jabatan_id: "",
        path_gambar_profile: null,
      },
      modelEdit: {
        id: "",
        username: "",
        password: "",
        nama: "",
        nama_panggilan: "",
        no_id: "",
        tempat_lahir: "",
        tgl_lahir: "",
        jenis_kelamin: "",
        nohp: "",
        alamat: "",
        class_member: "",
        cabang: "",
        otoritas: "",
        jabatan_id: "",
        path_gambar_profile: null,
      },
      modelDelete: {
        id: "",
      },
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
          (item.username && item.username.toLowerCase().includes(searchTerm)) ||
          (item.nama && item.nama.toLowerCase().includes(searchTerm)) ||
          (item.no_id && item.no_id.toLowerCase().includes(searchTerm)) ||
          (item.otoritas && item.otoritas.toLowerCase().includes(searchTerm))
        );
      });
    }
  },

  methods: {
    getAllMvoType() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      axios.get("https://babaapi.babaparfume.id/api/mvo-type", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          console.log('list mvo type', response.data);

          if (response.data.status === "success") {
            const apiData = response.data.data;

            // 🔥 mapping ke format select
            this.classMemberOptions = apiData.map(item => ({
              text: item.description,   // yang tampil di dropdown
              value: item.id            // value yang dikirim ke backend
            }));

            console.log('Options loaded:', this.classMemberOptions);
          } else {
            this.showSnackbar(response, true);
          }
        })
        .catch((error) => {
          console.error('Error loading MVO Type:', error);
          this.showSnackbar(error.response || error, true);
        });
    },

    toggleMobileDetail(itemId) {
      if (this.expandedMobileCard === itemId) {
        this.expandedMobileCard = null;
      } else {
        this.expandedMobileCard = itemId;
      }
    },

    validateNoIdAdd(event) {
      const value = event.target.value;
      this.modelAdd.no_id = value.replace(/[^0-9]/g, '');
    },

    validateNoIdEdit(event) {
      const value = event.target.value;
      this.modelEdit.no_id = value.replace(/[^0-9]/g, '');
    },

    validatePhoneAdd(event) {
      const value = event.target.value;
      this.modelAdd.nohp = value.replace(/[^0-9]/g, '');
    },

    validatePhoneEdit(event) {
      const value = event.target.value;
      this.modelEdit.nohp = value.replace(/[^0-9]/g, '');
    },

    handleFotoProfileAddChange(event) {
      const file = this.modelAdd.path_gambar_profile;

      if (file) {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          this.contentSnackbar.snackbar = true;
          this.contentSnackbar.text = 'Format file harus PNG, JPG, atau JPEG';
          this.contentSnackbar.color = this.app.colors.secondary;
          this.modelAdd.path_gambar_profile = null;
          this.previewFotoProfileAdd = null;
          return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          this.contentSnackbar.snackbar = true;
          this.contentSnackbar.text = 'Ukuran file maksimal 5MB';
          this.contentSnackbar.color = this.app.colors.secondary;
          this.modelAdd.path_gambar_profile = null;
          this.previewFotoProfileAdd = null;
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewFotoProfileAdd = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.previewFotoProfileAdd = null;
      }
    },

    handleFotoProfileEditChange(event) {
      const file = this.modelEdit.path_gambar_profile;

      if (file) {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          this.contentSnackbar.snackbar = true;
          this.contentSnackbar.text = 'Format file harus PNG, JPG, atau JPEG';
          this.contentSnackbar.color = this.app.colors.secondary;
          this.modelEdit.path_gambar_profile = null;
          this.previewFotoProfileEdit = null;
          return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          this.contentSnackbar.snackbar = true;
          this.contentSnackbar.text = 'Ukuran file maksimal 5MB';
          this.contentSnackbar.color = this.app.colors.secondary;
          this.modelEdit.path_gambar_profile = null;
          this.previewFotoProfileEdit = null;
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewFotoProfileEdit = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.previewFotoProfileEdit = null;
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

    updateCurrentpageInfo(options) {
      this.currentPage = options.page;
      this.itemsPerPage = options.itemsPerPage;
    },

    getAuthorityColor(otoritas) {
      switch (otoritas) {
        case 'founder':
          return '#9C27B0';
        case 'superadmin':
          return '#FF5722';
        case 'admin':
          return '#FF9800';
        case 'distributor':
          return '#2196F3';
        case 'mvo':
          return '#4CAF50';
        default:
          return '#9E9E9E';
      }
    },

    getAuthorityTextColor(otoritas) {
      return 'white';
    },

    getProvinceCodeById(id) {
      if (!id) return '';
      const province = this.provinsiOptions.find(p => p.id == id);
      return province ? province.code : '';
    },

    getJabatanNameById(id) {
      if (!id) return '';
      const jabatan = this.jabatanOptions.find(j => j.id == id);
      return jabatan ? jabatan.nama : '';
    },

    validateForm(model, isEdit = false) {
      const errors = [];

      if (!model.username) errors.push('Username wajib diisi');
      if (!isEdit && !model.password) errors.push('Password wajib diisi');
      if (model.password && model.password.length < 6) errors.push('Password minimal 6 karakter');
      if (!model.nama) errors.push('Nama lengkap wajib diisi');
      if (!model.no_id) errors.push('Nomer ID wajib diisi');
      // if (model.no_id && (!/^\d+$/.test(model.no_id) || model.no_id.length !== 5)) {
      //   errors.push('Nomer ID Maksimal 16 digit angka');
      // }
      if (!model.cabang) errors.push('Cabang wajib dipilih');
      if (!model.otoritas) errors.push('Otoritas wajib dipilih');

      return errors;
    },

    getAllProvinsi() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.isProvinsiLoading = true;
      axios
        .get("https://babaapi.babaparfume.id/api/provinsi", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data.status === "success") {
            this.provinsiOptions = response.data.data;
            console.log('Data provinsi berhasil dimuat:', this.provinsiOptions.length, 'provinsi');
          } else {
            this.showSnackbar(response, true);
          }
        })
        .catch((error) => {
          console.error('Error loading provinsi:', error);
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isProvinsiLoading = false;
        });
    },

    getAllJabatan() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.isJabatanLoading = true;
      axios
        .get("https://babaapi.babaparfume.id/api/jabatan", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data.status === "success") {
            this.jabatanOptions = response.data.data.map(jabatan => ({
              id: jabatan.id,
              nama: jabatan.nama || jabatan.nama || 'Nama Jabatan Tidak Tersedia'
            }));
            console.log('Data jabatan berhasil dimuat:', this.jabatanOptions.length, 'jabatan');
          } else {
            this.showSnackbar(response, true);
          }
        })
        .catch((error) => {
          console.error('Error loading jabatan:', error);
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isJabatanLoading = false;
        });
    },

    showDialogFormAddUser() {
      this.isShowDialogAdd = true;
      this.clearAddForm();
      if (this.provinsiOptions.length === 0) {
        this.getAllProvinsi();
      }
      if (this.jabatanOptions.length === 0) {
        this.getAllJabatan();
      }
    },

    clearAddForm() {
      this.modelAdd = {
        username: "",
        password: "",
        nama: "",
        nama_panggilan: "",
        no_id: "",
        tempat_lahir: "",
        tgl_lahir: "",
        jenis_kelamin: "",
        nohp: "",
        alamat: "",
        class_member: "",
        cabang: "",
        otoritas: "",
        jabatan_id: "",
        path_gambar_profile: null,
      };
      this.previewFotoProfileAdd = null;
    },

    clearEditForm() {
      this.modelEdit = {
        id: "",
        username: "",
        password: "",
        nama: "",
        nama_panggilan: "",
        no_id: "",
        tempat_lahir: "",
        tgl_lahir: "",
        jenis_kelamin: "",
        nohp: "",
        alamat: "",
        class_member: "",
        cabang: "",
        otoritas: "",
        jabatan_id: "",
        path_gambar_profile: null,
      };
      this.previewFotoProfileEdit = null;
    },

    getAllUser() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.isTableLoading = true;
      axios
        .get("https://babaapi.babaparfume.id/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data.status === "success") {
            this.datatable.items = response.data.data.filter(user =>
              user.otoritas !== 'superadmin'
            );

            console.log('Data user berhasil dimuat:', this.datatable.items.length, 'users');
          } else {
            this.showSnackbar(response, true);
          }
        })
        .catch((error) => {
          console.error('Error loading users:', error);
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isTableLoading = false;
        });
    },

    addUser() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      const errors = this.validateForm(this.modelAdd);
      if (errors.length > 0) {
        this.contentSnackbar.snackbar = true;
        this.contentSnackbar.text = errors.join(', ');
        this.contentSnackbar.color = this.app.colors.secondary;
        return;
      }

      const formData = new FormData();

      formData.append('username', this.modelAdd.username);
      formData.append('password', this.modelAdd.password);
      formData.append('nama', this.modelAdd.nama);
      formData.append('nama_panggilan', this.modelAdd.nama_panggilan || '');
      formData.append('no_id', this.modelAdd.no_id);
      formData.append('tempat_lahir', this.modelAdd.tempat_lahir || '');
      formData.append('tgl_lahir', this.modelAdd.tgl_lahir || '');
      formData.append('jenis_kelamin', this.modelAdd.jenis_kelamin || '');
      formData.append('nohp', this.modelAdd.nohp || '');
      formData.append('alamat', this.modelAdd.alamat || '');
      formData.append('class_member', this.modelAdd.class_member || '');
      formData.append('cabang', String(this.modelAdd.cabang));
      formData.append('otoritas', this.modelAdd.otoritas);
      formData.append('jabatan_id', String(this.modelAdd.jabatan_id || ''));

      if (this.modelAdd.path_gambar_profile) {
        formData.append('path_gambar_profile', this.modelAdd.path_gambar_profile);
      }

      console.log('Data yang akan dikirim untuk menambah user (FormData)');

      this.isButtonLoading = true;
      axios
        .post(
          "https://babaapi.babaparfume.id/api/user",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
              Accept: "application/json",
            },
          }
        )
        .then((response) => {
          console.log('Response add user:', response.data);
          this.getAllUser();
          this.isShowDialogAdd = false;
          this.showSnackbar(response, false);
          this.clearAddForm();
        })
        .catch((error) => {
          console.error('Error add user:', error.response);
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isButtonLoading = false;
        });
    },

    editUser(id) {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.expandedMobileCard = null;
      this.clearEditForm();
      this.isShowDialogEdit = true;

      if (this.provinsiOptions.length === 0) {
        this.getAllProvinsi();
      }
      if (this.jabatanOptions.length === 0) {
        this.getAllJabatan();
      }

      console.log('Mengambil data user dengan ID:', id);

      axios
        .get(`https://babaapi.babaparfume.id/api/user/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data.status === "success") {
            const userData = response.data.data;
            console.log('Data user yang diterima:', userData);

            this.modelEdit.id = userData.id;
            this.modelEdit.username = userData.username || "";
            this.modelEdit.nama = userData.nama || "";
            this.modelEdit.nama_panggilan = userData.nama_panggilan || "";
            this.modelEdit.no_id = userData.no_id || "";
            this.modelEdit.tempat_lahir = userData.tempat_lahir || "";
            this.modelEdit.tgl_lahir = userData.tgl_lahir || "";
            this.modelEdit.jenis_kelamin = userData.jenis_kelamin || "";
            this.modelEdit.nohp = userData.nohp || "";
            this.modelEdit.alamat = userData.alamat || "";
            this.modelEdit.class_member = userData.class_member || "";
            this.modelEdit.cabang = userData.cabang || "";
            this.modelEdit.otoritas = userData.otoritas || "";
            this.modelEdit.jabatan_id = userData.jabatan_id ? parseInt(userData.jabatan_id) : "";
            this.modelEdit.password = "";
            this.modelEdit.path_gambar_profile = null;

            if (userData.path_gambar_profile) {
              this.previewFotoProfileEdit = userData.path_gambar_profile;
            }

            console.log('Model edit setelah diisi:', {
              cabang: this.modelEdit.cabang,
              jabatan_id: this.modelEdit.jabatan_id,
              otoritas: this.modelEdit.otoritas
            });
          } else {
            this.showSnackbar(response, true);
            this.isShowDialogEdit = false;
          }
        })
        .catch((error) => {
          console.error('Error saat mengambil data user:', error);
          this.showSnackbar(error.response || error, true);
          this.isShowDialogEdit = false;
        });
    },

    updateUser() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      const errors = this.validateForm(this.modelEdit, true);
      if (errors.length > 0) {
        this.contentSnackbar.snackbar = true;
        this.contentSnackbar.text = errors.join(', ');
        this.contentSnackbar.color = this.app.colors.secondary;
        return;
      }

      const formData = new FormData();

      formData.append('username', this.modelEdit.username);
      formData.append('nama', this.modelEdit.nama);
      formData.append('nama_panggilan', this.modelEdit.nama_panggilan || '');
      formData.append('no_id', this.modelEdit.no_id);
      formData.append('tempat_lahir', this.modelEdit.tempat_lahir || '');
      formData.append('tgl_lahir', this.modelEdit.tgl_lahir || '');
      formData.append('jenis_kelamin', this.modelEdit.jenis_kelamin || '');
      formData.append('nohp', this.modelEdit.nohp || '');
      formData.append('alamat', this.modelEdit.alamat || '');
      formData.append('class_member', this.modelEdit.class_member || '');
      formData.append('cabang', String(this.modelEdit.cabang));
      formData.append('otoritas', this.modelEdit.otoritas);
      formData.append('jabatan_id', String(this.modelEdit.jabatan_id || ''));

      if (this.modelEdit.password && this.modelEdit.password.trim() !== "") {
        formData.append('password', this.modelEdit.password);
      }

      if (this.modelEdit.path_gambar_profile) {
        formData.append('path_gambar_profile', this.modelEdit.path_gambar_profile);
      }

      formData.append('_method', 'PUT');

      console.log('Data yang akan dikirim untuk update user (FormData)');

      this.isButtonLoading = true;
      axios
        .post(
          `https://babaapi.babaparfume.id/api/user/${this.modelEdit.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
              Accept: "application/json",
            },
          }
        )
        .then((response) => {
          console.log('Response update user:', response.data);
          this.getAllUser();
          this.showSnackbar(response, false);
          this.isShowDialogEdit = false;
          this.clearEditForm();
        })
        .catch((error) => {
          console.error('Error update user:', error.response);
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isButtonLoading = false;
        });
    },

    deleteUser(id) {
      this.expandedMobileCard = null;
      this.isShowDialogDelete = true;
      this.modelDelete.id = id;
    },

    confirmDeleteUser(id) {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.isButtonLoading = true;
      axios
        .delete(`https://babaapi.babaparfume.id/api/user/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((response) => {
          console.log('Response delete user:', response.data);
          this.getAllUser();
          this.showSnackbar(response, false);
        })
        .catch((error) => {
          console.error('Error delete user:', error.response);
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isButtonLoading = false;
          this.isShowDialogDelete = false;
        });
    },

    aktivasiUser(id) {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.expandedMobileCard = null;

      this.isButtonLoading = true;
      axios
        .post(`https://babaapi.babaparfume.id/api/user/aktivasi/${id}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((response) => {
          console.log('Response aktivasi user:', response.data);
          this.getAllUser();
          this.showSnackbar(response, false);
        })
        .catch((error) => {
          console.error('Error aktivasi user:', error.response);
          this.showSnackbar(error.response || error, true);
        })
        .finally(() => {
          this.isButtonLoading = false;
        });
    },
  },

  created() {
    console.log('Component created, loading initial data...');
    this.getAllUser();
    this.getAllProvinsi();
    this.getAllJabatan();
    this.getAllMvoType();
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
  background-color: #888888 !important;
  color: #FFD700 !important;
  font-weight: bold;
}

/* Mobile Header Card */




.search-field-mobile {
  margin-top: 8px;
}

/* Mobile User Cards */
.mobile-user-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #ffffff;
}

.mobile-user-card:hover {
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
:deep(.v-select input:required),
:deep(.v-autocomplete input:required) {
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

/* Custom styling for jabatan display */
.jabatan-display {
  color: #1976d2;
  font-weight: 500;
}

.jabatan-empty {
  color: #9e9e9e;
  font-style: italic;
}

/* Responsive breakpoints */
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