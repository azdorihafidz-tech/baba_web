// Aplikasi di HP.
// Android: APK BABA PARFUME (folder android/, dibuat GitHub Actions) diunduh dari /unduh/baba-parfume.apk;
//          bila APK belum ada di server, cadangannya jendela pasang Chrome (beforeinstallprompt, PWA).
// iPhone (Safari): petunjuk Bagikan › Tambahkan ke Layar Utama (PWA).
// Komputer: kode QR untuk memindai alamat APK dengan HP Android.
// Diimpor di main.js supaya event yang datang sebelum halaman dimuat tidak terlewat.
import { reactive } from "vue";

export const APK_URL = "/unduh/baba-parfume.apk";

export const pasangState = reactive({
  bisaPasang: false, // Chrome menawarkan pasang PWA
  terpasang: false, // sedang dibuka sebagai aplikasi (APK / PWA layar utama)
  apk: null, // { versionCode, versionName } dari /unduh/versi.json; null = belum ada APK di server
});

let tunda = null;

/** Dibuka dari APK BABA PARFUME (WebView menambahkan penanda ini di user-agent). */
export const diAplikasi = () => /BabaParfumeApp\//.test(navigator.userAgent);

const modeAplikasi = () =>
  diAplikasi() || window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

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

let muatApk = null;
/** Info APK di server (sekali per halaman). Tanpa file → apk tetap null, tombol unduh/QR tidak tampil. */
export function muatInfoApk() {
  if (!muatApk) {
    muatApk = fetch(`/unduh/versi.json?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && Number(j.versionCode) > 0) pasangState.apk = { versionCode: Number(j.versionCode), versionName: String(j.versionName || "") };
      })
      .catch(() => {});
  }
  return muatApk;
}

/** Tampilkan jendela pasang PWA (Chrome). true bila pengguna menekan Pasang. */
export async function pasang() {
  if (!tunda) return false;
  tunda.prompt();
  const hasil = await tunda.userChoice.catch(() => null);
  tunda = null;
  pasangState.bisaPasang = false;
  return hasil?.outcome === "accepted";
}
