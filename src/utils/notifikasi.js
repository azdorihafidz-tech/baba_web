// Lonceng notifikasi di header (backend GET /api/notifikasi, POST /api/notifikasi/baca).
// Notifikasi baru datang langsung lewat koneksi chat (event "notifikasi"); jumlah belum dibaca juga
// ikut diperbarui tiap kali angka menu dimuat (utils/tugasMenunggu.js), jadi tetap jalan tanpa server chat.
import { reactive } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/config";

export const notifState = reactive({ daftar: [], belumDibaca: 0, adaLagi: false, memuat: false, dimuat: false });

const api = () => axios.create({
  baseURL: `${API_URL}/api`,
  headers: { Authorization: `Bearer ${Cookies.get("token") || localStorage.getItem("token") || ""}`, Accept: "application/json" },
});

/** Muat halaman pertama (saat lonceng dibuka). */
export async function muatNotifikasi() {
  notifState.memuat = true;
  try {
    const { data } = await api().get("/notifikasi", { params: { limit: 20 } });
    notifState.daftar = data.data || [];
    notifState.adaLagi = !!data.ada_lagi;
    notifState.belumDibaca = Number(data.belum_dibaca) || 0;
    notifState.dimuat = true;
  } catch (e) {
    // dibiarkan: daftar lama tetap tampil
  } finally {
    notifState.memuat = false;
  }
}

/** Halaman berikutnya (lebih lama). */
export async function muatNotifikasiLama() {
  const akhir = notifState.daftar[notifState.daftar.length - 1];
  if (!akhir) return;
  notifState.memuat = true;
  try {
    const { data } = await api().get("/notifikasi", { params: { limit: 20, sebelum: akhir.id } });
    notifState.daftar = [...notifState.daftar, ...(data.data || [])];
    notifState.adaLagi = !!data.ada_lagi;
  } catch (e) {
    // dibiarkan
  } finally {
    notifState.memuat = false;
  }
}

/** Tandai dibaca: satu (id) atau semua (tanpa id). */
export async function tandaiDibaca(id = null) {
  const sekarang = new Date().toISOString();
  notifState.daftar = notifState.daftar.map((n) => (!id || n.id === id) && !n.dibaca_at ? { ...n, dibaca_at: sekarang } : n);
  try {
    const { data } = await api().post("/notifikasi/baca", id ? { id } : {});
    notifState.belumDibaca = Number(data.belum_dibaca) || 0;
  } catch (e) {
    notifState.belumDibaca = notifState.daftar.filter((n) => !n.dibaca_at).length;
  }
}

/** Notifikasi baru dari server chat. */
export function terimaNotifikasi(n) {
  if (!n?.id || notifState.daftar.some((x) => x.id === n.id)) return;
  // Waktu dari jam HP (notifikasi realtime baru saja dibuat), bukan dari server chat yang bisa beda zona
  notifState.daftar = [{ ...n, created_at: new Date().toISOString(), dibaca_at: null }, ...notifState.daftar];
  notifState.belumDibaca += 1;
}

export function resetNotifikasi() {
  Object.assign(notifState, { daftar: [], belumDibaca: 0, adaLagi: false, memuat: false, dimuat: false });
}

/** Ikon per jenis notifikasi (lihat NotifikasiService). */
export const IKON_NOTIFIKASI = {
  akun_daftar: "mdi-account-plus",
  akun_siap: "mdi-account-check",
  akun_aktif: "mdi-check-decagram",
  downline_baru: "mdi-account-multiple-plus",
  dokumen_menunggu: "mdi-file-document-alert",
  dokumen_final: "mdi-file-document-alert",
  dokumen_disetujui: "mdi-file-check",
  mutasi: "mdi-account-switch",
  mutasi_downline: "mdi-account-arrow-right",
  hak_akses: "mdi-shield-account",
  kemampuan: "mdi-shield-key",
};

/** "baru saja", "5 menit lalu", "3 jam lalu", "kemarin", lalu tanggal. */
export function waktuLalu(teks) {
  if (!teks) return "";
  const t = new Date(teks);
  const detik = (Date.now() - t.getTime()) / 1000;
  if (detik < 60) return "baru saja";
  if (detik < 3600) return `${Math.floor(detik / 60)} menit lalu`;
  if (detik < 86400) return `${Math.floor(detik / 3600)} jam lalu`;
  if (detik < 172800) return "kemarin";
  return t.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
