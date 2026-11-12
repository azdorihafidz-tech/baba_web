// Printer struk Toko Saya (Tahap 6c).
// - Di aplikasi Android BABA PARFUME: struk dikirim sebagai byte ESC/POS ke printer Bluetooth yang sudah
//   di-pairing di HP, lewat window.BabaApp.cetak (APK hanya meneruskan byte — format diatur di sini).
// - Di browser biasa: tidak bisa memilih printer Bluetooth (Chrome hanya BLE) → pakai Cetak bawaan browser.
// Pengaturan disimpan per perangkat (localStorage), karena tiap HP memakai printernya sendiri.
import { reactive } from "vue";

const KUNCI = "baba_printer";
const bawaan = { mac: "", nama: "", lebar: 58, otomatis: false };

function baca() {
  try {
    return { ...bawaan, ...(JSON.parse(localStorage.getItem(KUNCI) || "{}") || {}) };
  } catch {
    return { ...bawaan };
  }
}

export const printerState = reactive(baca());

export function simpanPrinter(ubah) {
  Object.assign(printerState, ubah);
  try {
    localStorage.setItem(KUNCI, JSON.stringify({ mac: printerState.mac, nama: printerState.nama, lebar: printerState.lebar, otomatis: printerState.otomatis }));
  } catch { /* penyimpanan diblokir — pengaturan berlaku sampai halaman ditutup */ }
}

/** Aplikasi Android BABA versi yang punya fungsi printer. */
export const adaPrinterApk = () => typeof window !== "undefined" && !!(window.BabaApp && typeof window.BabaApp.printerDaftar === "function");
/** Printer sudah dipilih & bisa dipakai di perangkat ini. */
export const printerSiap = () => adaPrinterApk() && !!printerState.mac;

/** @returns {{izin:boolean, bluetooth:boolean, ada?:boolean, printer:{mac:string,nama:string}[]}} */
export function daftarPrinter() {
  if (!adaPrinterApk()) return { izin: false, bluetooth: false, printer: [] };
  try {
    return JSON.parse(window.BabaApp.printerDaftar());
  } catch {
    return { izin: false, bluetooth: false, printer: [] };
  }
}

/** Minta izin Bluetooth. Resolve true/false. */
export function mintaIzin() {
  return new Promise((selesai) => {
    if (!adaPrinterApk()) return selesai(false);
    const t = setTimeout(() => selesai(false), 60000);
    window.BabaAppIzinPrinter = (ok) => { clearTimeout(t); selesai(!!ok); };
    window.BabaApp.mintaIzinPrinter();
  });
}

const antrean = {};
let nomor = 0;
if (typeof window !== "undefined") {
  window.BabaAppCetakHasil = (id, ok, pesan) => {
    const cb = antrean[id];
    if (!cb) return;
    delete antrean[id];
    ok ? cb.resolve(pesan) : cb.reject(new Error(pesan || "Gagal mencetak."));
  };
}

function keBase64(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
  return btoa(bin);
}

/** Kirim byte ke printer terpilih. Reject dengan pesan yang bisa ditampilkan. */
export function cetakBytes(bytes) {
  if (!adaPrinterApk()) return Promise.reject(new Error("Cetak ke printer Bluetooth hanya bisa di aplikasi Android BABA PARFUME."));
  if (!printerState.mac) return Promise.reject(new Error("Printer belum dipilih. Buka Toko Saya › Printer."));
  return new Promise((resolve, reject) => {
    const id = "c" + Date.now() + "_" + ++nomor;
    const t = setTimeout(() => { delete antrean[id]; reject(new Error("Printer tidak merespons (30 detik). Pastikan printer menyala dan dekat.")); }, 30000);
    antrean[id] = { resolve: (p) => { clearTimeout(t); resolve(p); }, reject: (e) => { clearTimeout(t); reject(e); } };
    window.BabaApp.cetak(keBase64(bytes), printerState.mac, id);
  });
}

// ===== ESC/POS =====
const ESC = 0x1b, GS = 0x1d;

/** Huruf non-ASCII diganti padanan (printer thermal murah hanya ASCII). */
export function ascii(teks) {
  return String(teks ?? "")
    .replace(/[×✕]/g, "x").replace(/[—–]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, "...").replace(/·/g, "-")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7E\n]/g, "");
}

const rp = (n) => "Rp" + Math.round(Number(n) || 0).toLocaleString("id-ID");

/**
 * Buat byte struk.
 * @param {object} d {judul, sub[], nomor, waktu, baris:[{nama, qty, harga, subtotal}], ringkas:[[label, nilai, tebal?]], catatan[], kaki}
 * @param {number} lebar 58 | 80
 */
export function buatStruk(d, lebar = printerState.lebar) {
  const kol = Number(lebar) === 80 ? 48 : 32;
  const out = [];
  const tulis = (t) => { for (const c of ascii(t)) out.push(c.charCodeAt(0)); };
  const baris = (t = "") => { tulis(t); out.push(0x0a); };
  const tengah = (on) => out.push(ESC, 0x61, on ? 1 : 0);
  const tebal = (on) => out.push(ESC, 0x45, on ? 1 : 0);
  const besar = (on) => out.push(GS, 0x21, on ? 0x11 : 0x00);
  const garis = () => baris("-".repeat(kol));
  const kiriKanan = (kiri, kanan) => {
    const k = ascii(kanan);
    let l = ascii(kiri);
    if (l.length + k.length + 1 > kol) { baris(l); l = ""; }
    baris(l + " ".repeat(Math.max(1, kol - l.length - k.length)) + k);
  };
  const lipat = (t) => {
    const kata = ascii(t).split(" ");
    let isi = "";
    for (const w of kata) {
      if ((isi + (isi ? " " : "") + w).length > kol) { if (isi) baris(isi); isi = w.slice(0, kol); } else isi += (isi ? " " : "") + w;
    }
    if (isi) baris(isi);
  };

  out.push(ESC, 0x40); // reset
  tengah(true);
  tebal(true); besar(true); baris(d.judul || "BABA PARFUME"); besar(false); tebal(false);
  for (const s of d.sub || []) if (s) lipat(s);
  if (d.nomor) baris(d.nomor);
  if (d.waktu) baris(d.waktu);
  if (d.tanda) { tebal(true); baris(d.tanda); tebal(false); }
  tengah(false);
  garis();
  for (const b of d.baris || []) {
    lipat(b.nama);
    kiriKanan(`  ${b.qty} x ${rp(b.harga)}`, rp(b.subtotal));
  }
  garis();
  for (const [label, nilai, tbl] of d.ringkas || []) {
    if (tbl) tebal(true);
    kiriKanan(label, nilai);
    if (tbl) tebal(false);
  }
  if ((d.catatan || []).length) { garis(); for (const c of d.catatan) if (c) lipat(c); }
  tengah(true);
  baris("");
  if (d.kaki) lipat(d.kaki);
  tengah(false);
  baris(""); baris(""); baris("");
  out.push(GS, 0x56, 0x42, 0x00); // potong kertas (diabaikan printer tanpa pemotong)
  return new Uint8Array(out);
}

export { rp as rupiahStruk };
