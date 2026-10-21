<template>
    <Breadcrumb :items="itemsBreadcrumb" />

    <!-- Add Button - Responsive -->
    <div class="add-button-container mb-4">
        <v-btn class="text-white font-semibold add-button" @click="showDialogFormAddCode()"
            :class="{ 'mobile-add-button': $vuetify.display.mobile }">
            <v-icon start style="color: #E6B422;">mdi-account-plus</v-icon>
            <span class="ml-2">{{ $vuetify.display.mobile ? 'Tambah Data Cabang' : 'Tambah Data Cabang' }}</span>
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
                    <template v-slot:item.warna="{ item }">
                        <v-chip v-if="item.warna"
                            :style="{ backgroundColor: item.warna, color: getContrastColor(item.warna) }" size="small"
                            class="color-chip">
                            {{ item.warna }}
                        </v-chip>
                        <span v-else class="text-grey">-</span>
                    </template>
                    <template v-slot:item.foto_ruang_kota="{ item }">
                        <v-tooltip v-if="item.foto_ruang_kota" text="Klik untuk melihat gambar" location="top">
                            <template v-slot:activator="{ props }">
                                <v-btn icon variant="text"
                                    @click="showImageDialog(item.foto_ruang_kota, 'Foto Ruang Kota')"
                                    class="file-icon-btn" v-bind="props">
                                    <v-icon size="32" color="#E6B422">mdi-file-image</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>
                        <span v-else class="text-grey">-</span>
                    </template>
                    <template v-slot:item.foto_mvo="{ item }">
                        <v-tooltip v-if="item.foto_mvo" text="Klik untuk melihat gambar" location="top">
                            <template v-slot:activator="{ props }">
                                <v-btn icon variant="text" @click="showImageDialog(item.foto_mvo, 'Foto MVO')"
                                    class="file-icon-btn" v-bind="props">
                                    <v-icon size="32" color="#E6B422">mdi-file-image</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>
                        <span v-else class="text-grey">-</span>
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

        <v-progress-linear v-if="isTableLoading" indeterminate color="#E6B422" class="mb-4"></v-progress-linear>

        <div v-if="filteredMobileItems.length === 0 && !isTableLoading" class="text-center pa-4">
            <v-icon size="64" color="grey">mdi-map-marker-outline</v-icon>
            <p class="text-grey mt-2">Tidak ada data Cabang ditemukan</p>
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
                            <v-chip color="#141414" size="x-small" variant="flat" class="mr-1 mb-1">
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

                        <v-row class="mb-3">
                            <v-col cols="4" class="detail-label">
                                <strong>Pimpinan:</strong>
                            </v-col>
                            <v-col cols="8" class="detail-value">
                                {{ item.pimpinan || '-' }}
                            </v-col>
                        </v-row>

                        <v-row class="mb-3">
                            <v-col cols="4" class="detail-label">
                                <strong>Warna:</strong>
                            </v-col>
                            <v-col cols="8" class="detail-value">
                                <v-chip v-if="item.warna"
                                    :style="{ backgroundColor: item.warna, color: getContrastColor(item.warna) }"
                                    size="small">
                                    {{ item.warna }}
                                </v-chip>
                                <span v-else>-</span>
                            </v-col>
                        </v-row>

                        <v-row class="mb-3">
                            <v-col cols="4" class="detail-label">
                                <strong>Foto Ruang:</strong>
                            </v-col>
                            <v-col cols="8" class="detail-value">
                                <div v-if="item.foto_ruang_kota" class="mobile-image-detail"
                                    @click.stop="showImageDialog(item.foto_ruang_kota, 'Foto Ruang Kota')">
                                    <v-img :src="getImageUrl(item.foto_ruang_kota)" max-height="80" contain
                                        class="mobile-detail-image" @error="handleImageError($event, 'ruang')">
                                        <template v-slot:placeholder>
                                            <div class="d-flex align-center justify-center fill-height">
                                                <v-progress-circular color="grey-lighten-4"
                                                    indeterminate></v-progress-circular>
                                            </div>
                                        </template>
                                        <template v-slot:error>
                                            <div class="d-flex align-center justify-center fill-height">
                                                <v-icon size="32" color="grey">mdi-image-broken</v-icon>
                                            </div>
                                        </template>
                                    </v-img>
                                    <div class="image-overlay">
                                        <v-icon color="white" size="32">mdi-magnify</v-icon>
                                    </div>
                                </div>
                                <span v-else>-</span>
                            </v-col>
                        </v-row>

                        <v-row class="mb-3">
                            <v-col cols="4" class="detail-label">
                                <strong>Foto MVO:</strong>
                            </v-col>
                            <v-col cols="8" class="detail-value">
                                <div v-if="item.foto_mvo" class="mobile-image-detail"
                                    @click.stop="showImageDialog(item.foto_mvo, 'Foto MVO')">
                                    <v-img :src="getImageUrl(item.foto_mvo)" max-height="80" contain
                                        class="mobile-detail-image" @error="handleImageError($event, 'mvo')">
                                        <template v-slot:placeholder>
                                            <div class="d-flex align-center justify-center fill-height">
                                                <v-progress-circular color="grey-lighten-4"
                                                    indeterminate></v-progress-circular>
                                            </div>
                                        </template>
                                        <template v-slot:error>
                                            <div class="d-flex align-center justify-center fill-height">
                                                <v-icon size="32" color="grey">mdi-image-broken</v-icon>
                                            </div>
                                        </template>
                                    </v-img>
                                    <div class="image-overlay">
                                        <v-icon color="white" size="32">mdi-magnify</v-icon>
                                    </div>
                                </div>
                                <span v-else>-</span>
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
            <v-pagination v-model="currentMobilePage" :length="totalMobilePages" :total-visible="5" color="#E6B422"
                class="custom-pagination"></v-pagination>
        </div>
    </div>

    <!-- Dialog Data Cabang Dsain mobile -->
    <v-dialog v-model="isShowDialogAdd" persistent :width="$vuetify.display.mobile ? '95%' : '800'" scrollable>
        <v-card class="custom-dialog">
            <v-card-title class="dialog-header">
                <v-icon class="mr-2" style="color: #E6B422;">mdi-account-plus</v-icon>
                <span class="dialog-title">TAMBAH DATA CABANG</span>
            </v-card-title>
            <v-card-text class="dialog-content" style="max-height: 70vh;">
                <v-row>
                    <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                        <v-text-field label="Code Cabang" v-model="modelAdd.code" variant="outlined" />
                    </v-col>
                    <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                        <v-text-field label="Nama Cabang" v-model="modelAdd.name" variant="outlined" />
                    </v-col>
                    <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                        <v-text-field label="Pimpinan" v-model="modelAdd.pimpinan" variant="outlined" />
                    </v-col>
                    <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                        <v-text-field label="Warna (HEX)" v-model="modelAdd.warna" variant="outlined"
                            placeholder="#FFFFFF">
                            <template v-slot:append>
                                <v-menu :close-on-content-click="false">
                                    <template v-slot:activator="{ props }">
                                        <v-btn :color="modelAdd.warna || '#FFFFFF'" v-bind="props" icon size="small"
                                            class="color-picker-btn">
                                            <v-icon>mdi-palette</v-icon>
                                        </v-btn>
                                    </template>
                                    <v-color-picker v-model="modelAdd.warna" mode="hex" :modes="['hex']" show-swatches
                                        hide-inputs></v-color-picker>
                                </v-menu>
                            </template>
                        </v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-file-input label="Foto Ruang Kota" v-model="modelAdd.foto_ruang_kota" accept="image/*"
                            prepend-icon="mdi-camera" variant="outlined" @change="onFileChangeAdd('ruang', $event)"
                            :clearable="true">
                        </v-file-input>
                        <div v-if="previewAdd.ruang" class="mt-2 text-center">
                            <v-img :src="previewAdd.ruang" max-height="200" contain></v-img>
                        </div>
                    </v-col>
                    <v-col cols="12">
                        <v-file-input label="Foto MVO" v-model="modelAdd.foto_mvo" accept="image/*"
                            prepend-icon="mdi-camera" variant="outlined" @change="onFileChangeAdd('mvo', $event)"
                            :clearable="true">
                        </v-file-input>
                        <div v-if="previewAdd.mvo" class="mt-2 text-center">
                            <v-img :src="previewAdd.mvo" max-height="200" contain></v-img>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions class="dialog-actions">
                <v-spacer></v-spacer>
                <v-btn :color="app.colors.secondary" @click="cancelAddDialog()" class="ml-2">
                    Batal
                </v-btn>
                <v-btn :color="app.colors.primary" @click="addCode()" :loading="isButtonLoading" class="ml-2">
                    Simpan
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Dialog Edit Code -->
    <v-dialog v-model="isShowDialogEdit" persistent :width="$vuetify.display.mobile ? '95%' : '800'" scrollable>
        <v-card class="custom-dialog">
            <v-card-title class="dialog-header">
                <v-icon class="mr-2" style="color: #E6B422;">mdi-account-edit</v-icon>
                <span class="dialog-title">EDIT DATA CABANG</span>
            </v-card-title>
            <v-card-text class="dialog-content" style="max-height: 70vh;">
                <v-row>
                    <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                        <v-text-field label="Code Cabang" v-model="modelEdit.code" variant="outlined" />
                    </v-col>
                    <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                        <v-text-field label="Nama Cabang" v-model="modelEdit.name" variant="outlined" />
                    </v-col>
                    <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                        <v-text-field label="Pimpinan" v-model="modelEdit.pimpinan" variant="outlined" />
                    </v-col>
                    <v-col :cols="$vuetify.display.mobile ? 12 : 6">
                        <v-text-field label="Warna (HEX)" v-model="modelEdit.warna" variant="outlined"
                            placeholder="#FFFFFF">
                            <template v-slot:append>
                                <v-menu :close-on-content-click="false">
                                    <template v-slot:activator="{ props }">
                                        <v-btn :color="modelEdit.warna || '#FFFFFF'" v-bind="props" icon size="small"
                                            class="color-picker-btn">
                                            <v-icon>mdi-palette</v-icon>
                                        </v-btn>
                                    </template>
                                    <v-color-picker v-model="modelEdit.warna" mode="hex" :modes="['hex']" show-swatches
                                        hide-inputs></v-color-picker>
                                </v-menu>
                            </template>
                        </v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <v-file-input label="Foto Ruang Kota (Kosongkan jika tidak ingin mengubah)"
                            v-model="modelEdit.foto_ruang_kota" accept="image/*" prepend-icon="mdi-camera"
                            variant="outlined" @change="onFileChangeEdit('ruang', $event)" :clearable="true">
                        </v-file-input>
                        <div v-if="previewEdit.ruang" class="mt-2 text-center">
                            <v-img :src="previewEdit.ruang" max-height="200" contain></v-img>
                        </div>
                        <div v-else-if="modelEdit.existing_foto_ruang_kota" class="mt-2 text-center">
                            <p class="text-caption mb-2">Foto Saat Ini:</p>
                            <v-img :src="getImageUrl(modelEdit.existing_foto_ruang_kota)" max-height="200"
                                contain></v-img>
                        </div>
                    </v-col>
                    <v-col cols="12">
                        <v-file-input label="Foto MVO (Kosongkan jika tidak ingin mengubah)"
                            v-model="modelEdit.foto_mvo" accept="image/*" prepend-icon="mdi-camera" variant="outlined"
                            @change="onFileChangeEdit('mvo', $event)" :clearable="true">
                        </v-file-input>
                        <div v-if="previewEdit.mvo" class="mt-2 text-center">
                            <v-img :src="previewEdit.mvo" max-height="200" contain></v-img>
                        </div>
                        <div v-else-if="modelEdit.existing_foto_mvo" class="mt-2 text-center">
                            <p class="text-caption mb-2">Foto Saat Ini:</p>
                            <v-img :src="getImageUrl(modelEdit.existing_foto_mvo)" max-height="200" contain></v-img>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions class="dialog-actions">
                <v-spacer></v-spacer>
                <v-btn :color="app.colors.secondary" @click="cancelEditDialog()" class="ml-2">
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
                Apakah anda yakin ingin menghapus data Cabang ini?
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

    <!-- Dialog View Image -->
    <v-dialog v-model="isShowDialogImage" :max-width="$vuetify.display.mobile ? '95%' : '800px'">
        <v-card>
            <v-card-title class="dialog-header text-center">
                <v-icon class="mr-2" style="color: #E6B422;">mdi-image</v-icon>
                <span class="dialog-title">{{ imagePreviewTitle }}</span>
            </v-card-title>
            <v-card-text class="pa-4">
                <div class="text-center">
                    <v-img :src="imagePreviewUrl" max-height="500" contain class="rounded" @error="handleImageError">
                        <template v-slot:placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                                <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                            </div>
                        </template>
                        <template v-slot:error>
                            <div class="d-flex align-center justify-center fill-height">
                                <v-icon size="64" color="grey">mdi-image-broken</v-icon>
                                <p class="ml-2">Gambar tidak dapat dimuat</p>
                            </div>
                        </template>
                    </v-img>
                </div>
            </v-card-text>
            <v-card-actions class="dialog-actions">
                <v-spacer></v-spacer>
                <v-btn :color="app.colors.primary" @click="isShowDialogImage = false">
                    Tutup
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
import { API_URL, FILE_URL } from "@/config";
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
            // Base URL untuk gambar
            baseImageUrl: `${FILE_URL}/`,

            // Mobile specific properties
            expandedMobileCard: null,
            currentMobilePage: 1,
            itemsPerMobilePage: 1000,

            currentPage: 1,
            itemsPerPage: 1000,
            contentSnackbar: {
                snackbar: false,
                text: "",
                color: "",
            },

            title: "DATA CABANG",
            itemsBreadcrumb: [
                {
                    title: "Dashboard",
                    disabled: false,
                    href: "/admin/dashboard",
                },
                {
                    title: "Data Cabang",
                    disabled: false,
                    href: "/admin/provinsi",
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
                    { key: "pimpinan", title: "Pimpinan" },
                    { key: "warna", title: "Warna", align: "center" },
                    { key: "foto_ruang_kota", title: "Foto Ruang", align: "center", sortable: false },
                    { key: "foto_mvo", title: "Foto MVO", align: "center", sortable: false },
                    { key: "action", title: "Actions", sortable: false, align: "center" }
                ],
                items: [],
            },
            modelAdd: {
                code: "",
                name: "",
                pimpinan: "",
                foto_ruang_kota: null,
                foto_mvo: null,
                warna: "#FFFFFF",
            },
            modelEdit: {
                id: "",
                code: "",
                name: "",
                pimpinan: "",
                foto_ruang_kota: null,
                foto_mvo: null,
                warna: "#FFFFFF",
                existing_foto_ruang_kota: "",
                existing_foto_mvo: "",
            },
            modelDelete: {
                id: "",
            },
            previewAdd: {
                ruang: null,
                mvo: null,
            },
            previewEdit: {
                ruang: null,
                mvo: null,
            },
            // Menyimpan File object yang sebenarnya
            fileAdd: {
                ruang: null,
                mvo: null,
            },
            fileEdit: {
                ruang: null,
                mvo: null,
            },
            isShowDialogImage: false,
            imagePreviewUrl: "",
            imagePreviewTitle: "",
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
                        (item.name && item.name.toLowerCase().includes(searchTerm)) ||
                        (item.pimpinan && item.pimpinan.toLowerCase().includes(searchTerm))
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
        // Method untuk mendapatkan URL gambar yang benar
        getImageUrl(imagePath) {
            if (!imagePath) return '';

            // Jika sudah berupa URL lengkap, return as is
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                return imagePath;
            }

            // Jika path dimulai dengan slash, hilangkan
            const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

            // Gabungkan base URL dengan path
            return `${this.baseImageUrl}${cleanPath}`;
        },

        // Show image in dialog
        showImageDialog(imagePath, title = 'Preview Gambar') {

            if (!imagePath) {
                this.contentSnackbar.snackbar = true;
                this.contentSnackbar.text = "Path gambar tidak tersedia";
                this.contentSnackbar.color = this.app.colors.secondary;
                return;
            }

            // Close mobile expansion if open
            this.expandedMobileCard = null;

            // Gunakan method getImageUrl untuk mendapatkan URL yang benar
            const imageUrl = this.getImageUrl(imagePath);


            this.imagePreviewUrl = imageUrl;
            this.imagePreviewTitle = title;
            this.isShowDialogImage = true;
        },

        // Get contrast color for text on colored background
        getContrastColor(hexColor) {
            if (!hexColor) return '#000000';

            // Remove # if present
            const hex = hexColor.replace('#', '');

            // Convert to RGB
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);

            // Calculate luminance
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

            // Return black or white based on luminance
            return luminance > 0.5 ? '#000000' : '#FFFFFF';
        },

        // Image error handler
        handleImageError(event, type) {
            console.error('Image load error:', event);
            event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZTBlMGUwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OL0E8L3RleHQ+PC9zdmc+';
        },

        // PERBAIKAN: Handler untuk file change pada Add dialog
        onFileChangeAdd(type, event) {
            const files = event.target.files || event;
            const file = files && files.length > 0 ? files[0] : null;


            if (file) {
                // Simpan file object yang sebenarnya
                if (type === 'ruang') {
                    this.fileAdd.ruang = file;
                } else if (type === 'mvo') {
                    this.fileAdd.mvo = file;
                }

                // Buat preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (type === 'ruang') {
                        this.previewAdd.ruang = e.target.result;
                    } else if (type === 'mvo') {
                        this.previewAdd.mvo = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            } else {
                // Clear file dan preview
                if (type === 'ruang') {
                    this.fileAdd.ruang = null;
                    this.previewAdd.ruang = null;
                } else if (type === 'mvo') {
                    this.fileAdd.mvo = null;
                    this.previewAdd.mvo = null;
                }
            }
        },

        // PERBAIKAN: Handler untuk file change pada Edit dialog
        onFileChangeEdit(type, event) {
            const files = event.target.files || event;
            const file = files && files.length > 0 ? files[0] : null;


            if (file) {
                // Simpan file object yang sebenarnya
                if (type === 'ruang') {
                    this.fileEdit.ruang = file;
                } else if (type === 'mvo') {
                    this.fileEdit.mvo = file;
                }

                // Buat preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (type === 'ruang') {
                        this.previewEdit.ruang = e.target.result;
                    } else if (type === 'mvo') {
                        this.previewEdit.mvo = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            } else {
                // Clear file dan preview
                if (type === 'ruang') {
                    this.fileEdit.ruang = null;
                    this.previewEdit.ruang = null;
                } else if (type === 'mvo') {
                    this.fileEdit.mvo = null;
                    this.previewEdit.mvo = null;
                }
            }
        },

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
            this.modelAdd.pimpinan = "";
            this.modelAdd.foto_ruang_kota = null;
            this.modelAdd.foto_mvo = null;
            this.modelAdd.warna = "#FFFFFF";
            this.previewAdd.ruang = null;
            this.previewAdd.mvo = null;
            this.fileAdd.ruang = null;
            this.fileAdd.mvo = null;
        },

        clearEditForm() {
            this.modelEdit.id = "";
            this.modelEdit.code = "";
            this.modelEdit.name = "";
            this.modelEdit.pimpinan = "";
            this.modelEdit.foto_ruang_kota = null;
            this.modelEdit.foto_mvo = null;
            this.modelEdit.warna = "#FFFFFF";
            this.modelEdit.existing_foto_ruang_kota = "";
            this.modelEdit.existing_foto_mvo = "";
            this.previewEdit.ruang = null;
            this.previewEdit.mvo = null;
            this.fileEdit.ruang = null;
            this.fileEdit.mvo = null;
        },

        cancelAddDialog() {
            this.isShowDialogAdd = false;
            this.clearAddForm();
        },

        cancelEditDialog() {
            this.isShowDialogEdit = false;
            this.clearEditForm();
        },

        getAllcode() {
            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return;
            }

            this.isTableLoading = true;
            axios
                .get(`${API_URL}/api/provinsi`, {
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

        // PERBAIKAN: Method addCode
        addCode() {
            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return;
            }

            // Basic validation
            if (!this.modelAdd.code || !this.modelAdd.name) {
                this.contentSnackbar.snackbar = true;
                this.contentSnackbar.text = "Code dan Nama Cabang harus diisi";
                this.contentSnackbar.color = this.app.colors.secondary;
                return;
            }

            // Validate color format
            if (this.modelAdd.warna && !this.modelAdd.warna.match(/^#([0-9A-F]{6}|[0-9a-f]{6})$/)) {
                this.contentSnackbar.snackbar = true;
                this.contentSnackbar.text = "Format warna harus HEX (contoh: #FFFFFF)";
                this.contentSnackbar.color = this.app.colors.secondary;
                return;
            }

            this.isButtonLoading = true;

            // Create FormData untuk file upload
            const formData = new FormData();
            formData.append('code', this.modelAdd.code);
            formData.append('name', this.modelAdd.name);
            formData.append('pimpinan', this.modelAdd.pimpinan || '');
            formData.append('warna', this.modelAdd.warna);

            // PERBAIKAN: Gunakan file object yang disimpan dari fileAdd
            if (this.fileAdd.ruang) {
                formData.append('foto_ruang_kota', this.fileAdd.ruang);
            }

            if (this.fileAdd.mvo) {
                formData.append('foto_mvo', this.fileAdd.mvo);
            }

            // Log FormData untuk debugging
            for (let pair of formData.entries()) {
            }

            axios
                .post(
                    `${API_URL}/api/provinsi`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                )
                .then((response) => {
                    this.getAllcode();
                    this.isShowDialogAdd = false;
                    this.clearAddForm();
                    this.contentSnackbar.snackbar = true;
                    this.contentSnackbar.text = response.data.message || "Data Cabang berhasil ditambah";
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
                .get(`${API_URL}/api/provinsi/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    if (response.data.status === "success") {
                        this.modelEdit.id = response.data.data.id;
                        this.modelEdit.code = response.data.data.code;
                        this.modelEdit.name = response.data.data.name;
                        this.modelEdit.pimpinan = response.data.data.pimpinan || '';
                        this.modelEdit.warna = response.data.data.warna || '#FFFFFF';
                        this.modelEdit.existing_foto_ruang_kota = response.data.data.foto_ruang_kota || '';
                        this.modelEdit.existing_foto_mvo = response.data.data.foto_mvo || '';
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

        // PERBAIKAN: Method updateCode
        updateCode() {
            const token = Cookies.get("token");
            if (!token) {
                this.$router.push({ name: "Login" });
                return;
            }

            // Basic validation
            if (!this.modelEdit.code || !this.modelEdit.name) {
                this.contentSnackbar.snackbar = true;
                this.contentSnackbar.text = "Code dan Nama Cabang harus diisi";
                this.contentSnackbar.color = this.app.colors.secondary;
                return;
            }

            // Validate color format
            if (this.modelEdit.warna && !this.modelEdit.warna.match(/^#([0-9A-F]{6}|[0-9a-f]{6})$/)) {
                this.contentSnackbar.snackbar = true;
                this.contentSnackbar.text = "Format warna harus HEX (contoh: #FFFFFF)";
                this.contentSnackbar.color = this.app.colors.secondary;
                return;
            }

            this.isButtonLoading = true;

            // Create FormData untuk file upload
            const formData = new FormData();
            formData.append('code', this.modelEdit.code);
            formData.append('name', this.modelEdit.name);
            formData.append('pimpinan', this.modelEdit.pimpinan || '');
            formData.append('warna', this.modelEdit.warna);
            formData.append('_method', 'POST'); // Laravel method spoofing untuk PUT request

            // PERBAIKAN: Gunakan file object yang disimpan dari fileEdit
            if (this.fileEdit.ruang) {
                formData.append('foto_ruang_kota', this.fileEdit.ruang);
            }

            if (this.fileEdit.mvo) {
                formData.append('foto_mvo', this.fileEdit.mvo);
            }

            // Log FormData untuk debugging
            for (let pair of formData.entries()) {
            }

            axios
                .post(
                    `${API_URL}/api/provinsi/${this.modelEdit.id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                )
                .then((response) => {
                    this.getAllcode();
                    this.contentSnackbar.snackbar = true;
                    this.contentSnackbar.text = response.data.message || "Data Cabang berhasil diupdate";
                    this.contentSnackbar.color = this.app.colors.primary;
                    this.isShowDialogEdit = false;
                    this.clearEditForm();
                })
                .catch((error) => {
                    this.contentSnackbar.snackbar = true;
                    this.contentSnackbar.text = error.response?.data?.message || "Error updating Cabang";
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
                .delete(`${API_URL}/api/provinsi/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                })
                .then((response) => {
                    this.getAllcode();
                    this.contentSnackbar.snackbar = true;
                    this.contentSnackbar.text = response.data.message || "Data Cabang berhasil dihapus";
                    this.contentSnackbar.color = this.app.colors.primary;
                })
                .catch((error) => {
                    this.contentSnackbar.snackbar = true;
                    this.contentSnackbar.text = error.response?.data?.message || "Error deleting Cabang";
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
    color: #E6B422 !important;
    border: 2px solid #E6B422 !important;
    border-radius: 12px !important;
}

/* Custom styling for file icon button */
.file-icon-btn {
    background-color: #f5f5f5 !important;
    border: 2px solid #E6B422 !important;
    border-radius: 8px !important;
    transition: all 0.3s ease !important;
}

.file-icon-btn:hover {
    background-color: #E6B422 !important;
    transform: scale(1.1);
}

.file-icon-btn:hover :deep(.v-icon) {
    color: #000000 !important;
}

/* Color Chip */
.color-chip {
    min-width: 100px;
    font-family: 'Courier New', monospace;
    font-weight: bold;
}

.color-picker-btn {
    border: 2px solid #e0e0e0;
}

/* Desktop Table */
:deep(.v-data-table) {
    border: 1px solid #000;
}

:deep(.v-data-table__th) {
    background-color: #888 !important;
    color: #E6B422 !important;
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

.rotate-180 {
    transform: rotate(180deg);
}

.transition-all {
    transition: transform 0.3s ease;
}

/* Dialogs */
.dialog-header {
    background: var(--baba-ink) !important;
    color: #E6B422 !important;
    padding: 20px 24px !important;
    border-bottom: 2px solid #E6B422;
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
    background: linear-gradient(90deg, transparent, rgba(230, 180, 34, 0.1), transparent);
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

/* Utilities */
.text-center.pa-4 {
    background: #f8f9fa;
    border-radius: 8px;
    margin: 0 8px;
    padding: 32px 16px !important;
}

/* Mobile Image Detail Styling */
.mobile-image-detail {
    position: relative;
    cursor: pointer;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #e0e0e0;
    transition: all 0.3s ease;
}

.mobile-image-detail:hover {
    border-color: #E6B422;
    box-shadow: 0 4px 12px rgba(230, 180, 34, 0.3);
}

.mobile-detail-image {
    background-color: #f5f5f5;
    border-radius: 8px;
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.mobile-image-detail:hover .image-overlay {
    opacity: 1;
}

.mobile-code-card:focus,
.mobile-action-btn:focus {
    outline: 2px solid #E6B422;
    outline-offset: 2px;
}

:deep(.v-progress-circular) {
    color: #E6B422 !important;
}

:deep(.v-progress-linear) {
    border-radius: 4px;
}

:deep(.v-chip) {
    font-weight: 500;
}

.detail-value .v-chip {
    font-family: 'Courier New', monospace;
}

/* Image preview in dialogs */
:deep(.v-img) {
    border-radius: 8px;
    border: 1px solid #e0e0e0;
}

:deep(.v-file-input) {
    margin-top: 8px;
}

/* Color picker styles */
:deep(.v-color-picker) {
    max-width: 300px;
}
</style>