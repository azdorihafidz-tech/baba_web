<template>
    <div>
        <!-- Desktop View -->
        <div class="d-none d-md-block">
            <!-- Date Filter Desktop -->
            <v-card class="mb-4">
                <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2">mdi-calendar</v-icon>
                    Filter Tanggal
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="dateRange.start" label="Tanggal Mulai" type="date" variant="outlined"
                                density="default" @update:model-value="fetchGrowthData" class="mb-0"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="dateRange.end" label="Tanggal Akhir" type="date" variant="outlined"
                                density="default" @update:model-value="fetchGrowthData"></v-text-field>
                        </v-col>
                        <v-col cols="12" class="text-right">
                            <v-btn color="success" prepend-icon="mdi-microsoft-excel" @click="exportGrowthData">
                                Export Data
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <v-row class="ga-4" align="stretch">
                <v-card color="primary" dark class="flex-grow-1"
                    @click="$emit('show-detail', 'total_growth', filteredGrowthData)" style="cursor: pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="48" class="mb-2">mdi-chart-line</v-icon>
                        <div class="text-h4">{{ getTotalGrowth() }}</div>
                        <div class="text-subtitle-1">Total Pertumbuhan (RO)</div>
                    </v-card-text>
                </v-card>

                <v-card color="warning" dark class="flex-grow-1"
                    @click="$emit('show-detail', 'region_growth', filteredRegionGrowthData)" style="cursor: pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="48" class="mb-2">mdi-map-marker-multiple</v-icon>
                        <div class="text-h4">{{ getRegionGrowth() }}</div>
                        <div class="text-subtitle-1">Pertumbuhan Region (RO)</div>
                    </v-card-text>
                </v-card>
            </v-row>
            <!-- <v-row class="ga-4" align="stretch">
            <v-card color="#FFD700" dark hover class="flex-grow-1" @click="openTopStarDialog" style="cursor: pointer">
                <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-trophy</v-icon>
                    <div class="text-subtitle-1">TOP STAR</div>
                </v-card-text>
            </v-card>

            <v-card color="success" dark hover class="flex-grow-1" @click="openAkunPerMvoDialog"
                style="cursor: pointer">
                <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-account-multiple</v-icon>
                    <div class="text-subtitle-1">TOTAL AKUN PER MVO</div>
                </v-card-text>
            </v-card>
        </v-row> -->

            <v-row>
                <v-col cols="12" md="6">
                    <v-card class="mb-4">
                        <v-card-title class="d-flex align-center">
                            <v-icon class="mr-2">mdi-chart-line</v-icon>
                            Grafik Pertumbuhan Keseluruhan
                        </v-card-title>
                        <v-card-text>
                            <canvas ref="overallChart"></canvas>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="6">
                    <v-card class="mb-4">
                        <v-card-title class="d-flex align-center">
                            <v-icon class="mr-2">mdi-map-marker</v-icon>
                            Grafik Pertumbuhan per Region
                        </v-card-title>
                        <v-card-text>
                            <canvas ref="regionChart"></canvas>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
            <!-- TABLE: Akun Growth per Jabatan (Desktop) -->
            <!-- <v-card class="mt-4">
                <v-card-title class="d-flex align-center justify-space-between flex-wrap gap-2">
                    <div class="d-flex align-center">
                        <v-icon class="mr-2">mdi-account-group</v-icon>
                        Akun Growth per Jabatan
                    </div>
                    <div class="d-flex align-center gap-2">
                        <v-text-field v-model="searchJabatan" prepend-inner-icon="mdi-magnify" label="Search"
                            single-line hide-details variant="outlined" density="compact"
                            style="max-width: 300px; min-width: 200px;" />
                        <v-btn color="success" @click="exportAkunGrowthPerJabatan">
                            <v-icon start>mdi-microsoft-excel</v-icon>
                            Export
                        </v-btn>
                    </div>
                </v-card-title>
                <v-card-text>
                    <v-data-table class="bg-grey-lighten-4 text-no-wrap" :headers="jabatanHeaders"
                        :items="filteredAkunGrowthPerJabatan" item-key="jabatan" :items-per-page="10">
                        <template #item.jabatan="{ item }" {{ item.jabatan }}>
                            <v-chip color="primary" size="small">{{ item.jabatan }}</v-chip>
                        </template>
<template #item.total_akun="{ item }">
                            <div class="text-center font-weight-bold">{{ item.total_akun }}</div>
                        </template>
</v-data-table>
</v-card-text>
</v-card> -->
        </div>

        <!-- Mobile View -->
        <div class="d-block d-md-none">
            <!-- Date Filter Mobile -->
            <v-card class="mb-3">
                <v-card-title class="d-flex align-center pa-3 text-subtitle-1">
                    <v-icon class="mr-2" size="20">mdi-calendar</v-icon>
                    Filter Tanggal
                </v-card-title>
                <v-card-text class="pa-3 pt-0">
                    <v-row dense>
                        <v-col cols="6">
                            <v-text-field v-model="dateRange.start" label="Mulai" type="date" variant="outlined"
                                density="compact" hide-details @update:model-value="fetchGrowthData"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="dateRange.end" label="Akhir" type="date" variant="outlined"
                                density="compact" hide-details @update:model-value="fetchGrowthData"></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>



            <v-row dense class="mb-3">

                <!-- TOTAL GROWTH -->
                <v-col cols="6" class="d-flex">
                    <v-card class="flex-grow-1" color="primary" dark
                        @click="$emit('show-detail', 'total_growth', filteredGrowthData)" style="cursor: pointer;">
                        <v-card-text class="text-center pa-3 fill-height d-flex flex-column justify-center">
                            <v-icon size="32" class="mb-2">mdi-chart-line</v-icon>
                            <div class="text-h6">{{ getTotalGrowth() }}</div>
                            <div class="text-caption">Total Pertumbuhan (RO)</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- REGION -->
                <v-col cols="6" class="d-flex">
                    <v-card class="flex-grow-1" color="warning" dark
                        @click="$emit('show-detail', 'region_growth', filteredRegionGrowthData)"
                        style="cursor: pointer;">
                        <v-card-text class="text-center pa-3 fill-height d-flex flex-column justify-center">
                            <v-icon size="32" class="mb-2">mdi-map-marker-multiple</v-icon>
                            <div class="text-h6">{{ getRegionGrowth() }}</div>
                            <div class="text-caption">Region</div>
                        </v-card-text>
                    </v-card>
                </v-col>

            </v-row>


            <v-card class="mb-3">
                <v-card-title class="pa-3">
                    <v-icon class="mr-2">mdi-chart-line</v-icon>
                    Pertumbuhan Keseluruhan
                </v-card-title>
                <v-card-text class="pa-3">
                    <canvas ref="overallChartMobile"></canvas>
                </v-card-text>
            </v-card>

            <v-card>
                <v-card-title class="pa-3">
                    <v-icon class="mr-2">mdi-map-marker</v-icon>
                    Pertumbuhan per Region
                </v-card-title>
                <v-card-text class="pa-3">
                    <canvas ref="regionChartMobile"></canvas>
                </v-card-text>
            </v-card>
            <!-- TABLE: Akun Growth per Jabatan (Mobile) -->
            <!-- <v-card class="mt-3">
                <v-card-title class="pa-3 d-flex align-center">
                    <v-icon class="mr-2">mdi-account-group</v-icon>
                    Akun Growth per Jabatan
                </v-card-title>
                <v-card-text class="pa-3">
                    <div class="d-flex mb-3 gap-2">
                        <v-text-field v-model="searchJabatan" prepend-inner-icon="mdi-magnify" label="Search"
                            single-line hide-details variant="outlined" density="compact" />
                        <v-btn color="success" size="small" icon @click="exportAkunGrowthPerJabatan">
                            <v-icon>mdi-microsoft-excel</v-icon>
                        </v-btn>
                    </div>
                    <div v-if="!filteredAkunGrowthPerJabatan.length" class="text-center text-grey pa-4">
                        Tidak ada data
                    </div>
                    <v-card v-for="item in filteredAkunGrowthPerJabatan" :key="item.jabatan + item.province"
                        class="mb-2" variant="outlined">
                        <v-card-text class="pa-3">
                            <div class="d-flex justify-space-between align-center">
                                <v-chip color="primary" size="small">{{ item.jabatan }}</v-chip>
                                <span class="text-caption text-grey">{{ item.province }}</span>
                            </div>
                            <div class="mt-2 text-body-2">
                                Total Akun: <b>{{ item.total_akun }}</b>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-card-text>
            </v-card> -->
        </div>
    </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";
import { Chart, registerables } from 'chart.js';
import * as XLSX from "xlsx";

Chart.register(...registerables);

export default {
    name: 'DashboardGrowth',
    emits: ['show-detail'],
    data() {
        return {
            akunGrowthPerJabatan: [],
            searchJabatan: '',
            mvo_type_id: null,
            cabang: null,
            growthRawData: [],
            regionGrowthRawData: [],
            provinceColors: {},
            dateRange: {
                start: this.getDefaultStartDate(),
                end: this.getDefaultEndDate()
            },
            overallChartInstance: null,
            regionChartInstance: null,
            overallChartMobileInstance: null,
            regionChartMobileInstance: null,

            jabatanHeaders: [
                { title: 'Bulan', key: 'bulan', align: 'start' },
                { title: 'Province', key: 'province', align: 'start' },
                { title: 'Jabatan', key: 'jabatan', align: 'center' },
                { title: 'Total Akun', key: 'total_akun', align: 'center' },
            ],
        };

    },
    created() {
        this.initUser();
        this.fetchData();
        this.fetchProvinceColors();
    },
    mounted() {
        this.$nextTick(() => {
            this.renderCharts();
        });
    },
    beforeUnmount() {
        this.destroyCharts();
    },
    computed: {
        filteredAkunGrowthPerJabatan() {
            if (!this.akunGrowthPerJabatan) return [];

            const term = this.searchJabatan?.toLowerCase() || '';

            return this.akunGrowthPerJabatan.filter(item => {
                // Filter by date range
                const itemDate = new Date(item.bulan + '-01');
                const startDate = new Date(this.dateRange.start);
                startDate.setDate(1); // Reset ke tanggal 1 agar bulan yang dipilih tetap masuk
                const endDate = new Date(this.dateRange.end);
                const inRange = itemDate >= startDate && itemDate <= endDate;

                const matchSearch = !term || (
                    (item.jabatan && item.jabatan.toLowerCase().includes(term)) ||
                    (item.province && item.province.toLowerCase().includes(term)) ||
                    (item.bulan && item.bulan.toLowerCase().includes(term))
                );

                return inRange && matchSearch;
            });
        },
        filteredGrowthData() {
            if (!this.growthRawData) return [];

            return this.growthRawData.filter(item => {
                const itemDate = new Date(item.bulan + '-01');
                const startDate = new Date(this.dateRange.start);
                startDate.setDate(1); // Reset ke tanggal 1
                const endDate = new Date(this.dateRange.end);

                return itemDate >= startDate && itemDate <= endDate;
            });
        },
        filteredRegionGrowthData() {
            if (!this.regionGrowthRawData) return [];

            return this.regionGrowthRawData.filter(item => {
                const itemDate = new Date(item.bulan + '-01');
                const startDate = new Date(this.dateRange.start);
                startDate.setDate(1); // Reset ke tanggal 1
                const endDate = new Date(this.dateRange.end);

                return itemDate >= startDate && itemDate <= endDate;
            });
        }
    },
    watch: {
        filteredGrowthData() {
            this.$nextTick(() => {
                this.renderCharts();
            });
        },
        filteredRegionGrowthData() {
            this.$nextTick(() => {
                this.renderCharts();
            });
        }
    },
    methods: {
        exportAkunGrowthPerJabatan() {
            const data = this.filteredAkunGrowthPerJabatan;
            if (!data || data.length === 0) return;

            const exportData = data.map(item => ({
                Province: item.province,
                Jabatan: item.jabatan,
                'Total Akun': item.total_akun,
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Akun per Jabatan");
            XLSX.writeFile(wb, `Akun_Growth_per_Jabatan_${this.dateRange.start}_to_${this.dateRange.end}.xlsx`);
        },
        initUser() {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) return;
            this.mvo_type_id = user.mvo_type_id || null;
            if (this.mvo_type_id !== "superadmin") {
                this.cabang = user.cabang || null;
            }
        },
        getDefaultStartDate() {
            const date = new Date();
            date.setMonth(date.getMonth() - 6);
            return date.toISOString().split('T')[0];
        },
        getDefaultEndDate() {
            return new Date().toISOString().split('T')[0];
        },
        fetchGrowthData() {
            this.fetchData();
        },
        async fetchProvinceColors() {
            const token = Cookies.get("token") || localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await axios.get("https://babaapi.babaparfume.id/api/provinsi", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.status === "success") {
                    this.provinceColors = response.data.data.reduce((acc, item) => {
                        if (item.code && item.warna) {
                            acc[item.code] = item.warna;
                        }
                        return acc;
                    }, {});

                    // Re-render charts if data is already loaded
                    if (this.regionGrowthRawData.length > 0) {
                        this.$nextTick(() => {
                            this.renderCharts();
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching province colors:", error);
            }
        },
        async fetchData() {
            const token = Cookies.get("token") || localStorage.getItem("token");
            if (!token) return;

            let url = "";
            if (this.mvo_type_id === "superadmin") {
                url = `https://babaapi.babaparfume.id/api/dashboard/growth`;
            } else {
                if (!this.cabang) {
                    console.warn("Cabang user tidak ada → API tidak dipanggil");
                    return;
                }
                url = `https://babaapi.babaparfume.id/api/dashboard/growth/${this.cabang}`;
            }

            const params = {
                start_date: this.dateRange.start,
                end_date: this.dateRange.end
            };

            try {
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: params
                });

                if (response.data.status === "success") {
                    this.growthRawData = response.data.overall_growth || [];
                    this.regionGrowthRawData = response.data.region_growth || [];
                    this.akunGrowthPerJabatan = response.data.akun_growth_per_jabatan || [];
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        },
        getTotalGrowth() {
            return this.filteredGrowthData.reduce((total, item) => total + parseInt(item.total_ro || 0), 0);
        },
        getMonthlyGrowth() {
            return this.filteredGrowthData.length;
        },
        getRegionGrowth() {
            return this.filteredRegionGrowthData.reduce((total, item) => total + parseInt(item.total_ro || 0), 0);
        },
        getMaxGrowthValue() {
            const values = this.filteredGrowthData.map(item => parseInt(item.total_ro || 0));
            return Math.max(...values, 1);
        },
        getMaxRegionGrowthValue() {
            const values = this.filteredRegionGrowthData.map(item => parseInt(item.total_ro || 0));
            return Math.max(...values, 1);
        },
        formatMonth(monthString) {
            if (!monthString) return '';
            const [year, month] = monthString.split('-');
            const monthNames = [
                'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
                'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
            ];
            return `${monthNames[parseInt(month) - 1]} ${year}`;
        },
        getRegionColor(index) {
            const colors = [
                'rgba(255, 193, 7, 0.9)',    // Gold
                'rgba(255, 179, 0, 0.8)',    // Amber
                'rgba(255, 160, 0, 0.8)',    // Deep Orange-Gold
                'rgba(255, 215, 64, 0.8)',   // Light Gold
                'rgba(255, 204, 0, 0.8)',    // Yellow Gold
                'rgba(255, 235, 59, 0.8)',   // Bright Yellow
                'rgba(251, 192, 45, 0.8)',   // Golden Rod
                'rgba(255, 224, 130, 0.8)'   // Pale Gold
            ];
            return colors[index % colors.length];
        },
        destroyCharts() {
            if (this.overallChartInstance) {
                this.overallChartInstance.destroy();
                this.overallChartInstance = null;
            }
            if (this.regionChartInstance) {
                this.regionChartInstance.destroy();
                this.regionChartInstance = null;
            }
            if (this.overallChartMobileInstance) {
                this.overallChartMobileInstance.destroy();
                this.overallChartMobileInstance = null;
            }
            if (this.regionChartMobileInstance) {
                this.regionChartMobileInstance.destroy();
                this.regionChartMobileInstance = null;
            }
        },
        renderCharts() {
            this.destroyCharts();

            // Desktop charts
            if (this.$refs.overallChart) {
                this.renderOverallChart(this.$refs.overallChart, false);
            }
            if (this.$refs.regionChart) {
                this.renderRegionChart(this.$refs.regionChart, false);
            }

            // Mobile charts
            if (this.$refs.overallChartMobile) {
                this.renderOverallChart(this.$refs.overallChartMobile, true);
            }
            if (this.$refs.regionChartMobile) {
                this.renderRegionChart(this.$refs.regionChartMobile, true);
            }
        },
        renderOverallChart(canvas, isMobile) {
            const ctx = canvas.getContext('2d');
            const labels = this.filteredGrowthData.map(item => this.formatMonth(item.bulan));
            const data = this.filteredGrowthData.map(item => parseInt(item.total_ro || 0));

            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Total RO',
                        data: data,
                        backgroundColor: 'rgba(255, 193, 7, 0.8)',
                        borderColor: 'rgba(255, 193, 7, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        barThickness: isMobile ? 20 : 40,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: isMobile ? 1.2 : 2,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: {
                                size: 14
                            },
                            bodyFont: {
                                size: 13
                            },
                            callbacks: {
                                label: function (context) {
                                    return 'Total RO: ' + context.parsed.y;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                font: {
                                    size: isMobile ? 10 : 12
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            ticks: {
                                font: {
                                    size: isMobile ? 9 : 11
                                },
                                maxRotation: 45,
                                minRotation: 45
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });

            if (isMobile) {
                this.overallChartMobileInstance = chart;
            } else {
                this.overallChartInstance = chart;
            }
        },
        renderRegionChart(canvas, isMobile) {
            const ctx = canvas.getContext('2d');

            // Group data by region
            const regionMap = {};
            this.filteredRegionGrowthData.forEach(item => {
                const region = item.province_code;
                const month = this.formatMonth(item.bulan);
                const value = parseInt(item.total_ro || 0);

                if (!regionMap[region]) {
                    regionMap[region] = {};
                }
                regionMap[region][month] = value;
            });

            // Get all unique months
            const allMonths = [...new Set(this.filteredRegionGrowthData.map(item => this.formatMonth(item.bulan)))];

            // Create datasets for each region
            const datasets = Object.keys(regionMap).map((region, index) => {
                const data = allMonths.map(month => regionMap[region][month] || 0);

                const apiColor = this.provinceColors[region];
                const backgroundColor = apiColor ? apiColor : this.getRegionColor(index);
                const borderColor = apiColor ? apiColor : this.getRegionColor(index).replace('0.8', '1');

                return {
                    label: region,
                    data: data,
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    borderWidth: 2,
                    borderRadius: 6,
                    barThickness: isMobile ? 15 : 30,
                };
            });

            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: allMonths,
                    datasets: datasets
                },
                plugins: [{
                    id: 'regionLabels',
                    afterDatasetsDraw: (chart) => {
                        const { ctx } = chart;
                        chart.data.datasets.forEach((dataset, i) => {
                            const meta = chart.getDatasetMeta(i);
                            if (!meta.hidden) {
                                meta.data.forEach((element, index) => {
                                    if (dataset.data[index] > 0) {
                                        const text = dataset.label;
                                        ctx.save();
                                        const fontSize = isMobile ? 9 : 11;
                                        ctx.font = `bold ${fontSize}px sans-serif`;
                                        ctx.textAlign = 'left';
                                        ctx.textBaseline = 'middle';
                                        const x = element.x;
                                        const y = element.base - 5;
                                        ctx.translate(x, y);
                                        ctx.rotate(-Math.PI / 2);
                                        ctx.fillStyle = '#FFFFFF';
                                        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                                        ctx.shadowBlur = 2;
                                        ctx.fillText(text, 0, 0);
                                        ctx.restore();
                                    }
                                });
                            }
                        });
                    }
                }],
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: isMobile ? 1.2 : 2,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: {
                                    size: isMobile ? 9 : 11
                                },
                                padding: isMobile ? 8 : 12,
                                boxWidth: isMobile ? 12 : 15
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: {
                                size: 14
                            },
                            bodyFont: {
                                size: 13
                            },
                            callbacks: {
                                label: function (context) {
                                    return context.dataset.label + ': ' + context.parsed.y + ' RO';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            stacked: false,
                            ticks: {
                                font: {
                                    size: isMobile ? 10 : 12
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            stacked: false,
                            ticks: {
                                font: {
                                    size: isMobile ? 9 : 11
                                },
                                maxRotation: 45,
                                minRotation: 45
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });

            if (isMobile) {
                this.regionChartMobileInstance = chart;
            } else {
                this.regionChartInstance = chart;
            }
        },
        exportGrowthData() {
            const wb = XLSX.utils.book_new();

            // Overall Growth Sheet
            const overallData = this.filteredGrowthData.map(item => ({
                Bulan: item.bulan,
                'Total RO': item.total_ro
            }));
            const wsOverall = XLSX.utils.json_to_sheet(overallData);
            XLSX.utils.book_append_sheet(wb, wsOverall, "Overall Growth");

            // Region Growth Sheet
            const regionData = this.filteredRegionGrowthData.map(item => ({
                Bulan: item.bulan,
                Region: item.province_code,
                'Total RO': item.total_ro
            }));
            const wsRegion = XLSX.utils.json_to_sheet(regionData);
            XLSX.utils.book_append_sheet(wb, wsRegion, "Region Growth");

            XLSX.writeFile(wb, `Growth_Data_${this.dateRange.start}_to_${this.dateRange.end}.xlsx`);
        }
    }
};
</script>

<style scoped>
canvas {
    max-height: 400px;
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