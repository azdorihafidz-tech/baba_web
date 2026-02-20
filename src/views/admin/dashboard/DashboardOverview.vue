<template>
    <div>

        <!-- ================= DATE RANGE FILTER ================= -->
        <v-card class="mb-4">
            <v-card-text>
                <v-row dense>

                    <!-- Tanggal Mulai -->
                    <v-col cols="12" md="4">
                        <v-text-field v-model="dateRange.start_date" label="Tanggal Mulai" type="date"
                            prepend-inner-icon="mdi-calendar" variant="outlined" density="compact" hide-details />
                    </v-col>

                    <!-- Tanggal Selesai -->
                    <v-col cols="12" md="4">
                        <v-text-field v-model="dateRange.end_date" label="Tanggal Selesai" type="date"
                            prepend-inner-icon="mdi-calendar" variant="outlined" density="compact" hide-details />
                    </v-col>

                    <!-- Tombol -->
                    <v-col cols="12" md="4" class="d-flex align-center gap-2">

                        <!-- FILTER -->
                        <v-btn color="primary" @click="applyDateFilter" :loading="isLoading" density="compact"
                            style="height: 40px; min-width: 110px;">
                            <v-icon start>mdi-magnify</v-icon>
                            Filter
                        </v-btn>

                        <!-- RESET -->
                        <v-btn color="grey" variant="outlined" @click="resetDateFilter" :disabled="isLoading"
                            density="compact" style="height: 40px; min-width: 40px;">
                            <v-icon>mdi-refresh</v-icon>
                        </v-btn>

                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>


        <!-- ================= DESKTOP VIEW ================= -->
        <div class="d-none d-md-block">
            <!-- SUMMARY CARD DESKTOP -->
            <v-row class="mb-4">
                <v-col cols="3">
                    <v-card color="purple" dark @click="navigateToTab('accounts')" style="cursor:pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="36" class="mb-2">mdi-account-group</v-icon>
                            <div class="text-h4">
                                {{ summary.jumlahakun ?? 0 }}
                            </div>
                            <div class="text-subtitle-1">
                                Total Akun
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="3">
                    <v-card color="primary" dark @click="navigateToTab('documents')" style="cursor:pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="36" class="mb-2">mdi-file-document-multiple</v-icon>
                            <div class="text-h4">
                                {{ summary.jumlahdokumen ?? 0 }}
                            </div>
                            <div class="text-subtitle-1">
                                Total Dokumen
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="3">
                    <v-card color="info" dark @click="navigateToTab('regions')" style="cursor:pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="36" class="mb-2">mdi-map-marker-multiple</v-icon>
                            <div class="text-h4">
                                {{ summary.akun_per_province?.length ?? 0 }}
                            </div>
                            <div class="text-subtitle-1">
                                Total Provinsi
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="3">
                    <v-card color="amber" dark @click="navigateToTab('star')" style="cursor:pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="36" class="mb-2">mdi-star</v-icon>
                            <div class="text-h4">
                                {{ summary.total_bintang_approved ?? 0 }}
                            </div>
                            <div class="text-subtitle-1">
                                Total Bintang
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-card class="mb-4" v-for="role in bintangRoles" :key="role.key">
                <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2" :color="role.iconColor">
                        mdi-star
                    </v-icon>
                    Top 5 Bintang — {{ role.label }}
                </v-card-title>

                <v-card-text>
                    <div class="d-flex align-center justify-space-between mb-4">
                        <v-text-field v-model="search[role.key]" prepend-inner-icon="mdi-magnify" label="Search"
                            single-line hide-details variant="outlined" density="compact"
                            style="max-width: 300px;"></v-text-field>

                        <v-btn color="success" size="small" @click="exportToExcel(role.data, `Top_5_${role.label}`)">
                            <v-icon start>mdi-microsoft-excel</v-icon>
                            Export
                        </v-btn>
                    </div>

                    <v-data-table class="bg-grey-lighten-4 text-no-wrap" :headers="topBintangHeaders" :items="role.data"
                        :search="search[role.key]" :loading="isLoading" item-key="code" :items-per-page="5"
                        hide-default-footer>

                        <!-- RANK -->
                        <template #item.rank="{ index }">
                            <v-chip :color="getRankColor(index + 1)" dark size="small">
                                {{ index + 1 }}
                            </v-chip>
                        </template>

                        <!-- NAMA -->
                        <template #item.mvo_name="{ item }">
                            <div class="font-weight-medium" @click="$emit('show-mvo-detail', item.code, item)"
                                style="cursor:pointer;">
                                {{ item.nama ?? 'N/A' }}
                            </div>
                            <div class="text-caption text-grey">
                                {{ item.code ?? 'N/A' }} • {{ item.cabang ?? 'N/A' }}
                            </div>
                        </template>

                        <!-- BINTANG -->
                        <template #item.total_bintang="{ item }">
                            <div class="d-flex align-center justify-center">
                                <v-chip color="amber" dark size="small">
                                    <v-icon left size="14">mdi-star</v-icon>
                                    {{ item.total_bintang || 0 }}
                                </v-chip>
                            </div>
                        </template>

                        <!-- JUMLAH RO -->
                        <template #item.jumlah_ro="{ item }">
                            <div class="text-center">
                                {{ item.jumlah_ro || 0 }}
                            </div>
                        </template>

                    </v-data-table>
                </v-card-text>
            </v-card>

        </div>

        <!-- ================= MOBILE VIEW ================= -->
        <div class="d-block d-md-none">

            <!-- SUMMARY CARD MOBILE -->
            <v-row class="mb-2" dense>
                <v-col cols="6">
                    <v-card color="purple" dark @click="navigateToTab('accounts')" style="cursor:pointer;">
                        <v-card-text class="text-center pa-3">
                            <v-icon size="24" class="mb-1">mdi-account-group</v-icon>
                            <div class="text-h6">
                                {{ summary.jumlahakun ?? 0 }}
                            </div>
                            <div class="text-caption">Total Akun</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="6">
                    <v-card color="primary" dark @click="navigateToTab('documents')" style="cursor:pointer;">
                        <v-card-text class="text-center pa-3">
                            <v-icon size="24" class="mb-1">mdi-file-document-multiple</v-icon>
                            <div class="text-h6">
                                {{ summary.jumlahdokumen ?? 0 }}
                            </div>
                            <div class="text-caption">Total Dokumen</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="6">
                    <v-card color="info" dark @click="navigateToTab('regions')" style="cursor:pointer;">
                        <v-card-text class="text-center pa-3">
                            <v-icon size="24" class="mb-1">mdi-map-marker-multiple</v-icon>
                            <div class="text-h6">
                                {{ summary.akun_per_province?.length ?? 0 }}
                            </div>
                            <div class="text-caption">Total Provinsi</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="6">
                    <v-card color="amber" dark @click="navigateToTab('star')" style="cursor:pointer;">
                        <v-card-text class="text-center pa-3">
                            <v-icon size="24" class="mb-1">mdi-star</v-icon>
                            <div class="text-h6">
                                {{ summary.total_bintang_approved ?? 0 }}
                            </div>
                            <div class="text-caption">Total Bintang</div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-card class="mt-3" v-for="role in bintangRoles" :key="'mobile-' + role.key">
                <v-card-title class="pa-3">
                    <v-icon class="mr-2" :color="role.iconColor">
                        mdi-star
                    </v-icon>
                    Top 5 Bintang — {{ role.label }}
                </v-card-title>

                <v-card-text class="pa-3">
                    <v-text-field v-model="search[role.key]" prepend-inner-icon="mdi-magnify" label="Search" single-line
                        hide-details variant="outlined" density="compact" class="mb-3"></v-text-field>

                    <div v-if="!getFilteredMobileData(role.data, role.key).length" class="text-center text-grey pa-4">
                        Tidak ada data
                    </div>

                    <v-card v-for="(item, index) in getFilteredMobileData(role.data, role.key)" :key="item.code"
                        class="mb-3" variant="outlined" @click="$emit('show-mvo-detail', item.code, item)">
                        <v-card-text>
                            <div class="d-flex justify-space-between align-center mb-2">
                                <div class="d-flex align-center">
                                    <v-chip :color="getRankColor(index + 1)" dark size="small" class="mr-2">
                                        {{ index + 1 }}
                                    </v-chip>
                                    <div class="font-weight-bold text-truncate">{{ item.nama || 'N/A' }}</div>
                                </div>
                                <v-chip color="amber" dark size="small">
                                    <v-icon left size="14">mdi-star</v-icon>
                                    {{ item.total_bintang || 0 }}
                                </v-chip>
                            </div>

                            <div class="text-caption text-grey mb-2">
                                {{ item.code }} • {{ item.cabang }}
                            </div>

                            <v-divider class="my-2"></v-divider>

                            <div class="d-flex justify-space-between">
                                <div class="text-caption">
                                    Jumlah RO: <b>{{ item.jumlah_ro || 0 }}</b>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-card-text>
            </v-card>

        </div>

    </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";

export default {
    name: "DashboardOverview",

    emits: [
        "show-mvo-detail",
        "navigate-to-tab"
    ],

    data() {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);

        return {
            dashboardData: { summary: {} },
            search: {},
            isLoading: false,

            // Date Range Filter
            dateRange: {
                start_date: threeMonthsAgo.toISOString().slice(0, 10),
                end_date: today.toISOString().slice(0, 10)
            },

            topBintangHeaders: [
                { title: "Rank", key: "rank", align: "center", width: 80 },
                { title: "Akun Details", key: "mvo_name" },
                { title: "No Id", key: "no_id" },
                { title: "Code", key: "code" },
                { title: "Cabang", key: "cabang" },
                { title: "Total Bintang", key: "total_bintang", align: "center" },
                { title: "Jumlah RO", key: "jumlah_ro", align: "center" },
            ],

            // Warna dinamis untuk role
            colorPalette: [
                'primary', 'cyan', 'purple', 'green', 'indigo',
                'orange', 'teal', 'pink', 'deep-purple', 'blue-grey'
            ],
        };
    },

    created() {
        this.fetchData();
    },

    computed: {

        summary() {
            return this.dashboardData?.summary ?? {};
        },

        /* ===== ROLE DINAMIS dari ranking_mvo ===== */
        bintangRoles() {
            const rankingMvo = this.summary?.ranking_mvo;

            if (!rankingMvo || !Array.isArray(rankingMvo)) return [];

            // ✅ Urutan jabatan yang diinginkan
            const jabatanOrder = [
                "MVO",
                "REGIONAL",
                "FO",
                "GM",
                "SUPPLIER",
                "DIST",
                "SELL"
            ];

            // Group by jabatan
            const groupedByJabatan = rankingMvo.reduce((acc, item) => {
                const jabatan = item.jabatan || "LAINNYA";

                if (!acc[jabatan]) {
                    acc[jabatan] = [];
                }

                acc[jabatan].push(item);
                return acc;
            }, {});

            // ✅ Ikuti urutan jabatanOrder
            return jabatanOrder
                .filter(jabatan => groupedByJabatan[jabatan]) // hanya tampil jika ada data
                .map((jabatan, index) => {

                    const sortedData = groupedByJabatan[jabatan]
                        .sort((a, b) => parseInt(b.total_bintang || 0) - parseInt(a.total_bintang || 0))
                        .slice(0, 5);

                    return {
                        key: jabatan,
                        label: jabatan,
                        iconColor: this.getColorByIndex(index),
                        data: sortedData
                    };
                });
        }


    },

    methods: {

        /* ===== FETCH DATA ===== */
        async fetchData() {
            const token = Cookies.get("token");
            if (!token) return;

            this.isLoading = true;

            try {
                // Build URL with query parameters
                let url = "https://babaapi.babaparfume.id/api/dashboard";
                const params = new URLSearchParams();

                if (this.dateRange.start_date) {
                    params.append('start_date', this.dateRange.start_date);
                }
                if (this.dateRange.end_date) {
                    params.append('end_date', this.dateRange.end_date);
                }

                if (params.toString()) {
                    url += `?${params.toString()}`;
                }

                const res = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data?.status === "success") {
                    this.dashboardData = res.data.data;
                }

            } catch (err) {
                console.error("Error fetch dashboard:", err);
            } finally {
                this.isLoading = false;
            }
        },

        /* ===== APPLY DATE FILTER ===== */
        applyDateFilter() {
            // Validasi tanggal
            if (this.dateRange.start_date && this.dateRange.end_date) {
                if (new Date(this.dateRange.start_date) > new Date(this.dateRange.end_date)) {
                    alert('Tanggal mulai tidak boleh lebih besar dari tanggal selesai');
                    return;
                }
            }
            this.fetchData();
        },

        /* ===== RESET DATE FILTER ===== */
        resetDateFilter() {
            const today = new Date();
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(today.getMonth() - 3);

            this.dateRange.start_date = threeMonthsAgo.toISOString().slice(0, 10);
            this.dateRange.end_date = today.toISOString().slice(0, 10);
            this.fetchData();
        },

        /* ===== NAVIGATE TO TAB ===== */
        navigateToTab(section) {
            this.$emit('navigate-to-tab', section);
        },

        getFilteredMobileData(data, key) {
            const term = this.search[key];
            if (!term) return data;
            const lowerTerm = term.toLowerCase();
            return data.filter(item =>
                (item.nama && item.nama.toLowerCase().includes(lowerTerm)) ||
                (item.code && item.code.toLowerCase().includes(lowerTerm)) ||
                (item.cabang && item.cabang.toLowerCase().includes(lowerTerm))
            );
        },

        /* ===== GENERATE COLOR BY INDEX ===== */
        getColorByIndex(index) {
            return this.colorPalette[index % this.colorPalette.length];
        },

        /* ===== RANK COLOR ===== */
        getRankColor(rank) {
            if (rank === 1) return "amber";
            if (rank === 2) return "grey";
            if (rank === 3) return "orange";
            return "blue";
        },

        /* ===== EXPORT EXCEL ===== */
        exportToExcel(data, filename) {
            if (!data || data.length === 0) return;

            const exportData = data.map((item, index) => ({
                Rank: index + 1,
                Nama: item.nama,
                Code: item.code,
                Cabang: item.cabang,
                'Total Bintang': item.total_bintang,
                'Jumlah RO': item.jumlah_ro
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data");
            XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
        },

    },
};
</script>

<style scoped>
/* Optional: Tambahkan styling khusus mobile jika diperlukan */
@media (max-width: 600px) {
    .v-card-text .text-h6 {
        font-size: 1rem !important;
    }

    .v-card-text .v-icon {
        font-size: 24px !important;
    }
}

.gap-2 {
    gap: 8px;
}

:deep(.v-data-table) {
    border: 1px solid #000000;
}

:deep(.v-data-table__th) {
    background-color: #888888 !important;
    color: #FFD700 !important;
    font-weight: bold;
}
</style>