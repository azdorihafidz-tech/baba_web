// No. Member = nomor akun permanen (tbl_user.id), mis. BP-00284. Tidak berubah karena Mutasi, naik/turun
// jabatan, atau pindah cabang, dan tidak pernah dipakai ulang — beda dengan No ID (kursi) dan kode akun.
// Backend: Controller::idDariNoMember() untuk pencarian.

export function noMember(id) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? `BP-${String(n).padStart(5, "0")}` : "";
}

/** "BP-00284" / "bp284" / "BP 284" → 284, selain itu null. */
export function idDariNoMember(teks) {
  const m = String(teks || "").trim().match(/^bp[\s-]?0*(\d+)$/i);
  return m ? Number(m[1]) : null;
}
