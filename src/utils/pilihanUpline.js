// Pilihan upline di Registrasi & Verifikasi ID (POST /api/get/mvo|regional|founder|gm|supplier|distributor).
// Yang terlihat: "No ID · Nama" (pendek); kode akun hanya baris kecil di daftar pilihan.
// Nilai yang disimpan TETAP "KODE - Nama" karena approval & rantai upline membacanya.

/** Item v-select dari baris server { code, nama, no_id }. */
export function opsiUpline(i) {
  // Kursi kosong yang dibiarkan (Mutasi): nilai "-" = level ini dilewati, lanjut pilih downline kursi itu
  if (i.kursi_kosong) {
    return { text: `Kursi kosong · ${i.no_id} (lewati)`, value: "-", kode: "Belum ada orangnya — lanjut pilih downline kursi ini", kursiKosong: true };
  }
  return {
    text: i.no_id ? `${i.no_id} · ${i.nama}` : i.nama,
    value: `${i.code} - ${i.nama}`,
    kode: i.code,
  };
}

/** :item-props untuk v-select: kode akun sebagai subjudul di daftar pilihan. */
export function propsUpline(item) {
  return { subtitle: item.kode };
}

/** Upline langsung tidak boleh kursi kosong: buang opsi "Kursi kosong" pada level upline langsung jabatan itu. */
export function tanpaKursiLangsung(items, levelUpline, levelJabatan) {
  return Number(levelUpline) === Number(levelJabatan) - 1 ? (items || []).filter((o) => !o.kursiKosong) : items;
}
