<template>
  <div class="mvo-management">
    <Breadcrumb :items="itemsBreadcrumb" />

    <!-- Remove Add button since add/edit functionality is removed -->
    <v-btn class="text-white ml-2 font-semibold add-mvo-btn" @click="exportExcel" v-if="mvo_type_id === 'superadmin'">
      <v-icon start style="color: #FFD700;">mdi-file-export</v-icon>
      <span class="ml-2">Excel</span>
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


            <template v-slot:item.action="{ item }" v-if="mvo_type_id === 'superadmin'">
              <div class="d-flex justify-center">
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
              <v-chip :color="getDocumentStatusColor(item.status_inputan, item.approval_doc_upline_1, item.upline_1)"
                size="small" variant="flat">
                {{ getDocumentStatusText(item.status_inputan, item.approval_doc_upline_1, item.upline_1) }}
              </v-chip>
            </template>

            <!-- <template v-slot:item.status_inputan_2="{ item }">
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
            </template> -->

            <template v-slot:item.mvo_type="{ item }">
              {{ getMvoTypeName(item.mvo_type_id) }}
            </template>

            <template v-slot:item.province="{ item }">
              {{ item.province_code || '-' }}
            </template>

            <template v-slot:item.tgl_lahir="{ item }">
              {{ formatDate(item.tgl_lahir) }}
            </template>

            <template v-slot:item.pointbintang="{ item }">
              {{ item.pointbintang || '-' }}
            </template>

            <template v-slot:item.tanggal_repeat_order="{ item }">
              {{ formatDate(item.tanggal_repeat_order) || '-' }}
            </template>

            <template v-slot:item.repeat_order="{ item }">
              <v-chip color="primary" size="small" variant="outlined">
                {{ item.repeat_order || '-' }}
              </v-chip>
            </template>

            <!-- Upline columns -->
            <template v-slot:item.upline_1="{ item }">
              {{ item.upline_1 && item.upline_1 !== '-' ? item.upline_1 : '-' }}
            </template>

            <template v-slot:item.upline_2="{ item }">
              {{ item.upline_2 && item.upline_2 !== '-' ? item.upline_2 : '-' }}
            </template>

            <template v-slot:item.upline_3="{ item }">
              {{ item.upline_3 && item.upline_3 !== '-' ? item.upline_3 : '-' }}
            </template>

            <template v-slot:item.upline_4="{ item }">
              {{ item.upline_4 && item.upline_4 !== '-' ? item.upline_4 : '-' }}
            </template>

            <template v-slot:item.upline_5="{ item }">
              {{ item.upline_5 && item.upline_5 !== '-' ? item.upline_5 : '-' }}
            </template>

            <template v-slot:item.upline_6="{ item }">
              {{ item.upline_6 && item.upline_6 !== '-' ? item.upline_6 : '-' }}
            </template>

            <template v-slot:item.upline_7="{ item }">
              {{ item.upline_7 && item.upline_7 !== '-' ? item.upline_7 : '-' }}
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
                <!-- <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Nomor ID:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.nomor_id || '-' }}</v-col>
                </v-row> -->
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">No ID:</v-col>
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
              </div>

              <!-- Contact Info Section -->
              <div class="mobile-info-section mb-3">
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">No HP:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.nohp || '-' }}</v-col>
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
                  <v-col cols="8" class="detail-value">{{ item.province_code || '-' }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Upline 1:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.upline_1 || '-' }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Upline 2:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.upline_2 || '-' }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Upline 3:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.upline_3 || '-' }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Upline 4:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.upline_4 || '-' }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Upline 5:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.upline_5 || '-' }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Upline 6:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.upline_6 || '-' }}</v-col>
                </v-row>
                <v-row class="mb-2">
                  <v-col cols="4" class="detail-label">Upline 7:</v-col>
                  <v-col cols="8" class="detail-value">{{ item.upline_7 || '-' }}</v-col>
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

                <v-row class="mb-2" v-if="mvo_type_id === 'superadmin'">
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
                  {{ mvo_type_id === 'mvo' ? 'Approve MVO' : 'Approve Admin' }}
                </v-btn>

                <!-- Admin Actions -->
                <template v-if="mvo_type_id === 'superadmin'">
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

    <!-- Remove Dialog Form MVO (Add/Edit) - REMOVED COMPLETELY -->

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

                <template v-slot:item.star_number="{ item }">
                  <v-chip color="amber" text-color="white" size="small">
                    <v-icon start size="small">mdi-star</v-icon>
                    {{ item.pointbintang || 0 }}
                  </v-chip>
                </template>

                <template v-slot:item.star_icon="{ item }">
                  <div class="d-flex justify-center">
                    <v-icon v-for="n in 8" :key="n" :color="n <= (item.pointbintang || 0) ? '#FFD700' : '#e0e0e0'"
                      size="small">
                      mdi-star
                    </v-icon>
                  </div>
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

                    <!-- Tombol Approve hanya muncul jika canApproveDocument true -->
                    <v-tooltip v-if="canApproveDocument(item)" :text="getDocumentApproveTooltip(item)" color="#2E7D32"
                      location="top start">
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

            <!-- Detail Section for Children (Bawahan) -->
            <div class="detail-section mb-6" v-if="detailViewMode === 'children'">
              <h3 class="detail-section-title">
                <v-icon class="mr-2" color="#FFD700">mdi-account-supervisor</v-icon>
                Detail Bawahan
                <v-chip color="info" size="small" class="ml-3">
                  {{ relatedMvoData.length }} Data
                </v-chip>
              </h3>

              <v-text-field v-model="detailSearch" prepend-inner-icon="mdi-magnify" label="Cari Data Bawahan..."
                single-line hide-details variant="outlined" class="mb-3" density="compact" />

              <v-data-table class="bg-grey-lighten-4 text-no-wrap custom-detail-table" :headers="detailHeaders"
                :items="getCurrentDetailData()" :search="detailSearch" hide-default-footer items-per-page="-1">

                <template v-slot:item.mvo_type="{ item }">
                  {{ getMvoTypeName(item.mvo_type_id) }}
                </template>

                <template v-slot:item.province="{ item }">
                  {{ item.province_code || '-' }}
                </template>

                <template v-slot:item.tgl_lahir="{ item }">
                  {{ formatDate(item.tgl_lahir) }}
                </template>

                <template v-slot:item.upline_1="{ item }">
                  {{ item.upline_1 || '-' }}
                </template>

                <template v-slot:item.action="{ item }">
                  <div class="d-flex justify-center">
                    <v-tooltip text="Detail Bawahan" color="#125C13" location="top start"
                      v-if="item.bawahan && item.bawahan.length > 0">
                      <template v-slot:activator="{ props }">
                        <v-btn size="small" color="warning" @click="showChildDetail(item.id)"
                          :loading="isLoadingParentDetail" class="mx-1" v-bind="props" icon>
                          <v-icon>mdi-account-arrow-down</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </div>
                </template>
              </v-data-table>
            </div>
          </div>

          <!-- Dialog Edit Document -->
          <v-dialog v-model="isShowDialogEditDocument" max-width="600px">
            <v-card class="custom-dialog">
              <v-card-title class="dialog-header">
                <v-icon class="mr-2" style="color: #FFD700;">mdi-pencil</v-icon>
                <span class="dialog-title">EDIT DOKUMEN</span>
              </v-card-title>

              <v-card-text class="dialog-content">
                <v-row>
                  <v-col cols="12">
                    <v-text-field label="Nama File" v-model="documentEditModel.file_name" class="mb-2 mt-4"
                      :rules="[requiredRule]" />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12">
                    <v-select label="Rating Star" v-model="documentEditModel.pointbintang"
                      :items="[1, 2, 3, 4, 5, 6, 7, 8]" class="mb-2" :rules="[requiredRule, pointbintangRule]" required>
                      <template v-slot:selection="{ item }">
                        <div class="d-flex align-center">
                          <v-icon color="#FFD700" class="mr-1" small>mdi-star</v-icon>
                          <span>{{ item.value }} Bintang</span>
                        </div>
                      </template>
                      <template v-slot:item="{ item, props }">
                        <v-list-item v-bind="props" :title="`${item.value} Bintang`">
                          <template v-slot:prepend>
                            <div class="d-flex align-center">
                              <v-icon v-for="n in item.value" :key="n" color="#FFD700" small class="mr-1">
                                mdi-star
                              </v-icon>
                            </div>
                          </template>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field label="Tanggal Input Dokumen" type="date"
                      v-model="documentEditModel.tanggal_repeat_order" class="mb-2" :rules="[requiredRule]"
                      variant="outlined" density="comfortable" prepend-inner-icon="mdi-calendar" />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field label="Range Point" v-model.number="documentEditModel.repeat_order" type="number"
                      min="0" step="0.01" class="mb-2" hint="Masukkan range point" persistent-hint
                      :rules="[requiredRule]" variant="outlined" density="comfortable"
                      prepend-inner-icon="mdi-chart-line" />
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
                Bawahan ({{ relatedMvoData.length }})
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
                    <v-row class="mb-3" no-gutters>
                      <v-col cols="5">
                        <div class="text-caption text-grey">Status:</div>
                      </v-col>
                      <v-col cols="7">
                        <v-chip
                          :color="getDocumentStatusColor(document.status_inputan, document.approval_doc_upline_1, document.upline_1)"
                          size="x-small" variant="flat">
                          {{ getDocumentStatusText(document.status_inputan, document.approval_doc_upline_1,
                            document.upline_1) }}
                        </v-chip>
                      </v-col>
                    </v-row>

                    <v-row class="mb-3" no-gutters>
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

                      <!-- Tombol Approve hanya muncul jika canApproveDocument true -->
                      <v-btn v-if="canApproveDocument(document)" size="small"
                        :color="getDocumentApproveButtonColor(document)" variant="text"
                        @click="approveDocument(document.id)">
                        <v-icon start size="16">{{ getDocumentApproveButtonIcon(document) }}</v-icon>
                        Approve Admin
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
                <v-text-field v-model="detailSearch" prepend-inner-icon="mdi-magnify" label="Cari Data Bawahan..."
                  single-line hide-details variant="outlined" class="mb-3" density="compact" />

                <!-- No Children -->
                <div v-if="getCurrentDetailData().length === 0" class="text-center pa-4">
                  <v-icon size="64" color="grey">mdi-account-off</v-icon>
                  <p class="text-grey mt-2">Tidak ada data Bawahan</p>
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
                          <!-- <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">Nomor ID:</v-col>
                            <v-col cols="8" class="text-body-2">{{ child.nomor_id || '-' }}</v-col>
                          </v-row> -->
                          <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">No ID:</v-col>
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
                        </div>

                        <!-- Contact Info -->
                        <div class="mobile-info-section mb-3">
                          <h4 class="text-subtitle-2 mb-2 text-primary">Kontak</h4>
                          <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">No HP:</v-col>
                            <v-col cols="8" class="text-body-2">{{ child.nohp || '-' }}</v-col>
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
                            <v-col cols="8" class="text-body-2">{{ child.province_code || '-' }}</v-col>
                          </v-row>
                          <v-row class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">Upline 1:</v-col>
                            <v-col cols="8" class="text-body-2">{{ child.upline_1 || '-' }}</v-col>
                          </v-row>
                        </div>

                        <!-- Actions -->
                        <v-divider class="mb-3"></v-divider>
                        <div class="d-flex justify-center">
                          <v-btn v-if="child.bawahan && child.bawahan.length > 0" size="small" color="warning"
                            @click.stop="showChildDetail(child.id)" :loading="isLoadingParentDetail" class="text-white">
                            <v-icon start size="16">mdi-account-arrow-down</v-icon>
                            Bawahan
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
          Apakah yakin ingin menghapus data ini?
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
              <v-select label="Rating Star" v-model="documentAddModel.pointbintang" :items="[1, 2, 3, 4, 5, 6, 7, 8]"
                class="mb-2" :rules="[requiredRule, pointbintangRule]" required>
                <template v-slot:selection="{ item }">
                  <div class="d-flex align-center">
                    <v-icon color="#FFD700" class="mr-1" small>mdi-star</v-icon>
                    <span>{{ item.value }} Bintang</span>
                  </div>
                </template>
                <template v-slot:item="{ item, props }">
                  <v-list-item v-bind="props" :title="`${item.value} Bintang`">
                    <template v-slot:prepend>
                      <div class="d-flex align-center">
                        <v-icon v-for="n in item.value" :key="n" color="#FFD700" small class="mr-1">
                          mdi-star
                        </v-icon>
                      </div>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field label="Tanggal Input Dokumen" type="date" v-model="documentAddModel.tanggal_repeat_order"
                class="mb-2" :rules="[requiredRule]" variant="outlined" density="comfortable"
                prepend-inner-icon="mdi-calendar" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field label="Range Point" v-model.number="documentAddModel.repeat_order" type="number" min="0"
                step="0.01" class="mb-2" hint="Masukkan range point" persistent-hint :rules="[requiredRule]"
                variant="outlined" density="comfortable" prepend-inner-icon="mdi-chart-line" />
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
import * as XLSX from "xlsx";

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
      expandedMobileCard: null,
      detailNavigationHistory: [],
      isNavigatingBack: false,
      allMvoData: [],
      contentSnackbar: {
        snackbar: false,
        text: "",
        color: "",
      },
      mvo_type_id: "",
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
      isShowDialogDetail: false,
      isButtonLoading: false,
      isTableLoading: true,
      isLoadingParentDetail: false,
      isShowDialogDelete: false,

      // Document-related states
      isShowDialogAddDocument: false,
      isDocumentButtonLoading: false,
      isLoadingDocuments: false,

      // Detail navigation
      currentDetailIndex: 0,
      relatedMvoData: [],
      detailViewMode: 'single',

      documentSearch: "",
      detailSearch: "",

      // Pagination
      currentPage: 1,
      itemsPerPage: 10,

      // Data models
      datatable: {
        search: "",
        headers: [
          { key: "no", title: "No", sortable: false },
          { key: "code", title: "Kode", fixed: 'start', width: '80px' },
          // { key: "nomor_id", title: "Nomor ID" },
          { key: "no_id", title: "No ID" },
          { key: "nama", title: "Nama", fixed: 'start', width: '80px' },
          { key: "nama_panggilan", title: "Nama Panggilan" },
          { key: "tempat_lahir", title: "Tempat Lahir" },
          { key: "tgl_lahir", title: "Tanggal Lahir" },
          { key: "alamat", title: "Alamat" },
          { key: "nohp", title: "No HP" },
          { key: "jaringan_mvo", title: "Jaringan" },
          { key: "mvo_type", title: "Tipe" },
          { key: "province", title: "Provinsi" },
          { key: "upline_7", title: "Seller" },
          { key: "upline_6", title: "Distributor" },
          { key: "upline_5", title: "Supplier" },
          { key: "upline_4", title: "General Manager" },
          { key: "upline_3", title: "Founder" },
          { key: "upline_2", title: "Regional" },
          { key: "upline_1", title: "MVO" },
          // { key: "status_inputan_2", title: "Status Admin", sortable: false, align: "center" },
          // { key: "approve", title: "Approve", sortable: false, align: "center" },
          { key: "detail", title: "Detail", sortable: false, align: "center" },
          { key: "print", title: "Print", sortable: false, align: "center" },
          { key: "action", title: "Actions", sortable: false, align: "center" },

        ],
        items: [],
      },

      detailHeaders: [
        // { key: "code", title: "Kode" },
        // { key: "nomor_id", title: "Nomor ID" },
        { key: "no_id", title: "No ID" },
        { key: "nama", title: "Nama" },
        { key: "nama_panggilan", title: "Nama Panggilan" },
        { key: "tempat_lahir", title: "Tempat Lahir" },
        { key: "tgl_lahir", title: "Tanggal Lahir" },
        { key: "alamat", title: "Alamat" },
        { key: "nohp", title: "No HP" },
        { key: "jaringan_mvo", title: "Jaringan" },
        { key: "mvo_type", title: "Tipe" },
        { key: "province", title: "Provinsi" },
        { key: "upline_7", title: "Seller" },
        { key: "upline_6", title: "Distributor" },
        { key: "upline_5", title: "Supplier" },
        { key: "upline_4", title: "General Manager" },
        { key: "upline_3", title: "Founder" },
        { key: "upline_2", title: "Regional" },
        { key: "upline_1", title: "MVO" },
        // { key: "action", title: "Detail", sortable: false, align: "center" },
      ],

      // Document headers and data
      documentHeaders: [
        { key: "mvo_code", title: "Kode" },
        { key: "file_name", title: "Nama File" },
        { key: "star_number", title: "Bintang", align: "center" },
        { key: "star_icon", title: "Rating Star", sortable: false, align: "center" },
        { key: "tanggal_repeat_order", title: "Tanggal Input", align: "center" },
        { key: "repeat_order", title: "Range Point", align: "center" },
        { key: "status_inputan", title: "Status", align: "center" },
        // { key: "status_inputan_2", title: "Status Admin", align: "center" },
        { key: "file_path", title: "File Preview", sortable: false, width: "200px" },
        { key: "action", title: "Actions", sortable: false, align: "center" },
      ],
      documentItems: [],

      originalDetailMvoId: null,
      originalDetailMvoData: {},

      // Reference data
      mvoTypes: [],

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
        tanggal_repeat_order: "",
        repeat_order: "",
        file: null,
      },
      documentEditModel: {
        id: "",
        file_name: "",
        pointbintang: "",
        tanggal_repeat_order: "",
        repeat_order: "",
        file: null,
      },
    };
  },

  computed: {
    rangePointRule() {
      return value => {
        if (value === null || value === undefined || value === '') {
          return 'Range Point harus diisi';
        }
        const num = Number(value);
        if (isNaN(num)) {
          return 'Harus berupa angka';
        }
        if (num < 0) {
          return 'Range Point tidak boleh kurang dari 0';
        }
        // Hapus validasi maksimal 200
        return true;
      };
    },

    displayHeaders() {
      if (this.mvo_type_id === 'superadmin') {
        return this.datatable.headers;
      } else if (this.mvo_type_id === 'mvo') {
        return this.datatable.headers.filter(header =>
          header.key !== 'status_inputan_2'
        );
      } else {
        return this.datatable.headers.filter(header =>
          header.key !== 'approve' && header.key !== 'status_inputan_2'
        );
      }
    },

    requiredRule() {
      return value => !!value || 'Field ini wajib diisi';
    },

    pointbintangRule() {
      return value => {
        if (value === null || value === undefined || value === '') {
          return 'Rising Star harus diisi';
        }
        const num = Number(value);
        if (isNaN(num)) {
          return 'Harus berupa angka';
        }
        if (num < 0) {
          return 'Poin tidak boleh kurang dari 0';
        }
        if (num > 8) {
          return 'Poin maksimal adalah 8';
        }
        return true;
      };
    },

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
          // (item.nomor_id && item.nomor_id.toLowerCase().includes(searchTerm)) ||
          (item.no_id && item.no_id.toLowerCase().includes(searchTerm)) ||
          (item.nohp && item.nohp.toLowerCase().includes(searchTerm)) ||
          (item.tempat_lahir && item.tempat_lahir.toLowerCase().includes(searchTerm)) ||
          (item.jaringan_mvo && item.jaringan_mvo.toLowerCase().includes(searchTerm)) ||
          (this.getMvoTypeName(item.mvo_type_id) && this.getMvoTypeName(item.mvo_type_id).toLowerCase().includes(searchTerm))
        );
      });
    }
  },

  methods: {
    validateRangePoint(mode) {
      const model = mode === 'add' ? this.documentAddModel : this.documentEditModel;
      let value = Number(model.repeat_order);

      if (isNaN(value) || model.repeat_order === '') {
        model.repeat_order = '';
        return;
      }

      if (value < 0) {
        model.repeat_order = 0;
        this.showSnackbar('Range Point tidak boleh kurang dari 0', 'warning');
        return;
      }

      // Hapus validasi maksimal 200
      model.repeat_order = value;
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
      this.mobileDetailTab = 'documents';
      this.expandedMobileChild = null;
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
          `https://babaapi.teknosof.com/api/mvo/${id}`,
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

    getDocumentStatusColor(status, approvalDocUpline1 = null, upline1 = null) {
      // Kondisi 1: Dokumen dari bawahan (upline_1 ada)
      if (upline1 !== null) {
        // Jika status_inputan null dan approval_doc_upline_1 juga null = menunggu MVO
        if ((!status || status === null) && (!approvalDocUpline1 || approvalDocUpline1 === null)) {
          return 'warning'; // Kuning - Menunggu Approval MVO
        }

        // Jika status_inputan null tapi approval_doc_upline_1 sudah terisi = menunggu admin
        if ((!status || status === null) && approvalDocUpline1 !== null) {
          return 'info'; // Biru - Menunggu Approval Admin
        }
      }

      // Kondisi 2: Dokumen dari MVO sendiri (upline_1 null)
      if (upline1 === null) {
        // Jika status_inputan null = langsung menunggu admin (tidak perlu approval MVO)
        if (!status || status === null) {
          return 'info'; // Biru - Menunggu Approval Admin
        }
      }

      // Jika sudah approved
      if (status && status.toLowerCase() === 'approved') {
        return 'success'; // Hijau - Sudah Disetujui
      }

      switch (status?.toLowerCase()) {
        case 'pending': return 'warning';
        case 'rejected': return 'error';
        default: return 'grey';
      }
    },

    getDocumentStatusText(status, approvalDocUpline1 = null, upline1 = null) {
      // Kondisi 1: Dokumen dari bawahan (upline_1 ada)
      if (upline1 !== null) {
        // Jika status_inputan null dan approval_doc_upline_1 juga null = menunggu MVO
        if ((!status || status === null) && (!approvalDocUpline1 || approvalDocUpline1 === null)) {
          return 'Menunggu Approval MVO';
        }

        // Jika status_inputan null tapi approval_doc_upline_1 sudah terisi = menunggu admin
        if ((!status || status === null) && approvalDocUpline1 !== null) {
          return 'Menunggu Approval Admin';
        }
      }

      // Kondisi 2: Dokumen dari MVO sendiri (upline_1 null)
      if (upline1 === null) {
        // Jika status_inputan null = langsung menunggu admin
        if (!status || status === null) {
          return 'Menunggu Approval Admin';
        }
      }

      // Jika sudah approved
      if (status && status.toLowerCase() === 'approved') {
        return 'Disetujui';
      }

      switch (status?.toLowerCase()) {
        case 'pending': return 'Menunggu';
        case 'rejected': return 'Ditolak';
        default: return 'Tidak Diketahui';
      }
    },

    async approveDocument(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      // Cari document dari documentItems untuk validasi
      const document = this.documentItems.find(doc => doc.id === id);

      if (!document) {
        this.showSnackbar("Dokumen tidak ditemukan", 'error');
        return;
      }

      // Hanya superadmin yang bisa approve
      if (this.mvo_type_id !== 'superadmin') {
        this.showSnackbar("Anda tidak memiliki akses untuk approve", 'error');
        return;
      }

      // Cek apakah sudah approved
      if (document.status_inputan === 'approved') {
        this.showSnackbar("Dokumen sudah disetujui", 'warning');
        return;
      }

      // Validasi berdasarkan kondisi:
      // Kondisi 1: Dokumen dari bawahan - harus menunggu MVO approve dulu
      if (document.upline_1 !== null && (!document.approval_doc_upline_1 || document.approval_doc_upline_1 === null)) {
        this.showSnackbar("Menunggu approval dari MVO terlebih dahulu", 'warning');
        return;
      }

      // Kondisi 2: Dokumen dari MVO sendiri - langsung bisa approve
      // (tidak perlu validasi tambahan, sudah di-handle di canApproveDocument)

      const endpoint = `https://babaapi.teknosof.com/api/superadmin/${id}/approvedoc`;
      const successMessage = "Dokumen berhasil disetujui oleh Superadmin";

      this.isDocumentButtonLoading = true;

      try {
        const response = await axios.put(endpoint, {}, { headers });

        if (response.data.status === "success") {
          this.showSnackbar(response.data.message || successMessage);
          // Refresh document list untuk update status
          await this.getMvoDocuments(this.getDocumentMvoId());
        } else {
          this.showSnackbar(response.data.message || "Gagal menyetujui dokumen", 'error');
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error approving document", 'error');
      } finally {
        this.isDocumentButtonLoading = false;
      }
    },

    canApproveDocument(document) {
      // Hanya superadmin yang bisa approve dokumen
      if (this.mvo_type_id === 'superadmin') {
        // Kondisi 1: Dokumen dari bawahan (upline_1 ada)
        // - approval_doc_upline_1 sudah terisi (MVO sudah approve)
        // - status_inputan masih null (belum di-approve admin)
        const condition1 = (document.status_inputan === null || document.status_inputan !== 'approved')
          && document.approval_doc_upline_1 !== null;

        // Kondisi 2: Dokumen ditambahkan oleh MVO sendiri (upline_1 null)
        // - upline_1 = null
        // - approval_doc_upline_1 = null
        // - status_inputan = null
        const condition2 = document.upline_1 === null
          && document.approval_doc_upline_1 === null
          && (document.status_inputan === null || document.status_inputan !== 'approved');

        return condition1 || condition2;
      }

      // Role lain tidak bisa approve
      return false;
    },

    getDocumentApproveButtonColor(document) {
      if (this.mvo_type_id === 'mvo') {
        // Jika sudah approved, tampilkan hijau (success), jika belum kuning (warning)
        return document.status_inputan === 'approved' ? 'success' : 'warning';
      } else if (this.mvo_type_id === 'superadmin') {
        // Jika sudah approved admin, tampilkan hijau, jika belum hijau juga (siap di-approve)
        return document.status_inputan_2 === 'approved' ? 'success' : 'success';
      }
      return 'grey';
    },

    getDocumentApproveButtonIcon(document) {
      if (this.mvo_type_id === 'mvo') {
        // Jika sudah approved: check-circle, jika belum: check
        return document.status_inputan === 'approved' ? 'mdi-check-circle' : 'mdi-check';
      } else if (this.mvo_type_id === 'superadmin') {
        // Jika sudah approved admin: check-all (double check), jika belum: check-circle-outline
        return document.status_inputan_2 === 'approved' ? 'mdi-check-all' : 'mdi-check-circle-outline';
      }
      return 'mdi-check';
    },

    getDocumentApproveTooltip(document) {
      if (this.mvo_type_id === 'superadmin') {
        // Jika sudah approved
        if (document.status_inputan === 'approved') {
          return 'Sudah Disetujui Admin';
        }

        // Kondisi 1: Dokumen dari bawahan (upline_1 ada)
        if (document.upline_1 !== null) {
          // Jika approval_doc_upline_1 belum terisi
          if (!document.approval_doc_upline_1 || document.approval_doc_upline_1 === null) {
            return 'Menunggu Approval MVO';
          }

          // Jika approval_doc_upline_1 sudah terisi
          return 'Setujui sebagai Admin';
        }

        // Kondisi 2: Dokumen dari MVO sendiri (upline_1 null)
        if (document.upline_1 === null) {
          return 'Setujui sebagai Admin (Dokumen MVO)';
        }
      }
      return 'Tidak Ada Akses';
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

    async approveMvo(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.expandedMobileCard = null;

      let endpoint = '';
      let successMessage = '';

      if (this.mvo_type_id === 'mvo') {
        endpoint = `https://babaapi.teknosof.com/api/mvo/${id}/approve`;
        successMessage = "Data berhasil disetujui oleh MVO";
      } else if (this.mvo_type_id === 'superadmin') {
        endpoint = `https://babaapi.teknosof.com/api/superadmin/${id}/approve`;
        successMessage = "Data berhasil disetujui oleh Superadmin";
      } else {
        this.showSnackbar("Anda tidak memiliki akses untuk approve", 'error');
        return;
      }

      try {
        this.isButtonLoading = true;
        const response = await axios.put(endpoint, {}, { headers });

        if (response.data.status === "success") {
          this.showSnackbar(response.data.message || successMessage);
          await this.getAllMvo();
        } else {
          this.showSnackbar(response.data.message || "Gagal menyetujui Data", 'error');
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error approving Data", 'error');
      } finally {
        this.isButtonLoading = false;
      }
    },

    canApprove(item) {
      if (this.mvo_type_id === 'mvo') {
        return item.status_inputan !== 'approved';
      } else if (this.mvo_type_id === 'superadmin') {
        return item.status_inputan === 'approved' && item.status_inputan_2 !== 'approved';
      }
      return false;
    },

    getApproveButtonColor(item) {
      if (this.mvo_type_id === 'mvo') {
        return item.status_inputan === 'approved' ? 'success' : 'warning';
      } else if (this.mvo_type_id === 'superadmin') {
        return item.status_inputan_2 === 'approved' ? 'success' : 'success';
      }
      return 'grey';
    },

    getApproveButtonIcon(item) {
      if (this.mvo_type_id === 'mvo') {
        return item.status_inputan === 'approved' ? 'mdi-check-circle' : 'mdi-check';
      } else if (this.mvo_type_id === 'superadmin') {
        return item.status_inputan_2 === 'approved' ? 'mdi-check-all' : 'mdi-check-circle-outline';
      }
      return 'mdi-check';
    },

    getApproveTooltip(item) {
      if (this.mvo_type_id === 'mvo') {
        return item.status_inputan === 'approved' ? 'Sudah Disetujui MVO' : 'Setujui sebagai MVO';
      } else if (this.mvo_type_id === 'superadmin') {
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

    getUserCabang() {
      try {
        const headerData = JSON.parse(localStorage.getItem('headerData'))
        return headerData?.cabang || null
      } catch (e) {
        return null
      }
    },

    async getAllMvo() {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isTableLoading = true;
      try {
        const response = await axios.get("https://babaapi.teknosof.com/api/mvo", { headers });

        if (response.data.status === "success") {
          const allItems = response.data.data;
          this.allMvoData = allItems;

          const mvo_type_id = localStorage.getItem("mvo_type_id");
          let items = response.data.data;
          const userCabang = this.getUserCabang();

          this.datatable.items = items.filter(item => {
            if (mvo_type_id === "superadmin") {
              return true;
            }

            if (userCabang) {
              return item.province_code && item.province_code.toUpperCase().trim() === userCabang.toUpperCase().trim();
            }

            return true;
          });
        } else {
          this.showSnackbar(response.data.message || "Error loading data", "error");
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error loading data", "error");
      } finally {
        this.isTableLoading = false;
      }
    },

    exportExcel() {
      const worksheet = XLSX.utils.json_to_sheet(this.datatable.items);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data MVO dan Anggota");
      XLSX.writeFile(workbook, `Data_MVO_dan_Anggota.xlsx`);
    },

    async getMvoTypes() {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      try {
        const response = await axios.get("https://babaapi.teknosof.com/api/mvo-type", { headers });
        if (response.data.status === "success") {
          this.mvoTypes = response.data.data;
        }
      } catch (error) {
        console.error("Error loading MVO types:", error);
      }
    },

    getMvoTypeName(mvoTypeId) {
      const mvoType = this.mvoTypes.find(type => type.id == mvoTypeId);
      return mvoType ? mvoType.name : '-';
    },

    getCurrentDetailData() {
      if (this.detailViewMode === 'children' && this.relatedMvoData.length > 0) {
        return this.relatedMvoData;
      }
      return [];
    },

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
      return `https://babaapi.teknosof.com/project/public/${filePath}`;
    },

    getMvoCodeById(mvoId) {
      const mvo = this.allMvoData.find(item => item.id == mvoId);
      return mvo ? mvo.code : 'Unknown';
    },

    async editDocument(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      try {
        const response = await axios.get(
          `https://babaapi.teknosof.com/api/mvo-document/${id}`,
          { headers }
        );

        if (response.data.status === "success") {
          const documentData = response.data.data;

          this.documentEditModel = {
            ...documentData,
            original_file_name: documentData.file_name,
            file: null
          };

          this.isShowDialogEditDocument = true;
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error loading document", 'error');
      }
    },

    async getMvoDocuments(mvoId) {
      const headers = this.getAuthHeaders();
      if (!headers || !mvoId) {
        this.documentItems = [];
        return;
      }

      this.isLoadingDocuments = true;
      try {
        const response = await axios.get(`https://babaapi.teknosof.com/api/mvo-document`, { headers });
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

      const today = new Date().toISOString().split('T')[0];

      this.documentAddModel = {
        mvo_id: mvoId,
        file_name: "",
        pointbintang: "",
        tanggal_repeat_order: today,
        repeat_order: "",
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
      if (!this.documentAddModel.file_name ||
        !this.documentAddModel.pointbintang ||
        !this.documentAddModel.tanggal_repeat_order ||
        !this.documentAddModel.repeat_order ||
        !this.documentAddModel.file) {
        this.showSnackbar("Semua field harus diisi", 'error');
        return;
      }

      const point = Number(this.documentAddModel.pointbintang);
      if (isNaN(point) || point < 0 || point > 8) {
        this.showSnackbar("Poin per bintang harus antara 0 sampai 8", 'error');
        return;
      }

      const rangePoint = Number(this.documentAddModel.repeat_order);
      if (isNaN(rangePoint) || rangePoint < 0) { // Hapus || rangePoint > 200
        this.showSnackbar("Range Point tidak boleh kurang dari 0", 'error');
        return;
      }

      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isDocumentButtonLoading = true;

      try {
        const formData = new FormData();
        formData.append('mvo_id', this.documentAddModel.mvo_id);
        formData.append('file_name', this.documentAddModel.file_name);
        formData.append('pointbintang', Math.floor(point));
        formData.append('tanggal_repeat_order', this.documentAddModel.tanggal_repeat_order);
        formData.append('repeat_order', rangePoint);
        formData.append('file_path', this.documentAddModel.file);

        const response = await axios.post(
          "https://babaapi.teknosof.com/api/mvo-document",
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

    handleEditDocumentFileChange(event) {
      if (event && event.length > 0) {
        this.documentEditModel.file = event[0];
        if (!this.documentEditModel.file_name || this.documentEditModel.file_name === this.documentEditModel.original_file_name) {
          this.documentEditModel.file_name = event[0].name;
        }
      }
    },

    async updateDocument(id) {
      if (!this.documentEditModel.file_name ||
        !this.documentEditModel.pointbintang ||
        !this.documentEditModel.tanggal_repeat_order ||
        !this.documentEditModel.repeat_order) {
        this.showSnackbar("Semua field harus diisi", "error");
        return;
      }

      const point = Number(this.documentEditModel.pointbintang);
      if (isNaN(point) || point < 0 || point > 8) {
        this.showSnackbar("Poin per bintang harus antara 0 sampai 8", 'error');
        return;
      }

      const rangePoint = Number(this.documentEditModel.repeat_order);
      if (isNaN(rangePoint) || rangePoint < 0) { // Hapus || rangePoint > 200
        this.showSnackbar("Range Point tidak boleh kurang dari 0", 'error');
        return;
      }

      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isDocumentButtonLoading = true;

      try {
        const formData = new FormData();
        formData.append("mvo_id", this.documentEditModel.mvo_id);
        formData.append("file_name", this.documentEditModel.file_name);
        formData.append("pointbintang", Math.floor(point));
        formData.append("tanggal_repeat_order", this.documentEditModel.tanggal_repeat_order);
        formData.append("repeat_order", rangePoint);

        if (this.documentEditModel.file) {
          formData.append("file_path", this.documentEditModel.file);
        }

        const response = await axios.post(
          `https://babaapi.teknosof.com/api/mvo-document/${id}`,
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
        const response = await axios.delete(`https://babaapi.teknosof.com/api/mvo-document/${id}`, { headers });

        if (response.data.status === "success") {
          this.showSnackbar(response.data.message || "Dokumen berhasil dihapus");
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

    async showDetailMvo(id) {
      this.expandedMobileCard = null;

      if (this.isShowDialogDetail) {
        this.detailNavigationHistory.push(this.saveCurrentState());
      }

      this.originalDetailMvoId = id;
      this.originalDetailMvoData = this.allMvoData.find(item => item.id == id) || {};

      await this.getMvoDocuments(id);

      // Use bawahan from the data structure
      const currentMvo = this.allMvoData.find(item => item.id == id);
      const childrenData = currentMvo?.bawahan || [];

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

    async showChildDetail(childId) {
      this.detailNavigationHistory.push(this.saveCurrentState());
      this.isShowDialogDetail = false;

      setTimeout(async () => {
        this.originalDetailMvoId = childId;
        this.originalDetailMvoData = this.allMvoData.find(item => item.id == childId) || {};

        await this.getMvoDocuments(childId);

        const currentMvo = this.allMvoData.find(item => item.id == childId);
        const childrenData = currentMvo?.bawahan || [];

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

    async printMvo(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      const printUrl = `https://babaapi.teknosof.com/api/mvo/${id}/print`;

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
    this.mvo_type_id = localStorage.getItem("mvo_type_id") || "";
    this.getAllMvo();
    this.getMvoTypes();
  },
};
</script>

<style scoped>
/* Star display styling */
.star-display {
  display: flex;
  gap: 2px;
}

.gap-2 {
  gap: 8px;
}

/* Desktop star column */
:deep(.v-data-table) .v-icon.mdi-star {
  font-size: 16px;
  margin: 0 1px;
}

/* Mobile star styling */
.mobile-card-details .star-display .v-icon {
  font-size: 14px;
}

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