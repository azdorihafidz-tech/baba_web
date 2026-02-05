<template>
    <Breadcrumb :items="itemsBreadcrumb" />

    <!-- Add Button - Responsive -->
    <div class="add-button-container mb-4">
        <v-btn class="text-white font-semibold add-button" @click="showDialogFormAddCode()"
            :class="{ 'mobile-add-button': $vuetify.display.mobile }">
            <v-icon start style="color: #FFD700;">mdi-account-plus</v-icon>
            <span class="ml-2">{{ $vuetify.display.mobile ? 'Tambah Code' : 'Tambah Code Cabang' }}</span>
        </v-btn>
    </div>

    <!-- Desktop View - Data Table -->
    <div class="d-none d-md-block">
        <CardDataTable :title="title">
            <template v-slot:search>
                <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Search" single-line
                    hide-details variant="outlined" class="search-field" />
            </template>
            <template v-slot:datatable>
                <v-data-table class="bg-grey-lighten-4 text-no-wrap" hover :headers="datatable.headers"
                    :items="datatable.items" :search="datatable.search" :loading="isTableLoading" :items-per-page="10"
                    @update:options="updateCurrentpageInfo">
                    <template v-slot:item.no="{ index }">
                        {{ ((currentPage - 1) * itemsPerPage) + index + 1 }}
                    </template>
                    <template v-slot:item.action="{ item }">
                        <v-tooltip text="Edit" color="#125C13" location="top start">
                            <template v-slot:activator="{ props }">
                                <v-btn size="small" :color="app.colors.primary" @click="editCode(item.id)"
                                    class="mr-2 mb-2" v-bind="props" icon>
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>
                        <v-tooltip text="Hapus" color="#125C13" location="top start">
                            <template v-slot:activator="{ props }">
                                <v-btn size="small" :color="app.colors.secondary" @click="deleteCode(item.id)"
                                    class="mr-2 mb-2" v-bind="props" icon>
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>
                    </template>
                </v-data-table>
            </template>
        </CardDataTable>
    </div>

    <!-- Mobile View - Cards -->
    <div class="d-block d-md-none">
        <v-card class="mobile-header-card mb-4">
            <v-card-text>
                <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Cari Code Cabang..."
                    single-line hide-details variant="outlined" class="search-field-mobile" />
            </v-card-text>
        </v-card>

        <v-progress-linear v-if="isTableLoading" indeterminate color="#FFD700" class="mb-4"></v-progress-linear>

        <div v-if="filteredMobileItems.length === 0 && !isTableLoading" class="text-center pa-4">
            <v-icon size="64" color="grey">mdi-map-marker-outline</v-icon>
            <p class="text-grey mt-2">Tidak ada data Code Cabang ditemukan</p>
        </div>

        <v-card v-for="(item, index) in paginatedMobileItems" :key="item.id" class="mobile-code-card mb-3"
            @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">
            <!-- Header Card - Always Visible -->
            <v-card-text class="mobile-card-header">
                <v-row no-gutters align="center">
                    <v-col cols="1" class="text-center">
                        <span class="mobile-number">{{ ((currentMobilePage - 1) * itemsPerMobilePage) + index + 1
                            }}</span>
                    </v-col>

                    <v-col cols="9" class="pl-3">
                        <div class="mobile-code-name">
                            <v-chip color="info" size="x-small" variant="flat" class="mr-1 mb-1">
                                Cabang
                            </v-chip>
                            <strong>{{ item.name || 'Nama Tidak Tersedia' }}</strong>
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
                            <v-col cols="4" class="detail-label">
                                <strong>Code:</strong>
                            </v-col>
                            <v-col cols="8" class="detail-value">
                                <v-chip color="primary" size="small" variant="flat">
                                    {{ item.code || '-' }}
                                </v-chip>
                            </v-col>
                        </v-row>

                        <v-row class="mb-3">
                            <v-col cols="4" class="detail-label">
                                <strong>Nama Cabang:</strong>
                            </v-col>
                            <v-col cols="8" class="detail-value">
                                {{ item.name || '-' }}
                            </v-col>
                        </v-row>

                        <!-- Action Buttons -->
                        <v-row class="mt-4">
                            <v-col cols="12" class="text-center">
                                <div class="mobile-actions">
                                    <v-btn size="small" :color="app.colors.primary" @click.stop="editCode(item.id)"
                                        class="mr-2 mb-2" prepend-icon="mdi-pencil" style="min-width: 150px;">
                                        Edit
                                    </v-btn>

                                    <v-btn size="small" :color="app.colors.secondary" @click.stop="deleteCode(item.id)"
                                        class="mb-2" prepend-icon="mdi-delete" style="min-width: 150px;">
                                        Hapus
                                    </v-btn>
                                </div>
                            </v-col>



                        </v-row>
                    </v-card-text>
                </div>
            </v-expand-transition>
        </v-card>

        <!-- Mobile Pagination -->
        <div v-if="filteredMobileItems.length > itemsPerMobilePage" class="mobile-pagination mt-4">
            <v-pagination v-model="currentMobilePage" :length="totalMobilePages" :total-visible="5" color="#FFD700"
                class="custom-pagination"></v-pagination>
        </div>
    </div>

    <!-- Dialog Tambah Code -->
    <v-dialog v-model="isShowDialogAdd" persistent :width="$vuetify.display.mobile ? '95%' : '800'">
        <v-card class="custom-dialog">
            <v-card-title class="dialog-header">
                <v-icon class="mr-2" style="color: #FFD700;">mdi-account-plus</v-icon>
                <span class="dialog-title">TAMBAH DATA CODE CABANG</span>
            </v-card-title>
            <v-card-text class="dialog-content">
                <v-row>
                    <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                        <v-text-field label="Code Cabang" v-model="modelAdd.code" />
                    </v-col>
                    <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                        <v-text-field label="Nama Cabang" v-model="modelAdd.name" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions class="dialog-actions">
                <v-spacer></v-spacer>
                <v-btn :color="app.colors.secondary" @click="isShowDialogAdd = false" class="ml-2">
                    Batal
                </v-btn>
                <v-btn :color="app.colors.primary" @click="addCode()" :loading="isButtonLoading" class="ml-2">
                    Simpan
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Dialog Edit Code -->
    <v-dialog v-model="isShowDialogEdit" persistent :width="$vuetify.display.mobile ? '95%' : '800'">
        <v-card class="custom-dialog">
            <v-card-title class="dialog-header">
                <v-icon class="mr-2" style="color: #FFD700;">mdi-account-edit</v-icon>
                <span class="dialog-title">EDIT DATA CODE CABANG</span>
            </v-card-title>
            <v-card-text class="dialog-content">
                <v-row>
                    <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                        <v-text-field label="Code Cabang" v-model="modelEdit.code" />
                    </v-col>
                    <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                        <v-text-field label="Nama Cabang" v-model="modelEdit.name" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions class="dialog-actions">
                <v-spacer></v-spacer>
                <v-btn :color="app.colors.secondary" @click="isShowDialogEdit = false" class="ml-2">
                    Batal
                </v-btn>
                <v-btn :color="app.colors.primary" @click="updateCode()" :loading="isButtonLoading" class="ml-2">
                    Update
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Dialog Delete Confirmation -->
    <v-dialog v-model="isShowDialogDelete" :max-width="$vuetify.display.mobile ? '95%' : '500px'">
        <v-card :color="this.app.colors.background">
            <v-card-title class="text-h5" :class="{ 'text-h6': $vuetify.display.mobile }">
                Apakah anda yakin ingin menghapus data Code Cabang ini?
            </v-card-title>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :color="app.colors.primary" @click="isShowDialogDelete = false">
                    Cancel
                </v-btn>
                <v-btn :color="app.colors.secondary" @click="confirmDeleteCode(modelDelete.id)"
                    :loading="isButtonLoading">
                    OK
                </v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-snackbar v-model="contentSnackbar.snackbar" :color="contentSnackbar.color">
        {{ contentSnackbar.text }}
    </v-snackbar>
</template>

<script>
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import CardDataTable from "@/components/ui/CardDataTable.vue";
import CardForm from "@/components/ui/CardForm.vue";
import { useAppStore } from "@/stores/app.js";
import axios from "axios";
import Cookies from "js-cookie";

export default {
    components: {
        Breadcrumb,
        CardDataTable,
        CardForm,
    },

    setup() {
        const app = useAppStore();
        return {
            app,
        };
    },

    data() {
        return {
            // Mobile specific properties
            expandedMobileCard: null,
            currentMobilePage: 1,
            itemsPerMobilePage: 5,

            currentPage: 1,
            itemsPerPage: 10,
            contentSnackbar: {
                snackbar: false,
                text: "",
                color: "",
            },

            title: "DATA CODE CABANG",
            itemsBreadcrumb: [
                {
                    title: "Dashboard",
                    disabled: false,
                    href: "/admin/dashboard",
                },
                {
                    title: "Code Cabang",
                    disabled: false,
                    href: "/admin/code-cabang",
                },
            ],
            isShowDialogAdd: false,
            isShowDialogEdit: false,
            isButtonLoading: false,
            isShowDialogDelete: false,
            datatable: {
                search: "",
                headers: [
                    { key: "no", title: "No", sortable: false, align: "center" },
                    { key: "code", title: "Code Cabang" },
                    { key: "name", title: "Nama Cabang" },
                    { key: "action", title: "Actions", sortable: false, align: "center" }
                ],
                items: [],
            },
            modelAdd: {
                code: "",
                name: "",
            },
            modelEdit: {
                id: "",
                code: "",
                name: "",
            },
            modelDelete: {
                id: "",
            },
            isTableLoading: true,
        };
    },

    computed: {
        // Mobile specific computed properties
        filteredMobileItems() {
            let filtered = this.datatable.items;

            // Apply search filter
            if (this.datatable.search) {
                const searchTerm = this.datatable.search.toLowerCase();
                filtered = filtered.filter(item => {
                    return (
                        (item.code && item.code.toLowerCase().includes(searchTerm)) ||
                        (item.name && item.name.toLowerCase().includes(searchTerm))
                    );
                });
            }

            return filtered;
        },

        totalMobilePages() {
            return Math.ceil(this.filteredMobileItems.length / this.itemsPerMobilePage);
        },

        paginatedMobileItems() {
            const start = (this.currentMobilePage - 1) * this.itemsPerMobilePage;
            const end = start + this.itemsPerMobilePage;
            return this.filteredMobileItems.slice(start, end);
        }
    },

    methods: {
        // Mobile specific methods
        toggleMobileDetail(itemId) {
            if (this.expandedMobileCard === itemId) {
                this.expandedMobileCard = null;
            } else {
                this.expandedMobileCard = itemId;
            }
        },

        updateCurrentpageInfo(options) {
            this.currentPage = options.page;
            this.itemsPerPage = options.itemsPerPage;
        },

        showDialogFormAddCode() {
            this.isShowDialogAdd = true;
            this.clearAddForm();
        },

        clearAddForm() {
            this.modelAdd.code = "";
            this.modelAdd.name = "";
        },

        clearEditForm() {
            this.modelEdit.id = "";
            this.modelEdit.code = "";
            this.modelEdit.name = "";
        },

        getAllcode() {
            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return;
            }

            this.isTableLoading = true;
            axios
                .get("https://babaapi.teknosof.com/api/provinsi", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    if (response.data.status === "success") {
                        this.datatable.items = response.data.data;
                    } else {
                        this.contentSnackbar.snackbar = true;
                        this.contentSnackbar.text = response.data.message || "Error loading data";
                        this.contentSnackbar.color = this.app.colors.secondary;
                    }
                })
                .catch((error) => {
                    this.contentSnackbar.snackbar = true;
                    this.contentSnackbar.text = error.response?.data?.message || "Error loading data";
                    this.contentSnackbar.color = this.app.colors.secondary;
                })
                .finally(() => {
                    this.isTableLoading = false;
                });
        },

        addCode() {
            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return;
            }

            // Basic validation
            if (!this.modelAdd.code || !this.modelAdd.name) {
                this.contentSnackbar.snackbar = true;
                this.contentSnackbar.text = "Semua field harus diisi";
                this.contentSnackbar.color = this.app.colors.secondary;
                return;
            }
            this.isButtonLoading = true;
            axios
                .post(
                    "https://babaapi.teknosof.com/api/provinsi",
                    {
                        code: this.modelAdd.code,
                        name: this.modelAdd.name,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                )
                .then((response) => {
                    this.getAllcode();
                    this.isShowDialogAdd = false;
                    this.contentSnackbar.snackbar = true;
                    this.contentSnackbar.text = response.data.message || "Data Code berhasil ditambah";
                    this.contentSnackbar.color = this.app.colors.primary;
                })
                .catch((error) => {
                    this.contentSnackbar.snackbar = true;
                    this.contentSnackbar.text = error.response?.data?.message || "Error adding Code";
                    this.contentSnackbar.color = this.app.colors.secondary;
                })
                .finally(() => {
                    this.isButtonLoading = false;
                });
        },

        editCode(id) {
            // Close mobile expansion when editing
            this.expandedMobileCard = null;

            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return;
            }

            this.clearEditForm();
            this.isShowDialogEdit = true;

            axios
                .get(`https://babaapi.teknosof.com/api/provinsi/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    if (response.data.status === "success") {
                        this.modelEdit.id = response.data.data.id;
                        this.modelEdit.code = response.data.data.code;
                        this.modelEdit.name = response.data.data.name;
                    } else {
                        this.contentSnackbar.snackbar = true;
                        this.contentSnackbar.text = response.data.message || "Error loading provinsi data";
                        this.contentSnackbar.color = this.app.colors.secondary;
                        this.isShowDialogEdit = false;
                    }
                })
                .catch((error) => {
                    this.contentSnackbar.snackbar = true;
                    this.contentSnackbar.text = error.response?.data?.message || "Error loading provinsi data";
                    this.contentSnackbar.color = this.app.colors.secondary;
                    this.isShowDialogEdit = false;
                });
        },

        updateCode() {
            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return;
            }

            // Basic validation
            if (!this.modelEdit.code || !this.modelEdit.name) {
                this.contentSnackbar.snackbar = true;
                this.contentSnackbar.text = "Semua field harus diisi";
                this.contentSnackbar.color = this.app.colors.secondary;
                return;
            }
            const updateData = {
                code: this.modelEdit.code,
                name: this.modelEdit.name,
            };

            this.isButtonLoading = true;
            axios
                .put(
                    `https://babaapi.teknosof.com/api/provinsi/${this.modelEdit.id}`,
                    updateData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                )
                .then((response) => {
                    this.getAllcode();
                    this.contentSnackbar.snackbar = true;
                    this.contentSnackbar.text = response.data.message || "Data Code Cabang berhasil diupdate";
                    this.contentSnackbar.color = this.app.colors.primary;
                    this.isShowDialogEdit = false;
                })
                .catch((error) => {
                    this.contentSnackbar.snackbar = true;
                    this.contentSnackbar.text = error.response?.data?.message || "Error updating Code Cabang";
                    this.contentSnackbar.color = this.app.colors.secondary;
                })
                .finally(() => {
                    this.isButtonLoading = false;
                });
        },

        deleteCode(id) {
            // Close mobile expansion when deleting
            this.expandedMobileCard = null;

            this.isShowDialogDelete = true;
            this.modelDelete.id = id;
        },

        confirmDeleteCode(id) {
            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return;
            }

            this.isButtonLoading = true;
            axios
                .delete(`https://babaapi.teknosof.com/api/provinsi/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                })
                .then((response) => {
                    this.getAllcode();
                    this.contentSnackbar.snackbar = true;
                    this.contentSnackbar.text = response.data.message || "Data Code Cabang berhasil dihapus";
                    this.contentSnackbar.color = this.app.colors.primary;
                })
                .catch((error) => {
                    this.contentSnackbar.snackbar = true;
                    this.contentSnackbar.text = error.response?.data?.message || "Error deleting Code Cabang";
                    this.contentSnackbar.color = this.app.colors.secondary;
                })
                .finally(() => {
                    this.isButtonLoading = false;
                    this.isShowDialogDelete = false;
                });
        },
    },

    created() {
        this.getAllcode();
    },

    watch: {
        // Watch untuk close mobile expansion ketika search berubah
        'datatable.search': {
            handler() {
                this.expandedMobileCard = null;
                this.currentMobilePage = 1; // Reset pagination when searching
            }
        }
    }
};
</script>

<style scoped>
/* Add Button */


.add-button {
    background: linear-gradient(135deg, #000, #1a1a1a) !important;
    color: #FFD700 !important;
    border: 2px solid #FFD700 !important;
    border-radius: 12px !important;
}

/* Desktop Table */
:deep(.v-data-table) {
    border: 1px solid #000;
}

:deep(.v-data-table__th) {
    background-color: #888 !important;
    color: #FFD700 !important;
    font-weight: bold;
}

/* Mobile Cards */
.mobile-header-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin: 0 8px;
}

.mobile-code-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
    background: #fff;
    margin: 0 8px 12px;
    position: relative;
    overflow: hidden;
}

.mobile-code-card:hover {
    border-color: #FFD700;
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
}

.mobile-card-expanded {
    border-color: #FFD700 !important;
    box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3) !important;
}

.mobile-card-header {
    padding: 16px !important;
}



.rotate-180 {
    transform: rotate(180deg);
}

.transition-all {
    transition: transform 0.3s ease;
}


/* Dialogs */
.dialog-header {
    background: linear-gradient(135deg, #1a1a1a 30%, #b8941f 80%, #d4af37 100%) !important;
    color: #FFD700 !important;
    padding: 20px 24px !important;
    border-bottom: 2px solid #FFD700;
    font-weight: bold;
    font-size: 18px;
    text-align: center;
}

.dialog-content {
    padding: 24px !important;
    background-color: #f5f5f5;
}

.dialog-actions {
    padding: 16px 24px !important;
    background-color: #f5f5f5;
    border-top: 1px solid #e0e0e0;
}

/* Animations */
.mobile-code-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent);
    transition: left 0.5s ease;
}

.mobile-code-card:hover::before {
    left: 100%;
}

@keyframes expandCard {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.mobile-card-expanded .mobile-card-details {
    animation: expandCard 0.3s ease-out;
}

/* Responsive */
/* Utilities */
.text-center.pa-4 {
    background: #f8f9fa;
    border-radius: 8px;
    margin: 0 8px;
    padding: 32px 16px !important;
}

.mobile-code-card:focus,
.mobile-action-btn:focus {
    outline: 2px solid #FFD700;
    outline-offset: 2px;
}

:deep(.v-progress-circular) {
    color: #FFD700 !important;
}

:deep(.v-progress-linear) {
    border-radius: 4px;
}

:deep(.v-chip) {
    font-weight: 500;
    text-transform: uppercase;
}

.detail-value .v-chip {
    font-family: 'Courier New', monospace;
}
</style>