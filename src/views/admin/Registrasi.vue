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
                        <v-text-field v-model="inputRegister.no_id" label="No ID" density="compact"
                            prepend-inner-icon="mdi-card-account-details" variant="outlined" :class="inputClass"
                            color="amber" base-color="grey-lighten-1" maxlength="16" />

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

                        <v-select v-model="inputRegister.jenis_kelamin" label="Jenis Kelamin" density="compact"
                            prepend-inner-icon="mdi-gender-male-female" variant="outlined" :items="jenisKelaminOptions"
                            item-title="text" item-value="value" :class="inputClass" color="amber"
                            base-color="grey-lighten-1" clearable />


                        <v-combobox v-model="inputRegister.mvo_type_id" label="Jabatan" :items="jabatanOptions"
                            item-title="text" item-value="value" :return-object="false" density="compact"
                            prepend-inner-icon="mdi-account-group" variant="outlined" :class="inputClass" color="amber"
                            base-color="grey-lighten-1" clearable />


                        <v-select v-model="inputRegister.cabang" label="Cabang (Provinsi)" density="compact"
                            prepend-inner-icon="mdi-map-marker" variant="outlined" :items="cabangOptions"
                            item-title="text" item-value="value" :class="inputClass" color="amber"
                            base-color="grey-lighten-1" clearable :loading="loadingProvinsi" :disabled="loadingProvinsi"
                            @update:modelValue="onCabangChange" />
                        <!-- MVO -->
                        <v-select v-model="inputRegister.upline_1" label="Pilih MVO" :items="mvoOptions"
                            item-title="text" item-value="value" :loading="loadingMvo" :disabled="!inputRegister.cabang"
                            @update:modelValue="onMvoChange" />

                        <!-- REGIONAL -->
                        <v-select v-model="inputRegister.upline_2" label="Pilih Regional" :items="regionalOptions"
                            item-title="text" item-value="value" :loading="loadingRegional"
                            :disabled="!inputRegister.upline_1" @update:modelValue="onRegionalChange" />

                        <!-- FOUNDER -->
                        <v-select v-model="inputRegister.upline_3" label="Pilih Founder" :items="founderOptions"
                            item-title="text" item-value="value" :loading="loadingFounder"
                            :disabled="!inputRegister.upline_2" @update:modelValue="onFounderChange" />

                        <!-- GM -->
                        <v-select v-model="inputRegister.upline_4" label="Pilih GM" :items="gmOptions" item-title="text"
                            item-value="value" :loading="loadingGm" :disabled="!inputRegister.upline_3"
                            @update:modelValue="onGmChange" />

                        <!-- SUPPLIER -->
                        <v-select v-model="inputRegister.upline_5" label="Pilih Supplier" :items="supplierOptions"
                            item-title="text" item-value="value" :loading="loadingSupplier"
                            :disabled="!inputRegister.upline_4" @update:modelValue="onSupplierChange" />

                        <!-- DISTRIBUTOR -->
                        <v-select v-model="inputRegister.upline_6" label="Pilih Distributor" :items="distributorOptions"
                            item-title="text" item-value="value" :loading="loadingDistributor"
                            :disabled="!inputRegister.upline_5" />


                        <v-text-field v-model="inputRegister.username" label="Username" density="compact"
                            prepend-inner-icon="mdi-at" variant="outlined" :class="inputClass" color="amber"
                            base-color="grey-lighten-1" />

                        <v-text-field v-model="inputRegister.password" :type="visible ? 'text' : 'password'"
                            density="compact" label="Password" prepend-inner-icon="mdi-lock"
                            :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append-inner="togglePasswordVisibility" variant="outlined" :class="inputClass"
                            color="amber" base-color="grey-lighten-1" />

                        <!-- Upload Foto Profil -->
                        <v-file-input v-model="inputRegister.path_gambar_profile" label="Foto Profil"
                            prepend-inner-icon="mdi-camera" accept="image/png, image/jpeg, image/jpg" variant="outlined"
                            :class="inputClass" color="amber" base-color="grey-lighten-1" density="compact"
                            hint="Format: PNG, JPG, JPEG • Maksimal 2 MB" persistent-hint
                            @change="handleFotoProfileChange" />

                        <!-- Preview Foto Profil -->
                        <v-img v-if="previewFotoProfile" :src="previewFotoProfile" max-width="150" height="150"
                            class="mx-auto my-2 rounded-xl" contain />


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
                </v-card>

                <!-- Copyright -->
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

<script>
import axios from 'axios'

export default {
    code: 'RegisterForm',

    data() {
        return {
            visible: false,
            isButtonLoading: false,
            loadingProvinsi: false,
            previewFotoProfile: null,

            mvoOptions: [],
            regionalOptions: [],
            founderOptions: [],
            gmOptions: [],
            supplierOptions: [],
            distributorOptions: [],

            loadingMvo: false,
            loadingRegional: false,
            loadingFounder: false,
            loadingGm: false,
            loadingSupplier: false,
            loadingDistributor: false,

            inputRegister: {
                no_id: '',
                nama: '',
                nama_panggilan: '',
                tempat_lahir: '',
                tgl_lahir: '',
                jenis_kelamin: '',
                nohp: '',
                alamat: '',
                mvo_type_id: '',
                username: '',
                password: '',
                path_gambar_profile: '',
                cabang: '',

                upline_1: '',
                upline_2: '',
                upline_3: '',
                upline_4: '',
                upline_5: '',
                upline_6: '',
                upline_7: '-'
            },

            contentSnackbar: {
                snackbar: false,
                text: '',
                color: 'success'
            },

            cabangOptions: [
                { text: 'MVO', value: 'mvo' },
                { text: 'Distributor', value: 'distributor' },
                { text: 'Founder', value: 'founder' }
            ],

            jabatanOptions: [],

            jenisKelaminOptions: [
                { text: 'Laki-laki', value: 'L' },
                { text: 'Perempuan', value: 'P' }
            ]
        }
    },

    computed: {
        mobile() {
            return this.$vuetify.display.mobile
        },

        smAndDown() {
            return this.$vuetify.display.smAndDown
        },

        xs() {
            return this.$vuetify.display.xs
        },

        logoSize() {
            return this.xs ? 60 : this.smAndDown ? 70 : 80
        },

        titleClass() {
            return this.xs
                ? 'text-h6 font-weight-bold text-amber mb-1'
                : this.smAndDown
                    ? 'text-h5 font-weight-bold text-amber mb-1'
                    : 'text-h4 font-weight-bold text-amber mb-1'
        },

        subtitleClass() {
            return this.xs
                ? 'text-caption text-amber-lighten-1 mb-0'
                : 'text-body-2 text-amber-lighten-1 mb-0'
        },

        formTitleClass() {
            return this.xs
                ? 'text-subtitle-1 font-weight-medium text-white mt-2'
                : this.smAndDown
                    ? 'text-h6 font-weight-medium text-white mt-3'
                    : 'text-h6 font-weight-medium text-white mt-4'
        },

        cardClass() {
            return this.xs
                ? 'pa-4 bg-grey-darken-4'
                : this.smAndDown
                    ? 'pa-6 bg-grey-darken-4'
                    : 'pa-8 bg-grey-darken-4'
        },

        logoSection() {
            return this.xs
                ? 'text-center mb-4'
                : this.smAndDown
                    ? 'text-center mb-6'
                    : 'text-center mb-8'
        },

        formClass() {
            return this.xs ? 'mb-3' : 'mb-4'
        },

        inputClass() {
            return this.xs ? 'mb-2' : 'mb-3'
        },

        buttonClass() {
            return this.xs
                ? 'mb-3 text-black font-weight-bold'
                : 'mb-4 text-black font-weight-bold'
        },

        buttonSize() {
            return this.xs ? 'default' : 'large'
        },

        dividerClass() {
            return this.xs ? 'my-3 border-opacity-25' : 'my-4 border-opacity-25'
        },

        linkTextClass() {
            return this.xs ? 'text-caption text-grey-lighten-1' : 'text-grey-lighten-1'
        },

        linkButtonSize() {
            return this.xs ? 'small' : 'default'
        },

        footerClass() {
            return this.xs
                ? 'text-center mt-4'
                : this.smAndDown
                    ? 'text-center mt-5'
                    : 'text-center mt-6'
        },

        footerTitleClass() {
            return this.xs
                ? 'text-caption font-weight-bold text-amber mb-1'
                : 'text-body-2 font-weight-bold text-amber mb-1'
        },

        footerContactClass() {
            return this.xs
                ? 'text-caption text-grey-lighten-1'
                : 'text-caption text-grey-lighten-1'
        },

        copyrightClass() {
            return this.xs ? 'text-center mt-2' : 'text-center mt-4'
        }
    },

    mounted() {
        console.log('Provinsi API Endpoint:', 'https://babaapi.teknosof.com/api/provinsi')
        this.debugRouteInfo()
        this.fetchProvinsiData()
        this.getAllMvoType()
    },

    methods: {
        onCabangChange(val) {

            this.inputRegister.upline_1 = ''
            this.inputRegister.upline_2 = ''
            this.inputRegister.upline_3 = ''
            this.inputRegister.upline_4 = ''
            this.inputRegister.upline_5 = ''
            this.inputRegister.upline_6 = ''

            this.getMvo(val)
        },
        onMvoChange(val) {

            this.inputRegister.upline_2 = ''
            this.inputRegister.upline_3 = ''
            this.inputRegister.upline_4 = ''
            this.inputRegister.upline_5 = ''
            this.inputRegister.upline_6 = ''

            this.getRegional(val)
        },
        onRegionalChange(val) {

            this.inputRegister.upline_3 = ''
            this.inputRegister.upline_4 = ''
            this.inputRegister.upline_5 = ''
            this.inputRegister.upline_6 = ''

            this.getFounder(val)
        },
        onFounderChange(val) {

            this.inputRegister.upline_4 = ''
            this.inputRegister.upline_5 = ''
            this.inputRegister.upline_6 = ''

            this.getGm(val)
        },
        onGmChange(val) {

            this.inputRegister.upline_5 = ''
            this.inputRegister.upline_6 = ''

            this.getSupplier(val)
        },
        onSupplierChange(val) {

            this.inputRegister.upline_6 = ''

            this.getDistributor(val)
        }
        ,
        async getDistributor(code) {

            this.loadingDistributor = true

            const res = await axios.post(
                'https://babaapi.teknosof.com/api/get/distributor',
                {
                    cabang: this.inputRegister.cabang,
                    upline_1: this.inputRegister.upline_1, // ✅ MVO
                    upline_2: this.inputRegister.upline_2, // ✅ Regional
                    upline_3: this.inputRegister.upline_3, // ✅ Regional                         // ✅ Founder
                    upline_4: this.inputRegister.upline_4,
                    upline_5: code
                }
            )

            this.distributorOptions = res.data.data.map(i => ({
                text: `${i.code} - ${i.nama}`,
                value: i.code
            }))

            this.loadingDistributor = false
        },
        async getSupplier(code) {

            this.loadingSupplier = true

            const res = await axios.post(
                'https://babaapi.teknosof.com/api/get/supplier',
                {
                    cabang: this.inputRegister.cabang,
                    upline_1: this.inputRegister.upline_1, // ✅ MVO
                    upline_2: this.inputRegister.upline_2, // ✅ Regional
                    upline_3: this.inputRegister.upline_3, // ✅ Regional                         // ✅ Founder
                    upline_4: code
                }
            )

            this.supplierOptions = res.data.data.map(i => ({
                text: `${i.code} - ${i.nama}`,
                value: i.code
            }))

            this.loadingSupplier = false
        },
        async getGm(code) {

            this.loadingGm = true

            try {

                const res = await axios.post(
                    'https://babaapi.teknosof.com/api/get/gm',
                    {
                        cabang: this.inputRegister.cabang,
                        upline_1: this.inputRegister.upline_1, // ✅ MVO
                        upline_2: this.inputRegister.upline_2, // ✅ Regional
                        upline_3: code                         // ✅ Founder
                    }
                )

                this.gmOptions = res.data.data.map(i => ({
                    text: `${i.code} - ${i.nama}`,
                    value: i.code
                }))

            } catch (err) {
                console.error(err)
                this.showSnackbar('Gagal memuat data GM', 'error')
            }

            this.loadingGm = false
        },
        async getFounder(code) {

            this.loadingFounder = true

            try {

                const res = await axios.post(
                    'https://babaapi.teknosof.com/api/get/founder',
                    {
                        cabang: this.inputRegister.cabang,
                        upline_1: this.inputRegister.upline_1, // ✅ tambahkan ini
                        upline_2: code
                    }
                )

                this.founderOptions = res.data.data.map(i => ({
                    text: `${i.code} - ${i.nama}`,
                    value: i.code
                }))

            } catch (err) {
                console.error(err)
                this.showSnackbar('Gagal memuat data Founder', 'error')
            }

            this.loadingFounder = false
        },
        async getRegional(code) {

            this.loadingRegional = true

            const res = await axios.post(
                'https://babaapi.teknosof.com/api/get/regional',
                {
                    cabang: this.inputRegister.cabang,
                    upline_1: code
                }
            )

            this.regionalOptions = res.data.data.map(i => ({
                text: `${i.code} - ${i.nama}`,
                value: i.code
            }))

            this.loadingRegional = false
        },
        async getMvo(cabang) {

            this.loadingMvo = true

            const res = await axios.post(
                'https://babaapi.teknosof.com/api/get/mvo',
                { cabang }
            )

            this.mvoOptions = res.data.data.map(i => ({
                text: `${i.code} - ${i.nama}`,
                value: i.code
            }))

            this.loadingMvo = false
        },
        async fetchProvinsiData() {
            this.loadingProvinsi = true

            try {
                console.log('Fetching provinsi data from API...')

                const response = await axios.get('https://babaapi.teknosof.com/api/provinsi', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 10000
                })

                console.log('Provinsi API response:', response.data)

                if (response.data.status === 'success' && response.data.data) {
                    this.cabangOptions = response.data.data.map(provinsi => ({
                        text: provinsi.code,
                        value: provinsi.code,
                    }))

                    console.log('Provinsi options loaded:', this.cabangOptions.length, 'items')
                } else {
                    console.error('Invalid provinsi API response structure')
                    this.showSnackbar('Gagal memuat data provinsi', 'error')
                }

            } catch (error) {
                console.error('Error fetching provinsi data:', error)

                let message = 'Gagal memuat data provinsi'

                if (error.response) {
                    message = `Error ${error.response.status}: ${error.response.data?.message || 'Server error'}`
                } else if (error.code === 'ECONNABORTED') {
                    message = 'Timeout saat memuat data provinsi'
                } else if (error.code === 'ERR_NETWORK') {
                    message = 'Tidak dapat terhubung ke server provinsi'
                }

                this.showSnackbar(message, 'error')

            } finally {
                this.loadingProvinsi = false
            }
        },


        async getAllMvoType() {

            try {
                console.log('Fetching mvotype data from API...')

                const response = await axios.get('https://babaapi.teknosof.com/api/mvo-type', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 10000
                })

                console.log('mvotype API response:', response.data)

                if (response.data.status === 'success' && response.data.data) {
                    // 🔥 mapping ke format select
                    this.jabatanOptions = response.data.data.map(item => ({
                        text: item.jabatan,
                        value: item.id
                    }));
                    console.log('mvotype options loaded:', this.jabatanOptions.length, 'items')
                } else {
                    console.error('Invalid mvotype API response structure')
                    this.showSnackbar('Gagal memuat data mvotype', 'error')
                }

            } catch (error) {
                console.error('Error fetching mvotype data:', error)

                let message = 'Gagal memuat data mvotype'

                if (error.response) {
                    message = `Error ${error.response.status}: ${error.response.data?.message || 'Server error'}`
                } else if (error.code === 'ECONNABORTED') {
                    message = 'Timeout saat memuat data mvotype'
                } else if (error.code === 'ERR_NETWORK') {
                    message = 'Tidak dapat terhubung ke server mvotype'
                }

                this.showSnackbar(message, 'error')

            } finally {
                this.loadingProvinsi = false
            }
        },

        handleFotoProfileChange(event) {
            const file = this.inputRegister.path_gambar_profile

            if (file) {
                const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
                if (!allowedTypes.includes(file.type)) {
                    this.showSnackbar('Format file harus PNG, JPG, atau JPEG', 'error')
                    this.inputRegister.path_gambar_profile = null
                    this.previewFotoProfile = null
                    return
                }

                const maxSize = 2 * 1024 * 1024
                if (file.size > maxSize) {
                    this.showSnackbar('Ukuran file maksimal 2MB', 'error')
                    this.inputRegister.path_gambar_profile = null
                    this.previewFotoProfile = null
                    return
                }

                const reader = new FileReader()
                reader.onload = (e) => {
                    this.previewFotoProfile = e.target.result
                }
                reader.readAsDataURL(file)
            } else {
                this.previewFotoProfile = null
            }
        },

        validateno_id(event) {
            const value = event.target.value
            this.inputRegister.no_id = value.replace(/[^0-9]/g, '')
        },

        validatePhone(event) {
            const value = event.target.value
            this.inputRegister.nohp = value.replace(/[^0-9]/g, '')
        },

        togglePasswordVisibility() {
            this.visible = !this.visible
        },

        async handleRegister() {
            console.log('Register attempt with new API (NO FRONTEND VALIDATION)')

            this.isButtonLoading = true

            const formData = new FormData()

            for (const [key, value] of Object.entries(this.inputRegister)) {
                formData.append(key, value ?? '')
            }

            const apiUrls = [
                'https://babaapi.teknosof.com/api/user',
                'https://babaapi.teknosof.com/api/user'
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

            for (const apiUrl of apiUrls) {
                try {
                    console.log(`Trying API: ${apiUrl}`)

                    const response = await axios.post(apiUrl, formData, requestConfig)
                    console.log('Register success:', response.data)

                    if (response.status === 200 || response.status === 201) {
                        this.showSnackbar(`Registrasi berhasil!`, 'success')

                        this.inputRegister = {
                            no_id: '',
                            nama: '',
                            nama_panggilan: '',
                            tempat_lahir: '',
                            tgl_lahir: '',
                            nohp: '',
                            alamat: '',
                            mvo_type_id: '',
                            username: '',
                            password: '',
                            cabang: '',
                            path_gambar_profile: null,
                            jenis_kelamin: ''
                        }
                        this.previewFotoProfile = null

                        setTimeout(() => {
                            this.$router.push('/admin/login')
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

                this.showSnackbar(message, 'error')
            }

            this.isButtonLoading = false
        },

        showSnackbar(text, color = 'success') {
            this.contentSnackbar.text = text
            this.contentSnackbar.color = color
            this.contentSnackbar.snackbar = true
        },

        goToLogin() {
            console.log('Navigating to login page...')

            try {
                if (this.isButtonLoading) return

                this.$router.push({ name: 'Login' })
                    .then(() => {
                        console.log('Successfully navigated to login page')
                    })
                    .catch(error => {
                        console.error('Navigation error:', error)
                        this.$router.push('/admin/login')
                            .catch(fallbackError => {
                                console.error('Fallback navigation failed:', fallbackError)
                                this.showSnackbar('Gagal membuka halaman login', 'error')
                            })
                    })

            } catch (error) {
                console.error('Exception in goToLogin:', error)
                this.showSnackbar('Terjadi kesalahan saat membuka login', 'error')
            }
        },

        debugRouteInfo() {
            console.log('Current route:', this.$router.currentRoute.value)
            console.log('Router instance:', this.$router)
            console.log('Available routes:', this.$router.getRoutes())
        }
    }
}
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