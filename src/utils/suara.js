// Bunyi pendek saat notifikasi lonceng / pesan chat baru masuk (keputusan user 27 Okt 2026).
// Dibuat langsung dengan Web Audio (tanpa file suara). Bisa dimatikan per perangkat (panel lonceng);
// pilihan disimpan di localStorage. Browser baru mengizinkan suara setelah pengguna pernah
// mengetuk/klik halaman, jadi AudioContext dinyalakan pada interaksi pertama.
import { reactive } from "vue";

const KUNCI = "suara_notifikasi";
const KUNCI_TERAKHIR = "suara_terakhir";
const JEDA_MS = 1500; // notifikasi beruntun (mis. Mutasi satu gerbong) cukup berbunyi sekali

function bacaAktif() {
  try {
    return localStorage.getItem(KUNCI) !== "mati";
  } catch (e) {
    return true;
  }
}

export const suaraState = reactive({ aktif: bacaAktif() });

export function aturSuara(aktif) {
  suaraState.aktif = !!aktif;
  try {
    localStorage.setItem(KUNCI, aktif ? "aktif" : "mati");
  } catch (e) {
    // penyimpanan diblokir: pilihan berlaku sampai halaman ditutup
  }
  if (aktif) bunyikan("notifikasi", true); // contoh bunyi saat dinyalakan
}

let ctx = null;
function konteks() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// Nyalakan audio pada interaksi pertama (aturan autoplay browser)
if (typeof window !== "undefined") {
  const nyalakan = () => {
    konteks();
    window.removeEventListener("pointerdown", nyalakan);
    window.removeEventListener("keydown", nyalakan);
  };
  window.addEventListener("pointerdown", nyalakan);
  window.addEventListener("keydown", nyalakan);
}

function nada(c, frekuensi, mulai, lama, volume) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(frekuensi, mulai);
  gain.gain.setValueAtTime(0.0001, mulai);
  gain.gain.exponentialRampToValueAtTime(volume, mulai + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, mulai + lama);
  osc.connect(gain).connect(c.destination);
  osc.start(mulai);
  osc.stop(mulai + lama + 0.05);
}

// Hanya satu tab yang berbunyi bila aplikasi terbuka di beberapa tab
function bolehBunyi() {
  try {
    const terakhir = Number(localStorage.getItem(KUNCI_TERAKHIR) || 0);
    if (Date.now() - terakhir < JEDA_MS) return false;
    localStorage.setItem(KUNCI_TERAKHIR, String(Date.now()));
  } catch (e) {
    // tanpa localStorage: tetap berbunyi
  }
  return true;
}

/** jenis: "notifikasi" (ting-ting dua nada) | "chat" (satu nada lembut) */
export function bunyikan(jenis = "notifikasi", paksa = false) {
  if (!suaraState.aktif && !paksa) return;
  if (!paksa && !bolehBunyi()) return;
  const c = konteks();
  if (!c || c.state !== "running") return; // belum ada interaksi: browser menolak suara
  const t = c.currentTime + 0.01;
  if (jenis === "chat") {
    nada(c, 660, t, 0.18, 0.12);
  } else {
    nada(c, 880, t, 0.22, 0.18);
    nada(c, 1320, t + 0.13, 0.32, 0.16);
  }
}
