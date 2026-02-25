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
                <v-data-table class="bg-grey-lighten-4 text-no-wrap" hover :headers="datatable.headers"
                    :items="datatable.items" :search="datatable.search" :loading="isTableLoading" :items-per-page="10"
                    @update:options="updateCurrentPageInfo">
                    <template v-slot:item.no="{ index }">
                        {{ ((currentPage - 1) * itemsPerPage) + index + 1 }}
                    </template>
                    <template v-slot:item.cabang="{ item }">
                        {{ item.provinsi ? item.provinsi.name : '-' }}
                    </template>
                    <template v-slot:item.alamat="{ item }">
                        <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            {{ item.alamat }}
                        </div>
                    </template>
                    <template v-slot:item.owner_toko="{ item }">
                        {{ item.owner_toko || '-' }}
                    </template>
                    <template v-slot:item.fotos="{ item }">
                        <div class="d-flex align-center">
                            <v-avatar v-if="item.fotos && item.fotos.length > 0" size="36" class="mr-1"
                                style="cursor:pointer;" @click="openFotoDialog(item)">
                                <v-img :src="getFotoUrl(item.fotos[0].file_path)" cover />
                            </v-avatar>
                            <v-chip v-if="item.fotos && item.fotos.length > 1" size="x-small" color="grey">
                                +{{ item.fotos.length - 1 }}
                            </v-chip>
                            <v-icon v-if="!item.fotos || item.fotos.length === 0" color="grey">mdi-image-off</v-icon>
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

                        <v-tooltip v-if="isSuperAdmin" text="Edit" color="#125C13" location="top start">
                            <template v-slot:activator="{ props }">
                                <v-btn size="small" :color="app.colors.primary" @click="editToko(item.id)"
                                    class="mr-2 mb-2" v-bind="props" icon>
                                    <v-icon>mdi-pencil</v-icon>
                                </v-btn>
                            </template>
                        </v-tooltip>

                        <v-tooltip v-if="isSuperAdmin" text="Hapus" color="#125C13" location="top start">
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
                            {{ item.provinsi ? item.provinsi.name : 'Tidak ada cabang' }}
                        </div>
                    </v-col>
                    <v-col cols="2" class="text-center">
                        <v-icon :class="{ 'rotate-180': expandedMobileCard === item.id }" class="transition-all">
                            mdi-chevron-down
                        </v-icon>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-expand-transition>
                <div v-show="expandedMobileCard === item.id">
                    <v-divider></v-divider>
                    <v-card-text class="mobile-card-details">
                        <v-row class="mb-3">
                            <v-col cols="12" class="detail-label"><strong>Nama Toko:</strong></v-col>
                            <v-col cols="12" class="detail-value">{{ item.nama_toko || '-' }}</v-col>
                        </v-row>
                        <v-row class="mb-3">
                            <v-col cols="12" class="detail-label"><strong>Owner Toko:</strong></v-col>
                            <v-col cols="12" class="detail-value">{{ item.owner_toko || '-' }}</v-col>
                        </v-row>
                        <v-row class="mb-3">
                            <v-col cols="12" class="detail-label"><strong>Cabang:</strong></v-col>
                            <v-col cols="12" class="detail-value">{{ item.provinsi ? item.provinsi.name : '-' }}</v-col>
                        </v-row>
                        <v-row class="mb-3">
                            <v-col cols="12" class="detail-label"><strong>Alamat:</strong></v-col>
                            <v-col cols="12" class="detail-value description-text">{{ item.alamat || 'Tidak ada alamat'
                            }}</v-col>
                        </v-row>

                        <!-- File Preview Fotos -->
                        <v-row class="mb-3" v-if="item.fotos && item.fotos.length > 0">
                            <v-col cols="12" class="detail-label"><strong>File Preview</strong></v-col>
                            <v-col cols="12">
                                <div class="file-preview-list">
                                    <div v-for="(foto, fIndex) in item.fotos" :key="foto.id" class="file-preview-item">
                                        <div class="file-preview-avatar">
                                            <v-img :src="getFotoUrl(foto.file_path)" width="48" height="48" cover
                                                class="rounded" @error="onImgError($event)">
                                                <template v-slot:error>
                                                    <v-icon size="32" color="grey">mdi-account-circle</v-icon>
                                                </template>
                                            </v-img>
                                        </div>
                                        <div class="file-preview-name">FOTO {{ fIndex + 1 }}</div>
                                        <div class="file-preview-actions">
                                            <v-btn size="x-small" color="success" variant="outlined"
                                                :href="getFotoUrl(foto.file_path)" download target="_blank" class="mr-1"
                                                prepend-icon="mdi-download">
                                                DOWNLOAD
                                            </v-btn>
                                            <v-btn size="x-small" color="info" variant="outlined"
                                                @click.stop="viewFoto(getFotoUrl(foto.file_path))"
                                                prepend-icon="mdi-eye">
                                                LIHAT
                                            </v-btn>
                                        </div>
                                    </div>
                                </div>
                            </v-col>
                        </v-row>

                        <v-divider class="mb-3"></v-divider>
                        <div class="mobile-actions">
                            <v-btn size="small" color="info" @click.stop="openMaps(item.link_maps, item.alamat)"
                                class="mr-2 mb-2" prepend-icon="mdi-directions" style="min-width: 120px;">
                                Rute
                            </v-btn>
                            <v-btn size="small" color="teal" @click.stop="openFotoDialog(item)" class="mr-2 mb-2"
                                prepend-icon="mdi-image-multiple" style="min-width: 120px;">
                                Foto
                            </v-btn>
                            <v-btn v-if="isSuperAdmin" size="small" :color="app.colors.primary"
                                @click.stop="editToko(item.id)" class="mr-2 mb-2" prepend-icon="mdi-pencil"
                                style="min-width: 120px;">
                                Edit
                            </v-btn>
                            <v-btn v-if="isSuperAdmin" size="small" :color="app.colors.secondary"
                                @click.stop="deleteToko(item.id)" class="mb-2" prepend-icon="mdi-delete"
                                style="min-width: 120px;">
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
                        <v-text-field label="Owner Toko" v-model="modelAdd.owner_toko" class="mb-2"
                            :rules="[rules.required]" required placeholder="Nama pemilik toko" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-autocomplete label="Cabang" v-model="modelAdd.cabang" :items="provinsiList" item-title="name"
                            item-value="id" class="mb-2" :rules="[rules.required]" :loading="isProvinsiLoading"
                            clearable required />
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

                <!-- Upload Foto Section -->
                <v-row>
                    <v-col cols="12">
                        <div class="foto-upload-section">
                            <div class="foto-upload-label mb-2">
                                <v-icon color="#FFD700" class="mr-1">mdi-camera</v-icon>
                                <strong>Foto Toko</strong>
                                <span class="text-grey text-caption ml-2">(bisa upload berulang kali)</span>
                            </div>

                            <!-- Drop Zone / File Input -->
                            <div class="foto-dropzone" @click="triggerFileInput('addFotoInput')" @dragover.prevent
                                @drop.prevent="handleDropAdd">
                                <v-icon size="40" color="#FFD700">mdi-cloud-upload</v-icon>
                                <p class="mt-2 text-grey">Klik atau drag & drop foto di sini</p>
                                <p class="text-caption text-grey">JPG, PNG, WEBP (maks. 5MB per file)</p>
                                <input ref="addFotoInput" type="file" multiple accept="image/*" style="display:none"
                                    @change="handleAddFotoChange" />
                            </div>

                            <!-- Preview Foto yang Akan Diupload -->
                            <div v-if="modelAdd.fotoPreviewList.length > 0" class="mt-3">
                                <div class="file-preview-list">
                                    <div v-for="(foto, idx) in modelAdd.fotoPreviewList" :key="idx"
                                        class="file-preview-item">
                                        <div class="file-preview-avatar">
                                            <v-img :src="foto.preview" width="48" height="48" cover class="rounded" />
                                        </div>
                                        <div class="file-preview-name">{{ foto.name }}</div>
                                        <div class="file-preview-actions">
                                            <v-btn size="x-small" color="error" variant="outlined"
                                                @click="removeAddFoto(idx)" icon>
                                                <v-icon>mdi-close</v-icon>
                                            </v-btn>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions class="dialog-actions">
                <v-spacer></v-spacer>
                <v-btn :color="app.colors.secondary" @click="isShowDialogAdd = false" class="ml-2">Batal</v-btn>
                <v-btn :color="app.colors.primary" @click="addToko()" :loading="isButtonLoading"
                    class="ml-2">Simpan</v-btn>
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
                        <v-text-field label="Owner Toko" v-model="modelEdit.owner_toko" class="mb-2"
                            :rules="[rules.required]" required placeholder="Nama pemilik toko" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-autocomplete label="Cabang" v-model="modelEdit.cabang" :items="provinsiList"
                            item-title="name" item-value="id" class="mb-2" :rules="[rules.required]"
                            :loading="isProvinsiLoading" clearable required />
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

                <!-- Foto Existing -->
                <v-row v-if="modelEdit.existingFotos && modelEdit.existingFotos.length > 0">
                    <v-col cols="12">
                        <div class="foto-upload-label mb-2">
                            <v-icon color="teal" class="mr-1">mdi-image-multiple</v-icon>
                            <strong>Foto Saat Ini</strong>
                        </div>
                        <div class="file-preview-list">
                            <div v-for="(foto, idx) in modelEdit.existingFotos" :key="foto.id" class="file-preview-item"
                                :class="{ 'foto-marked-delete': foto.markedDelete }">
                                <div class="file-preview-avatar">
                                    <v-img :src="getFotoUrl(foto.file_path)" width="48" height="48" cover
                                        class="rounded">
                                        <template v-slot:error>
                                            <v-icon size="32" color="grey">mdi-account-circle</v-icon>
                                        </template>
                                    </v-img>
                                </div>
                                <div class="file-preview-name">
                                    FOTO {{ idx + 1 }}
                                    <span v-if="foto.markedDelete" class="text-red text-caption"> (akan dihapus)</span>
                                </div>
                                <div class="file-preview-actions">
                                    <v-btn size="x-small" color="info" variant="outlined"
                                        @click="viewFoto(getFotoUrl(foto.file_path))" class="mr-1" icon>
                                        <v-icon>mdi-eye</v-icon>
                                    </v-btn>
                                    <v-btn v-if="isSuperAdmin" size="x-small"
                                        :color="foto.markedDelete ? 'warning' : 'error'" variant="outlined"
                                        @click="toggleDeleteExistingFoto(idx)" icon>
                                        <v-icon>{{ foto.markedDelete ? 'mdi-restore' : 'mdi-delete' }}</v-icon>
                                    </v-btn>
                                </div>
                            </div>
                        </div>
                    </v-col>
                </v-row>

                <!-- Upload Foto Baru di Edit -->
                <v-row>
                    <v-col cols="12">
                        <div class="foto-upload-section">
                            <div class="foto-upload-label mb-2">
                                <v-icon color="#FFD700" class="mr-1">mdi-camera-plus</v-icon>
                                <strong>Tambah Foto Baru</strong>
                                <span class="text-grey text-caption ml-2">(bisa upload berulang kali)</span>
                            </div>
                            <div class="foto-dropzone" @click="triggerFileInput('editFotoInput')" @dragover.prevent
                                @drop.prevent="handleDropEdit">
                                <v-icon size="40" color="#FFD700">mdi-cloud-upload</v-icon>
                                <p class="mt-2 text-grey">Klik atau drag & drop foto di sini</p>
                                <input ref="editFotoInput" type="file" multiple accept="image/*" style="display:none"
                                    @change="handleEditFotoChange" />
                            </div>
                            <div v-if="modelEdit.newFotoPreviewList.length > 0" class="mt-3">
                                <div class="file-preview-list">
                                    <div v-for="(foto, idx) in modelEdit.newFotoPreviewList" :key="idx"
                                        class="file-preview-item">
                                        <div class="file-preview-avatar">
                                            <v-img :src="foto.preview" width="48" height="48" cover class="rounded" />
                                        </div>
                                        <div class="file-preview-name">{{ foto.name }}</div>
                                        <div class="file-preview-actions">
                                            <v-btn size="x-small" color="error" variant="outlined"
                                                @click="removeEditFoto(idx)" icon>
                                                <v-icon>mdi-close</v-icon>
                                            </v-btn>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions class="dialog-actions">
                <v-spacer></v-spacer>
                <v-btn :color="app.colors.secondary" @click="isShowDialogEdit = false" class="ml-2">Batal</v-btn>
                <v-btn :color="app.colors.primary" @click="updateToko()" :loading="isButtonLoading"
                    class="ml-2">Update</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Dialog Lihat Semua Foto -->
    <v-dialog v-model="isShowDialogFoto" :width="$vuetify.display.mobile ? '95%' : '600'">
        <v-card>
            <v-card-title class="dialog-header">
                <v-icon class="mr-2" style="color: #FFD700;">mdi-image-multiple</v-icon>
                <span class="dialog-title">FILE PREVIEW - {{ selectedTokoFoto?.nama_toko }}</span>
            </v-card-title>
            <v-card-text class="pa-4" style="background:#f5f5f5;">
                <div v-if="selectedTokoFoto?.fotos && selectedTokoFoto.fotos.length > 0">
                    <div class="file-preview-list">
                        <div v-for="(foto, idx) in selectedTokoFoto.fotos" :key="foto.id"
                            class="file-preview-item file-preview-item-large">
                            <div class="file-preview-avatar-large">
                                <v-img :src="getFotoUrl(foto.file_path)" width="56" height="56" cover class="rounded">
                                    <template v-slot:error>
                                        <v-icon size="40" color="grey">mdi-account-circle</v-icon>
                                    </template>
                                </v-img>
                            </div>
                            <div class="file-preview-name-large">FOTO {{ idx + 1 }}</div>
                            <div class="file-preview-actions">
                                <v-btn size="small" color="success" variant="outlined"
                                    :href="getFotoUrl(foto.file_path)" download target="_blank" class="mr-2"
                                    prepend-icon="mdi-download">
                                    DOWNLOAD
                                </v-btn>
                                <v-btn size="small" color="info" variant="outlined"
                                    @click="viewFoto(getFotoUrl(foto.file_path))" prepend-icon="mdi-eye">
                                    LIHAT
                                </v-btn>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="text-center pa-4">
                    <v-icon size="48" color="grey">mdi-image-off</v-icon>
                    <p class="text-grey mt-2">Belum ada foto</p>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="grey" @click="isShowDialogFoto = false">Tutup</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Dialog Lihat Foto Full -->
    <v-dialog v-model="isShowFotoViewer" max-width="90vw">
        <v-card style="background:#000;">
            <v-card-actions style="position:absolute;top:0;right:0;z-index:10;">
                <v-btn icon color="white" @click="isShowFotoViewer = false">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-actions>
            <v-img :src="viewerFotoUrl" max-height="85vh" contain />
        </v-card>
    </v-dialog>

    <!-- Dialog Delete Confirmation -->
    <v-dialog v-model="isShowDialogDelete" :max-width="$vuetify.display.mobile ? '95%' : '500px'">
        <v-card :color="this.app.colors.background">
            <v-card-title class="text-h5">Apakah anda yakin ingin menghapus data toko ini?</v-card-title>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :color="app.colors.primary" @click="isShowDialogDelete = false">Cancel</v-btn>
                <v-btn :color="app.colors.secondary" @click="confirmDeleteToko(modelDelete.id)"
                    :loading="isButtonLoading">OK</v-btn>
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

const BASE_URL = "https://babaapi.babaparfume.id";

export default {
    components: { Breadcrumb, CardDataTable },

    setup() {
        const app = useAppStore();
        return { app };
    },

    data() {
        return {
            currentPage: 1,
            itemsPerPage: 10,
            expandedMobileCard: null,
            isShowDialogFoto: false,
            selectedTokoFoto: null,
            isShowFotoViewer: false,
            viewerFotoUrl: '',
            contentSnackbar: { snackbar: false, text: "", color: "" },
            rules: { required: value => !!value || 'Field ini wajib diisi' },
            title: "DATA STORE BABA PARFUME",
            itemsBreadcrumb: [
                { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
                { title: "STORE BABA PARFUME", disabled: false, href: "/admin/toko-internal" },
            ],
            isShowDialogAdd: false,
            isShowDialogEdit: false,
            isButtonLoading: false,
            isShowDialogDelete: false,
            isProvinsiLoading: false,
            provinsiList: [],
            datatable: {
                search: "",
                headers: [
                    { key: "no", title: "No", sortable: false },
                    { key: "nama_toko", title: "Nama Toko" },
                    { key: "owner_toko", title: "Owner Toko" },
                    { key: "cabang", title: "Cabang" },
                    { key: "alamat", title: "Alamat" },
                    { key: "fotos", title: "Foto", sortable: false },
                    { key: "action", title: "Actions", sortable: false, align: "center" },
                ],
                items: [],
            },
            modelAdd: {
                nama_toko: "",
                owner_toko: "",
                cabang: null,
                alamat: "",
                link_maps: "",
                fotoFiles: [],
                fotoPreviewList: [],
            },
            modelEdit: {
                id: "",
                nama_toko: "",
                owner_toko: "",
                cabang: null,
                alamat: "",
                link_maps: "",
                existingFotos: [],
                newFotoFiles: [],
                newFotoPreviewList: [],
            },
            modelDelete: { id: "" },
            isTableLoading: true,
        };
    },

    computed: {
        filteredItems() {
            if (!this.datatable.search) return this.datatable.items;
            const searchTerm = this.datatable.search.toLowerCase();
            return this.datatable.items.filter(item =>
                (item.nama_toko && item.nama_toko.toLowerCase().includes(searchTerm)) ||
                (item.owner_toko && item.owner_toko.toLowerCase().includes(searchTerm)) ||
                (item.provinsi && item.provinsi.name && item.provinsi.name.toLowerCase().includes(searchTerm)) ||
                (item.alamat && item.alamat.toLowerCase().includes(searchTerm))
            );
        },
        isSuperAdmin() {
            return localStorage.getItem('mvo_type_id') === 'superadmin';
        }
    },

    methods: {
        getFotoUrl(filePath) {
            if (!filePath) return '';
            if (filePath.startsWith('http')) return filePath;
            return `${BASE_URL}/project/public/${filePath}`;
        },

        viewFoto(url) {
            this.viewerFotoUrl = url;
            this.isShowFotoViewer = true;
        },

        openFotoDialog(item) {
            this.selectedTokoFoto = item;
            this.isShowDialogFoto = true;
        },

        onImgError(e) {
            // handle broken image
        },

        // ---- Add Foto Handlers ----
        triggerFileInput(refName) {
            this.$refs[refName].click();
        },

        handleAddFotoChange(event) {
            const files = Array.from(event.target.files);
            this.appendFotoToAdd(files);
            event.target.value = '';
        },

        handleDropAdd(event) {
            const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            this.appendFotoToAdd(files);
        },

        appendFotoToAdd(files) {
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.modelAdd.fotoPreviewList.push({ name: file.name, preview: e.target.result, file });
                    this.modelAdd.fotoFiles.push(file);
                };
                reader.readAsDataURL(file);
            });
        },

        removeAddFoto(idx) {
            this.modelAdd.fotoPreviewList.splice(idx, 1);
            this.modelAdd.fotoFiles.splice(idx, 1);
        },

        // ---- Edit Foto Handlers ----
        handleEditFotoChange(event) {
            const files = Array.from(event.target.files);
            this.appendFotoToEdit(files);
            event.target.value = '';
        },

        handleDropEdit(event) {
            const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            this.appendFotoToEdit(files);
        },

        appendFotoToEdit(files) {
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.modelEdit.newFotoPreviewList.push({ name: file.name, preview: e.target.result, file });
                    this.modelEdit.newFotoFiles.push(file);
                };
                reader.readAsDataURL(file);
            });
        },

        removeEditFoto(idx) {
            this.modelEdit.newFotoPreviewList.splice(idx, 1);
            this.modelEdit.newFotoFiles.splice(idx, 1);
        },

        toggleDeleteExistingFoto(idx) {
            this.modelEdit.existingFotos[idx].markedDelete = !this.modelEdit.existingFotos[idx].markedDelete;
        },

        // ---- General ----
        openMaps(linkMaps, alamat) {
            if (linkMaps || alamat) {
                const mapsUrl = `https://www.google.com/maps/dir//${encodeURIComponent(alamat)}`;
                window.open(mapsUrl, '_blank');
            } else {
                this.showSnackbar({ data: { message: "Alamat atau link Maps tidak tersedia" } }, true);
            }
        },

        toggleMobileDetail(itemId) {
            this.expandedMobileCard = this.expandedMobileCard === itemId ? null : itemId;
        },

        showSnackbar(response, isError = false) {
            this.contentSnackbar.snackbar = true;
            let message = '';
            if (response?.data) {
                message = response.data.message || response.data.error || '';
                if (response.data.errors && Array.isArray(response.data.errors)) {
                    message = response.data.errors.join(', ');
                } else if (response.data.errors && typeof response.data.errors === 'object') {
                    const msgs = [];
                    for (const field in response.data.errors) {
                        if (Array.isArray(response.data.errors[field])) msgs.push(...response.data.errors[field]);
                        else msgs.push(response.data.errors[field]);
                    }
                    message = msgs.join(', ');
                }
            }
            if (!message && response?.message) message = response.message;
            if (!message) message = isError ? 'Terjadi kesalahan tidak terduga' : 'Operasi berhasil';
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
            this.modelAdd.owner_toko = "";
            this.modelAdd.cabang = null;
            this.modelAdd.alamat = "";
            this.modelAdd.link_maps = "";
            this.modelAdd.fotoFiles = [];
            this.modelAdd.fotoPreviewList = [];
        },

        clearEditForm() {
            this.modelEdit.id = "";
            this.modelEdit.nama_toko = "";
            this.modelEdit.owner_toko = "";
            this.modelEdit.cabang = null;
            this.modelEdit.alamat = "";
            this.modelEdit.link_maps = "";
            this.modelEdit.existingFotos = [];
            this.modelEdit.newFotoFiles = [];
            this.modelEdit.newFotoPreviewList = [];
        },

        getAllProvinsi() {
            const token = Cookies.get("token");
            if (!token) { this.$router.push({ name: "Login" }); return; }
            this.isProvinsiLoading = true;
            axios.get(`${BASE_URL}/api/provinsi`, { headers: { Authorization: `Bearer ${token}` } })
                .then(response => {
                    if (response.data.status === "success") this.provinsiList = response.data.data;
                    else this.showSnackbar(response, true);
                })
                .catch(error => this.showSnackbar(error.response || error, true))
                .finally(() => { this.isProvinsiLoading = false; });
        },

        getAllToko() {
            const token = Cookies.get("token");
            if (!token) { this.$router.push({ name: "Login" }); return; }
            this.isTableLoading = true;
            axios.get(`${BASE_URL}/api/toko-internal`, { headers: { Authorization: `Bearer ${token}` } })
                .then(response => {
                    if (response.data.status === "success") this.datatable.items = response.data.data;
                    else this.showSnackbar(response, true);
                })
                .catch(error => this.showSnackbar(error.response || error, true))
                .finally(() => { this.isTableLoading = false; });
        },

        addToko() {
            const token = Cookies.get("token");
            if (!token) { this.$router.push({ name: "Login" }); return; }

            if (!this.modelAdd.nama_toko || !this.modelAdd.owner_toko || !this.modelAdd.cabang || !this.modelAdd.alamat) {
                this.showSnackbar({ data: { message: "Nama Toko, Owner Toko, Cabang, dan Alamat harus diisi" } }, true);
                return;
            }

            this.isButtonLoading = true;

            // Use FormData to support file upload
            const formData = new FormData();
            formData.append('nama_toko', this.modelAdd.nama_toko);
            formData.append('owner_toko', this.modelAdd.owner_toko);
            formData.append('cabang', String(this.modelAdd.cabang));
            formData.append('alamat', this.modelAdd.alamat);
            formData.append('link_maps', this.modelAdd.link_maps || '');

            this.modelAdd.fotoFiles.forEach(file => {
                formData.append('foto[]', file);
            });

            axios.post(`${BASE_URL}/api/toko-internal`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
            })
                .then(response => {
                    this.getAllToko();
                    this.isShowDialogAdd = false;
                    this.showSnackbar(response, false);
                    this.clearAddForm();
                })
                .catch(error => this.showSnackbar(error.response || error, true))
                .finally(() => { this.isButtonLoading = false; });
        },

        editToko(id) {
            const token = Cookies.get("token");
            if (!token) { this.$router.push({ name: "Login" }); return; }

            this.expandedMobileCard = null;
            this.clearEditForm();
            this.isShowDialogEdit = true;

            axios.get(`${BASE_URL}/api/toko-internal/${id}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(response => {
                    if (response.data.status === "success") {
                        const d = response.data.data;
                        this.modelEdit.id = d.id;
                        this.modelEdit.nama_toko = d.nama_toko || "";
                        this.modelEdit.owner_toko = d.owner_toko || "";
                        this.modelEdit.cabang = d.cabang ? Number(d.cabang) : null;
                        this.modelEdit.alamat = d.alamat || "";
                        this.modelEdit.link_maps = d.link_maps || "";
                        this.modelEdit.existingFotos = (d.fotos || []).map(f => ({ ...f, markedDelete: false }));
                    } else {
                        this.showSnackbar(response, true);
                        this.isShowDialogEdit = false;
                    }
                })
                .catch(error => {
                    this.showSnackbar(error.response || error, true);
                    this.isShowDialogEdit = false;
                });
        },

        updateToko() {
            const token = Cookies.get("token");
            if (!token) { this.$router.push({ name: "Login" }); return; }

            if (!this.modelEdit.nama_toko || !this.modelEdit.owner_toko || !this.modelEdit.cabang || !this.modelEdit.alamat) {
                this.showSnackbar({ data: { message: "Nama Toko, Owner Toko, Cabang, dan Alamat harus diisi" } }, true);
                return;
            }

            this.isButtonLoading = true;

            const formData = new FormData();
            formData.append('_method', 'POST');
            formData.append('nama_toko', this.modelEdit.nama_toko);
            formData.append('owner_toko', this.modelEdit.owner_toko);
            formData.append('cabang', String(this.modelEdit.cabang));
            formData.append('alamat', this.modelEdit.alamat);
            formData.append('link_maps', this.modelEdit.link_maps || '');

            // Foto yang akan dihapus
            const fotoToDelete = this.modelEdit.existingFotos
                .filter(f => f.markedDelete)
                .map(f => f.id);
            fotoToDelete.forEach(id => formData.append('delete_foto_ids[]', id));

            // Foto baru
            this.modelEdit.newFotoFiles.forEach(file => {
                formData.append('foto[]', file);
            });

            axios.post(`${BASE_URL}/api/toko-internal/${this.modelEdit.id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
            })
                .then(response => {
                    this.getAllToko();
                    this.showSnackbar(response, false);
                    this.isShowDialogEdit = false;
                    this.clearEditForm();
                })
                .catch(error => this.showSnackbar(error.response || error, true))
                .finally(() => { this.isButtonLoading = false; });
        },

        deleteToko(id) {
            this.expandedMobileCard = null;
            this.isShowDialogDelete = true;
            this.modelDelete.id = id;
        },

        confirmDeleteToko(id) {
            const token = Cookies.get("token");
            if (!token) { this.$router.push({ name: "Login" }); return; }

            this.isButtonLoading = true;
            axios.delete(`${BASE_URL}/api/toko-internal/${id}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            })
                .then(response => {
                    this.getAllToko();
                    this.showSnackbar(response, false);
                })
                .catch(error => this.showSnackbar(error.response || error, true))
                .finally(() => {
                    this.isButtonLoading = false;
                    this.isShowDialogDelete = false;
                });
        },
    },

    created() {
        this.getAllProvinsi();
        this.getAllToko();
    },

    watch: {
        'datatable.search': { handler() { this.expandedMobileCard = null; } }
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

.mobile-number {
    font-weight: bold;
}

.rotate-180 {
    transform: rotate(180deg);
}

.transition-all {
    transition: transform 0.3s ease;
}

/* Dialog styles */
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

/* Foto Upload */
.foto-upload-section {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
}

.foto-upload-label {
    display: flex;
    align-items: center;
    font-size: 14px;
}

.foto-dropzone {
    border: 2px dashed #FFD700;
    border-radius: 8px;
    padding: 24px;
    text-align: center;
    cursor: pointer;
    transition: background 0.2s;
    background: #fffdf0;
}

.foto-dropzone:hover {
    background: #fff9d6;
}

/* File Preview List - Styled like screenshot */
.file-preview-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.file-preview-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 10px 14px;
    transition: all 0.2s;
}

.file-preview-item:hover {
    border-color: #aaa;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.file-preview-item-large {
    padding: 12px 16px;
}

.foto-marked-delete {
    opacity: 0.5;
    border-color: #f44336 !important;
    background: #fff5f5 !important;
}

.file-preview-avatar {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 6px;
    overflow: hidden;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.file-preview-avatar-large {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: 8px;
    overflow: hidden;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.file-preview-name {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-preview-name-large {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.file-preview-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 4px;
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

    .mobile-toko-card,
    .mobile-header-card {
        margin-left: 8px;
        margin-right: 8px;
    }

    .file-preview-actions {
        flex-direction: column;
    }
}
</style>