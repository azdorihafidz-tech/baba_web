<template>
    <div>

        <!-- ================= DESKTOP VIEW ================= -->
        <div class="d-none d-md-block">

            <!-- ===== SUMMARY CARD ===== -->
            <v-row class="mb-4">

                <!-- TOTAL -->
                <v-col cols="12" md="4">
                    <v-card color="primary" dark @click="handleShowDetail('all_documents')" style="cursor:pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">
                                mdi-file-document-multiple
                            </v-icon>

                            <div class="text-h4">
                                {{ dashboardData.summary.documents.total_document }}
                            </div>

                            <div>Total Documents</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- APPROVED -->
                <v-col cols="12" md="4">
                    <v-card color="success" dark @click="handleShowDetail('total_approved_documents')"
                        style="cursor:pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">
                                mdi-check-circle
                            </v-icon>

                            <div class="text-h4">
                                {{ dashboardData.summary.documents.total_approved }}
                            </div>

                            <div>Approved</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- PENDING -->
                <v-col cols="12" md="4">
                    <v-card color="orange" dark @click="handleShowDetail('total_pending_documents')"
                        style="cursor:pointer;">
                        <v-card-text class="text-center">
                            <v-icon size="48" class="mb-2">
                                mdi-clock-outline
                            </v-icon>

                            <div class="text-h4">
                                {{ dashboardData.summary.documents.total_pending }}
                            </div>

                            <div>Pending</div>
                        </v-card-text>
                    </v-card>
                </v-col>

            </v-row>

            <!-- ===== STATISTICS ===== -->
            <v-card class="mb-4">
                <v-card-title>
                    Document Status Statistics
                </v-card-title>

                <v-card-text>
                    <v-row>

                        <!-- PROGRESS -->
                        <v-col cols="12" md="6">

                            <!-- APPROVED -->
                            <div class="d-flex align-center mb-3">
                                <v-progress-linear :model-value="getDocumentPercentage('total_approved')"
                                    color="success" height="25" rounded class="mr-3">
                                    <span class="text-white font-weight-bold">
                                        {{ getDocumentPercentage('total_approved').toFixed(1) }}%
                                    </span>
                                </v-progress-linear>

                                <span>Approved</span>
                            </div>

                            <!-- PENDING -->
                            <div class="d-flex align-center">
                                <v-progress-linear :model-value="getDocumentPercentage('total_pending')" color="orange"
                                    height="25" rounded class="mr-3">
                                    <span class="text-white font-weight-bold">
                                        {{ getDocumentPercentage('total_pending').toFixed(1) }}%
                                    </span>
                                </v-progress-linear>

                                <span>Pending</span>
                            </div>

                        </v-col>

                        <!-- SUMMARY TEXT -->
                        <v-col cols="12" md="6">
                            <v-card flat color="grey-lighten-4" class="pa-4">

                                <div class="text-h6 mb-2">
                                    Summary
                                </div>

                                <div class="d-flex justify-space-between">
                                    <span>Total</span>
                                    <b>
                                        {{ dashboardData.summary.documents.total_document }}
                                    </b>
                                </div>

                                <div class="d-flex justify-space-between">
                                    <span>Approved</span>
                                    <b class="text-success">
                                        {{ dashboardData.summary.documents.total_approved }}
                                    </b>
                                </div>

                                <div class="d-flex justify-space-between">
                                    <span>Pending</span>
                                    <b class="text-orange">
                                        {{ dashboardData.summary.documents.total_pending }}
                                    </b>
                                </div>

                            </v-card>
                        </v-col>

                    </v-row>
                </v-card-text>
            </v-card>

        </div>

        <!-- ================= MOBILE VIEW ================= -->
        <div class="d-block d-md-none">
            <v-row dense class="mb-3">

                <v-col cols="4">
                    <v-card color="primary" dark class="text-center" @click="handleShowDetail('all_documents')">
                        <v-card-text class="pa-2">
                            <v-icon size="20">
                                mdi-file-document-multiple
                            </v-icon>

                            <div class="text-h6 mt-1">
                                {{ dashboardData.summary.documents.total_document }}
                            </div>

                            <div class="text-caption">Total</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card color="success" dark class="text-center"
                        @click="handleShowDetail('total_approved_documents')">
                        <v-card-text class="pa-2">
                            <v-icon size="20">
                                mdi-check-circle
                            </v-icon>

                            <div class="text-h6 mt-1">
                                {{ dashboardData.summary.documents.total_approved }}
                            </div>

                            <div class="text-caption">Approved</div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="4">
                    <v-card color="orange" dark class="text-center"
                        @click="handleShowDetail('total_pending_documents')">
                        <v-card-text class="pa-2">
                            <v-icon size="20">
                                mdi-clock-outline
                            </v-icon>

                            <div class="text-h6 mt-1">
                                {{ dashboardData.summary.documents.total_pending }}
                            </div>

                            <div class="text-caption">Pending</div>
                        </v-card-text>
                    </v-card>
                </v-col>

            </v-row>

            <!-- ===== STATISTICS MOBILE ===== -->
            <v-card class="mb-3">
                <v-card-title class="text-subtitle-2 font-weight-bold">
                    Document Status Statistics
                </v-card-title>
                <v-card-text>
                    <div class="mb-4">
                        <div class="d-flex align-center mb-2">
                            <v-progress-linear :model-value="getDocumentPercentage('total_approved')" color="success"
                                height="20" rounded class="mr-3">
                                <span class="text-white text-caption font-weight-bold">
                                    {{ getDocumentPercentage('total_approved').toFixed(1) }}%
                                </span>
                            </v-progress-linear>
                            <span class="text-caption">Approved</span>
                        </div>
                        <div class="d-flex align-center">
                            <v-progress-linear :model-value="getDocumentPercentage('total_pending')" color="orange"
                                height="20" rounded class="mr-3">
                                <span class="text-white text-caption font-weight-bold">
                                    {{ getDocumentPercentage('total_pending').toFixed(1) }}%
                                </span>
                            </v-progress-linear>
                            <span class="text-caption">Pending</span>
                        </div>
                    </div>
                    <v-card flat color="grey-lighten-4" class="pa-3">
                        <div class="text-subtitle-2 mb-2">Summary</div>
                        <div class="d-flex justify-space-between text-caption mb-1">
                            <span>Total</span>
                            <b>{{ dashboardData.summary.documents.total_document }}</b>
                        </div>
                        <div class="d-flex justify-space-between text-caption mb-1">
                            <span>Approved</span>
                            <b class="text-success">{{ dashboardData.summary.documents.total_approved }}</b>
                        </div>
                        <div class="d-flex justify-space-between text-caption">
                            <span>Pending</span>
                            <b class="text-orange">{{ dashboardData.summary.documents.total_pending }}</b>
                        </div>
                    </v-card>
                </v-card-text>
            </v-card>
        </div>

        <!-- ================= DETAIL TABLE DIALOG ================= -->
        <v-dialog v-model="detailDialog" max-width="1200px" scrollable>
            <v-card>
                <v-card-title class="d-flex align-center justify-space-between">
                    <span>{{ detailTitle }}</span>
                    <v-btn icon @click="detailDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-divider></v-divider>

                <!-- EXPORT BUTTON -->
                <v-card-text class="text-center pa-4">
                    <v-btn color="success" prepend-icon="mdi-microsoft-excel" @click="exportToExcel"
                        :loading="exporting">
                        Export to Excel
                    </v-btn>
                </v-card-text>

                <v-divider></v-divider>

                <!-- TABLE -->
                <v-card-text style="max-height: 500px;">
                    <v-text-field v-model="detailSearch" prepend-inner-icon="mdi-magnify" label="Search" single-line
                        hide-details variant="outlined" density="compact" class="mb-4 sticky-search"></v-text-field>

                    <!-- Desktop View -->
                    <div class="d-none d-md-block">
                        <v-data-table :headers="tableHeaders" :items="processedDetailData" :items-per-page="10"
                            class="elevation-1 bg-grey-lighten-4" density="comfortable">
                            <!-- Status Column with Chip -->
                            <template v-slot:item.status_inputan="{ item }">
                                <v-chip :color="getStatusColor(item.status_inputan)" size="small" dark>
                                    {{ getStatusText(item.status_inputan) }}
                                </v-chip>
                            </template>

                            <!-- No data template -->
                            <template v-slot:no-data>
                                <div class="text-center pa-4">
                                    <v-icon size="64" color="grey">mdi-file-document-outline</v-icon>
                                    <div class="text-h6 mt-2">No documents found</div>
                                </div>
                            </template>
                        </v-data-table>
                    </div>

                    <!-- Mobile View -->
                    <div class="d-block d-md-none">
                        <v-card v-for="(item, index) in processedDetailData" :key="index" class="mb-3"
                            variant="outlined" :color="getStatusColor(item.status_inputan)">
                            <v-card-text>
                                <div class="d-flex justify-space-between align-center mb-2">
                                    <div class="font-weight-bold text-truncate">{{ item.nama }}</div>
                                    <v-chip :color="getStatusColor(item.status_inputan)" size="x-small" dark>
                                        {{ getStatusText(item.status_inputan) }}
                                    </v-chip>
                                </div>
                                <div class="text-caption">Code: {{ item.code }}</div>
                                <div class="text-caption">Prov: {{ item.province_code }}</div>
                                <div class="text-caption">Jabatan: {{ item.jabatan }}</div>
                                <v-divider class="my-2"></v-divider>
                                <div class="d-flex justify-space-between">
                                    <div class="text-caption">Point: {{ item.pointbintang }}</div>
                                    <div class="text-caption">RO: {{ item.repeat_order }}</div>
                                </div>
                            </v-card-text>
                        </v-card>
                        <div v-if="processedDetailData.length === 0" class="text-center pa-4">
                            <v-icon size="64" color="grey">mdi-file-document-outline</v-icon>
                            <div class="text-caption mt-2">No documents found</div>
                        </div>
                    </div>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="text" @click="detailDialog = false">
                        Close
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";

export default {
    name: "DashboardDocuments",
    emits: ["show-detail"],

    data() {
        return {
            mvoTypeId: null, // tambahkan ini

            dashboardData: {
                summary: {
                    documents: {
                        total_document: 0,
                        total_approved: 0,
                        total_pending: 0,
                    },
                },
            },

            documentRawData: [],

            cabang: null,
            detailSearch: "",

            // Detail Dialog
            detailDialog: false,
            detailTitle: "",
            detailData: [],
            detailType: "",
            exporting: false,

            // Table Headers
            tableHeaders: [
                { title: "No", key: "no", sortable: false, width: "60px" },
                { title: "Code", key: "code", sortable: true },
                { title: "Nama", key: "nama", sortable: true },
                { title: "Province Code", key: "province_code", sortable: true },
                { title: "Point Bintang", key: "pointbintang", sortable: true },
                { title: "Repeat Order", key: "repeat_order", sortable: true },
                { title: "jabatan", key: "jabatan", sortable: true },
                { title: "Status", key: "status_inputan", sortable: true },
            ],
        };
    },

    computed: {
        processedDetailData() {
            let data = this.detailData;
            if (this.detailSearch) {
                const search = this.detailSearch.toLowerCase();
                data = this.detailData.filter(item =>
                    (item.code && item.code.toLowerCase().includes(search)) ||
                    (item.nama && item.nama.toLowerCase().includes(search)) ||
                    (item.province_code && item.province_code.toLowerCase().includes(search)) ||
                    (item.jabatan && item.jabatan.toLowerCase().includes(search))
                );
            }
            return data.map((item, index) => ({ ...item, no: index + 1 }));
        },
    },

    created() {
        this.initUser();
        this.fetchData();
    },

    methods: {

        // ================= INIT USER =================
        initUser() {

            const user =
                JSON.parse(localStorage.getItem("user"));

            if (!user) return;

            this.mvo_type_id =
                user.mvo_type_id ||
                null;

            // Hanya set cabang kalau bukan superadmin
            if (this.mvo_type_id !== "superadmin") {

                this.cabang =
                    user.cabang ||
                    user.province_code ||
                    null;
            }
        },
        async fetchData() {

            const token =
                Cookies.get("token") ||
                localStorage.getItem("token");

            if (!token) return;

            let url = "";

            if (this.mvo_type_id === "superadmin") {

                // SUPERADMIN → Semua data
                url =
                    `https://babaapi.babaparfume.id/api/dashboard/document`;

            } else {

                // NON SUPERADMIN → Wajib ada cabang
                if (!this.cabang) {
                    console.warn(
                        "Cabang user tidak ada → API tidak dipanggil"
                    );
                    return;
                }

                url =
                    `https://babaapi.babaparfume.id/api/dashboard/document/${this.cabang}`;
            }

            // ================= CALL API =================
            try {

                const res = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data.status === "success") {

                    this.dashboardData.summary.documents =
                        res.data.summary || {};

                    this.documentRawData =
                        res.data.data || [];
                }

            } catch (err) {

                console.error(
                    "Fetch dashboard error:",
                    err
                );
            }
        },
        handleShowDetail(type) {
            let data = [];
            let title = "";

            switch (type) {

                case "all_documents":
                    data = [...this.documentRawData];
                    title = "All Documents";
                    break;

                case "total_approved_documents":
                    data =
                        this.documentRawData.filter(
                            i =>
                                i.status_inputan === "approved"
                        );
                    title = "Approved Documents";
                    break;

                case "total_pending_documents":
                    data =
                        this.documentRawData.filter(
                            i =>
                                i.status_inputan === null ||
                                i.status_inputan === "pending" ||
                                i.status_inputan === undefined
                        );
                    title = "Pending Documents";
                    break;
            }

            this.detailData = data.map((item, index) => ({
                ...item,
                no: index + 1
            }));

            this.detailTitle = title;
            this.detailType = type;
            this.detailDialog = true;
            this.$emit(
                "show-detail",
                { type, data }
            );
        },

        getStatusColor(status) {
            if (status === "approved") return "success";
            if (status === "pending") return "orange";
            if (!status) return "grey";
            return "grey";
        },

        getStatusText(status) {
            if (status === "approved") return "Approved";
            if (status === "pending") return "Pending";
            if (!status) return "Pending";
            return status || "Unknown";
        },

        getDocumentPercentage(type) {

            const total =
                Number(
                    this.dashboardData.summary.documents
                        .total_document
                ) || 0;

            if (!total) return 0;

            const value =
                Number(
                    this.dashboardData.summary.documents[type]
                ) || 0;

            return (value / total) * 100;
        },
        exportToExcel() {
            this.exporting = true;

            // ===== Ambil header yang tampil =====
            const headers = this.tableHeaders;

            // ===== Mapping data sesuai header =====
            const data = this.processedDetailData.map(row => {

                let obj = {};

                headers.forEach(h => {

                    let value = row[h.key];

                    // Custom formatting jika perlu
                    if (h.key === "status_inputan") {
                        value = this.getStatusText(value);
                    }

                    obj[h.title] = value ?? "-";
                });

                return obj;
            });

            // ===== Convert ke Excel =====
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(wb, ws, "Documents");

            const fileName =
                `${this.detailTitle.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;

            XLSX.writeFile(wb, fileName);

            this.exporting = false;
        }
    },
};
</script>

<style scoped>
.v-data-table {
    font-size: 0.875rem;
}

:deep(.v-data-table) {
    border: 1px solid #000000;
}

:deep(.v-data-table__th) {
    background-color: #888888 !important;
    color: #FFD700 !important;
    font-weight: bold;
}

.sticky-search {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: white;
}
</style>