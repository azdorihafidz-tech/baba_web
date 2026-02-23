<template>
  <v-container fluid class="login-container">
    <v-row justify="center" align="center" class="fullscreen-row">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card :class="cardClass" elevation="24" rounded="xl" border="1px solid amber">
          <!-- Logo -->
          <div class="text-center logo-section">
            <v-avatar :size="logoSize" class="mb-3 border-2 border-amber">
              <v-img src="@/assets/newlogo.jpg" alt="Logo BABA PARFUM" />
            </v-avatar>
            <h2 :class="titleClass" style="letter-spacing: 2px;">BABA PARFUME</h2>
            <p :class="subtitleClass">INDONESIA</p>
            <h3 :class="formTitleClass">Masuk Akun</h3>
          </div>

          <!-- Form -->
          <v-form @submit.prevent="handleLogin" :class="formClass">
            <v-text-field v-model="inputLogin.email" label="Username" prepend-inner-icon="mdi-account"
              variant="outlined" :class="inputClass" color="amber" base-color="grey-lighten-1"
              autocomplete="username" />

            <v-text-field v-model="inputLogin.password" :type="visible ? 'text' : 'password'" label="Password"
              prepend-inner-icon="mdi-lock" :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="togglePasswordVisibility" variant="outlined" :class="inputClass" color="amber"
              base-color="grey-lighten-1" autocomplete="current-password" />

            <v-btn type="submit" :loading="isButtonLoading" :class="buttonClass" :size="buttonSize" block rounded="lg"
              color="amber" style="letter-spacing: 1px;">
              <v-icon start>mdi-login</v-icon>
              MASUK SEKARANG
            </v-btn>
          </v-form>

          <v-divider :class="dividerClass" />

          <!-- Register Link -->
          <div class="text-center">
            <span :class="linkTextClass">Belum punya akun? </span>
            <v-btn variant="text" color="amber" @click="goToRegister" :size="linkButtonSize">
              Daftar sekarang
            </v-btn>
          </div>
          <div class="text-center">

            <v-btn color="amber mt-2" @click="openDownloadLink" :size="linkButtonSize">
              Download Aplikasi Android
            </v-btn>
          </div>

          <!-- Brand Footer -->
          <div :class="footerClass">
            <p :class="footerTitleClass">Belum Bisa Login, Gabung Dulu di BABA PARFUME</p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Floating Music Player - Pojok Kanan Bawah -->
    <!-- <v-card class="floating-music-player" rounded="lg" elevation="8" color="grey-darken-3"> -->
    <!-- <v-card-text class="pa-3"> -->
    <!-- <div class="d-flex align-center justify-space-between"> -->
    <!-- <div class="music-info flex-grow-1 mr-2">
            <div class="text-caption text-grey-lighten-1 mb-1">
              🎵 Now Playing
            </div>
            <div class="text-body-2 text-white font-weight-medium text-truncate">
              {{ currentSong?.judul_lagu || 'Pilih Lagu' }}
            </div>
            <div v-if="currentSong" class="text-caption text-grey-lighten-1">
              {{ currentSong.penyanyi }}
            </div>
          </div> -->

    <!-- <div class="music-controls d-flex align-center gap-2"> -->
    <!-- <v-menu offset-y max-height="400">
              <template v-slot:activator="{ props }">
                <v-btn icon size="small" color="amber" v-bind="props" :loading="loadingSongs">
                  <v-icon>mdi-playlist-music</v-icon>
                </v-btn>
              </template>
<v-list density="compact" bg-color="grey-darken-3" width="300">
  <v-list-subheader class="text-amber">
    Pilih Lagu ({{ songs.length }} lagu)
  </v-list-subheader>
  <v-divider class="mb-2"></v-divider>
  <v-list-item v-for="song in songs" :key="song.id" @click="selectSong(song)"
    :class="{ 'bg-amber': currentSong?.id === song.id }">
    <template v-slot:prepend>
                    <v-icon v-if="currentSong?.id === song.id && isPlaying" color="white" size="small">
                      mdi-music-note
                    </v-icon>
                    <v-icon v-else color="grey" size="small">
                      mdi-music-circle-outline
                    </v-icon>
                  </template>

    <v-list-item-title :class="currentSong?.id === song.id ? 'text-black font-weight-bold' : 'text-white'">
      {{ song.judul_lagu }}
    </v-list-item-title>
    <v-list-item-subtitle :class="currentSong?.id === song.id ? 'text-grey-darken-2' : 'text-grey-lighten-1'">
      {{ song.penyanyi }} • {{ song.genre }}
    </v-list-item-subtitle>

    <template v-slot:append>
                    <v-icon v-if="currentSong?.id === song.id && isPlaying" color="black" size="small"
                      class="playing-icon">
                      mdi-volume-high
                    </v-icon>
                  </template>
  </v-list-item>

  <v-divider class="my-2"></v-divider>
  <v-list-item class="text-center">
    <v-list-item-title class="text-caption text-grey-lighten-1">
      Total: {{ songs.length }} lagu
    </v-list-item-title>
  </v-list-item>
</v-list>
</v-menu> -->

    <!-- Play/Pause Button -->
    <!-- <v-btn icon size="small" color="amber" @click="togglePlay" :disabled="!currentSong">
              <v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
            </v-btn> -->

    <!-- Volume Control -->
    <!-- <v-menu offset-y>
              <template v-slot:activator="{ props }">
                <v-btn icon size="small" color="amber" v-bind="props">
                  <v-icon>{{ volumeIcon }}</v-icon>
                </v-btn>
              </template>
              <v-card width="200" class="pa-3" color="grey-darken-3">
                <div class="d-flex align-center gap-2">
                  <v-icon size="small" color="amber">mdi-volume-low</v-icon>
                  <v-slider v-model="volume" min="0" max="100" step="1" color="amber" track-color="grey" hide-details
                    @update:model-value="updateVolume">
                  </v-slider>
                  <v-icon size="small" color="amber">mdi-volume-high</v-icon>
                </div>
                <div class="text-center text-caption text-white mt-2">
                  {{ volume }}%
                </div>
              </v-card>
            </v-menu> -->
    <!-- </div> -->
    <!-- </div> -->

    <!-- Progress Bar -->
    <!-- <div v-if="currentSong" class="mt-2">
          <v-progress-linear :model-value="progress" color="amber" height="4" rounded @click="seekAudio"
            style="cursor: pointer;">
          </v-progress-linear>
          <div class="d-flex justify-space-between text-caption text-grey-lighten-1 mt-1">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div> -->
    <!-- </v-card-text>
    </v-card> -->

    <!-- Audio Element (Hidden) -->
    <!-- <audio ref="audioPlayer" preload="metadata" @timeupdate="updateProgress" @loadedmetadata="onAudioLoaded"
      @ended="onAudioEnded" @error="onAudioError" @canplay="onCanPlay" @loadstart="onLoadStart">
    </audio> -->

    <!-- Snackbar -->
    <v-snackbar v-model="contentSnackbar.snackbar" :color="contentSnackbar.color" :timeout="4000">
      {{ contentSnackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" color="white" @click="contentSnackbar.snackbar = false">
          Tutup
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useDisplay } from 'vuetify'

// Composables
const router = useRouter()
const { mobile, smAndDown, xs } = useDisplay()

// Reactive data
const visible = ref(false)
const isButtonLoading = ref(false)
const rememberMe = ref(false)

const inputLogin = ref({
  email: '',
  password: ''
})

const contentSnackbar = ref({
  snackbar: false,
  text: '',
  color: 'success'
})

// Music Player States
const songs = ref([])
const currentSong = ref(null)
const isPlaying = ref(false)
const volume = ref(50)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)
const audioPlayer = ref(null)
const loadingSongs = ref(false)

// Emits
const emit = defineEmits(['login-success', 'go-to-register'])

// Responsive computed properties
const logoSize = computed(() => xs.value ? 60 : smAndDown.value ? 70 : 80)
const titleClass = computed(() => xs.value ? 'text-h6 font-weight-bold text-amber mb-1' : smAndDown.value ? 'text-h5 font-weight-bold text-amber mb-1' : 'text-h4 font-weight-bold text-amber mb-1')
const subtitleClass = computed(() => xs.value ? 'text-caption text-amber-lighten-1 mb-0' : 'text-body-2 text-amber-lighten-1 mb-0')
const formTitleClass = computed(() => xs.value ? 'text-subtitle-1 font-weight-medium text-white mt-2' : smAndDown.value ? 'text-h6 font-weight-medium text-white mt-3' : 'text-h6 font-weight-medium text-white mt-4')
const cardClass = computed(() => xs.value ? 'pa-4 bg-grey-darken-4' : smAndDown.value ? 'pa-6 bg-grey-darken-4' : 'pa-8 bg-grey-darken-4')
const formClass = computed(() => xs.value ? 'mb-3' : 'mb-4')
const inputClass = computed(() => xs.value ? 'mb-2' : 'mb-3')
const buttonClass = computed(() => xs.value ? 'mb-3 text-black font-weight-bold' : 'mb-4 text-black font-weight-bold')
const buttonSize = computed(() => xs.value ? 'default' : 'large')
const dividerClass = computed(() => xs.value ? 'my-3 border-opacity-25' : 'my-4 border-opacity-25')
const linkTextClass = computed(() => xs.value ? 'text-caption text-grey-lighten-1' : 'text-grey-lighten-1')
const linkButtonSize = computed(() => xs.value ? 'small' : 'default')
const footerClass = computed(() => xs.value ? 'text-center mt-4' : smAndDown.value ? 'text-center mt-5' : 'text-center mt-6')
const footerTitleClass = computed(() => xs.value ? 'text-caption font-weight-bold text-amber mb-1' : 'text-body-2 font-weight-bold text-amber mb-1')

// Volume Icon Computed
const volumeIcon = computed(() => {
  if (volume.value === 0) return 'mdi-volume-mute'
  if (volume.value < 50) return 'mdi-volume-low'
  return 'mdi-volume-high'
})

// Music Player Methods
const fetchSongs = async () => {
  loadingSongs.value = true
  try {
    const response = await axios.get('https://babaparfume.id/api/lagu')

    if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
      songs.value = response.data.data

      if (songs.value.length > 0) {
        const firstSong = songs.value[0]
        currentSong.value = firstSong

        const audioUrl = `https://babaparfume.id/${firstSong.file_lagu}`

        setTimeout(() => {
          if (audioPlayer.value) {
            audioPlayer.value.removeAttribute('crossorigin')
            audioPlayer.value.src = audioUrl
            audioPlayer.value.load()
          }
        }, 500)
      }
    }
  } catch (error) {
    console.error('Error fetching songs:', error)
    showSnackbar('Gagal memuat daftar lagu', 'error')
  } finally {
    loadingSongs.value = false
  }
}

const selectSong = (song) => {
  currentSong.value = song

  const workingPattern = localStorage.getItem('workingAudioPattern') || '0'

  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
    audioPlayer.value.src = ''

    const urlPatterns = [
      `https://babaapi.babaparfume.id/${song.file_lagu}`,
      `https://babaapi.babaparfume.id/project/public/${song.file_lagu}`,
      `https://babaapi.babaparfume.id/storage/${song.file_lagu}`,
      `https://babaapi.babaparfume.id/public/${song.file_lagu}`,
    ]

    const audioUrl = urlPatterns[parseInt(workingPattern)] || urlPatterns[0]

    audioPlayer.value.removeAttribute('crossorigin')
    audioPlayer.value.src = audioUrl
    audioPlayer.value.load()

    showSnackbar(`Terpilih: ${song.judul_lagu}`, 'info')
  }
}

const togglePlay = async () => {
  if (!audioPlayer.value || !currentSong.value) {
    showSnackbar('Pilih lagu terlebih dahulu', 'warning')
    return
  }

  if (isPlaying.value) {
    audioPlayer.value.pause()
    isPlaying.value = false
  } else {
    if (!audioPlayer.value.src || audioPlayer.value.error) {
      const workingPattern = localStorage.getItem('workingAudioPattern') || '0'
      const urlPatterns = [
        `https://babaapi.babaparfume.id/${currentSong.value.file_lagu}`,
        `https://babaapi.babaparfume.id/project/public/${currentSong.value.file_lagu}`,
        `https://babaapi.babaparfume.id/storage/${currentSong.value.file_lagu}`,
        `https://babaapi.babaparfume.id/public/${currentSong.value.file_lagu}`,
      ]

      const audioUrl = urlPatterns[parseInt(workingPattern)]

      audioPlayer.value.removeAttribute('crossorigin')
      audioPlayer.value.src = audioUrl
      audioPlayer.value.load()

      await new Promise(resolve => setTimeout(resolve, 500))
    }

    try {
      await audioPlayer.value.play()
      isPlaying.value = true
      showSnackbar(`Memutar: ${currentSong.value.judul_lagu}`, 'success')
    } catch (err) {
      isPlaying.value = false

      if (err.name === 'NotAllowedError') {
        showSnackbar('Browser block autoplay. Coba klik lagi.', 'warning')
      } else {
        showSnackbar(`Error: ${err.message}`, 'error')
      }
    }
  }
}

const updateVolume = (value) => {
  if (audioPlayer.value) {
    audioPlayer.value.volume = value / 100
  }
}

const updateProgress = () => {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime
    duration.value = audioPlayer.value.duration || 0
    progress.value = duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
  }
}

const onAudioLoaded = () => {
  if (audioPlayer.value) {
    duration.value = audioPlayer.value.duration
  }
}

const onAudioEnded = () => {
  isPlaying.value = false

  const currentIndex = songs.value.findIndex(s => s.id === currentSong.value?.id)

  if (currentIndex !== -1 && currentIndex < songs.value.length - 1) {
    const nextSong = songs.value[currentIndex + 1]
    selectSong(nextSong)
    setTimeout(() => togglePlay(), 500)
  } else {
    selectSong(songs.value[0])
    setTimeout(() => togglePlay(), 500)
  }
}

const onAudioError = (e) => {
  console.error('Audio error:', e)
  isPlaying.value = false
}

const onCanPlay = () => {
  console.log('Audio can play')
}

const onLoadStart = () => {
  console.log('Audio loading')
}

const seekAudio = (event) => {
  if (!audioPlayer.value || !duration.value) return

  const rect = event.target.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  audioPlayer.value.currentTime = percentage * duration.value
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Methods
const togglePasswordVisibility = () => {
  visible.value = !visible.value
}

const fetchHeaderData = async (token, userCabang = null) => {
  try {
    const apiClient = axios.create({
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    let headerResponse

    try {
      headerResponse = await apiClient.get('https://babaapi.babaparfume.id/api/gambar-header')
    } catch (httpsError) {
      console.warn('Login - HTTPS header request failed, trying HTTP:', httpsError.message)

      if (httpsError.code === 'ERR_NETWORK' ||
        httpsError.message.includes('certificate') ||
        httpsError.message.includes('ERR_CERT_DATE_INVALID')) {

        headerResponse = await apiClient.get('https://babaapi.babaparfume.id/api/gambar-header')
      } else {
        throw httpsError
      }
    }

    let headerData = null

    if (headerResponse.data && headerResponse.data.status === 'success') {
      if (Array.isArray(headerResponse.data.data) && headerResponse.data.data.length > 0) {
        let matchedHeader = null

        if (userCabang) {
          matchedHeader = headerResponse.data.data.find(header =>
            header.cabang &&
            header.cabang.toUpperCase().trim() === userCabang.toUpperCase().trim()
          )
        }

        if (!matchedHeader && headerResponse.data.data.length > 0) {
          matchedHeader = headerResponse.data.data[0]
        }

        if (matchedHeader) {
          headerData = {
            cabang: matchedHeader.cabang || userCabang || 'Cabang Tidak Ditemukan',
            path_gambar_header: matchedHeader.path_gambar_header || null
          }
        }
      }
    }

    if (headerData) {
      localStorage.setItem('headerData', JSON.stringify(headerData))
      return headerData
    } else {
      console.warn('Login - No valid header data found in response')

      if (userCabang) {
        const fallbackHeaderData = {
          cabang: userCabang,
          path_gambar_header: null
        }
        localStorage.setItem('headerData', JSON.stringify(fallbackHeaderData))
        return fallbackHeaderData
      }

      return null
    }

  } catch (error) {
    console.error('Login - Error fetching header data:', error)

    if (userCabang) {
      const errorFallbackData = {
        cabang: userCabang,
        path_gambar_header: null
      }
      localStorage.setItem('headerData', JSON.stringify(errorFallbackData))
      return errorFallbackData
    }

    return null
  }
}

const handleLogin = async () => {
  if (!inputLogin.value.email || !inputLogin.value.password) {
    showSnackbar('Mohon lengkapi username dan password', 'error')
    return
  }

  isButtonLoading.value = true

  try {
    const apiClient = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    const loginData = {
      username: inputLogin.value.email,
      password: inputLogin.value.password
    }

    let response

    try {
      response = await apiClient.post('https://babaapi.babaparfume.id/api/login', loginData)
    } catch (httpsError) {
      console.warn('HTTPS failed, trying HTTP:', httpsError.message)

      if (httpsError.code === 'ERR_NETWORK' ||
        httpsError.message.includes('certificate') ||
        httpsError.message.includes('ERR_CERT_DATE_INVALID')) {

        response = await apiClient.post('https://babaapi.babaparfume.id/api/login', loginData)
      } else {
        throw httpsError
      }
    }

    if (response.data.status === 'success') {
      const cookieOptions = rememberMe.value
        ? { expires: 7 }
        : { expires: 1 }

      const token = response.data.data.token
      Cookies.set('token', token, cookieOptions)
      localStorage.setItem('token', token)

      if (response.data.data.user.nik) {
        localStorage.setItem('nik', response.data.data.user.nik)
      }
      localStorage.setItem('mvo_type_id', response.data.data.user.mvo_type_id)

      // LOGIKA CLEAR MVO_ID HANYA UNTUK SUPERADMIN
      const userData = response.data.data.user

      // Cek apakah user adalah superadmin
      const isSuperadmin = userData.mvo_type_id &&
        userData.mvo_type_id.toLowerCase() === 'superadmin'

      if (isSuperadmin) {
        // Jika superadmin, hapus mvo_id dari localStorage
        localStorage.removeItem('mvo_id')
        console.log('Superadmin login: mvo_id cleared')
      } else {
        // Jika bukan superadmin, simpan mvo_id seperti biasa
        if (response.data.data.user.mvo) {
          localStorage.setItem('mvo_id', response.data.data.user.mvo.code)
          console.log('Non-superadmin login: mvo_id saved')
        }
      }
      // END LOGIKA CLEAR MVO_ID

      localStorage.setItem('user', JSON.stringify(userData))

      let peran = 'admin'

      if (userData.peran) {
        peran = userData.peran.toString().toUpperCase()
      } else if (userData.role) {
        peran = userData.role.toString().toUpperCase()
      } else if (userData.jabatan) {
        peran = userData.jabatan.toString().toUpperCase()
      } else if (userData.level) {
        peran = userData.level.toString().toUpperCase()
      }

      const supportedRoles = ['SALES', 'KEUANGAN', 'DIREKSI', 'ADMIN']
      if (!supportedRoles.includes(peran)) {
        console.warn(`Peran '${peran}' tidak didukung, menggunakan DIREKSI sebagai fallback`)
        peran = 'DIREKSI'
      }

      localStorage.setItem('peran', peran)

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      const userCabang = userData.cabang || null
      const headerData = await fetchHeaderData(token, userCabang)

      if (headerData) {
        showSnackbar(`Selamat datang ${userData.nama || userData.username}! - ${headerData.cabang || ''}`)
      } else {
        console.warn('Header data tidak berhasil diambil')
        showSnackbar(`Selamat datang ${userData.nama || userData.username}!`)
      }

      // AUTOPLAY MUSIC AFTER SUCCESSFUL LOGIN
      if (currentSong.value && audioPlayer.value) {
        setTimeout(() => {
          audioPlayer.value.play()
            .then(() => {
              isPlaying.value = true
              showSnackbar(`🎵 Memutar: ${currentSong.value.judul_lagu}`, 'success')
            })
            .catch(err => {
              console.warn('Auto-play blocked by browser:', err)
            })
        }, 500)
      }

      emit('login-success', {
        user: userData,
        token: token,
        peran: peran,
        headerData: headerData
      })

      if (isSuperadmin) {
        router.push('/admin/dashboard')
      } else {
        router.push('/admin/mvo')
      }

    } else {
      showSnackbar(response.data.message || 'Login gagal', 'error')
    }

  } catch (error) {
    console.error('Login error:', error)

    let message = 'Login gagal'

    if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.response?.status === 401) {
      message = 'Username atau password salah'
    } else if (error.code === 'ERR_NETWORK') {
      message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
    } else if (error.message.includes('certificate')) {
      message = 'Masalah sertifikat SSL. Mencoba koneksi alternatif...'
    } else if (!error.response) {
      message = 'Tidak dapat terhubung ke server'
    }

    showSnackbar(message, 'error')
  } finally {
    isButtonLoading.value = false
  }
}
const showSnackbar = (text, color = 'success') => {
  contentSnackbar.value.text = text
  contentSnackbar.value.color = color
  contentSnackbar.value.snackbar = true
}

const logout = () => {
  Cookies.remove('token')
  localStorage.removeItem('peran')
  localStorage.removeItem('user')
  localStorage.removeItem('headerData')
  delete axios.defaults.headers.common['Authorization']
  router.push('/admin/login')
}

const isLoggedIn = () => {
  return !!Cookies.get('token')
}

const goToRegister = () => {
  try {
    if (isButtonLoading.value) return

    emit('go-to-register')

    router.push({ name: 'PublicRegistrasi' })
      .then(() => {
        console.log('Navigated to register')
      })
      .catch(error => {
        console.error('Navigation error:', error)
        router.push('/admin/registrasi')
          .catch(fallbackError => {
            console.error('Fallback navigation failed:', fallbackError)
            showSnackbar('Gagal membuka halaman registrasi', 'error')
          })
      })

  } catch (error) {
    console.error('Exception in goToRegister:', error)
    showSnackbar('Terjadi kesalahan saat membuka registrasi', 'error')
  }
}
const openDownloadLink = () => {
  try {
    if (isButtonLoading.value) return

    const url = 'https://drive.usercontent.google.com/download?id=1q6fifF4ZHl7GZBzwm4JK_kqUXmQznX8b&export=download&authuser=0&confirm=t&uuid=ed5ce839-60cd-4e10-9d82-23bf60cc1e1c&at=APcXIO2R-nVJ81UlwcRNusdHEsnJ:1769850140393'

    // buka di tab baru
    window.open(url, '_blank')

    console.log('Download link opened')
  } catch (error) {
    console.error('Exception in openDownloadLink:', error)
    showSnackbar('Gagal membuka link download', 'error')
  }
}

// Lifecycle
onMounted(() => {
  axios.defaults.timeout = 30000
  axios.defaults.headers.common['Accept'] = 'application/json'
  axios.defaults.headers.common['Content-Type'] = 'application/json'

  const token = Cookies.get('token')
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    router.push('/admin/user').catch(err => {
      console.log('Already logged in redirect error:', err)
    })
  }

  fetchSongs()

  if (audioPlayer.value) {
    audioPlayer.value.volume = volume.value / 100
    audioPlayer.value.setAttribute('preload', 'metadata')
  }
})

onUnmounted(() => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
  }
})

defineExpose({
  logout,
  isLoggedIn,
  fetchHeaderData
})
</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #ffffff 20%, #c7b063 40%);
  overflow-y: auto;
}

.fullscreen-row {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 16px;
  box-sizing: border-box;
}

:deep(.v-container) {
  max-width: none !important;
  padding: 0 !important;
}

:deep(.v-row) {
  margin: 0 !important;
}

/* Floating Music Player - Pojok Kanan Bawah */
.floating-music-player {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  max-width: calc(100vw - 40px);
  z-index: 9999;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 1px solid rgba(251, 191, 36, 0.3);
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.floating-music-player:hover {
  border-color: rgba(251, 191, 36, 0.6);
  box-shadow: 0 12px 48px rgba(251, 191, 36, 0.3);
  transform: translateY(-2px);
}

/* Responsive untuk mobile */
@media (max-width: 600px) {
  .floating-music-player {
    bottom: 10px;
    right: 10px;
    width: calc(100vw - 20px);
    max-width: none;
  }
}

.music-info {
  min-width: 0;
  max-width: 180px;
}

.music-controls {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

/* Dropdown List Styles */
:deep(.v-list) {
  max-height: 400px;
  overflow-y: auto;
}

:deep(.v-list-item) {
  transition: all 0.2s ease;
  cursor: pointer;
}

:deep(.v-list-item:hover) {
  background-color: rgba(251, 191, 36, 0.1) !important;
}

:deep(.v-list-item.bg-amber) {
  background-color: rgb(251, 191, 36) !important;
}

:deep(.v-list-item.bg-amber:hover) {
  background-color: rgb(245, 158, 11) !important;
}

/* Scrollbar Styles */
:deep(.v-list::-webkit-scrollbar) {
  width: 8px;
}

:deep(.v-list::-webkit-scrollbar-track) {
  background: #1a1a1a;
}

:deep(.v-list::-webkit-scrollbar-thumb) {
  background: rgba(251, 191, 36, 0.5);
  border-radius: 4px;
}

:deep(.v-list::-webkit-scrollbar-thumb:hover) {
  background: rgba(251, 191, 36, 0.7);
}

@media (max-height: 600px) {
  .fullscreen-row {
    align-items: flex-start;
    padding-top: 20px;
  }
}

.login-container::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

/* Animation for playing indicator */
@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.playing-icon {
  animation: pulse 1s ease-in-out infinite;
}

:deep(.v-icon.mdi-volume-high) {
  animation: pulse 1s ease-in-out infinite;
}
</style>