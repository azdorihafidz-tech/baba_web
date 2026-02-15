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
                    </v-row>
                </v-card-text>
            </v-card>

            <v-row class="mb-4">
                <v-col cols="12" md="4">
                    <v-card color="primary" dark @click="$emit('show-detail', 'total_growth', filteredGrowthData)"
                        style="cursor: pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">mdi-chart-line</v-icon>
                            <div class="text-h4">{{ getTotalGrowth() }}</div>
                            <div class="text-subtitle-1">Total Pertumbuhan (RO)</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="4">
                    <v-card color="warning" dark
                        @click="$emit('show-detail', 'region_growth', filteredRegionGrowthData)"
                        style="cursor: pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">mdi-map-marker-multiple</v-icon>
                            <div class="text-h4">{{ getRegionGrowth() }}</div>
                            <div class="text-subtitle-1">Pertumbuhan Region (RO)</div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

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
                <v-col cols="12">
                    <v-card color="primary" dark @click="$emit('show-detail', 'total_growth', filteredGrowthData)"
                        style="cursor: pointer;">
                        <v-card-text class="text-center pa-3">
                            <v-icon size="32" class="mb-2">mdi-chart-line</v-icon>
                            <div class="text-h5">{{ getTotalGrowth() }}</div>
                            <div class="text-caption">Total Pertumbuhan (RO)</div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row dense class="mb-3">
                <v-col cols="6">
                    <v-card color="success" dark @click="$emit('show-detail', 'monthly_growth', filteredGrowthData)"
                        style="cursor: pointer;">
                        <v-card-text class="text-center pa-2">
                            <v-icon size="24">mdi-chart-bar</v-icon>
                            <div class="text-h6 mt-1">{{ getMonthlyGrowth() }}</div>
                            <div class="text-caption">Bulanan</div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="6">
                    <v-card color="warning" dark
                        @click="$emit('show-detail', 'region_growth', filteredRegionGrowthData)"
                        style="cursor: pointer;">
                        <v-card-text class="text-center pa-2">
                            <v-icon size="24">mdi-map-marker-multiple</v-icon>
                            <div class="text-h6 mt-1">{{ getRegionGrowth() }}</div>
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
        </div>
    </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
    name: 'DashboardGrowth',
    emits: ['show-detail'],
    data() {
        return {
            mvo_type_id: null,
            cabang: null,
            growthRawData: [],
            regionGrowthRawData: [],
            dateRange: {
                start: this.getDefaultStartDate(),
                end: this.getDefaultEndDate()
            },
            overallChartInstance: null,
            regionChartInstance: null,
            overallChartMobileInstance: null,
            regionChartMobileInstance: null,
        };
    },
    created() {
        this.initUser();
        this.fetchData();
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
        filteredGrowthData() {
            if (!this.growthRawData) return [];

            return this.growthRawData.filter(item => {
                const itemDate = new Date(item.bulan + '-01');
                const startDate = new Date(this.dateRange.start);
                const endDate = new Date(this.dateRange.end);

                return itemDate >= startDate && itemDate <= endDate;
            });
        },
        filteredRegionGrowthData() {
            if (!this.regionGrowthRawData) return [];

            return this.regionGrowthRawData.filter(item => {
                const itemDate = new Date(item.bulan + '-01');
                const startDate = new Date(this.dateRange.start);
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
            // Logic handled by computed properties
        },
        async fetchData() {
            const token = Cookies.get("token") || localStorage.getItem("token");
            if (!token) return;

            let url = "";
            if (this.mvo_type_id === "superadmin") {
                url = `https://babaapi.teknosof.com/api/dashboard/growth`;
            } else {
                if (!this.cabang) {
                    console.warn("Cabang user tidak ada → API tidak dipanggil");
                    return;
                }
                url = `https://babaapi.teknosof.com/api/dashboard/growth/${this.cabang}`;
            }

            try {
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.status === "success") {
                    this.growthRawData = response.data.overall_growth || [];
                    this.regionGrowthRawData = response.data.region_growth || [];
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
                return {
                    label: region,
                    data: data,
                    backgroundColor: this.getRegionColor(index),
                    borderColor: this.getRegionColor(index).replace('0.8', '1'),
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
        }
    }
};
</script>

<style scoped>
canvas {
    max-height: 400px;
}
</style>