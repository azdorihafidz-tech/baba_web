<template>
    <!-- Desktop Layout (md and up) -->
    <v-card class="d-none d-md-block">
        <!-- Section: Top Star (Cards) -->
        <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="#FFD700">mdi-trophy</v-icon>
            Top Rank
        </v-card-title>
        <v-card-text>
            <v-row>
                <!-- LOOP TOP STAR -->
                <v-col v-for="(item, index) in dashboardData.top_star" :key="index" cols="12" sm="6" md="4" lg="4">
                    <v-card class="h-100 top-star-card position-relative overflow-hidden" elevation="6">
                        <!-- Decorative Background -->
                        <div class="card-gradient-bg" :style="getCardGradient(index)"></div>
                        <div class="card-shine"></div>

                        <v-card-text class="position-relative pa-6" style="z-index: 2;">
                            <!-- Rank Badge -->
                            <div class="rank-ribbon">
                                <v-icon v-if="index < 3" color="white" size="16" class="mr-1">
                                    mdi-crown
                                </v-icon>
                                <span class="font-weight-bold">
                                    #{{ index + 1 }}
                                </span>
                            </div>

                            <!-- Profile Section -->
                            <div class="text-center mb-4 mt-2">
                                <v-avatar size="72" class="mb-3 border-2 border-white elevation-3" color="white">
                                    <span class="text-h4 font-weight-bold text-grey-darken-3">
                                        {{
                                            item.nama
                                                ? item.nama.charAt(0).toUpperCase()
                                                : "?"
                                        }}
                                    </span>
                                </v-avatar>

                                <div class="text-h6 font-weight-bold text-white text-truncate mb-1">
                                    {{ item.nama }}
                                </div>

                                <v-chip size="small" color="white" variant="outlined" class="text-white">
                                    {{ item.code }}
                                </v-chip>
                            </div>

                            <!-- Info Section -->
                            <div class="info-container rounded-lg pa-3 mt-4">
                                <div class="d-flex align-center justify-center mb-3 text-white">
                                    <v-icon size="16" class="mr-1" color="white">
                                        mdi-map-marker
                                    </v-icon>
                                    <span class="text-caption font-weight-medium">
                                        {{ item.province_code }}
                                    </span>
                                </div>

                                <v-divider class="mb-3 border-opacity-25" color="white"></v-divider>

                                <div class="d-flex justify-space-between align-center px-2">
                                    <!-- RO -->
                                    <div class="text-center">
                                        <div class="text-caption text-white opacity-80 mb-1">
                                            Total RO
                                        </div>
                                        <div class="text-h6 font-weight-bold text-white lh-1">
                                            {{ item.total_repeat_order }}
                                        </div>
                                    </div>

                                    <div class="vertical-divider"></div>

                                    <!-- Transaksi -->
                                    <div class="text-center">
                                        <div class="text-caption text-white opacity-80 mb-1">
                                            Transaksi
                                        </div>
                                        <div class="text-h6 font-weight-bold text-white lh-1">
                                            {{ item.total_transaksi_ro }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- EMPTY STATE -->
                <v-col v-if="!dashboardData.top_star?.length" cols="12">
                    <div class="text-center pa-4 text-grey">
                        Belum ada data Top Star
                    </div>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="success">mdi-account-multiple</v-icon>
                TOP Rank MVO
            </v-card-title>

            <!-- <v-card-text class="pb-0">
                <v-text-field v-model="searchAkunMvo" prepend-inner-icon="mdi-magnify" label="Search MVO"
                    variant="outlined" density="compact" hide-details class="mb-3"></v-text-field>
            </v-card-text> -->

            <v-card-text>
                <v-row>
                    <v-col v-for="mvo in filteredRankedMvoList" :key="mvo.id" cols="12" sm="6" md="4" lg="3">
                        <v-card class="h-100 top-star-card position-relative overflow-hidden" elevation="6"
                            @click="openMvoDetail(mvo)" style="cursor: pointer;">
                            <!-- Decorative Background -->
                            <div class="card-gradient-bg" :style="getMvoCardGradient(mvo.ranking - 1)"></div>
                            <div class="card-shine"></div>

                            <v-card-text class="position-relative pa-5" style="z-index: 2;">
                                <!-- Rank Badge -->
                                <div class="rank-ribbon">
                                    <v-icon v-if="mvo.ranking <= 3" color="amber" size="16" class="mr-1">
                                        {{ mvo.ranking === 1 ? 'mdi-trophy' : 'mdi-medal' }}
                                    </v-icon>
                                    <span class="font-weight-bold">
                                        #{{ mvo.ranking }}
                                    </span>
                                </div>

                                <!-- Profile Section -->
                                <div class="text-center mb-4 mt-2">
                                    <v-avatar size="80" class="mb-3 border-2 border-white elevation-3" color="white">
                                        <v-img :src="getMvoImageUrl(mvo)" cover>
                                            <template v-slot:placeholder>
                                                <v-row class="fill-height ma-0" align="center" justify="center">
                                                    <v-progress-circular indeterminate
                                                        color="grey-lighten-2"></v-progress-circular>
                                                </v-row>
                                            </template>
                                        </v-img>
                                    </v-avatar>

                                    <div class="text-h6 font-weight-bold text-white text-truncate mb-1">
                                        {{ mvo.nama }}
                                    </div>

                                    <v-chip size="x-small" color="white" variant="outlined" class="text-white">
                                        {{ mvo.province_code }}
                                    </v-chip>
                                </div>

                                <!-- Info Section -->
                                <div class="info-container rounded-lg pa-3 mt-4">
                                    <div class="d-flex justify-space-between align-center px-2">
                                        <!-- RO -->
                                        <div class="text-center">
                                            <div class="text-caption text-white opacity-80 mb-1">
                                                Repeat Order
                                            </div>
                                            <div class="text-h6 font-weight-bold text-white lh-1">
                                                {{ mvo.totalRepeatOrder }}
                                            </div>
                                        </div>

                                        <div class="vertical-divider"></div>

                                        <!-- Downline -->
                                        <div class="text-center">
                                            <div class="text-caption text-white opacity-80 mb-1">
                                                Downline
                                            </div>
                                            <div class="text-h6 font-weight-bold text-white lh-1">
                                                {{ mvo.totalDownlines }}
                                            </div>
                                        </div>
                                    </div>
                                    <v-divider class="my-2 border-opacity-25" color="white"></v-divider>
                                    <div class="text-center">
                                        <span class="text-caption text-white opacity-80">Tap untuk detail</span>
                                    </div>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-card-text>
            <!-- Summary Cards -->

            <!-- Section 1: Dashboard Star (All) -->
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
                    <div style="width: 300px;">
                        <v-text-field v-model="searchStar" prepend-inner-icon="mdi-magnify" label="Search"
                            variant="outlined" density="compact" hide-details></v-text-field>
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
                    :search="searchStar" :items="filteredDashboardStar" :loading="isLoading" item-key="id"
                    :items-per-page="10">
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

            <!-- Section 2: Leaderboard Per Bulan -->
            <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-calendar-month</v-icon>
                Akumulasi Star
            </v-card-title>

            <!-- FILTER AREA -->
            <v-card-text class="pb-0">

                <!-- DATE RANGE FILTER -->
                <!-- <v-row dense class="mb-4">
                    <v-col cols="12" md="4">
                        <v-text-field v-model="dateRange.start_date" label="Tanggal Mulai" type="date"
                            prepend-inner-icon="mdi-calendar" variant="outlined" density="compact" hide-details />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="dateRange.end_date" label="Tanggal Selesai" type="date"
                            prepend-inner-icon="mdi-calendar" variant="outlined" density="compact" hide-details />
                    </v-col>
                    <v-col cols="12" md="4" class="d-flex align-center gap-2">
                        <v-btn color="primary" @click="applyDateFilter" :loading="isLoading" density="compact"
                            style="height: 40px; min-width: 110px;">
                            <v-icon start>mdi-magnify</v-icon>
                            Filter
                        </v-btn>
                        <v-btn color="grey" variant="outlined" @click="resetDateFilter" :disabled="isLoading"
                            density="compact" style="height: 40px; min-width: 40px;">
                            <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                    </v-col>
                </v-row> -->

                <!-- Filter Role -->
                <div class="d-flex align-center justify-space-between mb-3">
                    <div style="width: 300px;">
                        <v-select v-model="filterRoleBulan" :items="roleFilterItems" label="Filter Role"
                            variant="outlined" density="compact" hide-details></v-select>
                    </div>
                    <div style="width: 300px;">
                        <v-text-field v-model="searchBulan" prepend-inner-icon="mdi-magnify" label="Search"
                            variant="outlined" density="compact" hide-details></v-text-field>
                    </div>
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
                <!-- <v-chip-group v-model="selectedLeaderboardMonth" mandatory color="primary" class="mb-3">
                    <v-chip v-for="bulan in availableLeaderboardMonths" :key="bulan" :value="bulan" size="small"
                        variant="elevated">
                        {{ formatMonth(bulan) }}
                    </v-chip>
                </v-chip-group> -->

                <!-- DATA TABLE -->
                <v-data-table class="bg-grey-lighten-4 text-no-wrap" :headers="leaderboardPerBulanHeaders"
                    :search="searchBulan" :items="filteredLeaderboardBulanData" :loading="isLoading" item-key="id"
                    :items-per-page="10">

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


            <!-- Section 3: Leaderboard Per Daerah (Cards) -->
            <!-- <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-map-marker-multiple</v-icon>
                Leaderboard Daerah
            </v-card-title>

            <v-card-text>
                <v-row>
                    <v-col v-for="(daerahData, daerahKey) in dashboardData.leaderboard_per_daerah || {}"
                        :key="daerahKey" cols="12" md="4">
                        <v-card :color="getDaerahCardColor(daerahKey)" dark
                            @click="showDaerahLeaderboardDetail(daerahKey, daerahData)" style="cursor: pointer;"
                            class="h-100">
                            <v-card-text class="text-center">
                                <v-icon size="40" class="mb-2">mdi-map-marker</v-icon>
                                <div class="text-h4 font-weight-bold">{{ daerahData[0].nama }}
                                    <v-divider class="my-3" color="white"></v-divider>

                                    <div v-if="daerahData.length > 0" class="mb-2">
                                        <v-chip color="amber" dark size="small" class="mb-2">
                                            <v-icon left size="14">mdi-trophy</v-icon>
                                            1
                                        </v-chip>
                                        <div class="text-body-1 font-weight-medium">{{ daerahKey }}</div>
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

                                <div class="text-caption mt-3 opacity-70">
                                    <v-icon size="14" class="mr-1">mdi-chevron-down</v-icon>
                                    Tap untuk detail
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text> -->


        </v-card-text>
    </v-card>

    <!-- Mobile Layout (sm and below) -->
    <div class="d-block d-md-none pa-2">

        <!-- Section: Top Star -->
        <div class="mb-4">
            <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="#FFD700">mdi-trophy</v-icon>
                <h2 class="text-h6 font-weight-bold">Top Rank</h2>
            </div>
            <v-row dense>
                <v-col v-for="(item, index) in dashboardData.top_star" :key="index" cols="12" sm="6">
                    <v-card class="top-star-card position-relative overflow-hidden" elevation="4">
                        <div class="card-gradient-bg" :style="getCardGradient(index)"></div>
                        <div class="card-shine"></div>
                        <v-card-text class="position-relative pa-4" style="z-index: 2;">
                            <div class="rank-ribbon">
                                <v-icon v-if="index < 3" color="white" size="14" class="mr-1">mdi-crown</v-icon>
                                <span class="font-weight-bold text-caption">#{{ index + 1 }}</span>
                            </div>
                            <div class="text-center mb-3 mt-1">
                                <v-avatar size="60" class="mb-2 border-2 border-white elevation-2" color="white">
                                    <span class="text-h5 font-weight-bold text-grey-darken-3">
                                        {{ item.nama ? item.nama.charAt(0).toUpperCase() : "?" }}
                                    </span>
                                </v-avatar>
                                <div class="text-body-1 font-weight-bold text-white text-truncate">
                                    {{ item.nama }}
                                </div>
                                <v-chip size="x-small" color="white" variant="outlined" class="text-white mt-1">
                                    {{ item.code }}
                                </v-chip>
                            </div>
                            <div class="info-container rounded-lg pa-2">
                                <div class="d-flex align-center justify-center mb-2 text-white">
                                    <v-icon size="14" class="mr-1" color="white">mdi-map-marker</v-icon>
                                    <span class="text-caption font-weight-medium">{{ item.province_code }}</span>
                                </div>
                                <v-divider class="mb-2 border-opacity-25" color="white"></v-divider>
                                <div class="d-flex justify-space-around align-center">
                                    <div class="text-center">
                                        <div class="text-caption text-white opacity-80">Total RO</div>
                                        <div class="text-h6 font-weight-bold text-white lh-1">{{
                                            item.total_repeat_order }}</div>
                                    </div>
                                    <div class="vertical-divider" style="height: 25px;"></div>
                                    <div class="text-center">
                                        <div class="text-caption text-white opacity-80">Transaksi</div>
                                        <div class="text-h6 font-weight-bold text-white lh-1">{{
                                            item.total_transaksi_ro }}</div>
                                    </div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col v-if="!dashboardData.top_star?.length" cols="12">
                    <div class="text-center pa-4 text-grey">Belum ada data Top Star</div>
                </v-col>
            </v-row>
        </div>

        <!-- Section: TOP Rank MVO -->
        <div class="mb-4">
            <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="success">mdi-account-multiple</v-icon>
                <h2 class="text-h6 font-weight-bold">TOP Rank MVO</h2>
            </div>
            <v-text-field v-model="searchAkunMvo" prepend-inner-icon="mdi-magnify" label="Search MVO" variant="outlined"
                density="compact" hide-details class="mb-3"></v-text-field>
            <v-row dense>
                <v-col v-for="mvo in filteredRankedMvoList" :key="mvo.id" cols="12" sm="6">
                    <v-card class="top-star-card position-relative overflow-hidden" elevation="4"
                        @click="openMvoDetail(mvo)" style="cursor: pointer;">
                        <div class="card-gradient-bg" :style="getMvoCardGradient(mvo.ranking - 1)"></div>
                        <div class="card-shine"></div>
                        <v-card-text class="position-relative pa-4" style="z-index: 2;">
                            <div class="rank-ribbon">
                                <v-icon v-if="mvo.ranking <= 3" color="amber" size="14" class="mr-1">{{
                                    mvo.ranking === 1 ? 'mdi-trophy' : 'mdi-medal' }}</v-icon>
                                <span class="font-weight-bold text-caption">#{{ mvo.ranking }}</span>
                            </div>
                            <div class="text-center mb-3 mt-1">
                                <v-avatar size="60" class="mb-2 border-2 border-white elevation-2">
                                    <v-img :src="getMvoImageUrl(mvo)" cover>
                                        <template v-slot:placeholder>
                                            <v-progress-circular indeterminate
                                                color="grey-lighten-2"></v-progress-circular>
                                        </template>
                                    </v-img>
                                </v-avatar>
                                <div class="text-body-1 font-weight-bold text-white text-truncate">{{ mvo.nama }}
                                </div>
                                <v-chip size="x-small" color="white" variant="outlined" class="text-white mt-1">{{
                                    mvo.province_code }}</v-chip>
                            </div>
                            <div class="info-container rounded-lg pa-2">
                                <div class="d-flex justify-space-around align-center">
                                    <div class="text-center">
                                        <div class="text-caption text-white opacity-80">Repeat Order</div>
                                        <div class="text-h6 font-weight-bold text-white lh-1">{{
                                            mvo.totalRepeatOrder }}</div>
                                    </div>
                                    <div class="vertical-divider" style="height: 25px;"></div>
                                    <div class="text-center">
                                        <div class="text-caption text-white opacity-80">Downline</div>
                                        <div class="text-h6 font-weight-bold text-white lh-1">{{ mvo.totalDownlines
                                        }}</div>
                                    </div>
                                </div>
                                <v-divider class="my-1 border-opacity-25" color="white"></v-divider>
                                <div class="text-center text-caption text-white opacity-70">Tap untuk detail</div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </div>

        <!-- Section: Ranking Semua Akun -->
        <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="amber">mdi-star</v-icon>
                Ranking Semua Akun
            </v-card-title>
            <v-card-text>
                <v-row dense>
                    <v-col cols="12">
                        <v-select v-model="filterRoleStar" :items="roleFilterItems" label="Filter Role"
                            variant="outlined" density="compact" hide-details></v-select>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="searchStar" prepend-inner-icon="mdi-magnify" label="Search"
                            variant="outlined" density="compact" hide-details></v-text-field>
                    </v-col>
                    <v-col cols="12" class="text-center">
                        <v-btn color="success" prepend-icon="mdi-microsoft-excel"
                            @click="exportToExcel(filteredDashboardStar, 'Ranking_Semua_Akun', dashboardStarHeaders)"
                            size="small">
                            Export
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-list lines="two" class="py-0">
                <template v-for="(item, index) in filteredMobileDashboardStar.slice(0, 10)" :key="item.id">
                    <v-list-item>
                        <template v-slot:prepend>
                            <v-chip :color="getRankColor(item.ranking)" dark size="small" class="mr-3 font-weight-bold"
                                label style="width: 40px; justify-content: center;">
                                #{{ item.ranking }}
                            </v-chip>
                        </template>
                        <v-list-item-title class="font-weight-bold">{{ item.nama }}</v-list-item-title>
                        <v-list-item-subtitle class="d-flex align-center">
                            <span class="text-caption mr-2">{{ item.code }}</span>
                            <v-chip :color="getRoleColor(item.role)" dark size="x-small">{{ getRoleLabel(item.role)
                            }}</v-chip>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <v-chip color="amber" dark size="small">
                                <v-icon left size="14">mdi-star</v-icon>
                                {{ item.total_bintang }}
                            </v-chip>
                        </template>
                    </v-list-item>
                    <v-divider v-if="index < filteredMobileDashboardStar.slice(0, 10).length - 1"></v-divider>
                </template>
                <div v-if="filteredMobileDashboardStar.length === 0" class="text-center pa-4 text-grey">
                    Tidak ada data
                </div>
            </v-list>
        </v-card>

        <!-- Section: Leaderboard Per Bulan -->
        <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-calendar-month</v-icon>
                Akumulasi Star
            </v-card-title>
            <v-card-text>
                <!-- DATE RANGE FILTER MOBILE -->
                <!-- <v-row dense class="mb-3">
                    <v-col cols="12">
                        <v-text-field v-model="dateRange.start_date" label="Tanggal Mulai" type="date"
                            prepend-inner-icon="mdi-calendar" variant="outlined" density="compact" hide-details />
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="dateRange.end_date" label="Tanggal Selesai" type="date"
                            prepend-inner-icon="mdi-calendar" variant="outlined" density="compact" hide-details />
                    </v-col>
                    <v-col cols="12" class="d-flex align-center justify-center gap-2">
                        <v-btn color="primary" @click="applyDateFilter" :loading="isLoading" density="compact"
                            style="height: 40px;" block>
                            <v-icon start>mdi-magnify</v-icon>
                            Filter
                        </v-btn>
                        <v-btn color="grey" variant="outlined" @click="resetDateFilter" :disabled="isLoading"
                            density="compact" style="height: 40px; min-width: 40px;">
                            <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                    </v-col>
                </v-row> -->
                <v-row dense>
                    <v-col cols="12">
                        <v-select v-model="filterRoleBulan" :items="roleFilterItems" label="Filter Role"
                            variant="outlined" density="compact" hide-details></v-select>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="searchBulan" prepend-inner-icon="mdi-magnify" label="Search"
                            variant="outlined" density="compact" hide-details></v-text-field>
                    </v-col>
                    <v-col cols="12" class="text-center">
                        <v-btn color="success" prepend-icon="mdi-microsoft-excel"
                            @click="exportToExcel(filteredLeaderboardBulanData, `Leaderboard_Bulan_${selectedLeaderboardMonth}`, leaderboardPerBulanHeaders)"
                            size="small">
                            Export
                        </v-btn>
                    </v-col>
                </v-row>
                <v-chip-group v-model="selectedLeaderboardMonth" mandatory color="primary" class="mt-3" show-arrows>
                    <v-chip v-for="bulan in availableLeaderboardMonths" :key="bulan" :value="bulan" size="small"
                        variant="elevated">
                        {{ formatMonth(bulan) }}
                    </v-chip>
                </v-chip-group>
            </v-card-text>
            <v-list lines="two" class="py-0">
                <template v-for="(item, index) in filteredMobileLeaderboardBulan.slice(0, 10)" :key="item.id">
                    <v-list-item>
                        <template v-slot:prepend>
                            <v-chip :color="getRankColor(item.ranking)" dark size="small" class="mr-3 font-weight-bold"
                                label style="width: 40px; justify-content: center;">
                                #{{ item.ranking }}
                            </v-chip>
                        </template>
                        <v-list-item-title class="font-weight-bold">{{ item.nama }}</v-list-item-title>
                        <v-list-item-subtitle class="d-flex align-center">
                            <span class="text-caption mr-2">{{ item.code }}</span>
                            <v-chip :color="getRoleColor(item.role)" dark size="x-small">{{ getRoleLabel(item.role)
                            }}</v-chip>
                        </v-list-item-subtitle>
                        <template v-slot:append>
                            <v-chip color="amber" dark size="small">
                                <v-icon left size="14">mdi-star</v-icon>
                                {{ item.total_bintang }}
                            </v-chip>
                        </template>
                    </v-list-item>
                    <v-divider v-if="index < filteredMobileLeaderboardBulan.slice(0, 10).length - 1"></v-divider>
                </template>
                <div v-if="filteredMobileLeaderboardBulan.length === 0" class="text-center pa-4 text-grey">
                    Tidak ada data untuk bulan ini
                </div>
            </v-list>
        </v-card>

        <!-- Section: Leaderboard Daerah -->
        <!-- <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-map-marker-multiple</v-icon>
                Leaderboard Daerah
            </v-card-title>
            <v-card-text>
                <v-row dense>
                    <v-col v-for="(daerahData, daerahKey) in dashboardData.leaderboard_per_daerah || {}"
                        :key="daerahKey" cols="12">
                        <v-card :color="getDaerahCardColor(daerahKey)" dark
                            @click="showDaerahLeaderboardDetail(daerahKey, daerahData)" style="cursor: pointer;">
                            <v-card-text class="pa-3">
                                <div class="d-flex justify-space-between align-center">
                                    <div>
                                        <div class="text-h6 font-weight-bold">{{ daerahKey }}</div>
                                        <div class="text-caption">{{ daerahData.length }} Akun</div>
                                    </div>
                                    <v-icon size="32" class="opacity-50">mdi-map-marker</v-icon>
                                </div>

                                <v-divider class="my-2" color="white"></v-divider>

                                <div v-if="daerahData.length > 0" class="d-flex align-center mt-2">
                                    <div class="mr-3 text-center" style="min-width: 40px;">
                                        <v-icon color="amber">mdi-trophy</v-icon>
                                        <div class="text-caption font-weight-bold">#1</div>
                                    </div>
                                    <div class="text-truncate flex-grow-1">
                                        <div class="text-body-2 font-weight-bold text-truncate">{{ daerahData[0].nama }}
                                        </div>
                                        <div class="d-flex align-center">
                                            <v-icon size="12" color="amber" class="mr-1">mdi-star</v-icon>
                                            <span class="text-caption">{{ daerahData[0].total_bintang }} Bintang</span>
                                        </div>
                                    </div>
                                    <v-icon size="20">mdi-chevron-right</v-icon>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col v-if="!Object.keys(dashboardData.leaderboard_per_daerah || {}).length" cols="12">
                        <div class="text-center pa-4 text-grey">Belum ada data Leaderboard Daerah</div>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card> -->
    </div>

    <!-- Daerah Leaderboard Detail Modal -->
    <!-- <v-dialog v-model="daerahDetailModal" max-width="90vw" fullscreen-on-mobile>
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

            <v-card-text class="pa-4 pb-0">
                <v-text-field v-model="searchDaerah" prepend-inner-icon="mdi-magnify" label="Search" variant="outlined"
                    density="compact" hide-details></v-text-field>
            </v-card-text>
            <v-card-text class="pa-4 pb-0 text-center">
                <v-btn color="success" prepend-icon="mdi-microsoft-excel"
                    @click="exportToExcel(selectedDaerahData, `Leaderboard_Daerah_${selectedDaerahKey}`, daerahDetailHeaders)">
                    Export Excel
                </v-btn>
            </v-card-text>

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
                <div class="d-block d-md-none">
                    <v-list>
                        <v-list-item v-for="item in filteredMobileDaerahData" :key="item.id" class="py-3">
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

                <div class="d-none d-md-block">
                    <v-data-table class="bg-grey-lighten-4 text-no-wrap" :headers="daerahDetailHeaders"
                        :search="searchDaerah" :items="selectedDaerahData" :loading="isLoading" item-key="id"
                        :items-per-page="10">
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
    </v-dialog>  -->

    <!-- MVO Detail Dialog -->
    <v-dialog v-model="mvoDetailDialog" max-width="1000px" scrollable>
        <v-card v-if="selectedMvoData">
            <v-card-title class="d-flex justify-space-between align-center pa-4">
                <div>
                    <div class="text-h6 font-weight-bold">
                        <v-icon class="mr-2" color="primary">mdi-account-details</v-icon>
                        Detail MVO - {{ selectedMvoData.nama }}
                    </div>
                    <div class="text-caption text-grey">{{ selectedMvoData.code }}</div>
                </div>
                <v-btn icon @click="mvoDetailDialog = false" variant="text">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            <v-divider></v-divider>

            <!-- MVO Info Summary -->
            <v-card-text class="pa-4">
                <v-row>
                    <v-col cols="12" md="4" class="text-center">
                        <v-img :src="getMvoImageUrl(selectedMvoData)" max-height="250" contain
                            class="rounded-lg mx-auto">
                        </v-img>
                        <v-chip :color="getRankColor(selectedMvoData.ranking)" class="mt-3" size="large">
                            <v-icon left>
                                {{ selectedMvoData.ranking === 1 ? 'mdi-trophy' : 'mdi-medal' }}
                            </v-icon>
                            Ranking #{{ selectedMvoData.ranking }}
                        </v-chip>
                    </v-col>
                    <v-col cols="12" md="8">
                        <v-row dense>
                            <v-col cols="6" sm="4">
                                <v-card flat color="grey-lighten-4" class="pa-3 text-center">
                                    <v-icon color="primary" size="24">mdi-star-circle</v-icon>
                                    <div class="text-h6 font-weight-bold mt-1">{{ selectedMvoData.totalRepeatOrder }}
                                    </div>
                                    <div class="text-caption">Total Repeat Order</div>
                                </v-card>
                            </v-col>
                            <v-col cols="6" sm="4">
                                <v-card flat color="grey-lighten-4" class="pa-3 text-center">
                                    <v-icon color="success" size="24">mdi-account-group</v-icon>
                                    <div class="text-h6 font-weight-bold mt-1">{{ selectedMvoData.totalDownlines }}
                                    </div>
                                    <div class="text-caption">Total Downline</div>
                                </v-card>
                            </v-col>
                            <v-col cols="6" sm="4">
                                <v-card flat color="grey-lighten-4" class="pa-3 text-center">
                                    <v-icon color="info" size="24">mdi-file-document</v-icon>
                                    <div class="text-h6 font-weight-bold mt-1">{{ selectedMvoData.documents?.length || 0
                                    }}
                                    </div>
                                    <div class="text-caption">Total Dokumen</div>
                                </v-card>
                            </v-col>
                            <v-col cols="12">
                                <v-card flat color="grey-lighten-4" class="pa-3">
                                    <div class="text-subtitle-2 font-weight-bold mb-2">
                                        <v-icon class="mr-1">mdi-information</v-icon>
                                        Informasi MVO
                                    </div>
                                    <v-row dense>
                                        <v-col cols="6">
                                            <div class="text-caption text-grey">Nama Panggilan</div>
                                            <div class="text-body-2 font-weight-medium">{{
                                                selectedMvoData.nama_panggilan }}
                                            </div>
                                        </v-col>
                                        <v-col cols="6">
                                            <div class="text-caption text-grey">No HP</div>
                                            <div class="text-body-2 font-weight-medium">{{ selectedMvoData.nohp }}</div>
                                        </v-col>
                                        <v-col cols="6">
                                            <div class="text-caption text-grey">Provinsi</div>
                                            <div class="text-body-2 font-weight-medium">{{
                                                selectedMvoData.provinsi?.name ||
                                                '-' }}</div>
                                        </v-col>
                                        <v-col cols="6">
                                            <div class="text-caption text-grey">Jaringan</div>
                                            <div class="text-body-2 font-weight-medium">{{ selectedMvoData.jaringan_mvo
                                            }}
                                            </div>
                                        </v-col>
                                        <v-col cols="6">
                                            <div class="text-caption text-grey">Tempat Lahir</div>
                                            <div class="text-body-2 font-weight-medium">{{ selectedMvoData.tempat_lahir
                                                ||
                                                '-' }}</div>
                                        </v-col>
                                        <v-col cols="6">
                                            <div class="text-caption text-grey">Alamat</div>
                                            <div class="text-body-2 font-weight-medium">{{ selectedMvoData.alamat || '-'
                                            }}
                                            </div>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-col>
                            <v-col cols="12">
                                <v-card flat color="blue-grey-lighten-5" class="pa-3">
                                    <div class="text-subtitle-2 font-weight-bold mb-2">
                                        <v-icon class="mr-1" color="primary">mdi-account-network</v-icon>
                                        Struktur Upline
                                    </div>
                                    <v-row dense>
                                        <v-col cols="12" sm="6">
                                            <div class="text-caption text-grey">Upline 1</div>
                                            <div class="text-body-2 font-weight-medium">{{ selectedMvoData.upline_1 ||
                                                '-'
                                            }}</div>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <div class="text-caption text-grey">Upline 2</div>
                                            <div class="text-body-2 font-weight-medium">{{ selectedMvoData.upline_2 ||
                                                '-'
                                            }}</div>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <div class="text-caption text-grey">Upline 3</div>
                                            <div class="text-body-2 font-weight-medium">{{ selectedMvoData.upline_3 ||
                                                '-'
                                            }}</div>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <div class="text-caption text-grey">Upline 4</div>
                                            <div class="text-body-2 font-weight-medium">{{ selectedMvoData.upline_4 ||
                                                '-'
                                            }}</div>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <div class="text-caption text-grey">Upline 5</div>
                                            <div class="text-body-2 font-weight-medium">{{ selectedMvoData.upline_5 ||
                                                '-'
                                            }}</div>
                                        </v-col>
                                        <v-col cols="12" sm="6">
                                            <div class="text-caption text-grey">Upline 6</div>
                                            <div class="text-body-2 font-weight-medium">{{ selectedMvoData.upline_6 ||
                                                '-'
                                            }}</div>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-divider></v-divider>

            <!-- Downlines Section -->
            <v-card-text class="pa-4">
                <div class="text-subtitle-1 font-weight-bold mb-3">
                    <v-icon class="mr-2" color="success">mdi-account-group</v-icon>
                    Daftar Downline ({{ selectedMvoData.downlines?.length || 0 }})
                </div>

                <v-text-field v-model="searchMvoDetail" prepend-inner-icon="mdi-magnify" label="Search Downline"
                    variant="outlined" density="compact" hide-details class="mb-3">
                </v-text-field>

                <!-- Desktop Table -->
                <div class="d-none d-md-block">
                    <v-data-table :headers="[
                        { title: 'Kode', key: 'code', width: '120px' },
                        { title: 'Nama', key: 'nama', width: '150px' },
                        { title: 'Role', key: 'role', align: 'center', width: '100px' },
                        { title: 'No HP', key: 'nohp', width: '120px' },
                        { title: 'Tempat Lahir', key: 'tempat_lahir', width: '120px' },
                        { title: 'Alamat', key: 'alamat', width: '150px' },
                        { title: 'Upline 1', key: 'upline_1', width: '200px' },
                        { title: 'Upline 2', key: 'upline_2', width: '200px' },
                        { title: 'Upline 3', key: 'upline_3', width: '200px' },
                        { title: 'Upline 4', key: 'upline_4', width: '200px' },
                        { title: 'Upline 5', key: 'upline_5', width: '200px' },
                        { title: 'Upline 6', key: 'upline_6', width: '200px' }
                    ]" :items="selectedMvoData.downlines || []" :search="searchMvoDetail" :items-per-page="10"
                        class="bg-grey-lighten-4 text-no-wrap">
                        <template v-slot:item.role="{ item }">
                            <v-chip :color="getRoleColorFromCode(item.code)" size="small" dark>
                                {{ getRoleLabelFromCode(item.code) }}
                            </v-chip>
                        </template>
                        <template v-slot:item.upline_1="{ item }">
                            <span class="text-caption">{{ item.upline_1 || '-' }}</span>
                        </template>
                        <template v-slot:item.upline_2="{ item }">
                            <span class="text-caption">{{ item.upline_2 || '-' }}</span>
                        </template>
                        <template v-slot:item.upline_3="{ item }">
                            <span class="text-caption">{{ item.upline_3 || '-' }}</span>
                        </template>
                        <template v-slot:item.upline_4="{ item }">
                            <span class="text-caption">{{ item.upline_4 || '-' }}</span>
                        </template>
                        <template v-slot:item.upline_5="{ item }">
                            <span class="text-caption">{{ item.upline_5 || '-' }}</span>
                        </template>
                        <template v-slot:item.upline_6="{ item }">
                            <span class="text-caption">{{ item.upline_6 || '-' }}</span>
                        </template>
                        <template v-slot:item.tempat_lahir="{ item }">
                            <span class="text-caption">{{ item.tempat_lahir || '-' }}</span>
                        </template>
                        <template v-slot:item.alamat="{ item }">
                            <span class="text-caption">{{ item.alamat || '-' }}</span>
                        </template>
                    </v-data-table>
                </div>

                <!-- Mobile List -->
                <div class="d-block d-md-none">
                    <v-list v-if="selectedMvoData.downlines && selectedMvoData.downlines.length > 0">
                        <v-list-item v-for="downline in filteredDownlines" :key="downline.id" class="mb-3 pa-0" border>
                            <v-card flat width="100%">
                                <v-card-text class="pa-3">
                                    <div class="d-flex justify-space-between align-center mb-2">
                                        <div>
                                            <div class="text-body-1 font-weight-bold">{{ downline.nama }}</div>
                                            <div class="text-caption text-grey">{{ downline.code }}</div>
                                        </div>
                                        <v-chip :color="getRoleColorFromCode(downline.code)" size="small" dark>
                                            {{ getRoleLabelFromCode(downline.code) }}
                                        </v-chip>
                                    </div>

                                    <v-divider class="my-2"></v-divider>

                                    <v-row dense>
                                        <v-col cols="6">
                                            <div class="text-caption text-grey">No HP</div>
                                            <div class="text-body-2">{{ downline.nohp || '-' }}</div>
                                        </v-col>
                                        <v-col cols="6">
                                            <div class="text-caption text-grey">Tempat Lahir</div>
                                            <div class="text-body-2">{{ downline.tempat_lahir || '-' }}</div>
                                        </v-col>
                                        <v-col cols="12">
                                            <div class="text-caption text-grey">Alamat</div>
                                            <div class="text-body-2">{{ downline.alamat || '-' }}</div>
                                        </v-col>
                                    </v-row>

                                    <v-divider class="my-2"></v-divider>

                                    <div class="text-caption font-weight-bold mb-1">
                                        <v-icon size="14" class="mr-1">mdi-account-network</v-icon>
                                        Struktur Upline
                                    </div>
                                    <v-row dense>
                                        <v-col cols="12">
                                            <div class="text-caption text-grey">Upline 1</div>
                                            <div class="text-body-2">{{ downline.upline_1 || '-' }}</div>
                                        </v-col>
                                        <v-col cols="12">
                                            <div class="text-caption text-grey">Upline 2</div>
                                            <div class="text-body-2">{{ downline.upline_2 || '-' }}</div>
                                        </v-col>
                                        <v-col cols="12">
                                            <div class="text-caption text-grey">Upline 3</div>
                                            <div class="text-body-2">{{ downline.upline_3 || '-' }}</div>
                                        </v-col>
                                        <v-col cols="12">
                                            <div class="text-caption text-grey">Upline 4</div>
                                            <div class="text-body-2">{{ downline.upline_4 || '-' }}</div>
                                        </v-col>
                                        <v-col cols="12">
                                            <div class="text-caption text-grey">Upline 5</div>
                                            <div class="text-body-2">{{ downline.upline_5 || '-' }}</div>
                                        </v-col>
                                        <v-col cols="12">
                                            <div class="text-caption text-grey">Upline 6</div>
                                            <div class="text-body-2">{{ downline.upline_6 || '-' }}</div>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                        </v-list-item>
                    </v-list>
                    <v-alert v-else type="info" variant="tonal" class="mt-3">
                        Tidak ada downline
                    </v-alert>
                </div>
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
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);

        return {
            tab: "dashboard-star",
            isLoading: false,

            dateRange: {
                start_date: threeMonthsAgo.toISOString().slice(0, 10),
                end_date: today.toISOString().slice(0, 10),
            },

            // Leaderboard per bulan
            selectedLeaderboardMonth: null,

            // Daerah detail modal
            daerahDetailModal: false,

            selectedDaerahKey: '',
            selectedDaerahData: [],
            filterRoleStar: 'ALL',
            filterRoleBulan: 'ALL',
            searchStar: '',
            searchBulan: '',
            searchDaerah: '',
            searchAkunMvo: '',

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
            },

            selectedMvoData: null,
            mvoDetailDialog: false,
            searchMvoDetail: ''
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

        currentLeaderboardBulanData() {
            if (!this.selectedLeaderboardMonth || !this.dashboardData.leaderboard_per_bulan) {
                return [];
            }
            return this.dashboardData.leaderboard_per_bulan[this.selectedLeaderboardMonth] || [];
        },

        filteredMobileDashboardStar() {
            if (!this.searchStar) return this.filteredDashboardStar;
            const search = this.searchStar.toLowerCase();
            return this.filteredDashboardStar.filter(item =>
                (item.nama && item.nama.toLowerCase().includes(search)) ||
                (item.code && item.code.toLowerCase().includes(search))
            );
        },
        filteredMobileLeaderboardBulan() {
            if (!this.searchBulan) return this.filteredLeaderboardBulanData;
            const search = this.searchBulan.toLowerCase();
            return this.filteredLeaderboardBulanData.filter(item =>
                (item.nama && item.nama.toLowerCase().includes(search)) ||
                (item.code && item.code.toLowerCase().includes(search))
            );
        },
        filteredMobileDaerahData() {
            if (!this.searchDaerah) return this.selectedDaerahData;
            const search = this.searchDaerah.toLowerCase();
            return this.selectedDaerahData.filter(item =>
                (item.nama && item.nama.toLowerCase().includes(search)) ||
                (item.code && item.code.toLowerCase().includes(search))
            );
        },
        filteredMobileAkunPerMvo() {
            if (!this.searchAkunMvo) return this.dashboardData.akun_per_mvo;
            const search = this.searchAkunMvo.toLowerCase();
            return this.dashboardData.akun_per_mvo.filter(item =>
                (item.nama && item.nama.toLowerCase().includes(search)) ||
                (item.code && item.code.toLowerCase().includes(search))
            );
        },

        rankedMvoList() {
            if (!this.dashboardData.akun_per_mvo) return [];

            return this.dashboardData.akun_per_mvo.map(mvo => {
                const totalRepeatOrder = (mvo.documents || []).reduce((sum, doc) => {
                    return sum + parseInt(doc.repeat_order || 0);
                }, 0);

                const totalDownlines = (mvo.downlines || []).length;

                return {
                    ...mvo,
                    totalRepeatOrder,
                    totalDownlines
                };
            }).sort((a, b) => b.totalRepeatOrder - a.totalRepeatOrder)
                .map((mvo, index) => ({
                    ...mvo,
                    ranking: index + 1
                }));
        },

        filteredRankedMvoList() {
            if (!this.searchAkunMvo) return this.rankedMvoList;
            const search = this.searchAkunMvo.toLowerCase();
            return this.rankedMvoList.filter(item =>
                (item.nama && item.nama.toLowerCase().includes(search)) ||
                (item.code && item.code.toLowerCase().includes(search))
            );
        },

        filteredDownlines() {
            if (!this.selectedMvoData || !this.selectedMvoData.downlines) return [];
            if (!this.searchMvoDetail) return this.selectedMvoData.downlines;

            const search = this.searchMvoDetail.toLowerCase();
            return this.selectedMvoData.downlines.filter(item =>
                (item.nama && item.nama.toLowerCase().includes(search)) ||
                (item.code && item.code.toLowerCase().includes(search))
            );
        },
    },

    created() {
        this.fetchDashboardData();
    },

    watch: {
        availableLeaderboardMonths: {
            handler(months) {
                if (months.length > 0 && !this.selectedLeaderboardMonth) {
                    this.selectedLeaderboardMonth = months[months.length - 1];
                }
            },
            immediate: true
        }
    },

    methods: {
        getCardGradient(index) {
            if (index === 0) return 'background: linear-gradient(135deg, #FFD700 0%, #B8860B 100%);'; // Gold
            if (index === 1) return 'background: linear-gradient(135deg, #C0C0C0 0%, #757575 100%);'; // Silver
            if (index === 2) return 'background: linear-gradient(135deg, #CD7F32 0%, #8B4513 100%);'; // Bronze
            return 'background: linear-gradient(135deg, #2c3e50 0%, #000000 100%);'; // Dark
        },

        getMvoCardGradient(index) {
            if (index === 0) return 'background: linear-gradient(135deg, #8E24AA 0%, #4A148C 100%);'; // Purple (Rank 1)
            if (index === 1) return 'background: linear-gradient(135deg, #1E88E5 0%, #0D47A1 100%);'; // Blue (Rank 2)
            if (index === 2) return 'background: linear-gradient(135deg, #00897B 0%, #004D40 100%);'; // Teal (Rank 3)
            return 'background: linear-gradient(135deg, #546E7A 0%, #263238 100%);'; // Blue Grey (Others)
        },

        getMvoCardGradient(index) {
            if (index === 0) return 'background: linear-gradient(135deg, #8E24AA 0%, #4A148C 100%);'; // Purple (Rank 1)
            if (index === 1) return 'background: linear-gradient(135deg, #1E88E5 0%, #0D47A1 100%);'; // Blue (Rank 2)
            if (index === 2) return 'background: linear-gradient(135deg, #00897B 0%, #004D40 100%);'; // Teal (Rank 3)
            return 'background: linear-gradient(135deg, #546E7A 0%, #263238 100%);'; // Blue Grey (Default untuk Rank 4+)
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

        openMvoDetail(mvo) {
            this.selectedMvoData = mvo;
            this.mvoDetailDialog = true;
        },

        getMvoImageUrl(mvo) {
            if (mvo.provinsi && mvo.provinsi.foto_mvo) {
                return `https://babaapi.teknosof.com/project/public/${mvo.provinsi.foto_mvo}`;
            }
            return 'https://via.placeholder.com/300x300?text=No+Image';
        },

        async fetchDashboardData() {
            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return;
            }

            this.isLoading = true;
            try {
                let url = "https://babaapi.teknosof.com/api/dashboard/star";
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

                const dashboardResponse = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });

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

        // applyDateFilter() {
        //     if (this.dateRange.start_date && this.dateRange.end_date) {
        //         if (new Date(this.dateRange.start_date) > new Date(this.dateRange.end_date)) {
        //             alert('Tanggal mulai tidak boleh lebih besar dari tanggal selesai');
        //             return;
        //         }
        //     }
        //     this.fetchDashboardData();
        // },

        resetDateFilter() {
            const today = new Date();
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(today.getMonth() - 3);

            this.dateRange.start_date = threeMonthsAgo.toISOString().slice(0, 10);
            this.dateRange.end_date = today.toISOString().slice(0, 10);
            this.fetchDashboardData();
        },

        getRoleColorFromCode(code) {
            if (code.includes('REGIONAL')) return 'success';
            if (code.includes('FO')) return 'purple';
            if (code.includes('GM')) return 'orange';
            if (code.includes('SUPPLIER')) return 'teal';
            if (code.includes('DIST')) return 'cyan';
            if (code.includes('SELL')) return 'grey';
            return 'grey';
        },

        getRoleLabelFromCode(code) {
            if (code.includes('REGIONAL')) return 'Regional';
            if (code.includes('FO')) return 'Founder';
            if (code.includes('GM')) return 'GM';
            if (code.includes('SUPPLIER')) return 'Supplier';
            if (code.includes('DIST')) return 'Distributor';
            if (code.includes('SELL')) return 'Seller';
            return 'Unknown';
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

.mvo-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2) !important;
}

.mvo-image {
    border-bottom: 2px solid #e0e0e0;
}

.ranking-badge {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.top-star-card {
    border-radius: 16px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.top-star-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2) !important;
}

.card-gradient-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
}

.rank-ribbon {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(4px);
    padding: 4px 12px;
    border-radius: 20px;
    color: white;
    font-size: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
}

.info-container {
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.vertical-divider {
    width: 1px;
    height: 30px;
    background: rgba(255, 255, 255, 0.3);
}

.lh-1 {
    line-height: 1;
}

.gap-2 {
    gap: 8px;
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

:deep(.v-data-table) {
    border: 1px solid #000000;
}

:deep(.v-data-table__th) {
    background-color: #888888 !important;
    color: #FFD700 !important;
    font-weight: bold;
}
</style>