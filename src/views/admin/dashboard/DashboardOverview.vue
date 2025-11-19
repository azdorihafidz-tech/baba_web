<template>
    <div>
        <v-row class="mb-4">
            <!-- Card Total Pengguna -->
            <v-col cols="12" md="3">
                <v-card color="purple" dark @click="$emit('show-detail', 'all_users')" style="cursor: pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="48" class="mb-2">mdi-account-group</v-icon>
                        <div class="text-h4">{{ dashboardData.summary?.user_total || 0 }}</div>
                        <div class="text-subtitle-1">Total Akun</div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Card Total Dokumen -->
            <v-col cols="12" md="3">
                <v-card color="primary" dark @click="$emit('show-detail', 'all_documents')" style="cursor: pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="48" class="mb-2">mdi-file-document-multiple</v-icon>
                        <div class="text-h4">{{ dashboardData.summary?.documents?.total || 0 }}</div>
                        <div class="text-subtitle-1">Total Dokumen</div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Card Akun MVO Saja -->
            <v-col cols="12" md="3">
                <v-card color="success" dark @click="$emit('show-detail', 'mvo_accounts_only')"
                    style="cursor: pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="48" class="mb-2">mdi-account</v-icon>
                        <div class="text-h4">{{ getMVOOnlyCount() }}</div>
                        <div class="text-subtitle-1">Total Akun</div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Card Total Daerah -->
            <v-col cols="12" md="3">
                <v-card color="info" dark @click="$emit('show-detail', 'all_regions')" style="cursor: pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="48" class="mb-2">mdi-map-marker-multiple</v-icon>
                        <div class="text-h4">{{ dashboardData.summary?.akun_per_daerah?.length || 0 }}</div>
                        <div class="text-subtitle-1">Total Akun Per Daerah</div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Top 5 Bintang -->
        <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-star</v-icon>
                Top 5 Akun Bintang Terbanyak
            </v-card-title>
            <v-card-text>
                <v-data-table :headers="topBintangHeaders" :items="dashboardData.summary?.top_5_bintang || []"
                    :loading="isLoading" item-key="mvo_id" class="elevation-1" :items-per-page="5">

                    <template v-slot:item.rank="{ index }">
                        <v-chip :color="getRankColor(index + 1)" dark size="small">
                            {{ index + 1 }}
                        </v-chip>
                    </template>

                    <template v-slot:item.mvo_name="{ item }">
                        <div class="font-weight-medium" @click="$emit('show-mvo-detail', item.mvo_id, item)"
                            style="cursor: pointer;">
                            {{ item.mvo?.nama || 'N/A' }}
                        </div>
                        <div class="text-caption text-grey">
                            {{ item.mvo?.code || 'N/A' }}
                        </div>
                    </template>

                    <template v-slot:item.total_bintang="{ item }">
                        <v-chip color="amber" dark>
                            <v-icon left small>mdi-star</v-icon>
                            {{ item.total_bintang }}
                        </v-chip>
                    </template>

                </v-data-table>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import { computed } from 'vue'

export default {
    name: 'DashboardOverview',
    props: {
        dashboardData: Object,
        isLoading: Boolean
    },
    emits: ['show-detail', 'show-mvo-detail'],
    setup(props) {
        const topBintangHeaders = [
            { title: "Rank", key: "rank", align: "center", width: "80px" },
            { title: "Akun Details", key: "mvo_name" },
            { title: "Total Bintang", key: "total_bintang", align: "center" },
        ]

        const getRankColor = (rank) => {
            switch (rank) {
                case 1: return "amber";
                case 2: return "grey";
                case 3: return "orange";
                default: return "blue";
            }
        }

        const getMVOOnlyCount = () => {
            // This would need access to mvoRawData from parent
            // For now, return 0 or implement proper data flow
            return 0
        }

        return {
            topBintangHeaders,
            getRankColor,
            getMVOOnlyCount
        }
    }
}
</script>