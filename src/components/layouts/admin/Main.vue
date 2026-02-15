<template>
  <v-app>
    <Sidebar />
    <Header />
    <v-main class="main-background" :class="{ 'has-background-image': headerData?.foto_ruang_kota }"
      :loading="isLoadingHeader">
      <!-- Background Image Container -->
      <div class="main-background-container">
        <!-- Background Image berdasarkan provinsi -->
        <div v-if="headerData?.foto_ruang_kota" class="main-background-image"
          :style="`background-image: url(${getHeaderImageUrl(headerData.foto_ruang_kota)})`">
          <!-- Overlay transparan untuk better readability -->
          <div class="main-background-overlay"></div>
        </div>

        <!-- Fallback background jika tidak ada gambar -->
        <div v-else class="main-background-fallback"></div>
      </div>

      <!-- Content Container -->
      <v-container fluid class="main-content-container">
        <router-view />
      </v-container>

      <!-- MUSIC PLAYER - COMPACT VERSION (Bottom Right) - Hidden on Chat Page -->
      <div v-if="!isOnChatPage" class="music-player-compact">
        <!-- Minimized State -->
        <v-card v-if="!musicExpanded" class="player-minimized" elevation="8" rounded="pill"
          @click="musicExpanded = true">
          <div class="d-flex align-center pa-2">
            <v-avatar size="36" class="mr-2">
              <v-icon color="amber">mdi-music-circle</v-icon>
            </v-avatar>
            <div class="player-mini-info">
              <div class="text-caption text-white font-weight-bold text-truncate" style="max-width: 120px;">
                {{ currentSong?.judul_lagu || 'Music Player' }}
              </div>
            </div>
            <v-btn icon size="x-small" color="amber" @click.stop="togglePlay" class="ml-2">
              <v-icon size="16">{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
            </v-btn>
          </div>
        </v-card>

        <!-- Expanded State -->
        <v-card v-else class="player-expanded" elevation="12" rounded="lg">
          <v-card-text class="pa-3">
            <!-- Header with Close Button -->
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center">
                <v-icon color="amber" class="mr-2">mdi-music-box</v-icon>
                <span class="text-subtitle-2 text-white font-weight-bold">Music Player</span>
              </div>
              <v-btn icon size="x-small" @click="musicExpanded = false" color="white">
                <v-icon size="18">mdi-chevron-down</v-icon>
              </v-btn>
            </div>

            <v-divider class="mb-2" color="amber"></v-divider>

            <!-- Song Info -->
            <div class="song-info mb-2">
              <div class="text-body-2 text-white font-weight-bold text-truncate">
                {{ currentSong?.judul_lagu || 'Pilih Lagu' }}
              </div>
              <div class="text-caption text-grey-lighten-1">
                {{ currentSong?.penyanyi || '-' }}
              </div>
            </div>

            <!-- Progress Bar -->
            <div v-if="currentSong" class="mb-2">
              <v-progress-linear :model-value="progress" color="amber" height="3" rounded @click="seekAudio"
                style="cursor: pointer;"></v-progress-linear>
              <div class="d-flex justify-space-between text-caption text-grey-lighten-1 mt-1">
                <span>{{ formatTime(currentTime) }}</span>
                <span>{{ formatTime(duration) }}</span>
              </div>
            </div>

            <!-- Controls -->
            <div class="d-flex align-center justify-center gap-2">
              <!-- Playlist -->
              <v-menu offset-y max-height="300">
                <template v-slot:activator="{ props }">
                  <v-btn icon size="small" color="amber" v-bind="props">
                    <v-icon size="18">mdi-playlist-music</v-icon>
                  </v-btn>
                </template>
                <v-list density="compact" bg-color="grey-darken-3" width="250" max-height="300" class="overflow-y-auto">
                  <v-list-subheader class="text-amber text-caption">
                    {{ songs.length }} Lagu
                  </v-list-subheader>
                  <v-list-item v-for="song in songs" :key="song.id" @click="selectSong(song)"
                    :class="{ 'bg-amber': currentSong?.id === song.id }">
                    <v-list-item-title class="text-caption"
                      :class="currentSong?.id === song.id ? 'text-black font-weight-bold' : 'text-white'">
                      {{ song.judul_lagu }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <!-- Play/Pause -->
              <v-btn icon color="amber" size="large" @click="togglePlay" :disabled="!currentSong" elevation="4">
                <v-icon size="28">{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
              </v-btn>

              <!-- Volume -->
              <v-menu offset-y>
                <template v-slot:activator="{ props }">
                  <v-btn icon size="small" color="amber" v-bind="props">
                    <v-icon size="18">{{ volumeIcon }}</v-icon>
                  </v-btn>
                </template>
                <v-card width="180" class="pa-2" color="grey-darken-3">
                  <v-slider v-model="volume" min="0" max="100" step="1" color="amber" hide-details
                    @update:model-value="updateVolume">
                    <template v-slot:prepend>
                      <v-icon size="small" color="amber">mdi-volume-low</v-icon>
                    </template>
                    <template v-slot:append>
                      <span class="text-caption text-white">{{ volume }}</span>
                    </template>
                  </v-slider>
                </v-card>
              </v-menu>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Audio Element (Hidden) -->
      <audio ref="audioPlayer" preload="metadata" @timeupdate="updateProgress" @loadedmetadata="onAudioLoaded"
        @ended="onAudioEnded" @error="onAudioError"></audio>

      <!-- Loading Overlay -->
      <v-overlay v-if="isLoadingHeader" contained class="align-center justify-center">
        <div class="text-center">
          <v-progress-circular color="amber" indeterminate size="40" width="4"></v-progress-circular>
          <p class="text-caption text-white mt-2">Loading background...</p>
        </div>
      </v-overlay>
    </v-main>

    <!-- Snackbar for music notifications -->
    <v-snackbar v-model="musicSnackbar.show" :color="musicSnackbar.color" :timeout="2000" location="top">
      {{ musicSnackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<script>
import Header from "@/components/layouts/admin/Header";
import Sidebar from "@/components/layouts/admin/Sidebar";
import Footer from "@/components/layouts/admin/Footer";
import axios from "axios";
import Cookies from "js-cookie";

export default {
  components: {
    Header,
    Sidebar,
    Footer,
  },

  data() {
    return {
      headerData: null,
      isLoadingHeader: false,

      // Music Player States
      songs: [],
      currentSong: null,
      isPlaying: false,
      volume: 50,
      currentTime: 0,
      duration: 0,
      progress: 0,
      loadingSongs: false,
      musicExpanded: false,
      musicSnackbar: {
        show: false,
        text: '',
        color: 'success'
      }
    }
  },

  computed: {
    volumeIcon() {
      if (this.volume === 0) return 'mdi-volume-mute'
      if (this.volume < 50) return 'mdi-volume-low'
      return 'mdi-volume-high'
    },

    isOnChatPage() {
      // Check if current route is the Chat page
      const currentPath = this.$route.path;
      const currentName = this.$route.name;

      console.log('Current Route Path:', currentPath);
      console.log('Current Route Name:', currentName);

      return currentPath === '/admin/Chat' ||
        currentPath === '/admin/chat' ||
        currentName === 'Chat' ||
        currentName === 'chat' ||
        currentPath.toLowerCase().includes('/admin/chat');
    }
  },

  watch: {
    // Watch for route changes - DON'T pause music when entering Chat page
    '$route'(to, from) {
      // Music continues playing in background even on Chat page
      // Only the UI is hidden, audio keeps playing
      console.log('Route changed to:', to.path, '- Music continues playing');
    }
  },

  methods: {
    // ==================== HEADER METHODS ====================
    getUserCode() {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          // User menyimpan "cabang", kita gunakan itu untuk matching dengan "code" di API
          return user.cabang || user.code || null;
        }
      } catch (error) {
        console.error('Error getting user code:', error);
      }
      return null;
    },

    getHeaderImageUrl(fotoRuangKota) {
      if (!fotoRuangKota) {
        return '';
      }

      if (fotoRuangKota.startsWith('http://') || fotoRuangKota.startsWith('https://')) {
        return fotoRuangKota;
      }

      const cleanPath = fotoRuangKota.startsWith('/') ? fotoRuangKota.substring(1) : fotoRuangKota;
      const httpsUrl = `https://babaapi.teknosof.com/project/public/${cleanPath}`;

      return httpsUrl;
    },

    async fetchHeaderData() {
      this.isLoadingHeader = true;

      try {
        const token = Cookies.get("token");
        if (!token) {
          console.log('Main - No token available');
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
          headerResponse = await apiClient.get('https://babaapi.teknosof.com/api/provinsi');
        } catch (httpsError) {
          console.warn('Main - HTTPS failed, trying HTTP:', httpsError.message);

          if (httpsError.code === 'ERR_NETWORK' ||
            httpsError.message.includes('certificate') ||
            httpsError.message.includes('ERR_CERT_DATE_INVALID')) {

            headerResponse = await apiClient.get('https://babaapi.teknosof.com/api/provinsi');
          } else {
            throw httpsError;
          }
        }

        let headerData = null;

        if (headerResponse.data && headerResponse.data.status === 'success') {
          if (Array.isArray(headerResponse.data.data) && headerResponse.data.data.length > 0) {
            let matchedHeader = null;

            if (userCode) {
              console.log('🔍 Mencari match untuk user code:', userCode);
              console.log('📋 Available data:', headerResponse.data.data.map(h => ({ code: h.code, name: h.name })));

              matchedHeader = headerResponse.data.data.find(header =>
                header.code &&
                header.code.toUpperCase().trim() === userCode.toUpperCase().trim()
              );

              if (matchedHeader) {
                console.log('✅ MATCH FOUND! User:', userCode, '-> API Code:', matchedHeader.code);
              } else {
                console.log('❌ NO MATCH! User code:', userCode, 'not found in API codes:',
                  headerResponse.data.data.map(h => h.code).join(', '));
              }
            }

            if (!matchedHeader && headerResponse.data.data.length > 0) {
              matchedHeader = headerResponse.data.data[0];
              console.log('⚠️ Using FALLBACK (first item):', matchedHeader.code);
            }

            if (matchedHeader) {
              headerData = {
                code: matchedHeader.code || userCode || 'Code Tidak Ditemukan',
                foto_ruang_kota: matchedHeader.foto_ruang_kota || null
              };
            }
          }
          else if (headerResponse.data.data && typeof headerResponse.data.data === 'object') {
            headerData = {
              code: headerResponse.data.data.code || userCode || 'Code Tidak Ditemukan',
              foto_ruang_kota: headerResponse.data.data.foto_ruang_kota || null
            };
          }
        }

        if (headerData) {
          localStorage.setItem('headerData', JSON.stringify(headerData));
          this.headerData = headerData;
          return headerData;
        } else {
          if (userCode) {
            const fallbackHeaderData = {
              code: userCode,
              foto_ruang_kota: null
            };
            localStorage.setItem('headerData', JSON.stringify(fallbackHeaderData));
            this.headerData = fallbackHeaderData;
            return fallbackHeaderData;
          }

          return null;
        }

      } catch (error) {
        console.error('Main - Error fetching header data:', error);

        const userCode = this.getUserCode();
        if (userCode) {
          const errorFallbackData = {
            code: userCode,
            foto_ruang_kota: null
          };
          localStorage.setItem('headerData', JSON.stringify(errorFallbackData));
          this.headerData = errorFallbackData;
          return errorFallbackData;
        }

        return null;
      } finally {
        this.isLoadingHeader = false;
      }
    },

    loadHeaderDataFromStorage() {
      try {
        const storedHeaderData = localStorage.getItem('headerData');
        if (storedHeaderData) {
          this.headerData = JSON.parse(storedHeaderData);
        } else {
          this.fetchHeaderData();
        }
      } catch (error) {
        console.error('Main - Error loading from storage:', error);
        this.fetchHeaderData();
      }
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
          console.error('Main - Error parsing updated header data:', error);
        }
      }
    },

    // ==================== MUSIC PLAYER METHODS ====================
    async fetchSongs() {
      this.loadingSongs = true;
      try {
        const response = await axios.get('https://babaapi.teknosof.com/api/lagu');

        if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
          this.songs = response.data.data;

          if (this.songs.length > 0) {
            const savedSongId = localStorage.getItem('currentSongId');

            if (savedSongId) {
              const savedSong = this.songs.find(s => s.id.toString() === savedSongId);
              if (savedSong) {
                this.currentSong = savedSong;
              } else {
                this.currentSong = this.songs[0];
              }
            } else {
              this.currentSong = this.songs[0];
            }

            // Load audio tanpa autoplay
            this.loadAudioSource(this.currentSong);
          }
        }
      } catch (error) {
        console.error('Error fetching songs:', error);
        this.showMusicSnackbar('Gagal memuat lagu', 'error');
      } finally {
        this.loadingSongs = false;
      }
    },

    loadAudioSource(song, patternIndex = 0) {
      if (!song || !this.$refs.audioPlayer) return;

      const urlPatterns = [
        `https://babaapi.teknosof.com/${song.file_lagu}`,
        `https://babaapi.teknosof.com/project/public/${song.file_lagu}`,
        `https://babaapi.teknosof.com/storage/${song.file_lagu}`,
        `https://babaapi.teknosof.com/public/${song.file_lagu}`,
      ];

      const audioUrl = urlPatterns[patternIndex];
      console.log(`Trying audio URL (pattern ${patternIndex}):`, audioUrl);

      const audioPlayer = this.$refs.audioPlayer;

      // Reset audio player
      audioPlayer.pause();
      audioPlayer.currentTime = 0;

      // Remove crossorigin untuk menghindari CORS issues
      audioPlayer.removeAttribute('crossorigin');

      // Set audio source
      audioPlayer.src = audioUrl;

      // Try to load
      audioPlayer.load();

      // Handle load error - try next pattern
      const errorHandler = () => {
        console.error(`Failed to load audio from pattern ${patternIndex}`);

        // Try next pattern
        if (patternIndex < urlPatterns.length - 1) {
          audioPlayer.removeEventListener('error', errorHandler);
          this.loadAudioSource(song, patternIndex + 1);
        } else {
          // All patterns failed
          this.showMusicSnackbar('Gagal memuat audio. File tidak ditemukan.', 'error');
          console.error('All audio URL patterns failed for:', song.file_lagu);
        }
      };

      // Handle successful load
      const loadedHandler = () => {
        console.log(`Successfully loaded audio from pattern ${patternIndex}`);
        // Save working pattern
        localStorage.setItem('workingAudioPattern', patternIndex.toString());
        audioPlayer.removeEventListener('error', errorHandler);
        audioPlayer.removeEventListener('loadedmetadata', loadedHandler);
      };

      audioPlayer.addEventListener('error', errorHandler, { once: true });
      audioPlayer.addEventListener('loadedmetadata', loadedHandler, { once: true });
    },

    selectSong(song) {
      this.currentSong = song;
      localStorage.setItem('currentSongId', song.id.toString());

      // Stop current playback
      if (this.$refs.audioPlayer) {
        this.$refs.audioPlayer.pause();
        this.isPlaying = false;
      }

      // Load new song - start with saved working pattern if available
      const savedPattern = localStorage.getItem('workingAudioPattern');
      const startPattern = savedPattern ? parseInt(savedPattern) : 0;

      this.loadAudioSource(song, startPattern);
      this.showMusicSnackbar(`♪ ${song.judul_lagu}`, 'info');
    },

    async togglePlay() {
      if (!this.$refs.audioPlayer || !this.currentSong) {
        this.showMusicSnackbar('Pilih lagu dulu', 'warning');
        return;
      }

      const audioPlayer = this.$refs.audioPlayer;

      if (this.isPlaying) {
        audioPlayer.pause();
        this.isPlaying = false;
      } else {
        // Check if audio source is loaded
        if (!audioPlayer.src || audioPlayer.error) {
          const savedPattern = localStorage.getItem('workingAudioPattern');
          const startPattern = savedPattern ? parseInt(savedPattern) : 0;

          this.loadAudioSource(this.currentSong, startPattern);

          // Wait for load
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Check if still has error after reload
        if (audioPlayer.error) {
          this.showMusicSnackbar('File audio tidak dapat diputar', 'error');
          return;
        }

        try {
          await audioPlayer.play();
          this.isPlaying = true;
          this.showMusicSnackbar(`▶ ${this.currentSong.judul_lagu}`, 'success');
        } catch (err) {
          this.isPlaying = false;
          console.error('Play error:', err);

          if (err.name === 'NotAllowedError') {
            this.showMusicSnackbar('Klik lagi untuk play', 'warning');
          } else if (err.name === 'NotSupportedError') {
            this.showMusicSnackbar('Format audio tidak didukung', 'error');
          } else {
            this.showMusicSnackbar('Gagal memutar audio', 'error');
          }
        }
      }
    },

    updateVolume(value) {
      if (this.$refs.audioPlayer) {
        this.$refs.audioPlayer.volume = value / 100;
        localStorage.setItem('musicVolume', value.toString());
      }
    },

    updateProgress() {
      if (this.$refs.audioPlayer) {
        this.currentTime = this.$refs.audioPlayer.currentTime;
        this.duration = this.$refs.audioPlayer.duration || 0;
        this.progress = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
      }
    },

    onAudioLoaded() {
      if (this.$refs.audioPlayer) {
        this.duration = this.$refs.audioPlayer.duration;
      }
    },

    onAudioEnded() {
      this.isPlaying = false;

      const currentIndex = this.songs.findIndex(s => s.id === this.currentSong?.id);

      if (currentIndex !== -1 && currentIndex < this.songs.length - 1) {
        const nextSong = this.songs[currentIndex + 1];
        this.selectSong(nextSong);
        setTimeout(() => this.togglePlay(), 800);
      } else {
        // Loop to first song
        this.selectSong(this.songs[0]);
        setTimeout(() => this.togglePlay(), 800);
      }
    },

    onAudioError(e) {
      console.error('Audio error event:', e);

      if (this.$refs.audioPlayer && this.$refs.audioPlayer.error) {
        const error = this.$refs.audioPlayer.error;
        console.error('Audio error details:', {
          code: error.code,
          message: error.message
        });

        switch (error.code) {
          case 1:
            console.error('Audio loading aborted');
            break;
          case 2:
            console.error('Network error while loading audio');
            this.showMusicSnackbar('Koneksi bermasalah', 'error');
            break;
          case 3:
            console.error('Audio decoding error');
            this.showMusicSnackbar('File audio rusak', 'error');
            break;
          case 4:
            console.error('Audio format not supported');
            break;
        }
      }

      this.isPlaying = false;
    },

    seekAudio(event) {
      if (!this.$refs.audioPlayer || !this.duration) return;

      const rect = event.target.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const percentage = clickX / rect.width;
      this.$refs.audioPlayer.currentTime = percentage * this.duration;
    },

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    showMusicSnackbar(text, color = 'success') {
      this.musicSnackbar.text = text;
      this.musicSnackbar.color = color;
      this.musicSnackbar.show = true;
    }
  },

  mounted() {
    console.log('Main - Component mounted');

    if (!this.isLoggedIn()) {
      console.log('Main - User not logged in');
      return;
    }

    // Load header data
    this.loadHeaderDataFromStorage();

    setTimeout(() => {
      this.fetchHeaderData();
    }, 500);

    // Listen for storage changes
    window.addEventListener('storage', this.handleStorageChange);

    // Initialize Music Player
    this.fetchSongs();

    if (this.$refs.audioPlayer) {
      const savedVolume = localStorage.getItem('musicVolume');
      if (savedVolume) {
        this.volume = parseInt(savedVolume);
      }

      this.$refs.audioPlayer.volume = this.volume / 100;
      this.$refs.audioPlayer.setAttribute('preload', 'metadata');
    }
  },

  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);

    if (this.$refs.audioPlayer) {
      this.$refs.audioPlayer.pause();
    }
  }
};
</script>

<style scoped>
/* Main Background Styling */
.main-background {
  position: relative;
  min-height: 100vh;
  background-color: #fff5e1;
}

.main-background-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.main-background-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.main-background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 245, 225, 0.5);
  backdrop-filter: blur(1px);
}

.main-background-fallback {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #fff5e1 0%, #f9f1d4 100%);
}

/* Content Container */
.main-content-container {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 160px);
}

/* ========== COMPACT MUSIC PLAYER ========== */
.music-player-compact {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
}

/* Minimized Player */
.player-minimized {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
  border: 2px solid rgba(251, 191, 36, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
}

.player-minimized:hover {
  border-color: rgba(251, 191, 36, 0.8);
  box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4);
  transform: translateY(-2px);
}

.player-mini-info {
  min-width: 0;
}

/* Expanded Player */
.player-expanded {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
  border: 2px solid rgba(251, 191, 36, 0.5);
  width: 280px;
  transition: all 0.3s ease;
}

.song-info {
  background: rgba(212, 175, 55, 0.1);
  padding: 8px;
  border-radius: 8px;
}

/* Gap utility */
.gap-2 {
  gap: 8px;
}

/* Responsive */
@media (max-width: 600px) {
  .music-player-compact {
    bottom: 10px;
    right: 10px;
  }

  .player-expanded {
    width: calc(100vw - 20px);
    max-width: 280px;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-background-image {
    background-attachment: scroll;
  }
}

/* Loading Animation */
.main-background[loading] {
  position: relative;
}

@keyframes loading-shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

.has-background-image {
  color: #333;
}

.main-content-container .v-card {
  backdrop-filter: blur(2px);
  background-color: rgba(255, 255, 255, 0.95) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Scrollbar for playlist */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(251, 191, 36, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(251, 191, 36, 0.8);
}

/* Responsive - Mobile Adjustments */
@media (max-width: 600px) {
  .music-player-compact {
    bottom: 80px;
    right: 10px;
  }

  .player-minimized {
    max-width: calc(100vw - 40px);
  }

  .player-mini-info {
    max-width: 100px;
  }

  .player-expanded {
    width: calc(100vw - 20px);
    max-width: 320px;
    bottom: 0;
  }
}

/* Extra small devices */
@media (max-width: 400px) {
  .music-player-compact {
    bottom: 75px;
    right: 8px;
  }

  .player-minimized {
    max-width: calc(100vw - 30px);
  }

  .player-mini-info {
    max-width: 80px;
  }

  .player-expanded {
    width: calc(100vw - 16px);
    max-width: 300px;
  }
}
</style>
