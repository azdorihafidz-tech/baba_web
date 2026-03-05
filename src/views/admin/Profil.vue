<template>
    <v-container fluid class="pa-4">
        <!-- Loading State -->
        <v-row v-if="isLoading" justify="center">
            <v-col cols="12" class="text-center py-12">
                <v-progress-circular indeterminate size="64" color="amber"></v-progress-circular>
                <p class="text-grey-lighten-1 mt-4">Memuat data profil...</p>
            </v-col>
        </v-row>

        <!-- Main Content -->
        <v-row v-else>
            <!-- Profile Picture Section -->
            <v-col cols="12" md="4">
                <v-card color="grey-darken-4" elevation="4">
                    <v-card-text class="text-center pa-6">
                        <div class="position-relative d-inline-block mb-4">
                            <v-avatar size="180" class="border-4 border-amber">
                                <v-img :src="getProfileImageUrl()" :alt="userData?.nama" cover @error="onImageError">
                                    <template v-slot:placeholder>
                                        <v-row class="fill-height ma-0" align="center" justify="center">
                                            <v-progress-circular indeterminate color="amber"></v-progress-circular>
                                        </v-row>
                                    </template>
                                </v-img>
                            </v-avatar>
                        </div>

                        <h3 class="text-h5 font-weight-bold text-white mb-2">
                            {{ userData?.nama || 'Nama Tidak Tersedia' }}
                        </h3>
                        <p class="text-body-2 text-grey-lighten-1 mb-1">
                            @{{ userData?.username || 'username' }}
                        </p>

                        <v-divider class="my-4 border-opacity-25"></v-divider>

                        <v-row dense class="text-center">
                            <v-col cols="6">
                                <div class="stat-item">
                                    <v-icon color="amber" size="small">mdi-store</v-icon>
                                    <p class="text-caption text-grey-lighten-1 mb-0 mt-1">Cabang</p>
                                    <p class="text-h6 font-weight-bold text-white mb-0">
                                        {{ userData?.cabang || '-' }}
                                    </p>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div class="stat-item">
                                    <v-icon color="amber" size="small">mdi-cake-variant</v-icon>
                                    <p class="text-caption text-grey-lighten-1 mb-0 mt-1">Usia</p>
                                    <p class="text-h6 font-weight-bold text-white mb-0">
                                        {{ calculateAge() }} Tahun
                                    </p>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Profile Details Section -->
            <v-col cols="12" md="8">
                <v-card color="grey-darken-4" elevation="8" class="profile-card">
                    <v-card-title class="profile-header d-flex align-center justify-space-between"
                        :class="$vuetify.display.smAndDown ? 'pa-2' : 'pa-4 bg-grey-darken-3'">

                        <div class="d-flex align-center">
                            <v-icon icon="mdi-account-circle" color="amber" :size="$vuetify.display.smAndDown ? 16 : 20"
                                class="mr-2"></v-icon>
                            <span :class="$vuetify.display.smAndDown ? 'text-caption' : 'text-h6'"
                                class="font-weight-bold text-amber">
                                Informasi Detail Profil
                            </span>
                        </div>

                        <div class="d-flex align-center ga-1">
                            <v-btn color="amber" variant="flat" :size="$vuetify.display.smAndDown ? 'x-small' : 'small'"
                                @click="dialogPassword = true">
                                <v-icon start size="16">mdi-lock-reset</v-icon>
                                <span v-if="!$vuetify.display.smAndDown">Ganti Password</span>
                            </v-btn>

                            <v-chip variant="flat" color="green" text-color="grey-darken-4"
                                :size="$vuetify.display.smAndDown ? 'x-small' : 'small'">
                                <v-icon icon="mdi-check-circle" size="14" class="mr-1"></v-icon>
                                {{ userData.aktivasi === '1' ? 'Aktif' : 'Tidak Aktif' }}
                            </v-chip>
                        </div>
                    </v-card-title>

                    <v-card-text class="pa-6">
                        <v-row>
                            <!-- Informasi Pribadi -->
                            <v-col cols="12">
                                <div class="section-wrapper mb-6">
                                    <h4 class="text-subtitle-1 font-weight-bold text-amber mb-3 section-title">
                                        <v-icon start size="small">mdi-account</v-icon>
                                        Informasi Pribadi
                                    </h4>
                                    <v-row>
                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="editedData.nama" label="Nama Lengkap"
                                                prepend-inner-icon="mdi-account" variant="outlined" color="amber"
                                                bg-color="grey-darken-4" class="profile-field" disabled></v-text-field>
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="editedData.nama_panggilan" label="Nama Panggilan"
                                                prepend-inner-icon="mdi-account-heart" variant="outlined" color="amber"
                                                bg-color="grey-darken-4" class="profile-field" disabled></v-text-field>
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="editedData.no_id" label="NO ID"
                                                prepend-inner-icon="mdi-card-account-details" variant="outlined"
                                                color="amber" bg-color="grey-darken-4" class="profile-field"
                                                disabled></v-text-field>
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <v-select v-model="editedData.jenis_kelamin" label="Jenis Kelamin"
                                                prepend-inner-icon="mdi-gender-male-female" :items="genderOptions"
                                                variant="outlined" color="amber" bg-color="grey-darken-4"
                                                class="profile-field" disabled></v-select>
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="editedData.tempat_lahir" label="Tempat Lahir"
                                                prepend-inner-icon="mdi-map-marker" variant="outlined" color="amber"
                                                bg-color="grey-darken-4" class="profile-field" disabled></v-text-field>
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="editedData.tgl_lahir" label="Tanggal Lahir"
                                                prepend-inner-icon="mdi-calendar" type="date" variant="outlined"
                                                color="amber" bg-color="grey-darken-4" class="profile-field"
                                                disabled></v-text-field>
                                        </v-col>
                                    </v-row>
                                </div>
                            </v-col>

                            <!-- Informasi Kontak -->
                            <v-col cols="12">
                                <div class="section-wrapper mb-6">
                                    <h4 class="text-subtitle-1 font-weight-bold text-amber mb-3 section-title">
                                        <v-icon start size="small">mdi-phone</v-icon>
                                        Informasi Kontak
                                    </h4>
                                    <v-row>
                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="editedData.nohp" label="No. HP / WhatsApp"
                                                prepend-inner-icon="mdi-cellphone" variant="outlined" color="amber"
                                                bg-color="grey-darken-4" class="profile-field" disabled></v-text-field>
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="userData.username" label="Username"
                                                prepend-inner-icon="mdi-at" variant="outlined" color="amber"
                                                bg-color="grey-darken-4" hint="Username tidak dapat diubah"
                                                persistent-hint class="profile-field" disabled></v-text-field>
                                        </v-col>

                                        <v-col cols="12">
                                            <v-textarea v-model="editedData.alamat" label="Alamat Lengkap"
                                                prepend-inner-icon="mdi-home-map-marker" variant="outlined"
                                                color="amber" rows="3" bg-color="grey-darken-4" class="profile-field"
                                                disabled></v-textarea>
                                        </v-col>
                                    </v-row>
                                </div>
                            </v-col>

                            <!-- Informasi Akun -->
                            <v-col cols="12">
                                <div class="section-wrapper">
                                    <h4 class="text-subtitle-1 font-weight-bold text-amber mb-3 section-title">
                                        <v-icon start size="small">mdi-shield-account</v-icon>
                                        Informasi Akun
                                    </h4>
                                    <v-row>
                                        <v-col cols="12" md="6">
                                            <v-text-field v-model="userData.cabang" label="Cabang"
                                                prepend-inner-icon="mdi-store" variant="outlined" color="amber"
                                                bg-color="grey-darken-4" class="profile-field" disabled></v-text-field>
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <v-text-field :value="userData.aktivasi === '1' ? 'Aktif' : 'Tidak Aktif'"
                                                label="Status Akun" prepend-inner-icon="mdi-check-circle"
                                                variant="outlined"
                                                :color="userData.aktivasi === '1' ? 'success' : 'error'"
                                                bg-color="grey-darken-4" class="profile-field" disabled></v-text-field>
                                        </v-col>

                                        <v-col cols="12">
                                            <v-card class="position-card" elevation="2">
                                                <div class="d-flex align-center pa-4">
                                                    <v-avatar size="56" color="amber" class="mr-4">
                                                        <v-icon size="32" color="white">mdi-briefcase</v-icon>
                                                    </v-avatar>
                                                    <div class="flex-grow-1">
                                                        <div class="text-caption text-grey">Jabatan</div>
                                                        <div class="text-h6 font-weight-medium mt-1 text-white">
                                                            {{ jabatanLabel }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </v-card>
                                        </v-col>
                                    </v-row>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000" location="top">
            {{ snackbar.text }}
            <template v-slot:actions>
                <v-btn variant="text" color="white" @click="snackbar.show = false">Tutup</v-btn>
            </template>
        </v-snackbar>

        <!-- Dialog Ganti Password -->
        <v-dialog v-model="dialogPassword" max-width="500">
            <v-card color="grey-darken-4">
                <v-card-title class="bg-grey-darken-3 text-amber">
                    <v-icon start>mdi-lock-reset</v-icon>
                    Ganti Password
                </v-card-title>

                <v-card-text class="pa-4">
                    <v-form ref="formPassword" v-model="formPasswordValid">
                        <v-text-field v-model="passwordForm.current_password" label="Password Lama" type="password"
                            prepend-inner-icon="mdi-lock" variant="outlined" color="amber" :rules="[rules.required]"
                            class="mb-2" />

                        <v-text-field v-model="passwordForm.password" label="Password Baru" type="password"
                            prepend-inner-icon="mdi-lock-plus" variant="outlined" color="amber"
                            :rules="[rules.required, rules.minPassword]" class="mb-2" />

                        <v-text-field v-model="passwordForm.password_confirmation" label="Konfirmasi Password Baru"
                            type="password" prepend-inner-icon="mdi-lock-check" variant="outlined" color="amber"
                            :rules="[rules.required, rules.matchPassword]" />
                    </v-form>
                </v-card-text>

                <v-card-actions class="pa-4">
                    <v-spacer></v-spacer>
                    <v-btn variant="text" color="grey" @click="closePasswordDialog">Batal</v-btn>
                    <v-btn color="amber" :loading="isChangePasswordLoading" @click="changePassword">
                        Ganti Password
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import axios from 'axios';
import Cookies from 'js-cookie';

export default {
    name: 'ProfilPage',

    data() {
        return {
            isLoading: true,
            dialogPassword: false,
            formPasswordValid: false,
            isChangePasswordLoading: false,

            userData: null,
            editedData: {},
            mvoTypes: [],

            passwordForm: {
                current_password: '',
                password: '',
                password_confirmation: ''
            },

            genderOptions: [
                { title: 'Laki-laki', value: 'L' },
                { title: 'Perempuan', value: 'P' }
            ],

            rules: {
                required: v => !!v || 'Field ini wajib diisi',
                minPassword: v => !v || v.length >= 3 || 'Password minimal 3 karakter',
                matchPassword: v => v === this.passwordForm.password || 'Konfirmasi password tidak sama'
            },

            snackbar: {
                show: false,
                text: '',
                color: 'success'
            }
        };
    },

    computed: {
        defaultProfileImage() {
            return 'https://ui-avatars.com/api/?name=' +
                encodeURIComponent(this.userData?.nama || 'User') +
                '&background=d4af37&color=000&size=400';
        },
        jabatanLabel() {
            if (!this.editedData.mvo_type_id || this.mvoTypes.length === 0) return '-';
            const found = this.mvoTypes.find(m => m.id === Number(this.editedData.mvo_type_id));
            return found ? found.jabatan : '-';
        }
    },

    methods: {
        async fetchMvoTypes() {
            try {
                const token = Cookies.get('token');
                const response = await axios.get('https://babaapi.babaparfume.id/api/mvo-type', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data?.status === 'success') {
                    this.mvoTypes = response.data.data;
                }
            } catch (error) { }
        },

        async changePassword() {
            const { valid } = await this.$refs.formPassword.validate();
            if (!valid) {
                this.showSnackbar('Mohon lengkapi semua field dengan benar', 'error');
                return;
            }

            this.isChangePasswordLoading = true;
            try {
                const token = Cookies.get('token');
                await axios.put(
                    'https://babaapi.babaparfume.id/api/me/password',
                    this.passwordForm,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                this.showSnackbar('Password berhasil diganti', 'success');
                this.closePasswordDialog();
            } catch (error) {
                this.showSnackbar(error.response?.data?.message || 'Gagal mengganti password', 'error');
            } finally {
                this.isChangePasswordLoading = false;
            }
        },

        closePasswordDialog() {
            this.passwordForm = { current_password: '', password: '', password_confirmation: '' };
            this.$refs.formPassword?.reset();
            this.$refs.formPassword?.resetValidation();
            this.dialogPassword = false;
        },

        async loadUserData() {
            this.isLoading = true;
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    this.userData = JSON.parse(storedUser);
                    this.editedData = { ...this.userData };
                } else {
                    await this.fetchUserDataFromAPI();
                }
            } catch (error) {
                this.showSnackbar('Gagal memuat data profil', 'error');
            } finally {
                this.isLoading = false;
            }
        },

        async fetchUserDataFromAPI() {
            try {
                const token = Cookies.get('token');
                if (!token) {
                    this.$router.push('/admin/login');
                    return;
                }

                const response = await axios.get('https://babaapi.babaparfume.id/api/user/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data?.status === 'success') {
                    this.userData = response.data.data;
                    this.editedData = { ...this.userData };
                    localStorage.setItem('user', JSON.stringify(this.userData));
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    this.$router.push('/admin/login');
                }
            }
        },

        getProfileImageUrl() {
            if (this.userData?.path_gambar_profile) {
                const path = this.userData.path_gambar_profile;
                if (path.startsWith('http://') || path.startsWith('https://')) return path;
                const cleanPath = path.startsWith('/') ? path.substring(1) : path;
                return `https://babaapi.babaparfume.id/project/public/${cleanPath}`;
            }
            return this.defaultProfileImage;
        },

        onImageError(event) {
            event.target.src = this.defaultProfileImage;
        },

        calculateAge() {
            if (!this.userData?.tgl_lahir) return '-';
            const birthDate = new Date(this.userData.tgl_lahir);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
            return age;
        },

        showSnackbar(text, color = 'success') {
            this.snackbar = { show: true, text, color };
        }
    },

    mounted() {
        this.loadUserData();
        this.fetchMvoTypes();
    }
};
</script>

<style scoped>
.position-card {
    background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
    border-left: 4px solid #ffc107;
    transition: transform 0.2s;
}

.position-card:hover {
    transform: translateX(4px);
}
</style>