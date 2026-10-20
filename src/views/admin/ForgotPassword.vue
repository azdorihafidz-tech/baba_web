<template>
  <v-container fluid class="login-container">
    <v-row justify="center" align="center" class="fullscreen-row">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card class="pa-8 bg-grey-darken-4" elevation="24" rounded="xl" border="1px solid amber">
          <div class="text-center mb-4">
            <v-avatar size="72" class="mb-3 border-2 border-amber">
              <v-img src="@/assets/newlogo.jpg" alt="Logo BABA PARFUM" />
            </v-avatar>
            <h2 class="text-h5 font-weight-bold text-amber mb-1" style="letter-spacing: 2px;">LUPA PASSWORD</h2>
            <p class="text-grey-lighten-1 text-body-2">
              Masukkan username atau nomor WhatsApp Anda. Kami akan mengirim link reset password ke WhatsApp.
            </p>
          </div>

          <v-form @submit.prevent="submit">
            <v-text-field v-model="identifier" label="Username atau No. WhatsApp" prepend-inner-icon="mdi-account"
              variant="outlined" class="mb-3" color="amber" base-color="grey-lighten-1" />

            <v-btn type="submit" :loading="isLoading" class="mb-3 text-black font-weight-bold" size="large" block
              rounded="lg" color="amber" style="letter-spacing: 1px;">
              <v-icon start>mdi-whatsapp</v-icon>
              KIRIM LINK RESET
            </v-btn>
          </v-form>

          <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-3" density="comfortable">
            {{ successMessage }}
          </v-alert>

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const API_BASE = 'https://babaapi.babaparfume.id/api'
const router = useRouter()

const identifier = ref('')
const isLoading = ref(false)
const successMessage = ref('')
const snackbar = ref({ show: false, text: '', color: 'success' })

const showSnackbar = (text, color = 'success') => {
  snackbar.value = { show: true, text, color }
}

const submit = async () => {
  if (!identifier.value.trim()) {
    showSnackbar('Mohon isi username atau nomor WhatsApp', 'error')
    return
  }

  isLoading.value = true
  successMessage.value = ''
  try {
    const response = await axios.post(`${API_BASE}/forgot-password`, {
      identifier: identifier.value.trim(),
    })
    if (response.data.status === 'success') {
      successMessage.value = response.data.message
      showSnackbar(response.data.message, 'success')
    } else {
      showSnackbar(response.data.message || 'Gagal mengirim link', 'error')
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
