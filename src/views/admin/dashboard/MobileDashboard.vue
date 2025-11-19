<template>
    <div class="d-block d-md-none">
        <!-- Mobile Header -->
        <v-card class="mb-3" elevation="3">
            <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between mb-3">
                    <h2 class="text-h5 font-weight-bold">Dashboard</h2>
                    <v-btn icon @click="$emit('refresh')" :loading="isLoading" size="small">
                        <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                </div>

                <!-- Quick Stats Grid -->
                <v-row dense>
                    <v-col cols="6">
                        <div class="text-center" @click="$emit('show-detail', 'all_users')" style="cursor: pointer;">
                            <v-icon color="purple" size="24">mdi-account-group</v-icon>
                            <div class="text-h6 font-weight-bold mt-1">{{ dashboardData.summary?.user_total || 0 }}
                            </div>
                            <div class="text-caption">Total Pengguna</div>
                        </div>
                    </v-col>
                    <v-col cols="6">
                        <div class="text-center" @click="$emit('show-detail', 'all_documents')"
                            style="cursor: pointer;">
                            <v-icon color="primary" size="24">mdi-file-document-multiple</v-icon>
                            <div class="text-h6 font-weight-bold mt-1">{{ dashboardData.summary?.documents?.total || 0
                                }}</div>
                            <div class="text-caption">Total Documents</div>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Mobile Navigation -->
        <v-chip-group v-model="internalSection" mandatory color="primary" column
            class="d-flex flex-wrap justify-center gap-2 mb-3">
            <v-chip value="overview" size="small" variant="elevated" rounded="lg">
                <v-icon start size="18">mdi-view-dashboard</v-icon>
                OVERVIEW
            </v-chip>
            <v-chip value="documents" size="small" variant="elevated" rounded="lg">
                <v-icon start size="18">mdi-file-document</v-icon>
                DOCUMENTS
            </v-chip>
            <v-chip value="accounts" size="small" variant="elevated" rounded="lg">
                <v-icon start size="18">mdi-account</v-icon>
                AKUN
            </v-chip>
            <v-chip value="regions" size="small" variant="elevated" rounded="lg">
                <v-icon start size="18">mdi-map</v-icon>
                REGIONS
            </v-chip>
        </v-chip-group>

        <!-- Mobile Overview Section -->
        <div v-if="internalSection === 'overview'">
            <MobileOverview :dashboard-data="dashboardData" @show-detail="$emit('show-detail', $event)"
                @show-mvo-detail="$emit('show-mvo-detail', $event)" />
        </div>

        <!-- Mobile Documents Section -->
        <div v-if="internalSection === 'documents'">
            <MobileDocuments :dashboard-data="dashboardData" @show-detail="$emit('show-detail', $event)" />
        </div>

        <!-- Mobile Accounts Section -->
        <div v-if="internalSection === 'accounts'">
            <MobileAccounts :dashboard-data="dashboardData" @show-detail="$emit('show-detail', $event)" />
        </div>

        <!-- Mobile Regions Section -->
        <div v-if="internalSection === 'regions'">
            <MobileRegions :dashboard-data="dashboardData" @show-detail="$emit('show-detail', $event)" />
        </div>
    </div>
</template>

<script>
import { ref, watch } from 'vue'
import MobileOverview from './mobile/MobileOverview.vue'
import MobileDocuments from './mobile/MobileDocuments.vue'
import MobileAccounts from './mobile/MobileAccounts.vue'
import MobileRegions from './mobile/MobileRegions.vue'

export default {
    name: 'MobileDashboard',
    components: {
        MobileOverview,
        MobileDocuments,
        MobileAccounts,
        MobileRegions
    },
    props: {
        dashboardData: Object,
        isLoading: Boolean,
        mobileActiveSection: String
    },
    emits: ['update:mobile-active-section', 'show-detail', 'show-mvo-detail', 'refresh'],
    setup(props, { emit }) {
        const internalSection = ref(props.mobileActiveSection)

        watch(internalSection, (newSection) => {
            emit('update:mobile-active-section', newSection)
        })

        watch(() => props.mobileActiveSection, (newSection) => {
            internalSection.value = newSection
        })

        return {
            internalSection
        }
    }
}
</script>

<style scoped>
.mobile-dashboard {
    max-width: 100%;
    overflow-x: hidden;
}

.mobile-header {
    border-radius: 16px;
    background: linear-gradient(135deg, #1a1a1a, #FFD700);
    color: white;
}
</style>