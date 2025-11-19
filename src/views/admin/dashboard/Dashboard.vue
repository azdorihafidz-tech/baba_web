<template>
    <v-container>
        <!-- Desktop Layout -->
        <DesktopDashboard v-if="!isMobile" :dashboard-data="dashboardData" :is-loading="isLoading" :tab="tab"
            @update:tab="tab = $event" @show-detail="showDetailModal" @show-mvo-detail="showMVODetail"
            @refresh="refreshData" />

        <!-- Mobile Layout -->
        <MobileDashboard v-else :dashboard-data="dashboardData" :is-loading="isLoading"
            :mobile-active-section="mobileActiveSection" @update:mobile-active-section="mobileActiveSection = $event"
            @show-detail="showDetailModal" @show-mvo-detail="showMVODetail" @refresh="refreshData" />

        <!-- Modals -->
        <DetailModal :show="detailModal" :detail-type="selectedDetailType" :detail-title="selectedDetailTitle"
            :detail-data="detailData" :is-loading-detail="isLoadingDetail" @close="detailModal = false"
            @show-region-accounts="showRegionAccountsDetail" @show-image="showImage" />

        <MVODetailModal :show="mvoDetailModal" :mvo-id="selectedMVOId" :mvo-data="selectedMVOData"
            @close="mvoDetailModal = false" />

        <ImageModal :show="imageModal" :image-url="selectedImageUrl" @close="imageModal = false" />

        <!-- Loading Overlay -->
        <v-overlay v-model="isLoading" class="align-center justify-center">
            <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
        </v-overlay>
    </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from "axios";
import Cookies from "js-cookie";
import { useDisplay } from 'vuetify'

// Components
import DesktopDashboard from '@/components/dashboard/DesktopDashboard.vue'
import MobileDashboard from '@/components/dashboard/MobileDashboard.vue'
import DetailModal from '@/components/dashboard/DetailModal.vue'
import MVODetailModal from '@/components/dashboard/MVODetailModal.vue'
import ImageModal from '@/components/dashboard/ImageModal.vue'

export default {
    name: 'Dashboard',
    components: {
        DesktopDashboard,
        MobileDashboard,
        DetailModal,
        MVODetailModal,
        ImageModal
    },
    setup() {
        const { mobile } = useDisplay()

        // Reactive data
        const tab = ref('dashboard-overview')
        const mobileActiveSection = ref('overview')
        const isLoading = ref(false)
        const isLoadingDetail = ref(false)

        const dashboardData = ref({
            summary: {
                akun: {
                    total: 0,
                    approved: 0,
                    pending: 0,
                    distributor: 0,
                    founder: 0
                },
                documents: {
                    total: 0,
                    approved: 0,
                    pending: 0
                },
                user_total: 0,
                akun_per_daerah: [],
                top_5_bintang: []
            }
        })

        const mvoRawData = ref([])
        const documentRawData = ref([])

        // Modal states
        const detailModal = ref(false)
        const mvoDetailModal = ref(false)
        const imageModal = ref(false)
        const selectedDetailType = ref('')
        const selectedDetailTitle = ref('')
        const selectedMVOId = ref(null)
        const selectedMVOData = ref(null)
        const selectedImageUrl = ref('')
        const detailData = ref([])

        // Computed
        const isMobile = computed(() => mobile.value)

        // Methods
        const fetchDashboardData = async () => {
            const token = Cookies.get("token");
            if (!token) {
                router.push({ name: "Login" });
                return;
            }

            isLoading.value = true;
            try {
                const [dashboardResponse, mvoResponse, documentResponse] = await Promise.all([
                    axios.get("https://babaapi.babaparfume.id/api/dashboard", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("https://babaapi.babaparfume.id/api/mvo", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("https://babaapi.babaparfume.id/api/mvo-document", {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                ]);

                if (dashboardResponse.data?.status === "success") {
                    dashboardData.value = dashboardResponse.data.data;
                }

                if (mvoResponse.data?.status === "success") {
                    mvoRawData.value = mvoResponse.data.data;
                }

                if (documentResponse.data?.status === "success") {
                    documentRawData.value = documentResponse.data.data;
                }

                console.log("Dashboard data loaded:", dashboardData.value);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                isLoading.value = false;
            }
        }

        const showDetailModal = (type) => {
            selectedDetailType.value = type;
            selectedDetailTitle.value = getDetailTitle(type);
            isLoadingDetail.value = true;

            setTimeout(() => {
                detailData.value = filterDataByType(type);
                isLoadingDetail.value = false;
                detailModal.value = true;
            }, 100);
        }

        const showMVODetail = (mvoId, mvoData = null) => {
            selectedMVOId.value = mvoId;
            selectedMVOData.value = mvoData || findMVOData(mvoId);
            mvoDetailModal.value = true;
        }

        const showImage = (filePath) => {
            selectedImageUrl.value = `https://babaapi.babaparfume.id/storage/${filePath}`;
            imageModal.value = true;
        }

        const showRegionAccountsDetail = (regionName, regionData) => {
            const regionAccounts = mvoRawData.value.filter(account =>
                account.daerah === regionName ||
                account.region === regionName ||
                account.alamat?.includes(regionName)
            );

            selectedDetailType.value = 'region_accounts';
            selectedDetailTitle.value = `Akun di ${regionName} (${regionData.total} akun)`;
            detailData.value = regionAccounts;
            detailModal.value = true;
        }

        const refreshData = async () => {
            isLoading.value = true;
            try {
                await fetchDashboardData();
            } catch (error) {
                console.error('Error refreshing data:', error);
            } finally {
                isLoading.value = false;
            }
        }

        // Helper methods
        const getMVOOnlyCount = () => {
            return mvoRawData.value.filter(item => item.mvo_type_id === "1").length;
        }

        const getDetailTitle = (type) => {
            const titles = {
                'all_accounts': 'Semua Akun',
                'mvo_accounts_only': 'MVO Akun Saja',
                'mvo_accounts': 'Akun MVO',
                'all_users': 'Semua Pengguna',
                'approved_accounts': 'Akun yang Sudah Approve',
                'pending_accounts': 'Akun Belum Approve',
                'distributor_accounts': 'Akun Distributor',
                'founder_accounts': 'Akun Founder',
                'all_documents': 'Semua Dokumen',
                'approved_documents': 'Dokumen yang Sudah Approve',
                'pending_documents': 'Dokumen Belum Approve',
                'all_regions': 'Akun per Daerah',
                'region_accounts': 'Akun per Region'
            };
            return titles[type] || 'Detail';
        }

        const filterDataByType = (type) => {
            let filteredData = [];

            switch (type) {
                case 'all_accounts':
                    filteredData = [...mvoRawData.value];
                    break;
                case 'mvo_accounts_only':
                    filteredData = mvoRawData.value.filter(item => item.mvo_type_id === "1");
                    break;
                case 'all_users':
                    filteredData = [...mvoRawData.value];
                    break;
                case 'approved_accounts':
                    filteredData = mvoRawData.value.filter(item => item.status_inputan === "approved");
                    break;
                case 'pending_accounts':
                    filteredData = mvoRawData.value.filter(item =>
                        item.status_inputan === null ||
                        item.status_inputan === "pending" ||
                        item.status_inputan === undefined
                    );
                    break;
                case 'distributor_accounts':
                    filteredData = mvoRawData.value.filter(item =>
                        item.code && item.code.startsWith('DIST-')
                    );
                    break;
                case 'mvo_accounts':
                    filteredData = mvoRawData.value.filter(item =>
                        item.code && item.code.startsWith('MVO-')
                    );
                    break;
                case 'founder_accounts':
                    filteredData = mvoRawData.value.filter(item =>
                        item.code && item.code.startsWith('FO-')
                    );
                    break;
                case 'all_documents':
                    filteredData = [...documentRawData.value];
                    break;
                case 'approved_documents':
                    filteredData = documentRawData.value.filter(item => item.status_inputan === "approved");
                    break;
                case 'pending_documents':
                    filteredData = documentRawData.value.filter(item =>
                        item.status_inputan === null ||
                        item.status_inputan === "pending" ||
                        item.status_inputan === undefined
                    );
                    break;
                case 'all_regions':
                    filteredData = getRegionSummaryData();
                    break;
                default:
                    filteredData = [];
                    break;
            }

            return filteredData;
        }

        const getRegionSummaryData = () => {
            const regionSummary = [];
            const regions = dashboardData.value.summary?.akun_per_daerah || [];

            regions.forEach(region => {
                const accountsInRegion = mvoRawData.value.filter(account =>
                    account.daerah === region.daerah ||
                    account.region === region.daerah ||
                    account.province === region.daerah ||
                    account.alamat?.includes(region.daerah)
                );

                regionSummary.push({
                    id: region.daerah,
                    region_name: region.daerah,
                    total_accounts: region.total,
                    actual_accounts: accountsInRegion.length,
                    accounts: accountsInRegion,
                    approved_accounts: accountsInRegion.filter(acc => acc.status_inputan === "approved").length,
                    pending_accounts: accountsInRegion.filter(acc =>
                        acc.status_inputan === null ||
                        acc.status_inputan === "pending" ||
                        acc.status_inputan === undefined
                    ).length
                });
            });

            return regionSummary;
        }

        const findMVOData = (mvoId) => {
            let mvoData = dashboardData.value.summary?.top_5_bintang?.find(item => item.mvo_id === mvoId);

            if (!mvoData) {
                const mvoInfo = mvoRawData.value.find(item => item.id == mvoId);
                const mvoDocuments = documentRawData.value.filter(item => item.mvo_id == mvoId);
                const totalBintang = mvoDocuments.reduce((sum, doc) => sum + parseInt(doc.pointbintang || 0), 0);

                mvoData = {
                    mvo_id: mvoId,
                    total_bintang: totalBintang,
                    total_documents: mvoDocuments.length,
                    avg_stars: mvoDocuments.length > 0 ? (totalBintang / mvoDocuments.length).toFixed(1) : '0.0',
                    mvo: mvoInfo,
                    documents: mvoDocuments
                };
            }

            return mvoData;
        }

        // Lifecycle
        onMounted(() => {
            fetchDashboardData();
        })

        // Expose data and methods to template
        return {
            // State
            tab,
            mobileActiveSection,
            isLoading,
            dashboardData,

            // Modals
            detailModal,
            mvoDetailModal,
            imageModal,
            selectedDetailType,
            selectedDetailTitle,
            selectedMVOId,
            selectedMVOData,
            selectedImageUrl,
            detailData,
            isLoadingDetail,

            // Computed
            isMobile,

            // Methods
            showDetailModal,
            showMVODetail,
            showImage,
            showRegionAccountsDetail,
            refreshData,
            getMVOOnlyCount
        }
    }
}
</script>

<style scoped>
/* Your existing styles can be moved here or to individual components */
</style>