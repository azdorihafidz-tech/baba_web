// Angka merah di menu: pekerjaan yang menunggu tindakan akun login (backend GET /api/notifikasi/tugas).
// { "/admin/mvobelumapprove": 3, ... } — hanya yang giliran akun ini (lihat TugasMenungguService).
import { reactive } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/config";
import { notifState } from "@/utils/notifikasi";

export const tugasState = reactive({ jumlah: {} });

let berjalan = null;
let terakhir = 0;

/** Muat ulang jumlah; panggilan beruntun dalam 3 detik digabung (kecuali paksa). */
export function muatTugas(paksa = false) {
  const token = Cookies.get("token") || localStorage.getItem("token") || "";
  if (!token) {
    tugasState.jumlah = {};
    return Promise.resolve();
  }
  if (berjalan) return berjalan;
  if (!paksa && Date.now() - terakhir < 3000) return Promise.resolve();
  berjalan = axios
    .get(`${API_URL}/api/notifikasi/tugas`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } })
    .then((r) => {
      tugasState.jumlah = r.data?.data || {};
      if (r.data?.belum_dibaca !== undefined) notifState.belumDibaca = Number(r.data.belum_dibaca) || 0;
    })
    .catch(() => { /* angka tetap yang lama */ })
    .finally(() => { berjalan = null; terakhir = Date.now(); });
  return berjalan;
}

/** Keterangan lencana per menu (tooltip). */
export const KETERANGAN_TUGAS = {
  "/admin/mvobelumapprove": "pendaftar menunggu approve Anda",
  "/admin/user": "akun siap diverifikasi",
  "/admin/documentbelumapprove": "dokumen menunggu approve Anda",
  "/admin/mutasi": "kursi kosong menunggu pengganti",
};
