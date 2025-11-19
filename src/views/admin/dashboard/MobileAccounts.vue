<template>
    <div>
        <v-row dense class="mb-3">
            <v-col cols="6">
                <v-card color="primary" dark @click="$emit('show-detail', 'all_accounts')" style="cursor: pointer;">
                    <v-card-text class="text-center pa-3">
                        <v-icon size="28">mdi-account-multiple</v-icon>
                        <div class="text-h6 mt-2">{{ dashboardData.summary?.akun?.total || 0 }}</div>
                        <div class="text-caption">Total</div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card color="info" dark @click="$emit('show-detail', 'all_users')" style="cursor: pointer;">
                    <v-card-text class="text-center pa-3">
                        <v-icon size="28">mdi-account-group</v-icon>
                        <div class="text-h6 mt-2">{{ dashboardData.summary?.user_total || 0 }}</div>
                        <div class="text-caption">Users</div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row dense class="mb-3">
            <v-col cols="6">
                <v-card class="text-center" @click="$emit('show-detail', 'approved_accounts')" style="cursor: pointer;">
                    <v-card-text class="pa-2">
                        <v-icon color="success" size="20">mdi-account-check</v-icon>
                        <div class="text-body-1 font-weight-bold mt-1">{{ dashboardData.summary?.akun?.approved || 0 }}
                        </div>
                        <div class="text-caption">Approved</div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card class="text-center" @click="$emit('show-detail', 'pending_accounts')" style="cursor: pointer;">
                    <v-card-text class="pa-2">
                        <v-icon color="orange" size="20">mdi-account-clock</v-icon>
                        <div class="text-body-1 font-weight-bold mt-1">{{ dashboardData.summary?.akun?.pending || 0 }}
                        </div>
                        <div class="text-caption">Pending</div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row dense class="mb-3">
            <v-col cols="6">
                <v-card class="text-center" @click="$emit('show-detail', 'distributor_accounts')"
                    style="cursor: pointer;">
                    <v-card-text class="pa-2">
                        <v-icon color="cyan" size="20">mdi-store</v-icon>
                        <div class="text-body-1 font-weight-bold mt-1">{{ dashboardData.summary?.akun?.distributor || 0
                            }}</div>
                        <div class="text-caption">Distributors</div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card class="text-center" @click="$emit('show-detail', 'founder_accounts')" style="cursor: pointer;">
                    <v-card-text class="pa-2">
                        <v-icon color="purple" size="20">mdi-crown</v-icon>
                        <div class="text-body-1 font-weight-bold mt-1">{{ dashboardData.summary?.akun?.founder || 0 }}
                        </div>
                        <div class="text-caption">Founders</div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Mobile Account Statistics -->
        <v-card>
            <v-card-title class="pa-3">Account Status</v-card-title>
            <v-card-text class="pa-3">
                <div class="mb-3">
                    <div class="d-flex justify-space-between mb-1">
                        <span class="text-body-2">Approved</span>
                        <span class="text-caption">{{ getAccountPercentage('approved').toFixed(1) }}%</span>
                    </div>
                    <v-progress-linear :value="getAccountPercentage('approved')" color="success" height="8" rounded />
                </div>
                <div>
                    <div class="d-flex justify-space-between mb-1">
                        <span class="text-body-2">Pending</span>
                        <span class="text-caption">{{ getAccountPercentage('pending').toFixed(1) }}%</span>
                    </div>
                    <v-progress-linear :value="getAccountPercentage('pending')" color="orange" height="8" rounded />
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
export default {
    name: 'MobileAccounts',
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