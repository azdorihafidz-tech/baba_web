<template>
    <div>

        <!-- ================= SUMMARY CARD - TAMPIL DI SEMUA LAYAR ================= -->
        <v-row class="mb-4">
            <v-col cols="6" sm="6" md="3">
                <v-card color="purple" dark @click="navigateToTab('accounts')" style="cursor:pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="36" class="mb-2">mdi-account-group</v-icon>
                        <div class="text-h6 text-md-h4">
                            {{ summary.jumlahakun ?? 0 }}
                        </div>
                        <div class="text-caption text-md-subtitle-1">
                            Total Akun
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="6" sm="6" md="3">
                <v-card color="primary" dark @click="navigateToTab('documents')" style="cursor:pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="36" class="mb-2">mdi-file-document-multiple</v-icon>
                        <div class="text-h6 text-md-h4">
                            {{ summary.jumlahdokumen ?? 0 }}
                        </div>
                        <div class="text-caption text-md-subtitle-1">
                            Total Dokumen
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="6" sm="6" md="3">
                <v-card color="info" dark @click="navigateToTab('regions')" style="cursor:pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="36" class="mb-2">mdi-map-marker-multiple</v-icon>
                        <div class="text-h6 text-md-h4">
                            {{ summary.akun_per_province?.length ?? 0 }}
                        </div>
                        <div class="text-caption text-md-subtitle-1">
                            Total Provinsi
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="6" sm="6" md="3">
                <v-card color="amber" dark @click="navigateToTab('star')" style="cursor:pointer;">
                    <v-card-text class="text-center">
                        <v-icon size="36" class="mb-2">mdi-star</v-icon>
                        <div class="text-h6 text-md-h4">
                            {{ summary.total_bintang_approved ?? 0 }}
                        </div>
                        <div class="text-caption text-md-subtitle-1">
                            Total Bintang
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <div class="d-none d-md-block">
            <v-card class="mb-4" v-for="role in bintangRoles" :key="role.key">
                <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2" :color="role.iconColor">
                        mdi-star
                    </v-icon>
                    Top 5 Bintang — {{ role.label }}
                </v-card-title>

                <v-card-text>
                    <v-data-table class="bg-grey-lighten-4 text-no-wrap" :headers="topBintangHeaders" :items="role.data"
                        :loading="isLoading" item-key="code" :items-per-page="5" hide-default-footer>

                        <!-- RANK -->
                        <template #item.rank="{ index }">
                            <v-chip :color="getRankColor(index + 1)" dark size="small">
                                {{ index + 1 }}
                            </v-chip>
                        </template>

                        <!-- NAMA -->
                        <template #item.mvo_name="{ item }">
                            <div class="font-weight-medium" @click="$emit('show-mvo-detail', item.code, item)"
                                style="cursor:pointer;">
                                {{ item.nama ?? 'N/A' }}
                            </div>
                            <div class="text-caption text-grey">
                                {{ item.code ?? 'N/A' }} • {{ item.cabang ?? 'N/A' }}
                            </div>
                        </template>

                        <!-- BINTANG -->
                        <template #item.total_bintang="{ item }">
                            <div class="d-flex align-center justify-center">
                                <v-chip color="amber" dark size="small">
                                    <v-icon left size="14">mdi-star</v-icon>
                                    {{ item.total_bintang || 0 }}
                                </v-chip>
                            </div>
                        </template>

                        <!-- JUMLAH RO -->
                        <template #item.jumlah_ro="{ item }">
                            <div class="text-center">
                                {{ item.jumlah_ro || 0 }}
                            </div>
                        </template>

                    </v-data-table>
                </v-card-text>
            </v-card>

        </div>

        <!-- ================= MOBILE VIEW ================= -->
        <div class="d-block d-md-none">

            <v-card class="mt-3" v-for="role in bintangRoles" :key="'mobile-' + role.key">
                <v-card-title class="pa-3">
                    <v-icon class="mr-2" :color="role.iconColor">
                        mdi-star
                    </v-icon>
                    Top 5 Bintang — {{ role.label }}
                </v-card-title>

                <v-card-text class="pa-0">
                    <v-list>

                        <!-- EMPTY STATE -->
                        <v-list-item v-if="!role.data.length">
                            <v-list-item-title class="text-center text-grey">
                                Tidak ada data
                            </v-list-item-title>
                        </v-list-item>

                        <!-- DATA -->
                        <v-list-item v-for="(item, index) in role.data" :key="item.code"
                            @click="$emit('show-mvo-detail', item.code, item)" style="cursor:pointer;" class="py-3">

                            <template v-slot:prepend>
                                <v-chip :color="getRankColor(index + 1)" dark size="small" class="mr-3">
                                    {{ index + 1 }}
                                </v-chip>
                            </template>

                            <v-list-item-title class="font-weight-medium">
                                {{ item.nama || 'N/A' }}
                            </v-list-item-title>

                            <v-list-item-subtitle class="text-caption">
                                {{ item.code }} • {{ item.cabang }}
                            </v-list-item-subtitle>

                            <template v-slot:append>
                                <v-chip color="amber" dark size="small">
                                    <v-icon left size="14">mdi-star</v-icon>
                                    {{ item.total_bintang || 0 }}
                                </v-chip>
                            </template>

                        </v-list-item>

                    </v-list>
                </v-card-text>
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
        "show-mvo-detail",
        "navigate-to-tab"
    ],

    data() {
        return {
            dashboardData: { summary: {} },
            isLoading: false,

            topBintangHeaders: [
                { title: "Rank", key: "rank", align: "center", width: 80 },
                { title: "Akun Details", key: "mvo_name" },
                { title: "code", key: "code" },
                { title: "cabang", key: "cabang" },
                { title: "Total Bintang", key: "total_bintang", align: "center" },
                { title: "Jumlah RO", key: "jumlah_ro", align: "center" },
            ],

            // Warna dinamis untuk role
            colorPalette: [
                'primary', 'cyan', 'purple', 'green', 'indigo',
                'orange', 'teal', 'pink', 'deep-purple', 'blue-grey'
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

        /* ===== ROLE DINAMIS dari ranking_mvo ===== */
        bintangRoles() {
            const rankingMvo = this.summary?.ranking_mvo;

            if (!rankingMvo || !Array.isArray(rankingMvo)) return [];

            // ✅ Urutan jabatan yang diinginkan
            const jabatanOrder = [
                "MVO",
                "REGIONAL",
                "FO",
                "GM",
                "SUPPLIER",
                "DIST",
                "SELL"
            ];

            // Group by jabatan
            const groupedByJabatan = rankingMvo.reduce((acc, item) => {
                const jabatan = item.jabatan || "LAINNYA";

                if (!acc[jabatan]) {
                    acc[jabatan] = [];
                }

                acc[jabatan].push(item);
                return acc;
            }, {});

            // ✅ Ikuti urutan jabatanOrder
            return jabatanOrder
                .filter(jabatan => groupedByJabatan[jabatan]) // hanya tampil jika ada data
                .map((jabatan, index) => {

                    const sortedData = groupedByJabatan[jabatan]
                        .sort((a, b) => parseInt(b.total_bintang || 0) - parseInt(a.total_bintang || 0))
                        .slice(0, 5);

                    return {
                        key: jabatan,
                        label: jabatan,
                        iconColor: this.getColorByIndex(index),
                        data: sortedData
                    };
                });
        }


    },

    methods: {

        /* ===== FETCH DATA ===== */
        async fetchData() {
            const token = Cookies.get("token");
            if (!token) return;

            this.isLoading = true;

            try {
                const res = await axios.get(
                    "https://babaapi.teknosof.com/api/dashboard",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (res.data?.status === "success") {
                    this.dashboardData = res.data.data;
                }

            } catch (err) {
                console.error("Error fetch dashboard:", err);
            } finally {
                this.isLoading = false;
            }
        },

        /* ===== NAVIGATE TO TAB ===== */
        navigateToTab(section) {
            this.$emit('navigate-to-tab', section);
        },

        /* ===== GENERATE COLOR BY INDEX ===== */
        getColorByIndex(index) {
            return this.colorPalette[index % this.colorPalette.length];
        },

        /* ===== RANK COLOR ===== */
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
/* Optional: Tambahkan styling khusus mobile jika diperlukan */
@media (max-width: 600px) {
    .v-card-text .text-h6 {
        font-size: 1rem !important;
    }

    .v-card-text .v-icon {
        font-size: 24px !important;
    }
}
</style>