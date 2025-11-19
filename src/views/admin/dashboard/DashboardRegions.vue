<template>
    <div>
        <v-row class="mb-4">
            <!-- Card Total Regions -->
            <v-col cols="12" md="12">
                <v-card color="info" dark>
                    <v-card-text class="text-center">
                        <v-icon size="64" class="mb-3">mdi-map-marker-multiple</v-icon>
                        <div class="text-h3">{{ dashboardData.summary?.akun_per_daerah?.length || 0 }}</div>
                        <div class="text-h6">Total Regions with Akun</div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Regions Table -->
        <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-map</v-icon>
                Akun per Region
            </v-card-title>
            <v-card-text>
                <v-data-table :headers="regionHeaders" :items="dashboardData.summary?.akun_per_daerah || []"
                    :loading="isLoading" item-key="daerah" class="elevation-1">

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
                        <v-progress-linear :value="getRegionPercentage(item.total)" color="primary" height="20" rounded>
                            {{ getRegionPercentage(item.total).toFixed(1) }}%
                        </v-progress-linear>
                    </template>

                </v-data-table>
            </v-card-text>
        </v-card>

        <!-- Region Statistics -->
        <v-card>
            <v-card-title>Region</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col v-for="(region, index) in dashboardData.summary?.akun_per_daerah || []" :key="region.daerah"
                        cols="12" sm="6" md="4">
                        <v-card :color="getRegionColor(index)" dark flat>
                            <v-card-text class="text-center">
                                <v-icon size="40" class="mb-2">mdi-map-marker</v-icon>
                                <div class="text-h5">{{ region.total }}</div>
                                <div class="text-subtitle-1">{{ region.daerah }}</div>
                                <div class="text-caption">{{ getRegionPercentage(region.total).toFixed(1) }}% of total
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
export default {
    name: 'DashboardRegions',
    props: {
        dashboardData: Object,
        isLoading: Boolean
    },
    emits: ['show-detail'],
    data() {
        return {
            regionHeaders: [
                { title: "Region", key: "daerah" },
                { title: "Total Accounts", key: "total", align: "center" },
                { title: "Percentage", key: "percentage", align: "center" },
            ]
        }
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
        }
    }
}
</script>