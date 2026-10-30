// Rencana Mutasi: daftar No ID dari server mencerminkan database, padahal langkah-langkah rencana
// yang sudah ditetapkan bisa memindahkan pemegang kursi. Fungsi ini menimpa pemegang setiap nomor
// dengan keadaan sesudah rencana (dari baris pratinjau rencana: no_id_lama → no_id_baru).

/**
 * @param {Array} daftar  [{ no_id, pemegang }] dari GET /mutasi/nomor
 * @param {Array} baris   baris pratinjau rencana (tanpa langkah yang sedang diisi)
 * @returns {Array} daftar dengan pemegang menurut rencana; kursiKosong = true bila kursi itu kosong di rencana
 */
export function nomorMenurutRencana(daftar, baris) {
  if (!baris?.length) return daftar;
  const pemegangBaru = new Map();
  const dilepas = new Set();
  baris.forEach((b) => {
    if (b.no_id_baru) pemegangBaru.set(b.no_id_baru, b);
    if (b.no_id_lama && b.no_id_lama !== b.no_id_baru) dilepas.add(b.no_id_lama);
  });
  return daftar.map((n) => {
    const b = pemegangBaru.get(n.no_id);
    if (b?.kosong) return { ...n, pemegang: null, kursiKosong: true };
    if (b) {
      return {
        ...n,
        pemegang: {
          id: b.id, nama: b.nama, jabatan: b.jabatan_baru, aktif: true,
          mvo_type_id: String(b.mvo_type_id), parent_id: b.parent_id, atasan_nama: b.atasan_baru,
        },
      };
    }
    return dilepas.has(n.no_id) ? { ...n, pemegang: null } : n;
  });
}

/** Label pilihan No ID: kosong / kosong di rencana / pemegang. */
export function labelNomor(n, memberId) {
  if (n.kursiKosong) return `${n.no_id} — kursi kosong (jabatan & upline mengikuti kursi)`;
  if (!n.pemegang) return `${n.no_id} — kosong`;
  if (n.pemegang.id === memberId) return `${n.no_id} — ${n.pemegang.nama} (posisi sekarang)`;
  return `${n.no_id} — ${n.pemegang.nama} (${n.pemegang.jabatan})`;
}
