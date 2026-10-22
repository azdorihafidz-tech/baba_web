// Jalur atasan untuk kolom tabel TM … Distributor.
// Sumber utama: item.jalur dari backend (JalurAtasanService, dibangun dari struktur atasan / parent_id),
// berisi { [level]: { id, no_id, nama, jabatan } }. Bila belum ada (mis. data detail lama), dipakai
// string lama upline_1..6 ("KODE - Nama") sebagai cadangan.

// Urutan kolom: atasan terdekat dulu (Distributor) sampai paling atas (TM)
export const JALUR_LEVELS = [
  { level: 6, key: "jalur_6", lama: "upline_6", title: "Distributor", short: "DISTRIBUTOR" },
  { level: 5, key: "jalur_5", lama: "upline_5", title: "Supplier", short: "SUPPLIER" },
  { level: 4, key: "jalur_4", lama: "upline_4", title: "General Manager", short: "GENERAL MANAGER" },
  { level: 3, key: "jalur_3", lama: "upline_3", title: "Founder", short: "FOUNDER" },
  { level: 2, key: "jalur_2", lama: "upline_2", title: "Regional", short: "REGIONAL" },
  { level: 1, key: "jalur_1", lama: "upline_1", title: "MVO", short: "MVO" },
  { level: 0, key: "jalur_0", lama: null, title: "TM", short: "TOP MANAGEMENT" },
];

/** Atasan item pada level tertentu: { no_id, nama, kode? } atau null. */
export function atasanPada(item, lvl) {
  if (!item) return null;
  // Jalur kosong (mis. akun belum diverifikasi, belum punya atasan langsung) → pakai isian registrasi
  if (item.jalur && Object.keys(item.jalur).length) return item.jalur[lvl.level] || null;
  const lama = lvl.lama ? item[lvl.lama] : null;
  if (!lama || lama === "-") return null;
  const [kode, ...nama] = String(lama).split(" - ");
  return { no_id: null, kode: kode.trim(), nama: nama.join(" - ").trim() || kode.trim() };
}

/** "B78 · Edwin ATM" atau "-" */
export function teksAtasan(item, lvl) {
  const a = atasanPada(item, lvl);
  if (!a) return "-";
  const id = a.no_id || a.kode;
  return id ? `${id} · ${a.nama}` : a.nama;
}

/** Jalur ringkas dari atas ke bawah: "TM01 › M01 › R03 › B02" (untuk HP). */
export function jalurRingkas(item) {
  return JALUR_LEVELS.slice()
    .reverse()
    .map((lvl) => atasanPada(item, lvl))
    .filter(Boolean)
    .map((a) => a.no_id || a.kode || a.nama)
    .join(" › ");
}
