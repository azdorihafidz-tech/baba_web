<template>
    <div>

        <!-- ================= DESKTOP VIEW ================= -->
        <div class="d-none d-md-block">

            <!-- ===== HEADER CARD - Total Regions ===== -->
            <v-card class="baba-stat baba-stat--gold mb-4" hover @click="handleShowAllAkun" style="cursor: pointer;">
                <v-card-text class="total-ringkas">
                    <v-icon size="32">mdi-map-marker</v-icon>
                    <div>
                        <div class="text-h4 font-weight-bold">{{ totalAkun }}</div>
                        <div class="text-body-2">Total akun di semua cabang · klik untuk melihat semua</div>
                    </div>
                </v-card-text>
            </v-card>

            <!-- ===== AKUN PER REGION TABLE ===== -->
            <v-card class="mb-4">
                <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2">mdi-shield-account</v-icon>
                    Akun per MVO
                </v-card-title>

                <v-divider></v-divider>

                <v-card-text>
                    <div class="d-flex align-center justify-space-between mb-4">
                        <v-text-field v-model="searchRegion" prepend-inner-icon="mdi-magnify" label="Search MVO"
                            single-line hide-details variant="outlined" density="compact"
                            style="max-width: 300px;"></v-text-field>

                        <v-btn color="success" @click="exportRegionTableToExcel">
                            <v-icon start>mdi-microsoft-excel</v-icon>
                            Export Excel
                        </v-btn>
                    </div>

                    <v-data-table :headers="regionTableHeaders" :items="regionTableData" :search="searchRegion"
                        :items-per-page="10" class="elevation-0 text-no-wrap bg-grey-lighten-4 tabel-cabang" density="comfortable"
                        hover @click:row="(e, { item }) => handleShowRegionDetail((item.raw || item).region)">
                        <!-- Custom slot for region column with icon -->
                        <template v-slot:item.region="{ item }">
                            <div class="d-flex align-center">
                                <v-icon size="20" color="primary" class="mr-2">
                                    mdi-map-marker
                                </v-icon>
                                <span class="font-weight-medium">{{ item.region }}</span>
                            </div>
                        </template>

                        <!-- Custom slot for total accounts with badge -->
                        <template v-slot:item.total_accounts="{ item }">
                            <v-chip color="primary" variant="flat" size="small">
                                {{ item.total_accounts }}
                            </v-chip>
                        </template>

                        <!-- Custom slot for percentage with progress bar -->
                        <template v-slot:item.percentage="{ item }">
                            <div class="d-flex align-center" style="min-width: 250px;">
                                <v-progress-linear :model-value="item.percentage" color="primary" height="8" rounded
                                    class="mr-3"></v-progress-linear>
                                <span class="text-caption font-weight-medium" style="min-width: 50px;">
                                    {{ item.percentage.toFixed(1) }}%
                                </span>
                            </div>
                        </template>

                        <!-- No data template -->
                        <template v-slot:no-data>
                            <div class="text-center pa-4">
                                <v-icon size="64" color="grey">mdi-map-marker-outline</v-icon>
                                <div class="text-h6 mt-2">No region data available</div>
                            </div>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>


        </div>

        <!-- ================= MOBILE VIEW ================= -->
        <div class="d-block d-md-none">
            <!-- Header Card Mobile -->
            <v-card  class="baba-stat baba-stat--gold mb-3" @click="handleShowAllAkun" style="cursor: pointer;">
                <v-card-text class="total-ringkas">
                    <v-icon size="28">mdi-map-marker</v-icon>
                    <div>
                        <div class="text-h5 font-weight-bold">{{ totalAkun }}</div>
                        <div class="text-caption">Total akun di semua cabang</div>
                    </div>
                </v-card-text>
            </v-card>

            <!-- Akun per Region List Mobile -->
            <v-card class="mb-3">
                <v-card-title class="text-subtitle-1 font-weight-bold pa-3">
                    <v-icon size="20" class="mr-2">mdi-shield-account</v-icon>
                    Akun per MVO
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="pa-0">
                    <div class="pa-3 pb-0">
                        <v-text-field v-model="searchRegion" prepend-inner-icon="mdi-magnify" label="Search MVO"
                            single-line hide-details variant="outlined" density="compact"></v-text-field>
                    </div>
                    <!-- Ketuk cabang untuk melihat daftar akunnya -->
                    <DaftarBatang class="px-2 pb-2" tampil-persen kosong="Tidak ada data cabang"
                        :items="filteredRegionTableData.map((r) => ({ label: r.region, jumlah: r.total_accounts }))"
                        @pilih="handleShowRegionDetail($event.label)" />
                </v-card-text>
            </v-card>

        </div>

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
                        <!-- ✅ Pakai sortedDetailData bukan detailData -->
                        <v-data-table :headers="tableHeaders" :items="processedDetailData" :items-per-page="10"
                            class="elevation-1 text-no-wrap bg-grey-lighten-4" density="comfortable">
                            <!-- No data template -->
                            <template v-slot:no-data>
                                <div class="text-center pa-4">
                                    <v-icon size="64" color="grey">mdi-account-outline</v-icon>
                                    <div class="text-h6 mt-2">No data found</div>
                                </div>
                            </template>
                        </v-data-table>
                    </div>

                    <!-- Mobile View -->
                    <div class="d-block d-md-none">
                        <!-- ✅ filteredDetailData sudah include sortByJabatan -->
                        <v-card v-for="(item, index) in processedDetailData" :key="index" class="mb-3"
                            variant="outlined">
                            <v-card-text>
                                <div class="d-flex justify-space-between align-center mb-2">
                                    <div class="font-weight-bold text-truncate">{{ item.nama }}</div>
                                    <v-chip size="x-small" color="primary">{{ item.jabatan }}</v-chip>
                                </div>
                                <div class="text-caption">Username: {{ item.username }}</div>
                                <div class="text-caption">Cabang: {{ item.cabang }}</div>
                            </v-card-text>
                        </v-card>
                        <div v-if="processedDetailData.length === 0" class="text-center pa-4">
                            <v-icon size="64" color="grey">mdi-account-outline</v-icon>
                            <div class="text-caption mt-2">No data found</div>
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

export default {
    name: "DashboardRegion",
    emits: ["show-detail"],

    data() {
        return {
            // ===== JABATAN ORDER =====
            jabatanOrder: ['MVO', 'REGIONAL', 'FO', 'GM', 'SUPPLIER', 'DIST', 'SELL'],

            mvo_type_id: null,
            regionRawData: [],
            cabang: null,
            searchRegion: "",
            detailSearch: "",

            // Detail Dialog
            detailDialog: false,
            detailTitle: "",
            detailData: [],
            detailType: "",
            exporting: false,

            // Table Headers for detail view
            tableHeaders: [
                { title: "No", key: "no", sortable: false, width: "60px" },
                { title: "Username", key: "username", sortable: true },
                { title: "Nama", key: "nama", sortable: true },
                { title: "No Id", key: "id_bawaan", sortable: true },
                { title: "Cabang", key: "cabang", sortable: true },
                { title: "Jabatan", key: "jabatan", sortable: true },
            ],

            // Table Headers for region table
            regionTableHeaders: [
                { title: "MVO", key: "region", sortable: true, width: "200px" },
                { title: "Total Accounts", key: "total_accounts", sortable: true, align: "center", width: "150px" },
                { title: "Percentage", key: "percentage", sortable: true, width: "300px" },
            ],
        };
    },

    computed: {
        totalRegions() {
            return this.regionCardData.length;
        },

        totalAkun() {
            return this.regionRawData.length;
        },

        regionCardData() {
            if (this.regionRawData.length > 0 && this.regionRawData[0].total_akun !== undefined) {
                return this.regionRawData.map(region => ({
                    name: region.cabang,
                    count: parseInt(region.total_akun),
                    percentage: region.percentage
                })).sort((a, b) => b.count - a.count);
            }

            const regionMap = {};
            this.regionRawData.forEach(akun => {
                const region = akun.cabang || 'Unknown';
                if (!regionMap[region]) {
                    regionMap[region] = { name: region, count: 0 };
                }
                regionMap[region].count++;
            });

            const totalAccounts = this.regionRawData.length;
            const regions = Object.values(regionMap).map(region => ({
                ...region,
                percentage: totalAccounts > 0 ? (region.count / totalAccounts) * 100 : 0
            }));

            return regions.sort((a, b) => b.count - a.count);
        },

        regionTableData() {
            return this.regionCardData.map(region => ({
                region: region.name,
                total_accounts: region.count,
                percentage: region.percentage
            }));
        },

        filteredRegionTableData() {
            if (!this.searchRegion) return this.regionTableData;
            const search = this.searchRegion.toLowerCase();
            return this.regionTableData.filter(item =>
                item.region.toLowerCase().includes(search)
            );
        },

        processedDetailData() {
            let data = this.sortByJabatan(this.detailData);
            if (this.detailSearch) {
                const search = this.detailSearch.toLowerCase();
                data = data.filter(item =>
                    (item.username && item.username.toLowerCase().includes(search)) ||
                    (item.nama && item.nama.toLowerCase().includes(search)) ||
                    (item.cabang && item.cabang.toLowerCase().includes(search)) ||
                    (item.jabatan && item.jabatan.toLowerCase().includes(search))
                );
            }
            return data.map((item, index) => ({ ...item, no: index + 1 }));
        },
    },

    created() {
        this.initUser();
        this.fetchData();
    },

    methods: {

        // ===== SORT BY JABATAN ORDER =====
        sortByJabatan(data) {
            return [...data].sort((a, b) => {
                const jabatanA = (a.jabatan || '').toUpperCase().trim();
                const jabatanB = (b.jabatan || '').toUpperCase().trim();

                const indexA = this.jabatanOrder.indexOf(jabatanA);
                const indexB = this.jabatanOrder.indexOf(jabatanB);

                // Jabatan yang tidak ada di list → taruh di akhir
                const orderA = indexA === -1 ? 999 : indexA;
                const orderB = indexB === -1 ? 999 : indexB;

                return orderA - orderB;
            });
        },

        // ================= INIT USER =================
        initUser() {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) return;
            this.mvo_type_id = user.mvo_type_id || null;
            if (this.mvo_type_id !== "superadmin") {
                this.cabang = user.cabang || null;
            }
        },

        async fetchData() {
            const token = Cookies.get("token") || localStorage.getItem("token");
            if (!token) return;

            let url = "";
            if (this.mvo_type_id === "superadmin") {
                url = `${API_URL}/api/dashboard/akun`;
            } else {
                if (!this.cabang) {
                    return;
                }
                url = `${API_URL}/api/dashboard/akun/${this.cabang}`;
            }

            try {
                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data.status === "success") {
                    if (res.data.mode === "region_summary") {
                        this.regionRawData = res.data.data.map(region => ({
                            cabang: region.province,
                            total_akun: parseInt(region.total_akun),
                            percentage: region.percentage
                        }));
                    } else {
                        this.regionRawData = res.data.data || [];
                    }
                }
            } catch (err) {
            }
        },

        async handleShowRegionDetail(regionName) {
            const isSummaryMode = this.regionRawData.length > 0 && this.regionRawData[0].total_akun !== undefined;

            if (isSummaryMode) {
                const token = Cookies.get("token") || localStorage.getItem("token");
                if (!token) return;

                try {
                    this.detailDialog = true;
                    this.detailTitle = `Loading data for ${regionName}...`;
                    this.detailData = [];

                    const res = await axios.get(
                        `${API_URL}/api/dashboard/akun/${regionName}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    if (res.data.status === "success") {
                        const data = res.data.data || [];

                        // ✅ Sort by jabatan dulu, baru assign no urut
                        const sorted = this.sortByJabatan(data);
                        this.detailData = sorted.map((item, index) => ({
                            ...item,
                            no: index + 1
                        }));

                        this.detailTitle = `Akun - Region ${regionName} (${data.length} accounts)`;
                        this.detailType = 'region';

                        this.$emit('show-detail', {
                            type: 'region',
                            region: regionName,
                            data: sorted
                        });
                    }
                } catch (err) {
                    this.detailTitle = `Error loading data for ${regionName}`;
                }
            } else {
                const data = this.regionRawData.filter(
                    akun => (akun.cabang || 'Unknown') === regionName
                );

                // ✅ Sort by jabatan dulu, baru assign no urut
                const sorted = this.sortByJabatan(data);
                this.detailData = sorted.map((item, index) => ({
                    ...item,
                    no: index + 1
                }));

                this.detailTitle = `Akun - Region ${regionName}`;
                this.detailType = 'region';
                this.detailDialog = true;

                this.$emit('show-detail', {
                    type: 'region',
                    region: regionName,
                    data: sorted
                });
            }
        },

        handleShowAllAkun() {
            // ✅ Sort by jabatan dulu, baru assign no urut
            const sorted = this.sortByJabatan(this.regionRawData);
            this.detailData = sorted.map((item, index) => ({
                ...item,
                no: index + 1
            }));

            this.detailTitle = `All Region Akun (${this.regionRawData.length} accounts)`;
            this.detailType = 'all_region';
            this.detailDialog = true;

            this.$emit('show-detail', {
                type: 'all_region',
                data: sorted
            });
        },

        exportToExcel() {
            this.exporting = true;

            const headers = this.tableHeaders;
            // ✅ Export pakai sortedDetailData agar urutan jabatan ikut tersimpan di Excel
            const data = this.processedDetailData.map(row => {
                let obj = {};
                headers.forEach(h => {
                    obj[h.title] = row[h.key] ?? "-";
                });
                return obj;
            });

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Region");

            const fileName = `${this.detailTitle.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            XLSX.writeFile(wb, fileName);

            this.exporting = false;
        },

        exportRegionTableToExcel() {
            const data = this.regionTableData.map(item => ({
                Region: item.region,
                'Total Accounts': item.total_accounts,
                'Percentage': item.percentage.toFixed(2) + '%'
            }));

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Region Summary");

            XLSX.writeFile(wb, `Region_Summary_${new Date().toISOString().slice(0, 10)}.xlsx`);
        }
    },
};
</script>

<style scoped>
.total-ringkas {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px !important;
}

/* Baris cabang bisa diklik untuk membuka daftar akunnya */
.tabel-cabang :deep(tbody tr) {
    cursor: pointer;
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

.region-card {
    transition: all 0.3s ease;
    height: 100%;
}

.region-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.v-progress-linear {
    border-radius: 4px;
}

.sticky-search {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: white;
}
</style>
