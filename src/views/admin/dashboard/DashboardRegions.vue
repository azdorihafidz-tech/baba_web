<template>
    <div>

        <!-- ================= DESKTOP VIEW ================= -->
        <div class="d-none d-md-block">

            <!-- ===== HEADER CARD - Total Regions ===== -->
            <v-card color="primary" dark class="mb-4" hover @click="handleShowAllAkun" style="cursor: pointer;">
                <v-card-text class="text-center py-8">
                    <v-icon size="64" class="mb-3">
                        mdi-map-marker
                    </v-icon>

                    <div class="text-h2 font-weight-bold">
                        {{ totalAkun }}
                    </div>

                    <div class="text-h6 mt-2">
                        Total Regions with Akun
                    </div>
                </v-card-text>
            </v-card>

            <!-- ===== AKUN PER REGION TABLE ===== -->
            <v-card class="mb-4">
                <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2">mdi-shield-account</v-icon>
                    Akun per Region
                </v-card-title>

                <v-divider></v-divider>

                <v-card-text>
                    <v-text-field v-model="searchRegion" prepend-inner-icon="mdi-magnify" label="Search Region"
                        single-line hide-details variant="outlined" density="compact" class="mb-4"
                        style="max-width: 300px;"></v-text-field>

                    <v-data-table :headers="regionTableHeaders" :items="regionTableData" :search="searchRegion"
                        :items-per-page="10" class="elevation-0" density="comfortable">
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

            <!-- ===== REGION CARDS SECTION ===== -->
            <v-card>
                <v-card-title>
                    Region
                </v-card-title>

                <v-divider></v-divider>

                <v-card-text>
                    <v-row>
                        <v-col v-for="(region, index) in regionCardData" :key="index" cols="12" sm="6" md="4" lg="3">
                            <v-card :color="getRegionColor(index)" dark hover
                                @click="handleShowRegionDetail(region.name)" style="cursor:pointer;"
                                class="region-card">
                                <v-card-text class="text-center py-8">
                                    <v-icon size="48" class="mb-3">
                                        mdi-map-marker
                                    </v-icon>

                                    <div class="text-h3 font-weight-bold mb-2">
                                        {{ region.count }}
                                    </div>

                                    <div class="text-h6 font-weight-bold mb-1">
                                        {{ region.name }}
                                    </div>

                                    <div class="text-caption">
                                        {{ region.percentage.toFixed(1) }}% of total
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <!-- No data state -->
                        <v-col v-if="regionCardData.length === 0" cols="12">
                            <div class="text-center pa-4">
                                <v-icon size="64" color="grey">mdi-map-marker-outline</v-icon>
                                <div class="text-h6 mt-2">No region data available</div>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

        </div>

        <!-- ================= MOBILE VIEW ================= -->
        <div class="d-block d-md-none">
            <!-- Header Card Mobile -->
            <v-card color="primary" dark class="mb-3" @click="handleShowAllAkun" style="cursor: pointer;">
                <v-card-text class="text-center py-6">
                    <v-icon size="48" class="mb-2">
                        mdi-map-marker
                    </v-icon>

                    <div class="text-h3 font-weight-bold">
                        {{ totalAkun }}
                    </div>

                    <div class="text-body-1 mt-1">
                        Total Regions
                    </div>
                </v-card-text>
            </v-card>

            <!-- Akun per Region List Mobile -->
            <v-card class="mb-3">
                <v-card-title class="text-subtitle-1 font-weight-bold pa-3">
                    <v-icon size="20" class="mr-2">mdi-shield-account</v-icon>
                    Akun per Region
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="pa-0">
                    <div class="pa-3 pb-0">
                        <v-text-field v-model="searchRegion" prepend-inner-icon="mdi-magnify" label="Search Region"
                            single-line hide-details variant="outlined" density="compact"></v-text-field>
                    </div>
                    <v-list density="compact">
                        <v-list-item v-for="(item, i) in filteredRegionTableData" :key="i" class="py-2">
                            <template v-slot:prepend>
                                <v-icon size="20" color="primary" class="mr-3">mdi-map-marker</v-icon>
                            </template>
                            <v-list-item-title class="font-weight-medium">{{ item.region }}</v-list-item-title>
                            <v-list-item-subtitle>
                                <div class="d-flex align-center mt-1">
                                    <v-progress-linear :model-value="item.percentage" color="primary" height="6" rounded
                                        class="mr-2" style="width: 60px;"></v-progress-linear>
                                    <span class="text-caption">{{ item.percentage.toFixed(1) }}%</span>
                                </div>
                            </v-list-item-subtitle>
                            <template v-slot:append>
                                <v-chip color="primary" size="small" variant="flat">{{ item.total_accounts }}</v-chip>
                            </template>
                        </v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>

            <!-- Region Cards Mobile -->
            <v-row dense>
                <v-col v-for="(region, index) in regionCardData" :key="index" cols="6">
                    <v-card :color="getRegionColor(index)" dark @click="handleShowRegionDetail(region.name)">
                        <v-card-text class="text-center pa-3">
                            <v-icon size="24" class="mb-1">
                                mdi-map-marker
                            </v-icon>

                            <div class="text-h5 font-weight-bold">
                                {{ region.count }}
                            </div>

                            <div class="text-caption font-weight-bold">
                                {{ region.name }}
                            </div>

                            <div class="text-caption" style="font-size: 0.7rem;">
                                {{ region.percentage.toFixed(1) }}%
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
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
                        <v-data-table :headers="tableHeaders" :items="detailData" :search="detailSearch"
                            :items-per-page="10" class="elevation-1" density="comfortable">
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
                        <v-card v-for="(item, index) in filteredDetailData" :key="index" class="mb-3"
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
                        <div v-if="filteredDetailData.length === 0" class="text-center pa-4">
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
import axios from "axios";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";

export default {
    name: "DashboardRegion",
    emits: ["show-detail"],

    data() {
        return {
            mvo_type_id: null,

            regionRawData: [],
            cabang: null,
            searchRegion: "",
            detailSearch: "",

            // Region colors matching the image
            regionColors: [
                'blue darken-1',    // BDG - Blue
                'success',          // BTM - Green
                'blue darken-1',    // MDN - Blue
                'orange darken-1',  // PKU - Orange
                'purple',
                'indigo',
                'teal',
                'cyan',
                'pink',
                'deep-purple',
            ],

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
                { title: "Cabang", key: "cabang", sortable: true },
                { title: "Jabatan", key: "jabatan", sortable: true },
            ],

            // Table Headers for region table
            regionTableHeaders: [
                { title: "Region", key: "region", sortable: true, width: "200px" },
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
            // Total semua akun dari semua cabang/region
            return this.regionRawData.length;
        },

        regionCardData() {
            // Check if data already has aggregated structure (from superadmin API)
            if (this.regionRawData.length > 0 && this.regionRawData[0].total_akun !== undefined) {
                // Data sudah dalam format summary dari API
                return this.regionRawData.map(region => ({
                    name: region.cabang,
                    count: parseInt(region.total_akun),
                    percentage: region.percentage
                })).sort((a, b) => b.count - a.count);
            }

            // Data masih dalam format detail individual akun, perlu di-group
            const regionMap = {};

            this.regionRawData.forEach(akun => {
                const region = akun.cabang || 'Unknown';

                if (!regionMap[region]) {
                    regionMap[region] = {
                        name: region,
                        count: 0
                    };
                }

                regionMap[region].count++;
            });

            // Convert to array and calculate percentages
            const totalAccounts = this.regionRawData.length;
            const regions = Object.values(regionMap).map(region => ({
                ...region,
                percentage: totalAccounts > 0 ? (region.count / totalAccounts) * 100 : 0
            }));

            // Sort by count descending
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
        filteredDetailData() {
            if (!this.detailSearch) return this.detailData;
            const search = this.detailSearch.toLowerCase();
            return this.detailData.filter(item =>
                (item.username && item.username.toLowerCase().includes(search)) ||
                (item.nama && item.nama.toLowerCase().includes(search)) ||
                (item.cabang && item.cabang.toLowerCase().includes(search)) ||
                (item.jabatan && item.jabatan.toLowerCase().includes(search))
            );
        },
    },

    created() {
        this.initUser();
        this.fetchData();
    },

    methods: {

        // ================= INIT USER =================
        initUser() {
            const user = JSON.parse(localStorage.getItem("user"));

            if (!user) return;

            this.mvo_type_id = user.mvo_type_id || null;

            // Hanya set cabang kalau bukan superadmin
            if (this.mvo_type_id !== "superadmin") {
                this.cabang = user.cabang || null;
            }
        },

        async fetchData() {
            const token = Cookies.get("token") || localStorage.getItem("token");

            if (!token) return;

            let url = "";

            if (this.mvo_type_id === "superadmin") {
                // SUPERADMIN → Semua data
                url = `https://babaapi.teknosof.com/api/dashboard/akun`;
            } else {
                // NON SUPERADMIN → Wajib ada cabang
                if (!this.cabang) {
                    console.warn("Cabang user tidak ada → API tidak dipanggil");
                    return;
                }

                url = `https://babaapi.teknosof.com/api/dashboard/akun/${this.cabang}`;
            }

            try {
                const res = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data.status === "success") {
                    // Check if this is superadmin mode (region_summary)
                    if (res.data.mode === "region_summary") {
                        // Transform region summary data to match component structure
                        this.regionRawData = res.data.data.map(region => ({
                            cabang: region.province,
                            total_akun: parseInt(region.total_akun),
                            percentage: region.percentage
                        }));
                    } else {
                        // Standard mode - list of individual akun
                        this.regionRawData = res.data.data || [];
                    }
                }
            } catch (err) {
                console.error("Fetch dashboard error:", err);
            }
        },

        async handleShowRegionDetail(regionName) {
            // Check if we're in summary mode (superadmin)
            const isSummaryMode = this.regionRawData.length > 0 && this.regionRawData[0].total_akun !== undefined;

            if (isSummaryMode) {
                // Fetch detailed data for this specific region
                const token = Cookies.get("token") || localStorage.getItem("token");

                if (!token) return;

                try {
                    this.detailDialog = true;
                    this.detailTitle = `Loading data for ${regionName}...`;
                    this.detailData = [];

                    const res = await axios.get(
                        `https://babaapi.teknosof.com/api/dashboard/akun/${regionName}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (res.data.status === "success") {
                        const data = res.data.data || [];

                        this.detailData = data.map((item, index) => ({
                            ...item,
                            no: index + 1
                        }));

                        this.detailTitle = `Akun - Region ${regionName} (${data.length} accounts)`;
                        this.detailType = 'region';

                        this.$emit('show-detail', {
                            type: 'region',
                            region: regionName,
                            data
                        });
                    }
                } catch (err) {
                    console.error("Fetch region detail error:", err);
                    this.detailTitle = `Error loading data for ${regionName}`;
                }
            } else {
                // Data already detailed, just filter
                const data = this.regionRawData.filter(
                    akun => (akun.cabang || 'Unknown') === regionName
                );

                this.detailData = data.map((item, index) => ({
                    ...item,
                    no: index + 1
                }));

                this.detailTitle = `Akun - Region ${regionName}`;
                this.detailType = 'region';
                this.detailDialog = true;

                this.$emit('show-detail', {
                    type: 'region',
                    region: regionName,
                    data
                });
            }
        },

        handleShowAllAkun() {
            // Tampilkan semua akun dari semua region
            this.detailData = this.regionRawData.map((item, index) => ({
                ...item,
                no: index + 1
            }));

            this.detailTitle = `All Region Akun (${this.regionRawData.length} accounts)`;
            this.detailType = 'all_region';
            this.detailDialog = true;

            this.$emit('show-detail', {
                type: 'all_region',
                data: this.regionRawData
            });
        },

        getRegionColor(index) {
            // Return color from array based on index, cycle if more regions than colors
            return this.regionColors[index % this.regionColors.length];
        },

        exportToExcel() {
            this.exporting = true;

            // ===== Ambil header yang tampil =====
            const headers = this.tableHeaders;

            // ===== Mapping data sesuai header =====
            const data = this.detailData.map(row => {
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

            XLSX.utils.book_append_sheet(wb, ws, "Region");

            const fileName = `${this.detailTitle.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;

            XLSX.writeFile(wb, fileName);

            this.exporting = false;
        }
    },
};
</script>

<style scoped>
.v-data-table {
    font-size: 0.875rem;
}

.region-card {
    transition: all 0.3s ease;
    height: 100%;
}

.region-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* Custom styling for progress bars */
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