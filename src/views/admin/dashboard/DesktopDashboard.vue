<template>
    <v-card class="d-none d-md-block">
        <v-tabs v-model="internalTab" bg-color="#FFD700" color="blue" slider-color="blue" class="d-none d-md-flex">
            <v-tab value="dashboard-overview">DASHBOARD OVERVIEW</v-tab>
            <v-tab value="dashboard-documents">DASHBOARD DOCUMENTS</v-tab>
            <v-tab value="dashboard-accounts">DASHBOARD AKUN</v-tab>
            <v-tab value="dashboard-regions">DASHBOARD REGIONS</v-tab>
        </v-tabs>

        <v-card-text>
            <v-tabs-window v-model="internalTab">
                <v-tabs-window-item value="dashboard-overview">
                    <DashboardOverview :dashboard-data="dashboardData" @show-detail="$emit('show-detail', $event)"
                        @show-mvo-detail="$emit('show-mvo-detail', $event)" />
                </v-tabs-window-item>

                <v-tabs-window-item value="dashboard-documents">
                    <DashboardDocuments :dashboard-data="dashboardData" @show-detail="$emit('show-detail', $event)" />
                </v-tabs-window-item>

                <v-tabs-window-item value="dashboard-accounts">
                    <DashboardAccounts :dashboard-data="dashboardData" @show-detail="$emit('show-detail', $event)" />
                </v-tabs-window-item>

                <v-tabs-window-item value="dashboard-regions">
                    <DashboardRegions :dashboard-data="dashboardData" @show-detail="$emit('show-detail', $event)" />
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card-text>
    </v-card>
</template>

<script>
import { ref, watch } from 'vue'
import DashboardOverview from './DashboardOverview.vue'
import DashboardDocuments from './DashboardDocuments.vue'
import DashboardAccounts from './DashboardAccounts.vue'
import DashboardRegions from './DashboardRegions.vue'

export default {
    name: 'DesktopDashboard',
    components: {
        DashboardOverview,
        DashboardDocuments,
        DashboardAccounts,
        DashboardRegions
    },
    props: {
        dashboardData: Object,
        isLoading: Boolean,
        tab: String
    },
    emits: ['update:tab', 'show-detail', 'show-mvo-detail', 'refresh'],
    setup(props, { emit }) {
        const internalTab = ref(props.tab)

        watch(internalTab, (newTab) => {
            emit('update:tab', newTab)
        })

        watch(() => props.tab, (newTab) => {
            internalTab.value = newTab
        })

        return {
            internalTab
        }
    }
}
</script>