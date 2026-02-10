<template>
    <div>
        <!-- Desktop View -->
        <div class="d-none d-md-block">
            <v-row class="mb-4">
                <v-col cols="12" md="4">
                    <v-card color="primary" dark @click="$emit('show-detail', 'all_documents')"
                        style="cursor: pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">mdi-file-document-multiple</v-icon>
                            <div class="text-h4">{{ dashboardData.summary?.documents?.total || 0 }}</div>
                            <div class="text-subtitle-1">Total Documents</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="4">
                    <v-card color="success" dark @click="$emit('show-detail', 'approved_documents')"
                        style="cursor: pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">mdi-check-circle</v-icon>
                            <div class="text-h4">{{ dashboardData.summary?.documents?.approved || 0 }}</div>
                            <div class="text-subtitle-1">Approved Documents</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="4">
                    <v-card color="orange" dark @click="$emit('show-detail', 'pending_documents')"
                        style="cursor: pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">mdi-clock-outline</v-icon>
                            <div class="text-h4">{{ dashboardData.summary?.documents?.pending || 0 }}</div>
                            <div class="text-subtitle-1">Pending Documents</div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-card class="mb-4">
                <v-card-title>Document Status Statistics</v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" md="6">
                            <div class="d-flex align-center mb-2">
                                <v-progress-linear :model-value="getDocumentPercentage('approved')" color="success"
                                    height="25" rounded class="mr-3">
                                    <span class="text-white font-weight-bold">{{
                                        getDocumentPercentage('approved').toFixed(1) }}%</span>
                                </v-progress-linear>
                                <span class="text-body-2">Approved</span>
                            </div>
                            <div class="d-flex align-center">
                                <v-progress-linear :model-value="getDocumentPercentage('pending')" color="orange"
                                    height="25" rounded class="mr-3">
                                    <span class="text-white font-weight-bold">{{
                                        getDocumentPercentage('pending').toFixed(1) }}%</span>
                                </v-progress-linear>
                                <span class="text-body-2">Pending</span>
                            </div>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-card flat color="grey-lighten-4" class="pa-4">
                                <div class="text-h6 mb-2">Summary</div>
                                <div class="d-flex justify-space-between mb-1">
                                    <span>Total:</span>
                                    <span class="font-weight-bold">{{ dashboardData.summary?.documents?.total || 0
                                    }}</span>
                                </div>
                                <div class="d-flex justify-space-between mb-1">
                                    <span>Approved:</span>
                                    <span class="font-weight-bold text-success">{{
                                        dashboardData.summary?.documents?.approved || 0
                                    }}</span>
                                </div>
                                <div class="d-flex justify-space-between">
                                    <span>Pending:</span>
                                    <span class="font-weight-bold text-orange">{{
                                        dashboardData.summary?.documents?.pending || 0 }}</span>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </div>

        <!-- Mobile View -->
        <div class="d-block d-md-none">
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
                    <v-card class="text-center" @click="$emit('show-detail', 'pending_documents')"
                        style="cursor: pointer;">
                        <v-card-text class="pa-2">
                            <v-icon color="orange" size="20">mdi-clock-outline</v-icon>
                            <div class="text-h6 mt-1">{{ dashboardData.summary?.documents?.pending || 0 }}</div>
                            <div class="text-caption">Pending</div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

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
                        <v-progress-linear :model-value="getDocumentPercentage('approved')" color="success" height="8"
                            rounded />
                    </div>
                    <div>
                        <div class="d-flex justify-space-between mb-1">
                            <span class="text-body-2">Pending</span>
                            <span class="text-caption">{{ getDocumentPercentage('pending').toFixed(1) }}%</span>
                        </div>
                        <v-progress-linear :model-value="getDocumentPercentage('pending')" color="orange" height="8"
                            rounded />
                    </div>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DashboardDocuments',
    props: {
        dashboardData: {
            type: Object,
            required: true,
            default: () => ({ summary: {} })
        }
    },
    emits: ['show-detail'],
    methods: {
        getDocumentPercentage(type) {
            const total = this.dashboardData.summary?.documents?.total || 0;
            if (total === 0) return 0;

            const value = this.dashboardData.summary?.documents?.[type] || 0;
            return (value / total) * 100;
        },
    }
};
</script>
