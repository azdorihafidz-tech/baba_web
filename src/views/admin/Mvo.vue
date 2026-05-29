<template>
  <div class="mvo-management">
    <Breadcrumb :items="itemsBreadcrumb" />

    <div class="d-flex flex-wrap align-center top-action-bar" v-if="mvo_type_id === 'superadmin'">
      <v-btn class="text-white font-semibold add-mvo-btn" @click="exportExcel">
        <v-icon start style="color: #FFD700;">mdi-file-export</v-icon>
        <span class="ml-2">Excel</span>
      </v-btn>

      <!-- Import Dokumen via Excel (khusus Superadmin) -->
      <v-btn class="text-white font-semibold add-mvo-btn" @click="triggerImportExcel" :loading="isImporting">
        <v-icon start style="color: #FFD700;">mdi-file-import</v-icon>
        <span class="ml-2">Import Dokumen</span>
      </v-btn>

      <v-btn class="text-white font-semibold add-mvo-btn" @click="downloadImportTemplate">
        <v-icon start style="color: #FFD700;">mdi-file-download</v-icon>
        <span class="ml-2">Template</span>
      </v-btn>
    </div>

    <!-- Input file tersembunyi untuk import Excel -->
    <input ref="excelInput" type="file" accept=".xlsx,.xls" style="display: none" @change="handleImportExcel" />

    <!-- Desktop View - Data Table -->
    <div class="d-none d-md-block">
      <CardDataTable :title="title">
        <template v-slot:search>
          <v-text-field v-model="searchInput" prepend-inner-icon="mdi-magnify" label="Search" single-line hide-details
            variant="outlined" class="search-field" clearable />
        </template>

        <template v-slot:datatable>
          <v-data-table-server class="bg-grey-lighten-4 text-no-wrap custom-data-table" hover :headers="displayHeaders"
            :items="datatable.items" :items-length="totalItems" :loading="isTableLoading"
            :items-per-page="pagination.itemsPerPage" :page="pagination.page" :sort-by="pagination.sortBy"
            :items-per-page-options="[10, 25, 50, 100]" @update:options="onTableOptionsUpdate">

            <template v-slot:item.no="{ index }">
              {{ ((pagination.page - 1) * pagination.itemsPerPage) + index + 1 }}
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

            <!-- <template v-slot:item.print="{ item }">
              <div class="d-flex justify-center">
                <v-tooltip text="Print" color="#125C13" location="top start">
                  <template v-slot:activator="{ props }">
                    <v-btn size="small" color="success" @click="printMvo(item.id)" class="mx-1" v-bind="props" icon>
                      <v-icon>mdi-printer</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </template> -->

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

            <template v-slot:item.mvo_type="{ item }">{{ getMvoTypeName(item.mvo_type_id) }}</template>
            <template v-slot:item.province="{ item }">{{ item.province_code || '-' }}</template>
            <template v-slot:item.tgl_lahir="{ item }">{{ formatDate(item.tgl_lahir) }}</template>
            <template v-slot:item.pointbintang="{ item }">{{ item.pointbintang || '-' }}</template>
            <template v-slot:item.tanggal_repeat_order="{ item }">{{ formatDate(item.tanggal_repeat_order) || '-'
            }}</template>
            <template v-slot:item.created_at="{ item }">{{ formatDate(item.created_at) }}</template>

            <template v-slot:item.repeat_order="{ item }">
              <v-chip color="primary" size="small" variant="outlined">{{ formatNumber(item.repeat_order) }}</v-chip>
            </template>

            <template v-slot:item.upline_1="{ item }">{{ item.upline_1 && item.upline_1 !== '-' ? item.upline_1 : '-'
            }}</template>
            <template v-slot:item.upline_2="{ item }">{{ item.upline_2 && item.upline_2 !== '-' ? item.upline_2 : '-'
            }}</template>
            <template v-slot:item.upline_3="{ item }">{{ item.upline_3 && item.upline_3 !== '-' ? item.upline_3 : '-'
            }}</template>
            <template v-slot:item.upline_4="{ item }">{{ item.upline_4 && item.upline_4 !== '-' ? item.upline_4 : '-'
            }}</template>
            <template v-slot:item.upline_5="{ item }">{{ item.upline_5 && item.upline_5 !== '-' ? item.upline_5 : '-'
            }}</template>
            <template v-slot:item.upline_6="{ item }">{{ item.upline_6 && item.upline_6 !== '-' ? item.upline_6 : '-'
            }}</template>

          </v-data-table-server>
        </template>
      </CardDataTable>
    </div>

    <!-- Mobile View - Cards -->
    <div class="d-block d-md-none">
      <v-card class="mobile-header-card mb-4">
        <v-card-text>
          <v-text-field v-model="searchInput" prepend-inner-icon="mdi-magnify" label="Cari akun..." single-line
            hide-details variant="outlined" class="search-field-mobile" clearable />
        </v-card-text>
      </v-card>

      <v-progress-linear v-if="isTableLoading" indeterminate color="#FFD700" class="mb-4"></v-progress-linear>

      <div v-if="datatable.items.length === 0 && !isTableLoading" class="text-center pa-4">
        <v-icon size="64" color="grey">mdi-account-search</v-icon>
        <p class="text-grey mt-2">Tidak ada akun ditemukan</p>
      </div>

      <v-card v-for="(item, index) in datatable.items" :key="item.id" class="mobile-mvo-card mb-3"
        @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">
        <v-card-text class="mobile-card-header">
          <v-row no-gutters align="center">
            <v-col cols="2" class="text-center">
              <span class="mobile-number">{{ ((pagination.page - 1) * pagination.itemsPerPage) + index + 1 }}</span>
            </v-col>
            <v-col cols="8" class="pl-3">
              <div class="mobile-mvo-name"><strong>{{ item.nama }}</strong></div>
              <div class="mobile-mvo-code"><strong>{{ item.code }}</strong></div>
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
              <div v-for="(section, si) in mobileMvoSections(item)" :key="si" class="mobile-info-section mb-3">
                <v-row v-for="row in section.rows" :key="row.label" class="mb-2">
                  <v-col cols="4" class="detail-label">{{ row.label }}:</v-col>
                  <v-col cols="8" class="detail-value">{{ row.value }}</v-col>
                </v-row>
              </div>

              <v-divider class="mb-3"></v-divider>
              <div class="mobile-actions">
                <v-btn size="small" color="info" @click.stop="showDetailMvo(item.id)" class="mr-1 mb-2"
                  prepend-icon="mdi-information">Detail</v-btn>
                <v-btn size="small" color="success" @click.stop="printMvo(item.id)" class="mr-1 mb-2"
                  prepend-icon="mdi-printer">Print</v-btn>

                <v-btn v-if="canApprove(item)" size="small" :color="getApproveButtonColor(item)"
                  @click.stop="approveMvo(item.id)" class="mr-1 mb-2" :prepend-icon="getApproveButtonIcon(item)">
                  {{ mvo_type_id === 'mvo' ? 'Approve MVO' : 'Approve Admin' }}
                </v-btn>

                <template v-if="mvo_type_id === 'superadmin'">
                  <v-btn size="small" :color="app.colors.secondary" @click.stop="deleteMvo(item.id)" class="mb-2"
                    prepend-icon="mdi-delete">Hapus</v-btn>
                </template>
              </div>
            </v-card-text>
          </div>
        </v-expand-transition>
      </v-card>

      <div v-if="totalPages > 1" class="d-flex justify-center mt-3 mb-3">
        <v-pagination v-model="pagination.page" :length="totalPages" :total-visible="5" density="comfortable"
          @update:modelValue="loadItems" />
      </div>
    </div>

    <!-- Dialog Detail MVO -->
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
          <!-- Desktop Detail View -->
          <div class="d-none d-md-block">
            <div class="detail-section mb-6">
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="detail-section-title mb-0 d-flex align-center">
                  <v-icon class="mr-2" color="#FFD700">mdi-file-document-multiple</v-icon>
                  <span>Dokumen</span>
                  <v-chip color="success" size="small" class="ml-3" v-if="getDocumentMvoId()">
                    {{ getDocumentMvoCode() }}
                  </v-chip>
                  <span class="text-caption text-grey ml-2">{{ originalDetailMvoData?.nama || '-' }}</span>
                </h3>

                <v-btn color="primary" size="small" @click="openAddDocumentDialog" :disabled="!getDocumentMvoId()">
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

                <template v-slot:item.status_mvo="{ item }">
                  <v-chip :color="getMvoStatusColor(item)" size="small" variant="flat">
                    {{ getMvoStatusText(item) }}
                  </v-chip>
                </template>

                <template v-slot:item.status_regional="{ item }">
                  <v-chip :color="getRegionalStatusColor(item)" size="small" variant="flat">
                    {{ getRegionalStatusText(item) }}
                  </v-chip>
                </template>

                <template v-slot:item.status_inputan="{ item }">
                  <v-chip :color="getAdminStatusColor(item)" size="small" variant="flat">
                    {{ getAdminStatusText(item) }}
                  </v-chip>
                </template>

                <template v-slot:item.repeat_order="{ item }">{{ formatNumber(item.repeat_order) }}</template>
                <template v-slot:item.mvo_code="{ item }">{{ getMvoCodeById(item.mvo_id) }}</template>

                <template v-slot:item.star_number="{ item }">
                  <v-chip color="amber" text-color="white" size="small">
                    <v-icon start size="small">mdi-star</v-icon>
                    {{ item.pointbintang || 0 }}
                  </v-chip>
                </template>

                <template v-slot:item.star_icon="{ item }">
                  <div class="d-flex justify-center">
                    <v-icon v-for="n in 8" :key="n" :color="n <= (item.pointbintang || 0) ? '#FFD700' : '#e0e0e0'"
                      size="small">mdi-star</v-icon>
                  </div>
                </template>

                <template v-slot:item.file_path="{ item }">
                  <div class="d-flex align-center">
                    <div class="mr-3">
                      <v-img v-if="isImageFile(item.file_path)" :src="getFullFileUrl(item.file_path)" width="40"
                        height="40" class="rounded" />
                      <v-icon v-else-if="isPdfFile(item.file_path)" size="40" color="red">mdi-file-pdf-box</v-icon>
                      <v-icon v-else size="40" color="blue">mdi-file-document</v-icon>
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
                        <v-btn size="small" :color="app.colors.primary" @click="openEditDocumentDialog(item.id)"
                          class="mx-1" v-bind="props" icon>
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>

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

            <div class="detail-section mb-6" v-if="detailViewMode === 'children'">
              <h3 class="detail-section-title">
                <v-icon class="mr-2" color="#FFD700">mdi-account-supervisor</v-icon>
                Detail Downline
                <v-chip color="info" size="small" class="ml-3">{{ relatedMvoData.length }} Data</v-chip>
              </h3>

              <v-text-field v-model="detailSearch" prepend-inner-icon="mdi-magnify" label="Cari Data Downline..."
                single-line hide-details variant="outlined" class="mb-3" density="compact" />

              <v-data-table class="bg-grey-lighten-4 text-no-wrap custom-detail-table" :headers="detailHeaders"
                :items="getCurrentDetailData()" :search="detailSearch" hide-default-footer items-per-page="-1">

                <template v-slot:item.mvo_type="{ item }">{{ getMvoTypeName(item.mvo_type_id) }}</template>
                <template v-slot:item.province="{ item }">{{ item.province_code || '-' }}</template>
                <template v-slot:item.tgl_lahir="{ item }">{{ formatDate(item.tgl_lahir) }}</template>
                <template v-slot:item.upline_1="{ item }">{{ item.upline_1 || '-' }}</template>

                <template v-slot:item.action="{ item }">
                  <div class="d-flex justify-center">
                    <v-tooltip text="Detail Downline" color="#125C13" location="top start"
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

          <!-- Mobile Detail View -->
          <div class="d-block d-md-none">
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
              <v-window-item value="documents">
                <div class="mb-4">
                  <v-btn color="primary" block @click="openAddDocumentDialog" :disabled="!getDocumentMvoId()"
                    class="text-white">
                    <v-icon start>mdi-plus</v-icon>
                    Tambah Dokumen
                  </v-btn>

                  <div class="d-flex justify-center align-center mt-2 gap-2" v-if="getDocumentMvoId()">
                    <v-chip color="success" size="small">{{ getDocumentMvoCode() }}</v-chip>
                    <span class="text-caption text-grey">{{ originalDetailMvoData?.nama || '-' }}</span>
                  </div>
                </div>

                <v-text-field v-model="documentSearch" prepend-inner-icon="mdi-magnify" label="Cari Dokumen..."
                  single-line hide-details variant="outlined" class="mb-3" density="compact" />

                <v-progress-linear v-if="isLoadingDocuments" indeterminate color="#FFD700"
                  class="mb-4"></v-progress-linear>

                <div v-if="documentItems.length === 0 && !isLoadingDocuments" class="text-center pa-4">
                  <v-icon size="64" color="grey">mdi-file-document-off</v-icon>
                  <p class="text-grey mt-2">Tidak ada dokumen untuk data ini</p>
                </div>

                <v-card v-for="document in documentItems" :key="document.id" class="mobile-document-card mb-3"
                  elevation="2">
                  <v-card-text>
                    <div class="d-flex align-center mb-3">
                      <div class="mr-3">
                        <v-img v-if="isImageFile(document.file_path)" :src="getFullFileUrl(document.file_path)"
                          width="50" height="50" class="rounded" />
                        <v-icon v-else-if="isPdfFile(document.file_path)" size="50"
                          color="red">mdi-file-pdf-box</v-icon>
                        <v-icon v-else size="50" color="blue">mdi-file-document</v-icon>
                      </div>
                      <div class="flex-grow-1">
                        <div class="font-weight-medium mb-1">{{ document.file_name }}</div>
                        <div class="text-caption text-grey mb-1">{{ getMvoCodeById(document.mvo_id) }}</div>
                      </div>
                    </div>

                    <v-row class="mb-2" no-gutters>
                      <v-col cols="6">
                        <div class="text-caption text-grey">Poin Per Bintang:</div>
                        <div class="font-weight-medium">{{ document.pointbintang || '-' }}</div>
                      </v-col>
                      <v-col cols="6">
                        <div class="text-caption text-grey">Range Point:</div>
                        <div class="font-weight-medium">{{ formatNumber(document.repeat_order) }}</div>
                      </v-col>
                    </v-row>

                    <v-divider class="my-2"></v-divider>

                    <v-row v-for="row in mobileDocStatusRows(document)" :key="row.label" class="mb-2" no-gutters>
                      <v-col cols="5">
                        <div class="text-caption text-grey">{{ row.label }}:</div>
                      </v-col>
                      <v-col cols="7">
                        <v-chip :color="row.color" size="x-small" variant="flat">{{ row.text }}</v-chip>
                      </v-col>
                    </v-row>

                    <v-divider class="mb-3"></v-divider>
                    <div class="d-flex flex-wrap gap-2">
                      <v-btn size="small" color="success" variant="outlined"
                        @click="downloadFile(document.file_path, document.file_name)" class="flex-grow-1">
                        <v-icon start size="16">mdi-download</v-icon>
                        Download
                      </v-btn>
                    </div>

                    <div class="d-flex flex-wrap gap-2 mt-2">
                      <v-btn size="small" :color="app.colors.primary" variant="text"
                        @click="openEditDocumentDialog(document.id)">
                        <v-icon start size="16">mdi-pencil</v-icon>
                        Edit
                      </v-btn>

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

              <v-window-item value="children" v-if="detailViewMode === 'children'">
                <v-text-field v-model="detailSearch" prepend-inner-icon="mdi-magnify" label="Cari Data Downline..."
                  single-line hide-details variant="outlined" class="mb-3" density="compact" />

                <div v-if="getCurrentDetailData().length === 0" class="text-center pa-4">
                  <v-icon size="64" color="grey">mdi-account-off</v-icon>
                  <p class="text-grey mt-2">Tidak ada data Downline</p>
                </div>

                <v-card v-for="(child, index) in getCurrentDetailData()" :key="child.id" class="mobile-child-card mb-3"
                  elevation="2" @click="toggleMobileChildDetail(child.id)"
                  :class="{ 'mobile-child-expanded': expandedMobileChild === child.id }">

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

                  <v-expand-transition>
                    <div v-show="expandedMobileChild === child.id">
                      <v-divider></v-divider>
                      <v-card-text class="mobile-child-details">
                        <div v-for="section in mobileChildSections(child)" :key="section.title"
                          class="mobile-info-section mb-3">
                          <h4 class="text-subtitle-2 mb-2 text-primary">{{ section.title }}</h4>
                          <v-row v-for="row in section.rows" :key="row.label" class="mb-1" dense>
                            <v-col cols="4" class="text-caption text-grey">{{ row.label }}:</v-col>
                            <v-col cols="8" class="text-body-2">{{ row.value }}</v-col>
                          </v-row>
                        </div>

                        <v-divider class="mb-3"></v-divider>
                        <div class="d-flex justify-center">
                          <v-btn v-if="child.bawahan && child.bawahan.length > 0" size="small" color="warning"
                            @click.stop="showChildDetail(child.id)" :loading="isLoadingParentDetail" class="text-white">
                            <v-icon start size="16">mdi-account-arrow-down</v-icon>
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
          <v-btn :color="app.colors.primary" @click="closeDetailDialog" class="ml-2">Tutup</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="isShowDialogDelete" :max-width="$vuetify.display.mobile ? '95%' : '500px'">
      <v-card :color="app.colors.background">
        <v-card-title class="text-h5">Apakah yakin ingin menghapus data ini?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="app.colors.primary" @click="isShowDialogDelete = false">Cancel</v-btn>
          <v-btn :color="app.colors.secondary" @click="confirmDeleteMvo(modelDelete.id)"
            :loading="isButtonLoading">OK</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Document Add/Edit Dialog (unified) -->
    <v-dialog v-model="documentDialog.show" persistent :width="$vuetify.display.mobile ? '95%' : '700'">
      <v-card class="custom-dialog">
        <v-card-title class="dialog-header">
          <v-icon class="mr-2" style="color: #FFD700;">
            {{ isDocEditMode ? 'mdi-pencil' : 'mdi-plus-circle' }}
          </v-icon>
          <span class="dialog-title">{{ isDocEditMode ? 'EDIT DOKUMEN' : 'TAMBAH DOKUMEN' }}</span>
        </v-card-title>

        <v-card-text class="dialog-content">
          <v-row v-if="!isDocEditMode">
            <v-col cols="12">
              <v-select label="Tipe Dokumen" v-model="documentForm.document_type"
                :items="[{ title: 'Dokumen Star', value: 'star' }, { title: 'Dokumen Biasa', value: 'user' }]"
                item-title="title" item-value="value" class="mb-2 mt-4" variant="outlined" density="comfortable"
                prepend-inner-icon="mdi-file-document-outline" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-text-field label="Nama File" v-model="documentForm.file_name" class="mb-2 mt-4"
                :rules="isDocEditMode ? [requiredRule] : []" />
            </v-col>
          </v-row>

          <v-row v-if="showStarFields">
            <v-col cols="12">
              <v-select label="Rating Star" v-model="documentForm.pointbintang" :items="[0, 1, 2, 3, 4, 5, 6, 7, 8]"
                class="mb-2" :rules="[pointbintangRule]" required>
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
                        <v-icon v-for="n in item.value" :key="n" color="#FFD700" small class="mr-1">mdi-star</v-icon>
                      </div>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field label="Tanggal Input Dokumen" type="date" v-model="documentForm.tanggal_repeat_order"
                class="mb-2" :rules="isDocEditMode ? [] : [requiredRule]" variant="outlined" density="comfortable"
                prepend-inner-icon="mdi-calendar" />
            </v-col>
            <v-col cols="12" md="6" v-if="showStarFields">
              <v-text-field label="Range Point" v-model="formattedRepeatOrder" class="mb-2"
                hint="Masukkan range point. Isi 0 jika yang diupload dokumen biasa" persistent-hint
                :rules="[rangePointOptionalRule]" variant="outlined" density="comfortable"
                prepend-inner-icon="mdi-chart-line" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <v-file-input :label="isDocEditMode ? 'Upload File Baru (Opsional)' : 'Upload File'"
                v-model="documentForm.file" class="mb-2" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                @change="handleDocumentFileChange" :rules="isDocEditMode ? [] : [requiredRule]"
                :hint="isDocEditMode ? 'Kosongkan jika tidak ingin mengubah file' : ''"
                :persistent-hint="isDocEditMode" />
            </v-col>
          </v-row>

          <v-row v-if="isDocEditMode && documentForm.file_path && !documentForm.file">
            <v-col cols="12">
              <div class="mb-2">
                <label class="text-caption text-grey">File Saat Ini:</label>
                <div class="d-flex align-center mt-1">
                  <div class="mr-3">
                    <v-img v-if="isImageFile(documentForm.file_path)" :src="getFullFileUrl(documentForm.file_path)"
                      width="40" height="40" class="rounded" />
                    <v-icon v-else-if="isPdfFile(documentForm.file_path)" size="40"
                      color="red">mdi-file-pdf-box</v-icon>
                    <v-icon v-else size="40" color="blue">mdi-file-document</v-icon>
                  </div>
                  <div>
                    <div class="text-body-2">{{ documentForm.original_file_name || 'File tidak diketahui' }}</div>
                    <v-btn size="x-small" color="primary" variant="text" @click="viewFile(documentForm.file_path)">
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
          <v-btn :color="app.colors.secondary" @click="documentDialog.show = false" class="ml-2">Batal</v-btn>
          <v-btn :color="app.colors.primary" @click="submitDocument()" :loading="isDocumentButtonLoading" class="ml-2">
            {{ isDocEditMode ? 'Update' : 'Simpan' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

const API_BASE = "http://127.0.0.1:8000/api";
const FILE_BASE = "http://127.0.0.1:8000/project/public/";

const UPLINE_LEVELS = [
  { key: "upline_6", title: "Distributor", short: "DISTRIBUTOR" },
  { key: "upline_5", title: "Supplier", short: "SUPPLIER" },
  { key: "upline_4", title: "General Manager", short: "GENERAL MANAGER" },
  { key: "upline_3", title: "Founder", short: "FOUNDER" },
  { key: "upline_2", title: "Regional", short: "REGIONAL" },
  { key: "upline_1", title: "MVO", short: "MVO" },
];

const buildEmptyDocForm = () => ({
  id: "",
  mvo_id: "",
  document_type: "star",
  file_name: "",
  pointbintang: "",
  tanggal_repeat_order: "",
  repeat_order: "",
  file: null,
  file_path: "",
  original_file_name: "",
});

export default {
  name: "MvoManagement",
  components: { Breadcrumb, CardDataTable },

  setup() {
    const app = useAppStore();
    return { app };
  },

  data() {
    return {
      UPLINE_LEVELS,

      pagination: {
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
      },
      totalItems: 0,
      searchInput: "",
      debouncedSearch: "",
      _searchTimer: null,
      mvoCodeCache: {},

      mobileDetailTab: "documents",
      expandedMobileChild: null,
      expandedMobileCard: null,
      detailNavigationHistory: [],
      isNavigatingBack: false,
      contentSnackbar: { snackbar: false, text: "", color: "" },
      mvo_type_id: "",
      title: "DATA AKUN",
      itemsBreadcrumb: [
        { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
        { title: "AKUN", disabled: false, href: "/admin/mvo" },
      ],

      isShowDialogDetail: false,
      isButtonLoading: false,
      isTableLoading: false,
      isLoadingParentDetail: false,
      isShowDialogDelete: false,

      isDocumentButtonLoading: false,
      isLoadingDocuments: false,
      isImporting: false,

      currentDetailIndex: 0,
      relatedMvoData: [],
      detailViewMode: "single",

      documentSearch: "",
      detailSearch: "",

      datatable: {
        headers: [
          { key: "no", title: "No", sortable: false },
          { key: "code", title: "Kode", fixed: "start", width: 100 },
          { key: "no_id", title: "No ID", fixed: "start", width: 120 },
          { key: "nama", title: "Nama", fixed: "start", width: 180 },
          { key: "nama_panggilan", title: "Nama Panggilan" },
          { key: "tempat_lahir", title: "Tempat Lahir" },
          { key: "tgl_lahir", title: "Tanggal Lahir" },
          { key: "alamat", title: "Alamat" },
          { key: "nohp", title: "No HP" },
          { key: "jaringan_mvo", title: "Jaringan" },
          { key: "mvo_type", title: "Tipe" },
          { key: "province", title: "Provinsi" },
          ...UPLINE_LEVELS.map(lvl => ({ key: lvl.key, title: lvl.title })),
          { key: "created_at", title: "Tgl Aktivasi", align: "center" },
          { key: "detail", title: "Detail", sortable: false, align: "center" },
          // { key: "print", title: "Print", sortable: false, align: "center" },
          { key: "action", title: "Actions", sortable: false, align: "center" },
        ],
        items: [],
      },

      detailHeaders: [
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
        ...UPLINE_LEVELS.map(lvl => ({ key: lvl.key, title: lvl.title })),
      ],

      documentHeaders: [
        { key: "mvo_code", title: "Kode" },
        { key: "file_name", title: "Nama File" },
        { key: "star_number", title: "Bintang", align: "center" },
        { key: "star_icon", title: "Rating Star", sortable: false, align: "center" },
        { key: "tanggal_repeat_order", title: "Tanggal Input", align: "center" },
        { key: "repeat_order", title: "Range Point", align: "center" },
        // { key: "status_mvo", title: "Status MVO", align: "center" },
        // { key: "status_regional", title: "Status Regional", align: "center" },
        { key: "status_inputan", title: "Status Admin", align: "center" },
        { key: "file_path", title: "File Preview", sortable: false, width: "200px" },
        { key: "action", title: "Actions", sortable: false, align: "center" },
      ],
      documentItems: [],

      originalDetailMvoId: null,
      originalDetailMvoData: {},

      mvoTypes: [],
      detailModel: {},
      modelDelete: { id: "" },

      documentDialog: { show: false, mode: "add" },
      documentForm: buildEmptyDocForm(),
    };
  },

  computed: {
    isDocEditMode() {
      return this.documentDialog.mode === "edit";
    },

    showStarFields() {
      return this.isDocEditMode || this.documentForm.document_type === "star";
    },

    formattedRepeatOrder: {
      get() {
        const v = this.documentForm.repeat_order;
        if (v === null || v === undefined || v === "") return "";
        return Number(v).toLocaleString("id-ID");
      },
      set(value) {
        const numericValue = parseInt(String(value).replace(/\./g, ""), 10);
        this.documentForm.repeat_order = isNaN(numericValue) ? "" : numericValue;
      },
    },

    rangePointOptionalRule() {
      return value => {
        if (value === null || value === undefined || value === "") return true;
        const num = Number(String(value).replace(/\./g, ""));
        if (isNaN(num)) return "Harus berupa angka";
        if (num < 0) return "Range Point tidak boleh kurang dari 0";
        return true;
      };
    },

    displayHeaders() {
      if (this.mvo_type_id === "superadmin") return this.datatable.headers;
      if (this.mvo_type_id === "mvo") {
        return this.datatable.headers.filter(h => h.key !== "status_inputan_2");
      }
      return this.datatable.headers.filter(h => h.key !== "approve" && h.key !== "status_inputan_2");
    },

    requiredRule() {
      return value => !!value || "Field ini wajib diisi";
    },

    pointbintangRule() {
      return value => {
        if (value === null || value === undefined || value === "") return "Rising Star harus diisi";
        const num = Number(value);
        if (isNaN(num)) return "Harus berupa angka";
        if (num < 0) return "Poin tidak boleh kurang dari 0";
        if (num > 8) return "Poin maksimal adalah 8";
        return true;
      };
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.totalItems / this.pagination.itemsPerPage));
    },
  },

  methods: {
    // ========== UTIL ==========
    formatNumber(value) {
      if (value === null || value === undefined || value === "") return "-";
      const num = Number(value);
      if (isNaN(num)) return value;
      return num.toLocaleString("id-ID");
    },

    formatDate(dateString) {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("id-ID");
    },

    showSnackbar(message, color = "primary") {
      this.contentSnackbar.snackbar = true;
      this.contentSnackbar.text = message;
      this.contentSnackbar.color = color === "primary" ? this.app.colors.primary : this.app.colors.secondary;
    },

    getAuthHeaders() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return null;
      }
      return { Authorization: `Bearer ${token}`, Accept: "application/json" };
    },

    getUserCabang() {
      try {
        const headerData = JSON.parse(localStorage.getItem("headerData"));
        return headerData?.code || null;
      } catch { return null; }
    },

    isImageFile(filePath) {
      if (!filePath) return false;
      const exts = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
      return exts.some(ext => filePath.toLowerCase().includes(ext));
    },

    isPdfFile(filePath) {
      return !!filePath && filePath.toLowerCase().includes(".pdf");
    },

    getFullFileUrl(filePath) {
      return `${FILE_BASE}${filePath}`;
    },

    viewFile(filePath) {
      window.open(this.getFullFileUrl(filePath), "_blank");
    },

    downloadFile(filePath, fileName) {
      const link = document.createElement("a");
      link.href = this.getFullFileUrl(filePath);
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    // ========== STATUS HELPERS (DOCUMENT) ==========
    getMvoStatusText(item) {
      if (!item.upline_1) return "Tidak Ada MVO";
      return item.approval_doc_upline_1 === null ? "Belum Approve" : "Sudah Approve";
    },
    getMvoStatusColor(item) {
      if (!item.upline_1) return "grey";
      return item.approval_doc_upline_1 === null ? "warning" : "success";
    },

    getRegionalStatusText(item) {
      if (!item.upline_2) return "Tidak Ada Regional";
      return item.approval_doc_upline_2 === null ? "Belum Approve" : "Sudah Approve";
    },
    getRegionalStatusColor(item) {
      if (!item.upline_2) return "grey";
      return item.approval_doc_upline_2 === null ? "warning" : "success";
    },

    getAdminStatusText(item) {
      return item.status_inputan === "approved" ? "Sudah Approve" : "Belum Approve";
    },
    getAdminStatusColor(item) {
      return item.status_inputan === "approved" ? "success" : "warning";
    },

    getDocumentStatusColor(status, approvalDocUpline1 = null, upline1 = null) {
      if (upline1 !== null) {
        if ((!status || status === null) && (!approvalDocUpline1 || approvalDocUpline1 === null)) return "warning";
        if ((!status || status === null) && approvalDocUpline1 !== null) return "info";
      }
      if (upline1 === null && (!status || status === null)) return "info";
      if (status && status.toLowerCase() === "approved") return "success";
      switch (status?.toLowerCase()) {
        case "pending": return "warning";
        case "rejected": return "error";
        default: return "grey";
      }
    },

    getDocumentStatusText(status, approvalDocUpline1 = null, upline1 = null) {
      if (upline1 !== null) {
        if ((!status || status === null) && (!approvalDocUpline1 || approvalDocUpline1 === null)) return "Menunggu Approval MVO";
        if ((!status || status === null) && approvalDocUpline1 !== null) return "Menunggu Approval Admin";
      }
      if (upline1 === null && (!status || status === null)) return "Menunggu Approval Admin";
      if (status && status.toLowerCase() === "approved") return "Disetujui";
      switch (status?.toLowerCase()) {
        case "pending": return "Menunggu";
        case "rejected": return "Ditolak";
        default: return "Tidak Diketahui";
      }
    },

    // ========== APPROVAL: MVO RECORD ==========
    canApprove(item) {
      if (this.mvo_type_id === "mvo") return item.status_inputan !== "approved";
      if (this.mvo_type_id === "superadmin") return item.status_inputan === "approved" && item.status_inputan_2 !== "approved";
      return false;
    },

    getApproveButtonColor(item) {
      if (this.mvo_type_id === "mvo") return item.status_inputan === "approved" ? "success" : "warning";
      if (this.mvo_type_id === "superadmin") return "success";
      return "grey";
    },

    getApproveButtonIcon(item) {
      if (this.mvo_type_id === "mvo") return item.status_inputan === "approved" ? "mdi-check-circle" : "mdi-check";
      if (this.mvo_type_id === "superadmin") return item.status_inputan_2 === "approved" ? "mdi-check-all" : "mdi-check-circle-outline";
      return "mdi-check";
    },

    getApproveTooltip(item) {
      if (this.mvo_type_id === "mvo") return item.status_inputan === "approved" ? "Sudah Disetujui MVO" : "Setujui sebagai MVO";
      if (this.mvo_type_id === "superadmin") {
        if (item.status_inputan !== "approved") return "Menunggu Persetujuan MVO";
        return item.status_inputan_2 === "approved" ? "Sudah Disetujui Admin" : "Setujui sebagai Admin";
      }
      return "Approve";
    },

    async approveMvo(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;
      this.expandedMobileCard = null;

      let endpoint = "";
      let successMessage = "";
      if (this.mvo_type_id === "mvo") {
        endpoint = `${API_BASE}/mvo/${id}/approve`;
        successMessage = "Data berhasil disetujui oleh MVO";
      } else if (this.mvo_type_id === "superadmin") {
        endpoint = `${API_BASE}/superadmin/${id}/approve`;
        successMessage = "Data berhasil disetujui oleh Superadmin";
      } else {
        this.showSnackbar("Anda tidak memiliki akses untuk approve", "error");
        return;
      }

      try {
        this.isButtonLoading = true;
        const response = await axios.put(endpoint, {}, { headers });
        if (response.data.status === "success") {
          this.showSnackbar(response.data.message || successMessage);
          await this.loadItems();
        } else {
          this.showSnackbar(response.data.message, "error");
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message, "error");
      } finally {
        this.isButtonLoading = false;
      }
    },

    // ========== APPROVAL: DOCUMENT ==========
    canApproveDocument(document) {
      // hanya butuh approve superadmin
      if (this.mvo_type_id !== "superadmin") return false;
      if (document.status_inputan === "approved") return false;
      return true;
    },

    getDocumentApproveButtonColor(document) {
      if (this.mvo_type_id === "mvo") return document.status_inputan === "approved" ? "success" : "warning";
      if (this.mvo_type_id === "superadmin") return "success";
      return "grey";
    },

    getDocumentApproveButtonIcon(document) {
      if (this.mvo_type_id === "superadmin") return document.status_inputan_2 === "approved" ? "mdi-check-all" : "mdi-check-circle-outline";
      return "mdi-check";
    },

    getDocumentApproveTooltip(document) {
      if (this.mvo_type_id !== "superadmin") return "Tidak Ada Akses";
      if (document.status_inputan === "approved") return "Sudah Disetujui Admin";
      if (document.upline_1 !== null) {
        if (!document.approval_doc_upline_1 || document.approval_doc_upline_1 === null) return "Menunggu Approval MVO";
        return "Setujui sebagai Admin";
      }
      return "Setujui sebagai Admin (Dokumen MVO)";
    },

    async approveDocument(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      const document = this.documentItems.find(doc => doc.id === id);
      if (!document) {
        this.showSnackbar("Dokumen tidak ditemukan", "error");
        return;
      }

      if (this.mvo_type_id !== "superadmin") {
        this.showSnackbar("Anda tidak memiliki akses untuk approve", "error");
        return;
      }

      if (document.status_inputan === "approved") {
        this.showSnackbar("Dokumen sudah disetujui", "warning");
        return;
      }

      // if (document.upline_1 !== null && (!document.approval_doc_upline_1 || document.approval_doc_upline_1 === null)) {
      //   this.showSnackbar("Menunggu approval dari MVO terlebih dahulu", "warning");
      //   return;
      // }

      this.isDocumentButtonLoading = true;
      try {
        const response = await axios.put(`${API_BASE}/superadmin/${id}/approvedoc`, {}, { headers });
        if (response.data.status === "success") {
          this.showSnackbar(response.data.message || "Dokumen berhasil disetujui oleh Superadmin");
          await this.getMvoDocuments(this.getDocumentMvoId());
        } else {
          this.showSnackbar(response.data.message, "error");
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message, "error");
      } finally {
        this.isDocumentButtonLoading = false;
      }
    },

    // ========== DATA FETCH ==========
    cacheMvoCodes(items) {
      if (!Array.isArray(items)) return;
      items.forEach(it => {
        if (it && it.id != null && it.code) {
          this.mvoCodeCache[it.id] = it.code;
        }
      });
    },

    async loadItems() {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isTableLoading = true;
      const userCabang = this.getUserCabang();
      const sort = (this.pagination.sortBy && this.pagination.sortBy[0]) || null;

      const params = {
        page: this.pagination.page,
        per_page: this.pagination.itemsPerPage,
        search: this.debouncedSearch || "",
      };
      if (userCabang) params.user_cabang = userCabang;
      if (sort) {
        params.sort_by = sort.key;
        params.sort_desc = sort.order === "desc";
      }

      try {
        const response = await axios.get(`${API_BASE}/mvo`, { headers, params });
        if (response.data.status === "success") {
          this.datatable.items = response.data.data || [];
          this.totalItems = response.data.meta?.total ?? this.datatable.items.length;
          this.cacheMvoCodes(this.datatable.items);
        } else {
          this.showSnackbar(response.data.message);
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message);
      } finally {
        this.isTableLoading = false;
      }
    },

    async getMvoTypes() {
      const headers = this.getAuthHeaders();
      if (!headers) return;
      try {
        const response = await axios.get(`${API_BASE}/mvo-type`, { headers });
        if (response.data.status === "success") this.mvoTypes = response.data.data;
      } catch { /* silent */ }
    },

    getMvoTypeName(mvoTypeId) {
      const mvoType = this.mvoTypes.find(t => t.id == mvoTypeId);
      return mvoType ? mvoType.name : "-";
    },

    getMvoCodeById(mvoId) {
      if (this.mvoCodeCache[mvoId]) return this.mvoCodeCache[mvoId];
      // Fallback: dokumen yang ditampilkan saat ini selalu milik MVO yang sedang dibuka detailnya.
      return this.originalDetailMvoData?.code || "Unknown";
    },

    // ========== DELETE MVO ==========
    deleteMvo(id) {
      this.isShowDialogDelete = true;
      this.modelDelete.id = id;
    },

    async confirmDeleteMvo(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isButtonLoading = true;
      try {
        const response = await axios.delete(`${API_BASE}/mvo/${id}`, { headers });
        this.loadItems();
        this.showSnackbar(response.data.message || "Data berhasil dihapus");
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error deleting", "error");
      } finally {
        this.isButtonLoading = false;
        this.isShowDialogDelete = false;
      }
    },

    // ========== UI HELPERS ==========
    toggleMobileDetail(itemId) {
      this.expandedMobileCard = this.expandedMobileCard === itemId ? null : itemId;
    },

    toggleMobileChildDetail(childId) {
      this.expandedMobileChild = this.expandedMobileChild === childId ? null : childId;
    },

    onTableOptionsUpdate(options) {
      const newSort = options.sortBy || this.pagination.sortBy;
      const pageChanged = this.pagination.page !== options.page;
      const ippChanged = this.pagination.itemsPerPage !== options.itemsPerPage;
      const sortChanged = JSON.stringify(this.pagination.sortBy) !== JSON.stringify(newSort);
      if (!pageChanged && !ippChanged && !sortChanged) return;
      this.pagination.page = sortChanged ? 1 : options.page;
      this.pagination.itemsPerPage = options.itemsPerPage;
      this.pagination.sortBy = newSort;
      this.loadItems();
    },

    mobileMvoSections(item) {
      return [
        {
          rows: [
            { label: "No ID", value: item.no_id || "-" },
            { label: "Panggilan", value: item.nama_panggilan || "-" },
            { label: "Tempat Lahir", value: item.tempat_lahir || "-" },
            { label: "Tgl Lahir", value: this.formatDate(item.tgl_lahir) },
          ],
        },
        {
          rows: [
            { label: "No HP", value: item.nohp || "-" },
            { label: "Alamat", value: item.alamat || "-" },
          ],
        },
        {
          rows: [
            { label: "Jaringan", value: item.jaringan_mvo || "-" },
            { label: "Tipe", value: this.getMvoTypeName(item.mvo_type_id) },
            { label: "Provinsi", value: item.province_code || "-" },
            ...UPLINE_LEVELS.slice().reverse().map(lvl => ({
              label: lvl.short,
              value: item[lvl.key] || "-",
            })),
          ],
        },
      ];
    },

    mobileChildSections(child) {
      return [
        {
          title: "Informasi Personal",
          rows: [
            { label: "No ID", value: child.no_id || "-" },
            { label: "Panggilan", value: child.nama_panggilan || "-" },
            { label: "Tempat Lahir", value: child.tempat_lahir || "-" },
            { label: "Tgl Lahir", value: this.formatDate(child.tgl_lahir) },
          ],
        },
        {
          title: "Kontak",
          rows: [
            { label: "No HP", value: child.nohp || "-" },
            { label: "Alamat", value: child.alamat || "-" },
          ],
        },
        {
          title: "Bisnis",
          rows: [
            { label: "Jaringan", value: child.jaringan_mvo || "-" },
            { label: "Provinsi", value: child.province_code || "-" },
            { label: "Upline 1", value: child.upline_1 || "-" },
          ],
        },
      ];
    },

    mobileDocStatusRows(document) {
      return [
        // { label: "Status MVO", color: this.getMvoStatusColor(document), text: this.getMvoStatusText(document) },
        // { label: "Status Regional", color: this.getRegionalStatusColor(document), text: this.getRegionalStatusText(document) },
        { label: "Status Admin", color: this.getAdminStatusColor(document), text: this.getAdminStatusText(document) },
        {
          label: "Status",
          color: this.getDocumentStatusColor(document.status_inputan, document.approval_doc_upline_1, document.upline_1),
          text: this.getDocumentStatusText(document.status_inputan, document.approval_doc_upline_1, document.upline_1),
        },
      ];
    },

    // ========== DETAIL DIALOG ==========
    saveCurrentState() {
      return {
        originalDetailMvoId: this.originalDetailMvoId,
        originalDetailMvoData: { ...this.originalDetailMvoData },
        relatedMvoData: [...this.relatedMvoData],
        currentDetailIndex: this.currentDetailIndex,
        detailModel: { ...this.detailModel },
        detailViewMode: this.detailViewMode,
        documentItems: [...this.documentItems],
      };
    },

    restoreState(prev) {
      this.originalDetailMvoId = prev.originalDetailMvoId;
      this.originalDetailMvoData = { ...prev.originalDetailMvoData };
      this.relatedMvoData = [...prev.relatedMvoData];
      this.currentDetailIndex = prev.currentDetailIndex;
      this.detailModel = { ...prev.detailModel };
      this.detailViewMode = prev.detailViewMode;
      this.documentItems = [...prev.documentItems];
    },

    closeDetailDialog() {
      this.isShowDialogDetail = false;
      this.currentDetailIndex = 0;
      this.relatedMvoData = [];
      this.detailViewMode = "single";
      this.detailModel = {};
      this.documentItems = [];
      this.originalDetailMvoId = null;
      this.originalDetailMvoData = {};
      this.documentSearch = "";
      this.detailSearch = "";
      this.detailNavigationHistory = [];
      this.mobileDetailTab = "documents";
      this.expandedMobileChild = null;
    },

    getDocumentMvoId() {
      return this.originalDetailMvoId || this.detailModel.id || null;
    },

    getDocumentMvoCode() {
      if (this.originalDetailMvoData?.code) return this.originalDetailMvoData.code;
      if (this.originalDetailMvoId) {
        const mvo = this.datatable.items.find(item => item.id == this.originalDetailMvoId);
        return mvo ? mvo.code : "Unknown";
      }
      return this.detailModel.code || "Unknown";
    },

    getCurrentDetailData() {
      if (this.detailViewMode === "children" && this.relatedMvoData.length > 0) return this.relatedMvoData;
      return [];
    },

    async fetchMvoDetail(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return null;
      try {
        const response = await axios.get(`${API_BASE}/mvo/${id}`, { headers });
        if (response.data.status === "success") {
          const data = response.data.data || {};
          this.cacheMvoCodes([data]);
          this.cacheMvoCodes(data.bawahan || []);
          return data;
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message);
      }
      return null;
    },

    async showDetailMvo(id) {
      this.expandedMobileCard = null;

      if (this.isShowDialogDetail) {
        this.detailNavigationHistory.push(this.saveCurrentState());
      }

      const detail = await this.fetchMvoDetail(id);
      this.originalDetailMvoId = id;
      this.originalDetailMvoData = detail || {};

      await this.getMvoDocuments(id);

      const childrenData = detail?.bawahan || [];

      if (childrenData.length > 0) {
        this.relatedMvoData = childrenData;
        this.currentDetailIndex = 0;
        this.detailModel = childrenData[0];
        this.detailViewMode = "children";
      } else {
        this.relatedMvoData = [];
        this.detailModel = {};
        this.detailViewMode = "documents-only";
      }

      this.isShowDialogDetail = true;
    },

    async showChildDetail(childId) {
      this.detailNavigationHistory.push(this.saveCurrentState());
      this.isShowDialogDetail = false;

      setTimeout(async () => {
        const detail = await this.fetchMvoDetail(childId);
        this.originalDetailMvoId = childId;
        this.originalDetailMvoData = detail || {};

        await this.getMvoDocuments(childId);

        const childrenData = detail?.bawahan || [];

        if (childrenData.length > 0) {
          this.relatedMvoData = childrenData;
          this.currentDetailIndex = 0;
          this.detailModel = childrenData[0];
          this.detailViewMode = "children";
        } else {
          this.relatedMvoData = [this.originalDetailMvoData];
          this.detailModel = this.originalDetailMvoData;
          this.detailViewMode = "single";
        }

        this.isShowDialogDetail = true;
      }, 100);
    },

    navigateBack() {
      if (this.detailNavigationHistory.length === 0) return;
      this.isNavigatingBack = true;
      const prev = this.detailNavigationHistory.pop();
      this.restoreState(prev);
      this.isNavigatingBack = false;
    },

    // ========== DOCUMENT CRUD ==========
    async getMvoDocuments(mvoId) {
      const headers = this.getAuthHeaders();
      if (!headers || !mvoId) {
        this.documentItems = [];
        return;
      }

      this.isLoadingDocuments = true;
      try {
        const response = await axios.get(`${API_BASE}/mvo-document`, {
          headers,
          params: { mvo_id: mvoId },
        });
        this.documentItems = response.data.status === "success"
          ? (response.data.data || [])
          : [];
      } catch {
        this.documentItems = [];
      } finally {
        this.isLoadingDocuments = false;
      }
    },

    openAddDocumentDialog() {
      const mvoId = this.getDocumentMvoId();
      if (!mvoId) {
        this.showSnackbar("error");
        return;
      }
      this.documentDialog.mode = "add";
      this.documentForm = buildEmptyDocForm();
      this.documentForm.mvo_id = mvoId;
      this.documentForm.tanggal_repeat_order = new Date().toISOString().split("T")[0];
      this.documentDialog.show = true;
    },

    async openEditDocumentDialog(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      try {
        const response = await axios.get(`${API_BASE}/mvo-document/${id}`, { headers });
        if (response.data.status === "success") {
          const data = response.data.data;
          this.documentDialog.mode = "edit";
          this.documentForm = {
            ...buildEmptyDocForm(),
            ...data,
            original_file_name: data.file_name,
            file: null,
          };
          this.documentDialog.show = true;
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message);
      }
    },

    handleDocumentFileChange(event) {
      const file = Array.isArray(event) ? event[0] : event?.target?.files?.[0];
      if (!file) return;
      this.documentForm.file = file;
      // Mode add: isi nama file otomatis jika kosong
      // Mode edit: isi nama file jika kosong atau masih sama dengan original
      const isOriginal = this.documentForm.file_name === this.documentForm.original_file_name;
      if (!this.documentForm.file_name || (this.isDocEditMode && isOriginal)) {
        this.documentForm.file_name = file.name;
      }
    },

    async submitDocument() {
      if (this.isDocEditMode) return this.updateDocument();
      return this.addDocument();
    },

    async addDocument() {
      let point = null;
      if (this.documentForm.pointbintang !== "" && this.documentForm.pointbintang !== null) {
        point = Number(this.documentForm.pointbintang);
        if (isNaN(point) || point < 0 || point > 8) {
          this.showSnackbar("Poin per bintang harus antara 0 sampai 8", "error");
          return;
        }
      }

      let rangePoint = null;
      if (this.documentForm.repeat_order !== "" && this.documentForm.repeat_order !== null) {
        rangePoint = Number(this.documentForm.repeat_order);
        if (isNaN(rangePoint) || rangePoint < 0) {
          this.showSnackbar("Range Point tidak boleh kurang dari 0", "error");
          return;
        }
      }

      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isDocumentButtonLoading = true;
      try {
        const formData = new FormData();
        formData.append("mvo_id", this.documentForm.mvo_id);

        if (this.documentForm.file_name) formData.append("file_name", this.documentForm.file_name);
        if (point !== null) formData.append("pointbintang", Math.floor(point));
        if (this.documentForm.tanggal_repeat_order) formData.append("tanggal_repeat_order", this.documentForm.tanggal_repeat_order);
        if (rangePoint !== null) formData.append("repeat_order", rangePoint);
        if (this.documentForm.file) formData.append("file_path", this.documentForm.file);

        const response = await axios.post(`${API_BASE}/mvo-document`, formData, {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
        });

        await this.getMvoDocuments(this.getDocumentMvoId());
        this.documentDialog.show = false;
        this.showSnackbar(response.data.message);
      } catch (error) {
        this.showSnackbar(error.response.data.message, "error");
      } finally {
        this.isDocumentButtonLoading = false;
      }
    },

    async updateDocument() {
      if (!this.documentForm.file_name ||
        !this.documentForm.pointbintang ||
        !this.documentForm.tanggal_repeat_order ||
        !this.documentForm.repeat_order) {
        this.showSnackbar("Semua field harus diisi", "error");
        return;
      }

      const point = Number(this.documentForm.pointbintang);
      if (isNaN(point) || point < 0 || point > 8) {
        this.showSnackbar("Poin per bintang harus antara 0 sampai 8", "error");
        return;
      }

      const rangePoint = Number(this.documentForm.repeat_order);
      if (isNaN(rangePoint) || rangePoint < 0) {
        this.showSnackbar("Range Point tidak boleh kurang dari 0", "error");
        return;
      }

      const headers = this.getAuthHeaders();
      if (!headers) return;

      this.isDocumentButtonLoading = true;
      try {
        const formData = new FormData();
        formData.append("mvo_id", this.documentForm.mvo_id);
        formData.append("file_name", this.documentForm.file_name);
        formData.append("pointbintang", Math.floor(point));
        formData.append("tanggal_repeat_order", this.documentForm.tanggal_repeat_order);
        formData.append("repeat_order", rangePoint);
        if (this.documentForm.file) formData.append("file_path", this.documentForm.file);

        const response = await axios.post(`${API_BASE}/mvo-document/${this.documentForm.id}`, formData, {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
        });

        if (response.data.status === "success") {
          this.showSnackbar(response.data.message || "Dokumen berhasil diupdate");
          this.documentDialog.show = false;
          await this.getMvoDocuments(this.getDocumentMvoId());
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error updating document", "error");
      } finally {
        this.isDocumentButtonLoading = false;
      }
    },

    async deleteDocument(id) {
      if (!confirm("Apakah anda yakin ingin menghapus dokumen ini?")) return;

      const headers = this.getAuthHeaders();
      if (!headers) return;

      try {
        const response = await axios.delete(`${API_BASE}/mvo-document/${id}`, { headers });
        if (response.data.status === "success") {
          this.showSnackbar(response.data.message || "Dokumen berhasil dihapus");
          await this.getMvoDocuments(this.getDocumentMvoId());
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error deleting document", "error");
      }
    },

    // ========== IMPORT DOKUMEN VIA EXCEL ==========
    triggerImportExcel() {
      // reset agar memilih file yang sama tetap memicu @change
      if (this.$refs.excelInput) this.$refs.excelInput.value = null;
      this.$refs.excelInput?.click();
    },

    downloadImportTemplate() {
      const ws = XLSX.utils.aoa_to_sheet([
        ["Nama MVO", "Rating Star", "Range Point", "Tanggal Input", "Nama File"],
        ["Budi Santoso", 3, 100000, "2025-01-31", "Dokumen Januari"],
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template Dokumen");
      XLSX.writeFile(wb, "Template_Import_Dokumen.xlsx");
    },

    // Konversi nilai tanggal dari Excel (serial number atau string) ke 'YYYY-MM-DD'
    normalizeExcelDate(value) {
      if (value === null || value === undefined || value === "") return "";
      if (typeof value === "number" && XLSX.SSF) {
        const parsed = XLSX.SSF.parse_date_code(value);
        if (parsed) {
          const mm = String(parsed.m).padStart(2, "0");
          const dd = String(parsed.d).padStart(2, "0");
          return `${parsed.y}-${mm}-${dd}`;
        }
      }
      return String(value).trim();
    },

    async handleImportExcel(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      this.isImporting = true;
      try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

        // Pemetaan header fleksibel (case-insensitive, abaikan spasi/underscore)
        const pick = (rowObj, ...aliases) => {
          for (const key of Object.keys(rowObj)) {
            const norm = key.toString().trim().toLowerCase();
            if (aliases.includes(norm)) return rowObj[key];
          }
          return "";
        };

        const rows = json
          .map(r => ({
            nama_mvo: String(pick(r, "nama mvo", "nama_mvo", "nama", "name")).trim(),
            pointbintang: pick(r, "rating star", "pointbintang", "bintang"),
            repeat_order: pick(r, "range point", "repeat_order", "range"),
            tanggal_repeat_order: this.normalizeExcelDate(
              pick(r, "tanggal input", "tanggal_repeat_order", "tanggal")
            ),
            file_name: pick(r, "nama file", "file_name", "file"),
          }))
          .filter(r => r.nama_mvo);

        if (rows.length === 0) {
          this.showSnackbar("File tidak berisi data yang valid (kolom 'Nama MVO' wajib).", "error");
          return;
        }

        const headers = this.getAuthHeaders();
        if (!headers) return;

        const response = await axios.post(`${API_BASE}/mvo-document/import`, { rows }, { headers });
        const d = response.data;

        if (d.status === "success") {
          let msg = d.message;
          if (d.errors && d.errors.length) {
            const preview = d.errors
              .slice(0, 3)
              .map(e => `Baris ${e.row}: ${e.message}`)
              .join("; ");
            msg += ` — ${preview}`;
            if (d.errors.length > 3) msg += ` (+${d.errors.length - 3} lainnya)`;
          }
          this.showSnackbar(msg, d.failed > 0 ? "error" : "primary");
          await this.loadItems();
        } else {
          this.showSnackbar(d.message || "Import gagal", "error");
        }
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Gagal mengimpor file Excel", "error");
      } finally {
        this.isImporting = false;
        event.target.value = null;
      }
    },

    // ========== EXPORT / PRINT ==========
    exportExcel() {
      const worksheet = XLSX.utils.json_to_sheet(this.datatable.items);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data MVO dan Anggota");
      XLSX.writeFile(workbook, "Data_MVO_dan_Anggota.xlsx");
    },

    async printMvo(id) {
      const headers = this.getAuthHeaders();
      if (!headers) return;

      try {
        const response = await axios.get(`${API_BASE}/mvo/${id}/print`, {
          headers,
          responseType: "blob",
        });

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const printWindow = window.open(url, "_blank");
        if (printWindow) {
          printWindow.onload = function () { printWindow.print(); };
        }

        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        this.showSnackbar("File print berhasil dibuka");
      } catch (error) {
        this.showSnackbar(error.response?.data?.message || "Error saat print", "error");
      }
    },
  },

  created() {
    this.mvo_type_id = localStorage.getItem("mvo_type_id") || "";
    this.loadItems();
    this.getMvoTypes();
  },

  beforeUnmount() {
    if (this._searchTimer) clearTimeout(this._searchTimer);
  },

  watch: {
    searchInput(val) {
      this.expandedMobileCard = null;
      if (this._searchTimer) clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => {
        this.debouncedSearch = (val || "").trim();
        this.pagination.page = 1;
        this.loadItems();
      }, 300);
    },
  },
};
</script>

<style scoped>
.star-display {
  display: flex;
  gap: 2px;
}

.gap-2 {
  gap: 8px;
}

:deep(.v-data-table) .v-icon.mdi-star {
  font-size: 16px;
  margin: 0 1px;
}

.mobile-card-details .star-display .v-icon {
  font-size: 14px;
}

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

.top-action-bar {
  position: relative;
  z-index: 2;
  gap: 8px;
  margin-bottom: 20px;
}

.add-mvo-btn {
  background: linear-gradient(135deg, #000000, #1a1a1a);
  color: #FFD700;
  border: 2px solid #FFD700;
  border-radius: 12px;
  padding: 10px 18px;
}

:deep(.custom-data-table) {
  border: 1px solid #000000;
}

:deep(.custom-data-table .v-data-table__th) {
  background-color: #888888 !important;
  color: #FFD700 !important;
  font-weight: bold;
}

/* ===== Freeze 3 kolom terakhir (Detail, Print, Actions) ke kanan ===== */
/* Lebar tetap supaya offset freeze antar kolom akurat */
:deep(.custom-data-table table > thead > tr > th:nth-last-child(1)),
:deep(.custom-data-table table > tbody > tr > td:nth-last-child(1)),
:deep(.custom-data-table table > thead > tr > th:nth-last-child(2)),
:deep(.custom-data-table table > tbody > tr > td:nth-last-child(2)),
:deep(.custom-data-table table > thead > tr > th:nth-last-child(3)),
:deep(.custom-data-table table > tbody > tr > td:nth-last-child(3)) {
  position: sticky;
  z-index: 3;
  box-sizing: border-box;
  width: 80px;
  min-width: 80px;
  max-width: 80px;
}

/* Offset menumpuk dari kanan: Actions (0) → Print (80) → Detail (160) */
:deep(.custom-data-table table > thead > tr > th:nth-last-child(1)),
:deep(.custom-data-table table > tbody > tr > td:nth-last-child(1)) {
  right: 0;
}

:deep(.custom-data-table table > thead > tr > th:nth-last-child(2)),
:deep(.custom-data-table table > tbody > tr > td:nth-last-child(2)) {
  right: 80px;
}

:deep(.custom-data-table table > thead > tr > th:nth-last-child(3)),
:deep(.custom-data-table table > tbody > tr > td:nth-last-child(3)) {
  right: 160px;
  box-shadow: -4px 0 6px -2px rgba(0, 0, 0, 0.15);
}

/* Background opaque agar kolom yang ter-scroll tidak menembus ke belakang */
:deep(.custom-data-table table > thead > tr > th:nth-last-child(1)),
:deep(.custom-data-table table > thead > tr > th:nth-last-child(2)),
:deep(.custom-data-table table > thead > tr > th:nth-last-child(3)) {
  background-color: #888888 !important;
  z-index: 4;
}

:deep(.custom-data-table table > tbody > tr > td:nth-last-child(1)),
:deep(.custom-data-table table > tbody > tr > td:nth-last-child(2)),
:deep(.custom-data-table table > tbody > tr > td:nth-last-child(3)) {
  background-color: #ffffff !important;
}

:deep(.custom-data-table table > tbody > tr:hover > td:nth-last-child(1)),
:deep(.custom-data-table table > tbody > tr:hover > td:nth-last-child(2)),
:deep(.custom-data-table table > tbody > tr:hover > td:nth-last-child(3)) {
  background-color: #f8f9fa !important;
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
