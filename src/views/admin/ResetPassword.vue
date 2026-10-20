<template>
  <v-container fluid class="login-container">
    <v-row justify="center" align="center" class="fullscreen-row">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card class="pa-8 bg-grey-darken-4" elevation="24" rounded="xl" border="1px solid amber">
          <div class="text-center mb-4">
            <v-avatar size="72" class="mb-3 border-2 border-amber">
              <v-img src="@/assets/newlogo.jpg" alt="Logo BABA PARFUM" />
            </v-avatar>
            <h2 class="text-h5 font-weight-bold text-amber mb-1" style="letter-spacing: 2px;">RESET PASSWORD</h2>
            <p class="text-grey-lighten-1 text-body-2">Buat password baru untuk akun Anda.</p>
          </div>

          <!-- Memeriksa token -->
          <div v-if="verifying" class="text-center py-6">
            <v-progress-circular indeterminate color="amber" size="48" />
            <p class="text-grey-lighten-1 mt-3">Memeriksa link...</p>
          </div>

          <!-- Token tidak valid -->
          <v-alert v-else-if="!tokenValid" type="error" variant="tonal" class="mb-3">
            {{ invalidMessage }}
          </v-alert>

          <!-- Form reset -->
          <v-form v-else @submit.prevent="submit">
            <v-text-field v-model="password" :type="visible ? 'text' : 'password'" label="Password Baru"
              prepend-inner-icon="mdi-lock" :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="visible = !visible" variant="outlined" class="mb-3" color="amber"
              base-color="grey-lighten-1" />

            <v-text-field v-model="passwordConfirmation" :type="visible ? 'text' : 'password'"
              label="Konfirmasi Password Baru" prepend-inner-icon="mdi-lock-check" variant="outlined" class="mb-3"
              color="amber" base-color="grey-lighten-1" />

            <v-btn type="submit" :loading="isLoading" class="mb-3 text-black font-weight-bold" size="large" block
              rounded="lg" color="amber" style="letter-spacing: 1px;">
              <v-icon start>mdi-content-save</v-icon>
              SIMPAN PASSWORD BARU
            </v-btn>
          </v-form>

          <v-divider class="my-4 border-opacity-25" />

          <div class="text-center">
            <v-btn variant="text" color="amber" @click="goToLogin">
              <v-icon start>mdi-arrow-left</v-icon>
              Kembali ke Login
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="5000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" color="white" @click="snackbar.show = false">Tutup</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const API_BASE = 'https://babaapi.babaparfume.id/api'
const route = useRoute()
const router = useRouter()

const token = ref('')
const verifying = ref(true)
const tokenValid = ref(false)
const invalidMessage = ref('Link reset tidak valid atau sudah kedaluwarsa. Silakan minta link baru.')

const password = ref('')
const passwordConfirmation = ref('')
const visible = ref(false)
const isLoading = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })

const showSnackbar = (text, color = 'success') => {
  snackbar.value = { show: true, text, color }
}

const verifyToken = async () => {
  token.value = route.query.token || ''
  if (!token.value) {
    verifying.value = false
    tokenValid.value = false
    invalidMessage.value = 'Token tidak ditemukan pada link.'
    return
  }
  try {
    const response = await axios.get(`${API_BASE}/reset-password/verify`, {
      params: { token: token.value },
    })
    tokenValid.value = response.data.status === 'success'
    if (!tokenValid.value) invalidMessage.value = response.data.message
  } catch (error) {
    tokenValid.value = false
    invalidMessage.value = error.response?.data?.message || 'Link reset tidak valid atau sudah kedaluwarsa.'
  } finally {
    verifying.value = false
  }
}

const submit = async () => {
  if (!password.value || !passwordConfirmation.value) {
    showSnackbar('Mohon isi password baru dan konfirmasinya', 'error')
    return
  }
  if (password.value.length < 6) {
    showSnackbar('Password minimal 6 karakter', 'error')
    return
  }
  if (password.value !== passwordConfirmation.value) {
    showSnackbar('Konfirmasi password tidak cocok', 'error')
    return
  }

  isLoading.value = true
  try {
    const response = await axios.post(`${API_BASE}/reset-password`, {
      token: token.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    if (response.data.status === 'success') {
      showSnackbar(response.data.message, 'success')
      setTimeout(() => router.push({ name: 'Login' }), 1500)
    } else {
      showSnackbar(response.data.message || 'Gagal reset password', 'error')
    }
  } catch (error) {
    showSnackbar(error.response?.data?.message || 'Terjadi kesalahan. Coba lagi nanti.', 'error')
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  router.push({ name: 'Login' })
}

onMounted(verifyToken)
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
</style>
