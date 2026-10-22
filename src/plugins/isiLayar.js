/**
 * v-isi-layar: tinggi maksimum elemen = sisa layar dari posisinya sampai bawah,
 * sehingga isinya (daftar kartu / tabel) digulir di dalam kotaknya sendiri dan
 * judul, kolom cari, serta tombol halaman tetap terlihat.
 *
 * Nilai (opsional): ruang yang disisakan di bawah kotak dalam px, mis. untuk
 * tombol halaman di bawah daftar. Menu bawah HP dihitung otomatis.
 *   <div v-isi-layar="56" class="baba-gulir">…</div>
 */

const MENU_BAWAH_HP = 64; // --baba-bottom-nav-h
const JARAK_BAWAH = 12;
const TINGGI_MIN = 280;

export function aturTinggiIsiLayar(el, sisa = 0) {
  if (!el || !el.isConnected || el.offsetParent === null) return; // tersembunyi (d-none)
  const atas = el.getBoundingClientRect().top + window.scrollY;
  const menuBawah = window.innerWidth < 960 ? MENU_BAWAH_HP : 0;
  const tinggi = window.innerHeight - atas - sisa - menuBawah - JARAK_BAWAH;
  el.style.maxHeight = `${Math.max(TINGGI_MIN, Math.floor(tinggi))}px`;
}

export const isiLayar = {
  mounted(el, binding) {
    el._isiLayar = () => aturTinggiIsiLayar(el, Number(binding.value) || 0);
    window.addEventListener("resize", el._isiLayar);
    // Tunggu tata letak selesai (gambar header, data pertama)
    requestAnimationFrame(el._isiLayar);
    setTimeout(el._isiLayar, 600);
  },
  updated(el, binding) {
    el._isiLayar = () => aturTinggiIsiLayar(el, Number(binding.value) || 0);
    el._isiLayar();
  },
  unmounted(el) {
    window.removeEventListener("resize", el._isiLayar);
  },
};
