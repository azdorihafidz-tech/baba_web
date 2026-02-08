<template>
  <Breadcrumb :items="itemsBreadcrumb" />

  <!-- Desktop View -->
  <div class="d-none d-md-block">
    <CardDataTable title="DATA Bawahan - MENUNGGU APPROVE">
      <!-- SEARCH -->
      <template #search>
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search" single-line hide-details
          variant="outlined" />
      </template>

      <!-- TABLE -->
      <template #datatable>
        <v-data-table :headers="headers" :items="filteredItems" :loading="loading">
          <!-- TGL -->
          <template #item.tgl_lahir="{ item }">
            {{ formatDate(item.tgl_lahir) }}
          </template>

          <!-- BINTANG -->
          <template #item.jlh_bintang="{ item }">
            <div>
              <v-icon v-for="n in Number(item.jlh_bintang)" :key="n" color="amber" size="18">
                mdi-star
              </v-icon>
            </div>
          </template>

          <!-- ACTION -->
          <template #item.action="{ item }">
            <v-btn color="success" size="small" @click="showApproveDialog(item.id)">
              Approve
            </v-btn>
          </template>
        </v-data-table>
      </template>
    </CardDataTable>
  </div>

  <!-- Mobile View -->
  <div class="d-block d-md-none">
    <v-card class="mobile-header-card mb-4">
      <v-card-text>
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Cari Bawahan..." single-line hide-details
          variant="outlined" class="search-field-mobile" />
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="loading" indeterminate color="#FFD700" class="mb-4"></v-progress-linear>

    <div v-if="filteredItems.length === 0 && !loading" class="text-center pa-4">
      <v-icon size="64" color="grey">mdi-account-search</v-icon>
      <p class="text-grey mt-2">Tidak ada data Bawahan ditemukan</p>
    </div>

    <v-card v-for="(item, index) in filteredItems" :key="item.id" class="mobile-mvo-card mb-3"
      @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">

      <!-- Header -->
      <v-card-text class="mobile-card-header">
        <v-row no-gutters align="center">
          <v-col cols="2" class="text-center">
            <span class="font-weight-bold">{{ index + 1 }}</span>
          </v-col>
          <v-col cols="8" class="pl-3">
            <div class="mobile-mvo-name">{{ item.nama }}</div>
            <div class="text-caption text-grey">{{ item.no_id }}</div>
            <div class="d-flex align-center mt-1">
              <v-chip size="x-small" color="primary" class="mr-1">{{ item.cabang }}</v-chip>
              <div class="d-flex">
                <v-icon v-for="n in Number(item.jlh_bintang)" :key="n" color="amber" size="14">mdi-star</v-icon>
              </div>
            </div>
          </v-col>
          <v-col cols="2" class="text-center">
            <v-icon :class="{ 'rotate-180': expandedMobileCard === item.id }" class="transition-all">
              mdi-chevron-down
            </v-icon>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Details -->
      <v-expand-transition>
        <div v-show="expandedMobileCard === item.id">
          <v-divider></v-divider>
          <v-card-text class="mobile-card-details">
            <v-row class="mb-2">
              <v-col cols="4" class="detail-label">Alamat:</v-col>
              <v-col cols="8" class="detail-value">{{ item.alamat || '-' }}</v-col>
            </v-row>
            <v-row class="mb-2" v-if="item.upline_1">
              <v-col cols="4" class="detail-label">Upline 1:</v-col>
              <v-col cols="8" class="detail-value">{{ item.upline_1 }}</v-col>
            </v-row>
            <v-divider class="my-3"></v-divider>
            <v-btn block color="success" @click.stop="showApproveDialog(item.id)">
              Approve
            </v-btn>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>
  </div>

  <!-- Dialog Konfirmasi Approve -->
  <v-dialog v-model="isShowDialogApprove" max-width="500">
    <v-card>
      <v-card-title class="text-h5">Konfirmasi Approve</v-card-title>
      <v-card-text>Apakah anda yakin ingin menyetujui data Bawahan ini?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="isShowDialogApprove = false">Batal</v-btn>
        <v-btn color="success" variant="text" @click="processApproveUser" :loading="isButtonLoading">Ya, Approve</v-btn>
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
import axios from "axios";
import Cookies from "js-cookie";

export default {
  components: { Breadcrumb, CardDataTable },

  data() {
    return {
      search: "",
      loading: true,
      expandedMobileCard: null,
      isShowDialogApprove: false,
      idToApprove: null,
      isButtonLoading: false,
      contentSnackbar: {
        snackbar: false,
        text: "",
        color: "",
      },
      items: [],
      mvoTypeList: [],
      itemsBreadcrumb: [
        {
          title: "Dashboard",
          disabled: false,
          href: "/admin/dashboard",
        },
        {
          title: "Approval Bawahan",
          disabled: true,
          href: "#",
        },
      ],

      headers: [
        // { key: "username", title: "Username" },
        // { key: "aktivasi", title: "Aktivasi" },
        { key: "nama", title: "Nama" },
        { key: "no_id", title: "No ID" },
        { key: "cabang", title: "Cabang" },
        // { key: "jlh_bintang", title: "Bintang" },
        // { key: "mvo_type_id", title: "Tipe MVO" },
        // { key: "nohp", title: "No HP" },
        { key: "alamat", title: "Alamat" },
        // { key: "tgl_lahir", title: "Tanggal Lahir" },
        // { key: "jenis_kelamin", title: "Jenis Kelamin" },
        // { key: "nama_panggilan", title: "Nama Panggilan" },
        // { key: "tempat_lahir", title: "Tempat Lahir" },
        // { key: "path_gambar_profile", title: "Gambar Profile" },
        { key: "upline_1", title: "Upline 1" },
        { key: "upline_2", title: "Upline 2" },
        { key: "upline_3", title: "Upline 3" },
        { key: "upline_4", title: "Upline 4" },
        { key: "upline_5", title: "Upline 5" },
        { key: "upline_6", title: "Upline 6" },
        { key: "upline_7", title: "Upline 7" },
        { key: "approval_upline_1", title: "Approval Upline 1" },
        { key: "approval_upline_2", title: "Approval Upline 2" },
        { key: "approval_upline_3", title: "Approval Upline 3" },
        { key: "approval_upline_4", title: "Approval Upline 4" },
        { key: "approval_upline_5", title: "Approval Upline 5" },
        { key: "approval_upline_6", title: "Approval Upline 6" },
        { key: "approval_upline_7", title: "Approval Upline 7" },
        { key: "action", title: "Action", sortable: false },
      ],
    };
  },

  computed: {
    filteredItems() {
      return this.items.filter(i => {
        const s = this.search.toLowerCase();
        return (
          i.nama?.toLowerCase().includes(s) ||
          i.username?.toLowerCase().includes(s)
        );
      });
    },
  },

  methods: {
    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("id-ID");
    },
    showSnackbar(text, color = "success") {
      this.contentSnackbar.text = text;
      this.contentSnackbar.color = color;
      this.contentSnackbar.snackbar = true;
    },
    toggleMobileDetail(itemId) {
      this.expandedMobileCard = this.expandedMobileCard === itemId ? null : itemId;
    },
    mapUserWithBintang(users) {
      return users.map((u) => {
        const mvo = this.mvoTypeList.find((m) => m.id == u.mvo_type_id);
        return {
          ...u,
          jlh_bintang: mvo ? mvo.jlh_bintang : 0,
        };
      });
    },
    async getAllMvoType() {
      try {
        const response = await axios.get(
          "https://babaapi.teknosof.com/api/mvo-type"
        );

        if (response.data.status === "success" && response.data.data) {
          this.mvoTypeList = response.data.data;

          // 🔥 Kalau user sudah ada → mapping ulang
          if (this.items.length > 0) {
            this.items = this.mapUserWithBintang(this.items);
          }
        }
      } catch (error) {
        console.error("Gagal memuat data jabatan", error);
      }
    },
    async loadData() {
      try {
        const token = Cookies.get("token");
        const codeLogin = localStorage.getItem("mvo_id");

        const res = await axios.post(
          "https://babaapi.teknosof.com/api/cekApprovalBawahan",
          { code: codeLogin },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const fetchedItems = res.data.data || [];
        this.items = this.mapUserWithBintang(fetchedItems);
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    showApproveDialog(id) {
      this.idToApprove = id;
      this.isShowDialogApprove = true;
    },
    async processApproveUser() {
      if (!this.idToApprove) return;
      this.isButtonLoading = true;
      try {
        const token = Cookies.get("token");
        const codeLogin = localStorage.getItem("mvo_id");

        const response = await axios.post(
          "https://babaapi.teknosof.com/api/approve",
          {
            code: codeLogin,
            id: this.idToApprove,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.showSnackbar(response.data.message, "success");
        this.isShowDialogApprove = false;
        this.loadData();
      } catch (err) {
        console.error(err);
        this.showSnackbar(err.response?.data?.message || "Gagal approve", "error");
      } finally {
        this.isButtonLoading = false;
      }
    },
  },

  created() {
    this.getAllMvoType();
    this.loadData();
  },
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