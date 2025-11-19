<template>
    <v-list>
        <!-- Special handling for region summary in mobile -->
        <template v-if="detailType === 'all_regions'">
            <v-list-item v-for="item in detailData" :key="item.region_name" class="py-3"
                @click="$emit('show-region-accounts', item.region_name, item)" style="cursor: pointer;">
                <template v-slot:prepend>
                    <v-avatar color="primary" size="40">
                        <v-icon color="white">mdi-map-marker</v-icon>
                    </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium">
                    {{ item.region_name }}
                </v-list-item-title>

                <v-list-item-subtitle>
                    <div class="d-flex gap-1 mb-1">
                        <v-chip size="x-small" color="primary" variant="tonal">
                            Total: {{ item.total_accounts }}
                        </v-chip>
                        <v-chip size="x-small" color="success" variant="tonal">
                            Disetujui: {{ item.approved_accounts }}
                        </v-chip>
                        <v-chip size="x-small" color="orange" variant="tonal">
                            Pending: {{ item.pending_accounts }}
                        </v-chip>
                    </div>
                </v-list-item-subtitle>

                <template v-slot:append>
                    <v-icon>mdi-chevron-right</v-icon>
                </template>
            </v-list-item>
        </template>

        <!-- Penanganan khusus untuk akun MVO saja -->
        <template v-else-if="detailType === 'mvo_accounts_only'">
            <v-list-item v-for="item in detailData" :key="item.mvo_id" class="py-3" style="cursor: pointer;">
                <template v-slot:prepend>
                    <v-avatar color="success" size="40">
                        <v-icon color="white">mdi-account</v-icon>
                    </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium">
                    {{ item.nama || item.mvo?.nama || 'N/A' }}
                </v-list-item-title>

                <v-list-item-subtitle>
                    <div class="mb-1">
                        <v-chip size="x-small" color="info" variant="tonal">
                            Kode: {{ item.code || item.mvo?.code || 'N/A' }}
                        </v-chip>
                    </div>
                    <div class="d-flex gap-1">
                        <v-chip size="x-small" :color="getMvoTypeColor(item.mvo_type_id)" variant="tonal">
                            {{ getMvoTypeName(item.mvo_type_id) }}
                        </v-chip>
                        <v-chip size="x-small" :color="getStatusColor(item.status_inputan)" variant="tonal">
                            {{ getStatusText(item.status_inputan) }}
                        </v-chip>
                    </div>
                    <div class="text-caption mt-1">
                        {{ item.daerah || 'N/A' }} • {{ formatDate(item.tgl_lahir) }}
                    </div>
                </v-list-item-subtitle>

                <template v-slot:append>
                    <div class="text-center">
                        <v-chip size="small" :color="getClassColor(item.class_member)" dark>
                            {{ item.class_member || 'N/A' }}
                        </v-chip>
                    </div>
                </template>
            </v-list-item>
        </template>

        <!-- Template untuk tipe akun lainnya -->
        <template v-else-if="isAccountType(detailType)">
            <v-list-item v-for="item in detailData" :key="item.mvo_id" class="py-3" style="cursor: pointer;">
                <template v-slot:prepend>
                    <v-avatar :color="getMvoTypeColor(item.mvo_type_id)" size="40">
                        <v-icon color="white">{{ getMvoTypeIcon(item.mvo_type_id) }}</v-icon>
                    </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium">
                    {{ item.nama || 'N/A' }}
                </v-list-item-title>

                <v-list-item-subtitle>
                    <div class="mb-1">
                        <v-chip size="x-small" color="info" variant="tonal">
                            Kode: {{ item.code || 'N/A' }}
                        </v-chip>
                    </div>
                    <div class="d-flex gap-1">
                        <v-chip size="x-small" :color="getMvoTypeColor(item.mvo_type_id)" variant="tonal">
                            {{ getMvoTypeName(item.mvo_type_id) }}
                        </v-chip>
                        <v-chip size="x-small" :color="getStatusColor(item.status_inputan)" variant="tonal">
                            {{ getStatusText(item.status_inputan) }}
                        </v-chip>
                    </div>
                    <div class="text-caption mt-1">
                        {{ item.daerah || 'N/A' }} • {{ formatDate(item.tgl_lahir) }}
                    </div>
                </v-list-item-subtitle>

                <template v-slot:append>
                    <div class="text-center">
                        <v-chip size="small" :color="getClassColor(item.class_member)" dark>
                            {{ item.class_member || 'N/A' }}
                        </v-chip>
                    </div>
                </template>
            </v-list-item>
        </template>

        <!-- Template untuk tipe dokumen -->
        <template v-else-if="isDocumentType(detailType)">
            <v-list-item v-for="item in detailData" :key="item.id" class="py-3" style="cursor: pointer;">
                <template v-slot:prepend>
                    <v-avatar color="primary" size="40">
                        <v-icon color="white">mdi-file-document</v-icon>
                    </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium">
                    {{ item.nama_file || item.file_name || item.nama || item.name || item.title || 'Document #' +
                    item.id }}
                </v-list-item-title>

                <v-list-item-subtitle>
                    <div class="d-flex gap-1 mb-1">
                        <v-chip size="x-small" :color="getStatusColor(item.status_inputan)" variant="tonal">
                            {{ getStatusText(item.status_inputan) }}
                        </v-chip>
                        <v-chip size="x-small" color="amber" variant="tonal">
                            <v-icon left size="12">mdi-star</v-icon>
                            {{ item.pointbintang || 0 }}
                        </v-chip>
                    </div>
                    <div class="text-caption" v-if="item.mvo">
                        MVO: {{ item.mvo?.nama || 'N/A' }}
                    </div>
                </v-list-item-subtitle>

                <template v-slot:append>
                    <v-btn icon size="small" @click="$emit('show-image', item.foto_ktp)" v-if="item.foto_ktp">
                        <v-icon size="20">mdi-image</v-icon>
                    </v-btn>
                </template>
            </v-list-item>
        </template>

        <!-- Template untuk tipe user -->
        <template v-else-if="detailType === 'all_users'">
            <v-list-item v-for="item in detailData" :key="item.id" class="py-3" style="cursor: pointer;">
                <template v-slot:prepend>
                    <v-avatar color="purple" size="40">
                        <v-icon color="white">mdi-account-group</v-icon>
                    </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium">
                    {{ item.name || item.username || 'N/A' }}
                </v-list-item-title>

                <v-list-item-subtitle>
                    <div class="mb-1">
                        <v-chip size="x-small" color="info" variant="tonal">
                            Email: {{ item.email || 'N/A' }}
                        </v-chip>
                    </div>
                    <div class="d-flex gap-1">
                        <v-chip size="x-small" color="primary" variant="tonal">
                            Role: {{ item.role || 'N/A' }}
                        </v-chip>
                        <v-chip size="x-small" :color="item.is_active ? 'success' : 'error'" variant="tonal">
                            {{ item.is_active ? 'Aktif' : 'Tidak Aktif' }}
                        </v-chip>
                    </div>
                    <div class="text-caption mt-1">
                        Terdaftar: {{ formatDate(item.created_at) }}
                    </div>
                </v-list-item-subtitle>
            </v-list-item>
        </template>
    </v-list>
</template>

<script>
export default {
    name: 'MobileDetailView',
    props: {
        detailType: String,
        detailData: Array
    },
    emits: ['show-region-accounts', 'show-image'],
    methods: {
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
        getMvoTypeIcon(typeId) {
            switch (typeId) {
                case "1": return "mdi-account";
                case "3": return "mdi-store";
                case "4": return "mdi-crown";
                default: return "mdi-account";
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