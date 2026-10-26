<template>
    <div>
        <!-- ================= DESKTOP VIEW ================= -->
        <v-row dense class="mb-2 mt-1">
            <v-col cols="6">
                <v-text-field v-model="dateRange.start" label="Mulai" type="date" density="compact" variant="outlined"
                    hide-details></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field v-model="dateRange.end" label="Selesai" type="date" density="compact" variant="outlined"
                    hide-details></v-text-field>
            </v-col>
        </v-row>
        <v-divider></v-divider>

        <div class="d-none d-md-block">

            <!-- ===== SUMMARY CARD ===== -->
            <v-row class="mb-4">


                <!-- TOTAL -->
                <v-col cols="12" md="4">
                    <v-card class="baba-stat baba-stat--gold"  @click="handleShowDetail('all_akun')" style="cursor:pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">
                                mdi-account-multiple
                            </v-icon>

                            <div class="text-h4">
                                {{ dashboardData.summary.total_akun }}
                            </div>

                            <div>Total Akun</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- APPROVED -->
                <v-col cols="12" md="4">
                    <v-card class="baba-stat baba-stat--success"  @click="handleShowDetail('total_approved_akun')"
                        style="cursor:pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">
                                mdi-check-circle
                            </v-icon>

                            <div class="text-h4">
                                {{ dashboardData.summary.total_approved }}
                            </div>

                            <div>Approved</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- PENDING -->
                <v-col cols="12" md="4">
                    <v-card class="baba-stat baba-stat--warning"  @click="handleShowDetail('total_pending_akun')" style="cursor:pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">
                                mdi-clock-outline
                            </v-icon>

                            <div class="text-h4">
                                {{ dashboardData.summary.total_pending }}
                            </div>

                            <div>Pending</div>
                        </v-card-text>
                    </v-card>
                </v-col>

            </v-row>
            <!-- ===== JABATAN AKUN & AKUN TERBARU: daftar batang ringkas (klik baris = rincian) ===== -->
            <v-row dense class="mb-2">
                <v-col cols="12" md="6">
                    <v-card class="ringkas-card">
                        <div class="ringkas-judul">
                            <v-icon size="20" class="mr-2">mdi-account-tie</v-icon>Jabatan Akun
                            <span class="ringkas-sub">semua akun</span>
                        </div>
                        <!-- Owner: puncak di atas TM (satu orang, tidak dihitung sebagai akun member) -->
                        <div v-if="owner" class="owner-baris">
                            <v-icon size="16" class="mr-1">mdi-crown</v-icon><b>OWNER</b>
                            <span class="owner-nama">{{ owner.nama }} ({{ owner.no_id }})</span>
                            <span class="ringkas-sub ml-auto d-none d-sm-inline">puncak, di atas TM</span>
                        </div>
                        <DaftarBatang :items="itemsBatang(jabatanList)" tampil-persen kosong="Belum ada data jabatan"
                            @pilih="handleShowJabatanDetail($event.label)" />
                    </v-card>
                </v-col>
                <v-col cols="12" md="6">
                    <v-card class="ringkas-card">
                        <div class="ringkas-judul">
                            <v-icon size="20" class="mr-2">mdi-calendar-account</v-icon>Akun Terbaru
                            <span class="ringkas-sub">mendaftar pada periode tanggal di atas</span>
                        </div>
                        <DaftarBatang :items="itemsBatang(filteredJabatanList)" tampil-persen
                            kosong="Tidak ada pendaftar pada periode ini"
                            @pilih="handleShowJabatanDetailFiltered($event.label)" />
                    </v-card>
                </v-col>
            </v-row>

            <!-- ===== STATISTICS ===== -->
            <v-card class="mb-4">
                <v-card-title>
                    Akun Status Statistics
                </v-card-title>

                <v-card-text>
                    <v-row>

                        <!-- PROGRESS -->
                        <v-col cols="12" md="6">

                            <!-- APPROVED -->
                            <div class="d-flex align-center mb-3">
                                <v-progress-linear :model-value="getAkunPercentage('total_approved')" color="success"
                                    height="25" rounded class="mr-3">
                                    <span class="text-white font-weight-bold">
                                        {{ getAkunPercentage('total_approved').toFixed(1) }}%
                                    </span>
                                </v-progress-linear>

                                <span>Approved</span>
                            </div>

                            <!-- PENDING -->
                            <div class="d-flex align-center">
                                <v-progress-linear :model-value="getAkunPercentage('total_pending')" color="orange"
                                    height="25" rounded class="mr-3">
                                    <span class="font-weight-bold" style="color: var(--baba-text);">
                                        {{ getAkunPercentage('total_pending').toFixed(1) }}%
                                    </span>
                                </v-progress-linear>

                                <span>Pending</span>
                            </div>

                        </v-col>

                        <!-- SUMMARY TEXT -->
                        <v-col cols="12" md="6">
                            <v-card flat color="grey-lighten-4" class="pa-4">

                                <div class="text-h6 mb-2">
                                    Summary
                                </div>

                                <div class="d-flex justify-space-between">
                                    <span>Total</span>
                                    <b>
                                        {{ dashboardData.summary.total_akun }}
                                    </b>
                                </div>

                                <div class="d-flex justify-space-between">
                                    <span>Approved</span>
                                    <b class="text-success">
                                        {{ dashboardData.summary.total_approved }}
                                    </b>
                                </div>

                                <div class="d-flex justify-space-between">
                                    <span>Pending</span>
                                    <b class="text-orange">
                                        {{ dashboardData.summary.total_pending }}
                                    </b>
                                </div>

                            </v-card>
                        </v-col>

                    </v-row>
                </v-card-text>
            </v-card>



        </div>

        <!-- ================= MOBILE VIEW ================= -->
        <div class="d-block d-md-none">
            <v-row dense class="mb-3">

                <v-col cols="4">
                    <v-card  class="baba-stat baba-stat--gold text-center" @click="handleShowDetail('all_akun')">
                        <v-card-text class="pa-2">
                            <v-icon size="20">
                                mdi-account-multiple
                            </v-icon>

                            <div class="text-h6 mt-1">
                                {{ dashboardData.summary.total_akun }}
                            </div>

                            <div class="text-caption">Total</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card  class="baba-stat baba-stat--success text-center" @click="handleShowDetail('total_approved_akun')">
                        <v-card-text class="pa-2">
                            <v-icon size="20">
                                mdi-check-circle
                            </v-icon>

                            <div class="text-h6 mt-1">
                                {{ dashboardData.summary.total_approved }}
                            </div>

                            <div class="text-caption">Approved</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card  class="baba-stat baba-stat--warning text-center" @click="handleShowDetail('total_pending_akun')">
                        <v-card-text class="pa-2">
                            <v-icon size="20">
                                mdi-clock-outline
                            </v-icon>

                            <div class="text-h6 mt-1">
                                {{ dashboardData.summary.total_pending }}
                            </div>

                            <div class="text-caption">Pending</div>
                        </v-card-text>
                    </v-card>
                </v-col>

            </v-row>

            <!-- ===== JABATAN AKUN & AKUN TERBARU: daftar batang ringkas (klik baris = rincian) ===== -->
            <v-row dense class="mb-2">
                <v-col cols="12" md="6">
                    <v-card class="ringkas-card">
                        <div class="ringkas-judul">
                            <v-icon size="20" class="mr-2">mdi-account-tie</v-icon>Jabatan Akun
                            <span class="ringkas-sub">semua akun</span>
                        </div>
                        <!-- Owner: puncak di atas TM (satu orang, tidak dihitung sebagai akun member) -->
                        <div v-if="owner" class="owner-baris">
                            <v-icon size="16" class="mr-1">mdi-crown</v-icon><b>OWNER</b>
                            <span class="owner-nama">{{ owner.nama }} ({{ owner.no_id }})</span>
                            <span class="ringkas-sub ml-auto d-none d-sm-inline">puncak, di atas TM</span>
                        </div>
                        <DaftarBatang :items="itemsBatang(jabatanList)" tampil-persen kosong="Belum ada data jabatan"
                            @pilih="handleShowJabatanDetail($event.label)" />
                    </v-card>
                </v-col>
                <v-col cols="12" md="6">
                    <v-card class="ringkas-card">
                        <div class="ringkas-judul">
                            <v-icon size="20" class="mr-2">mdi-calendar-account</v-icon>Akun Terbaru
                            <span class="ringkas-sub">mendaftar pada periode tanggal di atas</span>
                        </div>
                        <DaftarBatang :items="itemsBatang(filteredJabatanList)" tampil-persen
                            kosong="Tidak ada pendaftar pada periode ini"
                            @pilih="handleShowJabatanDetailFiltered($event.label)" />
                    </v-card>
                </v-col>
            </v-row>

            <!-- ===== STATISTICS MOBILE ===== -->
            <v-card class="mb-3">
                <v-card-title class="text-subtitle-1 font-weight-bold">
                    Akun Status Statistics
                </v-card-title>
                <v-card-text>
                    <div class="mb-4">
                        <div class="d-flex align-center mb-2">
                            <v-progress-linear :model-value="getAkunPercentage('total_approved')" color="success"
                                height="20" rounded class="mr-3">
                                <span class="text-white text-caption font-weight-bold">
                                    {{ getAkunPercentage('total_approved').toFixed(1) }}%
                                </span>
                            </v-progress-linear>
                            <span class="text-caption">Approved</span>
                        </div>
                        <div class="d-flex align-center">
                            <v-progress-linear :model-value="getAkunPercentage('total_pending')" color="orange"
                                height="20" rounded class="mr-3">
                                <span class="text-caption font-weight-bold" style="color: var(--baba-text);">
                                    {{ getAkunPercentage('total_pending').toFixed(1) }}%
                                </span>
                            </v-progress-linear>
                            <span class="text-caption">Pending</span>
                        </div>
                    </div>
                    <v-card flat color="grey-lighten-4" class="pa-3">
                        <div class="text-subtitle-2 mb-2">Summary</div>
                        <div class="d-flex justify-space-between text-caption mb-1">
                            <span>Total</span>
                            <b>{{ dashboardData.summary.total_akun }}</b>
                        </div>
                        <div class="d-flex justify-space-between text-caption mb-1">
                            <span>Approved</span>
                            <b class="text-success">{{ dashboardData.summary.total_approved }}</b>
                        </div>
                        <div class="d-flex justify-space-between text-caption">
                            <span>Pending</span>
                            <b class="text-orange">{{ dashboardData.summary.total_pending }}</b>
                        </div>
                    </v-card>
                </v-card-text>
            </v-card>
        </div>

        <!-- Riwayat persetujuan akun (Akun Belum Approve & Verifikasi ID) -->
        <RiwayatApprovalAkun :mulai="dateRange.start" :selesai="dateRange.end" />

        <!-- ================= DETAIL TABLE DIALOG ================= -->
        <v-dialog v-model="detailDialog" max-width="1200px" scrollable>
            <v-card>
                <v-card-title class="d-flex align-center justify-space-between">
                    <span>{{ detailTitle }}</span>
                    <v-btn icon @click="detailDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-divider></v-divider>

                <!-- EXPORT BUTTON -->
                <v-card-text class="text-center pa-4">
                    <v-btn color="success" prepend-icon="mdi-microsoft-excel" @click="exportToExcel"
                        :loading="exporting">
                        Export to Excel
                    </v-btn>
                </v-card-text>

                <v-divider></v-divider>

                <!-- TABLE -->
                <v-card-text style="max-height: 500px;">
                    <v-text-field v-model="detailSearch" prepend-inner-icon="mdi-magnify" label="Search" single-line
                        hide-details variant="outlined" density="compact" class="mb-4 sticky-search"></v-text-field>

                    <!-- Desktop View -->
                    <div class="d-none d-md-block">
                        <v-data-table :headers="tableHeaders" :items="processedDetailData" :items-per-page="10"
                            class="elevation-1 bg-grey-lighten-4 text-no-wrap" density="comfortable">

                            <!-- No data template -->
                            <template v-slot:no-data>
                                <div class="text-center pa-4">
                                    <v-icon size="64" color="grey">mdi-account-outline</v-icon>
                                    <div class="text-h6 mt-2">No akun found</div>
                                </div>
                            </template>
                        </v-data-table>
                    </div>

                    <!-- Mobile View -->
                    <div class="d-block d-md-none">
                        <v-card v-for="(item, index) in processedDetailData" :key="index" class="mb-3"
                            variant="outlined" :color="getJabatanColor(index)">
                            <v-card-text>
                                <div class="d-flex justify-space-between align-center mb-2">
                                    <div class="font-weight-bold text-truncate">{{ item.nama }}</div>
                                    <v-chip size="x-small" color="primary">{{ item.jabatan }}</v-chip>
                                </div>
                                <div class="text-caption">Username: {{ item.username }}</div>
                                <div class="text-caption">Cabang: {{ item.cabang }}</div>
                                <v-divider class="my-2"></v-divider>
                                <div class="d-flex justify-space-between">
                                    <div class="text-caption"><v-icon size="small"
                                            class="mr-1">mdi-file-document</v-icon> {{
                                                item.total_document }}</div>
                                    <div class="text-caption"><v-icon size="small" class="mr-1"
                                            color="amber">mdi-star</v-icon> {{
                                                item.total_bintang }}</div>
                                </div>
                            </v-card-text>
                        </v-card>
                        <div v-if="processedDetailData.length === 0" class="text-center pa-4">
                            <v-icon size="64" color="grey">mdi-account-outline</v-icon>
                            <div class="text-caption mt-2">No akun found</div>
                        </div>
                    </div>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="text" @click="detailDialog = false">
                        Close
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
</template>

<script>
import { API_URL } from "@/config";
import axios from "axios";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";
import RiwayatApprovalAkun from "./RiwayatApprovalAkun.vue";
import { muatOwner, owner } from "@/utils/owner";

export default {
    components: { RiwayatApprovalAkun },
    name: "DashboardAkun",
    emits: ["show-detail"],

    setup() {
        muatOwner();
        return { owner };
    },

    data() {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);

        return {
            mvoTypeId: null,

            dashboardData: {
                summary: {
                    total_akun: 0,
                    total_approved: 0,
                    total_pending: 0,
                },
            },

            akunRawData: [],
            jabatanList: [],

            dateRange: {
                start: threeMonthsAgo.toISOString().split('T')[0],
                end: today.toISOString().split('T')[0]
            },

            // Array warna untuk card jabatan
            // Palet hitam-emas (selaras tema), tetap cukup berbeda antar jabatan.
            jabatanColors: [
                '#E6B422',
                '#1F1F1F',
                '#B8890F',
                '#5C4A1E',
                '#3A3A3A',
                '#C9A96E',
                '#8D6E2F',
                '#2B2B2B',
            ],

            cabang: null,
            detailSearch: "",

            // Detail Dialog
            detailDialog: false,
            detailTitle: "",
            detailData: [],
            detailType: "",
            exporting: false,

            // Table Headers
            tableHeaders: [
                { title: "No", key: "no", sortable: false, width: "60px" },
                { title: "Username", key: "username", sortable: true },
                { title: "Nama", key: "nama", sortable: true },
                { title: "No Id", key: "id_bawaan", sortable: true },
                { title: "Cabang", key: "cabang", sortable: true },
                { title: "Jabatan", key: "jabatan", sortable: true },
                { title: "Total Document", key: "total_document", sortable: true },
                { title: "Total Bintang", key: "total_bintang", sortable: true },
                { title: "Total RO", key: "total_ro", sortable: true },
                { title: "Tanggal Aktiv", key: "tanggal_daftar", sortable: true },
                { title: "MVO", key: "upline_1", sortable: true },
                { title: "REGIONAL", key: "upline_2", sortable: true },
                { title: "FO", key: "upline_3", sortable: true },
                { title: "GM", key: "upline_4", sortable: true },
                { title: "SUPPLIER", key: "upline_5", sortable: true },
                { title: "DIST", key: "upline_6", sortable: true },
                // { title: "SELL", key: "upline_7", sortable: true },

            ],
        };
    },

    computed: {
        processedDetailData() {
            let data = this.detailData;
            if (this.detailSearch) {
                const search = this.detailSearch.toLowerCase();
                data = this.detailData.filter(item =>
                    (item.username && item.username.toLowerCase().includes(search)) ||
                    (item.nama && item.nama.toLowerCase().includes(search)) ||
                    (item.cabang && item.cabang.toLowerCase().includes(search)) ||
                    (item.jabatan && item.jabatan.toLowerCase().includes(search))
                );
            }
            return data.map((item, index) => ({
                ...item,
                no: index + 1
            }));
        },
        filteredJabatanList() {
            if (!this.akunRawData) return [];

            const start = new Date(this.dateRange.start);
            const end = new Date(this.dateRange.end);
            end.setHours(23, 59, 59, 999);

            const filtered = this.akunRawData.filter(item => {
                if (!item.tanggal_daftar) return false;
                const itemDate = new Date(item.tanggal_daftar);
                return itemDate >= start && itemDate <= end;
            });

            return this.processJabatanDataFromArray(filtered);
        }
    },

    created() {
        this.initUser();
        this.fetchData();
    },

    methods: {

        // Data untuk DaftarBatang, urut jenjang (TM → Reseller); jabatan lain di akhir
        itemsBatang(list) {
            const urutan = ["TM", "TOP MANAGEMENT", "MVO", "REGIONAL", "FO", "FOUNDER", "GM", "GENERAL MANAGER", "SUPPLIER", "DIST", "DISTRIBUTOR", "RESELLER"];
            const posisi = (n) => { const i = urutan.indexOf(String(n).toUpperCase()); return i === -1 ? 99 : i; };
            return [...(list || [])]
                .sort((a, b) => posisi(a.name) - posisi(b.name))
                .map((j) => ({ label: j.name, jumlah: j.count }));
        },

        // ================= INIT USER =================
        initUser() {

            const user =
                JSON.parse(localStorage.getItem("user"));

            if (!user) return;

            this.mvo_type_id =
                user.mvo_type_id ||
                null;

            // Hanya set cabang kalau bukan superadmin
            if (this.mvo_type_id !== "superadmin") {

                this.cabang =
                    user.cabang ||
                    user.cabang ||
                    null;
            }
        },
        async fetchData() {

            const token =
                Cookies.get("token") ||
                localStorage.getItem("token");

            if (!token) return;

            let url = "";

            if (this.mvo_type_id === "superadmin") {

                // SUPERADMIN → Semua data
                url =
                    `${API_URL}/api/dashboard/akun`;

            } else {

                // NON SUPERADMIN → Wajib ada cabang
                if (!this.cabang) {
                    return;
                }

                url =
                    `${API_URL}/api/dashboard/akun/${this.cabang}`;
            }

            // ================= CALL API =================
            try {

                const res = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data.status === "success") {

                    // Map API response to component structure
                    this.dashboardData.summary = {
                        total_akun: res.data.summary.total_akun || 0,
                        total_approved: res.data.summary.total_approved || 0,
                        total_pending: res.data.summary.total_pending || 0,
                    };

                    this.akunRawData =
                        res.data.data || [];

                    // Process jabatan data
                    this.processJabatanData();
                }

            } catch (err) {
            }
        },
        processJabatanData() {
            this.jabatanList = this.processJabatanDataFromArray(this.akunRawData);
        },
        processJabatanDataFromArray(dataArray) {
            // Group akun by jabatan
            const jabatanMap = {};

            dataArray.forEach(akun => {
                const jabatan = akun.jabatan || 'Unknown';

                if (!jabatanMap[jabatan]) {
                    jabatanMap[jabatan] = {
                        name: jabatan,
                        count: 0
                    };
                }

                jabatanMap[jabatan].count++;
            });

            // Convert to array and sort by custom order
            const order = ['MVO', 'REGIONAL', 'FO', 'GM', 'SUPPLIER', 'DIST', 'SELL'];

            return Object.values(jabatanMap)
                .sort((a, b) => {
                    const nameA = (a.name || '').toUpperCase();
                    const nameB = (b.name || '').toUpperCase();

                    let indexA = order.indexOf(nameA);
                    let indexB = order.indexOf(nameB);

                    if (indexA === -1) indexA = 999;
                    if (indexB === -1) indexB = 999;

                    return indexA - indexB;
                });
        },
        handleShowJabatanDetail(jabatanName) {
            // Filter data by jabatan
            const data = this.akunRawData.filter(
                akun => (akun.jabatan || 'Unknown') === jabatanName
            );

            this.detailData = data.map((item, index) => ({
                ...item,
                no: index + 1
            }));

            this.detailTitle = `Akun - ${jabatanName}`;
            this.detailType = 'jabatan';
            this.detailDialog = true;

            this.$emit('show-detail', {
                type: 'jabatan',
                jabatan: jabatanName,
                data
            });
        },
        handleShowJabatanDetailFiltered(jabatanName) {
            const start = new Date(this.dateRange.start);
            const end = new Date(this.dateRange.end);
            end.setHours(23, 59, 59, 999);

            const data = this.akunRawData.filter(akun => {
                if ((akun.jabatan || 'Unknown') !== jabatanName) return false;
                if (!akun.tanggal_daftar) return false;
                const itemDate = new Date(akun.tanggal_daftar);
                return itemDate >= start && itemDate <= end;
            });

            this.detailData = data.map((item, index) => ({
                ...item,
                no: index + 1
            }));

            this.detailTitle = `Akun - ${jabatanName} (${this.dateRange.start} s/d ${this.dateRange.end})`;
            this.detailType = 'jabatan_filtered';
            this.detailDialog = true;

            this.$emit('show-detail', { type: 'jabatan_filtered', jabatan: jabatanName, data });
        },
        getJabatanColor(index) {
            // Return color from array based on index, cycle if more jabatan than colors
            return this.jabatanColors[index % this.jabatanColors.length];
        },
        handleShowDetail(type) {
            let data = [];
            let title = "";

            switch (type) {

                case "all_akun":
                    data = [...this.akunRawData];
                    title = "All Akun";
                    break;

                case "total_approved_akun":
                    // Approved = akun teraktivasi (aktivasi = 1), mengikuti summary backend.
                    data = this.akunRawData.filter(a => Number(a.aktivasi) === 1);
                    title = "Approved Akun";
                    break;

                case "total_pending_akun":
                    // Pending = akun belum teraktivasi (aktivasi = 0), mengikuti summary backend.
                    data = this.akunRawData.filter(a => Number(a.aktivasi) === 0);
                    title = "Pending Akun";
                    break;
            }

            // Sort data by jabatan custom order
            const order = ['MVO', 'REGIONAL', 'FO', 'GM', 'SUPPLIER', 'DIST', 'SELL'];
            data.sort((a, b) => {
                const jabatanA = (a.jabatan || '').toUpperCase().trim();
                const jabatanB = (b.jabatan || '').toUpperCase().trim();

                let indexA = order.indexOf(jabatanA);
                let indexB = order.indexOf(jabatanB);

                if (indexA === -1) indexA = 999;
                if (indexB === -1) indexB = 999;

                return indexA - indexB;
            });

            this.detailData = data.map((item, index) => ({
                ...item,
                no: index + 1
            }));

            this.detailTitle = title;
            this.detailType = type;
            this.detailDialog = true;
            this.$emit(
                "show-detail",
                { type, data }
            );
        },

        getAkunPercentage(type) {
            const total = Number(this.dashboardData.summary.total_akun) || 0;
            if (!total) return 0;

            const value = Number(this.dashboardData.summary[type]) || 0;
            return (value / total) * 100;
        },
        exportToExcel() {
            this.exporting = true;

            // ===== Ambil header yang tampil =====
            const headers = this.tableHeaders;

            // ===== Mapping data sesuai header =====
            const data = this.processedDetailData.map(row => {

                let obj = {};

                headers.forEach(h => {

                    let value = row[h.key];

                    obj[h.title] = value ?? "-";
                });

                return obj;
            });

            // ===== Convert ke Excel =====
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(wb, ws, "Akun");

            const fileName =
                `${this.detailTitle.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;

            XLSX.writeFile(wb, fileName);

            this.exporting = false;
        }
    },
};
</script>

<style scoped>
.ringkas-card {
    height: 100%;
    padding: 12px 14px;
    border: 1px solid var(--baba-border);
    border-radius: var(--baba-radius) !important;
    box-shadow: var(--baba-shadow) !important;
}

.ringkas-judul {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 6px;
    font-weight: 800;
    color: var(--baba-text);
}

.ringkas-judul .v-icon {
    color: var(--baba-gold-dark);
}

.owner-baris {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 8px;
    padding: 6px 10px;
    border-radius: 8px;
    background: var(--baba-ink);
    color: var(--baba-gold);
    font-size: 0.85rem;
}

.owner-baris .owner-nama {
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
}

.ringkas-sub {
    margin-left: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--baba-muted);
}

.v-data-table {
    font-size: 0.875rem;
}

:deep(.v-data-table) {
    border: 1px solid #000000;
}

:deep(.v-data-table__th) {
    background-color: #888888 !important;
    color: #E6B422 !important;
    font-weight: bold;
}

.jabatan-card {
    transition: all 0.3s ease;
}

.jabatan-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sticky-search {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: white;
}
</style>
