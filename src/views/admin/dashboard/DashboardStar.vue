<template>
    <div>
        <!-- Date Filter (Shared) -->
        <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-calendar</v-icon>
                Filter Bulan
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="starDateRange.start" label="Bulan Mulai" type="month" variant="outlined"
                            :density="$vuetify.display.mobile ? 'compact' : 'default'"
                            @update:model-value="onStarDateChange" class="mb-2 mb-md-0"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-text-field v-model="starDateRange.end" label="Bulan Akhir" type="month" variant="outlined"
                            :density="$vuetify.display.mobile ? 'compact' : 'default'"
                            @update:model-value="onStarDateChange"></v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Summary Cards (Shared) -->
        <v-row class="mb-4" :dense="$vuetify.display.mobile">
            <v-col cols="4" md="4">
                <v-card color="primary" dark @click="handleShowDetail('all_accounts')" style="cursor: pointer;">
                    <v-card-text class="text-center" :class="$vuetify.display.mobile ? 'pa-2' : ''">
                        <v-icon :size="$vuetify.display.mobile ? 20 : 48" class="mb-2">mdi-star</v-icon>
                        <div :class="$vuetify.display.mobile ? 'text-h6 font-weight-bold mt-1' : 'text-h4'">{{
                            starSummary.totalBintang }}</div>
                        <div class="text-subtitle-1" :class="$vuetify.display.mobile ? 'text-caption' : ''">Total
                            Bintang</div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="4" md="4">
                <v-card color="success" dark @click="handleShowDetail('all_accounts')" style="cursor: pointer;">
                    <v-card-text class="text-center" :class="$vuetify.display.mobile ? 'pa-2' : ''">
                        <v-icon :size="$vuetify.display.mobile ? 20 : 48" class="mb-2">mdi-account-multiple</v-icon>
                        <div :class="$vuetify.display.mobile ? 'text-h6 font-weight-bold mt-1' : 'text-h4'">{{
                            starSummary.totalAkun }}</div>
                        <div class="text-subtitle-1" :class="$vuetify.display.mobile ? 'text-caption' : ''">Total Akun
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="4" md="4">
                <v-card color="warning" dark @click="handleShowDetail('all_regions')" style="cursor: pointer;">
                    <v-card-text class="text-center" :class="$vuetify.display.mobile ? 'pa-2' : ''">
                        <v-icon :size="$vuetify.display.mobile ? 20 : 48" class="mb-2">mdi-map-marker-multiple</v-icon>
                        <div :class="$vuetify.display.mobile ? 'text-h6 font-weight-bold mt-1' : 'text-h4'">{{
                            starSummary.totalDaerah }}</div>
                        <div class="text-subtitle-1" :class="$vuetify.display.mobile ? 'text-caption' : ''">Total Daerah
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Desktop View -->
        <div class="d-none d-md-block">
            <!-- Section 1: Dashboard Star (All) -->
            <v-card class="mb-4">
                <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2" color="amber">mdi-star</v-icon>
                    Ranking Bintang Semua Akun
                </v-card-title>

                <v-card-text class="pb-0">
                    <v-select v-model="filterRoleStar" :items="roleFilterItems" label="Filter Role" variant="outlined"
                        density="compact" hide-details class="mb-2" style="max-width: 300px;"></v-select>
                </v-card-text>
                <v-card-text>
                    <v-data-table class="bg-grey-lighten-4 text-no-wrap" :headers="dashboardStarHeaders"
                        :items="filteredDashboardStar" :loading="isLoading" item-key="id" :items-per-page="10">
                        <template v-slot:item.ranking="{ item }">
                            <v-chip :color="getRankColor(item.ranking)" dark size="small">
                                <v-icon v-if="item.ranking <= 3" left size="14">
                                    {{ item.ranking === 1 ? 'mdi-trophy' : 'mdi-medal' }}
                                </v-icon>
                                {{ item.ranking }}
                            </v-chip>
                        </template>

                        <template v-slot:item.nama="{ item }">
                            <div class="font-weight-medium">{{ item.nama }}</div>
                            <div class="text-caption text-grey">{{ item.code }}</div>
                        </template>

                        <template v-slot:item.role="{ item }">
                            <v-chip :color="getRoleColor(item.role)" dark size="small">
                                {{ getRoleLabel(item.role) }}
                            </v-chip>
                        </template>

                        <template v-slot:item.total_bintang="{ item }">
                            <div class="d-flex align-center justify-center">
                                <v-icon v-for="n in parseInt(item.total_bintang)" :key="n" color="amber" size="small"
                                    class="mr-1">
                                    mdi-star
                                </v-icon>
                                <span v-if="!item.total_bintang || item.total_bintang == 0" class="text-grey">
                                    <v-icon color="grey lighten-2" size="small">mdi-star-outline</v-icon>
                                </span>
                            </div>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>

            <!-- Section 2: Leaderboard Per Bulan -->
            <v-card class="mb-4">
                <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2" color="primary">mdi-calendar-month</v-icon>
                    Leaderboard Per Bulan
                </v-card-title>
                <v-card-text class="pb-0">
                    <v-select v-model="filterRoleBulan" :items="roleFilterItems" label="Filter Role" variant="outlined"
                        density="compact" hide-details class="mb-2" style="max-width: 300px;"></v-select>
                </v-card-text>

                <v-card-text>
                    <v-chip-group v-model="selectedLeaderboardMonth" mandatory color="primary" class="mb-3">
                        <v-chip v-for="bulan in availableLeaderboardMonths" :key="bulan" :value="bulan" size="small"
                            variant="elevated">
                            {{ formatMonth(bulan) }}
                        </v-chip>
                    </v-chip-group>

                    <v-data-table class="bg-grey-lighten-4 text-no-wrap" :headers="leaderboardPerBulanHeaders"
                        :items="filteredLeaderboardBulanData" :loading="isLoading" item-key="id" :items-per-page="10">
                        <template v-slot:item.ranking="{ item }">
                            <v-chip :color="getRankColor(item.ranking)" dark size="small">
                                <v-icon v-if="item.ranking <= 3" left size="14">
                                    {{ item.ranking === 1 ? 'mdi-trophy' : 'mdi-medal' }}
                                </v-icon>
                                {{ item.ranking }}
                            </v-chip>
                        </template>

                        <template v-slot:item.nama="{ item }">
                            <div class="font-weight-medium">{{ item.nama }}</div>
                            <div class="text-caption text-grey">{{ item.code }}</div>
                        </template>

                        <template v-slot:item.role="{ item }">
                            <v-chip :color="getRoleColor(item.role)" dark size="small">
                                {{ getRoleLabel(item.role) }}
                            </v-chip>
                        </template>

                        <template v-slot:item.total_bintang="{ item }">
                            <div class="d-flex align-center justify-center">
                                <v-icon v-for="n in parseInt(item.total_bintang)" :key="n" color="amber" size="small"
                                    class="mr-1">
                                    mdi-star
                                </v-icon>
                                <span v-if="!item.total_bintang || item.total_bintang == 0" class="text-grey">
                                    <v-icon color="grey lighten-2" size="small">mdi-star-outline</v-icon>
                                </span>
                            </div>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>

            <!-- Section 3: Leaderboard Per Daerah (Cards) -->
            <v-card class="mb-4">
                <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2" color="warning">mdi-map-marker-multiple</v-icon>
                    Leaderboard Per Daerah
                </v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col v-for="(daerahData, daerahKey) in dashboardData.summary?.leaderboard_per_daerah || {}"
                            :key="daerahKey" cols="12" md="4">
                            <v-card :color="getDaerahCardColor(daerahKey)" dark
                                @click="$emit('show-daerah-detail', daerahKey, daerahData)" style="cursor: pointer;"
                                class="h-100">
                                <v-card-text class="text-center">
                                    <v-icon size="40" class="mb-2">mdi-map-marker</v-icon>
                                    <div class="text-h4 font-weight-bold">{{ daerahKey }}</div>
                                    <v-divider class="my-3" color="white"></v-divider>

                                    <div v-if="daerahData.length > 0" class="mb-2">
                                        <v-chip color="amber" dark size="small" class="mb-2">
                                            <v-icon left size="14">mdi-trophy</v-icon>
                                            #1
                                        </v-chip>
                                        <div class="text-body-1 font-weight-medium">{{ daerahData[0].nama }}</div>
                                        <div class="text-caption">{{ daerahData[0].code }}</div>
                                        <v-chip color="amber" dark size="small" class="mt-1">
                                            <v-icon left size="14">mdi-star</v-icon>
                                            {{ daerahData[0].total_bintang }} Bintang
                                        </v-chip>
                                    </div>

                                    <v-divider class="my-2" color="white"></v-divider>
                                    <div class="d-flex justify-center gap-3">
                                        <div class="d-flex align-center">
                                            <v-icon small class="mr-1">mdi-account-multiple</v-icon>
                                            <span class="text-body-2">{{ daerahData.length }} Akun</span>
                                        </div>
                                        <div class="d-flex align-center">
                                            <v-icon small class="mr-1" color="amber">mdi-star</v-icon>
                                            <span class="text-body-2">{{ getTotalBintangDaerah(daerahData) }}</span>
                                        </div>
                                    </div>

                                    <div class="text-caption mt-3 opacity-70">
                                        <v-icon size="14" class="mr-1">mdi-chevron-down</v-icon>
                                        Tap untuk detail
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </div>

        <!-- Mobile View -->
        <div class="d-block d-md-none">
            <!-- Mobile: Ranking Semua Akun -->
            <v-card class="mb-3">
                <v-card-title class="pa-3">
                    <v-icon class="mr-2" color="amber">mdi-star</v-icon>
                    Ranking Bintang
                </v-card-title>
                <v-card-text class="pa-0">
                    <v-list>
                        <v-list-item v-for="item in dashboardData.summary?.dashboard_star || []" :key="item.id"
                            class="py-3">
                            <template v-slot:prepend>
                                <v-chip :color="getRankColor(item.ranking)" dark size="small" class="mr-2"
                                    style="min-width: 32px; justify-content: center;">
                                    {{ item.ranking }}
                                </v-chip>
                            </template>

                            <v-list-item-title class="font-weight-medium">
                                {{ item.nama }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                                <div class="text-caption">{{ item.code }}</div>
                                <v-chip :color="getRoleColor(item.role)" dark size="x-small" class="mt-1">
                                    {{ getRoleLabel(item.role) }}
                                </v-chip>
                            </v-list-item-subtitle>

                            <template v-slot:append>
                                <v-chip color="amber" dark size="small">
                                    <v-icon left size="14">mdi-star</v-icon>
                                    {{ item.total_bintang }}
                                </v-chip>
                            </template>
                        </v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>

            <!-- Mobile: Leaderboard Per Bulan -->
            <v-card class="mb-3">
                <v-card-title class="pa-3">
                    <v-icon class="mr-2" color="primary">mdi-calendar-month</v-icon>
                    Leaderboard Per Bulan
                </v-card-title>
                <v-card-text class="pa-3">
                    <v-chip-group v-model="selectedLeaderboardMonth" mandatory color="primary" class="mb-3">
                        <v-chip v-for="bulan in availableLeaderboardMonths" :key="bulan" :value="bulan" size="small"
                            variant="elevated">
                            {{ formatMonth(bulan) }}
                        </v-chip>
                    </v-chip-group>
                </v-card-text>
                <v-card-text class="pa-0">
                    <v-list>
                        <v-list-item v-for="item in currentLeaderboardBulanData" :key="item.id" class="py-3">
                            <template v-slot:prepend>
                                <v-chip :color="getRankColor(item.ranking)" dark size="small" class="mr-2"
                                    style="min-width: 32px; justify-content: center;">
                                    {{ item.ranking }}
                                </v-chip>
                            </template>

                            <v-list-item-title class="font-weight-medium">
                                {{ item.nama }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                                <div class="text-caption">{{ item.code }}</div>
                                <v-chip :color="getRoleColor(item.role)" dark size="x-small" class="mt-1">
                                    {{ getRoleLabel(item.role) }}
                                </v-chip>
                            </v-list-item-subtitle>

                            <template v-slot:append>
                                <v-chip color="amber" dark size="small">
                                    <v-icon left size="14">mdi-star</v-icon>
                                    {{ item.total_bintang }}
                                </v-chip>
                            </template>
                        </v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>

            <!-- Mobile: Leaderboard Per Daerah (Cards) -->
            <div class="mb-3">
                <v-card class="mb-2" color="white" elevation="1">
                    <v-card-title class="pa-3">
                        <v-icon class="mr-2" color="warning">mdi-map-marker-multiple</v-icon>
                        Leaderboard Per Daerah
                    </v-card-title>
                </v-card>

                <v-card v-for="(daerahData, daerahKey) in dashboardData.summary?.leaderboard_per_daerah || {}"
                    :key="'mobile-' + daerahKey" class="mb-2"
                    @click="$emit('show-daerah-detail', daerahKey, daerahData)" style="cursor: pointer;">
                    <v-card-text class="pa-3">
                        <div class="d-flex align-center justify-space-between">
                            <div class="d-flex align-center">
                                <v-avatar :color="getDaerahCardColor(daerahKey)" size="40" class="mr-3">
                                    <v-icon color="white">mdi-map-marker</v-icon>
                                </v-avatar>
                                <div>
                                    <div class="text-body-1 font-weight-bold">{{ daerahKey }}</div>
                                    <div class="text-caption text-grey">{{ daerahData.length }} Akun</div>
                                </div>
                            </div>

                            <div class="text-right">
                                <v-chip color="amber" dark size="small">
                                    <v-icon left size="14">mdi-star</v-icon>
                                    {{ getTotalBintangDaerah(daerahData) }}
                                </v-chip>
                                <v-icon class="ml-2" color="grey">mdi-chevron-right</v-icon>
                            </div>
                        </div>

                        <!-- Top 1 Preview Mobile -->
                        <div v-if="daerahData.length > 0" class="mt-2 pt-2" style="border-top: 1px solid #eee;">
                            <div class="d-flex align-center">
                                <v-chip color="amber" dark size="x-small" class="mr-2">
                                    <v-icon left size="10">mdi-trophy</v-icon>
                                    #1
                                </v-chip>
                                <span class="text-caption font-weight-medium">{{ daerahData[0].nama }}</span>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DashboardStar',
    emits: ['show-daerah-detail', 'show-detail'],
    data() {
        return {
            dashboardData: {
                summary: {
                    dashboard_star: [],
                    leaderboard_per_daerah: {}
                }
            },
            mvoRawData: [],
            isLoading: false,
            starDateRange: {
                start: this.getDefaultStarStartDate(),
                end: this.getDefaultStarEndDate()
            },
            filterRoleStar: 'ALL',
            filterRoleBulan: 'ALL',
            selectedLeaderboardMonth: null,
            dashboardStarHeaders: [
                { title: "Rank", key: "ranking", align: "center", width: "80px" },
                { title: "Nama", key: "nama" },
                { title: "Role", key: "role", align: "center" },
                { title: "Bintang", key: "total_bintang", align: "center" },
            ],
            leaderboardPerBulanHeaders: [
                { title: "Rank", key: "ranking", align: "center", width: "80px" },
                { title: "Nama", key: "nama" },
                { title: "Role", key: "role", align: "center" },
                { title: "Bintang", key: "total_bintang", align: "center" },
            ],
        };
    },
    created() {
        this.fetchDashboardData();
    },
    computed: {
        roleFilterItems() {
            return [
                { title: 'Semua Role', value: 'ALL' },
                { title: 'MVO', value: 'MVO' },
                { title: 'Distributor', value: 'DIST' },
                { title: 'Founder', value: 'FO' }
            ];
        },
        filteredDashboardStar() {
            const data = this.dashboardData.summary?.dashboard_star || [];
            if (this.filterRoleStar === 'ALL') return data;
            return data.filter(item => item.role === this.filterRoleStar);
        },
        filteredLeaderboardBulanData() {
            const data = this.currentLeaderboardBulanData;
            if (this.filterRoleBulan === 'ALL') return data;
            return data.filter(item => item.role === this.filterRoleBulan);
        },
        availableLeaderboardMonths() {
            if (!this.dashboardData.summary?.leaderboard_per_bulan) return [];
            let months = Object.keys(this.dashboardData.summary.leaderboard_per_bulan);
            if (this.starDateRange.start && this.starDateRange.end) {
                months = months.filter(month => {
                    return month >= this.starDateRange.start && month <= this.starDateRange.end;
                });
            }
            return months.sort();
        },
        currentLeaderboardBulanData() {
            if (!this.selectedLeaderboardMonth || !this.dashboardData.summary?.leaderboard_per_bulan) {
                return [];
            }
            return this.dashboardData.summary.leaderboard_per_bulan[this.selectedLeaderboardMonth] || [];
        },
        starSummary() {
            const dashboardStar = this.dashboardData.summary?.dashboard_star || [];
            const leaderboardDaerah = this.dashboardData.summary?.leaderboard_per_daerah || {};
            return {
                totalBintang: dashboardStar.reduce((sum, item) => sum + parseInt(item.total_bintang || 0), 0),
                totalAkun: dashboardStar.length,
                totalDaerah: Object.keys(leaderboardDaerah).length
            };
        },
    },
    watch: {
        availableLeaderboardMonths: {
            handler(months) {
                if (months.length > 0) {
                    if (!months.includes(this.selectedLeaderboardMonth)) {
                        this.selectedLeaderboardMonth = months[months.length - 1];
                    }
                } else {
                    this.selectedLeaderboardMonth = null;
                }
            },
            immediate: true
        }
    },
    methods: {
        async fetchDashboardData() {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]; // Menggunakan Cookies.get lebih baik
            if (!token) return;
            this.isLoading = true;
            try {
                // Menggunakan axios agar konsisten dengan komponen lain
                const [dashboardResponse, mvoResponse] = await Promise.all([
                    axios.get("https://babaapi.teknosof.com/api/dashboard", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("https://babaapi.teknosof.com/api/mvo", {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                ]);

                if (dashboardResponse.data && dashboardResponse.data.status === "success") {
                    // Mencegah error jika summary null
                    this.dashboardData = dashboardResponse.data.data || { summary: {} };
                }

                if (mvoResponse.data && mvoResponse.data.status === "success") {
                    this.mvoRawData = mvoResponse.data.data;
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                this.isLoading = false;
            }
        },
        handleShowDetail(type) {
            let data = [];
            let title = '';

            switch (type) {
                case 'all_accounts':
                    data = this.mvoRawData;
                    break;
                case 'all_regions':
                    data = this.getRegionSummaryData();
                    break;
            }

            this.$emit('show-detail', { type, data, title });
        },
        getRegionSummaryData() {
            const regionSummary = [];
            const regions = this.dashboardData.summary?.akun_per_daerah || [];

            regions.forEach(region => {
                const accountsInRegion = this.mvoRawData.filter(account =>
                    account.daerah === region.daerah
                );

                regionSummary.push({
                    id: region.daerah,
                    region_name: region.daerah,
                    total_accounts: region.total,
                    accounts: accountsInRegion,
                    approved_accounts: accountsInRegion.filter(acc => acc.status_inputan === "approved").length,
                    pending_accounts: accountsInRegion.filter(acc => !acc.status_inputan || acc.status_inputan === "pending").length
                });
            });

            return regionSummary;
        },
        getDefaultStarStartDate() {
            const date = new Date();
            date.setMonth(date.getMonth() - 6);
            return date.toISOString().slice(0, 7);
        },
        getDefaultStarEndDate() {
            return new Date().toISOString().slice(0, 7);
        },
        onStarDateChange() {
            if (this.availableLeaderboardMonths.length > 0) {
                this.selectedLeaderboardMonth = this.availableLeaderboardMonths[0];
            }
        },
        getRankColor(rank) {
            switch (rank) {
                case 1: return "amber";
                case 2: return "grey";
                case 3: return "orange";
                default: return "blue";
            }
        },
        getRoleColor(role) {
            switch (role) {
                case 'MVO': return 'primary';
                case 'DIST': return 'cyan';
                case 'FO': return 'purple';
                default: return 'grey';
            }
        },
        getRoleLabel(role) {
            switch (role) {
                case 'MVO': return 'MVO';
                case 'DIST': return 'Distributor';
                case 'FO': return 'Founder';
                default: return role || 'Unknown';
            }
        },
        getDaerahCardColor(daerahKey) {
            const colors = ['primary', 'success', 'info', 'warning', 'purple', 'teal', 'cyan', 'error'];
            let hash = 0;
            for (let i = 0; i < daerahKey.length; i++) {
                hash = daerahKey.charCodeAt(i) + ((hash << 5) - hash);
            }
            return colors[Math.abs(hash) % colors.length];
        },
        getTotalBintangDaerah(daerahData) {
            return daerahData.reduce((sum, item) => sum + parseInt(item.total_bintang || 0), 0);
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
    }
};
</script>

<script setup>
// Ditambahkan agar konsisten dengan komponen lain
import axios from 'axios';
</script>
