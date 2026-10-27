// Hak akses tambahan akun login (menu Hak Akses; backend GET /api/hak-akses/saya).
// Superadmin: semua hak. Akun lain: hanya hak yang diberikan, mis. Mutasi untuk gerbong Founder tertentu.
import { reactive } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/config";

// daftar: hak tambahan (Mutasi …); kemampuan: kemampuan yang bisa diubah superadmin, mis. { dokumen_kelola: true }
export const hakState = reactive({ daftar: [], kemampuan: {} });

let janji = null;
let tokenDimuat = null;

/** Muat hak sekali per token login (ganti akun = muat ulang). */
export function muatHak() {
  const token = Cookies.get("token") || localStorage.getItem("token") || "";
  if (!token) return Promise.resolve([]);
  if (janji && tokenDimuat === token) return janji;
  tokenDimuat = token;
  janji = axios
    .get(`${API_URL}/api/hak-akses/saya`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } })
    .then((r) => { hakState.daftar = r.data?.data || []; hakState.kemampuan = r.data?.kemampuan || {}; return hakState.daftar; })
    .catch(() => { janji = null; hakState.daftar = []; hakState.kemampuan = {}; return []; });
  return janji;
}

export const punyaHak = (kode) => hakState.daftar.some((h) => h.hak === kode);

/** Menu yang terbuka karena hak tambahan (nama menu di Sidebar → kode hak). */
export const MENU_HAK = { "Mutasi Jabatan": "mutasi" };
