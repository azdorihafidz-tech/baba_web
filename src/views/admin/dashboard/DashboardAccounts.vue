<template>
    <div>
        <!-- Desktop View -->
        <div class="d-none d-md-block">
            <v-row class="mb-4">
                <v-col cols="12" md="4">
                    <v-card color="primary" dark @click="handleShowDetail('all_accounts')" style="cursor: pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">mdi-account-multiple</v-icon>
                            <div class="text-h4">{{ dashboardData.summary?.user_total || 0 }}</div>
                            <div class="text-subtitle-1">Total Akun</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="4">
                    <v-card color="success" dark @click="handleShowDetail('approved_accounts')"
                        style="cursor: pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">mdi-account-check</v-icon>
                            <div class="text-h4">{{ dashboardData.summary?.akun?.approved || 0 }}</div>
                            <div class="text-subtitle-1">Approved Akun</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="4">
                    <v-card color="orange" dark @click="handleShowDetail('pending_accounts')" style="cursor: pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">mdi-account-clock</v-icon>
                            <div class="text-h4">{{ dashboardData.summary?.akun?.pending || 0 }}</div>
                            <div class="text-subtitle-1">Pending Akun</div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row class="mb-4">
                <v-col cols="12" md="4">
                    <v-card color="success" dark @click="handleShowDetail('mvo_accounts')" style="cursor: pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">mdi-store</v-icon>
                            <div class="text-h4">{{ dashboardData.summary?.akun?.total || 0 }}</div>
                            <div class="text-subtitle-1">MVO</div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" md="4">
                    <v-card color="cyan" dark @click="handleShowDetail('distributor_accounts')"
                        style="cursor: pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">mdi-store</v-icon>
                            <div class="text-h4">{{ dashboardData.summary?.akun?.distributor || 0 }}</div>
                            <div class="text-subtitle-1">Distributors</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="4">
                    <v-card color="purple" dark @click="handleShowDetail('founder_accounts')" style="cursor: pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">mdi-crown</v-icon>
                            <div class="text-h4">{{ dashboardData.summary?.akun?.founder || 0 }}</div>
                            <div class="text-subtitle-1">Founders</div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-card class="mb-4">
                <v-card-title>Account Status Statistics</v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" md="8">
                            <div class="d-flex align-center mb-3">
                                <v-progress-linear :model-value="getAccountPercentage('approved')" color="success"
                                    height="30" rounded class="mr-3">
                                    <span class="text-white font-weight-bold">{{
                                        getAccountPercentage('approved').toFixed(1) }}%</span>
                                </v-progress-linear>
                                <span class="text-body-1 font-weight-medium">Approved ({{
                                    dashboardData.summary?.akun?.approved || 0
                                    }})</span>
                            </div>
                            <div class="d-flex align-center">
                                <v-progress-linear :model-value="getAccountPercentage('pending')" color="orange"
                                    height="30" rounded class="mr-3">
                                    <span class="text-white font-weight-bold">{{
                                        getAccountPercentage('pending').toFixed(1) }}%</span>
                                </v-progress-linear>
                                <span class="text-body-1 font-weight-medium">Pending ({{
                                    dashboardData.summary?.akun?.pending || 0
                                    }})</span>
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
                                    <span class="font-weight-bold text-cyan">{{ dashboardData.summary?.akun?.distributor
                                        || 0 }}</span>
                                </div>
                                <div class="d-flex justify-space-between">
                                    <span>Founders:</span>
                                    <span class="font-weight-bold text-purple">{{ dashboardData.summary?.akun?.founder
                                        || 0 }}</span>
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
                <v-col cols="12">
                    <v-card color="info" dark @click="handleShowDetail('all_users')" style="cursor: pointer;">
                        <v-card-text class="text-center pa-6">
                            <v-icon size="40">mdi-account-group</v-icon>
                            <div class="text-h5 mt-3">{{ dashboardData.summary?.user_total || 0 }}</div>
                            <div class="text-body-2 mt-1">Total Akun</div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row dense class="mb-3">
                <v-col cols="6">
                    <v-card class="text-center" @click="handleShowDetail('approved_accounts')" style="cursor: pointer;">
                        <v-card-text class="pa-2">
                            <v-icon color="success" size="20">mdi-account-check</v-icon>
                            <div class="text-body-1 font-weight-bold mt-1">{{ dashboardData.summary?.akun?.approved || 0
                                }}</div>
                            <div class="text-caption">Approved</div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="6">
                    <v-card class="text-center" @click="handleShowDetail('pending_accounts')" style="cursor: pointer;">
                        <v-card-text class="pa-2">
                            <v-icon color="orange" size="20">mdi-account-clock</v-icon>
                            <div class="text-body-1 font-weight-bold mt-1">{{ dashboardData.summary?.akun?.pending || 0
                                }}</div>
                            <div class="text-caption">Pending</div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-row dense class="mb-3">
                <v-col cols="6">
                    <v-card class="text-center" @click="handleShowDetail('distributor_accounts')"
                        style="cursor: pointer;">
                        <v-card-text class="pa-2">
                            <v-icon color="cyan" size="20">mdi-store</v-icon>
                            <div class="text-body-1 font-weight-bold mt-1">{{ dashboardData.summary?.akun?.distributor
                                || 0 }}</div>
                            <div class="text-caption">Distributors</div>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="6">
                    <v-card class="text-center" @click="handleShowDetail('founder_accounts')" style="cursor: pointer;">
                        <v-card-text class="pa-2">
                            <v-icon color="purple" size="20">mdi-crown</v-icon>
                            <div class="text-body-1 font-weight-bold mt-1">{{ dashboardData.summary?.akun?.founder || 0
                                }}</div>
                            <div class="text-caption">Founders</div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <v-card>
                <v-card-title class="pa-3">Account Status</v-card-title>
                <v-card-text class="pa-3">
                    <div class="mb-3">
                        <div class="d-flex justify-space-between mb-1">
                            <span class="text-body-2">Approved</span>
                            <span class="text-caption">{{ getAccountPercentage('approved').toFixed(1) }}%</span>
                        </div>
                        <v-progress-linear :model-value="getAccountPercentage('approved')" color="success" height="8"
                            rounded />
                    </div>
                    <div>
                        <div class="d-flex justify-space-between mb-1">
                            <span class="text-body-2">Pending</span>
                            <span class="text-caption">{{ getAccountPercentage('pending').toFixed(1) }}%</span>
                        </div>
                        <v-progress-linear :model-value="getAccountPercentage('pending')" color="orange" height="8"
                            rounded />
                    </div>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";

export default {
    name: 'DashboardAccounts',
    emits: ['show-detail'],
    data() {
        return {
            dashboardData: { summary: { akun: {} } },
            mvoRawData: [],
            isLoading: false,
        };
    },
    created() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            this.isLoading = true;
            const token = Cookies.get("token");
            if (!token) {
                // Handle not logged in
                return;
            }

            try {
                const [dashboardResponse, mvoResponse] = await Promise.all([
                    axios.get("https://babaapi.teknosof.com/api/dashboard", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("https://babaapi.teknosof.com/api/mvo", {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                ]);

                if (dashboardResponse.data && dashboardResponse.data.status === "success") {
                    this.dashboardData = dashboardResponse.data.data;
                }

                if (mvoResponse.data && mvoResponse.data.status === "success") {
                    this.mvoRawData = mvoResponse.data.data;
                }
            } catch (error) {
                console.error("Error fetching accounts data:", error);
            } finally {
                this.isLoading = false;
            }
        },

        handleShowDetail(type) {
            let data = [];
            switch (type) {
                case 'all_accounts':
                case 'all_users':
                    data = [...this.mvoRawData];
                    break;
                case 'approved_accounts':
                    data = this.mvoRawData.filter(item => item.status_inputan === "approved");
                    break;
                case 'pending_accounts':
                    data = this.mvoRawData.filter(item =>
                        item.status_inputan === null ||
                        item.status_inputan === "pending" ||
                        item.status_inputan === undefined
                    );
                    break;
                case 'distributor_accounts':
                    data = this.mvoRawData.filter(item => item.code && item.code.startsWith('DIST-'));
                    break;
                case 'mvo_accounts':
                    data = this.mvoRawData.filter(item => item.code && item.code.startsWith('MVO-'));
                    break;
                case 'founder_accounts':
                    data = this.mvoRawData.filter(item => item.code && item.code.startsWith('FO-'));
                    break;
                default:
                    data = [];
            }
            this.$emit('show-detail', { type, data });
        },

        getAccountPercentage(type) {
            const total = this.dashboardData.summary?.akun?.total || 0;
            if (total === 0) return 0;

            const value = this.dashboardData.summary?.akun?.[type] || 0;
            return (value / total) * 100;
        },
    }
};
</script>
