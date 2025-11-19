<template>
  <Breadcrumb :items="itemsBreadcrumb" />

  <v-btn :color="app.colors.secondary" @click="showDialogFormAddCabang()" class="text-white">
    <v-icon start>mdi-pen-plus</v-icon>
    <span class="ml-2">Tambah Cabang</span>
  </v-btn>


  <!-- Form Dialog -->
  <v-dialog v-model="isShowDialog" persistent width="500">
    <CardForm :title="modeformmodal" center>
      <template v-slot:content>
        <v-text-field label="Kode Cabang" v-model="model.kodecabang" class="mb-2 mt-4" />
        <v-text-field label="Nama Cabang" v-model="model.namacabang" class="mb-2" />
      </template>
      <template v-slot:actions>
        <v-btn :color="app.colors.primary" @click="modeAction === 'Simpan' ? addCabang() : updateCabang()"
          :loading="isButtonLoading" class="ml-2">
          {{ modeAction }}
        </v-btn>
        <v-btn :color="app.colors.secondary" @click="isShowDialog = false" class="ml-2">
          Batal
        </v-btn>
      </template>
    </CardForm>
  </v-dialog>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="isShowDialogDelete" max-width="500px">
    <v-card :color="this.app.colors.background">
      <v-card-title class="text-h5">Apakah anda yakin ingin menghapus data?</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="app.colors.primary" @click="isShowDialogDelete = false">
          Cancel
        </v-btn>
        <v-btn :color="app.colors.secondary" @click="confirmDeleteCabang(model.id)" :loading="isButtonLoading">
          OK
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Snackbar -->
  <v-snackbar v-model="contentSnackbar.snackbar" :color="contentSnackbar.color">
    {{ contentSnackbar.text }}
  </v-snackbar>
</template>

<script>
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import CardDataTable from "@/components/ui/CardDataTable.vue";
import CardForm from "@/components/ui/CardForm.vue";
import { useAppStore } from "@/stores/app.js";
import axios from "axios";
import Cookies from "js-cookie";

export default {
  components: {
    Breadcrumb,
    CardDataTable,
    CardForm,
  },

  setup() {
    const app = useAppStore();
    return { app };
  },

  data() {
    return {
      contentSnackbar: {
        snackbar: false,
        text: "",
        color: "",
      },
      title: "CABANG",
      modeformmodal: "TAMBAH DATA CABANG",
      itemsBreadcrumb: [
        { title: "Dashboard", disabled: false, href: "/admin/dashboard" },
        { title: "Cabang", disabled: false, href: "/admin/Cabang" },
      ],
      isShowDialog: false,
      isButtonLoading: false,
      isShowDialogDelete: false,
      isTableLoading: true,
      modeAction: "",
      datatable: {
        search: "",
        headers: [
          { key: "kodecabang", title: "Kode Cabang" },
          { key: "namacabang", title: "Nama Cabang" },
          { key: "action", title: "Actions", sortable: false },
        ],
        items: [],
      },
      model: {
        id: "",
        kodecabang: "",
        namacabang: "",
      },
    };
  },

  methods: {
    showDialogFormAddCabang() {
      this.isShowDialog = true;
      this.modeAction = "Simpan";
      this.modeformmodal = "TAMBAH DATA CABANG";
      this.clearForm();
    },

    clearForm() {
      this.model = {
        id: "",
        kodecabang: "",
        namacabang: "",
      };
    },

    getAllCabang() {
      const token = Cookies.get("token");
      if (!token) return this.$router.push({ name: "Login" });

      this.isTableLoading = true;
      axios
        .get("https://api-rab.teknosof.com/api/cabang", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          this.datatable.items = res.data.data;
        })
        .catch((err) => {
          this.contentSnackbar = {
            snackbar: true,
            text: err.response?.data?.message || "Gagal mengambil data",
            color: this.app.colors.secondary,
          };
        })
        .finally(() => {
          this.isTableLoading = false;
        });
    },

    addCabang() {
      const token = Cookies.get("token");
      if (!token) return this.$router.push({ name: "Login" });

      this.isButtonLoading = true;
      axios
        .post("https://api-rab.teknosof.com/api/cabang", this.model, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((res) => {
          this.getAllCabang();
          this.isShowDialog = false;
          this.contentSnackbar = {
            snackbar: true,
            text: res.data.message,
            color: this.app.colors.primary,
          };
        })
        .catch((err) => {
          this.contentSnackbar = {
            snackbar: true,
            text: err.response?.data?.message || "Gagal menambah data",
            color: this.app.colors.secondary,
          };
        })
        .finally(() => {
          this.isButtonLoading = false;
        });
    },

    editCabang(id) {
      const token = Cookies.get("token");
      if (!token) return this.$router.push({ name: "Login" });

      this.isShowDialog = true;
      this.modeAction = "Update";
      this.modeformmodal = "EDIT DATA CABANG";
      this.isButtonLoading = true;

      axios
        .get(`https://api-rab.teknosof.com/api/cabang/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          this.model = res.data.data;
        })
        .catch((err) => {
          this.contentSnackbar = {
            snackbar: true,
            text: err.response?.data?.message || "Gagal mengambil data",
            color: this.app.colors.secondary,
          };
        })
        .finally(() => {
          this.isButtonLoading = false;
        });
    },

    updateCabang() {
      const token = Cookies.get("token");
      if (!token) return this.$router.push({ name: "Login" });

      this.isButtonLoading = true;
      axios
        .put(`https://api-rab.teknosof.com/api/cabang/${this.model.id}`, this.model, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((res) => {
          this.getAllCabang();
          this.isShowDialog = false;
          this.contentSnackbar = {
            snackbar: true,
            text: res.data.message,
            color: this.app.colors.primary,
          };
        })
        .catch((err) => {
          this.contentSnackbar = {
            snackbar: true,
            text: err.response?.data?.message || "Gagal mengupdate data",
            color: this.app.colors.secondary,
          };
        })
        .finally(() => {
          this.isButtonLoading = false;
        });
    },

    deleteCabang(id) {
      this.model.id = id;
      this.isShowDialogDelete = true;
    },

    confirmDeleteCabang(id) {
      const token = Cookies.get("token");
      if (!token) return this.$router.push({ name: "Login" });

      this.isButtonLoading = true;
      axios
        .delete(`https://api-rab.teknosof.com/api/cabang/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((res) => {
          this.getAllCabang();
          this.contentSnackbar = {
            snackbar: true,
            text: res.data.message,
            color: this.app.colors.primary,
          };
        })
        .catch((err) => {
          this.contentSnackbar = {
            snackbar: true,
            text: err.response?.data?.message || "Gagal menghapus data",
            color: this.app.colors.secondary,
          };
        })
        .finally(() => {
          this.isButtonLoading = false;
          this.isShowDialogDelete = false;
        });
    },
  },

  created() {
    this.getAllCabang();
  },
};
</script>
