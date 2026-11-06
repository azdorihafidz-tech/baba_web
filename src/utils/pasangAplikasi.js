// Pasang aplikasi (PWA) ke layar utama HP.
// Android (Chrome): browser memberi event beforeinstallprompt → tombol "Pasang aplikasi" memunculkan jendela pasang.
// iPhone (Safari): tidak ada jendela pasang otomatis → tampilkan petunjuk Bagikan › Tambahkan ke Layar Utama.
// Diimpor di main.js supaya event yang datang sebelum halaman dimuat tidak terlewat.
import { reactive } from "vue";

export const pasangState = reactive({ bisaPasang: false, terpasang: false });

let tunda = null;

const modeAplikasi = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

export const diIphone = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export const diAndroid = () => /android/i.test(navigator.userAgent);

if (typeof window !== "undefined") {
  pasangState.terpasang = modeAplikasi();
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    tunda = e;
    pasangState.bisaPasang = true;
  });
  window.addEventListener("appinstalled", () => {
    tunda = null;
    pasangState.bisaPasang = false;
    pasangState.terpasang = true;
  });
}

/** Tampilkan jendela pasang (Android). true bila pengguna menekan Pasang. */
export async function pasang() {
  if (!tunda) return false;
  tunda.prompt();
  const hasil = await tunda.userChoice.catch(() => null);
  tunda = null;
  pasangState.bisaPasang = false;
  return hasil?.outcome === "accepted";
}
