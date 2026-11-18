/**
 * Kamus Menu aplikasi member — penjelasan FUNGSI, SYARAT, ALUR, DAMPAK tiap menu (porting Dimsum 4.50).
 * Bedanya dengan Panduan (src/panduan/isi.js): Panduan = langkah klik; Kamus = fungsi + syarat + akibat.
 *
 * WAJIB diperbarui setiap ada menu baru atau perubahan perilaku menu (lihat CLAUDE.md), dalam pekerjaan yang sama.
 * Isi ditulis dari kode (baba_web views, baba_api controller, endpoint ERP), bukan ingatan.
 * Penjaga: `npm run cek:kamus` (scripts/cek-kamus.mjs) gagal bila ada menu Sidebar.vue / route router tanpa entri.
 *
 * Struktur satu entri:
 *   id, route (path router; null untuk "Cara Melakukan"), menu, kelompok, icon,
 *   peran   : "semua" | "superadmin" | "hak:<kode>"   (entri khusus disembunyikan dari member lain)
 *   ringkas : satu kalimat
 *   fungsi  : paragraf
 *   syarat  : [teks | {teks, peran}]   "Supaya menu ini muncul & bisa dipakai"
 *   alur    : [teks | {teks, peran}]
 *   tombol  : [{ t, j, peran? }]        "Apa yang terjadi kalau tombol diklik" (data, RO, stok, lonceng, kiriman ke ERP)
 *   wajib, jangan : [teks | {teks, peran}]
 *   mirip   : [{ t, j }]                "Menu yang mirip & bedanya"
 *   kata    : kata kunci pencarian (kata sehari-hari)
 */

export const KELOMPOK = ["Cara Melakukan", "Akun & Struktur", "Dokumen & RO", "Belanja & Toko", "Komunikasi & Info", "Pengaturan (superadmin)", "Bantuan"];

export const KAMUS = [
  // ===================== AKUN & STRUKTUR =====================
  {
    id: "dashboard", route: "/admin/dashboard", menu: "Live Performance", kelompok: "Akun & Struktur", icon: "mdi-view-dashboard", peran: "semua",
    ringkas: "Angka jaringan: jumlah akun, dokumen, bintang, peringkat, pertumbuhan RO, dan riwayat persetujuan akun.",
    fungsi: "Halaman pertama setelah login. Semua angka dihitung dari data akun dan dokumen RO yang sudah ada — halaman ini tidak mengubah data apa pun.",
    syarat: [
      "Akun sudah diaktivasi superadmin (akun belum aktif tidak bisa login).",
      "Member melihat data cabangnya sendiri; superadmin melihat semua cabang.",
    ],
    alur: ["Pilih tab (Overview, Akun, Dokumen, MVO/Wilayah, Star, Growth) → atur tanggal → Filter → klik kartu/baris untuk rincian."],
    tombol: [
      { t: "Filter / ↻", j: "Hanya mengganti periode tampilan." },
      { t: "Export", j: "Mengunduh Excel tabel itu. Tidak mengubah data." },
    ],
    wajib: ["Angka Star dan RO hanya dari dokumen yang sudah disetujui akhir (lihat Document Belum Approve)."],
    jangan: ["Jangan menganggap angka nol sebagai error sebelum memeriksa rentang tanggal."],
    mirip: [{ t: "Struktur Akun", j: "Bentuk pohon jaringan; Live Performance berisi angka." }],
    kata: "dashboard angka ringkasan star bintang peringkat ranking growth pertumbuhan ro riwayat approve",
  },
  {
    id: "struktur", route: "/admin/strukturhierarkiakun", menu: "Struktur Akun", kelompok: "Akun & Struktur", icon: "mdi-sitemap", peran: "semua",
    ringkas: "Pohon jaringan dari Owner sampai Reseller: siapa upline siapa, jumlah downline, kursi kosong.",
    fungsi: "Menampilkan struktur dari relasi upline yang tersimpan (diubah hanya lewat Mutasi Jabatan / Excel Struktur). Hanya melihat.",
    syarat: [
      "Hanya akun aktif yang tampil. Akun tanpa upline (Top Management, MVO yang belum di bawah TM) berada langsung di bawah Owner.",
      { teks: "Superadmin: tombol Excel membuka Excel Struktur; klik baris OWNER untuk Ubah nama Owner.", peran: "superadmin" },
    ],
    alur: ["Cari nama / No ID → buka cabang pohon → klik nama untuk detail (No ID, upline, downline langsung, total jaringan)."],
    tombol: [
      { t: "Klik kartu jabatan", j: "Menyorot jabatan itu di pohon. Tidak mengubah data." },
      { t: "Ubah nama Owner", j: "Nama Owner berubah di seluruh aplikasi (tercatat di riwayat akun).", peran: "superadmin" },
    ],
    wajib: [],
    jangan: ["Baris “Kursi kosong — menunggu pengganti” bukan akun: tidak bisa login, tidak dihitung di total."],
    mirip: [
      { t: "Mutasi Jabatan", j: "Tempat mengubah posisi di pohon." },
      { t: "Input Data → Detail → tab Downline", j: "Daftar downline satu akun." },
    ],
    kata: "struktur pohon jaringan upline downline hierarki owner tm kursi kosong total jaringan",
  },
  {
    id: "approval-akun", route: "/admin/mvobelumapprove", menu: "Akun Belum Approve", kelompok: "Akun & Struktur", icon: "mdi-account-alert", peran: "semua",
    ringkas: "Pendaftar baru menunggu persetujuan upline: Approve, Tunda, Tolak (alasan), Pulihkan.",
    fungsi: "Langkah kedua pendaftaran: setiap upline yang dipilih pendaftar menyetujui. Setelah semua upline approve, akun siap diverifikasi superadmin.",
    syarat: [
      "Anda tercatat sebagai upline pendaftar itu (atau superadmin).",
      "Hak approve tidak dilarang superadmin di menu Hak Akses (bila dilarang muncul keterangan kuning dan tombol hilang).",
      "Angka merah di menu = pendaftar yang belum Anda approve (yang ditolak tidak dihitung).",
    ],
    alur: ["Pendaftar daftar → upline Approve (atau Tunda/Tolak) → semua upline approve → superadmin Aktivasi di Verifikasi ID."],
    tombol: [
      { t: "Approve", j: "Persetujuan Anda tercatat pada level jabatan Anda. Bila Anda upline terakhir, superadmin mendapat lonceng “akun siap diverifikasi”." },
      { t: "Tunda / Tolak", j: "Alasan wajib. Akun tetap belum aktif; tercatat di Riwayat Persetujuan Akun (Dashboard › Akun). Ditolak tampil berlabel di Verifikasi ID." },
      { t: "Pulihkan", j: "Status kembali Menunggu." },
      { t: "Verifikasi", j: "Membuka Verifikasi ID dengan akun itu tercari.", peran: "superadmin" },
    ],
    wajib: ["Periksa kebenaran data & upline sebelum Approve."],
    jangan: ["Jangan approve akun ganda — tolak dengan alasan."],
    mirip: [{ t: "Verifikasi ID", j: "Langkah terakhir (superadmin) yang benar-benar mengaktifkan akun dan membuat No ID." }],
    kata: "akun belum approve pendaftar baru approve setuju downline baru tunda tolak pulihkan member baru daftar",
  },
  {
    id: "verifikasi", route: "/admin/user", menu: "Verifikasi ID", kelompok: "Akun & Struktur", icon: "mdi-account", peran: "superadmin",
    ringkas: "Mengaktifkan pendaftar (membuat No ID), mengelola data akun, menjadikan akun superadmin sebagai member.",
    fungsi: "Langkah akhir pendaftaran dan pengelolaan data akun.",
    syarat: ["Khusus superadmin. Angka merah = akun yang semua uplinenya sudah approve (Siap diverifikasi)."],
    alur: ["Siap diverifikasi → periksa data → Aktivasi → No ID dibuat otomatis → akun bisa login."],
    tombol: [
      { t: "Aktivasi", j: "Akun aktif, No ID dibuat (nomor kosong terkecil sesuai jabatan / turunan No ID upline), kode akun dibuat, persetujuan upline dilengkapi. Akun & upline langsung mendapat lonceng. Ditolak bila rentang nomor penuh atau upline belum punya No ID." },
      { t: "Edit", j: "Data diri / username / password. Pindah cabang akun aktif hanya bila tanpa downline & tanpa dokumen tertunda (kode akun ikut berganti). Jabatan & upline akun aktif tidak bisa diubah di sini." },
      { t: "Hapus", j: "Permanen, hanya bila tidak ada downline, dokumen, persetujuan yang pernah diberikan, riwayat Mutasi, atau hak akses." },
      { t: "Akun superadmin → Jadikan member", j: "Akun superadmin menjadi pendaftar belum aktif berjabatan pilihan; token login dihapus; lalu Aktivasi biasa." },
    ],
    wajib: ["Cek foto & data sebelum Aktivasi."],
    jangan: ["Jangan mengubah jabatan/upline akun aktif lewat Edit — pakai Mutasi Jabatan."],
    mirip: [{ t: "Akun Belum Approve", j: "Persetujuan upline sebelum verifikasi." }],
    kata: "verifikasi aktivasi aktifkan akun no id user hapus akun edit akun superadmin jadikan member",
  },
  {
    id: "mutasi", route: "/admin/mutasi", menu: "Mutasi Jabatan", kelompok: "Akun & Struktur", icon: "mdi-account-switch", peran: "hak:mutasi",
    ringkas: "Memindah jabatan, upline, No ID, atau kursi akun (Mutasi Baru, Bagan seret-lepas, Saran RO, Kursi kosong, Riwayat).",
    fungsi: "Satu-satunya cara mengubah posisi akun di struktur. Setiap rencana dipratinjau (No ID lama → baru) lalu disimpan sekaligus dalam satu transaksi.",
    syarat: [
      "Superadmin, atau akun yang diberi hak Mutasi di menu Hak Akses — hanya untuk gerbongnya (jabatan paling tinggi 1 jenjang di bawah pemilik gerbong).",
      "Kursi yang ditinggal dan masih punya downline harus diisi pengganti, dipindahkan timnya, atau dibiarkan kosong sebelum Simpan.",
    ],
    alur: ["Pilih orang → jabatan & upline baru (atau No ID tujuan / tukar posisi) → pilih downline yang ikut → Pratinjau → Simpan."],
    tombol: [
      { t: "Simpan", j: "Jabatan, No ID, upline, dan kode akun semua akun terdampak berubah; dokumen yang masih menunggu ikut disesuaikan; tercatat di Riwayat; akun terdampak & upline baru mendapat lonceng." },
      { t: "Biarkan kosong", j: "Kursi disimpan sebagai “Kursi kosong” dengan No ID-nya; downline tetap di bawahnya." },
      { t: "Saran RO", j: "Hanya menampilkan saran naik/turun dari RO; tidak memindah otomatis." },
    ],
    wajib: ["Periksa pratinjau sebelum Simpan."],
    jangan: ["RO dan dokumen milik orangnya, tidak ikut pindah ke pengganti kursi."],
    mirip: [
      { t: "Excel Struktur", j: "Perubahan banyak akun lewat file Excel; hasil sama dengan Mutasi." },
      { t: "Hak Akses", j: "Memberi hak Mutasi ke akun tertentu." },
    ],
    kata: "mutasi jabatan naik jabatan turun jabatan pindah upline tukar posisi no id kursi kosong bagan saran ro pengganti",
  },
  {
    id: "excel-struktur", route: "/admin/struktur-excel", menu: "Excel Struktur", kelompok: "Akun & Struktur", icon: "mdi-microsoft-excel", peran: "superadmin",
    ringkas: "Unduh struktur sebagai Excel pohon; ubah kolom kuning; unggah → Periksa → Simpan.",
    fungsi: "Cara massal mengubah struktur dengan aturan yang sama seperti Mutasi Jabatan.",
    syarat: ["Khusus superadmin. Maksimal 250 baris diubah per unggahan. File yang sudah dipakai menyimpan tidak berlaku lagi."],
    alur: ["Unduh → isi Jabatan/Upline/No ID/Cabang BARU → Unggah → Periksa (tanpa simpan) → Simpan."],
    tombol: [
      { t: "Periksa", j: "Tidak menyimpan; menampilkan masalah per nomor baris atau pratinjau." },
      { t: "Simpan", j: "Semua baris sekaligus (gagal satu = tidak ada yang tersimpan). Tercatat di Riwayat Mutasi jenis Import Excel; akun terdampak mendapat lonceng." },
    ],
    wajib: ["Jangan mengubah kolom No Member (pengenal)."],
    jangan: ["File berisi data member asli — jangan dibagikan."],
    mirip: [{ t: "Mutasi Jabatan", j: "Perubahan satu per satu di layar." }],
    kata: "excel struktur unduh struktur import struktur ubah massal upline baru jabatan baru",
  },
  {
    id: "downline", route: "/admin/Downline", menu: "Downline (halaman lama)", kelompok: "Akun & Struktur", icon: "mdi-account-group", peran: "semua",
    ringkas: "Halaman lama daftar downline per jabatan. Tidak ada di menu; dipakai lewat Input Data → Detail → tab Downline.",
    fungsi: "Menampilkan downline seperti tab Downline di Input Data. Hanya melihat.",
    syarat: ["Hanya akun Anda sendiri dan downline Anda (akun di luar jaringan ditolak)."],
    alur: [],
    tombol: [],
    wajib: [],
    jangan: [],
    mirip: [{ t: "Struktur Akun", j: "Cara utama melihat jaringan." }],
    kata: "downline anggota jaringan bawahan",
  },
  {
    id: "profil", route: "/admin/profil", menu: "Profil Saya", kelompok: "Akun & Struktur", icon: "mdi-account-circle", peran: "semua",
    ringkas: "Data akun sendiri, No ID, No. Member, ganti foto profil dan password.",
    fungsi: "Dibuka dari foto profil di kanan atas → Profil Saya.",
    syarat: [],
    alur: [],
    tombol: [
      { t: "Ganti foto", j: "Foto profil berganti (JPG/PNG ≤ 2 MB)." },
      { t: "Ganti password", j: "Password berganti; Anda keluar dari semua perangkat dan perlu login ulang." },
    ],
    wajib: ["Sebutkan No. Member (BP-xxxxx) bila menghubungi admin."],
    jangan: ["No ID, jabatan, dan cabang tidak bisa diubah sendiri — hubungi superadmin."],
    mirip: [],
    kata: "profil data diri foto profil ganti password no member no id",
  },

  // ===================== DOKUMEN & RO =====================
  {
    id: "input-data", route: "/admin/mvo", menu: "Input Data", kelompok: "Dokumen & RO", icon: "mdi-clipboard-text-outline", peran: "semua",
    ringkas: "Daftar akun jaringan beserta dokumen RO / star; tambah, ubah, hapus dokumen.",
    fungsi: "Tempat mencatat dokumen repeat order (RO = Range Point) dan rating star per akun. Dokumen baru masuk antrean persetujuan.",
    syarat: [
      "Melihat: akun sendiri & downline Anda.",
      "Menambah/mengubah/menghapus dokumen: hak dokumen (bawaan MVO, Regional, Founder; diatur superadmin di Hak Akses) dan akunnya di jaringan Anda.",
      "Dokumen yang sudah disetujui final hanya bisa diubah/dihapus superadmin.",
    ],
    alur: ["Cari akun → Detail → tab Dokumen → Tambah Dokumen → menunggu persetujuan (Regional → MVO → superadmin)."],
    tombol: [
      { t: "Tambah Dokumen", j: "Dokumen tersimpan berstatus menunggu; upline giliran berikutnya mendapat lonceng." },
      { t: "Edit", j: "Dokumen kembali menunggu persetujuan." },
      { t: "Hapus", j: "Dokumen hilang (permanen; salinan di riwayat)." },
      { t: "Import Dokumen", j: "Banyak dokumen sekaligus dari Excel; akun dicari lewat No Member → No ID → Nama (unik). Baris gagal disebutkan.", peran: "superadmin" },
    ],
    wajib: ["Range Point = nilai RO yang dihitung di Dashboard & Saran RO."],
    jangan: ["Dokumen “Belanja online …” dibuat otomatis dari ERP dan tidak bisa diubah/dihapus — koreksi lewat retur pesanan."],
    mirip: [{ t: "Document Belum Approve", j: "Tempat menyetujui dokumen." }],
    kata: "input data dokumen ro repeat order range point rating star tambah dokumen import dokumen excel akun",
  },
  {
    id: "approval-dokumen", route: "/admin/documentbelumapprove", menu: "Document Belum Approve", kelompok: "Dokumen & RO", icon: "mdi-file-document-alert", peran: "semua",
    ringkas: "Persetujuan dokumen RO/star: Regional, lalu MVO, lalu persetujuan akhir superadmin.",
    fungsi: "Dokumen baru dihitung di Dashboard/Star/Saran RO setelah disetujui akhir oleh superadmin.",
    syarat: [
      "Upline hanya menyetujui dokumen downline-nya pada gilirannya (Regional dulu, lalu MVO). Angka merah = dokumen giliran Anda.",
      { teks: "Superadmin: angka merah = dokumen yang tinggal persetujuan akhir.", peran: "superadmin" },
    ],
    alur: ["Input Data → Regional approve → MVO approve → superadmin approve akhir → dihitung."],
    tombol: [
      { t: "Approve Document", j: "Giliran pindah ke penyetuju berikutnya (mendapat lonceng)." },
      { t: "Persetujuan akhir (🛡)", j: "Dokumen final: dihitung di Star/RO; pemilik & penginput mendapat lonceng.", peran: "superadmin" },
    ],
    wajib: [],
    jangan: [],
    mirip: [{ t: "Input Data", j: "Tempat dokumen dibuat." }],
    kata: "dokumen belum approve setujui dokumen persetujuan ro star approve dokumen",
  },
  {
    id: "mvodocument", route: "/admin/mvodocument", menu: "Document Akun (halaman lama)", kelompok: "Dokumen & RO", icon: "mdi-file-document-multiple", peran: "superadmin",
    ringkas: "Halaman lama daftar semua dokumen. Tidak ada di menu; dokumen dikelola di Input Data.",
    fungsi: "Sisa halaman lama. Gunakan Input Data dan Document Belum Approve.",
    syarat: ["Tidak ada di menu sidebar."],
    alur: [], tombol: [], wajib: [], jangan: ["Jangan dipakai untuk menyetujui dokumen — pakai Document Belum Approve."], mirip: [],
    kata: "document akun dokumen lama",
  },

  // ===================== BELANJA & TOKO =====================
  {
    id: "belanja", route: "/admin/belanja", menu: "Belanja", kelompok: "Belanja & Toko", icon: "mdi-cart-outline", peran: "semua",
    ringkas: "Belanja parfum ke gudang BABA (atau ke upline): katalog, keranjang, checkout.",
    fungsi: "Pesanan dibuat atas nama Anda di ERP BABA; gudang memproses di ERP. Harga mengikuti akun/jabatan Anda.",
    syarat: [
      "Toko online sudah **dibuka** Owner di ERP (atau akun Anda termasuk Uji coba). Selama tutup, menu bertanda “Segera” dan menampilkan Segera hadir.",
      "Ada produk dengan harga untuk akun/jabatan Anda dan stok tersedia.",
      "Pilihan Belanja ke Upline hanya bila diizinkan admin dan upline Anda akun aktif.",
      "Superadmin tidak bisa belanja (tidak punya jabatan).",
      "Bila layanan toko ERP sedang dibatasi (paket/langganan aplikasi), belanja ditolak dengan pesan.",
    ],
    alur: ["Pilih parfum → Keranjang → Checkout (ambil / dikirim, transfer / tagihan / tunai ke upline) → Buat Pesanan → lanjut di Pesanan Saya."],
    tombol: [
      { t: "Tambah / − +", j: "Hanya keranjang di HP/browser ini. Belum memesan." },
      { t: "Buat Pesanan", j: "Pesanan masuk ke gudang (lonceng staf ERP) atau ke upline (lonceng di Toko Saya upline). Stok yang dipesan langsung tidak bisa dipesan orang lain." },
    ],
    wajib: ["Alamat & nomor HP penerima benar bila dikirim."],
    jangan: ["Jangan transfer sebelum ongkir diisi (untuk pesanan dikirim)."],
    mirip: [{ t: "Toko Saya › Kasir", j: "Menjual stok Anda sendiri ke pelanggan, bukan membeli." }],
    kata: "belanja beli parfum katalog keranjang checkout pesan gudang belanja ke upline tagihan harga member segera hadir",
  },
  {
    id: "pesanan-saya", route: "/admin/pesanan-saya", menu: "Pesanan Saya", kelompok: "Belanja & Toko", icon: "mdi-package-variant-closed", peran: "semua",
    ringkas: "Status pesanan Anda: bayar & unggah bukti, batalkan, Pesanan Diterima, ajukan retur.",
    fungsi: "Mengikuti pesanan dari Belanja sampai diterima. Barang diterima masuk Stok Saya dan RO Anda tercatat.",
    syarat: ["Tetap bisa dibuka walau toko ditutup, selama Anda punya pesanan. Angka merah = pesanan perlu dibayar."],
    alur: ["Menunggu ongkir → Menunggu bayar → (unggah bukti) Menunggu cek → Disiapkan → Dikirim / Siap diambil → Diterima."],
    tombol: [
      { t: "Unggah bukti transfer", j: "Bukti dikirim ke penjual (gudang/upline) untuk dicek. Satu file bukti tidak bisa dipakai dua kali." },
      { t: "Batalkan", j: "Hanya saat Menunggu ongkir / Menunggu bayar." },
      { t: "Pesanan Diterima", j: "Stok Saya bertambah. RO (jumlah botol) dicatat sesuai Mode RO toko → muncul sebagai dokumen “Belanja online …” di Input Data." },
      { t: "Ajukan retur", j: "Pesanan diterima, dalam batas hari, barang masih ada di Stok Saya. Disetujui → Stok Saya berkurang, dana/tagihan dikembalikan, RO berkurang." },
    ],
    wajib: ["Transfer sesuai total ke rekening yang tampil."],
    jangan: ["Jangan menekan Pesanan Diterima sebelum barang benar-benar diterima."],
    mirip: [{ t: "Toko Saya › Pesanan Masuk", j: "Pesanan dari downline ke Anda (Anda penjual)." }],
    kata: "pesanan saya status pesanan bayar transfer bukti transfer resi diterima batal retur kembalikan barang",
  },
  {
    id: "toko-saya", route: "/admin/toko-saya", menu: "Toko Saya", kelompok: "Belanja & Toko", icon: "mdi-storefront-outline", peran: "semua",
    ringkas: "Pesanan masuk dari downline, retur, Kasir, Stok Saya + Stok opname, Laporan, Rekening, Printer.",
    fungsi: "Toko pribadi member: stok parfum milik Anda (bukan stok BABA) dan penjualan Anda sendiri.",
    syarat: [
      "Tetap bisa dibuka walau toko online ditutup, bila Anda punya riwayat pesanan.",
      "Pesanan dari downline hanya bila admin mengizinkan downline belanja ke upline dan Anda punya stoknya.",
      "Bila layanan toko ERP sedang dibatasi, melihat tetap bisa; kasir, opname, dan memproses pesanan ditolak dengan pesan.",
    ],
    alur: ["Pesanan Masuk: ongkir → cek bukti / Uang tunai diterima → Kirim / Siap diambil → Sudah diambil."],
    tombol: [
      { t: "Kirim / Siap diambil", j: "Stok Saya berkurang; pembeli mendapat lonceng." },
      { t: "Setujui retur", j: "Stok Saya bertambah, stok pembeli berkurang, RO pembeli berkurang." },
      { t: "Simpan penjualan (Kasir)", j: "Stok Saya berkurang; tercatat di Laporan. **Tidak menambah RO.**" },
      { t: "Simpan opname", j: "Stok Saya berkurang tanpa persetujuan (rusak, hilang, susut, tester, kedaluwarsa, salah catat). Tidak mengubah RO. Fisik lebih → hubungi admin gudang." },
      { t: "Tambah rekening", j: "Tampil ke downline yang bayar transfer." },
      { t: "Printer", j: "Hanya di aplikasi Android: printer Bluetooth untuk struk & nota." },
    ],
    wajib: ["Setujui retur hanya setelah barang kembali."],
    jangan: ["Jangan memakai Kasir untuk mencatat belanja Anda ke gudang — itu otomatis dari Pesanan Saya."],
    mirip: [{ t: "Belanja", j: "Membeli ke gudang/upline." }],
    kata: "toko saya stok saya kasir jual pelanggan struk printer bluetooth pesanan masuk downline retur stok opname laporan laba rekening",
  },
  {
    id: "store", route: "/admin/store", menu: "Store", kelompok: "Belanja & Toko", icon: "mdi-store", peran: "semua",
    ringkas: "Daftar toko resmi BABA PARFUME beserta lokasinya (rute Google Maps).",
    fungsi: "Informasi toko fisik untuk pelanggan. Tidak terhubung ke stok atau belanja.",
    syarat: [{ teks: "Tambah/Edit/Hapus toko: khusus superadmin.", peran: "superadmin" }],
    alur: [],
    tombol: [{ t: "Rute ke Toko", j: "Membuka Google Maps." }],
    wajib: [], jangan: [],
    mirip: [{ t: "Belanja", j: "Belanja online ke gudang; Store hanya daftar alamat toko." }],
    kata: "store toko resmi alamat toko lokasi maps rute",
  },

  // ===================== KOMUNIKASI & INFO =====================
  {
    id: "chat", route: "/admin/chat", menu: "Chat", kelompok: "Komunikasi & Info", icon: "mdi-chat", peran: "semua",
    ringkas: "Grup GLOBAL (semua member) dan grup cabang Anda, pesan langsung tampil.",
    fungsi: "Obrolan grup. Grup dibuat otomatis; anggota dihitung dari akun aktif dan cabangnya.",
    syarat: [
      "Akun aktif. Grup cabang mengikuti cabang akun Anda.",
      "Hak kirim pesan bisa dinonaktifkan superadmin (Anda tetap bisa membaca).",
    ],
    alur: [],
    tombol: [
      { t: "Kirim", j: "Pesan tampil untuk anggota grup (maks. 2.000 karakter; terlalu cepat → tunggu sebentar)." },
      { t: "Hapus pesan", j: "Pesan tampil “dihapus admin” untuk semua; teks asli tetap tersimpan.", peran: "superadmin" },
    ],
    wajib: [],
    jangan: ["Member tidak bisa menghapus pesan yang sudah terkirim."],
    mirip: [{ t: "Lonceng 🔔", j: "Kabar sistem untuk Anda pribadi, bukan obrolan." }],
    kata: "chat obrolan grup pesan global cabang kirim pesan",
  },

  // ===================== PENGATURAN (SUPERADMIN) =====================
  {
    id: "tipe-akun", route: "/admin/mvotype", menu: "Tipe Akun", kelompok: "Pengaturan (superadmin)", icon: "mdi-format-list-bulleted-type", peran: "superadmin",
    ringkas: "Jabatan beserta level, bintang, dan aturan No ID (nomor urut, rentang, turunan upline).",
    fungsi: "Menentukan cara No ID dibuat saat Aktivasi dan Mutasi.",
    syarat: ["Khusus superadmin. Jabatan yang sudah dipakai: Name, Level, cara penomoran, awalan terkunci."],
    alur: [],
    tombol: [{ t: "Update rentang", j: "Berlaku untuk Aktivasi/Mutasi berikutnya. Ditolak bila ada No ID sah di luar rentang baru." }],
    wajib: [], jangan: ["Jangan mengubah Level jabatan yang berjalan — dipakai sebagai nomor kolom upline & approval."],
    mirip: [],
    kata: "tipe akun jabatan level rentang no id founder gm penuh",
  },
  {
    id: "data-cabang", route: "/admin/provinsi", menu: "Data Cabang", kelompok: "Pengaturan (superadmin)", icon: "mdi-domain", peran: "superadmin",
    ringkas: "Cabang (provinsi): kode, nama, pimpinan, warna, foto Ruang Kota.",
    fungsi: "Cabang dipakai di kode akun, grup chat cabang, dan filter dashboard.",
    syarat: ["Khusus superadmin. Kode cabang yang dipakai akun terkunci; cabang tidak bisa dihapus."],
    alur: [], tombol: [{ t: "Simpan", j: "Nama/warna/foto berubah di aplikasi; grup chat cabang baru dibuat otomatis." }],
    wajib: [], jangan: [],
    mirip: [{ t: "Cabang & Gudang di ERP", j: "Lokasi pemegang stok (gudang/toko), berbeda dengan cabang member." }],
    kata: "data cabang provinsi kode cabang pimpinan warna foto ruang kota",
  },
  {
    id: "hak-akses", route: "/admin/hak-akses", menu: "Hak Akses", kelompok: "Pengaturan (superadmin)", icon: "mdi-shield-account", peran: "superadmin",
    ringkas: "Hak tambahan per akun (Mutasi per gerbong) dan izin/larangan kemampuan (dokumen, approve, chat).",
    fungsi: "Jabatan = posisi; hak akses = apa yang boleh dikerjakan.",
    syarat: ["Khusus superadmin."],
    alur: [],
    tombol: [
      { t: "Beri hak / Cabut", j: "Menu terkait muncul/hilang di akun itu; akun mendapat lonceng; tercatat di Riwayat." },
      { t: "Izinkan / Larang akun ini", j: "Pengecualian satu akun dari aturan jabatan; akun mendapat lonceng." },
      { t: "Aturan dokumen per jabatan", j: "Langsung berlaku untuk semua akun berjabatan itu (tanpa lonceng)." },
    ],
    wajib: [], jangan: ["Akun pemegang hak / cakupan gerbong tidak bisa dihapus sebelum haknya dicabut."],
    mirip: [{ t: "Role & Hak Akses di ERP", j: "Hak karyawan ERP, terpisah dari aplikasi member." }],
    kata: "hak akses izin larang mutasi gerbong kemampuan dokumen approve chat",
  },
  {
    id: "dokumentasi", route: "/admin/uplouddocumentasi", menu: "Uploud Documentasi", kelompok: "Pengaturan (superadmin)", icon: "mdi-file-document", peran: "superadmin",
    ringkas: "Menyimpan foto/video dokumentasi kegiatan.",
    fungsi: "Arsip file kegiatan untuk diunduh kembali.", syarat: ["Khusus superadmin."], alur: [],
    tombol: [{ t: "Hapus", j: "File hilang permanen." }], wajib: [], jangan: [], mirip: [],
    kata: "dokumentasi foto video kegiatan upload",
  },
  {
    id: "jabatan", route: "/admin/jabatan", menu: "Master Jabatan (halaman lama)", kelompok: "Pengaturan (superadmin)", icon: "mdi-badge-account", peran: "superadmin",
    ringkas: "Halaman lama data jabatan. Tidak ada di menu; jabatan diatur di Tipe Akun.",
    fungsi: "Sisa halaman lama.", syarat: ["Tidak ada di menu sidebar."], alur: [], tombol: [], wajib: [],
    jangan: ["Jangan dipakai — aturan jabatan & No ID ada di Tipe Akun."], mirip: [{ t: "Tipe Akun", j: "Tempat jabatan yang dipakai sistem." }],
    kata: "master jabatan lama",
  },
  {
    id: "masterheaders", route: "/admin/masterheaders", menu: "Ruang Kota / Gambar Header (halaman lama)", kelompok: "Pengaturan (superadmin)", icon: "mdi-city", peran: "superadmin",
    ringkas: "Halaman lama gambar header per cabang. Tidak ada di menu; foto cabang diatur di Data Cabang.",
    fungsi: "Sisa halaman lama.", syarat: ["Tidak ada di menu sidebar."], alur: [], tombol: [], wajib: [], jangan: [],
    mirip: [{ t: "Data Cabang", j: "Foto Ruang Kota cabang." }],
    kata: "ruang kota gambar header lama",
  },

  // ===================== BANTUAN =====================
  {
    id: "panduan", route: "/admin/panduan", menu: "Panduan", kelompok: "Bantuan", icon: "mdi-book-open-page-variant", peran: "semua",
    ringkas: "Langkah klik setiap menu, istilah, dan cara memasang aplikasi Android/iPhone.",
    fungsi: "Panduan = langkah-langkah. Juga tombol ❓ Cara Pakai di header untuk halaman yang sedang dibuka.",
    syarat: ["Isi disaring sesuai peran Anda."], alur: [], tombol: [], wajib: [], jangan: [],
    mirip: [{ t: "Kamus Menu", j: "Fungsi, syarat, dan akibat setiap menu." }],
    kata: "panduan cara pakai langkah tutorial bantuan",
  },
  {
    id: "kamus", route: "/admin/kamus", menu: "Kamus Menu", kelompok: "Bantuan", icon: "mdi-book-search-outline", peran: "semua",
    ringkas: "Penjelasan setiap menu: fungsi, syarat supaya muncul, alur, akibat tombol, dan pertanyaan “bagaimana”.",
    fungsi: "Bedanya dengan Panduan: Panduan = langkah klik; Kamus = untuk apa, apa yang harus ada dulu, dan apa akibatnya ke data, RO, stok, dan lonceng. Tombol 📖 Kamus di header langsung membuka entri halaman yang sedang dibuka.",
    syarat: ["Entri khusus superadmin / pemegang hak tidak tampil untuk member lain."],
    alur: ["Ketik kata sehari-hari di kotak cari (mis. “ro belum masuk”, “belanja ke upline”) → buka entri."],
    tombol: [], wajib: [], jangan: [],
    mirip: [{ t: "Panduan", j: "Langkah-langkah." }],
    kata: "kamus menu penjelasan fungsi syarat akibat cari menu",
  },

  // ===================== CARA MELAKUKAN =====================
  {
    id: "cara-menu-tidak-muncul", route: null, menu: "Kenapa menu atau tombol tidak muncul?", kelompok: "Cara Melakukan", icon: "mdi-help-circle", peran: "semua",
    ringkas: "Menu tergantung peran (superadmin/member), hak tambahan, aturan jabatan, dan status toko online.",
    fungsi: "Beberapa menu dan tombol hanya untuk peran atau keadaan tertentu.",
    syarat: [
      "Menu khusus superadmin: Verifikasi ID, Tipe Akun, Data Cabang, Excel Struktur, Hak Akses, Uploud Documentasi.",
      "Mutasi Jabatan: superadmin atau akun yang diberi hak Mutasi (Hak Akses).",
      "Tombol Tambah Dokumen: hak dokumen menurut jabatan / pengecualian akun.",
      "Approve pendaftar: Anda harus upline tercatat & haknya tidak dilarang.",
      "Belanja/Pesanan Saya/Toko Saya bertanda “Segera”: toko online belum dibuka (atau layanan toko sedang dibatasi).",
    ],
    alur: [], tombol: [], wajib: [], jangan: [], mirip: [],
    kata: "menu tidak ada tombol tidak muncul hilang tidak bisa segera hadir hak",
  },
  {
    id: "cara-akun-belum-aktif", route: null, menu: "Kenapa akun saya / downline belum aktif?", kelompok: "Cara Melakukan", icon: "mdi-help-circle", peran: "semua",
    ringkas: "Akun aktif setelah semua upline approve lalu superadmin Aktivasi.",
    fungsi: "Pendaftaran berjalan: daftar → approve setiap upline → Aktivasi superadmin.",
    syarat: [
      "Cek Akun Belum Approve: masih menunggu upline mana? Ditunda/Ditolak beserta alasannya.",
      "Setelah semua upline approve, akun masuk “Siap diverifikasi” di Verifikasi ID.",
      "Aktivasi bisa ditolak sistem bila rentang No ID penuh atau upline belum punya No ID.",
    ],
    alur: [], tombol: [], wajib: [], jangan: [], mirip: [],
    kata: "akun belum aktif tidak bisa login pendaftar belum diverifikasi menunggu approve",
  },
  {
    id: "cara-ro-belum-masuk", route: null, menu: "Kenapa RO saya belum masuk / belum dihitung?", kelompok: "Cara Melakukan", icon: "mdi-help-circle", peran: "semua",
    ringkas: "RO dihitung dari dokumen yang sudah disetujui akhir; RO belanja online dikirim ERP sesuai aturan toko.",
    fungsi: "RO = Range Point dokumen (Input Data) atau jumlah botol belanja online.",
    syarat: [
      "Dokumen input manual: harus disetujui Regional → MVO → superadmin (Document Belum Approve).",
      "Belanja online: RO tercatat saat pesanan lunas atau saat diterima (aturan toko di ERP), lalu dikirim ke aplikasi member dalam ±1 menit sebagai dokumen “Belanja online …”. Bila aturan toko memakai persetujuan, dokumen itu juga menunggu approve.",
      "Penjualan di Toko Saya › Kasir tidak menambah RO.",
      "Retur yang disetujui mengurangi RO.",
    ],
    alur: [], tombol: [], wajib: [], jangan: [], mirip: [],
    kata: "ro belum masuk ro tidak bertambah repeat order belum dihitung dokumen belanja online",
  },
  {
    id: "cara-belanja-ke-upline", route: null, menu: "Bagaimana belanja ke upline (bukan ke gudang)?", kelompok: "Cara Melakukan", icon: "mdi-help-circle", peran: "semua",
    ringkas: "Pilih Belanja ke: Upline di menu Belanja — tampil bila admin mengizinkan dan upline punya stok.",
    fungsi: "Upline menjual dari stok miliknya lewat Toko Saya.",
    syarat: [
      "Aturan sumber barang di ERP mengizinkan akun/jabatan Anda belanja ke upline.",
      "Upline Anda akun aktif (kursi kosong dilewati ke upline terdekat) dan punya stoknya.",
      "Bayar: Transfer (rekening upline) atau Tunai langsung ke upline. Tidak ada tagihan.",
    ],
    alur: ["Belanja → Belanja ke: Upline → keranjang → Buat Pesanan → upline memproses di Toko Saya → Anda menekan Pesanan Diterima."],
    tombol: [], wajib: [], jangan: [], mirip: [],
    kata: "belanja ke upline beli ke upline stok upline toko saya",
  },
  {
    id: "cara-retur", route: null, menu: "Bagaimana mengembalikan barang (retur)?", kelompok: "Cara Melakukan", icon: "mdi-help-circle", peran: "semua",
    ringkas: "Pesanan Saya → pesanan Diterima → Ajukan retur; penjual menyetujui setelah barang kembali.",
    fungsi: "Retur memutar balik stok, uang/tagihan, dan RO.",
    syarat: [
      "Pesanan sudah Diterima dan masih dalam batas hari retur.",
      "Barangnya masih ada di Stok Saya (belum dijual).",
    ],
    alur: ["Ajukan (jumlah, alasan, foto) → kirim/bawa barang ke penjual → penjual Setujui/Tolak."],
    tombol: [], wajib: [], jangan: ["Jangan menjual barang yang sedang diretur."], mirip: [],
    kata: "retur kembalikan barang refund barang rusak tukar",
  },
  {
    id: "cara-pindah-upline", route: null, menu: "Bagaimana mengganti jabatan, upline, atau cabang?", kelompok: "Cara Melakukan", icon: "mdi-help-circle", peran: "semua",
    ringkas: "Jabatan & upline akun aktif hanya lewat Mutasi Jabatan / Excel Struktur; cabang lewat Verifikasi ID → Edit (dengan syarat).",
    fungsi: "Perubahan posisi memengaruhi No ID downline, jadi harus lewat alat yang menyesuaikan semuanya.",
    syarat: [
      "Hubungi superadmin atau pemegang hak Mutasi gerbong Anda.",
      "Pindah cabang: hanya akun tanpa downline dan tanpa dokumen yang menunggu persetujuan.",
      "No. Member (BP-xxxxx) tidak pernah berubah; RO & dokumen tetap atas nama Anda.",
    ],
    alur: [], tombol: [], wajib: [], jangan: [], mirip: [],
    kata: "ganti jabatan naik jabatan pindah upline ganti upline pindah cabang mutasi",
  },
  {
    id: "cara-lupa-password", route: null, menu: "Bagaimana kalau lupa password?", kelompok: "Cara Melakukan", icon: "mdi-help-circle", peran: "semua",
    ringkas: "Login → Lupa Password? → link reset lewat WhatsApp (berlaku 60 menit).",
    fungsi: "Reset password mandiri.",
    syarat: ["Nomor WhatsApp di data akun benar. Bila tidak sampai, hubungi superadmin untuk mengganti password lewat Verifikasi ID → Edit."],
    alur: [], tombol: [], wajib: [], jangan: [], mirip: [],
    kata: "lupa password reset password tidak bisa login whatsapp",
  },
];

/** Entri untuk path halaman (atau null). */
export function cariKamus(path) {
  const p = (path || "").toLowerCase().replace(/\/+$/, "");
  return KAMUS.find((k) => k.route && k.route.toLowerCase() === p) || null;
}

/**
 * Pencarian kata sehari-hari: skor judul 10, kata kunci 6, ringkas 4, isi 2;
 * entri yang memuat SEMUA kata didahulukan. Kata umum dibuang.
 */
const KATA_UMUM = new Set(["cara", "bagaimana", "kenapa", "di", "ke", "dan", "yang", "saya", "apa", "untuk", "dari", "tidak", "bisa", "mau"]);
export function cariKamusTeks(q, daftar) {
  const kata = String(q || "").toLowerCase().split(/\s+/).filter((k) => k && !KATA_UMUM.has(k));
  if (!kata.length) return [];
  const isiTeks = (e) => [e.fungsi, ...(e.syarat || []), ...(e.alur || []), ...(e.tombol || []).map((x) => `${x.t} ${x.j}`), ...(e.wajib || []), ...(e.jangan || [])]
    .map((x) => (typeof x === "string" ? x : x?.teks || "")).join(" ").toLowerCase();
  return daftar
    .map((e) => {
      const judul = e.menu.toLowerCase(), kk = (e.kata || "").toLowerCase(), rk = e.ringkas.toLowerCase(), isi = isiTeks(e);
      let skor = 0, semua = true;
      for (const k of kata) {
        const s = (judul.includes(k) ? 10 : 0) + (kk.includes(k) ? 6 : 0) + (rk.includes(k) ? 4 : 0) + (isi.includes(k) ? 2 : 0);
        if (!s) semua = false;
        skor += s;
      }
      return { e, skor: skor + (semua ? 100 : 0) };
    })
    .filter((x) => x.skor > 0)
    .sort((a, b) => b.skor - a.skor)
    .map((x) => x.e);
}
