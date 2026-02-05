<template>
  <v-app-bar color="#0d0d0d" flat>
    <!-- tombol buka drawer - disembunyikan di mobile -->
    <v-app-bar-nav-icon @click="this.app.drawer = !this.app.drawer" color="#d4af37" class="d-none d-md-flex">
    </v-app-bar-nav-icon>

    <!-- Gambar Header Avatar - DITAMBAHKAN -->
    <div v-if="headerData?.path_gambar_header" class="mr-3">
      <v-avatar size="40" class="border-2 border-amber">
        <v-img :src="getHeaderImageUrl(headerData.path_gambar_header)" :alt="`Logo ${headerData.cabang}`"
          @error="onHeaderImageError" @load="onHeaderImageLoad" cover />
      </v-avatar>
    </div>

    <!-- Judul dengan Cabang -->
    <v-app-bar-title class="d-flex align-center">
      <div class="d-flex flex-column">
        <span class="text-h6 font-weight-bold" style="color: #d4af37; letter-spacing: 1px;">
          BABA PARFUME
        </span>
        <div v-if="(headerData?.cabang || currentUserName) && !isLoadingHeader" class="d-flex align-center mt-n1">
          <span v-if="headerData?.cabang" class="text-caption font-weight-medium"
            style="color: #f4e47c; margin-right: 8px;">
            📍 {{ headerData.cabang }}
          </span>
          <span v-if="headerData?.cabang && currentUserName" class="text-caption" style="color: #d4af37;">
            |
          </span>
          <span v-if="currentUserName" class="text-caption font-weight-medium" style="color: #d4af37;">
            👤 {{ currentUserName }}
          </span>
        </div>
        <span v-if="isLoadingHeader" class="text-caption" style="color: #d4af37;">
          <v-progress-circular indeterminate size="12" width="2" color="amber" class="mr-1"></v-progress-circular>
          Loading cabang & gambar...
        </span>
      </div>
    </v-app-bar-title>

    <template v-slot:append>
      <!-- Profile Button -->
      <v-tooltip text="Profil Saya" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn icon color="#d4af37" @click="goToProfile" v-bind="props" size="small" class="mr-2">
            <v-badge v-if="getCurrentUser()?.path_gambar_profile" dot color="success" location="bottom right">
              <v-avatar size="32">
                <v-img :src="getProfileImageUrl(getCurrentUser()?.path_gambar_profile)" :alt="currentUserName" cover />
              </v-avatar>
            </v-badge>
            <v-icon v-else>mdi-account-circle</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <!-- Tombol Detail header -->
      <v-tooltip text="Info Header" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-information" color="#d4af37" @click="showHeaderInfo" v-bind="props" size="small"
            class="mr-2">
          </v-btn>
        </template>
      </v-tooltip>


      <!-- Refresh Button -->
      <v-tooltip text="Refresh Header" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-refresh" color="#d4af37" @click="refreshHeaderData" v-bind="props" :loading="isRefreshing"
            size="small" class="mr-2">
          </v-btn>
        </template>
      </v-tooltip>

      <!-- Logout Button -->
      <v-tooltip text="Logout" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-logout" color="#d4af37" @click="handleLogout" v-bind="props" :loading="isLoggingOut">
          </v-btn>
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
              <v-alert :type="headerData?.cabang ? 'success' : 'warning'" variant="tonal" class="mb-3">
                <v-alert-title>Status Cabang</v-alert-title>
                <div>{{ headerData?.cabang || 'Tidak tersedia' }}</div>
              </v-alert>

              <!-- <v-alert :type="headerData?.path_gambar_header ? 'success' : 'info'" variant="tonal" class="mb-3">
                <v-alert-title>Status Gambar Header</v-alert-title>
                <div v-if="headerData?.path_gambar_header">
                  ✅ Tersedia: {{ headerData.path_gambar_header }}
                </div>
                <div v-else>
                  ℹ️ Tidak ada gambar header untuk cabang ini
                </div>
              </v-alert> -->

              <!-- Preview gambar jika ada - DITAMBAHKAN -->
              <v-card v-if="headerData?.path_gambar_header" variant="outlined" class="mb-3">
                <v-card-title class="text-subtitle-1">Preview Gambar</v-card-title>
                <v-card-text class="text-center">
                  <v-img :src="getHeaderImageUrl(headerData.path_gambar_header)" :alt="`Preview ${headerData.cabang}`"
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
                  <v-list-item-title>Cabang User</v-list-item-title>
                  <v-list-item-subtitle>{{ getCurrentUser()?.cabang || 'Tidak tersedia' }}</v-list-item-subtitle>
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

    <!-- ikon tambahan -->
    <i class="fa fa-share-alt-square" aria-hidden="true" style="color:#d4af37; font-size:20px; margin-left:10px;"></i>

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
import { useAppStore } from "@/stores/app.js";
import axios from "axios";
import Cookies from "js-cookie";

export default {
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
      currentUserName: ''
    }
  },

  methods: {
    goToProfile() {
      console.log('Navigating to profile page...');
      this.$router.push({ name: 'Profil' }).catch(error => {
        console.warn('Named route failed, trying path:', error);
        this.$router.push('/admin/Profil').catch(pathError => {
          console.error('Navigation to profile failed:', pathError);
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
      return `https://babaapi.teknosof.com/project/public/${cleanPath}`;
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
        console.error('Error getting current user:', error);
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
        console.error('Error getting last update time:', error);
      }
      return 'Tidak diketahui';
    },

    // Get full URL for header image - DITAMBAHKAN
    getHeaderImageUrl(pathGambarHeader) {
      if (!pathGambarHeader) {
        console.log('No image path provided');
        return '';
      }

      console.log('Original image path:', pathGambarHeader);

      if (pathGambarHeader.startsWith('http://') || pathGambarHeader.startsWith('https://')) {
        console.log('Full URL detected:', pathGambarHeader);
        return pathGambarHeader;
      }

      const cleanPath = pathGambarHeader.startsWith('/') ? pathGambarHeader.substring(1) : pathGambarHeader;
      const httpsUrl = `https://babaapi.teknosof.com/project/public/${cleanPath}`;
      console.log('Generated HTTPS URL:', httpsUrl);

      return httpsUrl;
    },

    // Handle header image loading errors - DITAMBAHKAN
    onHeaderImageError(event) {
      console.warn('❌ Header image failed to load:', event.target.src);

      if (this.headerData?.path_gambar_header && event.target.src.includes('https://')) {
        const httpUrl = event.target.src.replace('https://babaapi.teknosof.com/project/public/', 'https://babaapi.teknosof.com/project/public/');
        console.log('🔄 Trying HTTP fallback for header image:', httpUrl);
        event.target.src = httpUrl;
      } else {
        console.error('❌ Both HTTPS and HTTP failed for header image');
      }
    },

    // Handle successful image load - DITAMBAHKAN
    onHeaderImageLoad(event) {
      console.log('✅ Header image loaded successfully:', event.target.src);
    },

    // Debug method untuk melihat URL yang di-generate - DITAMBAHKAN
    debugImageUrl() {
      if (this.headerData?.path_gambar_header) {
        const fullUrl = this.getHeaderImageUrl(this.headerData.path_gambar_header);
        console.log('🔍 Debug Image URL:');
        console.log('📁 Original path:', this.headerData.path_gambar_header);
        console.log('🌐 Full URL:', fullUrl);
        console.log('🏢 Cabang:', this.headerData.cabang);
        console.log('👤 User cabang:', this.getUserCabang());

        const img = new Image();
        img.onload = () => {
          console.log('✅ Image is accessible');
          this.showSnackbar('✅ Gambar dapat diakses', 'success');
        };
        img.onerror = () => {
          console.error('❌ Image is not accessible');
          this.showSnackbar('❌ Gambar tidak dapat diakses', 'error');
        };
        img.src = fullUrl;
      } else {
        console.log('❌ No image path available for debugging');
        this.showSnackbar('❌ Tidak ada path gambar untuk di-debug', 'info');
      }
    },

    getUserCabang() {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          return user.cabang || null;
        }
      } catch (error) {
        console.error('Error getting user cabang:', error);
      }
      return null;
    },

    async fetchHeaderData() {
      this.isLoadingHeader = true;

      try {
        const token = Cookies.get("token");

        if (!token) {
          console.log('No token available for header request');
          return null;
        }

        const userCabang = this.getUserCabang();
        console.log('🔍 Fetching header data from API...');
        console.log('👤 User cabang:', userCabang);

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
          console.log('🔐 Trying HTTPS: https://babaapi.teknosof.com/api/gambar-header');
          headerResponse = await apiClient.get('https://babaapi.teknosof.com/api/gambar-header');
          console.log('✅ HTTPS request successful');
        } catch (httpsError) {
          console.warn('❌ HTTPS header request failed:', httpsError.message);

          if (httpsError.code === 'ERR_NETWORK' ||
            httpsError.message.includes('certificate') ||
            httpsError.message.includes('ERR_CERT_DATE_INVALID') ||
            httpsError.response?.status === undefined) {

            console.log('🔓 Trying HTTP: https://babaapi.teknosof.com/api/gambar-header');
            headerResponse = await apiClient.get('https://babaapi.teknosof.com/api/gambar-header');
            console.log('✅ HTTP request successful');
          } else {
            throw httpsError;
          }
        }

        console.log('📊 Header API response:', headerResponse.data);

        let headerData = null;

        console.log('🔄 Processing response structure...');
        console.log('📈 Response status:', headerResponse.data.status);
        console.log('📋 Response data type:', typeof headerResponse.data.data);
        console.log('💾 Response data:', headerResponse.data.data);

        if (headerResponse.data && headerResponse.data.status === 'success') {
          if (Array.isArray(headerResponse.data.data) && headerResponse.data.data.length > 0) {
            console.log('📚 Processing array data, all items:', headerResponse.data.data);

            const availableCabang = headerResponse.data.data.map(item => item.cabang).filter(Boolean);
            console.log('🏢 Available cabang in API:', availableCabang);

            let matchedHeader = null;

            if (userCabang) {
              matchedHeader = headerResponse.data.data.find(header =>
                header.cabang &&
                header.cabang.toUpperCase().trim() === userCabang.toUpperCase().trim()
              );

              if (matchedHeader) {
                console.log('🎯 Perfect match found for cabang:', userCabang);
                console.log('✅ Matched header:', matchedHeader);
              } else {
                console.log('⚠️ No exact match found for cabang:', userCabang);
                console.log('🔍 Available cabang for comparison:', availableCabang);
              }
            }

            if (!matchedHeader && headerResponse.data.data.length > 0) {
              matchedHeader = headerResponse.data.data[0];
              console.log('🔄 Using first header as fallback:', matchedHeader);
            }

            if (matchedHeader) {
              headerData = {
                cabang: matchedHeader.cabang || userCabang || 'Cabang Tidak Ditemukan',
                path_gambar_header: matchedHeader.path_gambar_header || null
              };
              console.log('✨ Processed header data from matched header:', headerData);
            }
          }
        }

        if (headerData) {
          console.log('💾 Final processed header data:', headerData)

          localStorage.setItem('headerData', JSON.stringify(headerData))
          this.headerData = headerData
          console.log('✅ Header data berhasil diambil dan disimpan:', headerData)

          this.$forceUpdate()

          return headerData
        } else {
          console.warn('❌ No valid header data found in any response structure')

          if (userCabang) {
            const fallbackHeaderData = {
              cabang: userCabang,
              path_gambar_header: null
            };
            localStorage.setItem('headerData', JSON.stringify(fallbackHeaderData));
            this.headerData = fallbackHeaderData;
            console.log('🔄 Created fallback header data:', fallbackHeaderData);
            this.$forceUpdate();
            return fallbackHeaderData;
          }

          return null
        }

      } catch (error) {
        console.error('❌ Error fetching header data:', error)

        const userCabang = this.getUserCabang();
        if (userCabang) {
          const errorFallbackData = {
            cabang: userCabang,
            path_gambar_header: null
          };
          localStorage.setItem('headerData', JSON.stringify(errorFallbackData));
          this.headerData = errorFallbackData;
          console.log('🛡️ Created error fallback header data:', errorFallbackData);
          this.$forceUpdate();
          this.showSnackbar('Gagal memuat gambar header, menggunakan data cabang user', 'warning');
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
        console.log('🔄 Manual refresh initiated...');
        const newHeaderData = await this.fetchHeaderData();

        if (newHeaderData) {
          const message = newHeaderData.path_gambar_header
            ? `✅ Data header berhasil diperbarui - ${newHeaderData.cabang} (dengan gambar)`
            : `✅ Data header berhasil diperbarui - ${newHeaderData.cabang} (tanpa gambar)`;
          this.showSnackbar(message, 'success');
        } else {
          this.showSnackbar('⚠️ Tidak dapat memperbarui data header', 'warning');
        }
      } catch (error) {
        console.error('Error refreshing header:', error);
        this.showSnackbar('❌ Gagal memperbarui data header', 'error');
      } finally {
        this.isRefreshing = false;
      }
    },

    loadHeaderDataFromStorage() {
      console.log('Loading header data from storage...');

      try {
        const storedHeaderData = localStorage.getItem('headerData');
        if (storedHeaderData) {
          this.headerData = JSON.parse(storedHeaderData);
          console.log('Header data loaded from storage:', this.headerData);
          this.$forceUpdate();
        } else {
          console.log('No header data found in storage, fetching from API...');
          this.fetchHeaderData();
        }
      } catch (error) {
        console.error('Error loading header data from storage:', error);
        this.fetchHeaderData();
      }
    },

    async handleLogout() {
      console.log('Logout attempt started...');
      this.isLoggingOut = true;

      try {
        const token = Cookies.get("token");

        if (!token) {
          console.log('No token found, performing local logout...');
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
          console.log('Attempting HTTPS logout...');
          await apiClient.post('https://babaapi.teknosof.com/api/logout', {});
          logoutSuccess = true;
          console.log('HTTPS logout successful');
        } catch (httpsError) {
          console.warn('HTTPS logout failed, trying HTTP:', httpsError.message);

          if (httpsError.code === 'ERR_NETWORK' ||
            httpsError.message.includes('certificate') ||
            httpsError.message.includes('ERR_CERT_DATE_INVALID')) {

            try {
              console.log('Attempting HTTP logout...');
              await apiClient.post('https://babaapi.teknosof.com/api/logout', {});
              logoutSuccess = true;
              console.log('HTTP logout successful');
            } catch (httpError) {
              console.error('HTTP logout also failed:', httpError.message);
              console.log('Performing local logout due to API failure...');
            }
          } else {
            console.error('Logout API error:', httpsError.message);
          }
        }

        this.performLocalLogout(logoutSuccess);

      } catch (error) {
        console.error('Unexpected logout error:', error);
        this.performLocalLogout(false);
      } finally {
        this.isLoggingOut = false;
      }
    },

    performLocalLogout(apiSuccess = true) {
      console.log('Performing local logout...');

      Cookies.remove("token");
      localStorage.removeItem("peran");
      localStorage.removeItem("user");
      localStorage.removeItem("headerData");

      this.headerData = null;
      this.currentUserName = '';
      delete axios.defaults.headers.common['Authorization'];

      if (apiSuccess) {
        this.showSnackbar('Berhasil logout', 'success');
      } else {
        this.showSnackbar('Anda telah logout (offline)', 'info');
      }

      setTimeout(() => {
        this.$router.push({ name: "Login" }).catch(error => {
          console.warn('Named route failed, trying path:', error);
          this.$router.push("/admin/login").catch(pathError => {
            console.error('All navigation attempts failed:', pathError);
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
            console.log('Header data updated from storage:', this.headerData);
          } else {
            this.headerData = null;
          }
        } catch (error) {
          console.error('Error parsing header data from storage:', error);
        }
      } else if (event.key === 'user') {
        this.currentUserName = this.getCurrentUserName();
      }
    }
  },

  mounted() {
    console.log('Header component mounted');

    if (!this.isLoggedIn()) {
      console.log('User not logged in, redirecting to login...');
      this.$router.push({ name: "Login" }).catch(() => {
        this.$router.push("/admin/login");
      });
      return;
    }

    this.currentUserName = this.getCurrentUserName();
    this.loadHeaderDataFromStorage();

    setTimeout(() => {
      console.log('Fetching fresh header data from API...');
      this.fetchHeaderData();
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
</style>