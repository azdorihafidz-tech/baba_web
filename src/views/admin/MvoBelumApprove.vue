<template>
  <Breadcrumb :items="itemsBreadcrumb" />

  <!-- Desktop View -->
  <div class="d-none d-md-block">
    <CardDataTable title="DATA Downline - MENUNGGU APPROVE">
      <!-- SEARCH -->
      <template #search>
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search" single-line hide-details
          variant="outlined" />
      </template>

      <!-- TABLE -->
      <template #datatable>
        <v-data-table class="bg-grey-lighten-4 text-no-wrap custom-data-table" :headers="headers" :items="filteredItems"
          :loading="loading">
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
            <v-btn :color="isUserApproved(item) ? 'grey' : 'success'" size="small"
              @click="!isUserApproved(item) && showApproveDialog(item.id)" :disabled="isUserApproved(item)">
              {{ isUserApproved(item) ? 'Sudah Approve' : 'Approve' }}
            </v-btn>
          </template>

          <!-- APPROVAL COLUMNS - Convert nomor_id to nama -->
          <template #item.approval_upline_1="{ item }">
            {{ getApprovalStatusDisplay(item, 1) }}
          </template>
          <template #item.approval_upline_2="{ item }">
            {{ getApprovalStatusDisplay(item, 2) }}
          </template>
          <template #item.approval_upline_3="{ item }">
            {{ getApprovalStatusDisplay(item, 3) }}
          </template>
          <template #item.approval_upline_4="{ item }">
            {{ getApprovalStatusDisplay(item, 4) }}
          </template>
          <template #item.approval_upline_5="{ item }">
            {{ getApprovalStatusDisplay(item, 5) }}
          </template>
          <template #item.approval_upline_6="{ item }">
            {{ getApprovalStatusDisplay(item, 6) }}
          </template>
          <template #item.approval_upline_7="{ item }">
            {{ getApprovalStatusDisplay(item, 7) }}
          </template>
        </v-data-table>
      </template>
    </CardDataTable>
  </div>

  <!-- Mobile View -->
  <div class="d-block d-md-none">
    <v-card class="mobile-header-card mb-4">
      <v-card-text>
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Cari Downline..." single-line
          hide-details variant="outlined" class="search-field-mobile" />
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="loading" indeterminate color="#FFD700" class="mb-4"></v-progress-linear>

    <div v-if="filteredItems.length === 0 && !loading" class="text-center pa-4">
      <v-icon size="64" color="grey">mdi-account-search</v-icon>
      <p class="text-grey mt-2">Tidak ada data Downline ditemukan</p>
    </div>

    <v-card v-for="(item, index) in filteredItems" :key="item.id" class="mobile-mvo-card mb-3"
      @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">

      <!-- Header -->
      <v-card-text class="mobile-card-header">
        <v-row no-gutters align="center">
          <v-col cols="2" class="text-center">
            <span class="mobile-number">{{ index + 1 }}</span>
          </v-col>
          <v-col cols="8" class="pl-3">
            <div class="mobile-mvo-name">{{ item.nama }}</div>
            <div class="text-caption text-grey">{{ item.no_id }}</div>
            <div class="d-flex align-center mt-1">
              <v-chip size="x-small" color="primary" class="mr-1">{{ item.cabang }}</v-chip>
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
            <!-- Data Diri -->
            <h4 class="text-subtitle-2 mb-2 text-primary">Data Downline</h4>
            <v-row class="mb-2">
              <v-col cols="4" class="detail-label">Nama:</v-col>
              <v-col cols="8" class="detail-value">{{ item.nama || '-' }}</v-col>
            </v-row>
            <v-row class="mb-2">
              <v-col cols="4" class="detail-label">No ID:</v-col>
              <v-col cols="8" class="detail-value">{{ item.no_id || '-' }}</v-col>
            </v-row>
            <v-row class="mb-2">
              <v-col cols="4" class="detail-label">Cabang:</v-col>
              <v-col cols="8" class="detail-value">{{ item.cabang || '-' }}</v-col>
            </v-row>
            <v-row class="mb-2">
              <v-col cols="4" class="detail-label">Alamat:</v-col>
              <v-col cols="8" class="detail-value">{{ item.alamat || '-' }}</v-col>
            </v-row>

            <!-- Upline -->
            <v-divider class="my-3"></v-divider>
            <h4 class="text-subtitle-2 mb-2 text-primary">Struktur Upline</h4>
            <v-row class="mb-1" v-if="item.upline_6 && item.upline_6 !== '-'">
              <v-col cols="5" class="detail-label text-caption">Distributor:</v-col>
              <v-col cols="7" class="detail-value text-caption">{{ item.upline_6 }}</v-col>
            </v-row>
            <v-row class="mb-1" v-if="item.upline_5 && item.upline_5 !== '-'">
              <v-col cols="5" class="detail-label text-caption">Supplier:</v-col>
              <v-col cols="7" class="detail-value text-caption">{{ item.upline_5 }}</v-col>
            </v-row>
            <v-row class="mb-1" v-if="item.upline_4 && item.upline_4 !== '-'">
              <v-col cols="5" class="detail-label text-caption">General Manager:</v-col>
              <v-col cols="7" class="detail-value text-caption">{{ item.upline_4 }}</v-col>
            </v-row>
            <v-row class="mb-1" v-if="item.upline_3 && item.upline_3 !== '-'">
              <v-col cols="5" class="detail-label text-caption">Founder:</v-col>
              <v-col cols="7" class="detail-value text-caption">{{ item.upline_3 }}</v-col>
            </v-row>
            <v-row class="mb-1" v-if="item.upline_2 && item.upline_2 !== '-'">
              <v-col cols="5" class="detail-label text-caption">Regional:</v-col>
              <v-col cols="7" class="detail-value text-caption">{{ item.upline_2 }}</v-col>
            </v-row>
            <v-row class="mb-1" v-if="item.upline_1 && item.upline_1 !== '-'">
              <v-col cols="5" class="detail-label text-caption">MVO:</v-col>
              <v-col cols="7" class="detail-value text-caption">{{ item.upline_1 }}</v-col>
            </v-row>

            <!-- Approval Information -->
            <v-divider class="my-3"></v-divider>
            <h4 class="text-subtitle-2 mb-2 text-primary">Status Approval</h4>
            <v-row class="mb-1" v-if="item.upline_6 && item.upline_6 !== '-'">
              <v-col cols="5" class="detail-label text-caption">Approval Distributor:</v-col>
              <v-col cols="7" class="detail-value text-caption">{{ getApprovalStatusDisplay(item, 6) }}</v-col>
            </v-row>
            <v-row class="mb-1" v-if="item.upline_5 && item.upline_5 !== '-'">
              <v-col cols="5" class="detail-label text-caption">Approval Supplier:</v-col>
              <v-col cols="7" class="detail-value text-caption">{{ getApprovalStatusDisplay(item, 5) }}</v-col>
            </v-row>
            <v-row class="mb-1" v-if="item.upline_4 && item.upline_4 !== '-'">
              <v-col cols="5" class="detail-label text-caption">Approval GM:</v-col>
              <v-col cols="7" class="detail-value text-caption">{{ getApprovalStatusDisplay(item, 4) }}</v-col>
            </v-row>
            <v-row class="mb-1" v-if="item.upline_3 && item.upline_3 !== '-'">
              <v-col cols="5" class="detail-label text-caption">Approval Founder:</v-col>
              <v-col cols="7" class="detail-value text-caption">{{ getApprovalStatusDisplay(item, 3) }}</v-col>
            </v-row>
            <v-row class="mb-1" v-if="item.upline_2 && item.upline_2 !== '-'">
              <v-col cols="5" class="detail-label text-caption">Approval Regional:</v-col>
              <v-col cols="7" class="detail-value text-caption">{{ getApprovalStatusDisplay(item, 2) }}</v-col>
            </v-row>
            <v-row class="mb-1" v-if="item.upline_1 && item.upline_1 !== '-'">
              <v-col cols="5" class="detail-label text-caption">Approval MVO:</v-col>
              <v-col cols="7" class="detail-value text-caption">{{ getApprovalStatusDisplay(item, 1) }}</v-col>
            </v-row>
            <v-row class="mb-1" v-if="item.upline_7 && item.upline_7 !== '-'">
              <v-col cols="5" class="detail-label text-caption">Approval Reseller:</v-col>
              <v-col cols="7" class="detail-value text-caption">{{ getApprovalStatusDisplay(item, 7) }}</v-col>
            </v-row>

            <v-divider class="mb-3"></v-divider>
            <div class="mobile-actions">
              <v-btn size="small" :color="isUserApproved(item) ? 'grey' : 'success'"
                @click.stop="!isUserApproved(item) && showApproveDialog(item.id)" class="mb-2"
                prepend-icon="mdi-check-circle" style="min-width: 120px;" :disabled="isUserApproved(item)">
                {{ isUserApproved(item) ? 'Sudah Approve' : 'Approve' }}
              </v-btn>
            </div>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>
  </div>

  <!-- Dialog Konfirmasi Approve -->
  <v-dialog v-model="isShowDialogApprove" max-width="500">
    <v-card>
      <v-card-title class="text-h5">Konfirmasi Approve</v-card-title>
      <v-card-text>Apakah anda yakin ingin menyetujui data Downline ini?</v-card-text>
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
      currentUserCode: localStorage.getItem("mvo_id") || "",
      items: [],
      mvoTypeList: [],
      allMvoData: [],
      superadminTypeId: null, // ID mvo_type yang merupakan superadmin, di-set dari getAllMvoType()
      itemsBreadcrumb: [
        {
          title: "Dashboard",
          disabled: false,
          href: "/admin/dashboard",
        },
        {
          title: "Approval Downline",
          disabled: true,
          href: "#",
        },
      ],

      headers: [
        { key: "nama", title: "Nama" },
        { key: "no_id", title: "No ID" },
        { key: "cabang", title: "Cabang" },
        { key: "alamat", title: "Alamat" },
        // { key: "upline_6", title: "DISTRIBUTOR" },
        // { key: "upline_5", title: "SUPPILER" },
        // { key: "upline_4", title: "GENERAL MANAGER" },
        // { key: "upline_3", title: "FOUNDER" },
        // { key: "upline_2", title: "REGIONAL" },
        // { key: "upline_1", title: "MVO" },
        // { key: "approval_upline_6", title: "APPROVAL DISTRIBUTOR" },
        // { key: "approval_upline_5", title: "APPROVAL SUPPILER" },
        // { key: "approval_upline_4", title: "APPROVAL GENERAL MANAGER" },
        // { key: "approval_upline_3", title: "APPROVAL FOUNDER" },
        // { key: "approval_upline_2", title: "APPROVAL REGIONAL" },
        // { key: "approval_upline_1", title: "APPROVAL MVO" },
        // { key: "action", title: "Action", sortable: false },
      ],
    };
  },

  computed: {
    filteredItems() {
      // Filter superadmin berdasarkan mvo_type_id yang didapat dari API mvo-type
      // Jika superadminTypeId belum di-load, fallback ke cek nama
      let itemsWithoutSuperadmin = this.items.filter(i => {
        if (this.superadminTypeId !== null) {
          return String(i.mvo_type_id) !== String(this.superadminTypeId);
        }
        // Fallback sementara selagi mvo-type belum selesai di-load
        return i.nama && i.nama.toLowerCase() !== 'superadmin';
      });

      // "Belum approve" = akun yang belum diaktivasi (aktivasi = 0).
      // Definisi ini mengikuti hitungan "Pending" pada Dashboard Akun
      // (DashboardController: COUNT(... WHEN u.aktivasi = 0 ...)), supaya
      // jumlah yang tampil di sini konsisten dengan dashboard.
      itemsWithoutSuperadmin = itemsWithoutSuperadmin.filter(i => i.aktivasi == 0);

      // Apply search filter
      return itemsWithoutSuperadmin.filter(i => {
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
    getNamaByNomorId(nomorId) {
      if (!nomorId || nomorId === '-') return '-';
      const mvo = this.allMvoData.find(item => item.nomor_id === nomorId);
      return mvo ? mvo.nama : nomorId;
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
    getMyLevel(item) {
      if (!this.currentUserCode) return 0;
      for (let i = 1; i <= 7; i++) {
        const uplineVal = item[`upline_${i}`];
        if (uplineVal && String(uplineVal).includes(this.currentUserCode)) {
          return i;
        }
      }
      return 0;
    },
    isUserApproved(item) {
      const level = this.getMyLevel(item);
      if (level === 0) return false;
      const approvalVal = item[`approval_upline_${level}`];
      return !!approvalVal && approvalVal !== '-';
    },
    getApprovalStatusDisplay(item, level) {
      const approvalVal = item[`approval_upline_${level}`];
      const uplineVal = item[`upline_${level}`];

      if (approvalVal && approvalVal !== '-' && approvalVal !== null) {
        return this.getNamaByNomorId(approvalVal);
      }

      if (!uplineVal || uplineVal === '-') {
        return '-';
      }

      return 'Belum Approve';
    },
    async getAllMvo() {
      try {
        const token = Cookies.get("token");
        const response = await axios.get(
          "https://babaapi.babaparfume.id/api/mvo",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status === "success" && response.data.data) {
          this.allMvoData = response.data.data;
        }
      } catch (error) {
      }
    },
    async getAllMvoType() {
      try {
        const response = await axios.get(
          "https://babaapi.babaparfume.id/api/mvo-type"
        );

        if (response.data.status === "success" && response.data.data) {
          this.mvoTypeList = response.data.data;

          // Cari ID mvo_type yang namanya mengandung 'superadmin' (case-insensitive)
          const superadminType = this.mvoTypeList.find(t =>
            t.nama?.toLowerCase().includes('superadmin')
          );
          if (superadminType) {
            this.superadminTypeId = superadminType.id;
          }

          if (this.items.length > 0) {
            this.items = this.mapUserWithBintang(this.items);
          }
        }
      } catch (error) {
      }
    },
    async loadData() {
      try {
        const token = Cookies.get("token");
        const codeLogin = localStorage.getItem("mvo_id");

        const res = await axios.post(
          "https://babaapi.babaparfume.id/api/cekApprovalBawahan",
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
          "https://babaapi.babaparfume.id/api/approve",
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
        this.showSnackbar(err.response?.data?.message || "Gagal approve", "error");
      } finally {
        this.isButtonLoading = false;
      }
    },
  },

  created() {
    this.getAllMvo();
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

:deep(.v-data-table__tr:hover) {
  background-color: #f5f5f5 !important;
}

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

.mobile-number {
  font-weight: bold;
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

:deep(.v-progress-circular) {
  color: #FFD700 !important;
}

:deep(.v-progress-linear) {
  border-radius: 4px;
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

  .mobile-actions .v-btn {
    font-size: 12px;
    padding: 0 8px;
  }
}

@media (max-width: 960px) {
  .mobile-actions .v-btn {
    font-size: 12px;
    padding: 0 8px;
  }
}
</style>