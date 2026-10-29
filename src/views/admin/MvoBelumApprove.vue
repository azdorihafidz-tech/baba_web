<template>
  <Breadcrumb :items="itemsBreadcrumb" />
  <v-alert v-if="approveDilarang" type="warning" variant="tonal" density="compact" class="mb-3" icon="mdi-cancel">
    Hak approve akun pendaftar untuk akun Anda dinonaktifkan superadmin. Daftar tetap bisa dilihat; tombol Approve, Tunda,
    Tolak, dan Pulihkan disembunyikan. Hubungi superadmin bila perlu.
  </v-alert>

  <!-- Desktop View -->
  <div class="d-none d-md-block">
    <CardDataTable title="DATA Downline - MENUNGGU APPROVE">
      <!-- SEARCH -->
      <template #search>
        <FilterDaftar v-model:q="search" v-model:jabatan="filterJabatan" v-model:cabang="filterCabang"
          v-model:status="filterStatus" :daftar-status="daftarStatus"
          :daftar-jabatan="metaFilter.jabatan" :daftar-cabang="metaFilter.cabang" placeholder="Cari nama / username / No ID" />
      </template>

      <!-- TABLE -->
      <template #datatable>
        <v-data-table class="bg-grey-lighten-4 text-no-wrap custom-data-table" :headers="headers" :items="filteredItems"
          :loading="loading">
          <!-- JABATAN & ATASAN -->
          <template #item.jabatan="{ item }">{{ namaJabatan(item.mvo_type_id) || "-" }}</template>
          <template #item.atasan="{ item }">
            <SelAtasan :atasan="atasanLangsung(item)" />
          </template>
          <template #item.jalur="{ item }">
            <span class="mobile-jalur">{{ jalurRingkas(item) || "-" }}</span>
          </template>
          <template #item.alamat="{ item }">
            <span class="alamat-ringkas" :title="item.alamat">{{ item.alamat || "-" }}</span>
          </template>
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

          <!-- STATUS & AKSI (approve / tunda / tolak / pulihkan / ke Verifikasi ID) -->
          <template #item.status="{ item }">
            <span class="status-mini" :class="kelasStatus(item)">{{ labelStatus(item) }}</span>
            <div v-if="item.status_approval?.alasan && statusAkun(item) !== 'menunggu'" class="alasan-teks">
              {{ item.status_approval.alasan }}
            </div>
          </template>
          <template #item.action="{ item }">
            <div class="aksi-baris">
              <v-btn v-for="a in aksiUntuk(item)" :key="a.key" size="small" :color="a.color" :variant="a.variant"
                :prepend-icon="a.icon" @click="jalankanAksi(a.key, item)">{{ a.label }}</v-btn>
            </div>
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
        <FilterDaftar v-model:q="search" v-model:jabatan="filterJabatan" v-model:cabang="filterCabang"
          v-model:status="filterStatus" :daftar-status="daftarStatus"
          :daftar-jabatan="metaFilter.jabatan" :daftar-cabang="metaFilter.cabang" class="search-field-mobile"
          placeholder="Cari nama / username / No ID" />
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="loading" indeterminate color="#E6B422" class="mb-4"></v-progress-linear>

    <!-- Daftar digulir di dalam kotaknya; kolom cari & tombol halaman tetap terlihat -->
    <div v-isi-layar class="baba-gulir">
      <div v-if="filteredItems.length === 0 && !loading" class="text-center pa-4">
        <v-icon size="64" color="grey">mdi-account-search</v-icon>
        <p class="text-grey mt-2">Tidak ada data Downline ditemukan</p>
      </div>

      <v-card v-for="(item, index) in filteredItems" :key="item.id" class="mobile-mvo-card mb-3"
        @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">

        <!-- Header -->
        <v-card-text class="pa-0">
          <KepalaKartuAkun :nomor="index + 1" :jabatan="namaJabatan(item.mvo_type_id)" :no-id="item.no_id"
            :cabang="item.cabang" :nama="item.nama" :no-member="noMember(item.id)" :info="teksAtasanLangsung(item)"
            :terbuka="expandedMobileCard === item.id">
            <template #tambahan>
              <span class="status-mini" :class="kelasStatus(item)">{{ labelStatus(item) }}</span>
            </template>
          </KepalaKartuAkun>
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
              <!-- No ID · Nama per jenjang (TM … Distributor) dari utils/jalur.js -->
              <template v-for="lvl in jalurLevels" :key="lvl.key">
                <v-row v-if="atasanPada(item, lvl)" class="mb-1">
                  <v-col cols="5" class="detail-label text-caption">{{ lvl.title }}:</v-col>
                  <v-col cols="7" class="detail-value text-caption">{{ teksAtasan(item, lvl) }}</v-col>
                </v-row>
              </template>

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
              <div v-if="item.status_approval?.alasan && statusAkun(item) !== 'menunggu'" class="alasan-teks mb-2">
                {{ labelStatus(item) }} oleh {{ item.status_approval.oleh_nama }}: {{ item.status_approval.alasan }}
              </div>
              <div class="mobile-actions">
                <v-btn v-for="a in aksiUntuk(item)" :key="a.key" size="small" :color="a.color" :variant="a.variant"
                  :prepend-icon="a.icon" class="mb-2" @click.stop="jalankanAksi(a.key, item)">{{ a.label }}</v-btn>
              </div>
            </v-card-text>
          </div>
        </v-expand-transition>
      </v-card>
    </div>
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

  <!-- Dialog alasan Tunda / Tolak -->
  <v-dialog v-model="dialogAlasan.show" max-width="520">
    <v-card>
      <v-card-title class="text-h6">{{ dialogAlasan.aksi === 'tolak' ? 'Tolak akun' : 'Tunda akun' }}</v-card-title>
      <v-card-text>
        <p class="mb-3">
          <b>{{ dialogAlasan.item?.nama }}</b> ({{ dialogAlasan.item?.no_id || '-' }})
          <template v-if="dialogAlasan.aksi === 'tolak'"> — akun tidak diaktifkan dan dikembalikan ke Verifikasi ID dengan status Ditolak.</template>
          <template v-else> — akun tetap di daftar dengan status Ditunda.</template>
        </p>
        <v-textarea v-model="dialogAlasan.alasan" label="Alasan (wajib)" variant="outlined" rows="3" auto-grow
          counter="500" maxlength="500" placeholder="Mis. foto KTP tidak jelas, data ganda, upline salah" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogAlasan.show = false">Batal</v-btn>
        <v-btn :color="dialogAlasan.aksi === 'tolak' ? 'error' : 'warning'" variant="flat"
          :disabled="!dialogAlasan.alasan.trim()" :loading="dialogAlasan.loading" @click="kirimAlasan">
          {{ dialogAlasan.aksi === 'tolak' ? 'Ya, tolak' : 'Ya, tunda' }}
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
import axios from "axios";
import Cookies from "js-cookie";
import { JALUR_LEVELS, atasanLangsung, atasanPada, jalurRingkas, teksAtasan } from "@/utils/jalur.js";
import { idDariNoMember, noMember } from "@/utils/noMember";
import { hakState, muatHak } from "@/utils/hakAkses";
import { muatTugas } from "@/utils/tugasMenunggu";

export default {
  components: { Breadcrumb, CardDataTable },

  setup() {
    muatHak();
    return { hakState };
  },
  data() {
    return {
      search: "",
      filterJabatan: null,
      filterCabang: "",
      filterStatus: "perlu",
      dialogAlasan: { show: false, aksi: "", item: null, alasan: "", loading: false },
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
        { key: "jabatan", title: "Jabatan" },
        { key: "status", title: "Status", sortable: false },
        { key: "atasan", title: "Upline langsung", sortable: false },
        { key: "jalur", title: "Jalur upline", sortable: false },
        { key: "alamat", title: "Alamat" },
        // Kolom terakhir dikunci di kanan (lihat CSS .custom-data-table)
        { key: "action", title: "Aksi", sortable: false, align: "center" },
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
    // Dilarang per akun oleh superadmin (menu Hak Akses, kemampuan "akun_approve"); server tetap menolak
    approveDilarang() {
      return !this.isSuperadmin && this.hakState.kemampuan.akun_approve === false;
    },
    itemsDasar() {
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
      const s = (this.search || "").toLowerCase();
      const idMember = idDariNoMember(s); // "BP-00284" → akun 284
      if (idMember) return itemsWithoutSuperadmin.filter(i => Number(i.id) === idMember);
      return itemsWithoutSuperadmin.filter(i => (
        i.nama?.toLowerCase().includes(s) ||
        i.username?.toLowerCase().includes(s) ||
        i.no_id?.toLowerCase().includes(s)
      ));
    },
    // Filter daftar (FilterDaftar): cabang lalu jabatan; angka tombol dihitung dari data yang sudah dimuat
    itemsCabang() {
      return this.itemsDasar.filter(i => !this.filterCabang || i.cabang === this.filterCabang);
    },
    // Status: "perlu" = menunggu + ditunda (bawaan), lalu ditunda / ditolak / semua
    itemsStatus() {
      return this.itemsCabang.filter(i => {
        const s = this.statusAkun(i);
        if (this.filterStatus === "perlu") return s !== "ditolak";
        if (this.filterStatus === "semua") return true;
        return s === this.filterStatus;
      });
    },
    filteredItems() {
      return this.itemsStatus.filter(i => !this.filterJabatan || String(i.mvo_type_id) === String(this.filterJabatan));
    },
    daftarStatus() {
      const n = (s) => this.itemsCabang.filter(i => this.statusAkun(i) === s).length;
      return [
        { value: "perlu", label: "Perlu tindakan", jumlah: this.itemsCabang.length - n("ditolak") },
        { value: "ditunda", label: "Ditunda", jumlah: n("ditunda") },
        { value: "ditolak", label: "Ditolak", jumlah: n("ditolak") },
        { value: "semua", label: "Semua", jumlah: this.itemsCabang.length },
      ];
    },
    jalurLevels: () => JALUR_LEVELS,
    isSuperadmin() {
      return localStorage.getItem("mvo_type_id") === "superadmin";
    },
    metaFilter() {
      const jumlah = {};
      this.itemsStatus.forEach(i => { jumlah[i.mvo_type_id] = (jumlah[i.mvo_type_id] || 0) + 1; });
      return {
        jabatan: this.mvoTypeList
          .filter(t => jumlah[t.id])
          .sort((a, b) => (a.level ?? 99) - (b.level ?? 99))
          .map(t => ({ id: String(t.id), name: t.name, jumlah: jumlah[t.id] })),
        cabang: [...new Set(this.itemsDasar.map(i => i.cabang).filter(Boolean))].sort(),
      };
    },
  },

  methods: {
    noMember,
    atasanLangsung,
    atasanPada,
    teksAtasan,
    jalurRingkas,
    namaJabatan(id) {
      return this.mvoTypeList.find(t => String(t.id) === String(id))?.name || "";
    },
    teksAtasanLangsung(item) {
      const a = atasanLangsung(item);
      return a ? `Upline: ${a.no_id || a.kode || "-"} · ${a.nama}` : "Upline: -";
    },
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
        // Yang approve di level ini adalah upline level ini (dicek di backend),
        // jadi namanya diambil dari "KODE - Nama". Daftar /api/mvo hanya memuat
        // satu halaman, sehingga pencarian by id sering gagal dan menampilkan angka.
        const namaUpline = uplineVal && uplineVal !== '-' ? String(uplineVal).split(' - ').slice(1).join(' - ').trim() : '';
        return namaUpline || this.getNamaByNomorId(approvalVal);
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
          `${API_URL}/api/mvo`,
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
          `${API_URL}/api/mvo-type`
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
          `${API_URL}/api/cekApprovalBawahan`,
          { code: codeLogin, hanya_belum_aktif: 1 },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const fetchedItems = res.data.data || [];
        this.items = this.mapUserWithBintang(fetchedItems);
        muatTugas(true); // angka merah di menu ikut diperbarui setelah approve / tunda / tolak
      } catch (err) {
      } finally {
        this.loading = false;
      }
    },
    // ===== Status & aksi tunda / tolak / pulihkan (riwayat di tbl_approval_akun_history) =====
    statusAkun(item) {
      return item.status_approval?.status || "menunggu";
    },
    labelStatus(item) {
      return { menunggu: "Menunggu", ditunda: "Ditunda", ditolak: "Ditolak" }[this.statusAkun(item)];
    },
    kelasStatus(item) {
      return { menunggu: "status-belum", ditunda: "status-tunda", ditolak: "status-tolak" }[this.statusAkun(item)];
    },
    aksiUntuk(item) {
      const s = this.statusAkun(item);
      const aksi = [];
      if (this.approveDilarang) return aksi;
      // Superadmin tidak punya kode upline → persetujuannya lewat Verifikasi ID (aktivasi)
      if (!this.isSuperadmin && !this.isUserApproved(item) && s !== "ditolak") {
        aksi.push({ key: "approve", label: "Approve", icon: "mdi-check-circle", color: "success", variant: "flat" });
      }
      if (this.isSuperadmin) {
        aksi.push({ key: "verifikasi", label: "Verifikasi", icon: "mdi-account-check", color: "primary", variant: "flat" });
      }
      if (s !== "ditunda" && s !== "ditolak") {
        aksi.push({ key: "tunda", label: "Tunda", icon: "mdi-pause-circle", color: "warning", variant: "tonal" });
      }
      if (s !== "ditolak") {
        aksi.push({ key: "tolak", label: "Tolak", icon: "mdi-close-circle", color: "error", variant: "tonal" });
      }
      if (s === "ditunda" || s === "ditolak") {
        aksi.push({ key: "pulihkan", label: "Pulihkan", icon: "mdi-restore", color: "grey-darken-1", variant: "tonal" });
      }
      return aksi;
    },
    jalankanAksi(key, item) {
      if (key === "approve") return this.showApproveDialog(item.id);
      if (key === "verifikasi") {
        return this.$router.push({ path: "/admin/user", query: { cari: item.username || item.no_id || item.nama } });
      }
      if (key === "pulihkan") return this.kirimAksi("pulihkan", item);
      Object.assign(this.dialogAlasan, { show: true, aksi: key, item, alasan: "", loading: false });
    },
    async kirimAlasan() {
      this.dialogAlasan.loading = true;
      const ok = await this.kirimAksi(this.dialogAlasan.aksi, this.dialogAlasan.item, this.dialogAlasan.alasan.trim());
      this.dialogAlasan.loading = false;
      if (ok) this.dialogAlasan.show = false;
    },
    async kirimAksi(aksi, item, alasan = null) {
      try {
        const { data } = await axios.post(`${API_URL}/api/approval-akun/${item.id}/${aksi}`, { alasan }, {
          headers: { Authorization: `Bearer ${Cookies.get("token")}`, Accept: "application/json" },
        });
        this.showSnackbar(data.message || "Berhasil");
        await this.loadData();
        return true;
      } catch (e) {
        this.showSnackbar(e.response?.data?.message || "Gagal menyimpan", "error");
        return false;
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
          `${API_URL}/api/approve`,
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
  background-color: var(--baba-gold-soft) !important;
  color: var(--baba-text) !important;
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

/* Kolom Aksi dikunci di kanan; !important karena Vuetify memberi position: relative pada sel */
:deep(.custom-data-table table > thead > tr > th:last-child),
:deep(.custom-data-table table > tbody > tr > td:last-child) {
  position: sticky !important;
  right: 0;
  z-index: 3;
  background: #fff;
  box-shadow: -4px 0 6px -2px rgba(0, 0, 0, 0.15);
}

:deep(.custom-data-table table > thead > tr > th:last-child) {
  background: var(--baba-gold-soft) !important;
  z-index: 4;
}

.alamat-ringkas {
  display: inline-block;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.aksi-baris {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.alasan-teks {
  margin-top: 2px;
  max-width: 240px;
  font-size: 0.75rem;
  line-height: 1.3;
  white-space: normal;
  color: var(--baba-muted);
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
  color: #E6B422 !important;
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
