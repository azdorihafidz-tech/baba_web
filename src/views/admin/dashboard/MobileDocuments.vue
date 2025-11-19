<template>
    <div>
        <v-row dense class="mb-3">
            <v-col cols="4">
                <v-card class="text-center" @click="$emit('show-detail', 'all_documents')" style="cursor: pointer;">
                    <v-card-text class="pa-2">
                        <v-icon color="primary" size="20">mdi-file-document-multiple</v-icon>
                        <div class="text-h6 mt-1">{{ dashboardData.summary?.documents?.total || 0 }}</div>
                        <div class="text-caption">Total</div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="4">
                <v-card class="text-center" @click="$emit('show-detail', 'approved_documents')"
                    style="cursor: pointer;">
                    <v-card-text class="pa-2">
                        <v-icon color="success" size="20">mdi-check-circle</v-icon>
                        <div class="text-h6 mt-1">{{ dashboardData.summary?.documents?.approved || 0 }}</div>
                        <div class="text-caption">Approved</div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="4">
                <v-card class="text-center" @click="$emit('show-detail', 'pending_documents')" style="cursor: pointer;">
                    <v-card-text class="pa-2">
                        <v-icon color="orange" size="20">mdi-clock-outline</v-icon>
                        <div class="text-h6 mt-1">{{ dashboardData.summary?.documents?.pending || 0 }}</div>
                        <div class="text-caption">Pending</div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Mobile Document Progress -->
        <v-card>
            <v-card-title class="pa-3">
                <span class="text-subtitle-1">Document Status</span>
            </v-card-title>
            <v-card-text class="pa-3">
                <div class="mb-3">
                    <div class="d-flex justify-space-between mb-1">
                        <span class="text-body-2">Approved</span>
                        <span class="text-caption">{{ getDocumentPercentage('approved').toFixed(1) }}%</span>
                    </div>
                    <v-progress-linear :value="getDocumentPercentage('approved')" color="success" height="8" rounded />
                </div>
                <div>
                    <div class="d-flex justify-space-between mb-1">
                        <span class="text-body-2">Pending</span>
                        <span class="text-caption">{{ getDocumentPercentage('pending').toFixed(1) }}%</span>
                    </div>
                    <v-progress-linear :value="getDocumentPercentage('pending')" color="orange" height="8" rounded />
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
export default {
    name: 'MobileDocuments',
    props: {
        dashboardData: Object
    },
    emits: ['show-detail'],
    methods: {
        getDocumentPercentage(type) {
            const total = this.dashboardData.summary?.documents?.total || 0;
            if (total === 0) return 0;

            const value = this.dashboardData.summary?.documents?.[type] || 0;
            return (value / total) * 100;
        }
    }
}
</script>

<style scoped>
.mobile-mini-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.2s ease;
}

.mobile-mini-card:active {
    transform: scale(0.95);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
</style>