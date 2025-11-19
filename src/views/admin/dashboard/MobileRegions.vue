<template>
    <div>
        <v-card class="mb-3" color="info" dark @click="$emit('show-detail', 'all_regions')" style="cursor: pointer;">
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
                    class="pa-3 border-b" @click="showRegionDetail(region.daerah, region)" style="cursor: pointer;">
                    <div class="d-flex align-center justify-space-between">
                        <div class="d-flex align-center">
                            <v-icon :color="getRegionColor(index)" class="mr-2">mdi-map-marker</v-icon>
                            <div>
                                <div class="text-body-1 font-weight-medium">{{ region.daerah }}</div>
                                <div class="text-caption text-grey">{{ getRegionPercentage(region.total).toFixed(1) }}%
                                    of total</div>
                            </div>
                        </div>
                        <v-chip :color="getRegionColor(index)" dark size="small">
                            {{ region.total }}
                        </v-chip>
                    </div>
                    <v-progress-linear :value="getRegionPercentage(region.total)" :color="getRegionColor(index)"
                        height="4" rounded class="mt-2" />
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
export default {
    name: 'MobileRegions',
    props: {
        dashboardData: Object
    },
    emits: ['show-detail'],
    methods: {
        showRegionDetail(regionName, regionData) {
            this.$emit('show-detail', 'region_accounts')
        },
        getRegionPercentage(regionTotal) {
            const totalAccounts = this.dashboardData.summary?.akun?.total || 0;
            if (totalAccounts === 0) return 0;

            return (parseInt(regionTotal) / totalAccounts) * 100;
        },
        getRegionColor(index) {
            const colors = ["primary", "success", "info", "warning", "error", "purple", "cyan", "teal"];
            return colors[index % colors.length];
        }
    }
}
</script>

<style scoped>
.mobile-region-header {
    border-radius: 20px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    background: #ffffff;
}

.mobile-region-item {
    border-radius: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    background: #ffffff;
}

.mobile-region-item:active {
    transform: scale(0.98);
}
</style>