<template>
    <div class="downline-management">
        <Breadcrumb :items="itemsBreadcrumb" />

        <!-- Header Info Card -->
        <v-card class="upline-info-card mb-4" elevation="3">
            <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between flex-wrap gap-2">
                    <div class="d-flex align-center gap-3">
                        <v-avatar color="#FFD700" size="48" class="avatar-icon">
                            <v-icon color="#1a1a1a" size="28">mdi-sitemap</v-icon>
                        </v-avatar>
                        <div>
                            <div class="text-caption text-grey">ID Anda</div>
                            <div class="font-weight-bold text-h6" style="color: #FFD700;">{{ mvo_id || '-' }}</div>
                        </div>
                    </div>
                    <div class="d-flex align-center gap-3">
                        <v-chip color="#FFD700" text-color="#1a1a1a" class="font-weight-bold" size="large">
                            <v-icon start>mdi-account-group</v-icon>
                            Total Downline: {{ totalDownline }}
                        </v-chip>
                    </div>
                </div>
            </v-card-text>
        </v-card>

        <!-- Desktop View -->
        <div class="d-none d-md-block">
            <CardDataTable :title="title">
                <template v-slot:search>
                    <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Cari Downline..."
                        single-line hide-details variant="outlined" class="search-field" />
                </template>

                <template v-slot:datatable>
                    <v-data-table class="bg-grey-lighten-4 text-no-wrap custom-data-table" hover
                        :headers="datatable.headers" :items="datatable.items" :search="datatable.search"
                        :loading="isTableLoading" :items-per-page="10" @update:options="updateCurrentPageInfo">
                        <template v-slot:item.no="{ index }">
                            {{ ((currentPage - 1) * itemsPerPage) + index + 1 }}
                        </template>

                        <template v-slot:item.upline_1="{ item }">
                            {{ item.upline_1 && item.upline_1 !== '-' ? item.upline_1 : '-' }}
                        </template>

                        <template v-slot:item.upline_2="{ item }">
                            {{ item.upline_2 && item.upline_2 !== '-' ? item.upline_2 : '-' }}
                        </template>

                        <template v-slot:item.upline_3="{ item }">
                            {{ item.upline_3 && item.upline_3 !== '-' ? item.upline_3 : '-' }}
                        </template>

                        <template v-slot:item.upline_4="{ item }">
                            {{ item.upline_4 && item.upline_4 !== '-' ? item.upline_4 : '-' }}
                        </template>

                        <template v-slot:item.upline_5="{ item }">
                            {{ item.upline_5 && item.upline_5 !== '-' ? item.upline_5 : '-' }}
                        </template>

                        <template v-slot:item.upline_6="{ item }">
                            {{ item.upline_6 && item.upline_6 !== '-' ? item.upline_6 : '-' }}
                        </template>

                        <template v-slot:item.created_at="{ item }">
                            {{ formatDate(item.created_at) }}
                        </template>
                    </v-data-table>
                </template>
            </CardDataTable>
        </div>

        <!-- Mobile View -->
        <div class="d-block d-md-none">
            <v-card class="mobile-header-card mb-4">
                <v-card-text>
                    <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Cari downline..."
                        single-line hide-details variant="outlined" class="search-field-mobile" />
                </v-card-text>
            </v-card>

            <v-progress-linear v-if="isTableLoading" indeterminate color="#FFD700" class="mb-4" />

            <div v-if="filteredItems.length === 0 && !isTableLoading" class="text-center pa-6">
                <v-icon size="64" color="grey">mdi-account-group-outline</v-icon>
                <p class="text-grey mt-2">Tidak ada data downline ditemukan</p>
            </div>

            <v-card v-for="(item, index) in filteredItems" :key="item.id" class="mobile-downline-card mb-3"
                @click="toggleMobileDetail(item.id)"
                :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">
                <!-- Card Header -->
                <v-card-text class="mobile-card-header">
                    <v-row no-gutters align="center">
                        <v-col cols="2" class="text-center">
                            <v-avatar color="#1a1a1a" size="36">
                                <span class="text-caption font-weight-bold" style="color: #FFD700;">{{ index + 1
                                }}</span>
                            </v-avatar>
                        </v-col>
                        <v-col cols="8" class="pl-3">
                            <div class="mobile-name font-weight-bold">{{ item.nama }}</div>
                            <div class="mobile-code text-caption" style="color: #FFD700;">{{ item.code }}</div>
                            <div class="text-caption text-grey">{{ item.no_id || '-' }}</div>
                        </v-col>
                        <v-col cols="2" class="text-center">
                            <v-icon :class="{ 'rotate-180': expandedMobileCard === item.id }" class="transition-all">
                                mdi-chevron-down
                            </v-icon>
                        </v-col>
                    </v-row>
                </v-card-text>

                <!-- Card Detail - Expandable -->
                <v-expand-transition>
                    <div v-show="expandedMobileCard === item.id">
                        <v-divider />
                        <v-card-text class="mobile-card-details">

                            <!-- Personal Info -->
                            <div class="mobile-info-section mb-3">
                                <h4 class="text-subtitle-2 mb-2" style="color: #125C13;">
                                    <v-icon size="16" class="mr-1">mdi-account</v-icon>
                                    Informasi Personal
                                </h4>
                                <v-row class="mb-1" dense>
                                    <v-col cols="5" class="detail-label">Nama Panggilan:</v-col>
                                    <v-col cols="7" class="detail-value">{{ item.nama_panggilan || '-' }}</v-col>
                                </v-row>
                                <v-row class="mb-1" dense>
                                    <v-col cols="5" class="detail-label">No ID:</v-col>
                                    <v-col cols="7" class="detail-value">{{ item.no_id || '-' }}</v-col>
                                </v-row>
                                <v-row class="mb-1" dense>
                                    <v-col cols="5" class="detail-label">Provinsi:</v-col>
                                    <v-col cols="7" class="detail-value">{{ item.province_code || '-' }}</v-col>
                                </v-row>
                                <v-row class="mb-1" dense>
                                    <v-col cols="5" class="detail-label">Tgl Bergabung:</v-col>
                                    <v-col cols="7" class="detail-value">{{ formatDate(item.created_at) }}</v-col>
                                </v-row>
                            </div>

                            <!-- Upline Info -->
                            <div class="mobile-info-section mb-2">
                                <h4 class="text-subtitle-2 mb-2" style="color: #125C13;">
                                    <v-icon size="16" class="mr-1">mdi-account-arrow-up</v-icon>
                                    Jaringan Upline
                                </h4>
                                <v-row class="mb-1" dense v-if="item.upline_1 && item.upline_1 !== '-'">
                                    <v-col cols="4" class="detail-label">MVO:</v-col>
                                    <v-col cols="8" class="detail-value">{{ item.upline_1 }}</v-col>
                                </v-row>
                                <v-row class="mb-1" dense v-if="item.upline_2 && item.upline_2 !== '-'">
                                    <v-col cols="4" class="detail-label">Regional:</v-col>
                                    <v-col cols="8" class="detail-value">{{ item.upline_2 }}</v-col>
                                </v-row>
                                <v-row class="mb-1" dense v-if="item.upline_3 && item.upline_3 !== '-'">
                                    <v-col cols="4" class="detail-label">Founder:</v-col>
                                    <v-col cols="8" class="detail-value">{{ item.upline_3 }}</v-col>
                                </v-row>
                                <v-row class="mb-1" dense v-if="item.upline_4 && item.upline_4 !== '-'">
                                    <v-col cols="4" class="detail-label">Gen. Manager:</v-col>
                                    <v-col cols="8" class="detail-value">{{ item.upline_4 }}</v-col>
                                </v-row>
                                <v-row class="mb-1" dense v-if="item.upline_5 && item.upline_5 !== '-'">
                                    <v-col cols="4" class="detail-label">Supplier:</v-col>
                                    <v-col cols="8" class="detail-value">{{ item.upline_5 }}</v-col>
                                </v-row>
                                <v-row class="mb-1" dense v-if="item.upline_6 && item.upline_6 !== '-'">
                                    <v-col cols="4" class="detail-label">Distributor:</v-col>
                                    <v-col cols="8" class="detail-value">{{ item.upline_6 }}</v-col>
                                </v-row>
                            </div>

                        </v-card-text>
                    </div>
                </v-expand-transition>
            </v-card>
        </div>

        <!-- Snackbar -->
        <v-snackbar v-model="contentSnackbar.snackbar" :color="contentSnackbar.color">
            {{ contentSnackbar.text }}
        </v-snackbar>
    </div>
</template>

<script>
import { API_URL } from "@/config";
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import CardDataTable from "@/components/ui/CardDataTable.vue";
import { useAppStore } from "@/stores/app.js";
import axios from "axios";
import Cookies from "js-cookie";

export default {
    name: "DownlineManagement",
    components: {
        Breadcrumb,
        CardDataTable,
    },

    setup() {
        const app = useAppStore();
        return { app };
    },

    data() {
        return {
            mvo_id: "",
            totalDownline: 0,
            expandedMobileCard: null,
            isTableLoading: true,
            currentPage: 1,
            itemsPerPage: 10,

            title: "DATA DOWNLINE",
            itemsBreadcrumb: [
                {
                    title: "Dashboard",
                    disabled: false,
                    href: "/admin/dashboard",
                },
                {
                    title: "Downline",
                    disabled: false,
                    href: "/admin/downline",
                },
            ],

            contentSnackbar: {
                snackbar: false,
                text: "",
                color: "",
            },

            datatable: {
                search: "",
                headers: [
                    { key: "no", title: "No", sortable: false },
                    { key: "code", title: "Kode", fixed: "start", width: "120px" },
                    { key: "no_id", title: "No ID", width: "100px" },
                    { key: "nama", title: "Nama", width: "160px" },
                    { key: "nama_panggilan", title: "Nama Panggilan" },
                    { key: "province_code", title: "Provinsi" },
                    { key: "upline_1", title: "MVO" },
                    { key: "upline_2", title: "Regional" },
                    { key: "upline_3", title: "Founder" },
                    { key: "upline_4", title: "General Manager" },
                    { key: "upline_5", title: "Supplier" },
                    { key: "upline_6", title: "Distributor" },
                    { key: "created_at", title: "Tgl Bergabung" },
                ],
                items: [],
            },
        };
    },

    computed: {
        filteredItems() {
            if (!this.datatable.search) return this.datatable.items;

            const searchTerm = this.datatable.search.toLowerCase();
            return this.datatable.items.filter((item) =>
                (item.nama && item.nama.toLowerCase().includes(searchTerm)) ||
                (item.code && item.code.toLowerCase().includes(searchTerm)) ||
                (item.no_id && item.no_id.toLowerCase().includes(searchTerm)) ||
                (item.nama_panggilan && item.nama_panggilan.toLowerCase().includes(searchTerm)) ||
                (item.province_code && item.province_code.toLowerCase().includes(searchTerm))
            );
        },
    },

    methods: {
        formatDate(dateString) {
            if (!dateString) return "-";
            return new Date(dateString).toLocaleDateString("id-ID");
        },

        showSnackbar(message, color = "primary") {
            this.contentSnackbar.snackbar = true;
            this.contentSnackbar.text = message;
            this.contentSnackbar.color =
                color === "primary" ? this.app.colors.primary : this.app.colors.secondary;
        },

        getAuthHeaders() {
            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return null;
            }
            return {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            };
        },

        updateCurrentPageInfo(options) {
            this.currentPage = options.page;
            this.itemsPerPage = options.itemsPerPage;
        },

        toggleMobileDetail(itemId) {
            this.expandedMobileCard = this.expandedMobileCard === itemId ? null : itemId;
        },

        async getAllDownline() {
            const headers = this.getAuthHeaders();
            if (!headers) return;

            if (!this.mvo_id) {
                this.showSnackbar("ID tidak ditemukan di sesi login", "error");
                this.isTableLoading = false;
                return;
            }

            this.isTableLoading = true;
            try {
                const response = await axios.get(
                    `${API_URL}/api/downline/${this.mvo_id}`,
                    { headers }
                );

                if (response.data.status === "success") {
                    this.datatable.items = response.data.data || [];
                    this.totalDownline = response.data.total_downline || 0;
                } else {
                    this.showSnackbar(response.data.message || "Error loading data", "error");
                }
            } catch (error) {
                this.showSnackbar(
                    error.response?.data?.message || "Error loading downline data",
                    "error"
                );
            } finally {
                this.isTableLoading = false;
            }
        },
    },

    created() {
        this.mvo_id = localStorage.getItem("mvo_id") || "";
        this.getAllDownline();
    },
};
</script>

<style scoped>
.downline-management {
    padding: 16px;
}

/* Upline info card */
.upline-info-card {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    border: 1px solid #FFD700;
    border-radius: 12px;
}

.upline-info-card .text-grey {
    color: #aaa !important;
}

.upline-info-card .text-h6 {
    line-height: 1.2;
}

.gap-2 {
    gap: 8px;
}

.gap-3 {
    gap: 12px;
}

/* Data table styles */
:deep(.custom-data-table) {
    border: 1px solid #000000;
}

:deep(.custom-data-table .v-data-table__th) {
    background-color: #888888 !important;
    color: #FFD700 !important;
    font-weight: bold;
}

/* Mobile card styles */
.mobile-downline-card {
    border-left: 4px solid #FFD700;
    border-radius: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
}

.mobile-downline-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.mobile-card-expanded {
    border-left-color: #125C13;
}

.mobile-card-header {
    padding: 12px 16px !important;
}

.mobile-name {
    font-size: 15px;
    color: #1a1a1a;
    line-height: 1.3;
}

.mobile-code {
    font-size: 13px;
    font-weight: 600;
}

.mobile-card-details {
    padding: 12px 16px !important;
    background-color: #fafafa;
}

.mobile-info-section {
    background-color: #f5f5f5;
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
}

.detail-label {
    font-size: 12px;
    color: #666;
    font-weight: 500;
}

.detail-value {
    font-size: 13px;
    font-weight: 500;
    color: #1a1a1a;
    word-break: break-word;
}

.transition-all {
    transition: transform 0.3s ease;
}

.rotate-180 {
    transform: rotate(180deg);
}

/* Mobile header */
.mobile-header-card {
    border-radius: 8px;
}
</style>