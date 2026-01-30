<template>
  <div class="mvo-management">
    <Breadcrumb :items="itemsBreadcrumb" />

    <v-btn class="text-white font-semibold add-mvo-btn" @click="showDialogFormAddMvo" v-if="otoritas === 'superadmin'">
      <v-icon start style="color: #FFD700;">mdi-pen-plus</v-icon>
      <span class="ml-2">Tambah Akun</span>
    </v-btn>

    <!-- Desktop View - Data Table -->
    <div class="d-none d-md-block">
      <CardDataTable :title="title">
        <template v-slot:search>
          <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Search" single-line
            hide-details variant="outlined" class="search-field" />
        </template>

        <template v-slot:datatable>
          <v-data-table class="bg-grey-lighten-4 text-no-wrap custom-data-table" hover :headers="displayHeaders"
            :items="datatable.items" :search="datatable.search" :loading="isTableLoading" :items-per-page="10"
            @update:options="updateCurrentPageInfo">

            <template v-slot:item.no="{ index }">
              {{ ((currentPage - 1) * itemsPerPage) + index + 1 }}
            </template>

            <template v-slot:item.detail="{ item }">
              <div class="d-flex justify-center">
                <v-tooltip text="Detail" color="#125C13" location="top start">
                  <template v-slot:activator="{ props }">
                    <v-btn size="small" color="info" @click="showDetailMvo(item.id)" class="mx-1" v-bind="props" icon>
                      <v-icon>mdi-information</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </template>

            <template v-slot:item.print="{ item }">
              <div class="d-flex justify-center">
                <v-tooltip text="Print" color="#125C13" location="top start">
                  <template v-slot:activator="{ props }">
                    <v-btn size="small" color="success" @click="printMvo(item.id)" class="mx-1" v-bind="props" icon>
                      <v-icon>mdi-printer</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </template>

            <template v-slot:item.approve="{ item }">
              <div class="d-flex justify-center">
                <v-tooltip :text="getApproveTooltip(item)" color="#125C13" location="top start">
                  <template v-slot:activator="{ props }">
                    <v-btn size="small" :color="getApproveButtonColor(item)"
                      @click="canApprove(item) ? approveMvo(item.id) : null" class="mx-1" v-bind="props"
                      :disabled="!canApprove(item)" icon>
                      <v-icon>{{ getApproveButtonIcon(item) }}</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </template>

            <template v-slot:item.action="{ item }" v-if="otoritas === 'superadmin'">
              <div class="d-flex justify-center">
                <v-tooltip text="Edit" color="#125C13" location="top start">
                  <template v-slot:activator="{ props }">
                    <v-btn size="small" :color="app.colors.primary" @click="editMvo(item.id)" class="mx-1"
                      v-bind="props" icon>
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>

                <v-tooltip text="Hapus" color="#125C13" location="top start">
                  <template v-slot:activator="{ props }">
                    <v-btn size="small" :color="app.colors.secondary" @click="deleteMvo(item.id)" class="mx-1"
                      v-bind="props" icon>
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </template>

            <template v-slot:item.status_inputan="{ item }">
              <v-chip :color="item.status_inputan === 'approved' ? 'success' : 'warning'" size="small" variant="flat">
                {{ item.status_inputan === 'approved' ? 'Disetujui' : 'Menunggu' }}
              </v-chip>
            </template>

            <template v-slot:item.status_inputan_2="{ item }">
              <v-chip
                :color="item.status_inputan_2 === 'approved' ? 'success' : (item.status_inputan === 'approved' ? 'warning' : 'grey')"
                size="small" variant="flat">
                <template v-if="item.status_inputan_2 === 'approved'">
                  Disetujui
                </template>
                <template v-else-if="item.status_inputan === 'approved'">
                  Menunggu
                </template>
                <template v-else>
                  Pending MVO
                </template>
              </v-chip>
            </template>

            <template v-slot:item.mvo_type="{ item }">
              {{ getMvoTypeName(item.mvo_type_id) }}
            </template>

            <template v-slot:item.province="{ item }">
              {{ getProvinceName(item.province_id) }}
            </template>

            <template v-slot:item.parent="{ item }">
              {{ getParentName(item.parent_id) }}
            </template>

            <template v-slot:item.tgl_lahir="{ item }">
              {{ formatDate(item.tgl_lahir) }}
            </template>

            <template v-slot:item.pointbintang="{ item }">
              {{ item.pointbintang || '-' }}
            </template>
          </v-data-table>
        </template>
      </CardDataTable>
    </div>

    <!-- Mobile View - Cards -->
    <div class="d-block d-md-none">
      <v-card class="mobile-header-card mb-4">
        <v-card-text>
          <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Cari akun..." single-line
            hide-details variant="outlined" class="search-field-mobile" />
        </v-card-text>
      </v-card>

      <v-progress-linear v-if="isTableLoading" indeterminate color="#FFD700" class="mb-4"></v-progress-linear>

      <div v-if="filteredItems.length === 0 && !isTableLoading" class="text-center pa-4">
        <v-icon size="64" color="grey">mdi-account-search</v-icon>
        <p class="text-grey mt-2">Tidak ada akun ditemukan</p>
      </div>

      <v-card v-for="(item, index) in filteredItems" :key="item.id" class="mobile-mvo-card mb-3"
        @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">
        <!-- Header Card - Always Visible -->
        <v-card-text class="mobile-card-header">
          <v-row no-gutters align="center">
            <v-col cols="2" class="text-center">
              <span class="mobile-number">{{ index + 1 }}</span>
            </v-col>

            <v-col cols="8" class="pl-3">
              <div class="mobile-mvo-name">
                <strong>{{ item.nama }}</strong>
              </div>
              <div class="mobile-mvo-code">
                <strong>{{ item.code }}</strong>
              </div>
              <div class="mobile-status-preview">
                <v-chip :color="item.status_inputan === 'approved' ? 'success' : 'warning'" size="x-small"
                  variant="flat">
                  {{ item.status_inputan === 'approved' ? 'Disetujui' : 'Menunggu' }}
                </v-chip>
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

              <!-- Personal Info Section -->
              <div class="mobile-info-section mb-3">
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Nomer ID:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.no_id || '-' }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Panggilan:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.nama_panggilan || '-' }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Tempat Lahir:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.tempat_lahir || '-' }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Tgl Lahir:</v-col>
                  <v-col cols="8" class="detail-value">{{ formatDate(item.tgl_lahir) }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Class:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.class_member || '-' }}</v-col>
                </v-row>
              </div>

              <!-- Contact Info Section -->
              <div class="mobile-info-section mb-3">
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">No HP:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.nohp || '-' }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Sosmed:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.sosmed || '-' }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Alamat:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.alamat || '-' }}</v-col>
                </v-row>
              </div>

              <!-- Business Info Section -->
              <div class="mobile-info-section mb-3">
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Jaringan:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.jaringan_mvo || '-' }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Tipe:</v-col>
                  <v-col cols="8" class="detail-value">{{ getMvoTypeName(item.mvo_type_id) }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Provinsi:</v-col>
                  <v-col cols="8" class="detail-value">{{ getProvinceName(item.province_id) }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Upline:</v-col>
                  <v-col cols="8" class="detail-value">{{ getParentName(item.parent_id) }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Level:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.level || '-' }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Poin Bintang:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.pointbintang || '-' }}</v-col>
                </v-row>
              </div>

              <!-- Status Approval Section -->
              <div class="mobile-info-section mb-3">
                <h4 class="text-subtitle-2 mb-2 text-primary">
                  <v-icon size="16" class="mr-1">mdi-check-decagram</v-icon>
                  Status Approval
                </h4>

                <v-row class="mb-2">
                  <v-col cols="5" class="detail-label">Status MVO:</v-col>
                  <v-col cols="7" class="detail-value">
                    <v-chip :color="item.status_inputan === 'approved' ? 'success' : 'warning'" size="x-small"
                      variant="flat">
                      {{ item.status_inputan === 'approved' ? 'Disetujui' : 'Menunggu' }}
                    </v-chip>
                  </v-col>
                </v-row>

                <v-row class="mb-2" v-if="otoritas === 'superadmin'">
                  <v-col cols="5" class="detail-label">Status Admin:</v-col>
                  <v-col cols="7" class="detail-value">
                    <v-chip
                      :color="item.status_inputan_2 === 'approved' ? 'success' : (item.status_inputan === 'approved' ? 'warning' : 'grey')"
                      size="x-small" variant="flat">
                      <template v-if="item.status_inputan_2 === 'approved'">
                        Disetujui
                      </template>
                      <template v-else-if="item.status_inputan === 'approved'">
                        Menunggu
                      </template>
                      <template v-else>
                        Pending MVO
                      </template>
                    </v-chip>
                  </v-col>
                </v-row>
              </div>

              <!-- Action Buttons -->
              <v-divider class="mb-3"></v-divider>
              <div class="mobile-actions">
                <!-- Quick Action Buttons -->

                <v-btn size="small" color="info" @click.stop="showDetailMvo(item.id)" class="mr-1 mb-2"
                  prepend-icon="mdi-information">
                  Detail
                </v-btn>
                <v-btn size="small" color="success" @click.stop="printMvo(item.id)" class="mr-1 mb-2"
                  prepend-icon="mdi-printer">
                  Print
                </v-btn>

                <v-btn v-if="canApprove(item)" size="small" :color="getApproveButtonColor(item)"
                  @click.stop="approveMvo(item.id)" class="mr-1 mb-2" :prepend-icon="getApproveButtonIcon(item)">
                  {{ otoritas === 'mvo' ? 'Approve MVO' : 'Approve Admin' }}
                </v-btn>



                <!-- Admin Actions -->
                <template v-if="otoritas === 'superadmin'">
                  <v-btn size="small" :color="app.colors.primary" @click.stop="editMvo(item.id)" class="mr-1 mb-2"
                    prepend-icon="mdi-pencil">
                    Edit
                  </v-btn>
                  <v-btn size="small" :color="app.colors.secondary" @click.stop="deleteMvo(item.id)" class="mb-2"
                    prepend-icon="mdi-delete">
                    Hapus
                  </v-btn>
                </template>
              </div>
            </v-card-text>
          </div>
        </v-expand-transition>
      </v-card>
    </div>

    <!-- Dialog Form MVO (Add/Edit) -->
    <v-dialog v-model="isShowDialogForm" persistent :width="$vuetify.display.mobile ? '95%' : '1000'">
      <v-card class="custom-dialog">
        <v-card-title class="dialog-header">
          <v-icon class="mr-2" style="color: #FFD700;">
            {{ isEditMode ? 'mdi-pencil' : 'mdi-plus-circle' }}
          </v-icon>
          <span class="dialog-title">
            {{ isEditMode ? 'EDIT DATA' : 'TAMBAH DATA' }}
          </span>
        </v-card-title>

        <v-card-text class="dialog-content">
          <!-- Dropdown User hanya untuk mode Add -->
          <v-row v-if="!isEditMode">
            <v-col cols="12">

              <!-- Di bagian template, GANTI SELURUH v-select untuk User dengan ini -->
              <v-autocomplete label="Pilih User (Opsional)" v-model="selectedUserId" :items="users" item-title="nama"
                item-value="id" class="mb-3" :loading="isLoadingUsers" @update:model-value="onUserSelected" clearable
                variant="outlined" density="comfortable" prepend-inner-icon="mdi-account-search"
                hint="Ketik untuk mencari user (Nomer ID, Nama, atau No HP)" persistent-hint
                :custom-filter="customUserFilter" no-data-text="Tidak ada user ditemukan">
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" :title="item.raw.nama"
                    :subtitle="`Nomer ID: ${item.raw.no_id || '-'} | HP: ${item.raw.nohp || '-'}`">
                    <template v-slot:prepend>
                      <v-avatar color="primary" size="40">
                        <v-icon color="white">mdi-account</v-icon>
                      </v-avatar>
                    </template>
                  </v-list-item>
                </template>

                <template v-slot:selection="{ item }">
                  <div class="d-flex align-center w-100">
                    <v-avatar color="primary" size="32" class="mr-2">
                      <v-icon color="white" size="20">mdi-account</v-icon>
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div class="text-body-2">{{ item.raw.nama }}</div>
                      <div class="text-caption text-grey">Nomer ID: {{ item.raw.no_id || '-' }}</div>
                    </div>
                  </div>
                </template>
              </v-autocomplete>
            </v-col>
          </v-row>

          <!-- Section: Data Personal (Auto-fill dari User) -->
          <div class="mb-4">
            <v-row>
              <v-col cols="12">
                <div class="text-subtitle-2 text-primary mb-2">
                  <v-icon size="20" class="mr-1">mdi-account-circle</v-icon>
                  Data Personal (Auto-fill dari User)
                </div>
                <v-divider class="mb-3"></v-divider>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field label="Nama *" v-model="currentModel.nama" class="mb-2" :rules="[requiredRule]"
                  :readonly="!isEditMode && selectedUserId !== null" variant="outlined" density="comfortable"
                  prepend-inner-icon="mdi-account" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field label="Nama Panggilan" v-model="currentModel.nama_panggilan" class="mb-2"
                  :readonly="!isEditMode && selectedUserId !== null" variant="outlined" density="comfortable"
                  prepend-inner-icon="mdi-account-voice" />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field label="Nomer ID *" v-model="currentModel.no_id" class="mb-2" :rules="[requiredRule]"
                  :readonly="!isEditMode && selectedUserId !== null" variant="outlined" density="comfortable"
                  prepend-inner-icon="mdi-card-account-details" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field label="No HP" v-model="currentModel.nohp" class="mb-2"
                  :readonly="!isEditMode && selectedUserId !== null" variant="outlined" density="comfortable"
                  prepend-inner-icon="mdi-phone" />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field label="Tempat Lahir" v-model="currentModel.tempat_lahir" class="mb-2"
                  :readonly="!isEditMode && selectedUserId !== null" variant="outlined" density="comfortable"
                  prepend-inner-icon="mdi-map-marker" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field label="Tanggal Lahir" type="date" v-model="currentModel.tgl_lahir" class="mb-2"
                  :readonly="!isEditMode && selectedUserId !== null" variant="outlined" density="comfortable"
                  prepend-inner-icon="mdi-calendar" />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <!-- <v-select label="Class Member" v-model="currentModel.class_member" :items="classMemberOptions"
                  class="mb-2" clearable :readonly="!isEditMode && selectedUserId !== null" variant="outlined"
                  density="comfortable" prepend-inner-icon="mdi-star" /> -->
              </v-col>
              <v-col cols="12" md="6">
                <v-textarea label="Alamat" v-model="currentModel.alamat" class="mb-2" rows="2"
                  :readonly="!isEditMode && selectedUserId !== null" variant="outlined" density="comfortable"
                  prepend-inner-icon="mdi-home" />
              </v-col>
            </v-row>
          </div>

          <!-- Section: Data Manual -->
          <div>
            <v-row>
              <v-col cols="12">
                <div class="text-subtitle-2 text-warning mb-2">
                  <v-icon size="20" class="mr-1">mdi-pencil</v-icon>
                  Data Manual (Harus Diisi Manual)
                </div>
                <v-divider class="mb-3"></v-divider>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field label="Sosial Media" v-model="currentModel.sosmed" class="mb-2" variant="outlined"
                  density="comfortable" prepend-inner-icon="mdi-instagram" hint="Isi manual" persistent-hint />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field label="Jaringan" v-model="currentModel.jaringan_mvo" class="mb-2" variant="outlined"
                  density="comfortable" prepend-inner-icon="mdi-network" hint="Isi manual" persistent-hint />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select label="Class Member" v-model="currentModel.mvo_type_id" :items="mvoTypes" item-title="name"
                  item-value="id" class="mb-2" :loading="isLoadingMvoTypes" :rules="[requiredRule]" variant="outlined"
                  density="comfortable" prepend-inner-icon="mdi-shape" hint="Pilih manual (Level akan otomatis terisi)"
                  persistent-hint />
              </v-col>
              <v-col cols="12" md="6">
                <v-select label="Level" v-model="currentModel.level" :items="levelOptions" class="mb-2"
                  variant="outlined" density="comfortable" prepend-inner-icon="mdi-chart-line"
                  hint="Otomatis terisi berdasarkan Tipe" persistent-hint readonly disabled />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select label="Provinsi *" v-model="currentModel.province_id" :items="provinces" item-title="name"
                  item-value="id" class="mb-2" :loading="isLoadingProvinces" :rules="[requiredRule]" variant="outlined"
                  density="comfortable" prepend-inner-icon="mdi-map" hint="Pilih manual" persistent-hint />
              </v-col>
              <v-col cols="12" md="6">
                <v-select label="Upline" v-model="currentModel.parent_id" :items="parentMvoOptions" item-title="nama"
                  item-value="id" class="mb-2" clearable variant="outlined" density="comfortable"
                  prepend-inner-icon="mdi-account-supervisor" hint="Pilih manual (opsional)" persistent-hint />
              </v-col>
            </v-row>
          </div>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn :color="app.colors.secondary" @click="isShowDialogForm = false" class="ml-2">
            Batal
          </v-btn>
          <v-btn :color="app.colors.primary" @click="isEditMode ? updateMvo() : addMvo()" :loading="isButtonLoading"
            class="ml-2">
            {{ isEditMode ? 'Update' : 'Simpan' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Detail MVO with Mobile Support -->
    <v-dialog v-model="isShowDialogDetail" persistent :width="$vuetify.display.mobile ? '95%' : '1400'">
      <v-card class="custom-dialog">
        <v-card-title class="dialog-header">
          <v-icon class="mr-2" style="color: #FFD700;">mdi-information</v-icon>
          <span class="dialog-title">DETAIL DATA</span>
          <v-chip v-if="detailNavigationHistory.length > 0" color="info" size="small" class="ml-3">
            Level {{ detailNavigationHistory.length + 1 }}
          </v-chip>
        </v-card-title>

        <v-card-text class="dialog-content">
          <!-- Desktop View -->
          <div class="d-none d-md-block">
            <!-- Documents Section -->
            <div class="detail-section mb-6">
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="detail-section-title mb-0 d-flex align-center">
                  <v-icon class="mr-2" color="#FFD700">mdi-file-document-multiple</v-icon>

                  <span>Dokumen</span>

                  <!-- CHIP KODE -->
                  <v-chip color="success" size="small" class="ml-3" v-if="getDocumentMvoId()">
                    {{ getDocumentMvoCode() }}
                  </v-chip>

                  <!-- NAMA PEMILIK -->
                  <span class="text-caption text-grey ml-2">
                    {{ originalDetailMvoData?.nama || '-' }}
                  </span>
                </h3>

                <v-btn color="primary" size="small" @click="showDialogAddDocument" :disabled="!getDocumentMvoId()">
                  <v-icon start>mdi-plus</v-icon>
                  Tambah Dokumen
                </v-btn>
              </div>

              <v-text-field v-model="documentSearch" prepend-inner-icon="mdi-magnify" label="Cari Dokumen..."
                single-line hide-details variant="outlined" class="mb-3" density="compact" />

              <v-data-table class="bg-grey-lighten-4 text-no-wrap custom-detail-table" :headers="documentHeaders"
                :items="documentItems" :search="documentSearch" :loading="isLoadingDocuments" hide-default-footer
                items-per-page="-1">

                <template v-slot:no-data>
                  <div class="text-center pa-4">
                    <v-icon size="64" color="grey-lighten-2">mdi-file-document-off</v-icon>
                    <p class="text-grey mt-2 mb-0">Tidak ada dokumen untuk data ini</p>
                  </div>
                </template>

                <template v-slot:item.status_inputan="{ item }">
                  <v-chip :color="getDocumentStatusColor(item.status_inputan)" size="small" variant="flat">
                    {{ getDocumentStatusText(item.status_inputan) }}
                  </v-chip>
                </template>

                <template v-slot:item.status_inputan_2="{ item }">
                  <v-chip
                    :color="item.status_inputan_2 === 'approved' ? 'success' : (item.status_inputan === 'approved' ? 'warning' : 'grey')"
                    size="small" variant="flat">
                    <template v-if="item.status_inputan_2 === 'approved'">
                      Disetujui
                    </template>
                    <template v-else-if="item.status_inputan === 'approved'">
                      Menunggu
                    </template>
                    <template v-else>
                      Pending MVO
                    </template>
                  </v-chip>
                </template>

                <template v-slot:item.mvo_code="{ item }">
                  {{ getMvoCodeById(item.mvo_id) }}
                </template>

                <template v-slot:item.file_path="{ item }">
                  <div class="d-flex align-center">
                    <div v-if="isImageFile(item.file_path)" class="mr-3">
                      <v-img :src="getFullFileUrl(item.file_path)" width="40" height="40" class="rounded" />
                    </div>
                    <div v-else-if="isPdfFile(item.file_path)" class="mr-3">
                      <v-icon size="40" color="red">mdi-file-pdf-box</v-icon>
                    </div>
                    <div v-else class="mr-3">
                      <v-icon size="40" color="blue">mdi-file-document</v-icon>
                    </div>
                    <div>
                      <div class="text-caption">{{ item.file_name }}</div>
                      <div class="d-flex">
                        <v-btn size="x-small" color="primary" variant="text" @click="viewFile(item.file_path)"
                          class="pa-0 ma-0">
                          <v-icon size="14" class="mr-1">mdi-eye</v-icon>
                          View
                        </v-btn>
                        <v-btn size="x-small" color="success" variant="text"
                          @click="downloadFile(item.file_path, item.file_name)" class="pa-0 ma-0 ml-2">
                          <v-icon size="14" class="mr-1">mdi-download</v-icon>
                          Download
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </template>

                <template v-slot:item.action="{ item }">
                  <div class="d-flex justify-center">
                    <v-tooltip text="Edit" color="#125C13" location="top start">
                      <template v-slot:activator="{ props }">
                        <v-btn size="small" :color="app.colors.primary" @click="editDocument(item.id)" class="mx-1"
                          v-bind="props" icon>
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>

                    <v-tooltip :text="getDocumentApproveTooltip(item)" color="#2E7D32" location="top start"
                      v-if="canApproveDocument(item)">
                      <template v-slot:activator="{ props }">
                        <v-btn size="small" :color="getDocumentApproveButtonColor(item)"
                          @click="approveDocument(item.id)" class="mx-1" v-bind="props" icon>
                          <v-icon>{{ getDocumentApproveButtonIcon(item) }}</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>

                    <v-tooltip text="Hapus" color="#125C13" location="top start">
                      <template v-slot:activator="{ props }">
                        <v-btn size="small" :color="app.colors.secondary" @click="deleteDocument(item.id)" class="mx-1"
                          v-bind="props" icon>
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </div>
                </template>
              </v-data-table>
            </div>

            <!-- Detail Section for Children -->
            <div class="detail-section mb-6" v-if="detailViewMode === 'children'">
              <h3 class="detail-section-title">
                <v-icon class="mr-2" color="#FFD700">mdi-account-supervisor</v-icon>
                Detail Downline
                <v-chip color="info" size="small" class="ml-3">
                  {{ relatedMvoData.length }} Data
                </v-chip>
              </h3>

              <v-text-field v-model="detailSearch" prepend-inner-icon="mdi-magnify" label="Cari Data Downline..."
                single-line hide-details variant="outlined" class="mb-3" density="compact" />

              <v-data-table class="bg-grey-lighten-4 text-no-wrap custom-detail-table" :headers="detailHeaders"
                :items="getCurrentDetailData()" :search="detailSearch" hide-default-footer items-per-page="-1">

                <template v-slot:item.mvo_type="{ item }">
                  {{ getMvoTypeName(item.mvo_type_id) }}
                </template>

                <template v-slot:item.province="{ item }">
                  {{ getProvinceName(item.province_id) }}
                </template>

                <template v-slot:item.parent="{ item }">
                  {{ getParentName(item.parent_id) }}
                </template>

                <template v-slot:item.tgl_lahir="{ item }">
                  {{ formatDate(item.tgl_lahir) }}
                </template>

                <template v-slot:item.action="{ item }">
                  <div class="d-flex justify-center">
                    <v-tooltip text="Detail Data Downline" color="#125C13" location="top start"
                      v-if="item.parent_id && item.parent_id !== item.id">
                      <template v-slot:activator="{ props }">
                        <v-btn size="small" color="warning" @click="showParentDetail(item.id)"
                          :loading="isLoadingParentDetail" class="mx-1" v-bind="props" icon>
                          <v-icon>mdi-account-arrow-up</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </div>
                </template>
              </v-data-table>
            </div>
          </div>
          <!-- Dialog Edit Document - Perbaikan -->
          <v-dialog v-model="isShowDialogEditDocument" max-width="600px">
            <v-card class="custom-dialog">
              <v-card-title class="dialog-header">
                <v-icon class="mr-2" style="color: #FFD700;">mdi-pencil</v-icon>
                <span class="dialog-title">EDIT DOKUMEN</span>
              </v-card-title>

              <v-card-text class="dialog-content">
                <v-row>
                  <!-- <v-col cols="12">
                    <v-text-field label="Kode MVO" :value="getMvoCodeById(documentEditModel.mvo_id)" class="mb-2 mt-4"
                      readonly disabled />
                  </v-col> -->
                </v-row>

                <v-row>
                  <v-col cols="12">
                    <v-text-field label="Nama File" v-model="documentEditModel.file_name" class="mb-2"
                      :rules="[requiredRule]" />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12">
                    <v-text-field label="Poin Per Bintang" v-model.number="documentEditModel.pointbintang" type="number"
                      min="0" max="5" step="1" class="mb-2" :rules="[requiredRule, pointbintangRule]"
                      @input="validatePointbintang('edit')" />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12">
                    <v-file-input label="Upload File Baru (Opsional)" v-model="documentEditModel.file" class="mb-2"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" @change="handleEditDocumentFileChange"
                      hint="Kosongkan jika tidak ingin mengubah file" persistent-hint />
                  </v-col>
                </v-row>

                <!-- Preview file yang ada jika tidak upload file baru -->
                <v-row v-if="documentEditModel.file_path && !documentEditModel.file">
                  <v-col cols="12">
                    <div class="mb-2">
                      <label class="text-caption text-grey">File Saat Ini:</label>
                      <div class="d-flex align-center mt-1">
                        <div v-if="isImageFile(documentEditModel.file_path)" class="mr-3">
                          <v-img :src="getFullFileUrl(documentEditModel.file_path)" width="40" height="40"
                            class="rounded" />
                        </div>
                        <div v-else-if="isPdfFile(documentEditModel.file_path)" class="mr-3">
                          <v-icon size="40" color="red">mdi-file-pdf-box</v-icon>
                        </div>
                        <div v-else class="mr-3">
                          <v-icon size="40" color="blue">mdi-file-document</v-icon>
                        </div>
                        <div>
                          <div class="text-body-2">{{ documentEditModel.original_file_name || 'File tidak diketahui' }}
                          </div>
                          <v-btn size="x-small" color="primary" variant="text"
                            @click="viewFile(documentEditModel.file_path)">
                            <v-icon size="14" class="mr-1">mdi-eye</v-icon>
                            Lihat File
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-actions class="dialog-actions">
                <v-spacer></v-spacer>
                <v-btn :color="app.colors.secondary" @click="isShowDialogEditDocument = false" class="ml-2">
                  Batal
                </v-btn>
                <v-btn :color="app.colors.primary" @click="updateDocument(documentEditModel.id)"
                  :loading="isDocumentButtonLoading" class="ml-2">
                  Update
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- Mobile View -->
          <div class="d-block d-md-none">
            <!-- Mobile Navigation Tabs -->
            <v-tabs v-model="mobileDetailTab" class="mb-4" color="primary" grow>
              <v-tab value="documents">
                <v-icon start>mdi-file-document-multiple</v-icon>
                Dokumen
              </v-tab>
              <v-tab value="children" v-if="detailViewMode === 'children'">
                <v-icon start>mdi-account-supervisor</v-icon>
                Downline ({{ relatedMvoData.length }})
              </v-tab>
            </v-tabs>

            <v-window v-model="mobileDetailTab">
              <!-- Documents Tab -->
              <v-window-item value="documents">
                <!-- Add Document Button -->
                <div class="mb-4">
                  <v-btn color="primary" block @click="showDialogAddDocument" :disabled="!getDocumentMvoId()"
                    class="text-white">
                    <v-icon start>mdi-plus</v-icon>
                    Tambah Dokumen
                  </v-btn>

                  <div class="d-flex justify-center align-center mt-2 gap-2" v-if="getDocumentMvoId()">
                    <!-- KODE -->
                    <v-chip color="success" size="small">
                      {{ getDocumentMvoCode() }}
                    </v-chip>

                    <!-- NAMA PEMILIK -->
                    <span class="text-caption text-grey">
                      {{ originalDetailMvoData?.nama || '-' }}
                    </span>
                  </div>
                </div>


                <!-- Document Search -->
                <v-text-field v-model="documentSearch" prepend-inner-icon="mdi-magnify" label="Cari Dokumen..."
                  single-line hide-details variant="outlined" class="mb-3" density="compact" />

                <!-- Loading State -->
                <v-progress-linear v-if="isLoadingDocuments" indeterminate color="#FFD700"
                  class="mb-4"></v-progress-linear>

                <!-- No Documents -->
                <div v-if="documentItems.length === 0 && !isLoadingDocuments" class="text-center pa-4">
                  <v-icon size="64" color="grey">mdi-file-document-off</v-icon>
                  <p class="text-grey mt-2">Tidak ada dokumen untuk data ini</p>
                </div>

                <!-- Document Cards -->
                <v-card v-for="(document, index) in documentItems" :key="document.id" class="mobile-document-card mb-3"
                  elevation="2">
                  <v-card-text>
                    <!-- Document Header -->
                    <div class="d-flex align-center mb-3">
                      <div class="mr-3">
                        <div v-if="isImageFile(document.file_path)">
                          <v-img :src="getFullFileUrl(document.file_path)" width="50" height="50" class="rounded" />
                        </div>
                        <div v-else-if="isPdfFile(document.file_path)">
                          <v-icon size="50" color="red">mdi-file-pdf-box</v-icon>
                        </div>
                        <div v-else>
                          <v-icon size="50" color="blue">mdi-file-document</v-icon>
                        </div>
                      </div>
                      <div class="flex-grow-1">
                        <div class="font-weight-medium mb-1">{{ document.file_name }}</div>
                        <div class="text-caption text-grey mb-1">{{ getMvoCodeById(document.mvo_id) }}</div>
                      </div>
                    </div>

                    <!-- Document Info dengan Status Approval -->
                    <v-row class="mb-2" no-gutters>
                      <v-col cols="6">
                        <div class="text-caption text-grey">Poin Per Bintang:</div>
                        <div class="font-weight-medium">{{ document.pointbintang || '-' }}</div>
                      </v-col>
                    </v-row>

                    <!-- Status Approval Section -->
                    <v-divider class="my-2"></v-divider>
                    <v-row class="mb-2" no-gutters>
                      <v-col cols="5">
                        <div class="text-caption text-grey">Status MVO:</div>
                      </v-col>
                      <v-col cols="7">
                        <v-chip :color="getDocumentStatusColor(document.status_inputan)" size="x-small" variant="flat">
                          {{ getDocumentStatusText(document.status_inputan) }}
                        </v-chip>
                      </v-col>
                    </v-row>

                    <v-row class="mb-3" no-gutters v-if="otoritas === 'superadmin'">
                      <v-col cols="5">
                        <div class="text-caption text-grey">Status Admin:</div>
                      </v-col>
                      <v-col cols="7">
                        <v-chip
                          :color="document.status_inputan_2 === 'approved' ? 'success' : (document.status_inputan === 'approved' ? 'warning' : 'grey')"
                          size="x-small" variant="flat">
                          <template v-if="document.status_inputan_2 === 'approved'">
                            Disetujui
                          </template>
                          <template v-else-if="document.status_inputan === 'approved'">
                            Menunggu
                          </template>
                          <template v-else>
                            Pending MVO
                          </template>
                        </v-chip>
                      </v-col>
                    </v-row>

                    <!-- Document Actions -->
                    <v-divider class="mb-3"></v-divider>
                    <div class="d-flex flex-wrap gap-2">
                      <v-btn size="small" color="primary" variant="outlined" @click="viewFile(document.file_path)"
                        class="flex-grow-1">
                        <v-icon start size="16">mdi-eye</v-icon>
                        View
                      </v-btn>
                      <v-btn size="small" color="success" variant="outlined"
                        @click="downloadFile(document.file_path, document.file_name)" class="flex-grow-1">
                        <v-icon start size="16">mdi-download</v-icon>
                        Download
                      </v-btn>
                    </div>

                    <!-- Admin Actions -->
                    <div class="d-flex flex-wrap gap-2 mt-2">
                      <v-btn size="small" :color="app.colors.primary" variant="text" @click="editDocument(document.id)">
                        <v-icon start size="16">mdi-pencil</v-icon>
                        Edit
                      </v-btn>

                      <v-btn v-if="canApproveDocument(document)" size="small"
                        :color="getDocumentApproveButtonColor(document)" variant="text"
                        @click="approveDocument(document.id)">
                        <v-icon start size="16">{{ getDocumentApproveButtonIcon(document) }}</v-icon>
                        {{ otoritas === 'mvo' ? 'Approve MVO' : 'Approve Admin' }}
                      </v-btn>

                      <v-btn size="small" :color="app.colors.secondary" variant="text"
                        @click="deleteDocument(document.id)">
                        <v-icon start size="16">mdi-delete</v-icon>
                        Hapus
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-window-item>

              <!-- Children Tab -->
              <v-window-item value="children" v-if="detailViewMode === 'children'">
                <!-- Search -->
                <v-text-field v-model="detailSearch" prepend-inner-icon="mdi-magnify" label="Cari Data Downline..."
                  single-line hide-details variant="outlined" class="mb-3" density="compact" />

                <!-- No Children -->
                <div v-if="getCurrentDetailData().length === 0" class="text-center pa-4">
                  <v-icon size="64" color="grey">mdi-account-off</v-icon>
                  <p class="text-grey mt-2">Tidak ada data Downline</p>
                </div>

                <!-- Children Cards -->
                <v-card v-for="(child, index) in getCurrentDetailData()" :key="child.id" class="mobile-child-card mb-3"
                  elevation="2" @click="toggleMobileChildDetail(child.id)"
                  :class="{ 'mobile-child-expanded': expandedMobileChild === child.id }">

                  <!-- Child Header -->
                  <v-card-text class="mobile-child-header">
                    <v-row no-gutters align="center">
                      <v-col cols="2" class="text-center">
                        <v-avatar color="primary" size="32">
                          <span class="text-white font-weight-bold">{{ index + 1 }}</span>
                        </v-avatar>
                      </v-col>
                      <v-col cols="8" class="pl-3">
                        <div class="mobile-child-name font-weight-medium">{{ child.nama }}</div>
                        <div class="mobile-child-code text-caption text-grey">{{ child.code }}</div>
                        <v-chip color="info" size="x-small" variant="flat" class="mt-1">
                          {{ getMvoTypeName(child.mvo_type_id) }}
                        </v-chip>
                      </v-col>
                      <v-col cols="2" class="text-center">
                        <v-icon :class="{ 'rotate-180': expandedMobileChild === child.id }" class="transition-all">
                          mdi-chevron-down
                        </v-icon>
                      </v-col>
                    </v-row>
                  </v-card-text>

                  <!-- Child Details - Expandable -->
                  <v-expand-transition>
                    <div v-show="expandedMobileChild === child.id">
                      <v-divider></v-divider>
                      <v-card-text class="mobile-child-details">
                        <!-- Personal Info -->
                        <div class="mobile-info-section mb-3">
                          <h4 class="text-subtitle-2 mb-2 text-primary">Informasi Personal</h4>
                          <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">Nomer ID:</v-col>
                            <v-col cols="8" class="text-body-2">{{ child.no_id || '-' }}</v-col>
                          </v-row>
                          <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">Panggilan:</v-col>
                            <v-col cols="8" class="text-body-2">{{ child.nama_panggilan || '-' }}</v-col>
                          </v-row>
                          <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">Tempat Lahir:</v-col>
                            <v-col cols="8" class="text-body-2">{{ child.tempat_lahir || '-' }}</v-col>
                          </v-row>
                          <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">Tgl Lahir:</v-col>
                            <v-col cols="8" class="text-body-2">{{ formatDate(child.tgl_lahir) }}</v-col>
                          </v-row>
                          <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">Class:</v-col>
                            <v-col cols="8" class="text-body-2">{{ child.class_member || '-' }}</v-col>
                          </v-row>
                        </div>

                        <!-- Contact Info -->
                        <div class="mobile-info-section mb-3">
                          <h4 class="text-subtitle-2 mb-2 text-primary">Kontak</h4>
                          <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">No HP:</v-col>
                            <v-col cols="8" class="text-body-2">{{ child.nohp || '-' }}</v-col>
                          </v-row>
                          <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">Sosmed:</v-col>
                            <v-col cols="8" class="text-body-2">{{ child.sosmed || '-' }}</v-col>
                          </v-row>
                          <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">Alamat:</v-col>
                            <v-col cols="8" class="text-body-2">{{ child.alamat || '-' }}</v-col>
                          </v-row>
                        </div>

                        <!-- Business Info -->
                        <div class="mobile-info-section mb-3">
                          <h4 class="text-subtitle-2 mb-2 text-primary">Bisnis</h4>
                          <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">Jaringan:</v-col>
                            <v-col cols="8" class="text-body-2">{{ child.jaringan_mvo || '-' }}</v-col>
                          </v-row>
                          <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">Provinsi:</v-col>
                            <v-col cols="8" class="text-body-2">{{ getProvinceName(child.province_id) }}</v-col>
                          </v-row>
                          <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">Upline:</v-col>
                            <v-col cols="8" class="text-body-2">{{ getParentName(child.parent_id) }}</v-col>
                          </v-row>
                          <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">Level:</v-col>
                            <v-col cols="8" class="text-body-2">{{ child.level || '-' }}</v-col>
                          </v-row>
                        </div>

                        <!-- Actions -->
                        <v-divider class="mb-3"></v-divider>
                        <div class="d-flex justify-center">
                          <v-btn v-if="child.parent_id && child.parent_id !== child.id" size="small" color="warning"
                            @click.stop="showParentDetail(child.id)" :loading="isLoadingParentDetail"
                            class="text-white">
                            <v-icon start size="16">mdi-account-arrow-up</v-icon>
                            Downline
                          </v-btn>
                        </div>
                      </v-card-text>
                    </div>
                  </v-expand-transition>
                </v-card>
              </v-window-item>
            </v-window>
          </div>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-btn v-if="detailNavigationHistory.length > 0" :color="app.colors.secondary" @click="navigateBack"
            :loading="isNavigatingBack" class="ml-2">
            <v-icon start>mdi-arrow-left</v-icon>
            Kembali
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn :color="app.colors.primary" @click="closeDetailDialog" class="ml-2">
            Tutup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="isShowDialogDelete" :max-width="$vuetify.display.mobile ? '95%' : '500px'">
      <v-card :color="app.colors.background">
        <v-card-title class="text-h5">
          Apakah anda yakin ingin menghapus data ini?
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="app.colors.primary" @click="isShowDialogDelete = false">Cancel</v-btn>
          <v-btn :color="app.colors.secondary" @click="confirmDeleteMvo(modelDelete.id)"
            :loading="isButtonLoading">OK</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Document Management Dialogs -->
    <v-dialog v-model="isShowDialogAddDocument" persistent :width="$vuetify.display.mobile ? '95%' : '700'">
      <v-card class="custom-dialog">
        <v-card-title class="dialog-header">
          <v-icon class="mr-2" style="color: #FFD700;">mdi-plus-circle</v-icon>
          <span class="dialog-title">TAMBAH DOKUMEN</span>
        </v-card-title>
        <v-card-text class="dialog-content">
          <v-row>
            <v-col cols="12">
              <v-text-field label="Nama File" v-model="documentAddModel.file_name" class="mb-2 mt-4"
                :rules="[requiredRule]" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field label="Poin Per Bintang" v-model.number="documentAddModel.pointbintang" type="number"
                min="0" max="5" step="1" class="mb-2" hint="Masukkan poin yang diberikan per bintang (maksimal 5)"
                persistent-hint :rules="[requiredRule, pointbintangRule]" @input="validatePointbintang('add')" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-file-input label="Upload File" v-model="documentAddModel.file" class="mb-2"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" @change="handleDocumentFileChange" :rules="[requiredRule]" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn :color="app.colors.secondary" @click="isShowDialogAddDocument = false" class="ml-2">Batal</v-btn>
          <v-btn :color="app.colors.primary" @click="addDocument()" :loading="isDocumentButtonLoading"
            class="ml-2">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Other dialogs and snackbar -->
    <v-snackbar v-model="contentSnackbar.snackbar" :color="contentSnackbar.color">
      {{ contentSnackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import CardDataTable from "@/components/ui/CardDataTable.vue";
import { useAppStore } from "@/stores/app.js";
import axios from "axios";
import Cookies from "js-cookie";

export default {
  name: "MvoManagement",
  components: {
    Breadcrumb,
    CardDataTable,
  },

  setup() {
    const app = useAppStore();
    return { app };
  },

  data() {
    return {
      mobileDetailTab: 'documents',
      expandedMobileChild: null,
      expandedMobileCard: null, // For mobile card expansion
      detailNavigationHistory: [],
      isNavigatingBack: false,
      allMvoData: [],
      contentSnackbar: {
        snackbar: false,
        text: "",
        color: "",
      },
      otoritas: "",
      title: "DATA AKUN",
      itemsBreadcrumb: [
        {
          title: "Dashboard",
          disabled: false,
          href: "/admin/dashboard",
        },
        {
          title: "AKUN",
          disabled: false,
          href: "/admin/mvo",
        },
      ],

      // State management
      isShowDialogEditDocument: false,
      isShowDialogForm: false,
      isShowDialogDetail: false,
      isEditMode: false,
      isButtonLoading: false,
      isShowDialogDelete: false,
      isLoadingMvoTypes: false,
      isLoadingProvinces: false,
      isTableLoading: true,
      isLoadingParentDetail: false,

      // Document-related states
      isShowDialogAddDocument: false,
      isDocumentButtonLoading: false,
      isLoadingDocuments: false,

      // Detail navigation
      currentDetailIndex: 0,
      relatedMvoData: [],
      detailViewMode: 'single',

      classMemberOptions: [
        { title: 'GOLD', value: 'GOLD' },
        { title: 'SILVER', value: 'SILVER' },
        { title: 'PLATINUM', value: 'PLATINUM' }
      ],
      levelOptions: [
        { title: 'Level 1', value: '1' },
        { title: 'Level 2', value: '2' },
        { title: 'Level 3', value: '3' }
      ],

      documentSearch: "",
      detailSearch: "",

      // Pagination
      currentPage: 1,
      itemsPerPage: 10,

      userSearch: "",

      // Data models
      datatable: {
        search: "",
        headers: [
          { key: "no", title: "No", sortable: false },
          { key: "code", title: "Kode", fixed: 'start', width: '80px' },
          { key: "nama", title: "Nama", fixed: 'start', width: '80px' },
          { key: "nama_panggilan", title: "Nama Panggilan" },
          { key: "nomor_id", title: "Nomer ID" },
          { key: "no_id", title: "No ID" },
          { key: "tempat_lahir", title: "Tempat Lahir" },
          { key: "tgl_lahir", title: "Tanggal Lahir" },
          // { key: "class_member", title: "Class Member" },
          { key: "alamat", title: "Alamat" },
          { key: "nohp", title: "No HP" },
          { key: "sosmed", title: "Sosmed" },
          { key: "jaringan_mvo", title: "Jaringan" },
          { key: "mvo_type", title: "Tipe" },
          { key: "province", title: "Provinsi" },
          { key: "parent", title: "Upline" },
          { key: "level", title: "Level" },
          { key: "status_inputan", title: "Status MVO", sortable: false, align: "center" }, // UBAH TITLE
          { key: "status_inputan_2", title: "Status Admin", sortable: false, align: "center" }, // TAMBAH KOLOM BARU
          { key: "approve", title: "Approve", sortable: false, align: "center" },
          { key: "detail", title: "Detail", sortable: false, align: "center" },
          { key: "print", title: "Print", sortable: false, align: "center" },
          { key: "action", title: "Detail", sortable: false, align: "center" },
        ],
        items: [],
      },

      users: [], // Tambahkan ini untuk menyimpan list user
      isLoadingUsers: false, // Loading state untuk user dropdown
      selectedUserId: null, // ID user yang dipilih

      detailHeaders: [
        { key: "code", title: "Kode" },
        { key: "nama", title: "Nama" },
        { key: "nama_panggilan", title: "Nama Panggilan" },
        { key: "nomor_id", title: "Nomer ID" },
        { key: "no_id", title: "No ID" },
        { key: "tempat_lahir", title: "Tempat Lahir" },
        { key: "tgl_lahir", title: "Tanggal Lahir" },
        { key: "class_member", title: "Class Member" },
        { key: "alamat", title: "Alamat" },
        { key: "nohp", title: "No HP" },
        { key: "sosmed", title: "Sosmed" },
        { key: "jaringan_mvo", title: "Jaringan" },
        { key: "mvo_type", title: "Tipe" },
        { key: "province", title: "Provinsi" },
        { key: "parent", title: "Upline" },
        { key: "level", title: "Level" },
        { key: "action", title: "Detail", sortable: false, align: "center" },
      ],

      // Document headers and data
      documentHeaders: [
        { key: "mvo_code", title: "Kode" },
        { key: "file_name", title: "Nama File" },
        { key: "pointbintang", title: "Poin Per Bintang", align: "center" },
        { key: "status_inputan", title: "Status MVO", align: "center" },      // UBAH TITLE
        { key: "status_inputan_2", title: "Status Admin", align: "center" },  // TAMBAH KOLOM BARU
        { key: "file_path", title: "File Preview", sortable: false, width: "200px" },
        { key: "action", title: "Actions", sortable: false, align: "center" },
      ],
      documentItems: [],

      originalDetailMvoId: null,
      originalDetailMvoData: {},

      // Reference data
      mvoTypes: [],
      provinces: [],
      parentMvoOptions: [],

      // Current model for form operations
      currentModel: {
        id: "",
        code: "",
        nama: "",
        nama_panggilan: "",
        no_id: "",
        tempat_lahir: "",
        tgl_lahir: "",
        class_member: "",
        alamat: "",
        nohp: "",
        sosmed: "",           // Manual
        jaringan_mvo: "",     // Manual
        mvo_type_id: "",      // Manual
        province_id: "",      // Manual
        parent_id: null,      // Manual
        level: "",            // Manual
      },
      // Detail model
      detailModel: {},

      // Delete model
      modelDelete: {
        id: "",
      },

      // Document models
      documentAddModel: {
        mvo_id: "",
        file_name: "",
        pointbintang: "",
        file: null,
      },
      documentEditModel: {
        id: "",
        file_name: "",
        pointbintang: "",
        file: null,
      },
      // File preview model
      previewFile: {
        url: '',
        type: '',
        name: ''
      },
    };
  },

  computed: {
    displayHeaders() {
      if (this.otoritas === 'superadmin') {
        return this.datatable.headers; // Tampilkan semua kolom untuk superadmin
      } else if (this.otoritas === 'mvo') {
        // Untuk MVO, hilangkan kolom status_inputan_2 dan ubah approve
        return this.datatable.headers.filter(header =>
          header.key !== 'status_inputan_2'
        );
      } else {
        // Untuk role lain, hilangkan approve dan status_inputan_2
        return this.datatable.headers.filter(header =>
          header.key !== 'approve' && header.key !== 'status_inputan_2'
        );
      }
    },
    // Filtered users berdasarkan pencarian
    filteredUsers() {
      if (!this.userSearch || this.userSearch.trim() === '') {
        return this.users;
      }

      const searchTerm = this.userSearch.toLowerCase().trim();

      return this.users.filter(user => {
        const nama = (user.nama || '').toLowerCase();
        const no_id = (user.no_id || '').toLowerCase();
        const nohp = (user.nohp || '').toLowerCase();

        return nama.includes(searchTerm) ||
          no_id.includes(searchTerm) ||
          nohp.includes(searchTerm);
      });
    },

    requiredRule() {
      return value => !!value || 'Field ini wajib diisi';
    },
    pointbintangRule() {
      return value => {
        if (value === null || value === undefined || value === '') {
          return 'Poin per bintang harus diisi';
        }
        const num = Number(value);
        if (isNaN(num)) {
          return 'Harus berupa angka';
        }
        if (num < 0) {
          return 'Poin tidak boleh kurang dari 0';
        }
        if (num > 5) {
          return 'Poin maksimal adalah 5';
        }
        if (!Number.isInteger(num)) {
          return 'Poin harus berupa bilangan bulat';
        }
        return true;
      };
    },

    // Filtered items for mobile search
    filteredItems() {
      if (!this.datatable.search) {
        return this.datatable.items;
      }

      const searchTerm = this.datatable.search.toLowerCase();
      return this.datatable.items.filter(item => {
        return (
          (item.nama && item.nama.toLowerCase().includes(searchTerm)) ||
          (item.code && item.code.toLowerCase().includes(searchTerm)) ||
          (item.nama_panggilan && item.nama_panggilan.toLowerCase().includes(searchTerm)) ||
          (item.no_id && item.no_id.toLowerCase().includes(searchTerm)) ||
          (item.nohp && item.nohp.toLowerCase().includes(searchTerm)) ||
          (item.tempat_lahir && item.tempat_lahir.toLowerCase().includes(searchTerm)) ||
          (item.class_member && item.class_member.toLowerCase().includes(searchTerm)) ||
          (item.jaringan_mvo && item.jaringan_mvo.toLowerCase().includes(searchTerm)) ||
          (this.getMvoTypeName(item.mvo_type_id) && this.getMvoTypeName(item.mvo_type_id).toLowerCase().includes(searchTerm)) ||
          (this.getProvinceName(item.province_id) && this.getProvinceName(item.province_id).toLowerCase().includes(searchTerm)) ||
          (this.getParentName(item.parent_id) && this.getParentName(item.parent_id).toLowerCase().includes(searchTerm))
        );
      });
    }
  },

  methods: {
    validatePointbintang(mode) {
      const model = mode === 'add' ? this.documentAddModel : this.documentEditModel;

      // Konversi ke number
      let value = Number(model.pointbintang);

      // Jika NaN atau kosong, set ke 0
      if (isNaN(value) || model.pointbintang === '') {
        model.pointbintang = '';
        return;
      }

      // Batasi minimum 0
      if (value < 0) {
        model.pointbintang = 0;
        return;
      }

      // Batasi maksimum 5
      if (value > 5) {
        model.pointbintang = 5;
        this.showSnackbar('Poin maksimal adalah 5', 'warning');
        return;
      }

      // Bulatkan ke integer (hilangkan desimal)
      model.pointbintang = Math.floor(value);
    },
    setLevelByMvoType(mvoTypeId) {
      if (!mvoTypeId) {
        this.currentModel.level = "";
        return;
      }

      const mvoType = this.mvoTypes.find(type => type.id == mvoTypeId);
      if (!mvoType) {
        this.currentModel.level = "";
        return;
      }

      const typeName = mvoType.name.toUpperCase();

      // Set level berdasarkan nama tipe
      if (typeName.includes('MVO')) {
        this.currentModel.level = '1';
      } else if (typeName.includes('DIST')) {
        this.currentModel.level = '2';
      } else if (typeName.includes('FO')) {
        this.currentModel.level = '3';
      } else {
        this.currentModel.level = "";
      }
    },
    customUserFilter(itemTitle, queryText, item) {
      if (!queryText) return true;

      const searchTerm = queryText.toLowerCase().trim();
      const nama = (item.raw.nama || '').toLowerCase();
      const no_id = (item.raw.no_id || '').toLowerCase();
      const nohp = (item.raw.nohp || '').toLowerCase();

      return nama.includes(searchTerm) ||
        no_id.includes(searchTerm) ||
        nohp.includes(searchTerm);
    },
    async getUsers() {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isLoadingUsers = true;
      try {
        const response = await axios.get("https://babaapi.babaparfume.id/api/user", { headers });
        console.log('Users loaded:', response.data); // Debug
        if (response.data.status === "success") {
          this.users = response.data.data;
        }
      } catch (error) {
        console.error("Error loading users:", error);
        this.showSnackbar("Gagal memuat data user", "error");
      } finally {
        this.isLoadingUsers = false;
      }
    },

    // Method untuk handle ketika user dipilih dari dropdown
    async onUserSelected(userId) {
      if (!userId) {
        // Reset hanya field yang auto-fill, keep manual fields
        const manualFields = {
          sosmed: this.currentModel.sosmed,
          jaringan_mvo: this.currentModel.jaringan_mvo,
          level: this.currentModel.level,
          mvo_type_id: this.currentModel.mvo_type_id,
          province_id: this.currentModel.province_id,
          parent_id: this.currentModel.parent_id,
        };

        this.currentModel = {
          ...this.getEmptyModel(),
          ...manualFields
        };
        this.selectedUserId = null;
        return;
      }

      const headers = this.getAuthHeaders();
      if (!headers) return;

      try {
        const response = await axios.get(`https://babaapi.babaparfume.id/api/user/${userId}`, { headers });
        console.log('User detail loaded:', response.data); // Debug

        if (response.data.status === "success") {
          const userData = response.data.data;

          // Simpan manual fields yang sudah diisi
          const manualFields = {
            sosmed: this.currentModel.sosmed || "",
            jaringan_mvo: this.currentModel.jaringan_mvo || "",
            level: this.currentModel.level || "",
            mvo_type_id: this.currentModel.mvo_type_id || "",
            province_id: this.currentModel.province_id || "",
            parent_id: this.currentModel.parent_id || null,
          };

          // Auto-fill hanya field yang bukan manual
          this.currentModel = {
            id: "",
            code: "",
            nama: userData.nama || "",
            nama_panggilan: userData.nama_panggilan || "",
            no_id: userData.no_id || "",
            tempat_lahir: userData.tempat_lahir || "",
            tgl_lahir: userData.tgl_lahir ? new Date(userData.tgl_lahir).toISOString().split('T')[0] : "",
            class_member: userData.class_member || "",
            alamat: userData.alamat || "",
            nohp: userData.nohp || "",
            // Keep manual fields
            ...manualFields
          };

          this.selectedUserId = userId;
          this.showSnackbar("Data user berhasil dimuat. Silakan isi Sosmed, Jaringan, Level, Tipe, Provinsi, dan Upline", "primary");
        }
      } catch (error) {
        console.error("Error loading user detail:", error);
        this.showSnackbar("Gagal memuat detail user", "error");
      }
    },

    toggleMobileChildDetail(childId) {
      if (this.expandedMobileChild === childId) {
        this.expandedMobileChild = null;
      } else {
        this.expandedMobileChild = childId;
      }
    },
    closeDetailDialog() {
      this.isShowDialogDetail = false;
      this.currentDetailIndex = 0;
      this.relatedMvoData = [];
      this.detailViewMode = 'single';
      this.detailModel = {};
      this.documentItems = [];
      this.originalDetailMvoId = null;
      this.originalDetailMvoData = {};
      this.documentSearch = "";
      this.detailSearch = "";
      this.detailNavigationHistory = [];

      // Reset mobile states
      this.mobileDetailTab = 'documents';
      this.expandedMobileChild = null;
    },
    // Mobile card toggle method
    toggleMobileDetail(itemId) {
      if (this.expandedMobileCard === itemId) {
        this.expandedMobileCard = null;
      } else {
        this.expandedMobileCard = itemId;
      }
    },

    updateCurrentPageInfo(options) {
      this.currentPage = options.page;
      this.itemsPerPage = options.itemsPerPage;
    },

    saveCurrentState() {
      return {
        originalDetailMvoId: this.originalDetailMvoId,
        originalDetailMvoData: { ...this.originalDetailMvoData },
        relatedMvoData: [...this.relatedMvoData],
        currentDetailIndex: this.currentDetailIndex,
        detailModel: { ...this.detailModel },
        detailViewMode: this.detailViewMode,
        documentItems: [...this.documentItems]
      };
    },

    restoreState(previousState) {
      this.originalDetailMvoId = previousState.originalDetailMvoId;
      this.originalDetailMvoData = { ...previousState.originalDetailMvoData };
      this.relatedMvoData = [...previousState.relatedMvoData];
      this.currentDetailIndex = previousState.currentDetailIndex;
      this.detailModel = { ...previousState.detailModel };
      this.detailViewMode = previousState.detailViewMode;
      this.documentItems = [...previousState.documentItems];
    },

    // Status color and text methods
    getDocumentStatusColor(status) {
      switch (status?.toLowerCase()) {
        case 'approved': return 'success';
        case 'pending': return 'warning';
        case 'rejected': return 'error';
        default: return 'grey';
      }
    },

    getDocumentStatusText(status) {
      switch (status?.toLowerCase()) {
        case 'approved': return 'Disetujui';
        case 'pending': return 'Menunggu';
        case 'rejected': return 'Ditolak';
        default: return status || 'Tidak Diketahui';
      }
    },

    async approveDocument(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      // Tentukan endpoint berdasarkan otoritas
      let endpoint = '';
      let successMessage = '';

      if (this.otoritas === 'mvo') {
        endpoint = `https://babaapi.babaparfume.id/api/mvo-documents/${id}/approve`;
        successMessage = "Dokumen berhasil disetujui oleh MVO";
      } else if (this.otoritas === 'superadmin') {
        endpoint = `https://babaapi.babaparfume.id/api/superadmin/${id}/approvedoc`;
        successMessage = "Dokumen berhasil disetujui oleh Superadmin";
      } else {
        this.showSnackbar("Anda tidak memiliki akses untuk approve", 'error');
        return;
      }

      try {
        const response = await axios.put(
          endpoint,
          {},
          { headers }
        );

        if (response.data.status === "success") {
          this.showSnackbar(response.data.message || successMessage);
          // Refresh document list
          await this.getMvoDocuments(this.getDocumentMvoId());
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error approving document", 'error');
      }
    },

    // TAMBAH helper methods untuk document (setelah method approveDocument):
    canApproveDocument(document) {
      if (this.otoritas === 'mvo') {
        // MVO hanya bisa approve jika status_inputan belum approved
        return document.status_inputan !== 'approved';
      } else if (this.otoritas === 'superadmin') {
        // Superadmin hanya bisa approve jika status_inputan sudah approved dan status_inputan_2 belum
        return document.status_inputan === 'approved' && document.status_inputan_2 !== 'approved';
      }
      return false;
    },

    getDocumentApproveButtonColor(document) {
      if (this.otoritas === 'mvo') {
        return document.status_inputan === 'approved' ? 'success' : 'warning';
      } else if (this.otoritas === 'superadmin') {
        return document.status_inputan_2 === 'approved' ? 'success' : 'success';
      }
      return 'grey';
    },

    getDocumentApproveButtonIcon(document) {
      if (this.otoritas === 'mvo') {
        return document.status_inputan === 'approved' ? 'mdi-check-circle' : 'mdi-check';
      } else if (this.otoritas === 'superadmin') {
        return document.status_inputan_2 === 'approved' ? 'mdi-check-all' : 'mdi-check-circle-outline';
      }
      return 'mdi-check';
    },

    getDocumentApproveTooltip(document) {
      if (this.otoritas === 'mvo') {
        return document.status_inputan === 'approved' ? 'Sudah Disetujui MVO' : 'Setujui sebagai MVO';
      } else if (this.otoritas === 'superadmin') {
        if (document.status_inputan !== 'approved') {
          return 'Menunggu Persetujuan MVO';
        }
        return document.status_inputan_2 === 'approved' ? 'Sudah Disetujui Admin' : 'Setujui sebagai Admin';
      }
      return 'Approve';
    },


    getDocumentMvoId() {
      return this.originalDetailMvoId || this.detailModel.id || null;
    },

    getDocumentMvoCode() {
      if (this.originalDetailMvoData && this.originalDetailMvoData.code) {
        return this.originalDetailMvoData.code;
      }
      if (this.originalDetailMvoId) {
        const mvo = this.datatable.items.find(item => item.id == this.originalDetailMvoId);
        return mvo ? mvo.code : 'Unknown';
      }
      return this.detailModel.code || 'Unknown';
    },

    // Helper methods
    getEmptyModel() {
      return {
        id: "",
        code: "",
        nama: "",
        nama_panggilan: "",
        no_id: "",
        tempat_lahir: "",
        tgl_lahir: "",
        class_member: "",
        alamat: "",
        nohp: "",
        sosmed: "",           // Manual
        jaringan_mvo: "",     // Manual
        mvo_type_id: "",      // Manual
        province_id: "",      // Manual
        parent_id: null,      // Manual
        level: "",            // Manual
      };
    },

    async approveMvo(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      // Close mobile expansion
      this.expandedMobileCard = null;

      // Tentukan endpoint berdasarkan otoritas
      let endpoint = '';
      let successMessage = '';

      if (this.otoritas === 'mvo') {
        endpoint = `https://babaapi.babaparfume.id/api/mvo/${id}/approve`;
        successMessage = "Data berhasil disetujui oleh MVO";
      } else if (this.otoritas === 'superadmin') {
        endpoint = `https://babaapi.babaparfume.id/api/superadmin/${id}/approve`;
        successMessage = "Data berhasil disetujui oleh Superadmin";
      } else {
        this.showSnackbar("Anda tidak memiliki akses untuk approve", 'error');
        return;
      }

      try {
        this.isButtonLoading = true;
        const response = await axios.put(
          endpoint,
          {},
          { headers }
        );

        if (response.data.status === "success") {
          this.showSnackbar(response.data.message || successMessage);
          await this.getAllMvo(); // Refresh data
        } else {
          this.showSnackbar(response.data.message || "Gagal menyetujui Data", 'error');
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error approving Data", 'error');
      } finally {
        this.isButtonLoading = false;
      }
    },

    // Tambahkan method helper untuk cek status approval
    canApprove(item) {
      if (this.otoritas === 'mvo') {
        // MVO hanya bisa approve jika status_inputan belum approved
        return item.status_inputan !== 'approved';
      } else if (this.otoritas === 'superadmin') {
        // Superadmin hanya bisa approve jika status_inputan sudah approved dan status_inputan_2 belum
        return item.status_inputan === 'approved' && item.status_inputan_2 !== 'approved';
      }
      return false;
    },

    getApproveButtonColor(item) {
      if (this.otoritas === 'mvo') {
        return item.status_inputan === 'approved' ? 'success' : 'warning';
      } else if (this.otoritas === 'superadmin') {
        return item.status_inputan_2 === 'approved' ? 'success' : 'success';
      }
      return 'grey';
    },

    getApproveButtonIcon(item) {
      if (this.otoritas === 'mvo') {
        return item.status_inputan === 'approved' ? 'mdi-check-circle' : 'mdi-check';
      } else if (this.otoritas === 'superadmin') {
        return item.status_inputan_2 === 'approved' ? 'mdi-check-all' : 'mdi-check-circle-outline';
      }
      return 'mdi-check';
    },

    getApproveTooltip(item) {
      if (this.otoritas === 'mvo') {
        return item.status_inputan === 'approved' ? 'Sudah Disetujui MVO' : 'Setujui sebagai MVO';
      } else if (this.otoritas === 'superadmin') {
        if (item.status_inputan !== 'approved') {
          return 'Menunggu Persetujuan MVO';
        }
        return item.status_inputan_2 === 'approved' ? 'Sudah Disetujui Admin' : 'Setujui sebagai Admin';
      }
      return 'Approve';
    },

    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('id-ID');
    },

    showSnackbar(message, color = 'primary') {
      this.contentSnackbar.snackbar = true;
      this.contentSnackbar.text = message;
      this.contentSnackbar.color = color === 'primary' ? this.app.colors.primary : this.app.colors.secondary;
    },

    getAuthHeaders() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return null;
      }
      return {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
    },

    // Data retrieval methods
    async getAllMvo() {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isTableLoading = true;
      try {
        const response = await axios.get("https://babaapi.babaparfume.id/api/mvo", { headers });

        if (response.data.status === "success") {
          const allItems = response.data.data;
          this.allMvoData = allItems;
          this.parentMvoOptions = allItems;

          let items = allItems;
          const otoritas = localStorage.getItem("otoritas");
          const no_idUser = localStorage.getItem("no_id");

          if (otoritas !== "superadmin" && no_idUser) {
            items = allItems.filter(item => item.no_id === no_idUser);
          }

          this.datatable.items = items;
        } else {
          this.showSnackbar(response.data.message || "Error loading data", "error");
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error loading data", "error");
      } finally {
        this.isTableLoading = false;
      }
    },

    async getMvoTypes() {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isLoadingMvoTypes = true;
      try {
        const response = await axios.get("https://babaapi.babaparfume.id/api/mvo-type", { headers });
        if (response.data.status === "success") {
          this.mvoTypes = response.data.data;
        }
      } catch (error) {
        console.error("Error loading MVO types:", error);
      } finally {
        this.isLoadingMvoTypes = false;
      }
    },

    async getProvinces() {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isLoadingProvinces = true;
      try {
        const response = await axios.get("https://babaapi.babaparfume.id/api/provinsi", { headers });
        if (response.data.status === "success") {
          this.provinces = response.data.data;
        }
      } catch (error) {
        console.error("Error loading provinces:", error);
      } finally {
        this.isLoadingProvinces = false;
      }
    },

    // Lookup methods
    getMvoTypeName(mvoTypeId) {
      const mvoType = this.mvoTypes.find(type => type.id == mvoTypeId);
      return mvoType ? mvoType.name : '-';
    },

    getProvinceName(provinceId) {
      const province = this.provinces.find(prov => prov.id == provinceId);
      return province ? province.name : '-';
    },

    getParentName(parentId) {
      if (!parentId) return '-';
      const parent = this.allMvoData.find(item => item.id == parentId);
      return parent ? parent.nama : '-';
    },

    getCurrentDetailData() {
      if (this.detailViewMode === 'children' && this.relatedMvoData.length > 0) {
        return this.relatedMvoData;
      }
      return [];
    },

    // Document Helper Methods
    isImageFile(filePath) {
      if (!filePath) return false;
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
      return imageExtensions.some(ext => filePath.toLowerCase().includes(ext));
    },

    isPdfFile(filePath) {
      if (!filePath) return false;
      return filePath.toLowerCase().includes('.pdf');
    },

    getFullFileUrl(filePath) {
      return `https://babaapi.babaparfume.id/project/public/${filePath}`;
    },

    // Debug method untuk getMvoCodeById
    getMvoCodeById(mvoId) {
      console.log('Debug getMvoCodeById:');
      console.log('- mvoId yang dicari:', mvoId);
      console.log('- Type mvoId:', typeof mvoId);
      console.log('- allMvoData length:', this.allMvoData.length);
      console.log('- parentMvoOptions length:', this.parentMvoOptions.length);

      // Cek di allMvoData
      let mvo = this.allMvoData.find(item => {
        console.log(`Comparing: ${item.id} (${typeof item.id}) === ${mvoId} (${typeof mvoId})`);
        return item.id == mvoId; // Gunakan == untuk type coercion
      });

      if (!mvo) {
        console.log('Tidak ditemukan di allMvoData, cari di parentMvoOptions');
        mvo = this.parentMvoOptions.find(item => {
          console.log(`Comparing parent: ${item.id} (${typeof item.id}) === ${mvoId} (${typeof mvoId})`);
          return item.id == mvoId;
        });
      }

      console.log('MVO ditemukan:', mvo);
      console.log('Code yang dikembalikan:', mvo ? mvo.code : 'Unknown');

      return mvo ? mvo.code : 'Unknown';
    },

    // Method edit document yang diperbaiki
    async editDocument(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      try {
        // Get document data
        const response = await axios.get(
          `https://babaapi.babaparfume.id/api/mvo-document/${id}`,
          { headers }
        );

        if (response.data.status === "success") {
          const documentData = response.data.data;

          console.log('Document data loaded:', documentData); // Debug log
          console.log('MVO ID from document:', documentData.mvo_id); // Debug log

          // Set data ke form edit dengan menyimpan nama file asli
          this.documentEditModel = {
            ...documentData,
            original_file_name: documentData.file_name,
            file: null
          };

          // Debug: cek apakah getMvoCodeById berhasil
          const mvoCode = this.getMvoCodeById(documentData.mvo_id);
          console.log('MVO Code result:', mvoCode); // Debug log

          this.isShowDialogEditDocument = true;
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error loading document", 'error');
      }
    },

    // Document CRUD Methods
    async getMvoDocuments(mvoId) {
      const headers = this.getAuthHeaders();
      if (!headers || !mvoId) {
        this.documentItems = [];
        return;
      }

      this.isLoadingDocuments = true;
      try {
        const response = await axios.get(`https://babaapi.babaparfume.id/api/mvo-document`, { headers });
        if (response.data.status === "success") {
          this.documentItems = response.data.data.filter(doc => doc.mvo_id == mvoId) || [];
        } else {
          this.documentItems = [];
        }
      } catch (error) {
        console.error("Error loading documents:", error);
        this.documentItems = [];
      } finally {
        this.isLoadingDocuments = false;
      }
    },

    showDialogAddDocument() {
      const mvoId = this.getDocumentMvoId();
      if (!mvoId) {
        this.showSnackbar("ID tidak ditemukan", 'error');
        return;
      }

      this.documentAddModel = {
        mvo_id: mvoId,
        file_name: "",
        pointbintang: "",
        file: null,
      };
      this.isShowDialogAddDocument = true;
    },

    handleDocumentFileChange(event) {
      if (event && event.length > 0) {
        this.documentAddModel.file = event[0];
        if (!this.documentAddModel.file_name) {
          this.documentAddModel.file_name = event[0].name;
        }
      }
    },

    async addDocument() {
      if (!this.documentAddModel.file_name || !this.documentAddModel.pointbintang || !this.documentAddModel.file) {
        this.showSnackbar("Nama File, Poin, dan File harus diisi", 'error');
        return;
      }

      // Validasi pointbintang
      const point = Number(this.documentAddModel.pointbintang);
      if (isNaN(point) || point < 0 || point > 5) {
        this.showSnackbar("Poin per bintang harus antara 0 sampai 5", 'error');
        return;
      }

      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isDocumentButtonLoading = true;

      try {
        const formData = new FormData();
        formData.append('mvo_id', this.documentAddModel.mvo_id);
        formData.append('file_name', this.documentAddModel.file_name);
        formData.append('pointbintang', Math.floor(point)); // Pastikan integer
        formData.append('file_path', this.documentAddModel.file);

        const response = await axios.post(
          "https://babaapi.babaparfume.id/api/mvo-document",
          formData,
          {
            headers: {
              ...headers,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        await this.getMvoDocuments(this.getDocumentMvoId());
        this.isShowDialogAddDocument = false;
        this.showSnackbar(response.data.message || "Dokumen berhasil ditambah");
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error adding document", 'error');
      } finally {
        this.isDocumentButtonLoading = false;
      }
    },
    async editDocument(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      try {
        // Get document data
        const response = await axios.get(
          `https://babaapi.babaparfume.id/api/mvo-document/${id}`,
          { headers }
        );

        if (response.data.status === "success") {
          const documentData = response.data.data;

          // Set data ke form edit dengan menyimpan nama file asli
          this.documentEditModel = {
            ...documentData,
            original_file_name: documentData.file_name, // Simpan nama file asli
            file: null // Reset file input
          };

          this.isShowDialogEditDocument = true;
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error loading document", 'error');
      }
    },
    handleEditDocumentFileChange(event) {
      if (event && event.length > 0) {
        this.documentEditModel.file = event[0];
        // Update nama file jika user memilih file baru
        if (!this.documentEditModel.file_name || this.documentEditModel.file_name === this.documentEditModel.original_file_name) {
          this.documentEditModel.file_name = event[0].name;
        }
      }
    },
    async updateDocument(id) {
      if (!this.documentEditModel.file_name || !this.documentEditModel.pointbintang) {
        this.showSnackbar("Nama File dan Poin harus diisi", "error");
        return;
      }

      // Validasi pointbintang
      const point = Number(this.documentEditModel.pointbintang);
      if (isNaN(point) || point < 0 || point > 5) {
        this.showSnackbar("Poin per bintang harus antara 0 sampai 5", 'error');
        return;
      }

      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isDocumentButtonLoading = true;

      try {
        const formData = new FormData();
        formData.append("mvo_id", this.documentEditModel.mvo_id);
        formData.append("file_name", this.documentEditModel.file_name);
        formData.append("pointbintang", Math.floor(point)); // Pastikan integer

        if (this.documentEditModel.file) {
          formData.append("file_path", this.documentEditModel.file);
        }

        const response = await axios.post(
          `https://babaapi.babaparfume.id/api/mvo-document/${id}`,
          formData,
          {
            headers: {
              ...headers,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.status === "success") {
          this.showSnackbar(response.data.message || "Dokumen berhasil diupdate");
          this.isShowDialogEditDocument = false;
          await this.getMvoDocuments(this.getDocumentMvoId());
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error updating document", "error");
      } finally {
        this.isDocumentButtonLoading = false;
      }
    },


    async deleteDocument(id) {
      if (!confirm('Apakah anda yakin ingin menghapus dokumen ini?')) {
        return;
      }

      const headers = this.getAuthHeaders();
      if (!headers) return;

      try {
        const response = await axios.delete(`https://babaapi.babaparfume.id/api/mvo-document/${id}`, { headers });

        if (response.data.status === "success") {
          this.showSnackbar(response.data.message || "Dokumen berhasil dihapus");
          // Refresh document list
          await this.getMvoDocuments(this.getDocumentMvoId());
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error deleting document", 'error');
      }
    },


    viewFile(filePath) {
      const fullUrl = this.getFullFileUrl(filePath);
      window.open(fullUrl, '_blank');
    },

    downloadFile(filePath, fileName) {
      const fullUrl = this.getFullFileUrl(filePath);
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    navigateBack() {
      if (this.detailNavigationHistory.length === 0) return;

      this.isNavigatingBack = true;
      const previousState = this.detailNavigationHistory.pop();
      this.restoreState(previousState);
      this.isNavigatingBack = false;
    },

    // Detail MVO methods
    async showDetailMvo(id) {
      // Close mobile expansion
      this.expandedMobileCard = null;

      if (this.isShowDialogDetail) {
        this.detailNavigationHistory.push(this.saveCurrentState());
      }

      this.originalDetailMvoId = id;
      this.originalDetailMvoData = this.allMvoData.find(item => item.id == id) || {};

      await this.getMvoDocuments(id);

      const childrenData = this.allMvoData.filter(item => item.parent_id == id);

      if (childrenData.length > 0) {
        this.relatedMvoData = childrenData;
        this.currentDetailIndex = 0;
        this.detailModel = childrenData[0];
        this.detailViewMode = 'children';
      } else {
        this.relatedMvoData = [];
        this.detailModel = {};
        this.detailViewMode = 'documents-only';
      }

      this.isShowDialogDetail = true;
    },

    async showParentDetail(parentId) {
      this.detailNavigationHistory.push(this.saveCurrentState());
      this.isShowDialogDetail = false;

      setTimeout(async () => {
        this.originalDetailMvoId = parentId;
        this.originalDetailMvoData = this.allMvoData.find(item => item.id == parentId) || {};

        await this.getMvoDocuments(parentId);

        const childrenData = this.allMvoData.filter(item => item.parent_id == parentId);

        if (childrenData.length > 0) {
          this.relatedMvoData = childrenData;
          this.currentDetailIndex = 0;
          this.detailModel = childrenData[0];
          this.detailViewMode = 'children';
        } else {
          this.relatedMvoData = [this.originalDetailMvoData];
          this.detailModel = this.originalDetailMvoData;
          this.detailViewMode = 'single';
        }

        this.isShowDialogDetail = true;
      }, 100);
    },

    closeDetailDialog() {
      this.isShowDialogDetail = false;
      this.currentDetailIndex = 0;
      this.relatedMvoData = [];
      this.detailViewMode = 'single';
      this.detailModel = {};
      this.documentItems = [];
      this.originalDetailMvoId = null;
      this.originalDetailMvoData = {};
      this.documentSearch = "";
      this.detailSearch = "";
      this.detailNavigationHistory = [];
    },

    // Modifikasi method showDialogFormAddMvo
    showDialogFormAddMvo() {
      this.isEditMode = false;
      this.currentModel = this.getEmptyModel();
      this.selectedUserId = null;
      this.isShowDialogForm = true;

      // Load reference data jika belum ada
      if (this.users.length === 0) {
        this.getUsers();
      }
      if (this.mvoTypes.length === 0) {
        this.getMvoTypes();
      }
      if (this.provinces.length === 0) {
        this.getProvinces();
      }
    },
    async editMvo(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.expandedMobileCard = null;
      this.isEditMode = true;

      try {
        if (this.mvoTypes.length === 0) await this.getMvoTypes();
        if (this.provinces.length === 0) await this.getProvinces();
        if (this.parentMvoOptions.length === 0) await this.getAllMvo();

        const response = await axios.get(`https://babaapi.babaparfume.id/api/mvo/${id}`, { headers });

        if (response.data.status === "success") {
          const data = response.data.data;

          // KONVERSI TIPE DATA KE NUMBER untuk memastikan matching dengan item-value
          this.currentModel = {
            ...data,
            mvo_type_id: data.mvo_type_id ? Number(data.mvo_type_id) : null,
            province_id: data.province_id ? Number(data.province_id) : null,
            parent_id: data.parent_id ? Number(data.parent_id) : null,
          };

          if (data.tgl_lahir) {
            this.currentModel.tgl_lahir = new Date(data.tgl_lahir).toISOString().split('T')[0];
          }

          await this.$nextTick();
          this.isShowDialogForm = true;
        } else {
          this.showSnackbar(response.data.message || "Error loading data", 'error');
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error loading data", 'error');
      }
    },

    // CRUD operations
    async addMvo() {
      // Validasi required fields
      if (!this.currentModel.nama || !this.currentModel.nama.trim()) {
        this.showSnackbar("Nama harus diisi", 'error');
        return;
      }

      if (!this.currentModel.no_id || !this.currentModel.no_id.trim()) {
        this.showSnackbar("Nomer ID harus diisi", 'error');
        return;
      }

      if (!this.currentModel.mvo_type_id) {
        this.showSnackbar("Tipe harus dipilih", 'error');
        return;
      }

      if (!this.currentModel.province_id) {
        this.showSnackbar("Provinsi harus dipilih", 'error');
        return;
      }

      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isButtonLoading = true;

      try {
        // Prepare data dengan format yang benar
        const dataToSend = {
          nama: this.currentModel.nama.trim(),
          no_id: this.currentModel.no_id.trim(),
          mvo_type_id: parseInt(this.currentModel.mvo_type_id),
          province_id: parseInt(this.currentModel.province_id),

          // Optional fields - kirim hanya jika ada nilai
          ...(this.currentModel.nama_panggilan && { nama_panggilan: this.currentModel.nama_panggilan.trim() }),
          ...(this.currentModel.tempat_lahir && { tempat_lahir: this.currentModel.tempat_lahir.trim() }),
          ...(this.currentModel.tgl_lahir && { tgl_lahir: this.currentModel.tgl_lahir }),
          ...(this.currentModel.class_member && { class_member: this.currentModel.class_member }),
          ...(this.currentModel.alamat && { alamat: this.currentModel.alamat.trim() }),
          ...(this.currentModel.nohp && { nohp: this.currentModel.nohp.trim() }),

          // Manual fields
          ...(this.currentModel.sosmed && { sosmed: this.currentModel.sosmed.trim() }),
          ...(this.currentModel.jaringan_mvo && { jaringan_mvo: this.currentModel.jaringan_mvo.trim() }),
          ...(this.currentModel.level && { level: this.currentModel.level }),
          ...(this.currentModel.parent_id && { parent_id: parseInt(this.currentModel.parent_id) }),
        };

        console.log('Data yang akan dikirim:', dataToSend); // Debug

        const response = await axios.post(
          "https://babaapi.babaparfume.id/api/mvo",
          dataToSend,
          { headers }
        );

        console.log('Response:', response.data); // Debug

        if (response.data.status === "success") {
          await this.getAllMvo();
          this.isShowDialogForm = false;
          this.selectedUserId = null;
          this.currentModel = this.getEmptyModel();
          this.showSnackbar(response.data.message || "Data berhasil ditambah");
        } else {
          this.showSnackbar(response.data.message || "Gagal menyimpan data", 'error');
        }
      } catch (error) {
        console.error("Error detail:", error);
        console.error("Error response:", error.response);

        let errorMessage = "Error saat menyimpan data";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.errors) {
          // Jika ada validation errors
          const errors = error.response.data.errors;
          errorMessage = Object.values(errors).flat().join(', ');
        }

        this.showSnackbar(errorMessage, 'error');
      } finally {
        this.isButtonLoading = false;
      }
    },
    async updateMvo() {
      if (!this.currentModel.nama || !this.currentModel.no_id) {
        this.showSnackbar("Nama dan Nomer ID harus diisi", 'error');
        return;
      }

      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isButtonLoading = true;

      try {
        const response = await axios.put(
          `https://babaapi.babaparfume.id/api/mvo/${this.currentModel.id}`,
          this.currentModel,
          { headers }
        );

        this.getAllMvo();
        this.isShowDialogForm = false;
        this.showSnackbar(response.data.message || "Data berhasil diupdate");
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error updating", 'error');
      } finally {
        this.isButtonLoading = false;
      }
    },
    deleteMvo(id) {
      this.isShowDialogDelete = true;
      this.modelDelete.id = id;
    },

    async confirmDeleteMvo(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isButtonLoading = true;

      try {
        const response = await axios.delete(
          `https://babaapi.babaparfume.id/api/mvo/${id}`,
          { headers }
        );

        this.getAllMvo();
        this.showSnackbar(response.data.message || "Data berhasil dihapus");
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error deleting", 'error');
      } finally {
        this.isButtonLoading = false;
        this.isShowDialogDelete = false;
      }
    },

    async printMvo(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      const printUrl = `https://babaapi.babaparfume.id/api/mvo/${id}/print`;

      try {
        const response = await axios.get(printUrl, {
          headers,
          responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const printWindow = window.open(url, '_blank');

        if (printWindow) {
          printWindow.onload = function () {
            printWindow.print();
          };
        }

        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);

        this.showSnackbar("File print berhasil dibuka");
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error saat print", 'error');
      }
    },
  },

  created() {
    this.otoritas = localStorage.getItem("otoritas") || "";
    this.getAllMvo();
    this.getMvoTypes();
    this.getProvinces();
    this.getUsers();
  },
  watch: {
    'currentModel.mvo_type_id'(newVal) {
      this.setLevelByMvoType(newVal);
    }
  }

  // watch: {
  //   'currentModel.mvo_type_id'(newVal) {
  //     if (newVal) {
  //       this.currentModel.level = newVal.toString();
  //     } else {
  //       this.currentModel.level = "";
  //     }
  //   }
  // }
};
</script>

<style scoped>
/* Mobile Detail Cards Styles */
.detail-mobile-card {
  border-left: 4px solid #FFD700;
  transition: transform 0.2s, box-shadow 0.2s;
}

.detail-mobile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.detail-card-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.2;
}

.detail-card-code {
  font-size: 12px;
  line-height: 1.2;
  margin-top: 2px;
}

.detail-card-section {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.detail-card-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
}

.detail-card-label {
  font-size: 11px;
  font-weight: 500;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.detail-card-value {
  font-size: 13px;
  font-weight: 500;
  color: #212529;
  margin-bottom: 8px;
  word-break: break-word;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .detail-card-section {
    padding: 8px;
  }

  .detail-card-name {
    font-size: 15px;
  }

  .detail-card-code {
    font-size: 11px;
  }
}

.mvo-management {
  padding: 16px;
}

.add-mvo-btn {
  background: linear-gradient(135deg, #000000, #1a1a1a);
  color: #FFD700;
  border: 2px solid #FFD700;
  border-radius: 12px;
  padding: 10px 18px;
  margin-bottom: 20px;
}

:deep(.custom-data-table) {
  border: 1px solid #000000;
}

:deep(.custom-data-table .v-data-table__th) {
  background-color: #888888 !important;
  color: #FFD700 !important;
  font-weight: bold;
}

.dialog-header {
  background: linear-gradient(135deg, #1a1a1a 30%, #b8941f 80%, #d4af37 100%) !important;
  color: #FFD700 !important;
  padding: 20px 24px !important;
  border-bottom: 2px solid #FFD700;
  font-weight: bold;
  font-size: 18px;
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

.detail-section {
  margin-bottom: 24px;
}

.detail-section-title {
  color: #1a1a1a;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

:deep(.custom-detail-table) {
  border: 1px solid #FFD700;
  margin-top: 16px;
}

:deep(.custom-detail-table .v-data-table__th) {
  background-color: #1a1a1a !important;
  color: #FFD700 !important;
  font-weight: bold;
  text-align: center;
}

:deep(.custom-detail-table .v-data-table__td) {
  background-color: #ffffff !important;
  color: #1a1a1a !important;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 16px !important;
}

:deep(.custom-detail-table .v-data-table__tr:hover) {
  background-color: #f8f9fa !important;
}

:deep(.v-text-field--density-compact .v-field__input) {
  padding-top: 8px;
  padding-bottom: 8px;
}

:deep(.v-text-field .v-field--variant-outlined .v-field__outline) {
  border-color: #FFD700;
}

:deep(.v-text-field .v-field--focused .v-field__outline) {
  border-color: #1a1a1a;
  border-width: 2px;
}
</style>