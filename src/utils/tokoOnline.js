// Belanja / Pesanan Saya / Toko Saya — dilayani ERP BABA lewat backend aplikasi member (GET /api/toko/status).
// Selama aktif = false, menu tampil "Segera hadir" dan halamannya hanya keterangan (fitur lama tidak berubah).
import { reactive } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/config";

export const MENU_TOKO = ["/admin/belanja", "/admin/pesanan-saya", "/admin/toko-saya"];

// aktif: menu bisa dipakai; sambungan: { ok, pesan } (hanya superadmin)
export const tokoState = reactive({ aktif: false, sambungan: null, dimuat: false });

let berjalan = null;

export function muatToko(paksa = false) {
  const token = Cookies.get("token") || localStorage.getItem("token") || "";
  if (!token) return Promise.resolve();
  if (berjalan) return berjalan;
  if (tokoState.dimuat && !paksa) return Promise.resolve();
  berjalan = axios
    .get(`${API_URL}/api/toko/status`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } })
    .then((r) => {
      tokoState.aktif = r.data?.aktif === true;
      tokoState.sambungan = r.data?.sambungan || null;
      tokoState.dimuat = true;
    })
    .catch(() => { /* tetap "Segera hadir" */ })
    .finally(() => { berjalan = null; });
  return berjalan;
}

/** Menu toko yang belum bisa dipakai → label "Segera" di menu. */
export const segeraHadir = (url) => MENU_TOKO.includes(url) && !tokoState.aktif;
