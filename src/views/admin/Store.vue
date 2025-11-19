<template>
    <Breadcrumb :items="itemsBreadcrumb" />

    <!-- Tombol Tambah Toko -->
    <div class="mb-4">
        <v-btn class="text-white font-semibold" @click="showDialogFormAddToko()" style="
    background: linear-gradient(135deg, #000000, #1a1a1a);
    color: #FFD700;
    border: 2px solid #FFD700;
    border-radius: 12px;
    padding: 10px 18px;
  ">
            <v-icon start style="color: #FFD700;">mdi-pen-plus</v-icon>
            <span class="ml-2">TAMBAH STORE BABA PARFUME</span>
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
                <v-data-table class="bg-grey-lighten-4" hover :headers="datatable.headers" :items="datatable.items"
                    :search="datatable.search" :loading="isTableLoading" :items-per-page="10"
                    @update:options="updateCurrentPageInfo">
                    <template v-slot:item.no="{ index }">
                        {{ ((currentPage - 1) * itemsPerPage) + index + 1 }}
                    </template>
                    <template v-slot:item.alamat="{ item }">
                        <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            {{ item.alamat }}
                        </div>
                    </template>
                    <template v-slot:item.action="{ item }">
                        <v-tooltip text="Rute ke Toko" color="#125C13" location="top start">
                            <template v-slot:activator="{ props }">
                                <v-btn size="small" color="info" @click="openMaps(item.link_maps, item.alamat)"
                                    class="mr-2 mb-2" v-bind="props" icon>
                                    <v-icon>mdi-directions</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>
                        <v-tooltip text="Edit" color="#125C13" location="top start">
                            <template v-slot:activator="{ props }">
                                <v-btn size="small" :color="app.colors.primary" @click="editToko(item.id)"
                                    class="mr-2 mb-2" v-bind="props" icon>
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>
                        <v-tooltip text="Hapus" color="#125C13" location="top start">
                            <template v-slot:activator="{ props }">
                                <v-btn size="small" :color="app.colors.secondary" @click="deleteToko(item.id)"
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
                <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Cari toko..."
                    single-line hide-details variant="outlined" class="search-field-mobile" />
            </v-card-text>
        </v-card>

        <v-progress-linear v-if="isTableLoading" indeterminate color="#FFD700" class="mb-4"></v-progress-linear>

        <div v-if="filteredItems.length === 0 && !isTableLoading" class="text-center pa-4">
            <v-icon size="64" color="grey">mdi-store-search</v-icon>
            <p class="text-grey mt-2">Tidak ada data toko ditemukan</p>
        </div>

        <v-card v-for="(item, index) in filteredItems" :key="item.id" class="mobile-toko-card mb-3"
            @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">
            <!-- Header Card - Always Visible -->
            <v-card-text class="mobile-card-header">
                <v-row no-gutters align="center">
                    <v-col cols="1" class="text-center">
                        <span class="mobile-number">{{ index + 1 }}</span>
                    </v-col>

                    <v-col cols="9" class="pl-3">
                        <div class="mobile-toko-name">
                            <strong>{{ item.nama_toko || 'Nama Toko Tidak Tersedia' }}</strong>
                        </div>
                        <div class="mobile-toko-preview">
                            {{ item.cabang || 'Tidak ada cabang' }}
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
                                <strong>Nama Toko:</strong>
                            </v-col>
                            <v-col cols="12" class="detail-value">
                                {{ item.nama_toko || '-' }}
                            </v-col>
                        </v-row>

                        <v-row class="mb-3">
                            <v-col cols="12" class="detail-label">
                                <strong>Cabang:</strong>
                            </v-col>
                            <v-col cols="12" class="detail-value">
                                {{ item.cabang || '-' }}
                            </v-col>
                        </v-row>

                        <v-row class="mb-3">
                            <v-col cols="12" class="detail-label">
                                <strong>Alamat:</strong>
                            </v-col>
                            <v-col cols="12" class="detail-value description-text">
                                {{ item.alamat || 'Tidak ada alamat' }}
                            </v-col>
                        </v-row>

                        <!-- Action Buttons -->
                        <v-divider class="mb-3"></v-divider>
                        <div class="mobile-actions">
                            <v-btn size="small" color="info" @click.stop="openMaps(item.link_maps, item.alamat)"
                                class="mr-2 mb-2" prepend-icon="mdi-directions" style="min-width: 120px;">
                                Rute
                            </v-btn>

                            <v-btn size="small" :color="app.colors.primary" @click.stop="editToko(item.id)"
                                class="mr-2 mb-2" prepend-icon="mdi-pencil" style="min-width: 120px;">
                                Edit
                            </v-btn>

                            <v-btn size="small" :color="app.colors.secondary" @click.stop="deleteToko(item.id)"
                                class="mb-2" prepend-icon="mdi-delete" style="min-width: 120px;">
                                Hapus
                            </v-btn>
                        </div>

                    </v-card-text>
                </div>
            </v-expand-transition>
        </v-card>
    </div>

    <!-- Dialog Tambah Toko -->
    <v-dialog v-model="isShowDialogAdd" persistent :width="$vuetify.display.mobile ? '95%' : '700'">
        <v-card class="custom-dialog">
            <v-card-title class="dialog-header">
                <v-icon class="mr-2" style="color: #FFD700;">mdi-plus-circle</v-icon>
                <span class="dialog-title">TAMBAH DATA STORE BABA PARFUME</span>
            </v-card-title>
            <v-card-text class="dialog-content">
                <v-row>
                    <v-col cols="12">
                        <v-text-field label="Nama Toko" v-model="modelAdd.nama_toko" class="mb-2 mt-4"
                            :rules="[rules.required]" required />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field label="Cabang" v-model="modelAdd.cabang" class="mb-2" :rules="[rules.required]"
                            required />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-textarea label="Alamat" v-model="modelAdd.alamat" class="mb-2" rows="3"
                            :rules="[rules.required]" required />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field label="Link Maps" v-model="modelAdd.link_maps" class="mb-2"
                            hint="Masukkan link Google Maps embed" persistent-hint />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions class="dialog-actions">
                <v-spacer></v-spacer>
                <v-btn :color="app.colors.secondary" @click="isShowDialogAdd = false" class="ml-2">
                    Batal
                </v-btn>
                <v-btn :color="app.colors.primary" @click="addToko()" :loading="isButtonLoading" class="ml-2">
                    Simpan
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Dialog Edit Toko -->
    <v-dialog v-model="isShowDialogEdit" persistent :width="$vuetify.display.mobile ? '95%' : '700'">
        <v-card class="custom-dialog">
            <v-card-title class="dialog-header">
                <v-icon class="mr-2" style="color: #FFD700;">mdi-pencil</v-icon>
                <span class="dialog-title">EDIT DATA STORE BABA PARFUME</span>
            </v-card-title>
            <v-card-text class="dialog-content">
                <v-row>
                    <v-col cols="12">
                        <v-text-field label="Nama Toko" v-model="modelEdit.nama_toko" class="mb-2 mt-4"
                            :rules="[rules.required]" required />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field label="Cabang" v-model="modelEdit.cabang" class="mb-2" :rules="[rules.required]"
                            required />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-textarea label="Alamat" v-model="modelEdit.alamat" class="mb-2" rows="3"
                            :rules="[rules.required]" required />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field label="Link Maps" v-model="modelEdit.link_maps" class="mb-2"
                            hint="Masukkan link Google Maps embed" persistent-hint />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions class="dialog-actions">
                <v-spacer></v-spacer>
                <v-btn :color="app.colors.secondary" @click="isShowDialogEdit = false" class="ml-2">
                    Batal
                </v-btn>
                <v-btn :color="app.colors.primary" @click="updateToko()" :loading="isButtonLoading" class="ml-2">
                    Update
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Dialog Delete Confirmation -->
    <v-dialog v-model="isShowDialogDelete" :max-width="$vuetify.display.mobile ? '95%' : '500px'">
        <v-card :color="this.app.colors.background">
            <v-card-title class="text-h5">Apakah anda yakin ingin menghapus data toko ini?</v-card-title>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :color="app.colors.primary" @click="isShowDialogDelete = false">
                    Cancel
                </v-btn>
                <v-btn :color="app.colors.secondary" @click="confirmDeleteToko(modelDelete.id)"
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
import { useAppStore } from "@/stores/app.js";
import axios from "axios";
import Cookies from "js-cookie";

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

            rules: {
                required: value => !!value || 'Field ini wajib diisi'
            },

            title: "DATA STORE BABA PARFUME",
            itemsBreadcrumb: [
                {
                    title: "Dashboard",
                    disabled: false,
                    href: "/admin/dashboard",
                },
                {
                    title: "STORE BABA PARFUME",
                    disabled: false,
                    href: "/admin/toko-internal",
                },
            ],
            isShowDialogAdd: false,
            isShowDialogEdit: false,
            isButtonLoading: false,
            isShowDialogDelete: false,
            datatable: {
                search: "",
                headers: [
                    { key: "no", title: "No", sortable: false },
                    { key: "nama_toko", title: "Nama Toko" },
                    { key: "cabang", title: "Cabang" },
                    { key: "alamat", title: "Alamat" },
                    { key: "action", title: "Actions", sortable: false, align: "center" },
                ],
                items: [],
            },
            modelAdd: {
                nama_toko: "",
                cabang: "",
                alamat: "",
                link_maps: "",
            },
            modelEdit: {
                id: "",
                nama_toko: "",
                cabang: "",
                alamat: "",
                link_maps: "",
            },
            modelDelete: {
                id: "",
            },
            isTableLoading: true,
        };
    },

    computed: {
        filteredItems() {
            if (!this.datatable.search) {
                return this.datatable.items;
            }

            const searchTerm = this.datatable.search.toLowerCase();
            return this.datatable.items.filter(item => {
                return (
                    (item.nama_toko && item.nama_toko.toLowerCase().includes(searchTerm)) ||
                    (item.cabang && item.cabang.toLowerCase().includes(searchTerm)) ||
                    (item.alamat && item.alamat.toLowerCase().includes(searchTerm))
                );
            });
        }
    },

    methods: {
        openMaps(linkMaps, alamat) {
            if (linkMaps || alamat) {
                // Jika ada link maps, buka langsung dengan opsi directions
                if (linkMaps) {
                    // Extract coordinates atau place info dari embed link jika memungkinkan
                    // Atau langsung buka dengan directions ke alamat
                    const mapsUrl = `https://www.google.com/maps/dir//${encodeURIComponent(alamat)}`;
                    window.open(mapsUrl, '_blank');
                } else {
                    // Jika hanya ada alamat, buka directions ke alamat tersebut
                    const mapsUrl = `https://www.google.com/maps/dir//${encodeURIComponent(alamat)}`;
                    window.open(mapsUrl, '_blank');
                }
            } else {
                this.showSnackbar({ data: { message: "Alamat atau link Maps tidak tersedia" } }, true);
            }
        },

        toggleMobileDetail(itemId) {
            if (this.expandedMobileCard === itemId) {
                this.expandedMobileCard = null;
            } else {
                this.expandedMobileCard = itemId;
            }
        },

        showSnackbar(response, isError = false) {
            this.contentSnackbar.snackbar = true;

            let message = '';
            if (response && response.data) {
                message = response.data.message || response.data.error || '';

                if (response.data.errors && Array.isArray(response.data.errors)) {
                    message = response.data.errors.join(', ');
                } else if (response.data.errors && typeof response.data.errors === 'object') {
                    const errorMessages = [];
                    for (const field in response.data.errors) {
                        if (Array.isArray(response.data.errors[field])) {
                            errorMessages.push(...response.data.errors[field]);
                        } else {
                            errorMessages.push(response.data.errors[field]);
                        }
                    }
                    message = errorMessages.join(', ');
                }
            }

            if (!message && response && response.message) {
                message = response.message;
            }

            if (!message) {
                message = isError ? 'Terjadi kesalahan tidak terduga' : 'Operasi berhasil';
            }

            this.contentSnackbar.text = message;
            this.contentSnackbar.color = isError ? this.app.colors.secondary : this.app.colors.primary;
        },

        updateCurrentPageInfo(options) {
            this.currentPage = options.page;
            this.itemsPerPage = options.itemsPerPage;
        },

        showDialogFormAddToko() {
            this.isShowDialogAdd = true;
            this.clearAddForm();
        },

        clearAddForm() {
            this.modelAdd.nama_toko = "";
            this.modelAdd.cabang = "";
            this.modelAdd.alamat = "";
            this.modelAdd.link_maps = "";
        },

        clearEditForm() {
            this.modelEdit.id = "";
            this.modelEdit.nama_toko = "";
            this.modelEdit.cabang = "";
            this.modelEdit.alamat = "";
            this.modelEdit.link_maps = "";
        },

        getAllToko() {
            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return;
            }

            this.isTableLoading = true;
            axios
                .get("https://babaapi.babaparfume.id/api/toko-internal", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    if (response.data.status === "success") {
                        this.datatable.items = response.data.data;
                    } else {
                        this.showSnackbar(response, true);
                    }
                })
                .catch((error) => {
                    this.showSnackbar(error.response || error, true);
                })
                .finally(() => {
                    this.isTableLoading = false;
                });
        },

        addToko() {
            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return;
            }

            if (!this.modelAdd.nama_toko || !this.modelAdd.cabang || !this.modelAdd.alamat) {
                this.showSnackbar({ data: { message: "Nama Toko, Cabang, dan Alamat harus diisi" } }, true);
                return;
            }

            this.isButtonLoading = true;
            axios
                .post(
                    "https://babaapi.babaparfume.id/api/toko-internal",
                    {
                        nama_toko: this.modelAdd.nama_toko,
                        cabang: this.modelAdd.cabang,
                        alamat: this.modelAdd.alamat,
                        link_maps: this.modelAdd.link_maps,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        },
                    }
                )
                .then((response) => {
                    this.getAllToko();
                    this.isShowDialogAdd = false;
                    this.showSnackbar(response, false);
                    this.clearAddForm();
                })
                .catch((error) => {
                    this.showSnackbar(error.response || error, true);
                })
                .finally(() => {
                    this.isButtonLoading = false;
                });
        },

        editToko(id) {
            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return;
            }

            this.expandedMobileCard = null;
            this.clearEditForm();
            this.isShowDialogEdit = true;

            axios
                .get(`https://babaapi.babaparfume.id/api/toko-internal/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    if (response.data.status === "success") {
                        const tokoData = response.data.data;
                        this.modelEdit.id = tokoData.id;
                        this.modelEdit.nama_toko = tokoData.nama_toko || "";
                        this.modelEdit.cabang = tokoData.cabang || "";
                        this.modelEdit.alamat = tokoData.alamat || "";
                        this.modelEdit.link_maps = tokoData.link_maps || "";
                    } else {
                        this.showSnackbar(response, true);
                        this.isShowDialogEdit = false;
                    }
                })
                .catch((error) => {
                    this.showSnackbar(error.response || error, true);
                    this.isShowDialogEdit = false;
                });
        },

        updateToko() {
            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return;
            }

            if (!this.modelEdit.nama_toko || !this.modelEdit.cabang || !this.modelEdit.alamat) {
                this.showSnackbar({ data: { message: "Nama Toko, Cabang, dan Alamat harus diisi" } }, true);
                return;
            }

            const updateData = {
                nama_toko: this.modelEdit.nama_toko,
                cabang: this.modelEdit.cabang,
                alamat: this.modelEdit.alamat,
                link_maps: this.modelEdit.link_maps,
            };

            this.isButtonLoading = true;
            axios
                .put(
                    `https://babaapi.babaparfume.id/api/toko-internal/${this.modelEdit.id}`,
                    updateData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        },
                    }
                )
                .then((response) => {
                    this.getAllToko();
                    this.showSnackbar(response, false);
                    this.isShowDialogEdit = false;
                    this.clearEditForm();
                })
                .catch((error) => {
                    this.showSnackbar(error.response || error, true);
                })
                .finally(() => {
                    this.isButtonLoading = false;
                });
        },

        deleteToko(id) {
            this.expandedMobileCard = null;
            this.isShowDialogDelete = true;
            this.modelDelete.id = id;
        },

        confirmDeleteToko(id) {
            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return;
            }

            this.isButtonLoading = true;
            axios
                .delete(`https://babaapi.babaparfume.id/api/toko-internal/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                })
                .then((response) => {
                    this.getAllToko();
                    this.showSnackbar(response, false);
                })
                .catch((error) => {
                    this.showSnackbar(error.response || error, true);
                })
                .finally(() => {
                    this.isButtonLoading = false;
                    this.isShowDialogDelete = false;
                });
        },
    },

    created() {
        this.getAllToko();
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
    background-color: #888888 !important;
    color: #FFD700 !important;
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

.mobile-toko-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
    background: #ffffff;
}

.mobile-toko-card:hover {
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

.mobile-toko-name {
    font-size: 16px;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 4px;
}

.mobile-toko-preview {
    font-size: 14px;
    color: #666;
    font-style: italic;
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

.description-text {
    text-align: justify;
    max-height: 120px;
    overflow-y: auto;
    padding: 8px;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}

.mobile-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.mobile-actions .v-btn {
    flex: 1;
    min-width: auto;
}

.rotate-180 {
    transform: rotate(180deg);
}

.transition-all {
    transition: transform 0.3s ease;
}

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

@media (max-width: 600px) {
    .dialog-content {
        padding: 16px !important;
    }

    .dialog-actions {
        padding: 12px 16px !important;
    }

    .dialog-header {
        padding: 16px !important;
        font-size: 16px;
    }

    .mobile-actions .v-btn {
        font-size: 12px;
        padding: 0 8px;
    }

    .mobile-toko-card {
        margin-left: 8px;
        margin-right: 8px;
    }

    .mobile-header-card {
        margin-left: 8px;
        margin-right: 8px;
    }
}

@media (max-width: 960px) {
    .mobile-actions .v-btn {
        font-size: 12px;
        padding: 0 8px;
    }
}
</style>