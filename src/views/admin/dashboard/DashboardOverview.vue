<template>
    <div>
        <!-- ================= DESKTOP VIEW ================= -->
        <div class="d-none d-md-block">
            <v-row class="mb-4">

                <!-- Total Akun -->
                <v-col cols="12" md="3">
                    <v-card color="purple" dark @click="handleShowDetail('all_users')" class="cursor-pointer">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">mdi-account-group</v-icon>
                            <div class="text-h4">
                                {{ summary.user_total ?? 0 }}
                            </div>
                            <div class="text-subtitle-1">Total Akun</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- Total Dokumen -->
                <v-col cols="12" md="3">
                    <v-card color="primary" dark @click="handleShowDetail('all_documents')" class="cursor-pointer">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">
                                mdi-file-document-multiple
                            </v-icon>
                            <div class="text-h4">
                                {{ summary.documents?.total ?? 0 }}
                            </div>
                            <div class="text-subtitle-1">Total Dokumen</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- Total Daerah -->
                <v-col cols="12" md="3">
                    <v-card color="info" dark @click="handleShowDetail('all_regions')" class="cursor-pointer">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">
                                mdi-map-marker-multiple
                            </v-icon>
                            <div class="text-h4">
                                {{ summary.akun_per_daerah?.length ?? 0 }}
                            </div>
                            <div class="text-subtitle-1">
                                Total Akun Per Daerah
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

            </v-row>

            <!-- ===== Akun per MVO ===== -->
            <v-row class="mb-4" v-if="hasAkunPerMVO">
                <v-col cols="12" md="4" v-for="mvo in summary.akun_per_mvo" :key="`mvo-${mvo.mvo_id}`">
                    <v-card color="teal" dark class="h-100 cursor-pointer" @click="$emit('show-mvo-subordinates', mvo)">
                        <v-card-text class="text-center">
                            <v-icon size="40" class="mb-2">
                                mdi-account-supervisor
                            </v-icon>

                            <div class="text-h5">
                                {{ mvo.mvo_nama }}
                            </div>

                            <div class="text-caption mb-2">
                                {{ mvo.mvo_code }}
                            </div>

                            <v-divider class="my-2"></v-divider>

                            <div class="d-flex justify-center align-center gap-4">
                                <div class="d-flex align-center">
                                    <v-icon size="18" class="mr-1">
                                        mdi-account-multiple
                                    </v-icon>
                                    {{ mvo.total_bawahan }} Downline
                                </div>

                                <div class="d-flex align-center">
                                    <v-icon size="18" color="amber" class="mr-1">
                                        mdi-star
                                    </v-icon>
                                    {{ mvo.total_bintang_jaringan }}
                                </div>
                            </div>

                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <!-- ===== Top 5 Bintang ===== -->
            <v-card class="mb-4" v-for="role in bintangRoles" :key="role.key">
                <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2" :color="role.iconColor">
                        {{ role.icon }}
                    </v-icon>
                    Top 5 Bintang — {{ role.label }}
                </v-card-title>

                <v-card-text>
                    <v-data-table class="bg-grey-lighten-4 text-no-wrap" :headers="topBintangHeaders"
                        :items="summary.top_5_bintang_role?.[role.key] ?? []" :loading="isLoading" item-key="mvo_id"
                        :items-per-page="5">

                        <!-- Rank -->
                        <template #item.rank="{ index }">
                            <v-chip :color="getRankColor(index + 1)" dark size="small">
                                {{ index + 1 }}
                            </v-chip>
                        </template>

                        <!-- Detail -->
                        <template #item.mvo_name="{ item }">
                            <div class="font-weight-medium cursor-pointer" @click="handleShowMvoDetail(item.mvo_id)">
                                {{ item.mvo?.nama ?? 'N/A' }}
                            </div>
                            <div class="text-caption text-grey">
                                {{ item.mvo?.code ?? 'N/A' }}
                            </div>
                        </template>

                        <!-- Bintang -->
                        <template #item.total_bintang="{ item }">
                            <div class="d-flex justify-center">
                                <v-icon v-for="n in parseInt(item.total_bintang || 0)" :key="n" color="amber"
                                    size="small" class="mr-1">
                                    mdi-star
                                </v-icon>

                                <v-icon v-if="!item.total_bintang" color="grey" size="small">
                                    mdi-star-outline
                                </v-icon>
                            </div>
                        </template>

                    </v-data-table>
                </v-card-text>
            </v-card>

        </div>

        <!-- ================= MOBILE VIEW ================= -->
        <div class="d-block d-md-none">

            <v-row dense>
                <v-col cols="6">
                    <v-card color="info" dark class="cursor-pointer" @click="handleShowDetail('all_regions')">
                        <v-card-text class="text-center pa-3">
                            <v-icon size="32">
                                mdi-map-marker-multiple
                            </v-icon>
                            <div class="text-h6 mt-2">
                                {{ summary.akun_per_daerah?.length ?? 0 }}
                            </div>
                            <div class="text-caption">
                                Total Akun Per Daerah
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="6" v-if="hasAkunPerMVO">
                    <v-card color="success" dark class="cursor-pointer" @click="handleShowMvoWithSubordinates()">
                        <v-card-text class="text-center pa-3">
                            <v-icon size="32">mdi-account-network</v-icon>
                            <div class="text-h6 mt-2">
                                {{ summary.akun_per_mvo.length }}
                            </div>
                            <div class="text-caption">
                                MVO dengan Downline
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <!-- List MVO -->
            <v-card v-if="hasAkunPerMVO" class="mt-3">
                <v-card-title class="pa-3">
                    <v-icon class="mr-2">
                        mdi-account-supervisor
                    </v-icon>
                    MVO dengan Downline
                </v-card-title>

                <v-list>
                    <v-list-item v-for="mvo in summary.akun_per_mvo" :key="`mobile-${mvo.mvo_id}`"
                        class="py-3 cursor-pointer" @click="$emit('show-mvo-subordinates', mvo)">

                        <template #prepend>
                            <v-avatar color="teal" size="40">
                                <v-icon color="white">
                                    mdi-account-supervisor
                                </v-icon>
                            </v-avatar>
                        </template>

                        <v-list-item-title class="font-weight-medium">
                            {{ mvo.mvo_nama }}
                        </v-list-item-title>

                        <v-list-item-subtitle>
                            <div class="text-caption mb-1">
                                {{ mvo.mvo_code }}
                            </div>

                            <div class="d-flex gap-1">
                                <v-chip size="x-small" color="teal" variant="tonal">
                                    {{ mvo.total_bawahan }} Downline
                                </v-chip>

                                <v-chip size="x-small" color="amber" variant="tonal">
                                    {{ mvo.total_bintang_jaringan }}
                                </v-chip>
                            </div>
                        </v-list-item-subtitle>

                        <template #append>
                            <v-icon>mdi-chevron-right</v-icon>
                        </template>

                    </v-list-item>
                </v-list>
            </v-card>

        </div>
    </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";

export default {
    name: "DashboardOverview",

    emits: [
        "show-detail",
        "show-mvo-subordinates",
        "show-mvo-detail",
    ],

    data() {
        return {
            dashboardData: { summary: {} },
            mvoRawData: [],
            documentRawData: [],
            isLoading: false,
            topBintangHeaders: [
                { title: "Rank", key: "rank", align: "center", width: 80 },
                { title: "Akun Details", key: "mvo_name" },
                { title: "Total Bintang", key: "total_bintang", align: "center" },
            ],
        };
    },

    created() {
        this.fetchData();
    },

    computed: {
        summary() {
            return this.dashboardData?.summary ?? {};
        },

        hasAkunPerMVO() {
            return (
                this.summary.akun_per_mvo &&
                this.summary.akun_per_mvo.length > 0
            );
        },

        bintangRoles() {
            return [
                {
                    key: "mvo",
                    label: "MVO",
                    icon: "mdi-account",
                    iconColor: "primary",
                },
                {
                    key: "distributor",
                    label: "Distributor",
                    icon: "mdi-store",
                    iconColor: "cyan",
                },
                {
                    key: "lainnya",
                    label: "Lainnya",
                    icon: "mdi-crown",
                    iconColor: "purple",
                },
            ];
        },
    },

    methods: {
        async fetchData() {
            const token = Cookies.get("token");
            if (!token) return;

            this.isLoading = true;
            try {
                const [dashboardResponse, mvoResponse, documentResponse] = await Promise.all([
                    axios.get("https://babaapi.teknosof.com/api/dashboard", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("https://babaapi.teknosof.com/api/mvo", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("https://babaapi.teknosof.com/api/mvo-document", {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                ]);

                if (dashboardResponse.data?.status === "success") {
                    this.dashboardData = dashboardResponse.data.data;
                }
                if (mvoResponse.data?.status === "success") {
                    this.mvoRawData = mvoResponse.data.data;
                }
                if (documentResponse.data?.status === "success") {
                    this.documentRawData = documentResponse.data.data;
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                this.isLoading = false;
            }
        },

        handleShowDetail(type) {
            let data = [];
            switch (type) {
                case 'all_users':
                    data = this.mvoRawData;
                    break;
                case 'all_documents':
                    data = this.documentRawData;
                    break;
                case 'all_regions':
                    data = this.getRegionSummaryData();
                    break;
            }
            this.$emit('show-detail', { type, data });
        },

        handleShowMvoWithSubordinates() {
            this.$emit('show-detail', {
                type: 'all_mvo_with_subordinates',
                data: this.summary.akun_per_mvo || []
            });
        },

        getRegionSummaryData() {
            const regionSummary = [];
            const regions = this.summary?.akun_per_daerah || [];

            regions.forEach(region => {
                const accountsInRegion = this.mvoRawData.filter(account =>
                    account.daerah === region.daerah
                );
                regionSummary.push({
                    id: region.daerah,
                    region_name: region.daerah,
                    total_accounts: region.total,
                    accounts: accountsInRegion,
                });
            });
            return regionSummary;
        },

        handleShowMvoDetail(mvoId) {
            // Implementasi ulang logika dari `findMVOData` milik induk
            let mvoData = this.summary?.top_5_bintang_role?.mvo?.find(item => item.mvo_id === mvoId)
                || this.summary?.top_5_bintang_role?.distributor?.find(item => item.mvo_id === mvoId)
                || this.summary?.top_5_bintang_role?.lainnya?.find(item => item.mvo_id === mvoId);

            if (!mvoData) {
                const mvoInfo = this.mvoRawData.find(item => item.id == mvoId);
                const mvoDocuments = this.documentRawData.filter(item => item.mvo_id == mvoId);
                const totalBintang = mvoDocuments.reduce((sum, doc) => sum + parseInt(doc.pointbintang || 0), 0);

                mvoData = {
                    mvo_id: mvoId,
                    total_bintang: totalBintang,
                    mvo: mvoInfo,
                };
            }
            this.$emit('show-mvo-detail', mvoId, mvoData);
        },

        getRankColor(rank) {
            if (rank === 1) return "amber";
            if (rank === 2) return "grey";
            if (rank === 3) return "orange";
            return "blue";
        },
    },
};
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
</style>
