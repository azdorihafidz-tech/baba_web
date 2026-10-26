// Owner = puncak struktur di atas Top Management (satu orang, No ID OW01; backend: OwnerService).
// Akun aktif tanpa upline (TM, MVO yang belum di bawah TM) berarti langsung di bawah Owner.
import { ref } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/config";

/** { id, no_id, nama, jabatan } atau null (belum dimuat / belum ditetapkan) */
export const owner = ref(null);

let janji = null;

/** Muat info Owner sekali per sesi halaman. */
export function muatOwner() {
  if (!janji) {
    const token = Cookies.get("token") || localStorage.getItem("token") || "";
    janji = axios
      .get(`${API_URL}/api/owner`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { owner.value = r.data?.data || null; return owner.value; })
      .catch(() => { janji = null; return null; });
  }
  return janji;
}

/** "Owner · Nama (OW01)" untuk akun yang langsung di bawah Owner. */
export function teksOwner() {
  const o = owner.value;
  return o ? `Owner · ${o.nama} (${o.no_id})` : "Owner";
}
