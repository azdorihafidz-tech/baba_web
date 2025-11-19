<template>
    <div>
        <!-- Special handling for region summary -->
        <v-data-table v-if="detailType === 'all_regions'" :headers="regionSummaryHeaders" :items="detailData"
            :loading="isLoading" class="elevation-0" :items-per-page="10">
            <template v-slot:item.region_name="{ item }">
                <div class="d-flex align-center">
                    <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
                    <span class="font-weight-medium cursor-pointer text-primary"
                        @click="$emit('show-region-accounts', item.region_name, item)" style="cursor: pointer;">
                        {{ item.region_name }}
                    </span>
                </div>
            </template>

            <template v-slot:item.total_accounts="{ item }">
                <v-chip color="primary" dark>
                    {{ item.total_accounts }}
                </v-chip>
            </template>

            <template v-slot:item.approved_accounts="{ item }">
                <v-chip color="success" dark size="small">
                    {{ item.approved_accounts }}
                </v-chip>
            </template>

            <template v-slot:item.pending_accounts="{ item }">
                <v-chip color="orange" dark size="small">
                    {{ item.pending_accounts }}
                </v-chip>
            </template>
        </v-data-table>

        <!-- Regular table for other types -->
        <v-data-table v-else :headers="getDetailHeaders()" :items="detailData" :loading="isLoading" class="elevation-0"
            :items-per-page="10">

            <template v-slot:item.mvo_type="{ item }" v-if="isAccountType(detailType)">
                <v-chip :color="getMvoTypeColor(item.mvo_type_id)" dark size="small">
                    {{ getMvoTypeName(item.mvo_type_id) }}
                </v-chip>
            </template>

            <template v-slot:item.status_inputan="{ item }">
                <v-chip :color="getStatusColor(item.status_inputan)" dark size="small">
                    {{ getStatusText(item.status_inputan) }}
                </v-chip>
            </template>

            <template v-slot:item.class_member="{ item }" v-if="isAccountType(detailType)">
                <v-chip :color="getClassColor(item.class_member)" dark size="small">
                    {{ item.class_member || 'N/A' }}
                </v-chip>
            </template>

            <template v-slot:item.tgl_lahir="{ item }" v-if="isAccountType(detailType)">
                {{ formatDate(item.tgl_lahir) }}
            </template>

            <template v-slot:item.pointbintang="{ item }" v-if="isDocumentType(detailType)">
                <v-chip color="amber" dark size="small">
                    <v-icon left size="16">mdi-star</v-icon>
                    {{ item.pointbintang }}
                </v-chip>
            </template>
        </v-data-table>
    </div>
</template>

<script>
export default {
    name: 'DesktopDetailView',
    props: {
        detailType: String,
        detailData: Array,
        isLoading: Boolean
    },
    emits: ['show-region-accounts'],
    data() {
        return {
            regionSummaryHeaders: [
                { title: "Region", key: "region_name" },
                { title: "Total Akun Per daerah", key: "total_accounts", align: "center" },
            ],
            mvoHeaders: [
                { title: "Code", key: "code" },
                { title: "Nama", key: "nama" },
                { title: "Nama Panggilan", key: "nama_panggilan" },
                { title: "Nomor ID", key: "nomor_id" },
                { title: "NIK", key: "nik" },
                { title: "Tempat Lahir", key: "tempat_lahir" },
                { title: "Tgl Lahir", key: "tgl_lahir" },
                { title: "Class", key: "class_member", align: "center" },
                { title: "Alamat", key: "alamat" },
                { title: "No HP", key: "nohp" },
                { title: "Sosmed", key: "sosmed" },
                { title: "Jaringan MVO", key: "jaringan_mvo" },
                { title: "Level", key: "level", align: "center" },
                { title: "Status", key: "status_inputan", align: "center" },
            ],
            documentHeaders: [
                { title: "Nama File", key: "file_name" },
                { title: "Bintang", key: "pointbintang", align: "center" },
                { title: "Status", key: "status_inputan", align: "center" },
            ]
        }
    },
    methods: {
        getDetailHeaders() {
            if (this.detailType === 'all_regions') {
                return this.regionSummaryHeaders;
            } else if (this.isAccountType(this.detailType) ||
                this.detailType === 'region_accounts') {
                return this.mvoHeaders;
            } else if (this.isDocumentType(this.detailType)) {
                return this.documentHeaders;
            }
            return this.mvoHeaders;
        },
        isAccountType(type) {
            return type.includes('account') ||
                type.includes('distributor') ||
                type.includes('founder') ||
                type.includes('users') ||
                type.includes('region');
        },
        isDocumentType(type) {
            return type.includes('document');
        },
        getMvoTypeName(typeId) {
            switch (typeId) {
                case "1": return "MVO";
                case "3": return "DISTRIBUTOR";
                case "4": return "FOUNDER";
                default: return "UNKNOWN";
            }
        },
        getMvoTypeColor(typeId) {
            switch (typeId) {
                case "1": return "primary";
                case "3": return "cyan";
                case "4": return "purple";
                default: return "grey";
            }
        },
        getStatusColor(status) {
            if (status === "approved") return "success";
            if (status === null || status === "pending") return "orange";
            return "grey";
        },
        getStatusText(status) {
            if (status === "approved") return "Approved";
            if (status === null) return "Belum Approve";
            if (status === "pending") return "Pending";
            return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
        },
        getClassColor(classType) {
            if (!classType) return "grey";
            switch (classType.toUpperCase()) {
                case "GOLD": return "amber";
                case "SILVER": return "blue-grey";
                case "BRONZE": return "brown";
                default: return "grey";
            }
        },
        formatDate(dateString) {
            if (!dateString) return "";
            const date = new Date(dateString);
            return date.toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
    }
}
</script>