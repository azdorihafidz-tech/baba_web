<template>
    <div>
        <v-row class="mb-4">
            <!-- Card Total Accounts -->
            <v-col cols="12" md="4">
                <v-card color="primary" dark @click="$emit('show-detail', 'all_accounts')" style="cursor: pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="48" class="mb-2">mdi-account-multiple</v-icon>
                        <div class="text-h4">{{ dashboardData.summary?.user_total || 0 }}</div>
                        <div class="text-subtitle-1">Total Akun</div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Card Approved Accounts -->
            <v-col cols="12" md="4">
                <v-card color="success" dark @click="$emit('show-detail', 'approved_accounts')"
                    style="cursor: pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="48" class="mb-2">mdi-account-check</v-icon>
                        <div class="text-h4">{{ dashboardData.summary?.akun?.approved || 0 }}</div>
                        <div class="text-subtitle-1">Approved Akun</div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Card Pending Accounts -->
            <v-col cols="12" md="4">
                <v-card color="orange" dark @click="$emit('show-detail', 'pending_accounts')" style="cursor: pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="48" class="mb-2">mdi-account-clock</v-icon>
                        <div class="text-h4">{{ dashboardData.summary?.akun?.pending || 0 }}</div>
                        <div class="text-subtitle-1">Pending Akun</div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Account Types -->
        <v-row class="mb-4">
            <!-- Card MVO -->
            <v-col cols="12" md="4">
                <v-card color="success" dark @click="$emit('show-detail', 'mvo_accounts')" style="cursor: pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="48" class="mb-2">mdi-store</v-icon>
                        <div class="text-h4">{{ dashboardData.summary?.akun?.total || 0 }}</div>
                        <div class="text-subtitle-1">MVO</div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Card Distributors -->
            <v-col cols="12" md="4">
                <v-card color="cyan" dark @click="$emit('show-detail', 'distributor_accounts')"
                    style="cursor: pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="48" class="mb-2">mdi-store</v-icon>
                        <div class="text-h4">{{ dashboardData.summary?.akun?.distributor || 0 }}</div>
                        <div class="text-subtitle-1">Distributors</div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Card Founders -->
            <v-col cols="12" md="4">
                <v-card color="purple" dark @click="$emit('show-detail', 'founder_accounts')" style="cursor: pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="48" class="mb-2">mdi-crown</v-icon>
                        <div class="text-h4">{{ dashboardData.summary?.akun?.founder || 0 }}</div>
                        <div class="text-subtitle-1">Founders</div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Account Statistics -->
        <v-card class="mb-4">
            <v-card-title>Account Status Statistics</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="8">
                        <div class="d-flex align-center mb-3">
                            <v-progress-linear :value="getAccountPercentage('approved')" color="success" height="30"
                                rounded class="mr-3">
                                <span class="text-white font-weight-bold">{{ getAccountPercentage('approved').toFixed(1)
                                    }}%</span>
                            </v-progress-linear>
                            <span class="text-body-1 font-weight-medium">Approved ({{
                                dashboardData.summary?.akun?.approved || 0 }})</span>
                        </div>
                        <div class="d-flex align-center">
                            <v-progress-linear :value="getAccountPercentage('pending')" color="orange" height="30"
                                rounded class="mr-3">
                                <span class="text-white font-weight-bold">{{ getAccountPercentage('pending').toFixed(1)
                                    }}%</span>
                            </v-progress-linear>
                            <span class="text-body-1 font-weight-medium">Pending ({{
                                dashboardData.summary?.akun?.pending || 0 }})</span>
                        </div>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-card flat color="grey-lighten-4" class="pa-4">
                            <div class="text-h6 mb-2">Account Types</div>
                            <div class="d-flex justify-space-between mb-1">
                                <span>MVO:</span>
                                <span class="font-weight-bold text-cyan">{{ dashboardData.summary?.akun?.mvo || 0
                                    }}</span>
                            </div>
                            <div class="d-flex justify-space-between mb-1">
                                <span>Distributors:</span>
                                <span class="font-weight-bold text-cyan">{{ dashboardData.summary?.akun?.distributor ||
                                    0 }}</span>
                            </div>
                            <div class="d-flex justify-space-between">
                                <span>Founders:</span>
                                <span class="font-weight-bold text-purple">{{ dashboardData.summary?.akun?.founder || 0
                                    }}</span>
                            </div>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
export default {
    name: 'DashboardAccounts',
    props: {
        dashboardData: Object
    },
    emits: ['show-detail'],
    methods: {
        getAccountPercentage(type) {
            const total = this.dashboardData.summary?.akun?.total || 0;
            if (total === 0) return 0;

            const value = this.dashboardData.summary?.akun?.[type] || 0;
            return (value / total) * 100;
        }
    }
}
</script>