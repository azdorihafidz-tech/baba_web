<template>
    <!-- Desktop Layout (md and up) -->
    <v-card class="d-none d-md-block">
        <v-row class="ga-4" align="stretch">
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
        </v-row>


        <v-card-text>
            <!-- Summary Cards -->

            <!-- Section 1: Dashboard Star (All) -->
            <v-card class="mb-4">
                <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2" color="amber">mdi-star</v-icon>
                    Ranking Semua Akun
                </v-card-title>

                <!-- FILTER ROLE & EXPORT -->
                <v-card-text class="pb-0">
                    <div class="d-flex align-center justify-space-between mb-3">
                        <div style="width: 300px;">
                            <v-select v-model="filterRoleStar" :items="roleFilterItems" label="Filter Role"
                                variant="outlined" density="compact" hide-details></v-select>
                        </div>
                    </div>
                    <div class="text-center">
                        <v-btn color="success" prepend-icon="mdi-microsoft-excel"
                            @click="exportToExcel(filteredDashboardStar, 'Ranking_Semua_Akun', dashboardStarHeaders)">
                            Export Excel
                        </v-btn>
                    </div>
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
                                <v-chip color="amber" dark size="small">
                                    <v-icon left size="14">mdi-star</v-icon>
                                    {{ item.total_bintang }}
                                </v-chip>
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

                <!-- FILTER AREA -->
                <v-card-text class="pb-0">

                    <!-- Range Bulan -->
                    <div class="d-flex align-center flex-wrap justify-center mb-3" style="gap: 12px;">
                        <v-text-field v-model="filterStartMonth" type="month" label="Dari Bulan" density="compact"
                            variant="outlined" hide-details style="min-width:150px;" />

                        <v-text-field v-model="filterEndMonth" type="month" label="Sampai Bulan" density="compact"
                            variant="outlined" hide-details style="min-width:150px;" />
                    </div>

                    <!-- Filter Role -->
                    <div class="d-flex align-center justify-center mb-3">
                        <v-select v-model="filterRoleBulan" :items="roleFilterItems" label="Filter Role"
                            variant="outlined" density="compact" hide-details style="min-width: 200px;" />
                    </div>

                    <!-- Export Button -->
                    <div class="text-center">
                        <v-btn color="success" prepend-icon="mdi-microsoft-excel" @click="exportToExcel(
                            filteredLeaderboardBulanData,
                            `Leaderboard_Bulan_${selectedLeaderboardMonth}`,
                            leaderboardPerBulanHeaders
                        )">
                            Export Excel
                        </v-btn>
                    </div>

                </v-card-text>

                <!-- CHIP PILIH BULAN -->
                <v-card-text>
                    <v-chip-group v-model="selectedLeaderboardMonth" mandatory color="primary" class="mb-3">
                        <v-chip v-for="bulan in filteredAvailableLeaderboardMonths" :key="bulan" :value="bulan"
                            size="small" variant="elevated">
                            {{ formatMonth(bulan) }}
                        </v-chip>
                    </v-chip-group>

                    <!-- DATA TABLE -->
                    <v-data-table class="bg-grey-lighten-4 text-no-wrap" :headers="leaderboardPerBulanHeaders"
                        :items="filteredLeaderboardBulanData" :loading="isLoading" item-key="id" :items-per-page="10">

                        <!-- Ranking -->
                        <template v-slot:item.ranking="{ item }">
                            <v-chip :color="getRankColor(item.ranking)" dark size="small">
                                <v-icon v-if="item.ranking <= 3" left size="14">
                                    {{ item.ranking === 1 ? 'mdi-trophy' : 'mdi-medal' }}
                                </v-icon>
                                {{ item.ranking }}
                            </v-chip>
                        </template>

                        <!-- Nama -->
                        <template v-slot:item.nama="{ item }">
                            <div class="font-weight-medium">{{ item.nama }}</div>
                            <div class="text-caption text-grey">{{ item.code }}</div>
                        </template>

                        <!-- Role -->
                        <template v-slot:item.role="{ item }">
                            <v-chip :color="getRoleColor(item.role)" dark size="small">
                                {{ getRoleLabel(item.role) }}
                            </v-chip>
                        </template>

                        <!-- Total Bintang -->
                        <template v-slot:item.total_bintang="{ item }">
                            <div class="d-flex align-center justify-center">
                                <v-chip color="amber" dark size="small">
                                    <v-icon left size="14">mdi-star</v-icon>
                                    {{ item.total_bintang }}
                                </v-chip>
                            </div>
                        </template>

                    </v-data-table>
                </v-card-text>
            </v-card>


            <!-- Section 3: Leaderboard Per Daerah (Cards) -->
            <v-card class="mb-4">

                <v-card color="#FFD700" dark class="flex-grow-1">
                    <v-card-title class="d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-map-marker-multiple</v-icon>
                        Leaderboard Per Daerah
                    </v-card-title>
                    <v-card-text class="text-center">
                        <v-icon size="48" class="mb-2">mdi-map-marker-multiple</v-icon>
                        <div class="text-h4">{{ starSummary.totalDaerah }}</div>
                        <div class="text-subtitle-1">Total Daerah</div>
                    </v-card-text>
                </v-card>

                <v-card-text>
                    <v-row>
                        <v-col v-for="(daerahData, daerahKey) in dashboardData.leaderboard_per_daerah || {}"
                            :key="daerahKey" cols="12" md="4">
                            <v-card :color="getDaerahCardColor(daerahKey)" dark
                                @click="showDaerahLeaderboardDetail(daerahKey, daerahData)" style="cursor: pointer;"
                                class="h-100">
                                <v-card-text class="text-center">
                                    <v-icon size="40" class="mb-2">mdi-map-marker</v-icon>
                                    <div class="text-h4 font-weight-bold">{{ daerahKey }}</div>
                                    <v-divider class="my-3" color="white"></v-divider>

                                    <!-- Top 1 Preview -->
                                    <div v-if="daerahData.length > 0" class="mb-2">
                                        <v-chip color="amber" dark size="small" class="mb-2">
                                            <v-icon left size="14">mdi-trophy</v-icon>
                                            1
                                        </v-chip>
                                        <div class="text-body-1 font-weight-medium">{{ daerahData[0].nama }}
                                        </div>
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

                                    </div>

                                    <!-- Click hint -->
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
        </v-card-text>
    </v-card>

    <!-- Mobile Layout (sm and below) -->
    <div class="d-block d-md-none">
        <!-- Mobile Header -->
        <v-card class="mb-3" elevation="3">
            <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between mb-3">
                    <h2 class="text-h5 font-weight-bold">Dashboard Star</h2>
                    <v-btn icon @click="refreshData" :loading="isLoading" size="small">
                        <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                </div>
            </v-card-text>
        </v-card>

        <!-- Mobile Action Buttons -->
        <v-row dense class="mb-3">
            <v-col cols="6">
                <v-card color="#FFD700" dark @click="openTopStarDialog" class="text-center pa-3"
                    style="cursor: pointer">
                    <v-icon class="mb-1">mdi-trophy</v-icon>
                    <div class="text-caption font-weight-bold">TOP STAR</div>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card color="success" dark @click="openAkunPerMvoDialog" class="text-center pa-3"
                    style="cursor: pointer">
                    <v-icon class="mb-1">mdi-account-multiple</v-icon>
                    <div class="text-caption font-weight-bold">AKUN PER MVO</div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Mobile Star Section -->
        <div>
            <!-- Mobile: Ranking Semua Akun -->
            <v-card class="mb-3">
                <v-card-title class="pa-3">
                    <v-icon class="mr-2" color="amber">mdi-star</v-icon>
                    Ranking Bintang
                </v-card-title>

                <!-- Filter & Export Mobile -->
                <v-card-text class="pa-3 pt-0">
                    <v-row dense align="center">
                        <v-col cols="8">
                            <v-select v-model="filterRoleStar" :items="roleFilterItems" label="Filter Role"
                                variant="outlined" density="compact" hide-details></v-select>
                        </v-col>
                        <v-col cols="4">
                            <v-btn block color="success" size="small"
                                @click="exportToExcel(filteredDashboardStar, 'Ranking_Semua_Akun', dashboardStarHeaders)">
                                <v-icon>mdi-microsoft-excel</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-text class="pa-0">
                    <v-list>
                        <v-list-item v-for="item in dashboardData.dashboard_star || []" :key="item.id" class="py-3">
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

                <!-- Filter & Export Mobile -->
                <v-card-text class="pa-3 pt-0">
                    <v-row dense class="mb-2">
                        <v-col cols="6">
                            <v-text-field v-model="filterStartMonth" type="month" label="Dari" density="compact"
                                variant="outlined" hide-details />
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="filterEndMonth" type="month" label="Sampai" density="compact"
                                variant="outlined" hide-details />
                        </v-col>
                    </v-row>
                    <v-row dense align="center">
                        <v-col cols="8">
                            <v-select v-model="filterRoleBulan" :items="roleFilterItems" label="Filter Role"
                                variant="outlined" density="compact" hide-details />
                        </v-col>
                        <v-col cols="4">
                            <v-btn block color="success" size="small"
                                @click="exportToExcel(filteredLeaderboardBulanData, `Leaderboard_Bulan_${selectedLeaderboardMonth}`, leaderboardPerBulanHeaders)">
                                <v-icon>mdi-microsoft-excel</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>

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
                <v-card class="mb-2" color="#FFD700" dark elevation="1">
                    <v-card-title class="pa-3">
                        <v-icon class="mr-2" color="primary">mdi-map-marker-multiple</v-icon>
                        Leaderboard Per Daerah
                    </v-card-title>
                    <v-card-text class="text-center pb-4">
                        <v-icon size="40" class="mb-2">mdi-map-marker-multiple</v-icon>
                        <div class="text-h4 font-weight-bold">{{ starSummary.totalDaerah }}</div>
                        <div class="text-subtitle-1">Total Daerah</div>
                    </v-card-text>
                </v-card>

                <v-card v-for="(daerahData, daerahKey) in dashboardData.leaderboard_per_daerah || {}"
                    :key="'mobile-' + daerahKey" class="mb-2"
                    @click="showDaerahLeaderboardDetail(daerahKey, daerahData)" style="cursor: pointer;">
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

    <!-- Daerah Leaderboard Detail Modal -->
    <v-dialog v-model="daerahDetailModal" max-width="90vw" fullscreen-on-mobile>
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center pa-4">
                <div>
                    <div class="text-h6 font-weight-bold">
                        <v-icon class="mr-2" color="warning">mdi-map-marker</v-icon>
                        Leaderboard Daerah — {{ selectedDaerahKey }}
                    </div>
                    <div class="text-caption text-grey">{{ selectedDaerahData.length }} Akun</div>
                </div>
                <v-btn icon @click="daerahDetailModal = false" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="pa-4 pb-0 text-center">
                <v-btn color="success" prepend-icon="mdi-microsoft-excel"
                    @click="exportToExcel(selectedDaerahData, `Leaderboard_Daerah_${selectedDaerahKey}`, daerahDetailHeaders)">
                    Export Excel
                </v-btn>
            </v-card-text>

            <!-- Summary mini cards -->
            <v-card-text class="pa-4 pb-2">
                <v-row dense>
                    <v-col cols="6" md="3">
                        <v-card flat color="grey-lighten-4" class="text-center pa-3">
                            <v-icon color="amber" size="20">mdi-star</v-icon>
                            <div class="text-h6 font-weight-bold mt-1">{{ getTotalBintangDaerah(selectedDaerahData)
                            }}</div>
                            <div class="text-caption">Total Bintang</div>
                        </v-card>
                    </v-col>
                    <v-col cols="6" md="3">
                        <v-card flat color="grey-lighten-4" class="text-center pa-3">
                            <v-icon color="success" size="20">mdi-account-multiple</v-icon>
                            <div class="text-h6 font-weight-bold mt-1">{{ selectedDaerahData.length }}</div>
                            <div class="text-caption">Total Akun</div>
                        </v-card>
                    </v-col>
                    <v-col cols="6" md="3">
                        <v-card flat color="grey-lighten-4" class="text-center pa-3">
                            <v-icon color="primary" size="20">mdi-account</v-icon>
                            <div class="text-h6 font-weight-bold mt-1">{{ getDaerahRoleCount('MVO') }}</div>
                            <div class="text-caption">MVO</div>
                        </v-card>
                    </v-col>
                    <v-col cols="6" md="3">
                        <v-card flat color="grey-lighten-4" class="text-center pa-3">
                            <v-icon color="primary" size="20">mdi-account</v-icon>
                            <div class="text-h6 font-weight-bold mt-1">{{ getDaerahRoleCount('REGIONAL') }}</div>
                            <div class="text-caption">Regional</div>
                        </v-card>
                    </v-col>
                    <v-col cols="6" md="3">
                        <v-card flat color="grey-lighten-4" class="text-center pa-3">
                            <v-icon color="purple" size="20">mdi-crown</v-icon>
                            <div class="text-h6 font-weight-bold mt-1">{{ getDaerahRoleCount('FO') }}</div>
                            <div class="text-caption">Founder</div>
                        </v-card>
                    </v-col>
                    <v-col cols="6" md="3">
                        <v-card flat color="grey-lighten-4" class="text-center pa-3">
                            <v-icon color="orange" size="20">mdi-account-star</v-icon>
                            <div class="text-h6 font-weight-bold mt-1">{{ getDaerahRoleCount('GM') }}</div>
                            <div class="text-caption">GM</div>
                        </v-card>
                    </v-col>
                    <v-col cols="6" md="3">
                        <v-card flat color="grey-lighten-4" class="text-center pa-3">
                            <v-icon color="purple" size="20">mdi-crown</v-icon>
                            <div class="text-h6 font-weight-bold mt-1">{{ getDaerahRoleCount('SUPPLIER') }}</div>
                            <div class="text-caption">Supplier</div>
                        </v-card>
                    </v-col>
                    <v-col cols="6" md="3">
                        <v-card flat color="grey-lighten-4" class="text-center pa-3">
                            <v-icon color="cyan" size="20">mdi-store</v-icon>
                            <div class="text-h6 font-weight-bold mt-1">{{ getDaerahRoleCount('DIST') }}</div>
                            <div class="text-caption">Distributor</div>
                        </v-card>
                    </v-col>

                    <v-col cols="6" md="3">
                        <v-card flat color="grey-lighten-4" class="text-center pa-3">
                            <v-icon color="grey" size="20">mdi-store</v-icon>
                            <div class="text-h6 font-weight-bold mt-1">{{ getDaerahRoleCount('SELL') }}</div>
                            <div class="text-caption">Seller</div>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-card-text class="pa-0">
                <!-- Mobile List -->
                <div class="d-block d-md-none">
                    <v-list>
                        <v-list-item v-for="item in selectedDaerahData" :key="item.id" class="py-3">
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
                </div>

                <!-- Desktop Table -->
                <div class="d-none d-md-block">
                    <v-data-table class="bg-grey-lighten-4 text-no-wrap" :headers="daerahDetailHeaders"
                        :items="selectedDaerahData" :loading="isLoading" item-key="id" :items-per-page="10">
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
                                <v-chip color="amber" dark size="small">
                                    <v-icon left size="14">mdi-star</v-icon>
                                    {{ item.total_bintang }}
                                </v-chip>
                            </div>
                        </template>
                    </v-data-table>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>

    <!-- Top Star Dialog -->
    <v-dialog v-model="topStarDialog" max-width="900px">
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center pa-4">
                <div class="text-h6 font-weight-bold">
                    <v-icon class="mr-2" color="#FFD700">mdi-trophy</v-icon>
                    Top Star
                </div>
                <v-btn icon @click="topStarDialog = false" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-4 text-center">
                <v-btn color="success" prepend-icon="mdi-microsoft-excel"
                    @click="exportToExcel(dashboardData.top_star, 'Top_Star_Data', topStarHeaders)">
                    Export Excel
                </v-btn>
            </v-card-text>
            <v-card-text>
                <v-data-table :headers="topStarHeaders" :items="dashboardData.top_star" :items-per-page="10"
                    class="bg-grey-lighten-4">
                    <template v-slot:item.total_repeat_order="{ item }">
                        {{ item.total_repeat_order }}
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>

    <!-- Akun Per MVO Dialog -->
    <v-dialog v-model="akunPerMvoDialog" max-width="900px">
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center pa-4">
                <div class="text-h6 font-weight-bold">
                    <v-icon class="mr-2" color="success">mdi-account-multiple</v-icon>
                    Total Akun Per MVO
                </div>
                <v-btn icon @click="akunPerMvoDialog = false" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-4 text-center">
                <v-btn color="success" prepend-icon="mdi-microsoft-excel"
                    @click="exportToExcel(dashboardData.akun_per_mvo, 'Akun_Per_MVO', akunPerMvoHeaders)">
                    Export Excel
                </v-btn>
            </v-card-text>
            <v-card-text>
                <v-data-table :headers="akunPerMvoHeaders" :items="dashboardData.akun_per_mvo" :items-per-page="10"
                    class="bg-grey-lighten-4">
                    <template v-slot:item.role="{ item }">
                        <v-chip :color="getRoleColor(item.role)" dark size="small">
                            {{ getRoleLabel(item.role) }}
                        </v-chip>
                    </template>
                    <template v-slot:item.total_akun="{ item }">
                        <v-chip color="primary" size="small">{{ item.total_akun }}</v-chip>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>

    <!-- Loading Overlay -->
    <v-overlay v-model="isLoading" class="align-center justify-center">
        <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
    </v-overlay>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";

export default {
    data() {
        return {
            tab: "dashboard-star",
            isLoading: false,

            // Leaderboard per bulan
            selectedLeaderboardMonth: null,
            filterStartMonth: '',
            filterEndMonth: '',

            // Daerah detail modal
            daerahDetailModal: false,
            topStarDialog: false,
            akunPerMvoDialog: false,

            selectedDaerahKey: '',
            selectedDaerahData: [],
            filterRoleStar: 'ALL',
            filterRoleBulan: 'ALL',

            // Headers
            dashboardStarHeaders: [
                { title: "Rank", key: "ranking", align: "center", width: "80px" },
                { title: "Nama", key: "nama" },
                { title: "Kode", key: "code" },
                { title: "Role", key: "role", align: "center" },
                { title: "Bintang", key: "total_bintang", align: "center" },
            ],

            leaderboardPerBulanHeaders: [
                { title: "Rank", key: "ranking", align: "center", width: "80px" },
                { title: "Nama", key: "nama" },
                { title: "Kode", key: "code" },
                { title: "Role", key: "role", align: "center" },
                { title: "Bintang", key: "total_bintang", align: "center" },
            ],

            daerahDetailHeaders: [
                { title: "Rank", key: "ranking", align: "center", width: "80px" },
                { title: "Nama", key: "nama" },
                { title: "Kode", key: "code" },
                { title: "Role", key: "role", align: "center" },
                { title: "Bintang", key: "total_bintang", align: "center" },
            ],

            topStarHeaders: [
                { title: "Kode", key: "code" },
                { title: "Nama", key: "nama" },
                { title: "Provinsi", key: "province_code" },
                { title: "Total RO", key: "total_repeat_order", align: "end" },
                { title: "Total Transaksi", key: "total_transaksi_ro", align: "end" },
            ],

            akunPerMvoHeaders: [
                { title: "Nama", key: "nama" },
                { title: "Kode", key: "code" },
                { title: "Role", key: "role" },
                { title: "Total Akun", key: "total_akun", align: "end" },
            ],

            starSummary: {
                totalBintang: 0,
                totalAkun: 0,
                totalDaerah: 0
            },

            dashboardData: {
                top_star: [],
                dashboard_star: [],
                leaderboard_per_bulan: {},
                leaderboard_per_daerah: {},
                akun_per_mvo: []
            }
        };
    },

    computed: {
        roleFilterItems() {
            return [
                { title: 'ALL', key: 'ALL' },
                { title: 'MVO', key: 'MVO' },
                { title: 'REGIONAL', key: 'REGIONAL' },
                { title: 'Founder', key: 'FO' },
                { title: 'GM', key: 'GM' },
                { title: 'SUPPLIER', key: 'SUPPLIER' },
                { title: 'Distributor', key: 'DIST' },
                { title: 'Seller', key: 'SELL' }
            ];
        },

        filteredDashboardStar() {
            let data = this.dashboardData.dashboard_star || [];
            if (this.filterRoleStar !== 'ALL') {
                data = data.filter(item => item.role === this.filterRoleStar);
            }
            return data.map((item, index) => ({ ...item, ranking: index + 1 }));
        },

        filteredLeaderboardBulanData() {
            let data = this.currentLeaderboardBulanData || [];
            if (this.filterRoleBulan !== 'ALL') {
                data = data.filter(item => item.role === this.filterRoleBulan);
            }
            return data.map((item, index) => ({ ...item, ranking: index + 1 }));
        },

        availableLeaderboardMonths() {
            if (!this.dashboardData.leaderboard_per_bulan) return [];
            return Object.keys(this.dashboardData.leaderboard_per_bulan).sort();
        },

        filteredAvailableLeaderboardMonths() {
            const months = this.availableLeaderboardMonths;
            if (!this.filterStartMonth && !this.filterEndMonth) return months;

            return months.filter(month => {
                const isAfterStart = !this.filterStartMonth || month >= this.filterStartMonth;
                const isBeforeEnd = !this.filterEndMonth || month <= this.filterEndMonth;
                return isAfterStart && isBeforeEnd;
            });
        },

        currentLeaderboardBulanData() {
            if (!this.selectedLeaderboardMonth || !this.dashboardData.leaderboard_per_bulan) {
                return [];
            }
            return this.dashboardData.leaderboard_per_bulan[this.selectedLeaderboardMonth] || [];
        }
    },

    created() {
        this.initDateFilters();
        this.fetchDashboardData();
    },

    watch: {
        filteredAvailableLeaderboardMonths: {
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
        initDateFilters() {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth() + 1;

            // Set end date to current month
            this.filterEndMonth = `${year}-${month.toString().padStart(2, '0')}`;

            // Set start date to 3 months ago
            const startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 2); // Current + 2 previous = 3 months
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth() + 1;
            this.filterStartMonth = `${startYear}-${startMonth.toString().padStart(2, '0')}`;
        },

        openTopStarDialog() {
            this.topStarDialog = true;
        },

        openAkunPerMvoDialog() {
            this.akunPerMvoDialog = true;
        },

        getRoleColor(role) {
            switch (role) {
                case 'MVO': return 'error';
                case 'REGIONAL': return 'success';
                case 'FO': return 'purple';
                case 'GM': return 'orange';
                case 'SUPPLIER': return 'teal';
                case 'DIST': return 'cyan';
                case 'SELL': return 'grey';
                default: return 'grey';
            }
        },

        getRoleLabel(role) {
            switch (role) {
                case 'MVO': return 'MVO';
                case 'REGIONAL': return 'Regional';
                case 'FO': return 'Founder';
                case 'GM': return 'GM';
                case 'SUPPLIER': return 'Supplier';
                case 'DIST': return 'Distributor';
                case 'SELL': return 'Seller';
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

        showDaerahLeaderboardDetail(daerahKey, daerahData) {
            this.selectedDaerahKey = daerahKey;
            this.selectedDaerahData = daerahData;
            this.daerahDetailModal = true;
        },

        getDaerahRoleCount(role) {
            return this.selectedDaerahData.filter(item => item.role === role).length;
        },

        async fetchDashboardData() {
            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return;
            }

            this.isLoading = true;
            try {
                const dashboardResponse = await axios.get(
                    "https://babaapi.teknosof.com/api/dashboard/star",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (dashboardResponse.data && dashboardResponse.data.status === "success") {
                    this.dashboardData = dashboardResponse.data.data;
                    this.updateStarSummary();
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                this.isLoading = false;
            }
        },

        updateStarSummary() {
            const dashboardStar = this.dashboardData.dashboard_star || [];
            const leaderboardDaerah = this.dashboardData.leaderboard_per_daerah || {};

            this.starSummary = {
                totalBintang: dashboardStar.reduce((sum, item) => sum + parseInt(item.total_bintang || 0), 0),
                totalAkun: dashboardStar.length,
                totalDaerah: Object.keys(leaderboardDaerah).length
            };
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

        getRankColor(rank) {
            switch (rank) {
                case 1: return "amber";
                case 2: return "grey";
                case 3: return "orange";
                default: return "blue";
            }
        },

        async refreshData() {
            await this.fetchDashboardData();
        },

        exportToExcel(data, fileName, headers) {
            if (!data || data.length === 0) return;

            const exportData = data.map((item, index) => {
                const row = { No: index + 1 };
                headers.forEach(header => {
                    if (header.key !== 'action' && header.key !== 'ranking') {
                        row[header.title] = item[header.key] || '-';
                    }
                });
                return row;
            });

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data");
            XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
        }
    }
};
</script>

<style scoped>
.v-card {
    transition: all 0.3s ease;
}

.v-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.v-card[style*="cursor: pointer"]:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

@media (max-width: 959px) {
    .d-none.d-md-block {
        display: none !important;
    }

    .d-block.d-md-none {
        display: block !important;
    }
}

@media (min-width: 960px) {
    .d-none.d-md-block {
        display: block !important;
    }

    .d-block.d-md-none {
        display: none !important;
    }
}
</style>