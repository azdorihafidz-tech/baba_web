<template>
    <v-container fluid class="register-container">
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
                        <h3 :class="formTitleClass">Daftar Akun</h3>
                    </div>

                    <!-- Form -->
                    <v-form @submit.prevent="handleRegister" :class="formClass">
                        <v-text-field v-model="inputRegister.no_id" label="Nomor ID" density="compact"
                            prepend-inner-icon="mdi-card-account-details" variant="outlined" :class="inputClass"
                            color="amber" base-color="grey-lighten-1" maxlength="16" @input="validateno_id" />

                        <v-text-field v-model="inputRegister.nama" label="Nama Lengkap" density="compact"
                            prepend-inner-icon="mdi-account" variant="outlined" :class="inputClass" color="amber"
                            base-color="grey-lighten-1" />

                        <v-text-field v-model="inputRegister.nama_panggilan" label="Nama Panggilan" density="compact"
                            prepend-inner-icon="mdi-account-outline" variant="outlined" :class="inputClass"
                            color="amber" base-color="grey-lighten-1" />

                        <v-text-field v-model="inputRegister.tempat_lahir" label="Tempat Lahir" density="compact"
                            prepend-inner-icon="mdi-map-marker" variant="outlined" :class="inputClass" color="amber"
                            base-color="grey-lighten-1" />

                        <v-text-field v-model="inputRegister.tgl_lahir" label="Tanggal Lahir" density="compact"
                            prepend-inner-icon="mdi-calendar" variant="outlined" :class="inputClass" color="amber"
                            base-color="grey-lighten-1" type="date" />

                        <v-text-field v-model="inputRegister.nohp" label="Nomor HP" density="compact"
                            prepend-inner-icon="mdi-phone" variant="outlined" :class="inputClass" color="amber"
                            base-color="grey-lighten-1" @input="validatePhone" />

                        <v-textarea v-model="inputRegister.alamat" label="Alamat Lengkap" density="compact"
                            prepend-inner-icon="mdi-home" variant="outlined" :class="inputClass" color="amber"
                            base-color="grey-lighten-1" rows="2" auto-grow />

                        <v-select v-model="inputRegister.class_member" label="Class Member" density="compact"
                            prepend-inner-icon="mdi-account-group" variant="outlined" :items="classMemberOptions"
                            item-title="text" item-value="value" :class="inputClass" color="amber"
                            base-color="grey-lighten-1" clearable />
                        <!-- Tambahkan SEBELUM atau SETELAH field cabang -->

                        <!-- <v-select v-model="inputRegister.otoritas" label="Otoritas" density="compact"
                            prepend-inner-icon="mdi-account-key" variant="outlined" :items="otoritasOptions"
                            item-title="text" item-value="value" :class="inputClass" color="amber"
                            base-color="grey-lighten-1" clearable /> -->

                        <v-select v-model="inputRegister.jenis_kelamin" label="Jenis Kelamin" density="compact"
                            prepend-inner-icon="mdi-gender-male-female" variant="outlined" :items="jenisKelaminOptions"
                            item-title="text" item-value="value" :class="inputClass" color="amber"
                            base-color="grey-lighten-1" clearable />

                        <v-text-field v-model="inputRegister.username" label="Username" density="compact"
                            prepend-inner-icon="mdi-at" variant="outlined" :class="inputClass" color="amber"
                            base-color="grey-lighten-1" />

                        <v-select v-model="inputRegister.cabang" label="Cabang (Provinsi)" density="compact"
                            prepend-inner-icon="mdi-map-marker" variant="outlined" :items="cabangOptions"
                            item-title="text" item-value="value" :class="inputClass" color="amber"
                            base-color="grey-lighten-1" clearable :loading="loadingProvinsi"
                            :disabled="loadingProvinsi" />

                        <!-- Upload Foto Profil -->
                        <v-file-input v-model="inputRegister.path_gambar_profile" label="Foto Profil"
                            prepend-inner-icon="mdi-camera" accept="image/png, image/jpeg, image/jpg" variant="outlined"
                            :class="inputClass" color="amber" base-color="grey-lighten-1" density="compact"
                            @change="handleFotoProfileChange" />

                        <!-- Preview Foto Profil -->
                        <v-img v-if="previewFotoProfile" :src="previewFotoProfile" max-width="150" height="150"
                            class="mx-auto my-2 rounded-xl" contain />

                        <v-text-field v-model="inputRegister.password" :type="visible ? 'text' : 'password'"
                            density="compact" label="Password" prepend-inner-icon="mdi-lock"
                            :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append-inner="togglePasswordVisibility" variant="outlined" :class="inputClass"
                            color="amber" base-color="grey-lighten-1" />

                        <v-btn type="submit" :loading="isButtonLoading" :class="buttonClass" :size="buttonSize" block
                            rounded="lg" color="amber" style="letter-spacing: 1px;">
                            <v-icon start>mdi-account-plus</v-icon>
                            DAFTAR SEKARANG
                        </v-btn>
                    </v-form>

                    <v-divider :class="dividerClass" />

                    <div class="text-center">
                        <span :class="linkTextClass">Sudah punya akun? </span>
                        <v-btn variant="text" color="amber" @click="goToLogin" :size="linkButtonSize">
                            Masuk sekarang
                        </v-btn>
                    </div>

                    <!-- <div :class="footerClass">
                        <p :class="footerTitleClass">Open Reseller & Distributor</p>
                        <p :class="footerContactClass">
                            📱 <a href="tel:082276617334"
                                style="color: inherit; text-decoration: none;">0822-7661-7334</a> |
                            🌐 <a href="https://www.babaparfumeindonesia.com" target="_blank"
                                style="color: inherit; text-decoration: none;">www.babaparfumeindonesia.com</a>
                        </p>
                    </div> -->
                </v-card <!-- Copyright -->
                <div :class="copyrightClass">
                    <p class="text-caption text-grey-lighten-1">
                        © 2025 - BABA PARFUM INDONESIA - Version 1.0.0
                    </p>
                </div>
            </v-col>
        </v-row>

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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useDisplay } from 'vuetify'

// Composables
const router = useRouter()
const { mobile, smAndDown, xs } = useDisplay()

// Reactive data
const visible = ref(false)
const isButtonLoading = ref(false)
const loadingProvinsi = ref(false)
const previewFotoProfile = ref(null)

const inputRegister = ref({
    no_id: '',
    nama: '',
    nama_panggilan: '',
    tempat_lahir: '',
    tgl_lahir: '',
    jenis_kelamin: '',
    nohp: '',
    alamat: '',
    class_member: '',
    username: '',
    password: '',
    cabang: '',
    path_gambar_profile: '',
    otoritas: ''
})

const contentSnackbar = ref({
    snackbar: false,
    text: '',
    color: 'success'
})

// Data provinsi akan diisi dari API
const cabangOptions = ref([
    { text: 'MVO', value: 'mvo' },
    { text: 'Distributor', value: 'distributor' },
    { text: 'Founder', value: 'founder' }
])

// Options untuk otoritas
const otoritasOptions = ref([
    { text: 'MVO', value: 'mvo' },
    { text: 'Distributor', value: 'distributor' },
    { text: 'Founder', value: 'founder' }
])

// Options untuk class member
const classMemberOptions = ref([
    { text: 'SILVER', value: 'silver' },
    { text: 'PLATINUM', value: 'platinum' },
    { text: 'GOLD', value: 'gold' },
])
// Options untuk jenis kelamin
const jenisKelaminOptions = ref([
    { text: 'Laki-laki', value: 'L' },
    { text: 'Perempuan', value: 'P' }
])

// Responsive computed properties
const logoSize = computed(() => xs.value ? 60 : smAndDown.value ? 70 : 80)
const titleClass = computed(() => xs.value ? 'text-h6 font-weight-bold text-amber mb-1' : smAndDown.value ? 'text-h5 font-weight-bold text-amber mb-1' : 'text-h4 font-weight-bold text-amber mb-1')
const subtitleClass = computed(() => xs.value ? 'text-caption text-amber-lighten-1 mb-0' : 'text-body-2 text-amber-lighten-1 mb-0')
const formTitleClass = computed(() => xs.value ? 'text-subtitle-1 font-weight-medium text-white mt-2' : smAndDown.value ? 'text-h6 font-weight-medium text-white mt-3' : 'text-h6 font-weight-medium text-white mt-4')
const cardClass = computed(() => xs.value ? 'pa-4 bg-grey-darken-4' : smAndDown.value ? 'pa-6 bg-grey-darken-4' : 'pa-8 bg-grey-darken-4')
const logoSection = computed(() => xs.value ? 'text-center mb-4' : smAndDown.value ? 'text-center mb-6' : 'text-center mb-8')
const formClass = computed(() => xs.value ? 'mb-3' : 'mb-4')
const inputClass = computed(() => xs.value ? 'mb-2' : 'mb-3')
const buttonClass = computed(() => xs.value ? 'mb-3 text-black font-weight-bold' : 'mb-4 text-black font-weight-bold')
const buttonSize = computed(() => xs.value ? 'default' : 'large')
const dividerClass = computed(() => xs.value ? 'my-3 border-opacity-25' : 'my-4 border-opacity-25')
const linkTextClass = computed(() => xs.value ? 'text-caption text-grey-lighten-1' : 'text-grey-lighten-1')
const linkButtonSize = computed(() => xs.value ? 'small' : 'default')
const footerClass = computed(() => xs.value ? 'text-center mt-4' : smAndDown.value ? 'text-center mt-5' : 'text-center mt-6')
const footerTitleClass = computed(() => xs.value ? 'text-caption font-weight-bold text-amber mb-1' : 'text-body-2 font-weight-bold text-amber mb-1')
const footerContactClass = computed(() => xs.value ? 'text-caption text-grey-lighten-1' : 'text-caption text-grey-lighten-1')
const copyrightClass = computed(() => xs.value ? 'text-center mt-2' : 'text-center mt-4')

// Methods
const fetchProvinsiData = async () => {
    loadingProvinsi.value = true

    try {
        console.log('Fetching provinsi data from API...')

        const response = await axios.get('https://babaapi.babaparfume.id/api/provinsi', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000 // 10 detik timeout
        })

        console.log('Provinsi API response:', response.data)

        if (response.data.status === 'success' && response.data.data) {
            // Transform API data to select options format
            cabangOptions.value = response.data.data.map(provinsi => ({
                text: provinsi.code,
                value: provinsi.id
            }))

            console.log('Provinsi options loaded:', cabangOptions.value.length, 'items')
        } else {
            console.error('Invalid provinsi API response structure')
            showSnackbar('Gagal memuat data provinsi', 'error')
        }

    } catch (error) {
        console.error('Error fetching provinsi data:', error)

        let message = 'Gagal memuat data provinsi'

        if (error.response) {
            message = `Error ${error.response.status}: ${error.response.data?.message || 'Server error'}`
        } else if (error.id === 'ECONNABORTED') {
            message = 'Timeout saat memuat data provinsi'
        } else if (error.id === 'ERR_NETWORK') {
            message = 'Tidak dapat terhubung ke server provinsi'
        }

        showSnackbar(message, 'error')

        // Fallback: gunakan data provinsi default jika API gagal
    } finally {
        loadingProvinsi.value = false
    }
}
const handleFotoProfileChange = (event) => {
    // Untuk Vuetify v-file-input, file langsung tersedia di v-model
    const file = inputRegister.value.path_gambar_profile

    if (file) {
        // Validasi tipe file
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
        if (!allowedTypes.includes(file.type)) {
            showSnackbar('Format file harus PNG, JPG, atau JPEG', 'error')
            inputRegister.value.path_gambar_profile = null
            previewFotoProfile.value = null
            return
        }

        // Validasi ukuran file (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            showSnackbar('Ukuran file maksimal 5MB', 'error')
            inputRegister.value.path_gambar_profile = null
            previewFotoProfile.value = null
            return
        }

        // Baca file untuk preview
        const reader = new FileReader()
        reader.onload = (e) => {
            previewFotoProfile.value = e.target.result
        }
        reader.readAsDataURL(file)
    } else {
        previewFotoProfile.value = null
    }
}
const validateno_id = (event) => {
    // Hanya izinkan angka untuk no_id
    const value = event.target.value
    inputRegister.value.no_id = value.replace(/[^0-9]/g, '')
}

const validatePhone = (event) => {
    // Hanya izinkan angka untuk nomor HP
    const value = event.target.value
    inputRegister.value.nohp = value.replace(/[^0-9]/g, '')
}

const togglePasswordVisibility = () => {
    visible.value = !visible.value
}

const handleRegister = async () => {
    console.log('Register attempt with new API (NO FRONTEND VALIDATION)')

    isButtonLoading.value = true

    // Buat FormData
    const formData = new FormData()

    // Append semua field (langsung kirim ke backend)
    for (const [key, value] of Object.entries(inputRegister.value)) {
        formData.append(key, value ?? '')
    }

    // Daftar URL API
    const apiUrls = [
        'https://babaapi.babaparfume.id/api/user',
        'https://babaapi.babaparfume.id/api/user'
    ]

    const requestConfig = {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
        },
        timeout: 30000
    }

    let lastError = null
    let success = false

    // Loop mencoba API
    for (const apiUrl of apiUrls) {
        try {
            console.log(`Trying API: ${apiUrl}`)

            const response = await axios.post(apiUrl, formData, requestConfig)
            console.log('Register success:', response.data)

            if (response.status === 200 || response.status === 201) {
                showSnackbar(`Registrasi berhasil!`, 'success')

                // Reset form
                inputRegister.value = {
                    no_id: '',
                    nama: '',
                    nama_panggilan: '',
                    tempat_lahir: '',
                    tgl_lahir: '',
                    nohp: '',
                    alamat: '',
                    class_member: '',
                    username: '',
                    password: '',
                    cabang: '',
                    path_gambar_profile: null,
                    otoritas: '',
                    jenis_kelamin: ''
                }
                previewFotoProfile.value = null

                setTimeout(() => {
                    router.push('/admin/login')
                }, 2000)

                success = true
                break
            }

        } catch (error) {
            console.error(`Error at ${apiUrl}:`, error)
            lastError = error

            if (error.response) break

            if (
                error.code === 'ERR_CERT_DATE_INVALID' ||
                error.code === 'ERR_NETWORK' ||
                error.message?.includes('ERR_CERT') ||
                error.message?.includes('SSL') ||
                error.message?.includes('Network Error')
            ) {
                console.log(`SSL/Network error, trying next URL...`)
                continue
            }

            break
        }
    }

    // Error handling backend
    if (!success && lastError) {
        let message = 'Registrasi gagal'

        if (lastError.response) {
            const status = lastError.response.status
            const data = lastError.response.data

            switch (status) {
                case 400: message = data?.message || 'Bad Request'; break
                case 409: message = data?.message || 'Data sudah ada'; break
                case 422: message = JSON.stringify(data?.errors) || 'Data tidak valid'; break
                case 500: message = 'Server error'; break
                default: message = data?.message || `Error: ${status}`
            }
        } else if (lastError.code === 'ECONNABORTED') {
            message = 'Timeout'
        } else if (lastError.code === 'ERR_NETWORK') {
            message = 'Network error'
        }

        showSnackbar(message, 'error')
    }

    isButtonLoading.value = false
}

const showSnackbar = (text, color = 'success') => {
    contentSnackbar.value.text = text
    contentSnackbar.value.color = color
    contentSnackbar.value.snackbar = true
}

const goToLogin = () => {
    console.log('Navigating to login page...')

    try {
        if (isButtonLoading.value) return

        router.push({ name: 'Login' })
            .then(() => {
                console.log('Successfully navigated to login page')
            })
            .catch(error => {
                console.error('Navigation error:', error)
                router.push('/admin/login')
                    .catch(fallbackError => {
                        console.error('Fallback navigation failed:', fallbackError)
                        showSnackbar('Gagal membuka halaman login', 'error')
                    })
            })

    } catch (error) {
        console.error('Exception in goToLogin:', error)
        showSnackbar('Terjadi kesalahan saat membuka login', 'error')
    }
}

const debugRouteInfo = () => {
    console.log('Current route:', router.currentRoute.value)
    console.log('Router instance:', router)
    console.log('Available routes:', router.getRoutes())
}

// Lifecycle
onMounted(() => {
    console.log('BABA Parfum Register Form mounted with API Provinsi and Otoritas')
    console.log('Provinsi API Endpoint:', 'https://babaapi.babaparfume.id/api/provinsi')
    debugRouteInfo()

    // Fetch provinsi data saat component dimount
    fetchProvinsiData()
})
</script>

<style scoped>
/* Pastikan container benar-benar fullscreen */
.register-container {
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

/* Reset margin dan padding dari elemen Vuetify */
:deep(.v-container) {
    max-width: none !important;
    padding: 0 !important;
}

:deep(.v-row) {
    margin: 0 !important;
}

/* Responsive adjustments */
@media (max-height: 700px) {
    .fullscreen-row {
        align-items: flex-start;
        padding-top: 20px;
    }
}

@media (max-height: 600px) {
    .register-container {
        padding-top: 10px;
    }

    .fullscreen-row {
        padding: 10px;
    }
}

/* Scrollbar styling untuk mobile */
.register-container::-webkit-scrollbar {
    width: 0px;
    background: transparent;
}

/* Optimasi untuk mobile portrait */
@media (max-width: 600px) and (orientation: portrait) {
    .fullscreen-row {
        padding: 12px 16px;
    }
}

/* Optimasi untuk mobile landscape */
@media (max-width: 900px) and (orientation: landscape) {
    .fullscreen-row {
        align-items: flex-start;
        padding: 8px 16px;
    }
}
</style>