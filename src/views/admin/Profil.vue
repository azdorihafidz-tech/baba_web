<template>
    <v-container fluid class="pa-4">
        <!-- Header Section -->
        <!-- <v-row>
            <v-col cols="12">
                <v-card class="mb-4" color="grey-darken-4" elevation="8">
                    <v-card-title class="d-flex align-center justify-space-between pa-4">
                        <div class="d-flex align-center">
                            <v-icon size="32" color="amber" class="mr-3">mdi-account-circle</v-icon>
                            <div>
                                <h2 class="text-h5 font-weight-bold text-amber">Profil Saya</h2>
                                <p class="text-caption text-grey-lighten-1 mb-0">Kelola informasi profil Anda</p>
                            </div>
                        </div>
                        <v-chip color="amber" variant="flat" class="text-black font-weight-bold">
                            {{ userData?.class_member?.toUpperCase() || 'MEMBER' }}
                        </v-chip>
                    </v-card-title>
                </v-card>
            </v-col>
        </v-row> -->

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
                        <!-- Avatar dengan Upload Button -->
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

                            <!-- Upload Button Overlay -->
                            <!-- COMMENTED: Upload button untuk ganti foto profil -->
                            <!-- <v-btn
                                icon
                                size="small"
                                color="amber"
                                class="position-absolute"
                                style="bottom: 0; right: 0;"
                                @click="triggerFileInput"
                                :loading="isUploadingImage"
                            >
                                <v-icon>mdi-camera</v-icon>
                            </v-btn> -->

                            <!-- Hidden File Input -->
                            <!-- COMMENTED: Input file untuk upload gambar -->
                            <!-- <input ref="fileInput" type="file" accept="image/*" style="display: none;"
                                @change="handleImageUpload" /> -->
                        </div>

                        <!-- User Info -->
                        <h3 class="text-h5 font-weight-bold text-white mb-2">
                            {{ userData?.nama || 'Nama Tidak Tersedia' }}
                        </h3>
                        <p class="text-body-2 text-grey-lighten-1 mb-1">
                            @{{ userData?.username || 'username' }}
                        </p>
                        <v-chip size="small" color="amber" variant="tonal" class="mt-2">
                            <v-icon start size="small">mdi-briefcase</v-icon>
                            {{ userData?.otoritas?.toUpperCase() || 'USER' }}
                        </v-chip>
                        <v-chip size="small" color="amber" variant="tonal" class="mt-2">
                            {{ userData?.class_member?.toUpperCase() || 'MEMBER' }}
                        </v-chip>

                        <v-divider class="my-4 border-opacity-25"></v-divider>

                        <!-- Quick Stats -->
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
                    <!-- Header -->
                    <v-card-title
                        class="profile-header d-flex align-center justify-space-between pa-4 bg-grey-darken-3">
                        <div class="d-flex align-center">
                            <v-icon icon="mdi-account-circle" color="amber" size="28" class="mr-3"></v-icon>
                            <span class="text-h5 font-weight-bold text-amber">Informasi Detail Profil</span>
                        </div>
                        <v-chip variant="flat" color="green" text-color="grey-darken-4" class="status-chip">
                            <v-icon icon="mdi-check-circle" size="16" class="mr-1"></v-icon>
                            {{ userData.aktivasi === '1' ? 'Aktif' : 'Tidak Aktif' }}
                        </v-chip>
                    </v-card-title>

                    <v-card-text class="pa-6">
                        <v-form ref="profileForm" v-model="formValid">
                            <v-row>
                                <!-- Informasi Pribadi Section -->
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
                                                    readonly :rules="[rules.required]" bg-color="grey-darken-4"
                                                    class="profile-field" disabled></v-text-field>
                                            </v-col>

                                            <v-col cols="12" md="6">
                                                <v-text-field v-model="editedData.nama_panggilan" label="Nama Panggilan"
                                                    prepend-inner-icon="mdi-account-heart" variant="outlined"
                                                    color="amber" readonly bg-color="grey-darken-4"
                                                    class="profile-field" disabled></v-text-field>
                                            </v-col>

                                            <v-col cols="12" md="6">
                                                <v-text-field v-model="editedData.no_id" label="NIK / No. Identitas"
                                                    prepend-inner-icon="mdi-card-account-details" variant="outlined"
                                                    color="amber" readonly :rules="[rules.required, rules.nik]"
                                                    bg-color="grey-darken-4" class="profile-field"
                                                    disabled></v-text-field>
                                            </v-col>

                                            <v-col cols="12" md="6">
                                                <v-select v-model="editedData.jenis_kelamin" label="Jenis Kelamin"
                                                    prepend-inner-icon="mdi-gender-male-female" :items="genderOptions"
                                                    variant="outlined" color="amber" readonly :rules="[rules.required]"
                                                    bg-color="grey-darken-4" class="profile-field" disabled></v-select>
                                            </v-col>

                                            <v-col cols="12" md="6">
                                                <v-text-field v-model="editedData.tempat_lahir" label="Tempat Lahir"
                                                    prepend-inner-icon="mdi-map-marker" variant="outlined" color="amber"
                                                    readonly bg-color="grey-darken-4" class="profile-field"
                                                    disabled></v-text-field>
                                            </v-col>

                                            <v-col cols="12" md="6">
                                                <v-text-field v-model="editedData.tgl_lahir" label="Tanggal Lahir"
                                                    prepend-inner-icon="mdi-calendar" type="date" variant="outlined"
                                                    color="amber" readonly bg-color="grey-darken-4"
                                                    class="profile-field" disabled></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </div>
                                </v-col>

                                <!-- Informasi Kontak Section -->
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
                                                    readonly :rules="[rules.required, rules.phone]"
                                                    bg-color="grey-darken-4" class="profile-field"
                                                    disabled></v-text-field>
                                            </v-col>

                                            <v-col cols="12" md="6">
                                                <v-text-field v-model="userData.username" label="Username"
                                                    prepend-inner-icon="mdi-at" variant="outlined" color="amber"
                                                    readonly bg-color="grey-darken-4" hint="Username tidak dapat diubah"
                                                    persistent-hint class="profile-field" disabled></v-text-field>
                                            </v-col>

                                            <v-col cols="12">
                                                <v-textarea v-model="editedData.alamat" label="Alamat Lengkap"
                                                    prepend-inner-icon="mdi-home-map-marker" variant="outlined"
                                                    color="amber" readonly rows="3" bg-color="grey-darken-4"
                                                    class="profile-field" disabled></v-textarea>
                                            </v-col>
                                        </v-row>
                                    </div>
                                </v-col>

                                <!-- Informasi Akun Section -->
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
                                                    readonly bg-color="grey-darken-4" class="profile-field"
                                                    disabled></v-text-field>
                                            </v-col>

                                            <v-col cols="12" md="6">
                                                <v-text-field v-model="userData.class_member" label="Kelas Member"
                                                    prepend-inner-icon="mdi-star" variant="outlined" color="amber"
                                                    readonly bg-color="grey-darken-4" class="profile-field"
                                                    disabled></v-text-field>
                                            </v-col>

                                            <v-col cols="12" md="6">
                                                <v-text-field v-model="userData.otoritas" label="Otoritas / Role"
                                                    prepend-inner-icon="mdi-shield-key" variant="outlined" color="amber"
                                                    readonly bg-color="grey-darken-4" class="profile-field"
                                                    disabled></v-text-field>
                                            </v-col>

                                            <v-col cols="12" md="6">
                                                <v-text-field
                                                    :value="userData.aktivasi === '1' ? 'Aktif' : 'Tidak Aktif'"
                                                    label="Status Akun" prepend-inner-icon="mdi-check-circle"
                                                    variant="outlined"
                                                    :color="userData.aktivasi === '1' ? 'success' : 'error'" readonly
                                                    bg-color="grey-darken-4" class="profile-field"
                                                    disabled></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>

        </v-row>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000" location="top">
            {{ snackbar.text }}
            <template v-slot:actions>
                <v-btn variant="text" color="white" @click="snackbar.show = false">
                    Tutup
                </v-btn>
            </template>
        </v-snackbar>
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
            // COMMENTED: Data untuk edit mode (bisa diaktifkan kembali kapan saja)
            // isEditMode: false,
            // isUpdating: false,
            // isChangingPassword: false,
            // isUploadingImage: false,
            // formValid: false,
            // passwordFormValid: false,
            userData: null,
            editedData: {},
            // COMMENTED: Data untuk change password (bisa diaktifkan kembali kapan saja)
            // passwordData: {
            //     current_password: '',
            //     new_password: '',
            //     confirm_password: ''
            // },
            // showCurrentPassword: false,
            // showNewPassword: false,
            // showConfirmPassword: false,
            genderOptions: [
                { title: 'Laki-laki', value: 'L' },
                { title: 'Perempuan', value: 'P' }
            ],
            rules: {
                required: v => !!v || 'Field ini wajib diisi',
                nik: v => !v || v.length >= 10 || 'NIK minimal 10 karakter',
                phone: v => !v || /^[0-9+\-() ]+$/.test(v) || 'Format nomor telepon tidak valid',
                // COMMENTED: Rules untuk password
                // minLength: v => !v || v.length >= 6 || 'Password minimal 6 karakter',
                // passwordMatch: v => v === this.passwordData.new_password || 'Password tidak cocok'
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
        }
    },

    methods: {
        async loadUserData() {
            this.isLoading = true;

            try {
                const storedUser = localStorage.getItem('user');

                if (storedUser) {
                    this.userData = JSON.parse(storedUser);
                    this.editedData = { ...this.userData };
                    console.log('User data loaded:', this.userData);
                } else {
                    await this.fetchUserDataFromAPI();
                }
            } catch (error) {
                console.error('Error loading user data:', error);
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
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data && response.data.status === 'success') {
                    this.userData = response.data.data;
                    this.editedData = { ...this.userData };
                    localStorage.setItem('user', JSON.stringify(this.userData));
                }
            } catch (error) {
                console.error('Error fetching user data from API:', error);

                if (error.response?.status === 401) {
                    this.$router.push('/admin/login');
                }
            }
        },

        getProfileImageUrl() {
            if (this.userData?.path_gambar_profile) {
                const path = this.userData.path_gambar_profile;

                if (path.startsWith('http://') || path.startsWith('https://')) {
                    return path;
                }

                const cleanPath = path.startsWith('/') ? path.substring(1) : path;
                return `https://babaapi.babaparfume.id/project/public/${cleanPath}`;
            }

            return this.defaultProfileImage;
        },

        onImageError(event) {
            console.warn('Profile image failed to load, using default');
            event.target.src = this.defaultProfileImage;
        },

        calculateAge() {
            if (!this.userData?.tgl_lahir) return '-';

            const birthDate = new Date(this.userData.tgl_lahir);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            return age;
        },

        // ==================== FUNGSI EDIT MODE ====================
        // Uncomment fungsi-fungsi di bawah untuk mengaktifkan fitur edit

        // toggleEditMode() {
        //     this.isEditMode = !this.isEditMode;
        //     if (!this.isEditMode) {
        //         this.editedData = { ...this.userData };
        //     }
        // },

        // cancelEdit() {
        //     this.isEditMode = false;
        //     this.editedData = { ...this.userData };
        // },

        // async saveProfile() {
        //     if (!this.$refs.profileForm.validate()) {
        //         this.showSnackbar('Mohon lengkapi semua field yang wajib diisi', 'error');
        //         return;
        //     }

        //     this.isUpdating = true;

        //     try {
        //         const token = Cookies.get('token');

        //         const response = await axios.put(
        //             'https://babaapi.babaparfume.id/api/user/profile',
        //             this.editedData,
        //             {
        //                 headers: {
        //                     'Authorization': `Bearer ${token}`,
        //                     'Content-Type': 'application/json'
        //                 }
        //             }
        //         );

        //         if (response.data && response.data.status === 'success') {
        //             this.userData = { ...this.editedData };
        //             localStorage.setItem('user', JSON.stringify(this.userData));
        //             this.isEditMode = false;
        //             this.showSnackbar('Profil berhasil diperbarui', 'success');
        //         }
        //     } catch (error) {
        //         console.error('Error updating profile:', error);

        //         let errorMessage = 'Gagal memperbarui profil';

        //         if (error.response?.data?.message) {
        //             errorMessage = error.response.data.message;
        //         }

        //         this.showSnackbar(errorMessage, 'error');
        //     } finally {
        //         this.isUpdating = false;
        //     }
        // },

        // ==================== FUNGSI CHANGE PASSWORD ====================
        // Uncomment fungsi di bawah untuk mengaktifkan fitur ganti password

        // async changePassword() {
        //     if (!this.$refs.passwordForm.validate()) {
        //         this.showSnackbar('Mohon lengkapi semua field password', 'error');
        //         return;
        //     }

        //     this.isChangingPassword = true;

        //     try {
        //         const token = Cookies.get('token');

        //         const response = await axios.post(
        //             'https://babaapi.babaparfume.id/api/user/change-password',
        //             {
        //                 current_password: this.passwordData.current_password,
        //                 new_password: this.passwordData.new_password,
        //                 new_password_confirmation: this.passwordData.confirm_password
        //             },
        //             {
        //                 headers: {
        //                     'Authorization': `Bearer ${token}`,
        //                     'Content-Type': 'application/json'
        //                 }
        //             }
        //         );

        //         if (response.data && response.data.status === 'success') {
        //             this.passwordData = {
        //                 current_password: '',
        //                 new_password: '',
        //                 confirm_password: ''
        //             };
        //             this.$refs.passwordForm.reset();
        //             this.showSnackbar('Password berhasil diubah', 'success');
        //         }
        //     } catch (error) {
        //         console.error('Error changing password:', error);

        //         let errorMessage = 'Gagal mengubah password';

        //         if (error.response?.data?.message) {
        //             errorMessage = error.response.data.message;
        //         } else if (error.response?.status === 401) {
        //             errorMessage = 'Password lama tidak sesuai';
        //         }

        //         this.showSnackbar(errorMessage, 'error');
        //     } finally {
        //         this.isChangingPassword = false;
        //     }
        // },

        // ==================== FUNGSI UPLOAD IMAGE ====================
        // Uncomment fungsi-fungsi di bawah untuk mengaktifkan fitur upload foto

        // triggerFileInput() {
        //     this.$refs.fileInput.click();
        // },

        // async handleImageUpload(event) {
        //     const file = event.target.files[0];

        //     if (!file) return;

        //     if (!file.type.startsWith('image/')) {
        //         this.showSnackbar('File harus berupa gambar', 'error');
        //         return;
        //     }

        //     if (file.size > 5 * 1024 * 1024) {
        //         this.showSnackbar('Ukuran file maksimal 5MB', 'error');
        //         return;
        //     }

        //     this.isUploadingImage = true;

        //     try {
        //         const token = Cookies.get('token');
        //         const formData = new FormData();
        //         formData.append('profile_image', file);

        //         const response = await axios.post(
        //             'https://babaapi.babaparfume.id/api/user/upload-profile-image',
        //             formData,
        //             {
        //                 headers: {
        //                     'Authorization': `Bearer ${token}`,
        //                     'Content-Type': 'multipart/form-data'
        //                 }
        //             }
        //         );

        //         if (response.data && response.data.status === 'success') {
        //             this.userData.path_gambar_profile = response.data.data.path_gambar_profile;
        //             localStorage.setItem('user', JSON.stringify(this.userData));
        //             this.showSnackbar('Foto profil berhasil diperbarui', 'success');
        //         }
        //     } catch (error) {
        //         console.error('Error uploading image:', error);

        //         let errorMessage = 'Gagal mengupload foto profil';

        //         if (error.response?.data?.message) {
        //             errorMessage = error.response.data.message;
        //         }

        //         this.showSnackbar(errorMessage, 'error');
        //     } finally {
        //         this.isUploadingImage = false;
        //         event.target.value = '';
        //     }
        // },

        showSnackbar(text, color = 'success') {
            this.snackbar.text = text;
            this.snackbar.color = color;
            this.snackbar.show = true;
        }
    },

    mounted() {
        console.log('Profil page mounted');
        this.loadUserData();
    }
};
</script>