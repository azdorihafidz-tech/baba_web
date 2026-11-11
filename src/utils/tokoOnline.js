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

// ===== Pemanggil /api/toko/* (diteruskan backend ke ERP atas nama akun login) =====

function tokenSaya() {
  return Cookies.get("token") || localStorage.getItem("token") || "";
}

/** Galat → pesan untuk layar (pesan dari ERP/backend bila ada). */
export function pesanGalat(e, cadangan = "Terjadi kesalahan. Coba lagi.") {
  const d = e?.response?.data;
  if (d?.pesan) return d.pesan;
  if (d?.errors) return Object.values(d.errors).flat()[0] || cadangan;
  if (d?.message && e?.response?.status === 422) return d.message;
  if (!e?.response) return "Tidak ada sambungan internet / server.";
  return cadangan;
}

export function tokoApi(method, path, data = undefined, params = undefined) {
  const multipart = data instanceof FormData;
  return axios({
    method,
    url: `${API_URL}/api/toko${path}`,
    data,
    params,
    timeout: multipart ? 60000 : 20000,
    headers: { Authorization: `Bearer ${tokenSaya()}`, Accept: "application/json" },
  }).then((r) => r.data);
}

export const rupiah = (n) => (n === null || n === undefined ? "—" : "Rp " + Math.round(Number(n)).toLocaleString("id-ID"));

// ===== Keranjang (disimpan di HP/browser per akun; harga selalu dibaca ulang dari katalog) =====

let sumberKeranjang = "gudang";

function kunciKeranjang() {
  let id = "";
  try { id = JSON.parse(localStorage.getItem("user") || "{}")?.id || ""; } catch { /* abaikan */ }
  return sumberKeranjang === "upline" ? `keranjang_${id}_upline` : `keranjang_${id}`;
}

function bacaKeranjang() {
  try {
    const isi = JSON.parse(localStorage.getItem(kunciKeranjang()) || "[]");
    return Array.isArray(isi) ? isi.filter((x) => x && Number(x.id) > 0 && Number(x.qty) > 0).map((x) => ({ id: Number(x.id), qty: Math.floor(Number(x.qty)) })) : [];
  } catch {
    return [];
  }
}

export const keranjang = reactive({ isi: bacaKeranjang() });

function simpanKeranjang() {
  try { localStorage.setItem(kunciKeranjang(), JSON.stringify(keranjang.isi)); } catch { /* penyimpanan penuh / diblokir */ }
}

export function muatUlangKeranjang() {
  keranjang.isi = bacaKeranjang();
}

/** Keranjang terpisah per sumber barang (gudang / upline). */
export function pakaiKeranjang(sumber) {
  sumberKeranjang = sumber === "upline" ? "upline" : "gudang";
  muatUlangKeranjang();
}

export function jumlahDiKeranjang(id) {
  return keranjang.isi.find((x) => x.id === id)?.qty || 0;
}

/** qty = jumlah akhir (0 = hapus). maks = stok tersedia. */
export function aturKeranjang(id, qty, maks = 999) {
  const n = Math.max(0, Math.min(Math.floor(Number(qty) || 0), maks, 999));
  const ada = keranjang.isi.find((x) => x.id === id);
  if (n === 0) keranjang.isi = keranjang.isi.filter((x) => x.id !== id);
  else if (ada) ada.qty = n;
  else keranjang.isi.push({ id, qty: n });
  simpanKeranjang();
}

export function kosongkanKeranjang() {
  keranjang.isi = [];
  simpanKeranjang();
}
