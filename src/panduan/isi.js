/**
 * Isi panduan cara pakai — dipakai menu "Panduan" dan tombol "Cara Pakai" di header.
 *
 * WAJIB diperbarui setiap ada menu baru atau perubahan cara pakai (lihat CLAUDE.md).
 *
 * Struktur satu panduan:
 *   id        : kunci unik (dipakai di URL /admin/panduan?menu=<id>)
 *   route     : path halaman (dicocokkan tanpa membedakan huruf besar/kecil)
 *   menu      : nama menu seperti di sidebar
 *   icon      : ikon mdi
 *   peran     : "semua" | "superadmin" (siapa yang bisa membuka menu ini)
 *   ringkas   : satu kalimat kegunaan
 *   kegunaan  : paragraf penjelasan
 *   langkah   : [{ judul, isi: [teks | { teks, peran }] }]  → peran "superadmin" disembunyikan dari member
 *   tips      : [teks | { teks, peran }]
 *   tanya     : [{ t, j, peran? }]  (pertanyaan umum)
 *   gambar    : [{ src, ket }]  (gambar contoh di /public/panduan, data nama sudah disamarkan)
 */

export const MULAI_CEPAT = {
  judul: "Mulai cepat",
  ringkas: "Alur akun member dari daftar sampai aktif, dan istilah penting di aplikasi.",
  alur: [
    { judul: "1. Daftar", isi: "Calon member membuka halaman Login → Daftar sekarang, mengisi data diri, memilih jabatan, cabang, dan upline (upline), lalu mengunggah foto profil." },
    { judul: "2. Verifikasi", isi: "Superadmin memeriksa data di menu Verifikasi ID lalu menekan Aktivasi. Saat itu No ID dibuat otomatis dan akun bisa dipakai untuk login." },
    { judul: "3. Approval upline", isi: "Upline menyetujui akun downline-nya di menu Akun Belum Approve." },
    { judul: "4. Input dokumen RO", isi: "Dokumen repeat order (RO) diinput di menu Input Data, lalu disetujui upline dan superadmin di menu Document Belum Approve." },
  ],
  istilah: [
    { t: "No ID", j: "Nomor member yang dibuat otomatis oleh sistem saat akun diverifikasi. Contoh: TM01 (Top Management), M01 (MVO), R01 (Regional), B01 (Founder), B51 (GM), B51-01 (Supplier), B51-01-01 (Distributor), B51-01-01-01 (Reseller). Supplier ke bawah mengikuti No ID upline-nya." },
    { t: "Upline", j: "Akun di atas Anda dalam struktur jaringan. Upline langsung = satu jenjang tepat di atas Anda." },
    { t: "Downline", j: "Akun di bawah Anda dalam struktur jaringan. Downline langsung = satu jenjang tepat di bawah Anda." },
    { t: "RO (Repeat Order)", j: "Nilai pembelian ulang yang dicatat lewat dokumen di menu Input Data (kolom Range Point)." },
    { t: "Rating Star", j: "Nilai bintang 0–8 pada dokumen star; dijumlahkan untuk peringkat di Dashboard → Star." },
    { t: "Urutan jabatan", j: "Top Management → MVO → Regional → Founder → GM → Supplier → Distributor → Reseller." },
  ],
  akses: [
    { t: "Login", j: "Masukkan username dan password di halaman Login. Akun yang belum diverifikasi superadmin belum bisa masuk." },
    { t: "Lupa password", j: "Klik Lupa Password? di halaman Login, isi username atau nomor WhatsApp. Link reset dikirim lewat WhatsApp dan berlaku 60 menit." },
    { t: "Menu di HP", j: "Menu utama ada di bar bawah. Menu lain ada di tombol Lainnya. Foto profil di kanan atas berisi Profil Saya, Info Cabang, Muat Ulang Data, dan Keluar." },
    { t: "Kembali ke Dashboard", j: "Tekan tulisan 🏠 Dashboard di kepala halaman (kotak hitam bertuliskan nama menu) di bagian atas setiap halaman." },
    { t: "Menggulir daftar & tabel", j: "Daftar akun dan tabel digulir di dalam kotaknya sendiri (geser di dalam kotak). Kolom cari, judul kolom, dan tombol halaman berikutnya tetap terlihat, jadi tidak perlu menggulir halaman sampai bawah." },
    { t: "Menyaring daftar", j: "Di Input Data, Verifikasi ID, Akun Belum Approve, Document Belum Approve, dan Mutasi ada baris filter yang sama: kolom cari (nama / No ID), pilihan Cabang, dan tombol jabatan beserta jumlahnya (TM, MVO, Regional, FO, GM, Supplier, Dist, Reseller). Klik tombol jabatan untuk menampilkan jabatan itu saja, klik Semua untuk kembali." },
    { t: "Butuh bantuan di suatu halaman?", j: "Tekan tombol ❓ Cara Pakai di bagian atas untuk melihat panduan halaman yang sedang dibuka." },
  ],
};

export const PANDUAN = [
  {
    id: "dashboard",
    route: "/admin/dashboard",
    menu: "Live Performance",
    icon: "mdi-view-dashboard",
    peran: "semua",
    ringkas: "Ringkasan jumlah akun, dokumen, bintang, dan pertumbuhan RO.",
    kegunaan:
      "Halaman pertama setelah login. Menampilkan angka-angka penting jaringan: jumlah akun, dokumen, bintang, peringkat, dan grafik pertumbuhan RO. Member melihat data cabangnya sendiri, superadmin melihat seluruh cabang.",
    langkah: [
      {
        judul: "Membaca ringkasan",
        isi: [
          "Pilih tab di bagian atas: Overview, Akun, Dokumen, MVO/Wilayah, Star, atau Growth.",
          "Kartu angka di tiap tab bisa diklik untuk melihat rinciannya.",
          "Tab Akun: Jabatan Akun (semua akun) dan Akun Terbaru (mendaftar pada periode tanggal) tampil sebagai daftar batang — panjang batang = banyaknya akun, di kanan jumlah dan persennya. Klik baris untuk melihat daftar akunnya.",
          "Tab MVO/Wilayah: daftar cabang dengan jumlah akun dan persennya. Klik baris cabang untuk melihat daftar akunnya.",
        ],
      },
      {
        judul: "Menyaring berdasarkan tanggal",
        isi: [
          "Isi Tanggal Mulai dan Tanggal Selesai, lalu tekan Filter.",
          "Tekan tombol putar (↻) untuk kembali ke periode bawaan.",
        ],
      },
      {
        judul: "Mengunduh data",
        isi: ["Pada tabel yang punya tombol Export, tekan Export untuk mengunduh file Excel."],
      },
      {
        judul: "Riwayat persetujuan akun",
        isi: [
          "Di tab Akun, bagian bawah Riwayat Persetujuan Akun menampilkan jumlah akun yang Disetujui upline, Diaktivasi, Ditunda, dan Ditolak pada periode tanggal yang dipilih.",
          "Di bawahnya ada 20 riwayat terbaru: aksi, nama & No ID akun, siapa yang melakukan, waktu, dan alasan (untuk tunda/tolak).",
        ],
      },
    ],
    tips: [
      "Tab Akun: hijau = sudah approve, oranye = masih pending.",
      "Tab Star: peringkat berdasarkan jumlah Rating Star dari dokumen yang sudah disetujui.",
      "Tab Growth: grafik total RO per bulan.",
    ],
    tanya: [
      { t: "Kenapa angka saya berbeda dengan cabang lain?", j: "Member hanya melihat data cabangnya sendiri. Superadmin melihat semua cabang." },
      { t: "Angka belum muncul / masih 0?", j: "Tunggu beberapa detik sampai data selesai dimuat, atau periksa rentang tanggal filter." },
    ],
  },
  {
    id: "input-data",
    route: "/admin/mvo",
    menu: "Input Data",
    icon: "mdi-clipboard-text-outline",
    peran: "semua",
    ringkas: "Daftar akun jaringan beserta dokumen RO / star masing-masing.",
    kegunaan:
      "Tempat melihat data akun dan mencatat dokumen repeat order (RO) atau dokumen star untuk setiap akun. Dokumen yang ditambahkan akan masuk antrean persetujuan di menu Document Belum Approve.",
    langkah: [
      {
        judul: "Mencari akun",
        isi: [
          "Ketik nama, kode, atau No ID di kolom pencarian.",
          "Di HP, ketuk kartu akun untuk melihat datanya. Di desktop, tekan tombol Detail (ⓘ) di kolom kanan tabel.",
        ],
      },
      {
        judul: "Menambah dokumen",
        isi: [
          "Buka Detail akun → tab Dokumen → Tambah Dokumen.",
          "Pilih Tipe Dokumen: Dokumen Star (dengan Rating Star, Range Point/RO, dan tanggal) atau Dokumen Biasa (hanya file).",
          "Untuk Dokumen Star: pilih Rating Star (0–8), isi Range Point (nilai RO), dan Tanggal Input Dokumen.",
          "Isi Nama File, unggah file (PDF/JPG/PNG, maksimal 5 MB), lalu simpan.",
          "Dokumen baru berstatus menunggu persetujuan.",
        ],
      },
      {
        judul: "Mengubah atau menghapus dokumen",
        isi: [
          "Di daftar dokumen, tekan Edit untuk mengubah atau Hapus untuk menghapus. Pada dokumen yang sudah disetujui final, tombol ini hanya muncul untuk superadmin.",
          "Dokumen yang diubah kembali berstatus menunggu persetujuan.",
        ],
      },
      {
        judul: "Melihat downline",
        isi: ["Buka Detail akun → tab Downline untuk melihat seluruh downline akun tersebut."],
      },
      {
        judul: "Fitur superadmin",
        peran: "superadmin",
        isi: [
          { teks: "Excel: mengunduh seluruh data akun.", peran: "superadmin" },
          { teks: "Template lalu Import Dokumen: mengisi banyak dokumen sekaligus dari file Excel (nama MVO, Rating Star, Range Point, tanggal).", peran: "superadmin" },
          { teks: "Approve dokumen (persetujuan akhir) bisa juga dilakukan dari detail akun.", peran: "superadmin" },
          { teks: "Hapus akun dilakukan di menu Verifikasi ID (tombol Hapus). Dialognya menampilkan data terkait yang harus dibereskan dulu, mis. downline atau dokumen.", peran: "superadmin" },
        ],
      },
    ],
    tips: [
      "Yang bisa menambah, mengubah, dan menghapus dokumen: Superadmin, MVO, Regional, dan Founder — selain superadmin hanya untuk akun di jaringannya sendiri.",
      "Dokumen yang sudah disetujui final ikut dihitung di Star/RO, jadi hanya superadmin yang bisa mengubah atau menghapusnya (ada peringatan sebelum dihapus).",
      "Print pada detail akun menghasilkan formulir registrasi dalam bentuk PDF.",
      "Range Point inilah yang dihitung sebagai RO di Dashboard dan Saran RO.",
      "Kolom Distributor, Supplier, General Manager, Founder, Regional, MVO, dan TM menampilkan No ID dan nama upline sesuai Struktur Akun saat ini (ikut berubah setelah Mutasi). Di HP, jalurnya tampil ringkas di bawah nama, mis. M01 › R03 › B02 › B78.",
    ],
    tanya: [
      { t: "Kenapa tombol Tambah Dokumen tidak bisa dipakai?", j: "Hanya Superadmin, MVO, Regional, dan Founder yang bisa menambah dokumen." },
      { t: "Dokumen saya belum dihitung di Dashboard?", j: "Dokumen baru dihitung setelah disetujui. Cek statusnya di menu Document Belum Approve." },
    ],
    gambar: [
      { src: "/panduan/input-data-detail.jpg", ket: "Detail akun: tab Dokumen dan tombol Tambah Dokumen" },
    ],
  },
  {
    id: "verifikasi",
    route: "/admin/user",
    menu: "Verifikasi ID",
    icon: "mdi-account",
    peran: "superadmin",
    ringkas: "Memeriksa pendaftar baru, mengaktifkan akun, dan mengelola data user.",
    kegunaan:
      "Semua pendaftar baru masuk ke sini dengan status belum aktif. Superadmin memeriksa datanya lalu menekan Aktivasi. Saat diaktivasi, sistem membuat No ID otomatis sesuai jabatan dan No ID upline-nya.",
    langkah: [
      {
        judul: "Mengaktifkan pendaftar baru",
        isi: [
          "Tekan tombol Belum aktif untuk melihat pendaftar yang menunggu verifikasi (angka di tombol = jumlahnya). Saring juga per jabatan atau cabang, atau cari nama / username / No ID.",
          "Akun yang ditunda/ditolak di menu Akun Belum Approve diberi label Ditunda / Ditolak di kolom Aktivasi (arahkan kursor untuk melihat alasannya). Akun tetap bisa diperbaiki dan diaktifkan.",
          "Periksa data dan foto profilnya (tombol Edit untuk melihat lengkap).",
          "Tekan Aktivasi. Pesan yang muncul menampilkan No ID baru akun tersebut.",
          "Bila aktivasi ditolak dengan pesan tentang No ID (misalnya rentang nomor penuh atau upline belum punya No ID), perbaiki dulu upline-nya atau rentang nomor di menu Tipe Akun.",
        ],
      },
      {
        judul: "Menambah user secara manual",
        isi: [
          "Tekan Tambah User, isi data pribadi, pilih Jabatan, Cabang, dan upline secara berurutan (MVO → Regional → Founder → GM → Supplier → Distributor), lalu simpan.",
          "No ID tidak perlu diisi — dibuat otomatis saat Aktivasi.",
          "Untuk Top Management, pilih jabatan TOP MANAGEMENT lalu isi Judul Jabatan (mis. Head Office) dan Singkatan (mis. HO). Singkatan dipakai sebagai label downline, contoh: MVO HO.",
        ],
      },
      {
        judul: "Mengubah atau menghapus user",
        isi: [
          "Tekan Edit untuk mengubah data diri, username, atau password.",
          "No ID bisa diubah manual bila benar-benar perlu; sistem menolak bila formatnya tidak sesuai jabatan atau sudah dipakai akun lain.",
          "Jabatan dan upline akun yang sudah aktif tidak bisa diubah di sini — gunakan menu Mutasi Jabatan.",
          "Hapus hanya bisa untuk akun yang tidak punya downline dan dokumen.",
        ],
      },
    ],
    tips: [
      "Setiap perubahan No ID tercatat di riwayat.",
      "Kolom DISTRIBUTOR sampai TOP MANAGEMENT menampilkan No ID dan nama upline. Untuk akun yang belum diaktivasi, isinya diambil dari pilihan upline saat registrasi.",
      "Akun yang belum diaktivasi tidak bisa login.",
      "Hapus akun bersifat permanen. Sebelum menghapus, sistem memeriksa data terkait: downline, dokumen, persetujuan yang pernah diberikan, dan riwayat Mutasi. Bila masih ada, dialog Hapus menampilkan apa yang harus dibereskan dulu dan tombol Ya, hapus tidak muncul.",
      "Pindah cabang akun yang sudah aktif hanya bisa bila akun itu belum punya downline dan tidak ada dokumen yang menunggu persetujuan. Bila berhasil, kode akunnya ikut berganti (mis. RESELLER-MDN-001 → RESELLER-BDG-357).",
    ],
    tanya: [
      { t: "Kenapa No ID tidak bisa diisi saat Tambah User?", j: "No ID dibuat otomatis saat Aktivasi supaya selalu urut, sesuai jabatan, dan tidak ganda." },
      { t: "Kenapa jabatan akun aktif tidak bisa diubah?", j: "Perubahan jabatan/upline memengaruhi No ID downline-nya, jadi harus lewat Mutasi Jabatan yang menyesuaikan semuanya sekaligus." },
    ],
  },
  {
    id: "tipe-akun",
    route: "/admin/mvotype",
    menu: "Tipe Akun",
    icon: "mdi-format-list-bulleted-type",
    peran: "superadmin",
    ringkas: "Daftar jabatan beserta level, bintang, dan aturan pembuatan No ID.",
    kegunaan:
      "Mengatur jenis jabatan (Top Management, MVO, Regional, Founder, GM, Supplier, Distributor, Reseller) dan cara sistem membuat No ID untuk tiap jabatan.",
    langkah: [
      {
        judul: "Mengubah aturan No ID",
        isi: [
          "Tekan Edit (✎) pada jabatan.",
          "Di bagian Aturan No ID pilih cara penomoran: Nomor urut (TM01, M01, R01), Rentang nomor (mis. Founder B01–B50, GM B51–B150), atau Turunan dari No ID upline (Supplier ke bawah).",
          "Untuk rentang, isi Awalan, Nomor awal, dan Nomor akhir, lalu tekan Update.",
        ],
      },
      {
        judul: "Menambah jabatan",
        isi: ["Tekan Tambah Tipe Akun, isi Name, Level, Rating Bintang, Jabatan, dan Aturan No ID."],
      },
      {
        judul: "Membaca kolom Jenjang",
        isi: [
          "Jenjang = urutan jabatan dalam struktur: 0 · Puncak (TM), 1 MVO, 2 Regional, 3 Founder, 4 GM, 5 Supplier, 6 Distributor, 7 Reseller.",
          "Angka jenjang juga dipakai sistem sebagai nomor kolom upline, approval, dan aturan No ID, jadi jangan diubah untuk jabatan yang sudah berjalan.",
          "SUPERADMIN bertanda Di luar struktur karena bukan bagian dari jenjang jabatan.",
        ],
      },
    ],
    tips: [
      "Jabatan yang sudah dipakai akun: Name, Level, cara penomoran, dan awalan No ID terkunci (ada keterangan di form Edit). Jabatan, rating bintang, dan rentang nomor tetap bisa diubah.",
      "Tipe akun tidak bisa dihapus dari aplikasi karena data akun, kode akun, dan No ID bergantung padanya.",
      "Rentang dengan awalan yang sama tidak boleh bertumpuk (mis. Founder B01–B50 dan GM B51–B150).",
      "Rentang tidak bisa dipersempit bila ada No ID sah yang jadi di luar rentang baru — pindahkan akunnya dulu lewat Mutasi Jabatan.",
      "Kolom Kode No ID di tabel menampilkan ringkasan aturan tiap jabatan.",
    ],
    tanya: [
      { t: "Aktivasi gagal karena rentang penuh?", j: "Perlebar rentang jabatan tersebut di sini, lalu ulangi Aktivasi." },
    ],
  },
  {
    id: "approval-akun",
    route: "/admin/mvobelumapprove",
    menu: "Akun Belum Approve",
    icon: "mdi-account-alert",
    peran: "semua",
    ringkas: "Pendaftar baru menunggu persetujuan: approve, tunda, atau tolak (dengan alasan).",
    kegunaan:
      "Menampilkan akun baru yang belum aktif. Upline menyetujui (Approve) downline-nya; superadmin meneruskan ke Verifikasi ID untuk mengaktifkan. Akun bermasalah bisa Ditunda atau Ditolak dengan alasan, dan semuanya tercatat di Dashboard › Akun › Riwayat Persetujuan Akun.",
    langkah: [
      {
        judul: "Mencari & menyaring",
        isi: [
          "Tombol status: Perlu tindakan (bawaan: menunggu + ditunda), Ditunda, Ditolak, Semua — angka di tombol = jumlahnya.",
          "Cari nama / username / No ID, atau saring dengan tombol jabatan dan pilihan Cabang.",
          "Setiap akun menampilkan jabatan, No ID, cabang, status, dan upline langsungnya (No ID · nama). Di desktop ada juga kolom Jalur upline (mis. M05 › R09 › B09 › B96).",
          "Di HP, ketuk kartu untuk melihat data lengkap dan tombol aksinya.",
        ],
      },
      {
        judul: "Menyetujui (upline)",
        isi: ["Tekan Approve lalu konfirmasi. Tombol ini hanya muncul untuk upline yang tercatat di akun tersebut."],
      },
      {
        judul: "Meneruskan ke Verifikasi ID",
        peran: "superadmin",
        isi: ["Tekan Verifikasi — menu Verifikasi ID terbuka dengan akun itu langsung tercari, lalu aktifkan dari sana."],
      },
      {
        judul: "Menunda atau menolak",
        isi: [
          "Tekan Tunda (mis. data perlu dilengkapi) atau Tolak (mis. data ganda / salah upline), isi Alasan, lalu Ya, tunda / Ya, tolak.",
          "Akun Ditunda tetap di daftar dengan label oranye. Akun Ditolak hilang dari Perlu tindakan, tetap belum aktif, dan di Verifikasi ID tampil label Ditolak beserta alasannya.",
          "Salah tekan? Tekan Pulihkan untuk mengembalikan akun ke status Menunggu.",
        ],
      },
    ],
    tips: [
      "Yang boleh Approve/Tunda/Tolak: superadmin dan upline yang tercatat di akun tersebut.",
      "Superadmin melihat seluruh akun; upline hanya downline-nya.",
      "Riwayat (siapa, kapan, alasan) bisa dilihat di Dashboard › Akun.",
    ],
    tanya: [
      { t: "Kenapa daftarnya kosong?", j: "Belum ada downline yang menunggu persetujuan Anda, atau tombol status sedang di Ditunda/Ditolak — pilih Semua." },
      { t: "Muncul pesan 'Anda bukan upline dari akun ini'?", j: "Akun tersebut berada di bawah upline lain. Hanya upline sebenarnya (atau superadmin) yang bisa menyetujui, menunda, atau menolak." },
      { t: "Akun yang ditolak bisa diaktifkan?", j: "Bisa. Superadmin tetap bisa memperbaiki data dan mengaktifkannya di Verifikasi ID, atau tekan Pulihkan di menu ini." },
    ],
    gambar: [{ src: "/panduan/approval-akun.jpg", ket: "Filter status & jabatan, kartu akun dengan status, dan struktur upline (No ID · nama)" }],
  },
  {
    id: "data-cabang",
    route: "/admin/provinsi",
    menu: "Data Cabang",
    icon: "mdi-domain",
    peran: "superadmin",
    ringkas: "Daftar cabang beserta pimpinan, warna, dan foto cabang.",
    kegunaan:
      "Mengelola cabang (provinsi). Foto Ruang Kota menjadi latar dan ikon cabang di bagian atas aplikasi untuk member cabang tersebut; warna dipakai pada grafik.",
    langkah: [
      {
        judul: "Menambah atau mengubah cabang",
        isi: [
          "Tekan Tambah Data Cabang, atau Edit (✎) pada cabang yang ada.",
          "Isi Code Cabang (mis. MDN), Nama Cabang, Pimpinan, dan Warna (HEX, mis. #E6B422).",
          "Unggah Foto Ruang Kota dan Foto MVO (JPG/PNG), lalu simpan.",
        ],
      },
    ],
    tips: [
      "Code Cabang yang sudah dipakai akun terkunci (form Edit menampilkan jumlah akunnya), karena dipakai di kode akun (mis. GM-MDN-003), data MVO, dan filter dashboard. Nama, pimpinan, warna, dan foto tetap bisa diubah.",
      "Cabang tidak bisa dihapus dari aplikasi.",
    ],
    tanya: [],
  },
  {
    id: "struktur",
    route: "/admin/strukturhierarkiakun",
    menu: "Struktur Akun",
    icon: "mdi-sitemap",
    peran: "semua",
    ringkas: "Pohon jaringan dari Top Management/MVO sampai Reseller.",
    kegunaan:
      "Melihat susunan jaringan dalam bentuk pohon: siapa upline siapa, jumlah downline, dan total jaringan setiap akun.",
    langkah: [
      {
        judul: "Menjelajah pohon",
        isi: [
          "Setiap baris menampilkan jabatan dan No ID (warna emas) di atas, lalu nama di bawahnya.",
          "Tekan panah ( › ) di samping nama untuk membuka downline-nya, atau Buka Semua / Tutup Semua. Di HP kedua tombol ini berupa ikon panah di samping jumlah akun.",
          "Daftar akun digulir di dalam kotaknya sendiri, jadi kartu total dan kolom cari tetap terlihat di atas.",
          "Angka di kanan nama adalah jumlah seluruh downline-nya.",
          "Klik nama untuk melihat detail akun: No ID, upline (nama dan No ID), jumlah downline langsung, dan total jaringan. Di HP detail tampil satu layar penuh; tekan ✕ di kanan atas untuk kembali ke pohon.",
        ],
      },
      {
        judul: "Mencari dan menyaring",
        isi: [
          "Ketik nama atau No ID di kolom Cari nama / No ID (mis. B78-04 untuk melihat jaringan Supplier B78-04).",
          "Cabang yang berisi hasil pencarian terbuka otomatis dan hasilnya disorot.",
          "Kartu di atas menampilkan total akun per jabatan (TM, MVO, Regional, Founder, GM, Supplier, Distributor, Reseller). Klik kartu untuk menyorot jabatan tersebut; klik lagi untuk membatalkan.",
        ],
      },
    ],
    tips: [
      "Label seperti MVO HO berarti MVO tersebut berada di bawah Top Management Head Office.",
      "No ID Supplier ke bawah mengikuti No ID upline-nya, jadi dari No ID saja sudah terlihat jalurnya: B78-04-01-04 = Reseller di bawah Distributor B78-04-01.",
    ],
    tanya: [{ t: "Akun saya tidak muncul?", j: "Hanya akun yang sudah aktif (diverifikasi) yang tampil di pohon." }],
  },
  {
    id: "approval-dokumen",
    route: "/admin/documentbelumapprove",
    menu: "Document Belum Approve",
    icon: "mdi-file-document-alert",
    peran: "semua",
    ringkas: "Persetujuan dokumen RO/star oleh upline lalu superadmin.",
    kegunaan:
      "Dokumen yang diinput di Input Data menunggu persetujuan di sini: pertama oleh upline (MVO, lalu Regional), kemudian persetujuan akhir oleh superadmin. Hanya dokumen yang sudah disetujui akhir yang dihitung di Dashboard dan Saran RO.",
    langkah: [
      {
        judul: "Menyetujui dokumen (upline)",
        isi: [
          "Cari dokumen berdasarkan nama atau kode akun.",
          "Lihat file dokumen dengan tombol 👁 / Preview.",
          "Tekan Approve Document lalu konfirmasi.",
        ],
      },
      {
        judul: "Persetujuan akhir (superadmin)",
        peran: "superadmin",
        isi: [
          { teks: "Tekan tombol persetujuan superadmin (🛡) pada dokumen yang sudah siap.", peran: "superadmin" },
          { teks: "Excel: mengunduh daftar dokumen yang belum disetujui.", peran: "superadmin" },
        ],
      },
    ],
    tips: [
      "Upline hanya bisa menyetujui dokumen milik downline-nya sendiri.",
      "Kolom KODE = kode akun pemilik dokumen, No ID di sebelahnya. Kolom MVO dan Regional menampilkan No ID dan nama upline yang menyetujui.",
      "Dokumen yang diubah setelah disetujui akan kembali menunggu persetujuan.",
    ],
    tanya: [{ t: "Tombol approve tidak muncul?", j: "Dokumen tersebut bukan milik downline Anda pada jenjang Anda, atau sudah Anda setujui." }],
    gambar: [{ src: "/panduan/approval-dokumen.jpg", ket: "Daftar dokumen menunggu persetujuan" }],
  },
  {
    id: "mutasi",
    route: "/admin/mutasi",
    menu: "Mutasi Jabatan",
    icon: "mdi-account-switch",
    peran: "superadmin",
    ringkas: "Menaikkan, menurunkan, atau memindahkan upline member beserta downline-nya.",
    kegunaan:
      "Satu-satunya cara mengubah jabatan atau upline akun yang sudah aktif. Sistem otomatis menyesuaikan No ID orang tersebut dan seluruh downline-nya, kode akun, struktur upline, serta dokumen yang masih menunggu persetujuan. Ada juga tab Saran RO dan Riwayat.",
    langkah: [
      {
        judul: "1. Pilih member",
        isi: [
          "Di tab Mutasi Baru, daftar semua member langsung tampil (urut dari jabatan tertinggi). Tidak perlu ingat nama: saring dengan tombol jabatan (TM, MVO, … Reseller) dan pilihan Cabang, lalu gulir daftarnya.",
          "Bisa juga mengetik nama, No ID, atau username di kolom cari (mis. B78-04 untuk melihat Supplier B78-04 beserta downline-nya).",
          "Setiap baris menampilkan jabatan, No ID, cabang, nama, upline, dan jumlah downline langsung. Ketuk baris untuk memilih.",
          "Salah pilih? Tekan Ganti member untuk kembali ke daftar.",
        ],
      },
      {
        judul: "2. Tentukan posisi baru",
        isi: [
          "Pilih Jabatan baru (sama dengan sekarang bila hanya pindah upline).",
          "Upline baru awalnya terisi upline sekarang. Tekan Ganti upline untuk membuka daftar calon upline — langsung tampil tanpa mengetik, cabang yang sama dengan member ditaruh paling atas.",
          "Bila jabatan diganti, daftar calon upline otomatis terbuka. Daftar hanya berisi upline dengan jenjang yang sah, dan bukan downline orang itu sendiri.",
          "Top Management dan MVO boleh tanpa upline: tekan Tanpa upline.",
          "No ID: pilih Otomatis (No ID dipertahankan bila masih sesuai, atau nomor kosong berikutnya) atau Pilih No ID untuk menentukan kursi tujuan, mis. B136 atau B52-01. Daftar nomor mengikuti Jabatan baru — untuk naik/turun ke kursi jabatan lain, ganti Jabatan baru dulu.",
          "Supplier ke bawah: daftar No ID berisi kursi downline dan rekan se-upline member. Ketik No ID atau nama untuk mencari kursi lain. Nomor kosong muncul setelah Upline baru dipilih.",
          "Bila No ID tujuan masih dipakai orang lain, kursi tidak boleh bertabrakan. Orang yang dipindah menempati kursi itu (jabatan, No ID, dan upline kursi tersebut), lalu tentukan ke mana pemegang lamanya pindah. Berlaku untuk semua jabatan, dari TM sampai Reseller.",
          "Tukar posisi: pemegang lama menempati kursi lama orang yang dipindah.",
          "… pindah ke kursi lain: isi kotak kursi barunya — Jabatan baru, No ID (Otomatis atau Pilih No ID), dan Upline baru. Bila No ID yang dipilih kosong, kursi lama orang yang dipindah menjadi kosong. Bila No ID itu dipegang orang ketiga, terjadi rotasi: orang ketiga menempati kursi lama orang yang dipindah.",
        ],
      },
      {
        judul: "3. Pilih downline yang ikut",
        isi: [
          "Centang = downline langsung ikut pindah bersama seluruh timnya (bawaan: semua ikut). Tombol Centang semua / Kosongkan semua mempercepat pilihan.",
          "Bila mengambil kursi yang terisi, ada daftar terpisah untuk downline pemegang lama (dan orang ketiga pada rotasi). Yang tidak dicentang tetap di kursinya — mereka pindah ke orang yang kini menempati kursi itu, No ID-nya tidak berubah.",
          "Downline orang yang dipindah yang tidak dicentang menunggu di kursi lama yang kosong. Pilih Upline penampung (opsional) untuk memindahkan mereka langsung ke upline lain.",
          "Downline yang jenjangnya tidak cocok dengan jabatan baru otomatis tidak dicentang (mis. Supplier yang naik menjadi GM tidak bisa membawa Distributor).",
          "Selama masih ada kursi kosong yang punya downline, muncul peringatan \"Kursi … kosong, masih ada … downline\" dan Simpan Mutasi belum bisa ditekan.",
        ],
      },
      {
        judul: "Kursi kosong: Pilih pengganti atau Pindahkan",
        isi: [
          "Bila ada kursi yang ditinggal tapi masih punya downline, pratinjau menampilkan kotak merah \"Kursi … kosong\" beserta nama downline-nya.",
          "Pilih pengganti: langkah yang sedang diisi masuk ke kotak Rencana mutasi, lalu pilih siapa yang mengisi kursi itu — boleh dari jaringan atau cabang mana saja. Jabatan dan upline-nya mengikuti kursi; cabang dan kode cabangnya tetap.",
          "Pengganti juga membawa atau meninggalkan downline-nya sendiri. Bila kursinya jadi kosong, muncul kursi kosong berikutnya: ulangi Pilih pengganti sampai tidak ada kursi kosong.",
          "Pindahkan ke upline lain: pilih upline baru untuk semua downline kursi itu (beserta timnya). No ID mereka menyesuaikan upline baru.",
          "Salah langkah? Tekan × pada langkah terakhir di kotak Rencana mutasi.",
        ],
      },
      {
        judul: "4. Periksa pratinjau lalu simpan",
        isi: [
          "Pratinjau menampilkan No ID dan upline lama → baru untuk setiap akun yang terdampak, beserta ringkasan jumlah No ID yang berubah.",
          "Perbaiki dulu bila ada peringatan kuning.",
          "Isi Catatan (alasan mutasi), tekan Simpan Mutasi (atau Simpan Rencana bila lebih dari satu langkah), lalu Ya, simpan.",
          "Tombol simpan baru aktif bila tidak ada peringatan kuning dan tidak ada kursi kosong yang masih punya downline.",
          "Mau memindahkan beberapa orang sekaligus? Tekan Tambah langkah: langkah ini masuk ke kotak Rencana mutasi dan isian dikosongkan untuk langkah berikutnya. Pratinjau selalu menampilkan hasil seluruh rencana.",
          "Orang yang sudah diubah di langkah sebelumnya diberi tanda \"Sudah diubah di rencana\"; langkah berikutnya melanjutkan dari posisi barunya. Daftar No ID juga mengikuti rencana.",
          "Boleh juga bertahap: simpan setelah satu langkah, lalu buat mutasi berikutnya.",
        ],
      },
      {
        judul: "Saran RO",
        isi: [
          "Tab Saran RO menampilkan member yang layak naik atau perlu turun berdasarkan RO dokumen yang sudah disetujui.",
          "Isi target per jabatan di Atur target per jabatan: periode (bulan), basis (Pribadi atau Tim = termasuk downline), Naik bila RO ≥, dan Turun bila RO <. Kosongkan bila jabatan tidak perlu dinilai.",
          "Tekan Proses pada baris saran untuk membuka Mutasi Baru dengan member dan jabatan tujuan sudah terisi.",
        ],
      },
      {
        judul: "Riwayat",
        isi: [
          "Tab Riwayat berisi semua mutasi. Kolom Jenis menampilkan Pindah, Mengisi kursi, Tukar posisi, atau Pindahkan downline.",
          "Mutasi yang disimpan sebagai rencana bertanda \"Rencana #… · langkah 1/3\". Klik barisnya untuk melihat seluruh langkah rencana itu dan perubahan setiap akun.",
        ],
      },
    ],
    tips: [
      "Founder dan GM pindah upline: No ID tidak berubah. Supplier ke bawah: No ID mengikuti No ID upline barunya (nomor belakang dipertahankan bila masih kosong).",
      "Saran RO hanya saran — sistem tidak mengubah jabatan secara otomatis.",
      "Seluruh langkah rencana tersimpan dalam satu proses: berhasil semua atau tidak sama sekali. Setiap langkah tercatat terpisah di Riwayat.",
    ],
    tanya: [
      { t: "Kenapa upline yang saya cari tidak ada di daftar?", j: "Upline harus berjenjang sah untuk jabatan baru (Supplier ke bawah tepat satu jenjang di bawah upline-nya) dan tidak boleh downline orang yang dipindah." },
      { t: "B02 mau pindah ke B03 yang sudah terisi?", j: "Pilih member B02, Pilih No ID → B03, lalu aktifkan Tukar posisi. Pemegang B03 otomatis menempati B02. Atur downline masing-masing: ikut orangnya, atau tetap di posisi." },
      { t: "B52-01 naik ke B52, tapi GM B52 tidak mau turun?", j: "Setelah memilih No ID B52, pilih \"… pindah ke kursi lain\". Isi kursi barunya, mis. No ID Otomatis (nomor GM kosong berikutnya) dengan upline yang sama. Kursi B52-01 jadi kosong: pilih Upline penampung untuk downline-nya." },
      { t: "Bisakah beberapa mutasi disimpan sekaligus?", j: "Bisa. Selesaikan langkah pertama, tekan Tambah langkah, lalu isi langkah berikutnya. Semua langkah tersimpan bersama dengan Simpan Rencana; bila satu gagal, tidak ada yang tersimpan." },
      { t: "Kursi B52-01 kosong, siapa yang menggantikan?", j: "Tekan Pilih pengganti pada kotak kursi itu, lalu pilih orangnya, mis. Distributor B52-01-04 dinaikkan. Bila kursi Distributor itu jadi kosong, pilih pengganti lagi sampai tidak ada kursi kosong, lalu Simpan Rencana." },
      { t: "Supplier B52-01 naik menggantikan GM B52?", j: "Pilih member B52-01, Jabatan baru GM, Pilih No ID → B52, lalu aktifkan Tukar posisi. GM lama otomatis menempati kursi B52-01. Downline yang jenjangnya tidak cocok otomatis tetap di posisi, jadi hanya 2 No ID yang berubah." },
      { t: "Kenapa downline tidak bisa dicentang saat tukar posisi?", j: "Jenjangnya tidak cocok dengan jabatan baru orang itu (mis. GM naik menjadi Founder: Supplier-nya tidak bisa ikut karena Supplier harus di bawah GM). Downline tersebut otomatis tetap di posisi." },
      { t: "Muncul 'Tidak ada perubahan'?", j: "Jabatan dan upline baru sama dengan sekarang. Untuk memindahkan satu downline saja, pilih downline tersebut sebagai member yang dimutasi." },
    ],
    gambar: [
      { src: "/panduan/mutasi-pratinjau.jpg", ket: "Mutasi Baru: downline yang ikut dan pratinjau perubahan upline / No ID" },
      { src: "/panduan/mutasi-saran.jpg", ket: "Saran RO: target per jabatan dan daftar saran" },
    ],
  },
  {
    id: "dokumentasi",
    route: "/admin/uplouddocumentasi",
    menu: "Uploud Documentasi",
    icon: "mdi-file-document",
    peran: "superadmin",
    ringkas: "Menyimpan foto dan video dokumentasi kegiatan.",
    kegunaan: "Tempat mengunggah dan menyimpan dokumentasi (foto/video kegiatan) agar bisa diunduh kembali.",
    langkah: [
      {
        judul: "Mengunggah dokumentasi",
        isi: [
          "Tekan tombol tambah, pilih Tipe File, isi Keterangan, lalu pilih file (JPG, PNG, atau MP4, maksimal 50 MB).",
          "Simpan. Dokumentasi muncul di daftar.",
        ],
      },
      {
        judul: "Mengelola dokumentasi",
        isi: ["Gunakan Download untuk mengunduh, Edit untuk mengganti keterangan/file, dan Hapus untuk menghapus."],
      },
    ],
    tips: ["File yang dihapus tidak bisa dikembalikan."],
    tanya: [],
  },
  {
    id: "store",
    route: "/admin/store",
    menu: "Store",
    icon: "mdi-store",
    peran: "semua",
    ringkas: "Daftar toko resmi Baba Parfume beserta lokasinya.",
    kegunaan: "Melihat toko resmi: nama, pemilik, alamat, cabang, foto, dan rute ke lokasi lewat peta.",
    langkah: [
      {
        judul: "Melihat toko",
        isi: [
          "Cari nama toko di kolom pencarian.",
          "Buka detail untuk melihat foto toko, lalu tekan Rute ke Toko untuk membuka Google Maps.",
        ],
      },
      {
        judul: "Mengelola toko (superadmin)",
        peran: "superadmin",
        isi: [
          { teks: "Tekan Tambah Store Baba Parfume, isi Nama Toko, Owner Toko, Alamat, Cabang, Link Maps, dan unggah foto (JPG/PNG).", peran: "superadmin" },
          { teks: "Gunakan Edit atau Hapus pada toko yang ada.", peran: "superadmin" },
        ],
      },
    ],
    tips: ["Link Maps diisi dengan tautan bagikan dari Google Maps."],
    tanya: [],
  },
  {
    id: "chat",
    route: "/admin/chat",
    menu: "Chat",
    icon: "mdi-chat",
    peran: "semua",
    ringkas: "Pesan antar member dan grup cabang.",
    kegunaan: "Mengirim pesan ke sesama member atau grup. Fitur chat sedang dalam pengembangan, sehingga mungkin belum selalu tersambung.",
    langkah: [
      {
        judul: "Mengirim pesan",
        isi: ["Pilih percakapan atau grup di daftar kiri, ketik pesan di kolom bawah, lalu kirim."],
      },
    ],
    tips: ["Bila pesan tidak terkirim, coba muat ulang halaman."],
    tanya: [],
  },
  {
    id: "profil",
    route: "/admin/profil",
    menu: "Profil Saya",
    icon: "mdi-account-circle",
    peran: "semua",
    ringkas: "Melihat data diri, mengganti foto profil, dan mengganti password.",
    kegunaan: "Dibuka dari foto profil di kanan atas → Profil Saya. Menampilkan data akun Anda, status akun, dan No ID.",
    langkah: [
      {
        judul: "Mengganti foto profil",
        isi: ["Tekan ikon kamera pada foto, pilih foto (JPG/PNG, maksimal 2 MB)."],
      },
      {
        judul: "Mengganti password",
        isi: [
          "Tekan tombol ganti password (ikon gembok).",
          "Isi Password Lama, Password Baru, dan Konfirmasi Password Baru, lalu simpan.",
          "Setelah berhasil, Anda keluar dari semua perangkat dan perlu login ulang.",
        ],
      },
    ],
    tips: ["No ID, jabatan, dan cabang tidak bisa diubah sendiri. Hubungi superadmin bila ada data yang salah."],
    tanya: [],
  },
];

/** Panduan untuk path halaman (atau null). */
export function cariPanduan(path) {
  const p = (path || "").toLowerCase().replace(/\/+$/, "");
  return PANDUAN.find((g) => g.route.toLowerCase() === p) || null;
}

/** Apakah user ini boleh melihat panduan/elemen dengan peran tertentu. */
export function bolehLihat(peran, isSuperadmin) {
  return !peran || peran === "semua" || (peran === "superadmin" && isSuperadmin);
}
