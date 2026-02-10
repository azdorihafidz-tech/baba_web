<template>
    <div>
        <!-- Desktop View -->
        <div class="d-none d-md-block">
            <v-row class="mb-4">
                <v-col cols="12" md="12">
                    <v-card color="info" dark @click="$emit('show-detail', 'all_regions')" style="cursor: pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="64" class="mb-3">mdi-map-marker-multiple</v-icon>
                            <div class="text-h3">{{ dashboardData.summary?.akun_per_daerah?.length || 0 }}</div>
                            <div class="text-h6">Total Regions with Akun</div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-card class="mb-4">
                <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2">mdi-map</v-icon>
                    Akun per Region
                </v-card-title>
                <v-card-text>
                    <v-data-table class="bg-grey-lighten-4 text-no-wrap" :headers="regionHeaders"
                        :items="dashboardData.summary?.akun_per_daerah || []" :loading="isLoading" item-key="daerah">

                        <template v-slot:item.daerah="{ item }">
                            <div class="d-flex align-center">
                                <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
                                <span class="font-weight-medium">{{ item.daerah }}</span>
                            </div>
                        </template>

                        <template v-slot:item.total="{ item }">
                            <v-chip color="primary" dark>
                                {{ item.total }}
                            </v-chip>
                        </template>

                        <template v-slot:item.percentage="{ item }">
                            <v-progress-linear :model-value="getRegionPercentage(item.total)" color="primary"
                                height="20" rounded>
                                {{ getRegionPercentage(item.total).toFixed(1) }}%
                            </v-progress-linear>
                        </template>

                    </v-data-table>
                </v-card-text>
            </v-card>

            <v-card>
                <v-card-title>Region</v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col v-for="(region, index) in dashboardData.summary?.akun_per_daerah || []"
                            :key="region.daerah" cols="12" sm="6" md="4">
                            <v-card :color="getRegionColor(index)" dark flat
                                @click="$emit('show-region-detail', region.daerah, region)" style="cursor: pointer;">
                                <v-card-text class="text-center">
                                    <v-icon size="40" class="mb-2">mdi-map-marker</v-icon>
                                    <div class="text-h5">{{ region.total }}</div>
                                    <div class="text-subtitle-1">{{ region.daerah }}</div>
                                    <div class="text-caption">{{ getRegionPercentage(region.total).toFixed(1) }}% of
                                        total</div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </div>

        <!-- Mobile View -->
        <div class="d-block d-md-none">
            <v-card class="mb-3" color="info" dark @click="$emit('show-detail', 'all_regions')"
                style="cursor: pointer;">
                <v-card-text class="text-center pa-4">
                    <v-icon size="48">mdi-map-marker-multiple</v-icon>
                    <div class="text-h4 mt-2">{{ dashboardData.summary?.akun_per_daerah?.length || 0 }}</div>
                    <div class="text-subtitle-1">Total Regions</div>
                </v-card-text>
            </v-card>

            <v-card>
                <v-card-title class="pa-3">
                    <v-icon class="mr-2">mdi-map</v-icon>
                    Accounts per Region
                </v-card-title>
                <v-card-text class="pa-0">
                    <div v-for="(region, index) in dashboardData.summary?.akun_per_daerah || []" :key="region.daerah"
                        class="pa-3 border-b" style="cursor: pointer;"
                        @click="$emit('show-region-detail', region.daerah, region)">
                        <div class="d-flex align-center justify-space-between">
                            <div class="d-flex align-center">
                                <v-icon :color="getRegionColor(index)" class="mr-2">mdi-map-marker</v-icon>
                                <div>
                                    <div class="text-body-1 font-weight-medium">{{ region.daerah }}</div>
                                    <div class="text-caption text-grey">
                                        {{ getRegionPercentage(region.total).toFixed(1) }}% of total
                                    </div>
                                </div>
                            </div>

                            <v-chip :color="getRegionColor(index)" dark size="small">
                                {{ region.total }}
                            </v-chip>
                        </div>

                        <v-progress-linear :model-value="getRegionPercentage(region.total)"
                            :color="getRegionColor(index)" height="4" rounded class="mt-2" />
                    </div>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DashboardRegions',
    props: {
        dashboardData: {
            type: Object,
            required: true,
            default: () => ({ summary: {} })
        },
        isLoading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['show-detail', 'show-region-detail'],
    data() {
        return {
            regionHeaders: [
                { title: "Region", key: "daerah" },
                { title: "Total Accounts", key: "total", align: "center" },
                { title: "Percentage", key: "percentage", align: "center" },
            ],
        };
    },
    methods: {
        getRegionPercentage(regionTotal) {
            const totalAccounts = this.dashboardData.summary?.akun?.total || 0;
            if (totalAccounts === 0) return 0;

            return (parseInt(regionTotal) / totalAccounts) * 100;
        },
        getRegionColor(index) {
            const colors = ["primary", "success", "info", "warning", "error", "purple", "cyan", "teal"];
            return colors[index % colors.length];
        },
    }
};
</script>
