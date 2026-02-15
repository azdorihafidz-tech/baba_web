<template>
  <Breadcrumb :items="itemsBreadcrumb" />

  <!-- Tombol Tambah User -->
  <div class="mb-4">
    <v-btn class="text-dark font-semibold" @click="showDialogFormAddUser()" style="
    background: linear-gradient(135deg, #000000, #1a1a1a);
    color: #FFD700;
    border: 2px solid #FFD700;
    border-radius: 12px;
    padding: 10px 18px;
  ">
      <v-icon start style="color: #FFD700;">mdi-account-plus</v-icon>
      <span class="ml-2">Tambah User</span>
    </v-btn>
  </div>

  <!-- Desktop View - Data Table -->
  <div class="d-none d-md-block">
    <CardDataTable :title="title">
      <!-- Search -->
      <template v-slot:search>
        <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Search" single-line
          hide-details variant="outlined" class="search-field" />
      </template>

      <!-- Data Table -->
      <template v-slot:datatable>
        <v-data-table class="bg-grey-lighten-4 text-no-wrap" hover :headers="datatable.headers" :items="datatable.items"
          :search="datatable.search" :loading="isTableLoading" :items-per-page="10"
          @update:options="updateCurrentpageInfo">
          <!-- DISTRIBUTOR -->
          <template v-slot:item.upline_6="{ item }">
            {{ getNamaAfterStrip(item.upline_6) || '-' }}
          </template>

          <!-- SUPPLIER -->
          <template v-slot:item.upline_5="{ item }">
            {{ getNamaAfterStrip(item.upline_5) || '-' }}
          </template>

          <!-- GM -->
          <template v-slot:item.upline_4="{ item }">
            {{ getNamaAfterStrip(item.upline_4) || '-' }}
          </template>

          <!-- FOUNDER -->
          <template v-slot:item.upline_3="{ item }">
            {{ getNamaAfterStrip(item.upline_3) || '-' }}
          </template>

          <!-- REGIONAL -->
          <template v-slot:item.upline_2="{ item }">
            {{ getNamaAfterStrip(item.upline_2) || '-' }}
          </template>

          <!-- MVO -->
          <template v-slot:item.upline_1="{ item }">
            {{ getNamaAfterStrip(item.upline_1) || '-' }}
          </template>

          <!-- Kolom Nomor Urut -->
          <template v-slot:item.no="{ index }">
            {{ ((currentPage - 1) * itemsPerPage) + index + 1 }}
          </template>
          <!-- KOLOM BINTANG -->
          <template v-slot:item.jlh_bintang="{ item }">
            <div>
              <v-icon v-for="n in Number(item.jlh_bintang)" :key="n" color="amber" size="18">
                mdi-star
              </v-icon>
            </div>
          </template>

          <!-- Kolom mvo_type_id -->
          <template v-slot:item.mvo_type_id="{ item }">
            <v-chip :color="getAuthorityColor(item.mvo_type_id)" :text-color="getAuthorityTextColor(item.mvo_type_id)"
              size="small" variant="flat">
              {{ item.mvo_type_id ? item.mvo_type_id.toUpperCase() : '-' }}
            </v-chip>
          </template>

          <!-- Kolom Cabang -->
          <template v-slot:item.cabang="{ item }">
            {{ item.cabang || '-' }}
          </template>

          <!-- Kolom Aktivasi -->
          <template v-slot:item.aktivasi="{ item }">
            <v-chip :color="item.aktivasi == 1 ? 'green' : 'red'" text-color="white" size="small" variant="flat">
              {{ item.aktivasi == 1 ? 'Active' : 'Inactive' }}
            </v-chip>
          </template>

          <!-- Kolom Jabatan -->
          <template v-slot:item.jabatan="{ item }">
            {{ getJabatanNameById(item.mvo_type_id) || item.mvo_type_id || '-' }}
          </template>

          <!-- Kolom Aksi -->
          <template v-slot:item.action="{ item }">
            <v-tooltip text="Edit" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" :color="app.colors.primary" @click="editUser(item.id)" class="mr-2 mb-2"
                  v-bind="props" icon>
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Hapus" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" :color="app.colors.secondary" @click="deleteUser(item.id)" class="mr-2 mb-2"
                  v-bind="props" icon>
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="Aktivasi" color="#125C13" location="top start">
              <template v-slot:activator="{ props }">
                <v-btn size="small" color="success" @click="aktivasiUser(item.id)" class="mr-2 mb-2" v-bind="props"
                  icon>
                  <v-icon>mdi-account-check</v-icon>
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
        <v-text-field v-model="datatable.search" prepend-inner-icon="mdi-magnify" label="Cari user..." single-line
          hide-details variant="outlined" class="search-field-mobile" />
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="isTableLoading" indeterminate color="#FFD700" class="mb-4"></v-progress-linear>

    <div v-if="filteredItems.length === 0 && !isTableLoading" class="text-center pa-4">
      <v-icon size="64" color="grey">mdi-account-search</v-icon>
      <p class="text-grey mt-2">Tidak ada data user ditemukan</p>
    </div>

    <v-card v-for="(item, index) in filteredItems" :key="item.id" class="mobile-user-card mb-3"
      @click="toggleMobileDetail(item.id)" :class="{ 'mobile-card-expanded': expandedMobileCard === item.id }">

      <v-card-text class="mobile-card-header">
        <v-row no-gutters align="center">
          <v-col cols="1" class="text-center">
            <span class="mobile-number">{{ index + 1 }}</span>
          </v-col>

          <v-col cols="9" class="pl-3">
            <div class="mobile-username">
              <strong>Username:</strong> {{ item.username }}
            </div>
            <div class="mobile-name">
              <strong>Nama:</strong> {{ item.nama }}
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
            <v-row class="mb-2">
              <v-col cols="4" class="detail-label">NO ID:</v-col>
              <v-col cols="8" class="detail-value">{{ item.no_id || '-' }}</v-col>
            </v-row>
            <v-row class="mb-2">
              <v-col cols="4" class="detail-label">Cabang:</v-col>
              <v-col cols="8" class="detail-value">{{ item.cabang || '-' }}</v-col>
            </v-row>
            <!-- <v-row class="mb-2">
              <v-col cols="4" class="detail-label">Otoritas:</v-col>
              <v-col cols="8">
                <v-chip :color="getAuthorityColor(item.mvo_type_id)"
                  :text-color="getAuthorityTextColor(item.mvo_type_id)" size="small" variant="flat">
                  {{ item.mvo_type_id ? item.mvo_type_id.toUpperCase() : '-' }}
                </v-chip>
              </v-col>
            </v-row> -->
            <v-row class="mb-2">
              <v-col cols="4" class="detail-label">Jabatan:</v-col>
              <v-col cols="8" class="detail-value">{{ getJabatanNameById(item.mvo_type_id) || item.mvo_type_id || '-'
              }}</v-col>
            </v-row>
            <v-row class="mb-3">
              <v-col cols="4" class="detail-label">Status:</v-col>
              <v-col cols="8">
                <v-chip :color="item.aktivasi == 1 ? 'green' : 'red'" text-color="white" size="small" variant="flat">
                  {{ item.aktivasi == 1 ? 'Active' : 'Inactive' }}
                </v-chip>
              </v-col>
            </v-row>

            <v-divider class="mb-3"></v-divider>
            <div class="mobile-actions">
              <v-btn size="small" :color="app.colors.primary" @click.stop="editUser(item.id)" class="mr-2 mb-2"
                prepend-icon="mdi-pencil">Edit</v-btn>
              <v-btn size="small" :color="app.colors.secondary" @click.stop="deleteUser(item.id)" class="mr-2 mb-2"
                prepend-icon="mdi-delete">Hapus</v-btn>
              <v-btn size="small" color="success" @click.stop="aktivasiUser(item.id)" class="mb-2"
                prepend-icon="mdi-account-check">Aktivasi</v-btn>
            </div>
          </v-card-text>
        </div>
      </v-expand-transition>
    </v-card>
  </div>

  <!-- Dialog Tambah User -->
  <v-dialog v-model="isShowDialogAdd" persistent :width="$vuetify.display.mobile ? '95%' : '900'">
    <v-card class="custom-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-account-plus</v-icon>
        <span class="dialog-title">TAMBAH DATA USER</span>
      </v-card-title>

      <v-card-text class="dialog-content">
        <div class="input-box">
          <div class="input-box-title">DATA PRIBADI</div>
          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="No ID" v-model="modelAdd.no_id" class="mb-2 mt-4" type="text" density="compact"
                prepend-inner-icon="mdi-card-account-details" variant="outlined" color="amber"
                base-color="grey-lighten-1" maxlength="16" />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Nama Lengkap" v-model="modelAdd.nama" class="mb-2 mt-4" density="compact"
                prepend-inner-icon="mdi-account" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Nama Panggilan" v-model="modelAdd.nama_panggilan" class="mb-2" density="compact"
                prepend-inner-icon="mdi-account-outline" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Tempat Lahir" v-model="modelAdd.tempat_lahir" class="mb-2" density="compact"
                prepend-inner-icon="mdi-map-marker" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Tanggal Lahir" v-model="modelAdd.tgl_lahir" class="mb-2" type="date"
                density="compact" prepend-inner-icon="mdi-calendar" variant="outlined" color="amber"
                base-color="grey-lighten-1" />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Nomor HP" v-model="modelAdd.nohp" class="mb-2" @input="validatePhoneAdd"
                density="compact" prepend-inner-icon="mdi-phone" variant="outlined" color="amber"
                base-color="grey-lighten-1" />
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Jenis Kelamin" v-model="modelAdd.jenis_kelamin" :items="jenisKelaminOptions"
                item-title="text" item-value="value" density="compact" prepend-inner-icon="mdi-gender-male-female"
                variant="outlined" color="amber" base-color="grey-lighten-1" clearable />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-textarea label="Alamat Lengkap" v-model="modelAdd.alamat" rows="2" auto-grow density="compact"
                prepend-inner-icon="mdi-home" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>

          </v-row>

        </div>
        <div class="box-glass">
          <div class="input-box-title">STRUKTUR UPLINE</div>
          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-combobox label="Jabatan" v-model="modelAdd.mvo_type_id" :items="jabatanOptions" item-title="text"
                item-value="value" :return-object="false" density="compact" prepend-inner-icon="mdi-account-group"
                variant="outlined" color="amber" base-color="grey-lighten-1" clearable />
            </v-col>
            <v-col v-if="modelAdd.mvo_type_id" :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Cabang (Provinsi)" v-model="modelAdd.cabang" :items="cabangOptions" item-title="text"
                item-value="value" density="compact" prepend-inner-icon="mdi-map-marker" variant="outlined"
                color="amber" base-color="grey-lighten-1" clearable :loading="loadingProvinsi"
                @update:modelValue="onCabangChangeAdd" />
            </v-col>
            <v-col v-if="modelAdd.cabang && hideUplineAdd !== 'upline_1'" :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Pilih MVO" v-model="modelAdd.upline_1" :items="mvoOptionsAdd" item-title="text"
                item-value="value" :loading="loadingMvoAdd" @update:modelValue="onMvoChangeAdd" density="compact"
                variant="outlined" color="amber" base-color="grey-lighten-1" clearable />
            </v-col>
          </v-row>

          <v-row>
            <v-col v-if="modelAdd.upline_1 && hideUplineAdd !== 'upline_2'" :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Pilih Regional" v-model="modelAdd.upline_2" :items="regionalOptionsAdd" item-title="text"
                item-value="value" :loading="loadingRegionalAdd" @update:modelValue="onRegionalChangeAdd"
                density="compact" variant="outlined" color="amber" base-color="grey-lighten-1" clearable />
            </v-col>
            <v-col v-if="modelAdd.upline_2 && hideUplineAdd !== 'upline_3'" :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Pilih Founder" v-model="modelAdd.upline_3" :items="founderOptionsAdd" item-title="text"
                item-value="value" :loading="loadingFounderAdd" @update:modelValue="onFounderChangeAdd"
                density="compact" variant="outlined" color="amber" base-color="grey-lighten-1" clearable />
            </v-col>
          </v-row>

          <v-row>
            <v-col v-if="modelAdd.upline_3 && hideUplineAdd !== 'upline_4'" :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Pilih GM" v-model="modelAdd.upline_4" :items="gmOptionsAdd" item-title="text"
                item-value="value" :loading="loadingGmAdd" @update:modelValue="onGmChangeAdd" density="compact"
                variant="outlined" color="amber" base-color="grey-lighten-1" clearable />
            </v-col>
            <v-col v-if="modelAdd.upline_4 && hideUplineAdd !== 'upline_5'" :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Pilih Supplier" v-model="modelAdd.upline_5" :items="supplierOptionsAdd" item-title="text"
                item-value="value" :loading="loadingSupplierAdd" @update:modelValue="onSupplierChangeAdd"
                density="compact" variant="outlined" color="amber" base-color="grey-lighten-1" clearable />
            </v-col>
          </v-row>

          <v-row>
            <v-col v-if="modelAdd.upline_5 && hideUplineAdd !== 'upline_6'" :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Pilih Distributor" v-model="modelAdd.upline_6" :items="distributorOptionsAdd"
                item-title="text" item-value="value" :loading="loadingDistributorAdd" density="compact"
                variant="outlined" color="amber" base-color="grey-lighten-1" clearable />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Username" v-model="modelAdd.username" type="text" density="compact"
                prepend-inner-icon="mdi-at" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field v-model="modelAdd.password" :type="visibleAdd ? 'text' : 'password'" density="compact"
                label="Password" prepend-inner-icon="mdi-lock"
                :append-inner-icon="visibleAdd ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="visibleAdd = !visibleAdd" variant="outlined" color="amber"
                base-color="grey-lighten-1" />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-file-input label="Foto Profil" v-model="modelAdd.path_gambar_profile"
                accept="image/png, image/jpeg, image/jpg" variant="outlined" density="compact"
                prepend-inner-icon="mdi-camera" color="amber" base-color="grey-lighten-1"
                @change="handleFotoProfileAddChange" hint="Format: PNG, JPG, JPEG • Maksimal 2 MB" persistent-hint />
            </v-col>
          </v-row>

          <v-row v-if="previewFotoProfileAdd">
            <v-col cols="12" class="text-center">
              <v-img :src="previewFotoProfileAdd" max-width="100" height="100" class="mx-auto my-2 rounded-xl"
                contain />
            </v-col>
          </v-row>
        </div>
      </v-card-text>

      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.secondary" @click="isShowDialogAdd = false" class="ml-2">Batal</v-btn>
        <v-btn :color="app.colors.primary" @click="addUser()" :loading="isButtonLoading" class="ml-2">Simpan</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Edit User -->
  <v-dialog v-model="isShowDialogEdit" persistent :width="$vuetify.display.mobile ? '95%' : '900'">
    <v-card class="custom-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2" style="color: #FFD700;">mdi-account-edit</v-icon>
        <span class="dialog-title">EDIT DATA USER</span>
      </v-card-title>
      <v-card-text class="dialog-content">
        <div class="input-box">
          <div class="input-box-title">DATA PRIBADI</div>
          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="No ID" v-model="modelEdit.no_id" class="mb-2 mt-4" type="text" density="compact"
                prepend-inner-icon="mdi-card-account-details" variant="outlined" color="amber"
                base-color="grey-lighten-1" maxlength="16" />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Nama Lengkap" v-model="modelEdit.nama" class="mb-2 mt-4" density="compact"
                prepend-inner-icon="mdi-account" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Nama Panggilan" v-model="modelEdit.nama_panggilan" class="mb-2" density="compact"
                prepend-inner-icon="mdi-account-outline" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Tempat Lahir" v-model="modelEdit.tempat_lahir" class="mb-2" density="compact"
                prepend-inner-icon="mdi-map-marker" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Tanggal Lahir" v-model="modelEdit.tgl_lahir" class="mb-2" type="date"
                density="compact" prepend-inner-icon="mdi-calendar" variant="outlined" color="amber"
                base-color="grey-lighten-1" />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Nomor HP" v-model="modelEdit.nohp" class="mb-2" @input="validatePhoneEdit"
                density="compact" prepend-inner-icon="mdi-phone" variant="outlined" color="amber"
                base-color="grey-lighten-1" />
            </v-col>
          </v-row>
          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Jenis Kelamin" v-model="modelEdit.jenis_kelamin" :items="jenisKelaminOptions"
                item-title="text" item-value="value" density="compact" prepend-inner-icon="mdi-gender-male-female"
                variant="outlined" color="amber" base-color="grey-lighten-1" clearable />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-textarea label="Alamat Lengkap" v-model="modelEdit.alamat" rows="2" auto-grow density="compact"
                prepend-inner-icon="mdi-home" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>

          </v-row>

        </div>
        <div class="box-glass">
          <div class="input-box-title">STRUKTUR UPLINE</div>
          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-combobox label="Jabatan" v-model="modelEdit.mvo_type_id" :items="jabatanOptions" item-title="text"
                item-value="value" :return-object="false" density="compact" prepend-inner-icon="mdi-account-group"
                variant="outlined" color="amber" base-color="grey-lighten-1" clearable />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Cabang (Provinsi)" v-model="modelEdit.cabang" :items="cabangOptions" item-title="text"
                item-value="value" density="compact" prepend-inner-icon="mdi-map-marker" variant="outlined"
                color="amber" base-color="grey-lighten-1" clearable :loading="loadingProvinsi"
                :disabled="loadingProvinsi" @update:modelValue="onCabangChangeEdit" />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Pilih MVO" v-model="modelEdit.upline_1" :items="mvoOptionsEdit" item-title="text"
                item-value="value" :loading="loadingMvoEdit" :disabled="!modelEdit.cabang"
                @update:modelValue="onMvoChangeEdit" density="compact" variant="outlined" color="amber"
                base-color="grey-lighten-1" clearable />
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Pilih Regional" v-model="modelEdit.upline_2" :items="regionalOptionsEdit"
                item-title="text" item-value="value" :loading="loadingRegionalEdit" :disabled="!modelEdit.upline_1"
                @update:modelValue="onRegionalChangeEdit" density="compact" variant="outlined" color="amber"
                base-color="grey-lighten-1" clearable />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Pilih Founder" v-model="modelEdit.upline_3" :items="founderOptionsEdit" item-title="text"
                item-value="value" :loading="loadingFounderEdit" :disabled="!modelEdit.upline_2"
                @update:modelValue="onFounderChangeEdit" density="compact" variant="outlined" color="amber"
                base-color="grey-lighten-1" clearable />
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Pilih GM" v-model="modelEdit.upline_4" :items="gmOptionsEdit" item-title="text"
                item-value="value" :loading="loadingGmEdit" :disabled="!modelEdit.upline_3"
                @update:modelValue="onGmChangeEdit" density="compact" variant="outlined" color="amber"
                base-color="grey-lighten-1" clearable />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Pilih Supplier" v-model="modelEdit.upline_5" :items="supplierOptionsEdit"
                item-title="text" item-value="value" :loading="loadingSupplierEdit" :disabled="!modelEdit.upline_4"
                @update:modelValue="onSupplierChangeEdit" density="compact" variant="outlined" color="amber"
                base-color="grey-lighten-1" clearable />
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-select label="Pilih Distributor" v-model="modelEdit.upline_6" :items="distributorOptionsEdit"
                item-title="text" item-value="value" :loading="loadingDistributorEdit" :disabled="!modelEdit.upline_5"
                density="compact" variant="outlined" color="amber" base-color="grey-lighten-1" clearable />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field label="Username" v-model="modelEdit.username" type="text" density="compact"
                prepend-inner-icon="mdi-at" variant="outlined" color="amber" base-color="grey-lighten-1" />
            </v-col>
          </v-row>

          <v-row>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-text-field v-model="modelEdit.password" :type="visibleEdit ? 'text' : 'password'" density="compact"
                label="Password (kosongkan jika tidak ingin diubah)" prepend-inner-icon="mdi-lock"
                :append-inner-icon="visibleEdit ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="visibleEdit = !visibleEdit" variant="outlined" color="amber"
                base-color="grey-lighten-1" />
            </v-col>
            <v-col :cols="$vuetify.display.mobile ? 12 : 6">
              <v-file-input label="Foto Profil (kosongkan jika tidak ingin diubah)"
                v-model="modelEdit.path_gambar_profile" accept="image/png, image/jpeg, image/jpg" variant="outlined"
                density="compact" prepend-inner-icon="mdi-camera" color="amber" base-color="grey-lighten-1"
                @change="handleFotoProfileEditChange" hint="Format: PNG, JPG, JPEG • Maksimal 2 MB" persistent-hint />
            </v-col>
          </v-row>
        </div>

        <v-row v-if="previewFotoProfileEdit">
          <v-col cols="12" class="text-center">
            <v-img :src="previewFotoProfileEdit" max-width="150" height="150" class="mx-auto my-2 rounded-xl" contain />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.secondary" @click="isShowDialogEdit = false" class="ml-2">Batal</v-btn>
        <v-btn :color="app.colors.primary" @click="updateUser()" :loading="isButtonLoading" class="ml-2">Update</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog Delete Confirmation -->
  <v-dialog v-model="isShowDialogDelete" :max-width="$vuetify.display.mobile ? '95%' : '500px'">
    <v-card :color="this.app.colors.background">
      <v-card-title class="text-h5">Apakah anda yakin ingin menghapus data user ini?</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.primary" @click="isShowDialogDelete = false">Cancel</v-btn>
        <v-btn :color="app.colors.secondary" @click="confirmDeleteUser(modelDelete.id)"
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
    return { app };
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

      visibleAdd: false,
      visibleEdit: false,

      title: "DATA USER",
      itemsBreadcrumb: [
        { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
        { title: "User", disabled: false, href: "/admin/user" },
      ],

      isShowDialogAdd: false,
      isShowDialogEdit: false,
      isButtonLoading: false,
      isShowDialogDelete: false,
      previewFotoProfileAdd: null,
      previewFotoProfileEdit: null,

      loadingProvinsi: false,
      loadingMvoAdd: false,
      loadingRegionalAdd: false,
      loadingFounderAdd: false,
      loadingGmAdd: false,
      loadingSupplierAdd: false,
      loadingDistributorAdd: false,

      loadingMvoEdit: false,
      loadingRegionalEdit: false,
      loadingFounderEdit: false,
      loadingGmEdit: false,
      loadingSupplierEdit: false,
      loadingDistributorEdit: false,

      mvoOptionsAdd: [],
      regionalOptionsAdd: [],
      founderOptionsAdd: [],
      gmOptionsAdd: [],
      supplierOptionsAdd: [],
      distributorOptionsAdd: [],

      mvoOptionsEdit: [],
      regionalOptionsEdit: [],
      founderOptionsEdit: [],
      gmOptionsEdit: [],
      supplierOptionsEdit: [],
      distributorOptionsEdit: [],

      jenisKelaminOptions: [
        { text: 'Laki-laki', value: 'L' },
        { text: 'Perempuan', value: 'P' }
      ],
      cabangOptions: [],
      jabatanOptions: [],
      mvoTypeList: [],

      datatable: {
        search: "",
        headers: [
          { key: "no", title: "No", sortable: false },
          { key: "no_id", title: "NO ID" },
          { key: "username", title: "Username" },
          { key: "nama", title: "Nama Lengkap" },
          { key: "jabatan", title: "Jabatan" },
          { key: "cabang", title: "Cabang" },
          { key: "jlh_bintang", title: "Bintang" },
          { key: "upline_6", title: "DISTRIBUTOR" },
          { key: "upline_5", title: "SUPPLIER" },
          { key: "upline_4", title: "GENERAL MANAGER" },
          { key: "upline_3", title: "FOUNDER" },
          { key: "upline_2", title: "REGIONAL" },
          { key: "upline_1", title: "MVO" },
          { key: "aktivasi", title: "Aktivasi", align: "center" },
          { key: "action", title: "Actions", sortable: false, align: "center" }
        ],
        items: [],
      },

      modelAdd: {
        no_id: '', nama: '', nama_panggilan: '', tempat_lahir: '', tgl_lahir: '',
        jenis_kelamin: '', nohp: '', alamat: '', mvo_type_id: '', username: '',
        password: '', path_gambar_profile: null, cabang: '', upline_1: '',
        upline_2: '', upline_3: '', upline_4: '', upline_5: '', upline_6: ''
      },

      modelEdit: {
        id: "", no_id: '', nama: '', nama_panggilan: '', tempat_lahir: '', tgl_lahir: '',
        jenis_kelamin: '', nohp: '', alamat: '', mvo_type_id: '', username: '',
        password: '', path_gambar_profile: null, cabang: '', upline_1: '',
        upline_2: '', upline_3: '', upline_4: '', upline_5: '', upline_6: ''
      },

      modelDelete: { id: "" },
      isTableLoading: true,
    };
  },

  computed: {
    hideUplineAdd() {

      const jabatan = this.jabatanOptions.find(
        j => j.value == this.modelAdd.mvo_type_id
      )

      if (!jabatan) return null

      return `upline_${jabatan.level}`
    },
    filteredItems() {
      if (!this.datatable.search) return this.datatable.items;

      const searchTerm = this.datatable.search.toLowerCase();
      return this.datatable.items.filter(item => {
        return (
          (item.username && item.username.toLowerCase().includes(searchTerm)) ||
          (item.nama && item.nama.toLowerCase().includes(searchTerm)) ||
          (item.no_id && item.no_id.toLowerCase().includes(searchTerm)) ||
          (item.mvo_type_id && item.mvo_type_id.toLowerCase().includes(searchTerm))
        );
      });
    }
  },

  methods: {
    getNamaAfterStrip(value) {
      if (!value) return '';

      // Pecah berdasarkan " - "
      const parts = value.split(' - ');

      // Ambil bagian belakang
      return parts.length > 1 ? parts[1] : value;
    },
    mapUserWithBintang(users) {
      return users.map(u => {

        const mvo = this.mvoTypeList.find(
          m => m.id == u.mvo_type_id
        );

        return {
          ...u,
          jlh_bintang: mvo ? mvo.jlh_bintang : 0
        };
      });
    },
    // ========== ADD FORM CASCADE ==========
    onCabangChangeAdd(val) {
      this.modelAdd.upline_1 = this.modelAdd.upline_2 = this.modelAdd.upline_3 = '';
      this.modelAdd.upline_4 = this.modelAdd.upline_5 = this.modelAdd.upline_6 = '';
      this.getMvoAdd(val);
    },

    onMvoChangeAdd(val) {
      this.modelAdd.upline_2 = this.modelAdd.upline_3 = this.modelAdd.upline_4 = '';
      this.modelAdd.upline_5 = this.modelAdd.upline_6 = '';
      this.getRegionalAdd(val);
    },

    onRegionalChangeAdd(val) {
      this.modelAdd.upline_3 = this.modelAdd.upline_4 = '';
      this.modelAdd.upline_5 = this.modelAdd.upline_6 = '';
      this.getFounderAdd(val);
    },

    onFounderChangeAdd(val) {
      this.modelAdd.upline_4 = this.modelAdd.upline_5 = this.modelAdd.upline_6 = '';
      this.getGmAdd(val);
    },

    onGmChangeAdd(val) {
      this.modelAdd.upline_5 = this.modelAdd.upline_6 = '';
      this.getSupplierAdd(val);
    },

    onSupplierChangeAdd(val) {
      this.modelAdd.upline_6 = '';
      this.getDistributorAdd(val);
    },

    async getDistributorAdd(code) {
      this.loadingDistributorAdd = true;
      try {
        const res = await axios.post('https://babaapi.teknosof.com/api/get/distributor', {
          cabang: this.modelAdd.cabang, upline_1: this.modelAdd.upline_1,
          upline_2: this.modelAdd.upline_2, upline_3: this.modelAdd.upline_3,
          upline_4: this.modelAdd.upline_4, upline_5: code
        });
        this.distributorOptionsAdd = res.data.data.map(i => ({ text: `${i.code} - ${i.nama}`, value: `${i.code} - ${i.nama}` }));
      } catch (err) {
        this.showSnackbar('Gagal memuat data Distributor', 'error');
      }
      this.loadingDistributorAdd = false;
    },

    async getSupplierAdd(code) {
      this.loadingSupplierAdd = true;
      try {
        const res = await axios.post('https://babaapi.teknosof.com/api/get/supplier', {
          cabang: this.modelAdd.cabang, upline_1: this.modelAdd.upline_1,
          upline_2: this.modelAdd.upline_2, upline_3: this.modelAdd.upline_3, upline_4: code
        });
        this.supplierOptionsAdd = res.data.data.map(i => ({ text: `${i.code} - ${i.nama}`, value: `${i.code} - ${i.nama}` }));
      } catch (err) {
        this.showSnackbar('Gagal memuat data Supplier', 'error');
      }
      this.loadingSupplierAdd = false;
    },

    async getGmAdd(code) {
      this.loadingGmAdd = true;
      try {
        const res = await axios.post('https://babaapi.teknosof.com/api/get/gm', {
          cabang: this.modelAdd.cabang, upline_1: this.modelAdd.upline_1,
          upline_2: this.modelAdd.upline_2, upline_3: code
        });
        this.gmOptionsAdd = res.data.data.map(i => ({ text: `${i.code} - ${i.nama}`, value: `${i.code} - ${i.nama}` }));
      } catch (err) {
        this.showSnackbar('Gagal memuat data GM', 'error');
      }
      this.loadingGmAdd = false;
    },

    async getFounderAdd(code) {
      this.loadingFounderAdd = true;
      try {
        const res = await axios.post('https://babaapi.teknosof.com/api/get/founder', {
          cabang: this.modelAdd.cabang, upline_1: this.modelAdd.upline_1, upline_2: code
        });
        this.founderOptionsAdd = res.data.data.map(i => ({ text: `${i.code} - ${i.nama}`, value: `${i.code} - ${i.nama}` }));
      } catch (err) {
        this.showSnackbar('Gagal memuat data Founder', 'error');
      }
      this.loadingFounderAdd = false;
    },

    async getRegionalAdd(code) {
      this.loadingRegionalAdd = true;
      try {
        const res = await axios.post('https://babaapi.teknosof.com/api/get/regional', {
          cabang: this.modelAdd.cabang, upline_1: code
        });
        this.regionalOptionsAdd = res.data.data.map(i => ({ text: `${i.code} - ${i.nama}`, value: `${i.code} - ${i.nama}` }));
      } catch (err) {
        this.showSnackbar('Gagal memuat data Regional', 'error');
      }
      this.loadingRegionalAdd = false;
    },

    async getMvoAdd(cabang) {
      this.loadingMvoAdd = true;
      try {
        const res = await axios.post('https://babaapi.teknosof.com/api/get/mvo', { cabang });
        this.mvoOptionsAdd = res.data.data.map(i => ({ text: `${i.code} - ${i.nama}`, value: `${i.code} - ${i.nama}` }));
      } catch (err) {
        this.showSnackbar('Gagal memuat data MVO', 'error');
      }
      this.loadingMvoAdd = false;
    },

    // ========== EDIT FORM CASCADE ==========
    onCabangChangeEdit(val) {
      this.modelEdit.upline_1 = this.modelEdit.upline_2 = this.modelEdit.upline_3 = '';
      this.modelEdit.upline_4 = this.modelEdit.upline_5 = this.modelEdit.upline_6 = '';
      this.getMvoEdit(val);
    },

    onMvoChangeEdit(val) {
      this.modelEdit.upline_2 = this.modelEdit.upline_3 = this.modelEdit.upline_4 = '';
      this.modelEdit.upline_5 = this.modelEdit.upline_6 = '';
      this.getRegionalEdit(val);
    },

    onRegionalChangeEdit(val) {
      this.modelEdit.upline_3 = this.modelEdit.upline_4 = '';
      this.modelEdit.upline_5 = this.modelEdit.upline_6 = '';
      this.getFounderEdit(val);
    },

    onFounderChangeEdit(val) {
      this.modelEdit.upline_4 = this.modelEdit.upline_5 = this.modelEdit.upline_6 = '';
      this.getGmEdit(val);
    },

    onGmChangeEdit(val) {
      this.modelEdit.upline_5 = this.modelEdit.upline_6 = '';
      this.getSupplierEdit(val);
    },

    onSupplierChangeEdit(val) {
      this.modelEdit.upline_6 = '';
      this.getDistributorEdit(val);
    },

    async getDistributorEdit(code) {
      this.loadingDistributorEdit = true;
      try {
        const res = await axios.post('https://babaapi.teknosof.com/api/get/distributor', {
          cabang: this.modelEdit.cabang, upline_1: this.modelEdit.upline_1,
          upline_2: this.modelEdit.upline_2, upline_3: this.modelEdit.upline_3,
          upline_4: this.modelEdit.upline_4, upline_5: code
        });
        this.distributorOptionsEdit = res.data.data.map(i => ({ text: `${i.code} - ${i.nama}`, value: i.code }));
      } catch (err) {
        this.showSnackbar('Gagal memuat data Distributor', 'error');
      }
      this.loadingDistributorEdit = false;
    },

    async getSupplierEdit(code) {
      this.loadingSupplierEdit = true;
      try {
        const res = await axios.post('https://babaapi.teknosof.com/api/get/supplier', {
          cabang: this.modelEdit.cabang, upline_1: this.modelEdit.upline_1,
          upline_2: this.modelEdit.upline_2, upline_3: this.modelEdit.upline_3, upline_4: code
        });
        this.supplierOptionsEdit = res.data.data.map(i => ({ text: `${i.code} - ${i.nama}`, value: i.code }));
      } catch (err) {
        this.showSnackbar('Gagal memuat data Supplier', 'error');
      }
      this.loadingSupplierEdit = false;
    },

    async getGmEdit(code) {
      this.loadingGmEdit = true;
      try {
        const res = await axios.post('https://babaapi.teknosof.com/api/get/gm', {
          cabang: this.modelEdit.cabang, upline_1: this.modelEdit.upline_1,
          upline_2: this.modelEdit.upline_2, upline_3: code
        });
        this.gmOptionsEdit = res.data.data.map(i => ({ text: `${i.code} - ${i.nama}`, value: i.code }));
      } catch (err) {
        this.showSnackbar('Gagal memuat data GM', 'error');
      }
      this.loadingGmEdit = false;
    },

    async getFounderEdit(code) {
      this.loadingFounderEdit = true;
      try {
        const res = await axios.post('https://babaapi.teknosof.com/api/get/founder', {
          cabang: this.modelEdit.cabang, upline_1: this.modelEdit.upline_1, upline_2: code
        });
        this.founderOptionsEdit = res.data.data.map(i => ({ text: `${i.code} - ${i.nama}`, value: i.code }));
      } catch (err) {
        this.showSnackbar('Gagal memuat data Founder', 'error');
      }
      this.loadingFounderEdit = false;
    },

    async getRegionalEdit(code) {
      this.loadingRegionalEdit = true;
      try {
        const res = await axios.post('https://babaapi.teknosof.com/api/get/regional', {
          cabang: this.modelEdit.cabang, upline_1: code
        });
        this.regionalOptionsEdit = res.data.data.map(i => ({ text: `${i.code} - ${i.nama}`, value: i.code }));
      } catch (err) {
        this.showSnackbar('Gagal memuat data Regional', 'error');
      }
      this.loadingRegionalEdit = false;
    },

    async getMvoEdit(cabang) {
      this.loadingMvoEdit = true;
      try {
        const res = await axios.post('https://babaapi.teknosof.com/api/get/mvo', { cabang });
        this.mvoOptionsEdit = res.data.data.map(i => ({ text: `${i.code} - ${i.nama}`, value: i.code }));
      } catch (err) {
        this.showSnackbar('Gagal memuat data MVO', 'error');
      }
      this.loadingMvoEdit = false;
    },

    // ========== DATA FETCHING ==========
    async fetchProvinsiData() {
      this.loadingProvinsi = true;
      try {
        const response = await axios.get('https://babaapi.teknosof.com/api/provinsi', {
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          timeout: 10000
        });

        if (response.data.status === 'success' && response.data.data) {
          this.cabangOptions = response.data.data.map(provinsi => ({
            text: provinsi.code,
            value: provinsi.code,
          }));
        } else {
          this.showSnackbar('Gagal memuat data provinsi', 'error');
        }
      } catch (error) {
        let message = 'Gagal memuat data provinsi';
        if (error.response) {
          message = `Error ${error.response.status}: ${error.response.data?.message || 'Server error'}`;
        } else if (error.code === 'ECONNABORTED') {
          message = 'Timeout saat memuat data provinsi';
        } else if (error.code === 'ERR_NETWORK') {
          message = 'Tidak dapat terhubung ke server provinsi';
        }
        this.showSnackbar(message, 'error');
      } finally {
        this.loadingProvinsi = false;
      }
    },

    async getAllMvoType() {
      try {
        const response = await axios.get(
          'https://babaapi.teknosof.com/api/mvo-type',
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 10000
          }
        );

        if (response.data.status === 'success' && response.data.data) {

          // ✅ Simpan full data (untuk bintang)
          this.mvoTypeList = response.data.data;

          // ✅ Tetap buat dropdown jabatan
          this.jabatanOptions = response.data.data.map(item => ({
            text: item.jabatan,
            value: item.id,
            level: Number(item.level)   // 🔥 simpan level
          }));

          // 🔥 Kalau user sudah ada → mapping ulang
          if (this.datatable.items.length > 0) {
            this.datatable.items =
              this.mapUserWithBintang(this.datatable.items);
          }

        } else {
          this.showSnackbar('Gagal memuat data jabatan', 'error');
        }

      } catch (error) {
        this.showSnackbar('Gagal memuat data jabatan', 'error');
      }
    },

    // ========== HELPERS ==========
    toggleMobileDetail(itemId) {
      this.expandedMobileCard = this.expandedMobileCard === itemId ? null : itemId;
    },

    validatePhoneAdd(event) {
      this.modelAdd.nohp = event.target.value.replace(/[^0-9]/g, '');
    },

    validatePhoneEdit(event) {
      this.modelEdit.nohp = event.target.value.replace(/[^0-9]/g, '');
    },

    handleFotoProfileAddChange(event) {
      const file = this.modelAdd.path_gambar_profile;
      if (file) {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          this.showSnackbar('Format file harus PNG, JPG, atau JPEG', 'error');
          this.modelAdd.path_gambar_profile = null;
          this.previewFotoProfileAdd = null;
          return;
        }

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
          this.showSnackbar('Ukuran file maksimal 2MB', 'error');
          this.modelAdd.path_gambar_profile = null;
          this.previewFotoProfileAdd = null;
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => { this.previewFotoProfileAdd = e.target.result; };
        reader.readAsDataURL(file);
      } else {
        this.previewFotoProfileAdd = null;
      }
    },

    handleFotoProfileEditChange(event) {
      const file = this.modelEdit.path_gambar_profile;
      if (file) {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          this.showSnackbar('Format file harus PNG, JPG, atau JPEG', 'error');
          this.modelEdit.path_gambar_profile = null;
          this.previewFotoProfileEdit = null;
          return;
        }

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
          this.showSnackbar('Ukuran file maksimal 2MB', 'error');
          this.modelEdit.path_gambar_profile = null;
          this.previewFotoProfileEdit = null;
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => { this.previewFotoProfileEdit = e.target.result; };
        reader.readAsDataURL(file);
      } else {
        this.previewFotoProfileEdit = null;
      }
    },

    showSnackbar(text, color = 'success') {
      this.contentSnackbar.text = text;
      this.contentSnackbar.color = color;
      this.contentSnackbar.snackbar = true;
    },

    updateCurrentpageInfo(options) {
      this.currentPage = options.page;
      this.itemsPerPage = options.itemsPerPage;
    },

    getAuthorityColor(mvo_type_id) {
      const colors = {

      };
      return colors[mvo_type_id] || '#FFD700';
    },

    getAuthorityTextColor(mvo_type_id) {
      return 'white';
    },

    getJabatanNameById(id) {
      if (!id) return '';
      const jabatan = this.jabatanOptions.find(j => j.value == id);
      return jabatan ? jabatan.text : '';
    },

    showDialogFormAddUser() {
      this.isShowDialogAdd = true;
      this.clearAddForm();
      if (this.cabangOptions.length === 0) this.fetchProvinsiData();
      if (this.jabatanOptions.length === 0) this.getAllMvoType();
    },

    clearAddForm() {
      this.modelAdd = {
        no_id: '', nama: '', nama_panggilan: '', tempat_lahir: '', tgl_lahir: '',
        jenis_kelamin: '', nohp: '', alamat: '', mvo_type_id: '', username: '',
        password: '', path_gambar_profile: null, cabang: '', upline_1: '',
        upline_2: '', upline_3: '', upline_4: '', upline_5: '', upline_6: ''
      };
      this.previewFotoProfileAdd = null;
      this.mvoOptionsAdd = this.regionalOptionsAdd = this.founderOptionsAdd = [];
      this.gmOptionsAdd = this.supplierOptionsAdd = this.distributorOptionsAdd = [];
    },

    clearEditForm() {
      this.modelEdit = {
        id: "", no_id: '', nama: '', nama_panggilan: '', tempat_lahir: '', tgl_lahir: '',
        jenis_kelamin: '', nohp: '', alamat: '', mvo_type_id: '', username: '',
        password: '', path_gambar_profile: null, cabang: '', upline_1: '',
        upline_2: '', upline_3: '', upline_4: '', upline_5: '', upline_6: ''
      };
      this.previewFotoProfileEdit = null;
      this.mvoOptionsEdit = this.regionalOptionsEdit = this.founderOptionsEdit = [];
      this.gmOptionsEdit = this.supplierOptionsEdit = this.distributorOptionsEdit = [];
    },
    getUserCabang() {
      try {
        const headerData = JSON.parse(localStorage.getItem('headerData'))
        return headerData?.cabang || null
      } catch (e) {
        return null
      }
    },

    getUserLogin() {
      try {
        return JSON.parse(localStorage.getItem('user'))
      } catch (e) {
        return null
      }
    },
    getAllUser() {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.isTableLoading = true;

      const userCabang = this.getUserCabang();
      const userLogin = this.getUserLogin();

      const isSuperadmin =
        userLogin?.mvo_type_id?.toString().toLowerCase() === 'superadmin';

      axios.get("https://babaapi.teknosof.com/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (response.data.status === "success") {

            let users = response.data.data;

            // ❌ Buang superadmin lain (opsional)
            users = users.filter(u => u.mvo_type_id !== 'superadmin');

            // ================================
            // FILTER JIKA BUKAN SUPERADMIN
            // ================================
            if (!isSuperadmin) {

              // 1️⃣ Filter Cabang
              if (userCabang) {
                users = users.filter(u =>
                  u.cabang &&
                  u.cabang.toUpperCase().trim() === userCabang.toUpperCase().trim()
                );
              }

              // 2️⃣ Filter Berdasarkan Upline Login
              users = users.filter(u => {

                return (

                  // Kalau login MVO
                  u.upline_1 === userLogin?.upline_1 ||

                  // Regional
                  u.upline_2 === userLogin?.upline_2 ||

                  // Founder
                  u.upline_3 === userLogin?.upline_3 ||

                  // GM
                  u.upline_4 === userLogin?.upline_4 ||

                  // Supplier
                  u.upline_5 === userLogin?.upline_5 ||

                  // Distributor
                  u.upline_6 === userLogin?.upline_6 ||

                  // Atau dirinya sendiri
                  u.id === userLogin?.id
                );

              });

            }

            this.datatable.items =
              this.mapUserWithBintang(users);

          } else {
            this.showSnackbar(response.data.message || 'Gagal memuat data user', 'error');
          }
        })
        .catch(() => {
          this.showSnackbar('Gagal memuat data user', 'error');
        })
        .finally(() => {
          this.isTableLoading = false;
        });
    },

    async addUser() {
      this.isButtonLoading = true;

      // Helper function untuk mendapatkan text dari options
      const getUplineText = (uplineValue, optionsArray) => {
        if (!uplineValue) return '';
        const option = optionsArray.find(opt => opt.value === uplineValue);
        return option ? option.text : uplineValue;
      };

      // Mapping upline dengan format "code - nama"
      const uplineMapping = {
        upline_1: getUplineText(this.modelAdd.upline_1, this.mvoOptionsAdd),
        upline_2: getUplineText(this.modelAdd.upline_2, this.regionalOptionsAdd),
        upline_3: getUplineText(this.modelAdd.upline_3, this.founderOptionsAdd),
        upline_4: getUplineText(this.modelAdd.upline_4, this.gmOptionsAdd),
        upline_5: getUplineText(this.modelAdd.upline_5, this.supplierOptionsAdd),
        upline_6: getUplineText(this.modelAdd.upline_6, this.distributorOptionsAdd),
      };

      const formData = new FormData();

      // Append data ke FormData
      for (const [key, value] of Object.entries(this.modelAdd)) {
        if (key.startsWith('upline_') && key !== 'upline_7') {
          // Gunakan format "code - nama"
          formData.append(key, uplineMapping[key] || '');
        } else {
          formData.append(key, value ?? '');
        }
      }

      const apiUrls = [
        'https://babaapi.teknosof.com/api/user',
        'https://babaapi.teknosof.com/api/user'
      ];

      const requestConfig = {
        headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
        timeout: 30000
      };

      let lastError = null;
      let success = false;

      for (const apiUrl of apiUrls) {
        try {
          const response = await axios.post(apiUrl, formData, requestConfig);

          if (response.status === 200 || response.status === 201) {
            this.showSnackbar('User berhasil ditambahkan!', 'success');
            this.getAllUser();
            this.isShowDialogAdd = false;
            this.clearAddForm();
            success = true;
            break;
          }
        } catch (error) {
          lastError = error;
          if (error.response) break;

          if (error.code === 'ERR_CERT_DATE_INVALID' || error.code === 'ERR_NETWORK' ||
            error.message?.includes('ERR_CERT') || error.message?.includes('SSL') ||
            error.message?.includes('Network Error')) {
            continue;
          }
          break;
        }
      }

      if (!success && lastError) {
        let message = 'Tambah user gagal';
        if (lastError.response) {
          const status = lastError.response.status;
          const data = lastError.response.data;
          const errorMap = {
            400: data?.message || 'Bad Request',
            409: data?.message || 'Data sudah ada',
            422: JSON.stringify(data?.errors) || 'Data tidak valid',
            500: 'Server error'
          };
          message = errorMap[status] || data?.message || `Error: ${status}`;
        } else if (lastError.code === 'ECONNABORTED') {
          message = 'Timeout';
        } else if (lastError.code === 'ERR_NETWORK') {
          message = 'Network error';
        }
        this.showSnackbar(message, 'error');
      }

      this.isButtonLoading = false;
    },

    editUser(id) {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.expandedMobileCard = null;
      this.clearEditForm();
      this.isShowDialogEdit = true;

      if (this.cabangOptions.length === 0) this.fetchProvinsiData();
      if (this.jabatanOptions.length === 0) this.getAllMvoType();

      // Helper function untuk extract code dari "code - nama"
      const extractCode = (uplineValue) => {
        if (!uplineValue) return '';
        // Jika formatnya "code - nama", ambil code-nya saja
        const parts = uplineValue.split(' - ');
        return parts[0].trim();
      };

      axios.get(`https://babaapi.teknosof.com/api/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (response.data.status === "success") {
            const userData = response.data.data;

            this.modelEdit.id = userData.id;
            this.modelEdit.no_id = userData.no_id || "";
            this.modelEdit.nama = userData.nama || "";
            this.modelEdit.nama_panggilan = userData.nama_panggilan || "";
            this.modelEdit.tempat_lahir = userData.tempat_lahir || "";
            this.modelEdit.tgl_lahir = userData.tgl_lahir || "";
            this.modelEdit.jenis_kelamin = userData.jenis_kelamin || "";
            this.modelEdit.nohp = userData.nohp || "";
            this.modelEdit.alamat = userData.alamat || "";
            this.modelEdit.mvo_type_id = userData.mvo_type_id ? parseInt(userData.mvo_type_id) : "";
            this.modelEdit.username = userData.username || "";
            this.modelEdit.password = "";
            this.modelEdit.cabang = userData.cabang || "";

            // Parse upline (extract code dari "code - nama")
            this.modelEdit.upline_1 = extractCode(userData.upline_1);
            this.modelEdit.upline_2 = extractCode(userData.upline_2);
            this.modelEdit.upline_3 = extractCode(userData.upline_3);
            this.modelEdit.upline_4 = extractCode(userData.upline_4);
            this.modelEdit.upline_5 = extractCode(userData.upline_5);
            this.modelEdit.upline_6 = extractCode(userData.upline_6);

            this.modelEdit.path_gambar_profile = null;

            if (userData.path_gambar_profile) {
              this.previewFotoProfileEdit = userData.path_gambar_profile;
            }

            // Load cascade data untuk edit
            if (this.modelEdit.cabang) this.getMvoEdit(this.modelEdit.cabang);
            if (this.modelEdit.upline_1) this.getRegionalEdit(this.modelEdit.upline_1);
            if (this.modelEdit.upline_2) this.getFounderEdit(this.modelEdit.upline_2);
            if (this.modelEdit.upline_3) this.getGmEdit(this.modelEdit.upline_3);
            if (this.modelEdit.upline_4) this.getSupplierEdit(this.modelEdit.upline_4);
            if (this.modelEdit.upline_5) this.getDistributorEdit(this.modelEdit.upline_5);

          } else {
            this.showSnackbar(response.data.message || 'Gagal mengambil data user', 'error');
            this.isShowDialogEdit = false;
          }
        })
        .catch((error) => {
          this.showSnackbar('Gagal mengambil data user', 'error');
          this.isShowDialogEdit = false;
        });
    },

    async updateUser() {
      this.isButtonLoading = true;

      // Helper function untuk mendapatkan text dari options
      const getUplineText = (uplineValue, optionsArray) => {
        if (!uplineValue) return '';
        const option = optionsArray.find(opt => opt.value === uplineValue);
        return option ? option.text : uplineValue;
      };

      // Mapping upline dengan format "code - nama"
      const uplineMapping = {
        upline_1: getUplineText(this.modelEdit.upline_1, this.mvoOptionsEdit),
        upline_2: getUplineText(this.modelEdit.upline_2, this.regionalOptionsEdit),
        upline_3: getUplineText(this.modelEdit.upline_3, this.founderOptionsEdit),
        upline_4: getUplineText(this.modelEdit.upline_4, this.gmOptionsEdit),
        upline_5: getUplineText(this.modelEdit.upline_5, this.supplierOptionsEdit),
        upline_6: getUplineText(this.modelEdit.upline_6, this.distributorOptionsEdit),
      };

      const formData = new FormData();

      // Append data ke FormData
      for (const [key, value] of Object.entries(this.modelEdit)) {
        if (key !== 'id') {
          if (key.startsWith('upline_') && key !== 'upline_7') {
            // Gunakan format "code - nama"
            formData.append(key, uplineMapping[key] || '');
          } else {
            formData.append(key, value ?? '');
          }
        }
      }
      formData.append('_method', 'PUT');

      const apiUrls = [
        `https://babaapi.teknosof.com/api/user/${this.modelEdit.id}`,
        `https://babaapi.teknosof.com/api/user/${this.modelEdit.id}`
      ];

      const requestConfig = {
        headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
        timeout: 30000
      };

      let lastError = null;
      let success = false;

      for (const apiUrl of apiUrls) {
        try {
          const response = await axios.post(apiUrl, formData, requestConfig);

          if (response.status === 200 || response.status === 201) {
            this.showSnackbar('User berhasil diupdate!', 'success');
            this.getAllUser();
            this.isShowDialogEdit = false;
            this.clearEditForm();
            success = true;
            break;
          }
        } catch (error) {
          lastError = error;
          if (error.response) break;

          if (error.code === 'ERR_CERT_DATE_INVALID' || error.code === 'ERR_NETWORK' ||
            error.message?.includes('ERR_CERT') || error.message?.includes('SSL') ||
            error.message?.includes('Network Error')) {
            continue;
          }
          break;
        }
      }

      if (!success && lastError) {
        let message = 'Update user gagal';
        if (lastError.response) {
          const status = lastError.response.status;
          const data = lastError.response.data;
          const errorMap = {
            400: data?.message || 'Bad Request',
            409: data?.message || 'Data sudah ada',
            422: JSON.stringify(data?.errors) || 'Data tidak valid',
            500: 'Server error'
          };
          message = errorMap[status] || data?.message || `Error: ${status}`;
        } else if (lastError.code === 'ECONNABORTED') {
          message = 'Timeout';
        } else if (lastError.code === 'ERR_NETWORK') {
          message = 'Network error';
        }
        this.showSnackbar(message, 'error');
      }

      this.isButtonLoading = false;
    },

    deleteUser(id) {
      this.expandedMobileCard = null;
      this.isShowDialogDelete = true;
      this.modelDelete.id = id;
    },

    confirmDeleteUser(id) {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.isButtonLoading = true;
      axios.delete(`https://babaapi.teknosof.com/api/user/${id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
        .then((response) => {
          this.getAllUser();
          this.showSnackbar('User berhasil dihapus', 'success');
        })
        .catch((error) => {
          this.showSnackbar('Gagal menghapus user', 'error');
        })
        .finally(() => {
          this.isButtonLoading = false;
          this.isShowDialogDelete = false;
        });
    },

    aktivasiUser(id) {
      const token = Cookies.get("token");
      if (!token) {
        this.$router.push({ name: "Login" });
        return;
      }

      this.expandedMobileCard = null;
      this.isButtonLoading = true;

      axios.post(`https://babaapi.teknosof.com/api/user/aktivasi/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
        .then((response) => {
          this.getAllUser();
          this.showSnackbar('Status aktivasi berhasil diubah', 'success');
        })
        .catch((error) => {
          console.log('error x', error);
          this.showSnackbar(error.response?.data?.message, 'error');
        })
        .finally(() => {
          this.isButtonLoading = false;
        });
    },
  },

  created() {
    this.getAllUser();
    this.fetchProvinsiData();
    this.getAllMvoType();
  },

  watch: {
    'modelAdd.mvo_type_id'() {

      this.modelAdd.upline_1 = ''
      this.modelAdd.upline_2 = ''
      this.modelAdd.upline_3 = ''
      this.modelAdd.upline_4 = ''
      this.modelAdd.upline_5 = ''
      this.modelAdd.upline_6 = ''
    },
    'datatable.search': {
      handler() {
        this.expandedMobileCard = null;
      }
    }
  }
};
</script>
<style scoped>
.box-glass {
  position: relative;
  padding: 22px 18px;
  margin-bottom: 26px;
  border-radius: 18px;
  border: 1px solid rgba(255, 215, 0, 0.4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.box-glass-title {
  font-size: 14px;
  font-weight: bold;
  color: #FFD700;
  margin-bottom: 14px;
}

.input-box {
  border: 2px solid #FFD700;
  /* Garis kotak emas */
  border-radius: 14px;
  /* Sudut membulat */
  padding: 20px 16px 16px 16px;
  /* Jarak isi ke garis */
  margin-top: 16px;
  margin-bottom: 24px;
  position: relative;
  /* Background tipis */
}

/* Judul di atas garis */
.input-box-title {
  position: absolute;
  top: -12px;
  left: 18px;
  background: #1e1e1e;
  /* Samakan background dialog */
  padding: 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: #FFD700;
  letter-spacing: 1px;
}

/* Desktop Table Styling */
:deep(.v-data-table) {
  border: 1px solid #000000;
}

:deep(.v-data-table__th) {
  background-color: #888888 !important;
  color: #FFD700 !important;
  font-weight: bold;
}

/* Mobile Header Card */




.search-field-mobile {
  margin-top: 8px;
}

/* Mobile User Cards */
.mobile-user-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #ffffff;
}

.mobile-user-card:hover {
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

.mobile-username {
  font-size: 16px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.mobile-name {
  font-size: 14px;
  color: #666;
}

.mobile-card-details {
  padding: 16px !important;
  background-color: #f8f9fa;
}

.detail-label {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.detail-value {
  color: #666;
  font-size: 14px;
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

/* Icon rotation animation */
.rotate-180 {
  transform: rotate(180deg);
}

.transition-all {
  transition: transform 0.3s ease;
}

/* Custom Dialog Styling */
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

/* Mobile Dialog Adjustments */
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
}

/* Custom styling untuk required fields */
:deep(.v-text-field input:required),
:deep(.v-select input:required),
:deep(.v-autocomplete input:required) {
  border-left: 3px solid #FFD700;
}

/* Loading state styling */
:deep(.v-progress-circular) {
  color: #FFD700 !important;
}

:deep(.v-progress-linear) {
  border-radius: 4px;
}

/* Error message styling */
:deep(.v-messages__message) {
  color: #d32f2f !important;
  font-size: 12px;
}

/* Success message styling */
.v-snackbar.success {
  background-color: #4caf50 !important;
}

/* Custom styling for jabatan display */
.jabatan-display {
  color: #1976d2;
  font-weight: 500;
}

.jabatan-empty {
  color: #9e9e9e;
  font-style: italic;
}

/* Responsive breakpoints */
@media (max-width: 960px) {
  .mobile-actions .v-btn {
    font-size: 12px;
    padding: 0 8px;
  }
}

@media (max-width: 600px) {
  .mobile-user-card {
    margin-left: 8px;
    margin-right: 8px;
  }

  .mobile-header-card {
    margin-left: 8px;
    margin-right: 8px;
  }
}
</style>