<template>
  <v-container>
    <!-- Desktop Layout (md and up) -->
    <v-card class="d-none d-md-block">
      <v-tabs v-model="tab" bg-color="#FFD700" color="blue" slider-color="blue" class="d-none d-md-flex">
        <v-tab value="dashboard-overview">DASHBOARD OVERVIEW</v-tab>
        <v-tab value="dashboard-documents">DASHBOARD DOCUMENTS</v-tab>
        <v-tab value="dashboard-accounts">DASHBOARD AKUN</v-tab>
        <v-tab value="dashboard-regions">DASHBOARD REGIONS</v-tab>
        <v-tab value="dashboard-growth">DASHBOARD GROWTH</v-tab>
      </v-tabs>
      <v-card-text>
        <v-tabs-window v-model="tab">

          <!-- Tab Dashboard Overview Desktop -->
          <v-tabs-window-item value="dashboard-overview">
            <v-row class="mb-4">
              <!-- Card Total Pengguna -->
              <v-col cols="12" md="3">
                <v-card color="purple" dark @click="showDetailModal('all_users')" style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-account-group</v-icon>
                    <div class="text-h4">{{ dashboardData.summary?.user_total || 0 }}</div>
                    <div class="text-subtitle-1">Total Akun</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Card Total Dokumen -->
              <v-col cols="12" md="3">
                <v-card color="primary" dark @click="showDetailModal('all_documents')" style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-file-document-multiple</v-icon>
                    <div class="text-h4">{{ dashboardData.summary?.documents?.total || 0 }}</div>
                    <div class="text-subtitle-1">Total Dokumen</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Card Total Daerah -->
              <v-col cols="12" md="3">
                <v-card color="info" dark @click="showDetailModal('all_regions')" style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-map-marker-multiple</v-icon>
                    <div class="text-h4">{{ dashboardData.summary?.akun_per_daerah?.length || 0 }}</div>
                    <div class="text-subtitle-1">Total Akun Per Daerah</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Card Total MVO dengan Bawahan -->
              <!-- <v-col cols="12" md="3" v-if="hasAkunPerMVO">
                <v-card color="success" dark @click="showDetailModal('all_mvo_with_subordinates')"
                  style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-account-network</v-icon>
                    <div class="text-h4">{{ dashboardData.summary?.akun_per_mvo?.length || 0 }}</div>
                    <div class="text-subtitle-1">MVO dengan Bawahan</div>
                  </v-card-text>
                </v-card>
              </v-col> -->
            </v-row>

            <!-- Cards untuk Akun per MVO -->
            <v-row class="mb-4" v-if="hasAkunPerMVO">
              <v-col cols="12" md="4" v-for="mvo in dashboardData.summary?.akun_per_mvo || []" :key="mvo.mvo_id">
                <v-card color="teal" dark @click="showMVOSubordinatesDetail(mvo)" style="cursor: pointer;"
                  class="h-100">
                  <v-card-text class="text-center">
                    <v-icon size="40" class="mb-2">mdi-account-supervisor</v-icon>
                    <div class="text-h5">{{ mvo.mvo_nama }}</div>
                    <div class="text-caption mb-2">{{ mvo.mvo_code }}</div>
                    <v-divider class="my-2"></v-divider>
                    <div class="d-flex justify-center align-center">
                      <v-icon small class="mr-1">mdi-account-multiple</v-icon>
                      <span class="text-body-1">{{ mvo.total_bawahan }} Bawahan</span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Top 5 Bintang - tetap sama seperti sebelumnya -->
            <v-card class="mb-4">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-star</v-icon>
                Top 5 Akun Bintang Terbanyak
              </v-card-title>
              <v-card-text>
                <v-data-table :headers="topBintangHeaders" :items="dashboardData.summary?.top_5_bintang || []"
                  :loading="isLoading" item-key="mvo_id" class="elevation-1" :items-per-page="5">

                  <template v-slot:item.rank="{ index }">
                    <v-chip :color="getRankColor(index + 1)" dark size="small">
                      {{ index + 1 }}
                    </v-chip>
                  </template>

                  <template v-slot:item.mvo_name="{ item }">
                    <div class="font-weight-medium" @click="showMVODetail(item.mvo_id, item)" style="cursor: pointer;">
                      {{ item.mvo?.nama || 'N/A' }}
                    </div>
                    <div class="text-caption text-grey">
                      {{ item.mvo?.code || 'N/A' }}
                    </div>
                  </template>

                  <template v-slot:item.total_bintang="{ item }">
                    <v-chip color="amber" dark>
                      <v-icon left small>mdi-star</v-icon>
                      {{ item.total_bintang }}
                    </v-chip>
                  </template>

                </v-data-table>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>

          <!-- Tab Dashboard Documents -->
          <v-tabs-window-item value="dashboard-documents">
            <v-row class="mb-4">
              <!-- Card Total Documents -->
              <v-col cols="12" md="4">
                <v-card color="primary" dark @click="showDetailModal('all_documents')" style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-file-document-multiple</v-icon>
                    <div class="text-h4">{{ dashboardData.summary?.documents?.total || 0 }}</div>
                    <div class="text-subtitle-1">Total Documents</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Card Approved Documents -->
              <v-col cols="12" md="4">
                <v-card color="success" dark @click="showDetailModal('approved_documents')" style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-check-circle</v-icon>
                    <div class="text-h4">{{ dashboardData.summary?.documents?.approved || 0 }}</div>
                    <div class="text-subtitle-1">Approved Documents</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Card Pending Documents -->
              <v-col cols="12" md="4">
                <v-card color="orange" dark @click="showDetailModal('pending_documents')" style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-clock-outline</v-icon>
                    <div class="text-h4">{{ dashboardData.summary?.documents?.pending || 0 }}</div>
                    <div class="text-subtitle-1">Pending Documents</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Documents Statistics Chart -->
            <v-card class="mb-4">
              <v-card-title>Document Status Statistics</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="d-flex align-center mb-2">
                      <v-progress-linear :value="getDocumentPercentage('approved')" color="success" height="25" rounded
                        class="mr-3">
                        <span class="text-white font-weight-bold">{{ getDocumentPercentage('approved').toFixed(1)
                        }}%</span>
                      </v-progress-linear>
                      <span class="text-body-2">Approved</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-progress-linear :value="getDocumentPercentage('pending')" color="orange" height="25" rounded
                        class="mr-3">
                        <span class="text-white font-weight-bold">{{ getDocumentPercentage('pending').toFixed(1)
                        }}%</span>
                      </v-progress-linear>
                      <span class="text-body-2">Pending</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card flat color="grey-lighten-4" class="pa-4">
                      <div class="text-h6 mb-2">Summary</div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Total:</span>
                        <span class="font-weight-bold">{{ dashboardData.summary?.documents?.total || 0 }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Approved:</span>
                        <span class="font-weight-bold text-success">{{ dashboardData.summary?.documents?.approved || 0
                        }}</span>
                      </div>
                      <div class="d-flex justify-space-between">
                        <span>Pending:</span>
                        <span class="font-weight-bold text-orange">{{ dashboardData.summary?.documents?.pending || 0
                        }}</span>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>

          <!-- Tab Dashboard Accounts -->
          <v-tabs-window-item value="dashboard-accounts">
            <v-row class="mb-4">
              <!-- Card Total Accounts -->
              <v-col cols="12" md="4">
                <v-card color="primary" dark @click="showDetailModal('all_accounts')" style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-account-multiple</v-icon>
                    <div class="text-h4">{{ dashboardData.summary?.user_total || 0 }}</div>
                    <div class="text-subtitle-1">Total Akun</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Card Approved Accounts -->
              <v-col cols="12" md="4">
                <v-card color="success" dark @click="showDetailModal('approved_accounts')" style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-account-check</v-icon>
                    <div class="text-h4">{{ dashboardData.summary?.akun?.approved || 0 }}</div>
                    <div class="text-subtitle-1">Approved Akun</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Card Pending Accounts -->
              <v-col cols="12" md="4">
                <v-card color="orange" dark @click="showDetailModal('pending_accounts')" style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-account-clock</v-icon>
                    <div class="text-h4">{{ dashboardData.summary?.akun?.pending || 0 }}</div>
                    <div class="text-subtitle-1">Pending Akun</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Account Types -->
            <v-row class="mb-4">
              <!-- Card Distributors -->
              <v-col cols="12" md="4">
                <v-card color="success" dark @click="showDetailModal('mvo_accounts')" style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-store</v-icon>
                    <div class="text-h4">{{ dashboardData.summary?.akun?.total || 0 }}</div>
                    <div class="text-subtitle-1">MVO</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <!-- Card Distributors -->
              <v-col cols="12" md="4">
                <v-card color="cyan" dark @click="showDetailModal('distributor_accounts')" style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-store</v-icon>
                    <div class="text-h4">{{ dashboardData.summary?.akun?.distributor || 0 }}</div>
                    <div class="text-subtitle-1">Distributors</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Card Founders -->
              <v-col cols="12" md="4">
                <v-card color="purple" dark @click="showDetailModal('founder_accounts')" style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-crown</v-icon>
                    <div class="text-h4">{{ dashboardData.summary?.akun?.founder || 0 }}</div>
                    <div class="text-subtitle-1">Founders</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Account Statistics -->
            <v-card class="mb-4">
              <v-card-title>Account Status Statistics</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="8">
                    <div class="d-flex align-center mb-3">
                      <v-progress-linear :value="getAccountPercentage('approved')" color="success" height="30" rounded
                        class="mr-3">
                        <span class="text-white font-weight-bold">{{ getAccountPercentage('approved').toFixed(1)
                        }}%</span>
                      </v-progress-linear>
                      <span class="text-body-1 font-weight-medium">Approved ({{ dashboardData.summary?.akun?.approved ||
                        0
                      }})</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-progress-linear :value="getAccountPercentage('pending')" color="orange" height="30" rounded
                        class="mr-3">
                        <span class="text-white font-weight-bold">{{ getAccountPercentage('pending').toFixed(1)
                        }}%</span>
                      </v-progress-linear>
                      <span class="text-body-1 font-weight-medium">Pending ({{ dashboardData.summary?.akun?.pending || 0
                      }})</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-card flat color="grey-lighten-4" class="pa-4">
                      <div class="text-h6 mb-2">Account Types</div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>MVO:</span>
                        <span class="font-weight-bold text-cyan">{{ dashboardData.summary?.akun?.mvo || 0
                        }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Distributors:</span>
                        <span class="font-weight-bold text-cyan">{{ dashboardData.summary?.akun?.distributor || 0
                        }}</span>
                      </div>
                      <div class="d-flex justify-space-between">
                        <span>Founders:</span>
                        <span class="font-weight-bold text-purple">{{ dashboardData.summary?.akun?.founder || 0
                        }}</span>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>

          <!-- Tab Dashboard Regions -->
          <v-tabs-window-item value="dashboard-regions">
            <v-row class="mb-4">
              <!-- Card Total Regions -->
              <v-col cols="12" md="12">
                <v-card color="info" dark>
                  <v-card-text class="text-center">
                    <v-icon size="64" class="mb-3">mdi-map-marker-multiple</v-icon>
                    <div class="text-h3">{{ dashboardData.summary?.akun_per_daerah?.length || 0 }}</div>
                    <div class="text-h6">Total Regions with Akun</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Regions Table -->
            <v-card class="mb-4">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-map</v-icon>
                Akun per Region
              </v-card-title>
              <v-card-text>
                <v-data-table :headers="regionHeaders" :items="dashboardData.summary?.akun_per_daerah || []"
                  :loading="isLoading" item-key="daerah" class="elevation-1">

                  <template v-slot:item.daerah="{ item }">
                    <div class="d-flex align-center">
                      <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
                      <span class="font-weight-medium">{{ item.daerah }}</span>
                    </div>
                  </template>

                  <template v-slot:item.total="{ item }">
                    <v-chip color="primary" dark>
                      {{ item.total }}
                    </v-chip>
                  </template>

                  <template v-slot:item.percentage="{ item }">
                    <v-progress-linear :value="getRegionPercentage(item.total)" color="primary" height="20" rounded>
                      {{ getRegionPercentage(item.total).toFixed(1) }}%
                    </v-progress-linear>
                  </template>

                </v-data-table>
              </v-card-text>
            </v-card>

            <!-- Region Statistics -->
            <v-card>
              <v-card-title>Region</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col v-for="(region, index) in dashboardData.summary?.akun_per_daerah || []" :key="region.daerah"
                    cols="12" sm="6" md="4">
                    <v-card :color="getRegionColor(index)" dark flat>
                      <v-card-text class="text-center">
                        <v-icon size="40" class="mb-2">mdi-map-marker</v-icon>
                        <div class="text-h5">{{ region.total }}</div>
                        <div class="text-subtitle-1">{{ region.daerah }}</div>
                        <div class="text-caption">{{ getRegionPercentage(region.total).toFixed(1) }}% of total</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>

          <!-- Tab Dashboard Growth -->
          <v-tabs-window-item value="dashboard-growth">
            <!-- Date Filter -->
            <v-card class="mb-4">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-calendar</v-icon>
                Filter Tanggal
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="dateRange.start" label="Tanggal Mulai" type="date" variant="outlined"
                      @update:model-value="fetchGrowthData"></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="dateRange.end" label="Tanggal Akhir" type="date" variant="outlined"
                      @update:model-value="fetchGrowthData"></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Growth Cards -->
            <v-row class="mb-4">
              <!-- Total Growth Card -->
              <v-col cols="12" md="4">
                <v-card color="primary" dark @click="showDetailModal('total_growth')" style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-chart-line</v-icon>
                    <div class="text-h4">{{ getTotalGrowth() }}</div>
                    <div class="text-subtitle-1">Total Pertumbuhan</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Monthly Growth Card -->
              <!-- <v-col cols="12" md="4">
                <v-card color="success" dark @click="showDetailModal('monthly_growth')" style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-chart-bar</v-icon>
                    <div class="text-h4">{{ getMonthlyGrowth() }}</div>
                    <div class="text-subtitle-1">Pertumbuhan Bulanan</div>
                  </v-card-text>
                </v-card>
              </v-col> -->

              <!-- MVO Growth Card -->
              <v-col cols="12" md="4">
                <v-card color="warning" dark @click="showDetailModal('mvo_growth')" style="cursor: pointer;">
                  <v-card-text class="text-center">
                    <v-icon size="48" class="mb-2">mdi-account-group</v-icon>
                    <div class="text-h4">{{ getMVOGrowth() }}</div>
                    <div class="text-subtitle-1">Pertumbuhan MVO</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Growth Charts -->
            <v-row>
              <!-- Overall Growth Chart -->
              <v-col cols="12" md="6">
                <v-card class="mb-4">
                  <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2">mdi-chart-line</v-icon>
                    Grafik Pertumbuhan Keseluruhan
                  </v-card-title>
                  <v-card-text>
                    <div class="growth-chart">
                      <div v-for="(item, index) in filteredGrowthData" :key="item.bulan" class="growth-item mb-3">
                        <div class="d-flex justify-space-between align-center mb-1">
                          <span class="text-body-2">{{ formatMonth(item.bulan) }}</span>
                          <span class="text-h6 font-weight-bold">{{ item.total_anggota_baru }}</span>
                        </div>
                        <v-progress-linear
                          :model-value="(parseInt(item.total_anggota_baru) / getMaxGrowthValue()) * 100" color="primary"
                          height="20" rounded>
                          <span class="text-white text-caption">{{ item.total_anggota_baru }} anggota</span>
                        </v-progress-linear>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- MVO Growth Chart -->
              <v-col cols="12" md="6">
                <v-card class="mb-4">
                  <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2">mdi-chart-bar</v-icon>
                    Grafik Pertumbuhan per MVO
                  </v-card-title>
                  <v-card-text>
                    <div class="growth-chart">
                      <div v-for="(item, index) in filteredMVOGrowthData" :key="item.mvo_id + item.bulan"
                        class="growth-item mb-3">
                        <div class="d-flex justify-space-between align-center mb-1">
                          <div>
                            <span class="text-body-2 font-weight-medium">{{ item.mvo_nama }}</span>
                            <span class="text-caption text-grey ml-2">{{ formatMonth(item.bulan) }}</span>
                          </div>
                          <span class="text-h6 font-weight-bold">{{ item.total_bawahan_baru }}</span>
                        </div>
                        <v-progress-linear
                          :model-value="(parseInt(item.total_bawahan_baru) / getMaxMVOGrowthValue()) * 100"
                          :color="getMVOColor(index)" height="20" rounded>
                          <span class="text-white text-caption">{{ item.total_bawahan_baru }} Downline</span>
                        </v-progress-linear>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-tabs-window-item>

        </v-tabs-window>
      </v-card-text>
    </v-card>

    <!-- Mobile Layout (sm and below) -->
    <div class="d-block d-md-none">
      <!-- Mobile Header -->
      <v-card class="mb-3" elevation="3">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between mb-3">
            <h2 class="text-h5 font-weight-bold">Dashboard</h2>
            <v-btn icon @click="refreshData" :loading="isLoading" size="small">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </div>

          <!-- Quick Stats Grid -->
          <v-row dense>
            <v-col cols="6">
              <div class="text-center" @click="showDetailModal('all_users')" style="cursor: pointer;">
                <v-icon color="purple" size="24">mdi-account-group</v-icon>
                <div class="text-h6 font-weight-bold mt-1">{{ dashboardData.summary?.user_total || 0 }}</div>
                <div class="text-caption">Total Pengguna</div>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-center" @click="showDetailModal('all_documents')" style="cursor: pointer;">
                <v-icon color="primary" size="24">mdi-file-document-multiple</v-icon>
                <div class="text-h6 font-weight-bold mt-1">{{ dashboardData.summary?.documents?.total || 0 }}</div>
                <div class="text-caption">Total Documents</div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Mobile Navigation -->
      <v-chip-group v-model="mobileActiveSection" mandatory color="primary" column
        class="d-flex flex-wrap justify-center gap-2 mb-3">
        <v-chip value="overview" size="small" variant="elevated" rounded="lg">
          <v-icon start size="18">mdi-view-dashboard</v-icon>
          OVERVIEW
        </v-chip>
        <v-chip value="documents" size="small" variant="elevated" rounded="lg">
          <v-icon start size="18">mdi-file-document</v-icon>
          DOCUMENTS
        </v-chip>
        <v-chip value="accounts" size="small" variant="elevated" rounded="lg">
          <v-icon start size="18">mdi-account</v-icon>
          AKUN
        </v-chip>
        <v-chip value="regions" size="small" variant="elevated" rounded="lg">
          <v-icon start size="18">mdi-map</v-icon>
          REGIONS
        </v-chip>
        <v-chip value="growth" size="small" variant="elevated" rounded="lg">
          <v-icon start size="18">mdi-chart-line</v-icon>
          GROWTH
        </v-chip>
      </v-chip-group>

      <!-- Mobile Overview Section -->
      <div v-if="mobileActiveSection === 'overview'">
        <v-row dense>
          <!-- Card Total Pengguna - sesuai dengan desktop -->
          <!-- <v-col cols="6">
            <v-card color="purple" dark @click="showDetailModal('all_users')" style="cursor: pointer;">
              <v-card-text class="text-center pa-3">
                <v-icon size="32">mdi-account-group</v-icon>
                <div class="text-h6 mt-2">{{ dashboardData.summary?.user_total || 0 }}</div>
                <div class="text-caption">Total Akun</div>
              </v-card-text>
            </v-card>
          </v-col> -->

          <!-- Card Total Dokumen - ditambahkan -->
          <!-- <v-col cols="6">
            <v-card color="primary" dark @click="showDetailModal('all_documents')" style="cursor: pointer;">
              <v-card-text class="text-center pa-3">
                <v-icon size="32">mdi-file-document-multiple</v-icon>
                <div class="text-h6 mt-2">{{ dashboardData.summary?.documents?.total || 0 }}</div>
                <div class="text-caption">Total Dokumen</div>
              </v-card-text>
            </v-card>
          </v-col> -->

          <!-- Card Total Daerah -->
          <v-col cols="6">
            <v-card color="info" dark @click="showDetailModal('all_regions')" style="cursor: pointer;">
              <v-card-text class="text-center pa-3">
                <v-icon size="32">mdi-map-marker-multiple</v-icon>
                <div class="text-h6 mt-2">{{ dashboardData.summary?.akun_per_daerah?.length || 0 }}</div>
                <div class="text-caption">Total Akun Per Daerah</div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Card Total MVO dengan Bawahan -->
          <v-col cols="6" v-if="hasAkunPerMVO">
            <v-card color="success" dark @click="showDetailModal('all_mvo_with_subordinates')" style="cursor: pointer;">
              <v-card-text class="text-center pa-3">
                <v-icon size="32">mdi-account-network</v-icon>
                <div class="text-h6 mt-2">{{ dashboardData.summary?.akun_per_mvo?.length || 0 }}</div>
                <div class="text-caption">MVO dengan Downline</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Mobile Cards untuk Akun per MVO -->
        <div v-if="hasAkunPerMVO" class="mt-3">
          <v-card>
            <v-card-title class="pa-3">
              <v-icon class="mr-2">mdi-account-supervisor</v-icon>
              MVO dengan Downline
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list>
                <v-list-item v-for="mvo in dashboardData.summary?.akun_per_mvo || []" :key="mvo.mvo_id"
                  @click="showMVOSubordinatesDetail(mvo)" style="cursor: pointer;" class="py-3">
                  <template v-slot:prepend>
                    <v-avatar color="teal" size="40">
                      <v-icon color="white">mdi-account-supervisor</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">
                    {{ mvo.mvo_nama }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <div class="text-caption mb-1">{{ mvo.mvo_code }}</div>
                    <div class="d-flex gap-1">
                      <v-chip size="x-small" color="teal" variant="tonal">
                        {{ mvo.total_bawahan }} Downline
                      </v-chip>
                    </div>
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-icon>mdi-chevron-right</v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </div>

        <!-- Mobile Top 5 Bintang Section -->
        <v-card class="mt-3">
          <v-card-title class="pa-3">
            <v-icon class="mr-2">mdi-star</v-icon>
            Top 5 Akun Bintang
          </v-card-title>
          <v-card-text class="pa-0">
            <v-list>
              <v-list-item v-for="(item, index) in dashboardData.summary?.top_5_bintang || []" :key="item.mvo_id"
                @click="showMVODetail(item.mvo_id, item)" style="cursor: pointer;" class="py-3">
                <template v-slot:prepend>
                  <v-chip :color="getRankColor(index + 1)" dark size="small" class="mr-3">
                    {{ index + 1 }}
                  </v-chip>
                </template>

                <v-list-item-title class="font-weight-medium">
                  {{ item.mvo?.nama || 'N/A' }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <div class="text-caption mb-1">{{ item.mvo?.code || 'N/A' }}</div>
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-chip color="amber" dark size="small">
                    <v-icon left size="16">mdi-star</v-icon>
                    {{ item.total_bintang }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </div>

      <!-- Mobile Documents Section -->
      <div v-if="mobileActiveSection === 'documents'">
        <v-row dense class="mb-3">
          <v-col cols="4">
            <v-card class="text-center" @click="showDetailModal('all_documents')" style="cursor: pointer;">
              <v-card-text class="pa-2">
                <v-icon color="primary" size="20">mdi-file-document-multiple</v-icon>
                <div class="text-h6 mt-1">{{ dashboardData.summary?.documents?.total || 0 }}</div>
                <div class="text-caption">Total</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card class="text-center" @click="showDetailModal('approved_documents')" style="cursor: pointer;">
              <v-card-text class="pa-2">
                <v-icon color="success" size="20">mdi-check-circle</v-icon>
                <div class="text-h6 mt-1">{{ dashboardData.summary?.documents?.approved || 0 }}</div>
                <div class="text-caption">Approved</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card class="text-center" @click="showDetailModal('pending_documents')" style="cursor: pointer;">
              <v-card-text class="pa-2">
                <v-icon color="orange" size="20">mdi-clock-outline</v-icon>
                <div class="text-h6 mt-1">{{ dashboardData.summary?.documents?.pending || 0 }}</div>
                <div class="text-caption">Pending</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Mobile Document Progress -->
        <v-card>
          <v-card-title class="pa-3">
            <span class="text-subtitle-1">Document Status</span>
          </v-card-title>
          <v-card-text class="pa-3">
            <div class="mb-3">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-body-2">Approved</span>
                <span class="text-caption">{{ getDocumentPercentage('approved').toFixed(1) }}%</span>
              </div>
              <v-progress-linear :value="getDocumentPercentage('approved')" color="success" height="8" rounded />
            </div>
            <div>
              <div class="d-flex justify-space-between mb-1">
                <span class="text-body-2">Pending</span>
                <span class="text-caption">{{ getDocumentPercentage('pending').toFixed(1) }}%</span>
              </div>
              <v-progress-linear :value="getDocumentPercentage('pending')" color="orange" height="8" rounded />
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Mobile Accounts Section -->
      <div v-if="mobileActiveSection === 'accounts'">
        <v-row dense class="mb-3">
          <v-col cols="6">
            <!-- <v-card color="primary" dark @click="showDetailModal('all_accounts')" style="cursor: pointer;">
              <v-card-text class="text-center pa-3">
                <v-icon size="28">mdi-account-multiple</v-icon>
                <div class="text-h6 mt-2">{{ dashboardData.summary?.akun?.total || 0 }}</div>
                <div class="text-caption">Total Akun</div>
              </v-card-text>
            </v-card> -->
          </v-col>
          <v-col cols="12">
            <v-card color="info" dark @click="showDetailModal('all_users')" style="cursor: pointer;">
              <v-card-text class="text-center pa-6">
                <v-icon size="40">mdi-account-group</v-icon>
                <div class="text-h5 mt-3">{{ dashboardData.summary?.user_total || 0 }}</div>
                <div class="text-body-2 mt-1">Total Akun</div>
              </v-card-text>
            </v-card>
          </v-col>

        </v-row>

        <v-row dense class="mb-3">
          <v-col cols="6">
            <v-card class="text-center" @click="showDetailModal('approved_accounts')" style="cursor: pointer;">
              <v-card-text class="pa-2">
                <v-icon color="success" size="20">mdi-account-check</v-icon>
                <div class="text-body-1 font-weight-bold mt-1">{{ dashboardData.summary?.akun?.approved || 0 }}</div>
                <div class="text-caption">Approved</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card class="text-center" @click="showDetailModal('pending_accounts')" style="cursor: pointer;">
              <v-card-text class="pa-2">
                <v-icon color="orange" size="20">mdi-account-clock</v-icon>
                <div class="text-body-1 font-weight-bold mt-1">{{ dashboardData.summary?.akun?.pending || 0 }}</div>
                <div class="text-caption">Pending</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row dense class="mb-3">
          <v-col cols="6">
            <v-card class="text-center" @click="showDetailModal('distributor_accounts')" style="cursor: pointer;">
              <v-card-text class="pa-2">
                <v-icon color="cyan" size="20">mdi-store</v-icon>
                <div class="text-body-1 font-weight-bold mt-1">{{ dashboardData.summary?.akun?.distributor || 0 }}</div>
                <div class="text-caption">Distributors</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card class="text-center" @click="showDetailModal('founder_accounts')" style="cursor: pointer;">
              <v-card-text class="pa-2">
                <v-icon color="purple" size="20">mdi-crown</v-icon>
                <div class="text-body-1 font-weight-bold mt-1">{{ dashboardData.summary?.akun?.founder || 0 }}</div>
                <div class="text-caption">Founders</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Mobile Account Statistics -->
        <v-card>
          <v-card-title class="pa-3">Account Status</v-card-title>
          <v-card-text class="pa-3">
            <div class="mb-3">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-body-2">Approved</span>
                <span class="text-caption">{{ getAccountPercentage('approved').toFixed(1) }}%</span>
              </div>
              <v-progress-linear :value="getAccountPercentage('approved')" color="success" height="8" rounded />
            </div>
            <div>
              <div class="d-flex justify-space-between mb-1">
                <span class="text-body-2">Pending</span>
                <span class="text-caption">{{ getAccountPercentage('pending').toFixed(1) }}%</span>
              </div>
              <v-progress-linear :value="getAccountPercentage('pending')" color="orange" height="8" rounded />
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Mobile Regions Section -->
      <div v-if="mobileActiveSection === 'regions'">
        <v-card class="mb-3" color="info" dark @click="showDetailModal('all_regions')" style="cursor: pointer;">
          <v-card-text class="text-center pa-4">
            <v-icon size="48">mdi-map-marker-multiple</v-icon>
            <div class="text-h4 mt-2">{{ dashboardData.summary?.akun_per_daerah?.length || 0 }}</div>
            <div class="text-subtitle-1">Total Regions</div>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title class="pa-3">
            <v-icon class="mr-2">mdi-map</v-icon>
            Accounts per Region
          </v-card-title>
          <v-card-text class="pa-0">
            <div v-for="(region, index) in dashboardData.summary?.akun_per_daerah || []" :key="region.daerah"
              class="pa-3 border-b" style="cursor: default;" <!-- ubah cursor -->
              >
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon :color="getRegionColor(index)" class="mr-2">mdi-map-marker</v-icon>
                  <div>
                    <div class="text-body-1 font-weight-medium">{{ region.daerah }}</div>
                    <div class="text-caption text-grey">
                      {{ getRegionPercentage(region.total).toFixed(1) }}% of total
                    </div>
                  </div>
                </div>

                <v-chip :color="getRegionColor(index)" dark size="small">
                  {{ region.total }}
                </v-chip>
              </div>

              <v-progress-linear :value="getRegionPercentage(region.total)" :color="getRegionColor(index)" height="4"
                rounded class="mt-2" />
            </div>

          </v-card-text>
        </v-card>
      </div>

      <!-- Mobile Growth Section -->
      <div v-if="mobileActiveSection === 'growth'">
        <!-- Date Filter Mobile -->
        <v-card class="mb-3">
          <v-card-title class="pa-3">
            <v-icon class="mr-2">mdi-calendar</v-icon>
            Filter Tanggal
          </v-card-title>
          <v-card-text class="pa-3">
            <v-text-field v-model="dateRange.start" label="Tanggal Mulai" type="date" variant="outlined"
              density="compact" @update:model-value="fetchGrowthData" class="mb-2"></v-text-field>
            <v-text-field v-model="dateRange.end" label="Tanggal Akhir" type="date" variant="outlined" density="compact"
              @update:model-value="fetchGrowthData"></v-text-field>
          </v-card-text>
        </v-card>

        <!-- Growth Cards Mobile -->
        <v-row dense class="mb-3">
          <v-col cols="12">
            <v-card color="primary" dark @click="showDetailModal('total_growth')" style="cursor: pointer;">
              <v-card-text class="text-center pa-3">
                <v-icon size="32" class="mb-2">mdi-chart-line</v-icon>
                <div class="text-h5">{{ getTotalGrowth() }}</div>
                <div class="text-caption">Total Pertumbuhan</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row dense class="mb-3">
          <v-col cols="6">
            <v-card color="success" dark @click="showDetailModal('monthly_growth')" style="cursor: pointer;">
              <v-card-text class="text-center pa-2">
                <v-icon size="24">mdi-chart-bar</v-icon>
                <div class="text-h6 mt-1">{{ getMonthlyGrowth() }}</div>
                <div class="text-caption">Bulanan</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card color="warning" dark @click="showDetailModal('mvo_growth')" style="cursor: pointer;">
              <v-card-text class="text-center pa-2">
                <v-icon size="24">mdi-account-group</v-icon>
                <div class="text-h6 mt-1">{{ getMVOGrowth() }}</div>
                <div class="text-caption">MVO</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Growth Charts Mobile -->
        <v-card class="mb-3">
          <v-card-title class="pa-3">
            <v-icon class="mr-2">mdi-chart-line</v-icon>
            Pertumbuhan Keseluruhan
          </v-card-title>
          <v-card-text class="pa-3">
            <div v-for="(item, index) in filteredGrowthData" :key="item.bulan" class="mb-3">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-body-2">{{ formatMonth(item.bulan) }}</span>
                <span class="text-body-1 font-weight-bold">{{ item.total_anggota_baru }}</span>
              </div>
              <v-progress-linear :model-value="(parseInt(item.total_anggota_baru) / getMaxGrowthValue()) * 100"
                color="primary" height="16" rounded>
                <span class="text-white text-caption">{{ item.total_anggota_baru }}</span>
              </v-progress-linear>
            </div>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title class="pa-3">
            <v-icon class="mr-2">mdi-chart-bar</v-icon>
            Pertumbuhan per MVO
          </v-card-title>
          <v-card-text class="pa-3">
            <div v-for="(item, index) in filteredMVOGrowthData" :key="item.mvo_id + item.bulan" class="mb-3">
              <div class="d-flex justify-space-between align-center mb-1">
                <div>
                  <div class="text-body-2 font-weight-medium">{{ item.mvo_nama }}</div>
                  <div class="text-caption text-grey">{{ formatMonth(item.bulan) }}</div>
                </div>
                <span class="text-body-1 font-weight-bold">{{ item.total_bawahan_baru }}</span>
              </div>
              <v-progress-linear :model-value="(parseInt(item.total_bawahan_baru) / getMaxMVOGrowthValue()) * 100"
                :color="getMVOColor(index)" height="16" rounded>
                <span class="text-white text-caption">{{ item.total_bawahan_baru }}</span>
              </v-progress-linear>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- Detail Modal -->
    <v-dialog v-model="detailModal" max-width="90vw" fullscreen-on-mobile>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <div>
            <div class="text-h6 font-weight-bold">{{ selectedDetailTitle }}</div>
            <div class="text-caption text-grey">{{ detailData.length }} items</div>
          </div>
          <v-btn icon @click="detailModal = false" variant="text">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-0">
          <!-- Mobile List View -->
          <div class="d-block d-md-none">
            <v-list>
              <!-- Growth Data Templates -->
              <template v-if="selectedDetailType === 'total_growth' || selectedDetailType === 'monthly_growth'">
                <v-list-item v-for="item in detailData" :key="item.bulan" class="py-3">
                  <template v-slot:prepend>
                    <v-avatar color="primary" size="40">
                      <v-icon color="white">mdi-chart-line</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">
                    {{ formatMonth(item.bulan) }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    <div class="mb-1">
                      <v-chip size="x-small" color="success" variant="tonal">
                        Anggota Baru: {{ item.total_anggota_baru }}
                      </v-chip>
                    </div>
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-chip color="primary" dark size="small">
                      {{ item.total_anggota_baru }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>

              <template v-else-if="selectedDetailType === 'mvo_growth'">
                <v-list-item v-for="item in detailData" :key="item.mvo_id + item.bulan" class="py-3">
                  <template v-slot:prepend>
                    <v-avatar color="warning" size="40">
                      <v-icon color="white">mdi-account-group</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">
                    {{ item.mvo_nama }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    <div class="mb-1">
                      <v-chip size="x-small" color="info" variant="tonal">
                        {{ formatMonth(item.bulan) }}
                      </v-chip>
                    </div>
                    <div class="d-flex gap-1">
                      <v-chip size="x-small" color="success" variant="tonal">
                        Bawahan Baru: {{ item.total_bawahan_baru }}
                      </v-chip>
                    </div>
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-chip color="warning" dark size="small">
                      {{ item.total_bawahan_baru }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>

              <!-- Your existing mobile templates for other types -->
              <template v-else-if="selectedDetailType === 'all_regions'">
                <v-list-item v-for="item in detailData" :key="item.region_name" class="py-3"
                  @click="showRegionAccountsDetail(item.region_name, item)" style="cursor: pointer;">
                  <template v-slot:prepend>
                    <v-avatar color="primary" size="40">
                      <v-icon color="white">mdi-map-marker</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">
                    {{ item.region_name }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    <div class="d-flex gap-1 mb-1">
                      <v-chip size="x-small" color="primary" variant="tonal">
                        Total: {{ item.total_accounts }}
                      </v-chip>
                      <!-- <v-chip size="x-small" color="success" variant="tonal">
                        Disetujui: {{ item.approved_accounts }}
                      </v-chip>
                      <v-chip size="x-small" color="orange" variant="tonal">
                        Pending: {{ item.pending_accounts }}
                      </v-chip> -->
                    </div>
                  </v-list-item-subtitle>

                  <!-- <template v-slot:append>
                    <v-icon>mdi-chevron-right</v-icon>
                  </template> -->
                </v-list-item>
              </template>

              <!-- TAMBAHKAN INI: Penanganan khusus untuk akun MVO saja -->
              <template v-else-if="selectedDetailType === 'mvo_accounts_only'">
                <v-list-item v-for="item in detailData" :key="item.mvo_id" class="py-3" style="cursor: pointer;">
                  <template v-slot:prepend>
                    <v-avatar color="success" size="40">
                      <v-icon color="white">mdi-account</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">
                    {{ item.nama || item.mvo?.nama || 'N/A' }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    <div class="mb-1">
                      <v-chip size="x-small" color="info" variant="tonal">
                        Kode: {{ item.code || item.mvo?.code || 'N/A' }}
                      </v-chip>
                    </div>
                    <div class="d-flex gap-1">
                      <v-chip size="x-small" :color="getMvoTypeColor(item.mvo_type_id)" variant="tonal">
                        {{ getMvoTypeName(item.mvo_type_id) }}
                      </v-chip>
                      <v-chip size="x-small" :color="getStatusColor(item.status_inputan)" variant="tonal">
                        {{ getStatusText(item.status_inputan) }}
                      </v-chip>
                    </div>
                    <div class="text-caption mt-1">
                      {{ item.daerah || 'N/A' }} • {{ formatDate(item.tgl_lahir) }}
                    </div>
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <div class="text-center">
                      <v-chip size="small" :color="getClassColor(item.class_member)" dark>
                        {{ item.class_member || 'N/A' }}
                      </v-chip>
                    </div>
                  </template>
                </v-list-item>
              </template>

              <!-- Template untuk tipe akun lainnya -->
              <template v-else-if="isAccountType(selectedDetailType)">
                <v-list-item v-for="item in detailData" :key="item.mvo_id" class="py-3" style="cursor: pointer;">
                  <template v-slot:prepend>
                    <v-avatar :color="getMvoTypeColor(item.mvo_type_id)" size="40">
                      <v-icon color="white">{{ getMvoTypeIcon(item.mvo_type_id) }}</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">
                    {{ item.nama || 'N/A' }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    <div class="mb-1">
                      <v-chip size="x-small" color="info" variant="tonal">
                        Kode: {{ item.code || 'N/A' }}
                      </v-chip>
                    </div>
                    <div class="d-flex gap-1">
                      <v-chip size="x-small" :color="getMvoTypeColor(item.mvo_type_id)" variant="tonal">
                        {{ getMvoTypeName(item.mvo_type_id) }}
                      </v-chip>
                      <v-chip size="x-small" :color="getStatusColor(item.status_inputan)" variant="tonal">
                        {{ getStatusText(item.status_inputan) }}
                      </v-chip>
                    </div>
                    <div class="text-caption mt-1">
                      {{ item.daerah || 'N/A' }} • {{ formatDate(item.tgl_lahir) }}
                    </div>
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <div class="text-center">
                      <v-chip size="small" :color="getClassColor(item.class_member)" dark>
                        {{ item.class_member || 'N/A' }}
                      </v-chip>
                    </div>
                  </template>
                </v-list-item>
              </template>

              <!-- Template untuk tipe dokumen -->
              <template v-else-if="isDocumentType(selectedDetailType)">
                <v-list-item v-for="item in detailData" :key="item.id" class="py-3" style="cursor: pointer;">
                  <template v-slot:prepend>
                    <v-avatar color="primary" size="40">
                      <v-icon color="white">mdi-file-document</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">
                    {{ item.nama_file || item.file_name || item.nama || item.name || item.title || 'Document #' +
                      item.id }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    <div class="d-flex gap-1 mb-1">
                      <v-chip size="x-small" :color="getStatusColor(item.status_inputan)" variant="tonal">
                        {{ getStatusText(item.status_inputan) }}
                      </v-chip>
                      <v-chip size="x-small" color="amber" variant="tonal">
                        <v-icon left size="12">mdi-star</v-icon>
                        {{ item.pointbintang || 0 }}
                      </v-chip>
                    </div>
                    <div class="text-caption" v-if="item.mvo">
                      MVO: {{ item.mvo?.nama || 'N/A' }}
                    </div>
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <v-btn icon size="small" @click="showImage(item.foto_ktp)" v-if="item.foto_ktp">
                      <v-icon size="20">mdi-image</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </template>

              <!-- Template untuk tipe user -->
              <template v-else-if="selectedDetailType === 'all_users'">
                <v-list-item v-for="item in detailData" :key="item.id" class="py-3" style="cursor: pointer;">
                  <template v-slot:prepend>
                    <v-avatar color="purple" size="40">
                      <v-icon color="white">mdi-account-group</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">
                    {{ item.name || item.username || 'N/A' }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    <div class="mb-1">
                      <v-chip size="x-small" color="info" variant="tonal">
                        Email: {{ item.email || 'N/A' }}
                      </v-chip>
                    </div>
                    <div class="d-flex gap-1">
                      <v-chip size="x-small" color="primary" variant="tonal">
                        Role: {{ item.role || 'N/A' }}
                      </v-chip>
                      <v-chip size="x-small" :color="item.is_active ? 'success' : 'error'" variant="tonal">
                        {{ item.is_active ? 'Aktif' : 'Tidak Aktif' }}
                      </v-chip>
                    </div>
                    <div class="text-caption mt-1">
                      Terdaftar: {{ formatDate(item.created_at) }}
                    </div>
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-list>
          </div>

          <!-- Desktop Table View -->
          <div class="d-none d-md-block">
            <!-- Growth Data Tables -->
            <v-data-table v-if="selectedDetailType === 'total_growth' || selectedDetailType === 'monthly_growth'"
              :headers="growthHeaders" :items="detailData" :loading="isLoadingDetail" class="elevation-0"
              :items-per-page="10">
              <template v-slot:item.bulan="{ item }">
                <div class="font-weight-medium">
                  {{ formatMonth(item.bulan) }}
                </div>
              </template>

              <template v-slot:item.total_anggota_baru="{ item }">
                <v-chip color="primary" dark>
                  {{ item.total_anggota_baru }}
                </v-chip>
              </template>
            </v-data-table>

            <v-data-table v-else-if="selectedDetailType === 'mvo_growth'" :headers="mvoGrowthHeaders"
              :items="detailData" :loading="isLoadingDetail" class="elevation-0" :items-per-page="10">
              <template v-slot:item.mvo_nama="{ item }">
                <div class="font-weight-medium">
                  {{ item.mvo_nama }}
                </div>
              </template>

              <template v-slot:item.bulan="{ item }">
                <div class="text-body-2">
                  {{ formatMonth(item.bulan) }}
                </div>
              </template>

              <template v-slot:item.total_bawahan_baru="{ item }">
                <v-chip color="warning" dark>
                  {{ item.total_bawahan_baru }}
                </v-chip>
              </template>
            </v-data-table>

            <!-- Your existing tables for other types -->
            <v-data-table v-else-if="selectedDetailType === 'all_regions'" :headers="regionSummaryHeaders"
              :items="detailData" :loading="isLoadingDetail" class="elevation-0" :items-per-page="10">
              <template v-slot:item.region_name="{ item }">
                <div class="d-flex align-center">
                  <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
                  <span class="font-weight-medium cursor-pointer text-primary"
                    @click="showRegionAccountsDetail(item.region_name, item)" style="cursor: pointer;">
                    {{ item.region_name }}
                  </span>
                </div>
              </template>

              <template v-slot:item.total_accounts="{ item }">
                <v-chip color="primary" dark>
                  {{ item.total_accounts }}
                </v-chip>
              </template>

              <template v-slot:item.approved_accounts="{ item }">
                <v-chip color="success" dark size="small">
                  {{ item.approved_accounts }}
                </v-chip>
              </template>

              <template v-slot:item.pending_accounts="{ item }">
                <v-chip color="orange" dark size="small">
                  {{ item.pending_accounts }}
                </v-chip>
              </template>
            </v-data-table>

            <!-- Regular table for other types -->
            <v-data-table v-else :headers="getDetailHeaders()" :items="detailData" :loading="isLoadingDetail"
              class="elevation-0" :items-per-page="10">
              <template v-slot:item.mvo_type="{ item }" v-if="isAccountType(selectedDetailType)">
                <v-chip :color="getMvoTypeColor(item.mvo_type_id)" dark size="small">
                  {{ getMvoTypeName(item.mvo_type_id) }}
                </v-chip>
              </template>

              <template v-slot:item.status_inputan="{ item }">
                <v-chip :color="getStatusColor(item.status_inputan)" dark size="small">
                  {{ getStatusText(item.status_inputan) }}
                </v-chip>
              </template>

              <template v-slot:item.class_member="{ item }" v-if="isAccountType(selectedDetailType)">
                <v-chip :color="getClassColor(item.class_member)" dark size="small">
                  {{ item.class_member || 'N/A' }}
                </v-chip>
              </template>

              <template v-slot:item.tgl_lahir="{ item }" v-if="isAccountType(selectedDetailType)">
                {{ formatDate(item.tgl_lahir) }}
              </template>

              <template v-slot:item.pointbintang="{ item }" v-if="isDocumentType(selectedDetailType)">
                <v-chip color="amber" dark size="small">
                  <v-icon left size="16">mdi-star</v-icon>
                  {{ item.pointbintang }}
                </v-chip>
              </template>
            </v-data-table>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- MVO Detail Modal -->
    <v-dialog v-model="mvoDetailModal" max-width="90vw" fullscreen-on-mobile>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <div>
            <div class="text-h6 font-weight-bold">Akun Detail</div>
            <div class="text-caption text-grey">ID: {{ selectedMVOId }}</div>
          </div>
          <v-btn icon @click="mvoDetailModal = false" variant="text">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <v-row v-if="selectedMVOData" class="mb-4">
            <v-col cols="12" sm="4">
              <v-card color="primary" dark elevation="2">
                <v-card-text class="text-center pa-4">
                  <v-icon size="40" class="mb-2">mdi-star</v-icon>
                  <div class="text-h4">{{ selectedMVOData.total_bintang || selectedMVOData.total_stars || 0 }}</div>
                  <div class="text-subtitle-2">Total Bintang</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-card class="mb-4" v-if="selectedMVOData?.mvo">
            <v-card-title class="pa-3">
              <v-icon left>mdi-account</v-icon>
              Informasi MVO
            </v-card-title>
            <v-card-text class="pa-3">
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="text-body-2 text-grey mb-1">Nama:</div>
                  <div class="text-body-1 font-weight-medium">{{ selectedMVOData.mvo.nama || 'N/A' }}</div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="text-body-2 text-grey mb-1">Code:</div>
                  <div class="text-body-1 font-weight-medium">{{ selectedMVOData.mvo.code || 'N/A' }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Image Viewer Modal -->
    <v-dialog v-model="imageModal" max-width="90vw">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span class="text-h6">Preview Image</span>
          <v-btn icon @click="imageModal = false" variant="text">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="text-center pa-4">
          <v-img :src="selectedImageUrl" max-height="70vh" contain class="rounded" :alt="'Document image'">
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>
            </template>
            <template v-slot:error>
              <div class="d-flex align-center justify-center fill-height text-grey">
                <div class="text-center">
                  <v-icon size="64" class="mb-2">mdi-image-broken-variant</v-icon>
                  <div>Image could not be loaded</div>
                </div>
              </div>
            </template>
          </v-img>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Loading Overlay -->
    <v-overlay v-model="isLoading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
    </v-overlay>

  </v-container>
</template>

<script>
import axios from "axios";
import Cookies from "js-cookie";
export default {
  data() {
    return {
      tab: "dashboard-overview",
      mobileActiveSection: "overview",
      isLoading: false,
      isLoadingDetail: false,

      // Date range for growth data
      dateRange: {
        start: this.getDefaultStartDate(),
        end: this.getDefaultEndDate()
      },

      dashboardData: {
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
          top_5_bintang: [],
          grafik_pertumbuhan: [],
          grafik_pertumbuhan_per_mvo: [],
          akun_per_mvo: []
        }
      },

      mvoRawData: [],
      documentRawData: [],

      detailData: [],
      detailModal: false,
      mvoDetailModal: false,
      imageModal: false,
      selectedDetailType: '',
      selectedDetailTitle: '',
      selectedMVOId: null,
      selectedMVOData: null,
      selectedImageUrl: '',

      mvoWithSubordinatesHeaders: [
        { title: "Nama MVO", key: "mvo_nama" },
        { title: "Kode MVO", key: "mvo_code" },
        { title: "Total Bawahan", key: "total_bawahan", align: "center" },
        { title: "Aksi", key: "actions", align: "center", sortable: false },
      ],

      mvoSubordinatesHeaders: [
        { title: "Nama Bawahan", key: "nama" },
        { title: "Kode", key: "code" },
        // { title: "ID", key: "id", align: "center" },
      ],
      // Headers for growth tables
      growthHeaders: [
        { title: "Bulan", key: "bulan" },
        { title: "Total Anggota Baru", key: "total_anggota_baru", align: "center" },
      ],

      mvoGrowthHeaders: [
        { title: "Nama MVO", key: "mvo_nama" },
        { title: "Bulan", key: "bulan" },
        { title: "Total Bawahan Baru", key: "total_bawahan_baru", align: "center" },
      ],

      regionSummaryHeaders: [
        { title: "Region", key: "region_name" },
        { title: "Total Akun Per daerah", key: "total_accounts", align: "center" },
      ],
      topBintangHeaders: [
        { title: "Rank", key: "rank", align: "center", width: "80px" },
        { title: "Akun Details", key: "mvo_name" },
        { title: "Total Bintang", key: "total_bintang", align: "center" },
      ],

      regionHeaders: [
        { title: "Region", key: "daerah" },
        { title: "Total Accounts", key: "total", align: "center" },
        { title: "Percentage", key: "percentage", align: "center" },
      ],

      mvoHeaders: [
        { title: "Code", key: "code" },
        { title: "Nama", key: "nama" },
        { title: "Nama Panggilan", key: "nama_panggilan" },
        { title: "Nomor ID", key: "nomor_id" },
        { title: "NIK", key: "nik" },
        { title: "Tempat Lahir", key: "tempat_lahir" },
        { title: "Tgl Lahir", key: "tgl_lahir" },
        { title: "Class", key: "class_member", align: "center" },
        { title: "Alamat", key: "alamat" },
        { title: "No HP", key: "nohp" },
        { title: "Sosmed", key: "sosmed" },
        { title: "Jaringan MVO", key: "jaringan_mvo" },
        { title: "Level", key: "level", align: "center" },
        { title: "Status", key: "status_inputan", align: "center" },
      ],

      documentHeaders: [
        { title: "Nama File", key: "file_name" },
        { title: "Bintang", key: "pointbintang", align: "center" },
        { title: "Status", key: "status_inputan", align: "center" },
      ],
    };
  },

  computed: {
    hasAkunPerMVO() {
      return this.dashboardData.summary?.akun_per_mvo &&
        this.dashboardData.summary.akun_per_mvo.length > 0;
    },
    // Filter growth data based on date range
    filteredGrowthData() {
      if (!this.dashboardData.summary?.grafik_pertumbuhan) return [];

      return this.dashboardData.summary.grafik_pertumbuhan.filter(item => {
        const itemDate = new Date(item.bulan + '-01');
        const startDate = new Date(this.dateRange.start);
        const endDate = new Date(this.dateRange.end);

        return itemDate >= startDate && itemDate <= endDate;
      });
    },

    // Filter MVO growth data based on date range
    filteredMVOGrowthData() {
      if (!this.dashboardData.summary?.grafik_pertumbuhan_per_mvo) return [];

      return this.dashboardData.summary.grafik_pertumbuhan_per_mvo.filter(item => {
        const itemDate = new Date(item.bulan + '-01');
        const startDate = new Date(this.dateRange.start);
        const endDate = new Date(this.dateRange.end);

        return itemDate >= startDate && itemDate <= endDate;
      });
    }
  },

  created() {
    this.fetchDashboardData();
  },

  methods: {
    getDefaultStartDate() {
      const date = new Date();
      date.setMonth(date.getMonth() - 6); // Default to 6 months ago
      return date.toISOString().split('T')[0];
    },

    getDefaultEndDate() {
      return new Date().toISOString().split('T')[0];
    },

    getMVOOnlyCount() {
      return this.mvoRawData.filter(item => item.mvo_type_id === "1").length;
    },

    async fetchDashboardData() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.isLoading = true;
      try {
        const dashboardResponse = await axios.get(
          "https://babaapi.babaparfume.id/api/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (dashboardResponse.data && dashboardResponse.data.status === "success") {
          this.dashboardData = dashboardResponse.data.data;
          console.log("Dashboard data fetched:", this.dashboardData);
        }

        const mvoResponse = await axios.get(
          "https://babaapi.babaparfume.id/api/mvo",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (mvoResponse.data && mvoResponse.data.status === "success") {
          this.mvoRawData = mvoResponse.data.data;
        }

        const documentResponse = await axios.get(
          "https://babaapi.babaparfume.id/api/mvo-document",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (documentResponse.data && documentResponse.data.status === "success") {
          this.documentRawData = documentResponse.data.data;
        }

        console.log("Dashboard data loaded:", this.dashboardData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        this.$nextTick(() => {
          console.log("Error loading dashboard data. Please try again.");
        });
      } finally {
        this.isLoading = false;
      }
    },

    // Growth data methods
    fetchGrowthData() {
      // This method is called when date range changes
      // In a real implementation, you might want to refetch data from API
      // For now, we'll just use the computed properties to filter existing data
      console.log('Date range changed:', this.dateRange);
    },

    getTotalGrowth() {
      return this.filteredGrowthData.reduce((total, item) => total + parseInt(item.total_anggota_baru || 0), 0);
    },

    getMonthlyGrowth() {
      return this.filteredGrowthData.length;
    },

    getMVOGrowth() {
      return this.filteredMVOGrowthData.reduce((total, item) => total + parseInt(item.total_bawahan_baru || 0), 0);
    },

    getMaxGrowthValue() {
      const values = this.filteredGrowthData.map(item => parseInt(item.total_anggota_baru || 0));
      return Math.max(...values, 1); // Ensure at least 1 to avoid division by zero
    },

    getMaxMVOGrowthValue() {
      const values = this.filteredMVOGrowthData.map(item => parseInt(item.total_bawahan_baru || 0));
      return Math.max(...values, 1); // Ensure at least 1 to avoid division by zero
    },

    formatMonth(monthString) {
      if (!monthString) return '';
      const [year, month] = monthString.split('-');
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    },

    getMVOColor(index) {
      const colors = ["primary", "success", "info", "warning", "error", "purple", "cyan", "teal"];
      return colors[index % colors.length];
    },

    showRegionDetail(regionName, regionData) {
      console.log('Showing region detail:', regionName, regionData);

      // Filter accounts by region
      const regionAccounts = this.mvoRawData.filter(account => {
        // Adjust these conditions based on your actual data structure
        return account.daerah === regionName ||
          account.region === regionName ||
          account.alamat?.includes(regionName);
      });

      this.selectedDetailType = 'region_accounts';
      this.selectedDetailTitle = `Akun di ${regionName} (${regionData.total} akun)`;
      this.detailData = regionAccounts;
      this.detailModal = true;
    },

    showDetailModal(type) {
      this.selectedDetailType = type;
      this.selectedDetailTitle = this.getDetailTitle(type);
      this.isLoadingDetail = true;

      // Add a small delay to show loading state
      setTimeout(() => {
        this.detailData = this.filterDataByType(type);
        this.isLoadingDetail = false;
        this.detailModal = true;

        // Debug logging
        console.log('Detail Modal Type:', type);
        console.log('Detail Data Count:', this.detailData.length);
        console.log('Detail Data Sample:', this.detailData.slice(0, 3));
      }, 100);
    },

    showMVODetail(mvoId, mvoData = null) {
      this.selectedMVOId = mvoId;
      this.selectedMVOData = mvoData || this.findMVOData(mvoId);
      this.mvoDetailModal = true;
    },

    findMVOData(mvoId) {
      let mvoData = this.dashboardData.summary?.top_5_bintang?.find(item => item.mvo_id === mvoId);

      if (!mvoData) {
        const mvoInfo = this.mvoRawData.find(item => item.id == mvoId);
        const mvoDocuments = this.documentRawData.filter(item => item.mvo_id == mvoId);
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
    },

    filterDataByType(type) {
      console.log('Filtering data for type:', type);
      console.log('Available mvoRawData:', this.mvoRawData.length);
      console.log('Available documentRawData:', this.documentRawData.length);

      let filteredData = [];

      switch (type) {
        case 'all_mvo_with_subordinates':
          filteredData = this.dashboardData.summary?.akun_per_mvo || [];
          break;
        case 'all_accounts':
          filteredData = [...this.mvoRawData];
          break;

        case 'mvo_accounts_only':
          filteredData = this.mvoRawData.filter(item => item.mvo_type_id === "1");
          break;

        case 'all_users':
          // Show all accounts as "users"
          filteredData = [...this.mvoRawData];
          break;

        case 'approved_accounts':
          filteredData = this.mvoRawData.filter(item => item.status_inputan === "approved");
          break;

        case 'pending_accounts':
          filteredData = this.mvoRawData.filter(item =>
            item.status_inputan === null ||
            item.status_inputan === "pending" ||
            item.status_inputan === undefined
          );
          break;

        case 'distributor_accounts':
          // Filter untuk distributor berdasarkan kode yang dimulai dengan "DIST-"
          filteredData = this.mvoRawData.filter(item =>
            item.code && item.code.startsWith('DIST-')
          );
          break;

        case 'mvo_accounts':
          // Filter untuk MVO accounts berdasarkan kode yang dimulai dengan "MVO-"
          filteredData = this.mvoRawData.filter(item =>
            item.code && item.code.startsWith('MVO-')
          );
          break;

        case 'founder_accounts':
          // Filter untuk founder berdasarkan kode yang dimulai dengan "FQ-"
          filteredData = this.mvoRawData.filter(item =>
            item.code && item.code.startsWith('FO-')
          );
          break;

        case 'all_documents':
          filteredData = [...this.documentRawData];
          break;

        case 'approved_documents':
          filteredData = this.documentRawData.filter(item => item.status_inputan === "approved");
          break;

        case 'pending_documents':
          filteredData = this.documentRawData.filter(item =>
            item.status_inputan === null ||
            item.status_inputan === "pending" ||
            item.status_inputan === undefined
          );
          break;

        case 'all_regions':
          // Show region summary with accounts grouped by region
          filteredData = this.getRegionSummaryData();
          break;

        // Growth data types
        case 'total_growth':
        case 'monthly_growth':
          filteredData = this.filteredGrowthData;
          break;

        case 'mvo_growth':
          filteredData = this.filteredMVOGrowthData;
          break;

        default:
          filteredData = [];
          break;
      }

      console.log('Filtered data count:', filteredData.length);
      console.log('Filtered data samples:', filteredData.slice(0, 3));
      return filteredData;
    },

    getRegionSummaryData() {
      const regionSummary = [];
      const regions = this.dashboardData.summary?.akun_per_daerah || [];

      regions.forEach(region => {
        // Find all accounts in this region
        const accountsInRegion = this.mvoRawData.filter(account => {
          // You'll need to adjust this based on your actual data structure
          // Common field names might be: daerah, region, alamat, province, etc.
          return account.daerah === region.daerah ||
            account.region === region.daerah ||
            account.province === region.daerah ||
            account.alamat?.includes(region.daerah);
        });

        // Create a summary entry for each region
        regionSummary.push({
          id: region.daerah, // Use region name as ID
          region_name: region.daerah,
          total_accounts: region.total,
          actual_accounts: accountsInRegion.length,
          accounts: accountsInRegion,
          // Add additional summary info
          approved_accounts: accountsInRegion.filter(acc => acc.status_inputan === "approved").length,
          pending_accounts: accountsInRegion.filter(acc =>
            acc.status_inputan === null ||
            acc.status_inputan === "pending" ||
            acc.status_inputan === undefined
          ).length
        });
      });

      return regionSummary;
    },

    getRegionAccountDetails() {
      const regionAccounts = [];
      const regions = this.dashboardData.summary?.akun_per_daerah || [];

      regions.forEach(region => {
        // Find all accounts in this region
        const accountsInRegion = this.mvoRawData.filter(account => {
          // Assuming you have a field that matches region
          // Adjust the field name according to your data structure
          return account.daerah === region.daerah ||
            account.region === region.daerah ||
            account.alamat?.includes(region.daerah);
        });

        // Add region info to each account
        accountsInRegion.forEach(account => {
          regionAccounts.push({
            ...account,
            region_name: region.daerah,
            region_total: region.total
          });
        });
      });

      return regionAccounts;
    },

    getDetailTitle(type) {
      const titles = {
        'all_mvo_with_subordinates': 'Semua MVO dengan Bawahan',
        'mvo_subordinates_detail': 'Detail Bawahan MVO',
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
        'region_accounts': 'Akun per Region',
        'total_growth': 'Total Pertumbuhan Anggota',
        'monthly_growth': 'Pertumbuhan Bulanan',
        'mvo_growth': 'Pertumbuhan per MVO'
      };
      return titles[type] || 'Detail';
    },
    showMVOSubordinatesDetail(mvoData) {
      this.selectedDetailType = 'mvo_subordinates_detail';
      this.selectedDetailTitle = `Bawahan ${mvoData.mvo_nama}`;
      this.selectedMVOData = mvoData;
      this.detailData = mvoData.bawahan || [];
      this.detailModal = true;

      console.log('Detail Data:', this.detailData); // Debug
    },

    getDetailHeaders() {
      if (this.selectedDetailType === 'all_regions') {
        return this.regionSummaryHeaders;
      } else if (this.selectedDetailType === 'total_growth' || this.selectedDetailType === 'monthly_growth') {
        return this.growthHeaders;
      } else if (this.selectedDetailType === 'mvo_growth') {
        return this.mvoGrowthHeaders;
      } else if (this.selectedDetailType === 'mvo_subordinates_detail') {
        // ✅ INI YANG HARUS DITAMBAHKAN - return headers sederhana
        return this.mvoSubordinatesHeaders;
      } else if (this.isAccountType(this.selectedDetailType) ||
        this.selectedDetailType === 'region_accounts') {
        return this.mvoHeaders;
      } else if (this.isDocumentType(this.selectedDetailType)) {
        return this.documentHeaders;
      }
      return this.mvoHeaders;
    },

    isAccountType(type) {
      return type.includes('account') ||
        type.includes('distributor') ||
        type.includes('founder') ||
        type.includes('users') ||
        type.includes('region');
    },

    isDocumentType(type) {
      return type.includes('document');
    },

    getRankColor(rank) {
      switch (rank) {
        case 1: return "amber";
        case 2: return "grey";
        case 3: return "orange";
        default: return "blue";
      }
    },

    getRegionColor(index) {
      const colors = ["primary", "success", "info", "warning", "error", "purple", "cyan", "teal"];
      return colors[index % colors.length];
    },

    getMvoTypeName(typeId) {
      switch (typeId) {
        case "1": return "MVO";
        case "3": return "DISTRIBUTOR";
        case "4": return "FOUNDER";
        default: return "UNKNOWN";
      }
    },

    getMvoTypeColor(typeId) {
      switch (typeId) {
        case "1": return "primary";
        case "3": return "cyan";
        case "4": return "purple";
        default: return "grey";
      }
    },

    getMvoTypeIcon(typeId) {
      switch (typeId) {
        case "1": return "mdi-account";
        case "3": return "mdi-store";
        case "4": return "mdi-crown";
        default: return "mdi-account";
      }
    },

    getStatusColor(status) {
      if (status === "approved") return "success";
      if (status === null || status === "pending") return "orange";
      return "grey";
    },

    getStatusText(status) {
      if (status === "approved") return "Approved";
      if (status === null) return "Belum Approve";
      if (status === "pending") return "Pending";
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
    },

    getClassColor(classType) {
      if (!classType) return "grey";
      switch (classType.toUpperCase()) {
        case "GOLD": return "amber";
        case "SILVER": return "blue-grey";
        case "BRONZE": return "brown";
        default: return "grey";
      }
    },

    getDocumentPercentage(type) {
      const total = this.dashboardData.summary?.documents?.total || 0;
      if (total === 0) return 0;

      const value = this.dashboardData.summary?.documents?.[type] || 0;
      return (value / total) * 100;
    },

    getAccountPercentage(type) {
      const total = this.dashboardData.summary?.akun?.total || 0;
      if (total === 0) return 0;

      const value = this.dashboardData.summary?.akun?.[type] || 0;
      return (value / total) * 100;
    },

    getRegionPercentage(regionTotal) {
      const totalAccounts = this.dashboardData.summary?.akun?.total || 0;
      if (totalAccounts === 0) return 0;

      return (parseInt(regionTotal) / totalAccounts) * 100;
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    async refreshData() {
      this.isLoading = true;
      try {
        await this.fetchDashboardData();
        console.log('Data refreshed successfully');
        console.log('MVO Data Count:', this.mvoRawData.length);
        console.log('Document Data Count:', this.documentRawData.length);
      } catch (error) {
        console.error('Error refreshing data:', error);
      } finally {
        this.isLoading = false;
      }
    }
  },
};
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.v-card[style*="cursor: pointer"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.mobile-dashboard {
  max-width: 100%;
  overflow-x: hidden;
}

.mobile-header {
  border-radius: 16px;
  background: linear-gradient(135deg, #1a1a1a, #FFD700);
  color: white;
}

.mobile-stat-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.mobile-stat-card:active {
  transform: scale(0.98);
}

.mobile-mini-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-mini-card:active {
  transform: scale(0.95);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.mobile-performers {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mobile-performer-item {
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.02);
  margin-bottom: 4px;
  transition: background 0.2s ease;
}

.mobile-performer-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.mobile-progress-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mobile-types-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mobile-region-header {
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  background: #ffffff;
}

.mobile-regions-list {
  max-height: 60vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  background: #ffffff;
}

.mobile-regions-list::-webkit-scrollbar {
  width: 4px;
}

.mobile-regions-list::-webkit-scrollbar-track {
  background: transparent;
}

.mobile-regions-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.mobile-region-item {
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  background: #ffffff;
}

.mobile-region-item:active {
  transform: scale(0.98);
}

/* Hide desktop elements on mobile */
@media (max-width: 959px) {
  .d-none.d-md-block {
    display: none !important;
  }

  .d-block.d-md-none {
    display: block !important;
  }
}

/* Show desktop elements on desktop */
@media (min-width: 960px) {
  .d-none.d-md-block {
    display: block !important;
  }

  .d-block.d-md-none {
    display: none !important;
  }
}

/* Enhanced mobile typography */
@media (max-width: 600px) {
  .mobile-dashboard .text-h4 {
    font-size: 1.8rem;
  }

  .mobile-dashboard .text-h5 {
    font-size: 1.4rem;
  }

  .mobile-dashboard .text-h6 {
    font-size: 1.1rem;
  }

  .mobile-section {
    padding: 0 4px;
  }
}

.text-cyan {
  color: #00bcd4 !important;
}

.text-purple {
  color: #9c27b0 !important;
}

.text-orange {
  color: #ff9800 !important;
}
</style>