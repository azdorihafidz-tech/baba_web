<template>
    <div>
        <!-- Date Filter (Shared) -->
        <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-calendar</v-icon>
                Filter Tanggal
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="dateRange.start" label="Tanggal Mulai" type="date" variant="outlined"
                            :density="$vuetify.display.mobile ? 'compact' : 'default'"
                            @update:model-value="fetchGrowthData" class="mb-2 mb-md-0"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="dateRange.end" label="Tanggal Akhir" type="date" variant="outlined"
                            :density="$vuetify.display.mobile ? 'compact' : 'default'"
                            @update:model-value="fetchGrowthData"></v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Desktop View -->
        <div class="d-none d-md-block">
            <v-row class="mb-4">
                <v-col cols="12" md="4">
                    <v-card color="primary" dark @click="$emit('show-detail', 'total_growth', filteredGrowthData)"
                        style="cursor: pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">mdi-chart-line</v-icon>
                            <div class="text-h4">{{ getTotalGrowth() }}</div>
                            <div class="text-subtitle-1">Total Pertumbuhan</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="4">
                    <v-card color="warning" dark @click="$emit('show-detail', 'mvo_growth', filteredMVOGrowthData)"
                        style="cursor: pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">mdi-account-group</v-icon>
                            <div class="text-h4">{{ getMVOGrowth() }}</div>
                            <div class="text-subtitle-1">Pertumbuhan MVO</div>
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
                            <div class="growth-chart">
                                <div v-for="(item, index) in filteredGrowthData" :key="item.bulan"
                                    class="growth-item mb-3">
                                    <div class="d-flex justify-space-between align-center mb-1">
                                        <span class="text-body-2">{{ formatMonth(item.bulan) }}</span>
                                        <span class="text-h6 font-weight-bold">{{ item.total_anggota_baru }}</span>
                                    </div>
                                    <v-progress-linear
                                        :model-value="(parseInt(item.total_anggota_baru) / getMaxGrowthValue()) * 100"
                                        color="primary" height="20" rounded>
                                        <span class="text-white text-caption">{{ item.total_anggota_baru }}
                                            anggota</span>
                                    </v-progress-linear>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="6">
                    <v-card class="mb-4">
                        <v-card-title class="d-flex align-center">
                            <v-icon class="mr-2">mdi-chart-bar</v-icon>
                            Grafik Pertumbuhan per MVO
                        </v-card-title>
                        <v-card-text>
                            <div class="growth-chart">
                                <div v-for="(item, index) in filteredMVOGrowthData" :key="item.mvo_id + item.bulan"
                                    class="growth-item mb-3">
                                    <div class="d-flex justify-space-between align-center mb-1">
                                        <div>
                                            <span class="text-body-2 font-weight-medium">{{ item.mvo_nama }}</span>
                                            <span class="text-caption text-grey ml-2">{{ formatMonth(item.bulan)
                                                }}</span>
                                        </div>
                                        <span class="text-h6 font-weight-bold">{{ item.total_bawahan_baru }}</span>
                                    </div>
                                    <v-progress-linear
                                        :model-value="(parseInt(item.total_bawahan_baru) / getMaxMVOGrowthValue()) * 100"
                                        :color="getMVOColor(index)" height="20" rounded>
                                        <span class="text-white text-caption">{{ item.total_bawahan_baru }}
                                            Downline</span>
                                    </v-progress-linear>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </div>

        <!-- Mobile View -->
        <div class="d-block d-md-none">
            <v-row dense class="mb-3">
                <v-col cols="12">
                    <v-card color="primary" dark @click="$emit('show-detail', 'total_growth', filteredGrowthData)"
                        style="cursor: pointer;">
                        <v-card-text class="text-center pa-3">
                            <v-icon size="32" class="mb-2">mdi-chart-line</v-icon>
                            <div class="text-h5">{{ getTotalGrowth() }}</div>
                            <div class="text-caption">Total Pertumbuhan</div>
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
                    <v-card color="warning" dark @click="$emit('show-detail', 'mvo_growth', filteredMVOGrowthData)"
                        style="cursor: pointer;">
                        <v-card-text class="text-center pa-2">
                            <v-icon size="24">mdi-account-group</v-icon>
                            <div class="text-h6 mt-1">{{ getMVOGrowth() }}</div>
                            <div class="text-caption">MVO</div>
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
                    <div v-for="(item, index) in filteredGrowthData" :key="item.bulan" class="mb-3">
                        <div class="d-flex justify-space-between align-center mb-1">
                            <span class="text-body-2">{{ formatMonth(item.bulan) }}</span>
                            <span class="text-body-1 font-weight-bold">{{ item.total_anggota_baru }}</span>
                        </div>
                        <v-progress-linear
                            :model-value="(parseInt(item.total_anggota_baru) / getMaxGrowthValue()) * 100"
                            color="primary" height="16" rounded>
                            <span class="text-white text-caption">{{ item.total_anggota_baru }}</span>
                        </v-progress-linear>
                    </div>
                </v-card-text>
            </v-card>

            <v-card>
                <v-card-title class="pa-3">
                    <v-icon class="mr-2">mdi-chart-bar</v-icon>
                    Pertumbuhan per MVO
                </v-card-title>
                <v-card-text class="pa-3">
                    <div v-for="(item, index) in filteredMVOGrowthData" :key="item.mvo_id + item.bulan" class="mb-3">
                        <div class="d-flex justify-space-between align-center mb-1">
                            <div>
                                <div class="text-body-2 font-weight-medium">{{ item.mvo_nama }}</div>
                                <div class="text-caption text-grey">{{ formatMonth(item.bulan) }}</div>
                            </div>
                            <span class="text-body-1 font-weight-bold">{{ item.total_bawahan_baru }}</span>
                        </div>
                        <v-progress-linear
                            :model-value="(parseInt(item.total_bawahan_baru) / getMaxMVOGrowthValue()) * 100"
                            :color="getMVOColor(index)" height="16" rounded>
                            <span class="text-white text-caption">{{ item.total_bawahan_baru }}</span>
                        </v-progress-linear>
                    </div>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DashboardGrowth',
    emits: ['show-detail'],
    data() {
        return {
            dashboardData: { summary: {} },
            dateRange: {
                start: this.getDefaultStartDate(),
                end: this.getDefaultEndDate()
            },
        };
    },
    created() {
        this.fetchDashboardData();
    },
    computed: {
        filteredGrowthData() {
            if (!this.dashboardData.summary?.grafik_pertumbuhan) return [];

            return this.dashboardData.summary.grafik_pertumbuhan.filter(item => {
                const itemDate = new Date(item.bulan + '-01');
                const startDate = new Date(this.dateRange.start);
                const endDate = new Date(this.dateRange.end);

                return itemDate >= startDate && itemDate <= endDate;
            });
        },
        filteredMVOGrowthData() {
            if (!this.dashboardData.summary?.grafik_pertumbuhan_per_mvo) return [];

            return this.dashboardData.summary.grafik_pertumbuhan_per_mvo.filter(item => {
                const itemDate = new Date(item.bulan + '-01');
                const startDate = new Date(this.dateRange.start);
                const endDate = new Date(this.dateRange.end);

                return itemDate >= startDate && itemDate <= endDate;
            });
        }
    },
    methods: {
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
        async fetchDashboardData() {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
            if (!token) return;
            try {
                const response = await fetch("https://babaapi.teknosof.com/api/dashboard", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (data.status === "success") {
                    this.dashboardData = data.data;
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        },
        getTotalGrowth() {
            return this.filteredGrowthData.reduce((total, item) => total + parseInt(item.total_anggota_baru || 0), 0);
        },
        getMonthlyGrowth() {
            return this.filteredGrowthData.length;
        },
        getMVOGrowth() {
            return this.filteredMVOGrowthData.reduce((total, item) => total + parseInt(item.total_bawahan_baru || 0), 0);
        },
        getMaxGrowthValue() {
            const values = this.filteredGrowthData.map(item => parseInt(item.total_anggota_baru || 0));
            return Math.max(...values, 1);
        },
        getMaxMVOGrowthValue() {
            const values = this.filteredMVOGrowthData.map(item => parseInt(item.total_bawahan_baru || 0));
            return Math.max(...values, 1);
        },
        formatMonth(monthString) {
            if (!monthString) return '';
            const [year, month] = monthString.split('-');
            const monthNames = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            return `${monthNames[parseInt(month) - 1]} ${year}`;
        },
        getMVOColor(index) {
            const colors = ["primary", "success", "info", "warning", "error", "purple", "cyan", "teal"];
            return colors[index % colors.length];
        },
    }
};
</script>
