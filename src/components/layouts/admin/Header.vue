<template>
  <v-app-bar color="#141414" flat class="baba-appbar" :height="$vuetify.display.smAndDown ? 60 : 64">
    <!-- tombol buka drawer - disembunyikan di mobile -->
    <v-app-bar-nav-icon @click="this.app.drawer = !this.app.drawer" color="#F6D365" class="d-none d-md-flex">
    </v-app-bar-nav-icon>

    <!-- Foto ruang kota (cabang) -->
    <div v-if="headerData?.foto_ruang_kota" class="ml-3 ml-md-1 mr-3">
      <v-avatar :size="$vuetify.display.smAndDown ? 36 : 40" class="appbar-city">
        <v-img :src="getHeaderImageUrl(headerData.foto_ruang_kota)" :alt="`Logo ${headerData.code}`"
          @error="onHeaderImageError" @load="onHeaderImageLoad" cover />
      </v-avatar>
    </div>

    <!-- Judul + info cabang & user -->
    <div class="appbar-title" :class="{ 'ml-3': !headerData?.foto_ruang_kota }">
      <div class="appbar-brand">BABA PARFUME</div>
      <div v-if="!isLoadingHeader && (headerData?.code || currentUserName)" class="appbar-meta">
        <span v-if="headerData?.code" class="appbar-chip">
          <v-icon size="12">mdi-map-marker</v-icon>{{ headerData.code }}
        </span>
        <span v-if="currentUserName" class="appbar-user">{{ currentUserName }}</span>
        <span v-if="currentUserMvoTypeName" class="appbar-role d-none d-sm-inline">
          · {{ currentUserMvoTypeName }}
        </span>
        <v-progress-circular v-else-if="isLoadingMvoType" indeterminate size="10" width="2" color="#F6D365"
          class="ml-1"></v-progress-circular>
      </div>
      <div v-if="isLoadingHeader" class="appbar-meta">
        <v-progress-circular indeterminate size="10" width="2" color="#F6D365" class="mr-1"></v-progress-circular>
        Memuat data cabang...
      </div>
    </div>

    <template v-slot:append>
      <!-- Panduan cara pakai halaman yang sedang dibuka -->
      <CaraPakai />

      <!-- Desktop: tombol aksi terpisah -->
      <div class="d-none d-md-flex align-center">
        <v-tooltip text="Info Header" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-information-outline" color="#F6D365" variant="text" size="small" class="mr-1"
              @click="showHeaderInfo" v-bind="props"></v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Refresh Header" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-refresh" color="#F6D365" variant="text" size="small" class="mr-1"
              @click="refreshHeaderData" :loading="isRefreshing" v-bind="props"></v-btn>
          </template>
        </v-tooltip>
      </div>

      <!-- Foto profil: di HP sekaligus menu aksi -->
      <v-menu location="bottom end" offset="8">
        <template v-slot:activator="{ props }">
          <v-btn icon variant="text" size="small" class="mr-1 mr-md-2" v-bind="props" aria-label="Menu akun">
            <v-avatar size="34" class="appbar-avatar">
              <v-img v-if="getCurrentUser()?.path_gambar_profile"
                :src="getProfileImageUrl(getCurrentUser()?.path_gambar_profile)" :alt="currentUserName" cover />
              <v-icon v-else color="#F6D365">mdi-account-circle</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-list density="comfortable" min-width="220" class="py-1">
          <v-list-item v-if="currentUserName" :title="currentUserName"
            :subtitle="currentUserMvoTypeName || headerData?.code || ''" class="mb-1"></v-list-item>
          <v-divider class="mb-1"></v-divider>
          <v-list-item prepend-icon="mdi-account-outline" title="Profil Saya" @click="goToProfile"></v-list-item>
          <v-list-item prepend-icon="mdi-information-outline" title="Info Cabang" class="d-md-none"
            @click="showHeaderInfo"></v-list-item>
          <v-list-item prepend-icon="mdi-refresh" title="Muat Ulang Data" class="d-md-none"
            @click="refreshHeaderData"></v-list-item>
          <v-divider class="my-1"></v-divider>
          <v-list-item prepend-icon="mdi-logout" title="Keluar" base-color="error" @click="handleLogout"
            :disabled="isLoggingOut"></v-list-item>
        </v-list>
      </v-menu>

      <!-- Desktop: tombol keluar -->
      <v-tooltip text="Keluar" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-logout" color="#F6D365" variant="text" class="d-none d-md-flex mr-2"
            @click="handleLogout" :loading="isLoggingOut" v-bind="props"></v-btn>
        </template>
      </v-tooltip>
    </template>

    <v-dialog v-model="headerInfoDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6 bg-amber text-black">
          <v-icon class="mr-2">mdi-information</v-icon>
          Informasi Header
        </v-card-title>

        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="12">
              <v-alert :type="headerData?.code ? 'success' : 'warning'" variant="tonal" class="mb-3">
                <v-alert-title>Status Code</v-alert-title>
                <div>{{ headerData?.code || 'Tidak tersedia' }}</div>
              </v-alert>

              <!-- Preview gambar jika ada - DITAMBAHKAN -->
              <v-card v-if="headerData?.foto_ruang_kota" variant="outlined" class="mb-3">
                <v-card-title class="text-subtitle-1">Preview Gambar</v-card-title>
                <v-card-text class="text-center">
                  <v-img :src="getHeaderImageUrl(headerData.foto_ruang_kota)" :alt="`Preview ${headerData.code}`"
                    max-height="150" contain class="rounded" @error="onHeaderImageError" @load="onHeaderImageLoad">
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular indeterminate color="amber"></v-progress-circular>
                      </v-row>
                    </template>
                  </v-img>
                </v-card-text>
              </v-card>

              <v-list density="compact">
                <v-list-item>
                  <v-list-item-title>User Login</v-list-item-title>
                  <v-list-item-subtitle>{{ getCurrentUser()?.nama || 'Unknown' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Code User</v-list-item-title>
                  <v-list-item-subtitle>{{ getCurrentUser()?.code || 'Tidak tersedia' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Data Terakhir Diperbarui</v-list-item-title>
                  <v-list-item-subtitle>{{ getLastUpdateTime() }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="amber" variant="text" @click="headerInfoDialog = false">
            Tutup
          </v-btn>
          <v-btn color="amber" variant="tonal" @click="refreshHeaderData; headerInfoDialog = false">
            <v-icon start>mdi-refresh</v-icon>
            Refresh
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Snackbar for messages -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="top">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" color="white" @click="snackbar.show = false">
          Tutup
        </v-btn>
      </template>
    </v-snackbar>
  </v-app-bar>
</template>

<script>
import { API_URL, FILE_URL } from "@/config";
import { useAppStore } from "@/stores/app.js";
import axios from "axios";
import Cookies from "js-cookie";
import CaraPakai from "@/components/panduan/CaraPakai.vue";
import { hentikanChat } from "@/utils/chatKoneksi";

export default {
  components: { CaraPakai },
  setup() {
    const app = useAppStore();
    return { app };
  },

  data() {
    return {
      isLoggingOut: false,
      isRefreshing: false,
      headerData: null,
      isLoadingHeader: false,
      headerInfoDialog: false,
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      currentUserName: '',
      currentUserMvoTypeId: '',
      currentUserMvoTypeName: '', // DITAMBAHKAN untuk menyimpan nama MVO Type
      isLoadingMvoType: false // DITAMBAHKAN untuk loading state
    }
  },

  methods: {
    async fetchMvoTypeName() {
      const mvoTypeId = this.getCurrentUserMvoTypeId();

      if (!mvoTypeId) {
        return null;
      }

      this.isLoadingMvoType = true;

      try {
        const token = Cookies.get("token");

        if (!token) {
          return null;
        }


        const apiClient = axios.create({
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        let mvoTypeResponse;

        try {
          mvoTypeResponse = await apiClient.get(`${API_URL}/api/mvo-type`);
        } catch (httpsError) {

          if (httpsError.code === 'ERR_NETWORK' ||
            httpsError.message.includes('certificate') ||
            httpsError.message.includes('ERR_CERT_DATE_INVALID') ||
            httpsError.response?.status === undefined) {

            mvoTypeResponse = await apiClient.get(`${API_URL}/api/mvo-type`);
          } else {
            throw httpsError;
          }
        }


        if (mvoTypeResponse.data && mvoTypeResponse.data.status === 'success') {
          const mvoTypes = mvoTypeResponse.data.data;

          if (Array.isArray(mvoTypes) && mvoTypes.length > 0) {

            // Cari MVO Type berdasarkan ID
            const matchedMvoType = mvoTypes.find(type =>
              type.id == mvoTypeId || type.mvo_type_id == mvoTypeId
            );

            if (matchedMvoType && matchedMvoType.name) {
              this.currentUserMvoTypeName = matchedMvoType.name;

              // Simpan ke localStorage untuk cache
              localStorage.setItem('mvoTypeName', matchedMvoType.name);

              return matchedMvoType.name;
            } else {
              this.currentUserMvoTypeName = `ID: ${mvoTypeId}`;
              return null;
            }
          }
        }

        return null;

      } catch (error) {
        // Fallback: tampilkan ID jika gagal fetch
        this.currentUserMvoTypeName = `ID: ${mvoTypeId}`;
        return null;
      } finally {
        this.isLoadingMvoType = false;
      }
    },

    getCurrentUserMvoTypeId() {
      const user = this.getCurrentUser();
      return user?.mvo_type_id || '';
    },

    loadMvoTypeFromStorage() {

      try {
        const storedMvoTypeName = localStorage.getItem('mvoTypeName');
        if (storedMvoTypeName) {
          this.currentUserMvoTypeName = storedMvoTypeName;
        }
      } catch (error) {
      }
    },

    goToProfile() {
      this.$router.push({ name: 'Profil' }).catch(error => {
        this.$router.push('/admin/Profil').catch(pathError => {
          this.showSnackbar('Gagal membuka halaman profil', 'error');
        });
      });
    },

    getProfileImageUrl(pathGambarProfile) {
      if (!pathGambarProfile) {
        return '';
      }

      if (pathGambarProfile.startsWith('http://') || pathGambarProfile.startsWith('https://')) {
        return pathGambarProfile;
      }

      const cleanPath = pathGambarProfile.startsWith('/') ? pathGambarProfile.substring(1) : pathGambarProfile;
      return `${FILE_URL}/${cleanPath}`;
    },

    showHeaderInfo() {
      this.headerInfoDialog = true;
    },

    getCurrentUser() {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          return JSON.parse(userData);
        }
      } catch (error) {
      }
      return null;
    },

    getCurrentUserName() {
      const user = this.getCurrentUser();
      return user?.nama || '';
    },

    getLastUpdateTime() {
      try {
        const headerData = localStorage.getItem('headerData');
        const userData = localStorage.getItem('user');

        if (headerData || userData) {
          return new Date().toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        }
      } catch (error) {
      }
      return 'Tidak diketahui';
    },

    // Get full URL for header image - DITAMBAHKAN
    getHeaderImageUrl(fotoRuangKota) {
      if (!fotoRuangKota) {
        return '';
      }


      if (fotoRuangKota.startsWith('http://') || fotoRuangKota.startsWith('https://')) {
        return fotoRuangKota;
      }

      const cleanPath = fotoRuangKota.startsWith('/') ? fotoRuangKota.substring(1) : fotoRuangKota;
      const httpsUrl = `${FILE_URL}/${cleanPath}`;

      return httpsUrl;
    },

    // Handle header image loading errors - DITAMBAHKAN
    // v-img mengirim src (teks), bukan event; cukup dicatat agar tidak error saat foto cabang hilang.
    onHeaderImageError(src) {
      console.warn("Foto cabang gagal dimuat:", src);
    },

    // Handle successful image load - DITAMBAHKAN
    onHeaderImageLoad(event) {
    },

    // Debug method untuk melihat URL yang di-generate - DITAMBAHKAN
    debugImageUrl() {
      if (this.headerData?.foto_ruang_kota) {
        const fullUrl = this.getHeaderImageUrl(this.headerData.foto_ruang_kota);

        const img = new Image();
        img.onload = () => {
          this.showSnackbar('✅ Gambar dapat diakses', 'success');
        };
        img.onerror = () => {
          this.showSnackbar('❌ Gambar tidak dapat diakses', 'error');
        };
        img.src = fullUrl;
      } else {
        this.showSnackbar('❌ Tidak ada path gambar untuk di-debug', 'info');
      }
    },

    getUserCode() {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          // User menyimpan "cabang", kita gunakan itu untuk matching dengan "code" di API
          return user.cabang || user.code || null;
        }
      } catch (error) {
      }
      return null;
    },

    async fetchHeaderData() {
      this.isLoadingHeader = true;

      try {
        const token = Cookies.get("token");

        if (!token) {
          return null;
        }

        const userCode = this.getUserCode();

        const apiClient = axios.create({
          timeout: 20000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        let headerResponse;

        try {
          headerResponse = await apiClient.get(`${API_URL}/api/provinsi`);
        } catch (httpsError) {

          if (httpsError.code === 'ERR_NETWORK' ||
            httpsError.message.includes('certificate') ||
            httpsError.message.includes('ERR_CERT_DATE_INVALID') ||
            httpsError.response?.status === undefined) {

            headerResponse = await apiClient.get(`${API_URL}/api/provinsi`);
          } else {
            throw httpsError;
          }
        }


        let headerData = null;


        if (headerResponse.data && headerResponse.data.status === 'success') {
          if (Array.isArray(headerResponse.data.data) && headerResponse.data.data.length > 0) {

            const availableCode = headerResponse.data.data.map(item => item.code).filter(Boolean);

            let matchedHeader = null;

            if (userCode) {

              matchedHeader = headerResponse.data.data.find(header =>
                header.code &&
                header.code.toUpperCase().trim() === userCode.toUpperCase().trim()
              );

              if (matchedHeader) {
              } else {
              }
            }

            if (!matchedHeader && headerResponse.data.data.length > 0) {
              matchedHeader = headerResponse.data.data[0];
            }

            if (matchedHeader) {
              headerData = {
                code: matchedHeader.code || userCode || 'Code Tidak Ditemukan',
                foto_ruang_kota: matchedHeader.foto_ruang_kota || null
              };
            }
          }
        }

        if (headerData) {

          localStorage.setItem('headerData', JSON.stringify(headerData))
          this.headerData = headerData

          this.$forceUpdate()

          return headerData
        } else {

          if (userCode) {
            const fallbackHeaderData = {
              code: userCode,
              foto_ruang_kota: null
            };
            localStorage.setItem('headerData', JSON.stringify(fallbackHeaderData));
            this.headerData = fallbackHeaderData;
            this.$forceUpdate();
            return fallbackHeaderData;
          }

          return null
        }

      } catch (error) {

        const userCode = this.getUserCode();
        if (userCode) {
          const errorFallbackData = {
            code: userCode,
            foto_ruang_kota: null
          };
          localStorage.setItem('headerData', JSON.stringify(errorFallbackData));
          this.headerData = errorFallbackData;
          this.$forceUpdate();
          this.showSnackbar('Gagal memuat gambar header, menggunakan data code user', 'warning');
          return errorFallbackData;
        }

        this.showSnackbar('Gagal memuat data header', 'warning')
        return null
      } finally {
        this.isLoadingHeader = false
      }
    },

    async refreshHeaderData() {
      this.isRefreshing = true;

      try {
        const newHeaderData = await this.fetchHeaderData();

        if (newHeaderData) {
          const message = newHeaderData.foto_ruang_kota
            ? `✅ Data header berhasil diperbarui - ${newHeaderData.code} (dengan gambar)`
            : `✅ Data header berhasil diperbarui - ${newHeaderData.code} (tanpa gambar)`;
          this.showSnackbar(message, 'success');
        } else {
          this.showSnackbar('⚠️ Tidak dapat memperbarui data header', 'warning');
        }
      } catch (error) {
        this.showSnackbar('❌ Gagal memperbarui data header', 'error');
      } finally {
        this.isRefreshing = false;
      }
    },

    loadHeaderDataFromStorage() {

      try {
        const storedHeaderData = localStorage.getItem('headerData');
        if (storedHeaderData) {
          this.headerData = JSON.parse(storedHeaderData);
          this.$forceUpdate();
        } else {
          this.fetchHeaderData();
        }
      } catch (error) {
        this.fetchHeaderData();
      }
    },

    async handleLogout() {
      this.isLoggingOut = true;

      try {
        const token = Cookies.get("token");

        if (!token) {
          this.performLocalLogout();
          return;
        }

        const apiClient = axios.create({
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        let logoutSuccess = false;

        try {
          await apiClient.post(`${API_URL}/api/logout`, {});
          logoutSuccess = true;
        } catch (httpsError) {

          if (httpsError.code === 'ERR_NETWORK' ||
            httpsError.message.includes('certificate') ||
            httpsError.message.includes('ERR_CERT_DATE_INVALID')) {

            try {
              await apiClient.post(`${API_URL}/api/logout`, {});
              logoutSuccess = true;
            } catch (httpError) {
            }
          } else {
          }
        }

        this.performLocalLogout(logoutSuccess);

      } catch (error) {
        this.performLocalLogout(false);
      } finally {
        this.isLoggingOut = false;
      }
    },

    performLocalLogout(apiSuccess = true) {

      hentikanChat();
      Cookies.remove("token");
      localStorage.removeItem("peran");
      localStorage.removeItem("user");
      localStorage.removeItem("headerData");
      localStorage.removeItem("workingAudioPattern");
      localStorage.removeItem("mvo_type_id");
      localStorage.removeItem("token");
      localStorage.removeItem("mvo_id");
      localStorage.removeItem("mvoTypeName");

      this.headerData = null;
      this.currentUserName = '';
      this.currentUserMvoTypeId = ''; // DITAMBAHKAN
      delete axios.defaults.headers.common['Authorization'];

      if (apiSuccess) {
        this.showSnackbar('Berhasil logout', 'success');
      } else {
        this.showSnackbar('Anda telah logout (offline)', 'info');
      }

      setTimeout(() => {
        this.$router.push({ name: "Login" }).catch(error => {
          this.$router.push("/admin/login").catch(pathError => {
            window.location.href = '/admin/login';
          });
        });
      }, 1000);
    },

    showSnackbar(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    isLoggedIn() {
      return !!Cookies.get('token');
    },

    handleStorageChange(event) {
      if (event.key === 'headerData') {
        try {
          if (event.newValue) {
            this.headerData = JSON.parse(event.newValue);
          } else {
            this.headerData = null;
          }
        } catch (error) {
        }
      } else if (event.key === 'user') {
        this.currentUserName = this.getCurrentUserName();
        this.currentUserMvoTypeId = this.getCurrentUserMvoTypeId();

        // Fetch ulang MVO Type name jika user berubah
        if (this.currentUserMvoTypeId) {
          this.fetchMvoTypeName();
        }
      } else if (event.key === 'mvoTypeName') {
        try {
          if (event.newValue) {
            this.currentUserMvoTypeName = event.newValue;
          }
        } catch (error) {
        }
      }
    }
  },

  mounted() {

    if (!this.isLoggedIn()) {
      this.$router.push({ name: "Login" }).catch(() => {
        this.$router.push("/admin/login");
      });
      return;
    }

    this.currentUserName = this.getCurrentUserName();
    this.currentUserMvoTypeId = this.getCurrentUserMvoTypeId();

    // Load dari storage dulu untuk tampilan cepat
    this.loadMvoTypeFromStorage();

    this.loadHeaderDataFromStorage();

    setTimeout(() => {
      this.fetchHeaderData();

      // Fetch MVO Type name
      if (this.currentUserMvoTypeId) {
        this.fetchMvoTypeName();
      }
    }, 500);

    window.addEventListener('storage', this.handleStorageChange);
  },

  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
  }
};
</script>

<style scoped>
/* Optional: Add some custom styles for better image display */
.v-avatar img {
  object-fit: cover;
}

/* Loading animation for header */
@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

.header-loading {
  animation: pulse 1.5s ease-in-out infinite;
}

/* ===== App bar ===== */
.baba-appbar {
  border-bottom: 1px solid rgba(230, 180, 34, 0.25) !important;
}

.appbar-city,
.appbar-avatar {
  border: 1.5px solid var(--baba-gold);
}

.appbar-title {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1 1 auto;
  line-height: 1.2;
}

.appbar-brand {
  color: var(--baba-gold-light);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.appbar-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  margin-top: 2px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
}

.appbar-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 6px;
  border-radius: 6px;
  background: rgba(230, 180, 34, 0.18);
  color: var(--baba-gold-light);
  font-weight: 600;
  flex-shrink: 0;
}

.appbar-user {
  overflow: hidden;
  text-overflow: ellipsis;
}

.appbar-role {
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 599.98px) {
  .appbar-brand {
    font-size: 0.95rem;
  }
}
</style>
