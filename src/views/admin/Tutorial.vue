<template>
    <Breadcrumb :items="itemsBreadcrumb" />

    <!-- Desktop View - Data Table -->
    <div class="d-none d-md-block">
        <CardDataTable :title="title">
            <template v-slot:search>
                <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Search" single-line
                    hide-details variant="outlined" class="search-field" />
            </template>
            <template v-slot:datatable>
                <v-data-table class="bg-grey-lighten-4 text-no-wrap" hover :headers="datatable.headers"
                    :items="datatable.items" :search="datatable.search" :items-per-page="10"
                    @update:options="updateCurrentPageInfo">
                    <template v-slot:item.no="{ index }">
                        {{ ((currentPage - 1) * itemsPerPage) + index + 1 }}
                    </template>
                    <template v-slot:item.judul="{ item }">
                        <div style="max-width: 400px;">
                            {{ item.judul }}
                        </div>
                    </template>
                    <template v-slot:item.link_gdrive="{ item }">
                        <v-btn size="small" color="success" @click="downloadTutorial(item.link_gdrive)"
                            prepend-icon="mdi-download">
                            Download
                        </v-btn>
                    </template>
                </v-data-table>
            </template>
        </CardDataTable>
    </div>

    <!-- Mobile View - Cards -->
    <div class="d-block d-md-none">
        <v-card class="mobile-header-card mb-4">
            <v-card-text>
                <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Cari tutorial..."
                    single-line hide-details variant="outlined" class="search-field-mobile" />
            </v-card-text>
        </v-card>

        <div v-if="filteredItems.length === 0" class="text-center pa-4">
            <v-icon size="64" color="grey">mdi-file-document-outline</v-icon>
            <p class="text-grey mt-2">Tidak ada data tutorial ditemukan</p>
        </div>

        <v-card v-for="(item, index) in filteredItems" :key="item.id" class="mobile-tutorial-card mb-3"
            @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">
            <!-- Header Card - Always Visible -->
            <v-card-text class="mobile-card-header">
                <v-row no-gutters align="center">
                    <v-col cols="1" class="text-center">
                        <span class="mobile-number">{{ index + 1 }}</span>
                    </v-col>

                    <v-col cols="9" class="pl-3">
                        <div class="mobile-tutorial-name">
                            <strong>{{ item.judul }}</strong>
                        </div>
                    </v-col>

                    <v-col cols="2" class="text-center">
                        <v-icon :class="{ 'rotate-180': expandedMobileCard === item.id }" class="transition-all">
                            mdi-chevron-down
                        </v-icon>
                    </v-col>
                </v-row>
            </v-card-text>

            <!-- Detail Card - Expandable -->
            <v-expand-transition>
                <div v-show="expandedMobileCard === item.id">
                    <v-divider></v-divider>
                    <v-card-text class="mobile-card-details">
                        <v-row class="mb-3">
                            <v-col cols="12" class="detail-label">
                                <strong>Judul Tutorial:</strong>
                            </v-col>
                            <v-col cols="12" class="detail-value">
                                {{ item.judul }}
                            </v-col>
                        </v-row>

                        <!-- Action Buttons -->
                        <v-divider class="mb-3"></v-divider>
                        <div class="mobile-actions">
                            <v-btn size="small" color="success" @click.stop="downloadTutorial(item.link_gdrive)"
                                class="mb-2" prepend-icon="mdi-download" block>
                                Download Tutorial
                            </v-btn>
                        </div>

                    </v-card-text>
                </div>
            </v-expand-transition>
        </v-card>
    </div>

    <v-snackbar v-model="contentSnackbar.snackbar" :color="contentSnackbar.color">
        {{ contentSnackbar.text }}
    </v-snackbar>
</template>

<script>
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import CardDataTable from "@/components/ui/CardDataTable.vue";
import { useAppStore } from "@/stores/app.js";

export default {
    components: {
        Breadcrumb,
        CardDataTable,
    },

    setup() {
        const app = useAppStore();
        return {
            app,
        };
    },

    data() {
        return {
            currentPage: 1,
            itemsPerPage: 10,
            expandedMobileCard: null,
            contentSnackbar: {
                snackbar: false,
                text: "",
                color: "",
            },

            title: "DAFTAR TUTORIAL BABA PARFUME",
            itemsBreadcrumb: [
                {
                    title: "Dashboard",
                    disabled: false,
                    href: "/admin/dashboard",
                },
                {
                    title: "TUTORIAL",
                    disabled: false,
                    href: "/admin/tutorial",
                },
            ],
            datatable: {
                search: "",
                headers: [
                    { key: "no", title: "No", sortable: false, width: "80px" },
                    { key: "judul", title: "Judul Tutorial" },
                    { key: "link_gdrive", title: "Download", sortable: false, align: "center", width: "150px" },
                ],
                items: [
                    {
                        id: 1,
                        judul: "TUTORIAL WEBSITE OFFICIAL BABA PARFUME",
                        link_gdrive: "https://drive.usercontent.google.com/download?id=1znbd3mlKwMMkgiDPZrgmRVa0M73Sl1Cp&export=download&authuser=0&confirm=t&uuid=0a4c557b-792f-4933-bfc1-6ed45d63e03d&at=APcXIO12guv-QV9y3IqEOJby7_D4:1772159742445"
                    },
                    {
                        id: 2,
                        judul: "TUTORIAL APLIKASI BABA PARFUM (USER)",
                        link_gdrive: "https://drive.usercontent.google.com/download?id=1bBGM1oJgTuKkAHJvzaVVx_Zt3fad8tGP&export=download&authuser=0&confirm=t&uuid=ad33d81b-d886-44e4-aeab-0ff8179b2e41&at=AGN2oQ0L2kAapvKVGo_KvQZEyDjQ:1772766202226"
                    },
                    {
                        id: 3,
                        judul: "TUTORIAL APLIKASI BABA PARFUM (ADMIN)",
                        link_gdrive: "https://drive.usercontent.google.com/download?id=1PwDRl3YLZxyJBYtL3VB7YjAvpFOJMxf4&export=download&authuser=0&confirm=t&uuid=d931e4cd-f097-44ab-b483-9eebff711a5a&at=AGN2oQ35rQ8jqkrf7KmYUxaCjDQ1:1772766156112"
                    },
                    {
                        id: 4,
                        judul: "TUTORIAL APLIKASI WEBSITE ADMIN PANEL BABA PARFUME",
                        link_gdrive: "https://drive.usercontent.google.com/download?id=1gDhXpCXh3jft1eb2oodYip71jMkPpqDl&export=download&authuser=0&confirm=t&uuid=6c0d4e3c-27a8-418b-a495-8d03dc83fd26&at=APcXIO1Nj3pQ72SBpTjfPJ4ir45U:1772159710604"
                    }
                ],
            },
        };
    },

    computed: {
        filteredItems() {
            if (!this.datatable.search) {
                return this.datatable.items;
            }

            const searchTerm = this.datatable.search.toLowerCase();
            return this.datatable.items.filter(item => {
                return item.judul.toLowerCase().includes(searchTerm);
            });
        }
    },

    methods: {
        downloadTutorial(linkGdrive) {
            if (linkGdrive) {
                window.open(linkGdrive, '_blank');
            } else {
                this.showSnackbar("Link Google Drive tidak tersedia", true);
            }
        },

        toggleMobileDetail(itemId) {
            if (this.expandedMobileCard === itemId) {
                this.expandedMobileCard = null;
            } else {
                this.expandedMobileCard = itemId;
            }
        },

        showSnackbar(message, isError = false) {
            this.contentSnackbar.snackbar = true;
            this.contentSnackbar.text = message;
            this.contentSnackbar.color = isError ? this.app.colors.secondary : this.app.colors.primary;
        },

        updateCurrentPageInfo(options) {
            this.currentPage = options.page;
            this.itemsPerPage = options.itemsPerPage;
        },
    },

    watch: {
        'datatable.search': {
            handler() {
                this.expandedMobileCard = null;
            }
        }
    }
};
</script>

<style scoped>
:deep(.v-data-table) {
    border: 1px solid #000000;
}

:deep(.v-data-table__th) {
    background-color: var(--baba-gold-soft) !important;
    color: var(--baba-text) !important;
    font-weight: bold;
}

.mobile-header-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-field-mobile {
    margin-top: 8px;
}

.mobile-tutorial-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
    background: #ffffff;
}

.mobile-tutorial-card:hover {
    border-color: #E6B422;
    box-shadow: 0 4px 12px rgba(230, 180, 34, 0.2);
}

.mobile-card-expanded {
    border-color: #E6B422 !important;
    box-shadow: 0 4px 16px rgba(230, 180, 34, 0.3) !important;
}

.mobile-card-header {
    padding: 16px !important;
}

.mobile-tutorial-name {
    font-size: 16px;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 4px;
}

.mobile-card-details {
    padding: 16px !important;
    background-color: #f8f9fa;
}

.detail-label {
    font-weight: bold;
    color: #333;
    font-size: 14px;
    margin-bottom: 4px;
}

.detail-value {
    color: #666;
    font-size: 14px;
    line-height: 1.4;
}

.mobile-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.mobile-number {
    font-weight: bold;
    color: #E6B422;
    background-color: #1a1a1a;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

.rotate-180 {
    transform: rotate(180deg);
}

.transition-all {
    transition: transform 0.3s ease;
}

@media (max-width: 600px) {
    .mobile-tutorial-card {
        margin-left: 8px;
        margin-right: 8px;
    }

    .mobile-header-card {
        margin-left: 8px;
        margin-right: 8px;
    }
}
</style>