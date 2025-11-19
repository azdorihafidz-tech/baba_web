<template>
    <div>
        <v-row dense>
            <v-col cols="6">
                <v-card color="success" dark @click="$emit('show-detail', 'mvo_accounts_only')"
                    style="cursor: pointer;">
                    <v-card-text class="text-center pa-3">
                        <v-icon size="32">mdi-account</v-icon>
                        <div class="text-h6 mt-2">{{ getMVOOnlyCount() }}</div>
                        <div class="text-caption">Total Akun</div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card color="info" dark @click="$emit('show-detail', 'all_regions')" style="cursor: pointer;">
                    <v-card-text class="text-center pa-3">
                        <v-icon size="32">mdi-map-marker-multiple</v-icon>
                        <div class="text-h6 mt-2">{{ dashboardData.summary?.akun_per_daerah?.length || 0 }}</div>
                        <div class="text-caption">Total Akun Per Daerah</div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Mobile Top 5 Bintang Section -->
        <v-card class="mt-3">
            <v-card-title class="pa-3">
                <v-icon class="mr-2">mdi-star</v-icon>
                Top 5 Akun Bintang
            </v-card-title>
            <v-card-text class="pa-0">
                <v-list>
                    <v-list-item v-for="(item, index) in dashboardData.summary?.top_5_bintang || []" :key="item.mvo_id"
                        @click="$emit('show-mvo-detail', item.mvo_id, item)" style="cursor: pointer;" class="py-3">
                        <template v-slot:prepend>
                            <v-chip :color="getRankColor(index + 1)" dark size="small" class="mr-3">
                                {{ index + 1 }}
                            </v-chip>
                        </template>

                        <v-list-item-title class="font-weight-medium">
                            {{ item.mvo?.nama || 'N/A' }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            <div class="text-caption mb-1">{{ item.mvo?.code || 'N/A' }}</div>
                        </v-list-item-subtitle>

                        <template v-slot:append>
                            <v-chip color="amber" dark size="small">
                                <v-icon left size="16">mdi-star</v-icon>
                                {{ item.total_bintang }}
                            </v-chip>
                        </template>
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
export default {
    name: 'MobileOverview',
    props: {
        dashboardData: Object
    },
    emits: ['show-detail', 'show-mvo-detail'],
    methods: {
        getMVOOnlyCount() {
            // This would need access to mvoRawData from parent
            return 0
        },
        getRankColor(rank) {
            switch (rank) {
                case 1: return "amber";
                case 2: return "grey";
                case 3: return "orange";
                default: return "blue";
            }
        }
    }
}
</script>

<style scoped>
.mobile-stat-card {
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease;
}

.mobile-stat-card:active {
    transform: scale(0.98);
}
</style>