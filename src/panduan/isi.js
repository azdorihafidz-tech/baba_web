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
    { judul: "1. Daftar", isi: "Calon member membuka halaman Login → Daftar sekarang, mengisi data diri, memilih jabatan, cabang, dan atasan (upline), lalu mengunggah foto profil." },
    { judul: "2. Verifikasi", isi: "Superadmin memeriksa data di menu Verifikasi ID lalu menekan Aktivasi. Saat itu No ID dibuat otomatis dan akun bisa dipakai untuk login." },
    { judul: "3. Approval upline", isi: "Upline menyetujui akun bawahannya di menu Akun Belum Approve." },
    { judul: "4. Input dokumen RO", isi: "Dokumen repeat order (RO) diinput di menu Input Data, lalu disetujui upline dan superadmin di menu Document Belum Approve." },
  ],
  istilah: [
    { t: "No ID", j: "Nomor anggota yang dibuat otomatis oleh sistem saat akun diverifikasi. Contoh: TM01 (Top Management), M01 (MVO), R01 (Regional), B01 (Founder), B51 (GM), B51-01 (Supplier), B51-01-01 (Distributor), B51-01-01-01 (Reseller). Supplier ke bawah mengikuti No ID atasannya." },
    { t: "Upline / atasan", j: "Akun satu jenjang di atas Anda dalam struktur jaringan." },
    { t: "Downline / bawahan", j: "Akun di bawah Anda dalam struktur jaringan." },
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
          "Di daftar dokumen, tekan Edit untuk mengubah atau Hapus untuk menghapus.",
          "Dokumen yang diubah kembali berstatus menunggu persetujuan.",
        ],
      },
      {
        judul: "Melihat downline",
        isi: ["Buka Detail akun → tab Downline untuk melihat seluruh bawahan akun tersebut."],
      },
      {
        judul: "Fitur superadmin",
        peran: "superadmin",
        isi: [
          { teks: "Excel: mengunduh seluruh data akun.", peran: "superadmin" },
          { teks: "Template lalu Import Dokumen: mengisi banyak dokumen sekaligus dari file Excel (nama MVO, Rating Star, Range Point, tanggal).", peran: "superadmin" },
          { teks: "Approve dokumen (persetujuan akhir) bisa juga dilakukan dari detail akun.", peran: "superadmin" },
          { teks: "Hapus akun dari kolom Actions. Akun yang masih punya downline atau dokumen tidak bisa dihapus.", peran: "superadmin" },
        ],
      },
    ],
    tips: [
      "Yang bisa menambah, mengubah, dan menghapus dokumen: Superadmin, MVO, Regional, dan Founder.",
      "Print pada detail akun menghasilkan formulir registrasi dalam bentuk PDF.",
      "Range Point inilah yang dihitung sebagai RO di Dashboard dan Saran RO.",
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
      "Semua pendaftar baru masuk ke sini dengan status belum aktif. Superadmin memeriksa datanya lalu menekan Aktivasi. Saat diaktivasi, sistem membuat No ID otomatis sesuai jabatan dan No ID atasannya.",
    langkah: [
      {
        judul: "Mengaktifkan pendaftar baru",
        isi: [
          "Cari nama pendaftar di kolom pencarian.",
          "Periksa data dan foto profilnya (tombol Edit untuk melihat lengkap).",
          "Tekan Aktivasi. Pesan yang muncul menampilkan No ID baru akun tersebut.",
          "Bila aktivasi ditolak dengan pesan tentang No ID (misalnya rentang nomor penuh atau atasan belum punya No ID), perbaiki dulu atasannya atau rentang nomor di menu Tipe Akun.",
        ],
      },
      {
        judul: "Menambah user secara manual",
        isi: [
          "Tekan Tambah User, isi data pribadi, pilih Jabatan, Cabang, dan atasan secara berurutan (MVO → Regional → Founder → GM → Supplier → Distributor), lalu simpan.",
          "No ID tidak perlu diisi — dibuat otomatis saat Aktivasi.",
          "Untuk Top Management, pilih jabatan TOP MANAGEMENT lalu isi Judul Jabatan (mis. Head Office) dan Singkatan (mis. HO). Singkatan dipakai sebagai label bawahan, contoh: MVO HO.",
        ],
      },
      {
        judul: "Mengubah atau menghapus user",
        isi: [
          "Tekan Edit untuk mengubah data diri, username, atau password.",
          "No ID bisa diubah manual bila benar-benar perlu; sistem menolak bila formatnya tidak sesuai jabatan atau sudah dipakai akun lain.",
          "Jabatan dan atasan akun yang sudah aktif tidak bisa diubah di sini — gunakan menu Mutasi Jabatan.",
          "Hapus hanya bisa untuk akun yang tidak punya downline dan dokumen.",
        ],
      },
    ],
    tips: [
      "Setiap perubahan No ID tercatat di riwayat.",
      "Akun yang belum diaktivasi tidak bisa login.",
    ],
    tanya: [
      { t: "Kenapa No ID tidak bisa diisi saat Tambah User?", j: "No ID dibuat otomatis saat Aktivasi supaya selalu urut, sesuai jabatan, dan tidak ganda." },
      { t: "Kenapa jabatan akun aktif tidak bisa diubah?", j: "Perubahan jabatan/atasan memengaruhi No ID anggotanya, jadi harus lewat Mutasi Jabatan yang menyesuaikan semuanya sekaligus." },
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
          "Di bagian Aturan No ID pilih cara penomoran: Nomor urut (TM01, M01, R01), Rentang nomor (mis. Founder B01–B50, GM B51–B150), atau Turunan dari No ID atasan (Supplier ke bawah).",
          "Untuk rentang, isi Awalan, Nomor awal, dan Nomor akhir, lalu tekan Update.",
        ],
      },
      {
        judul: "Menambah jabatan",
        isi: ["Tekan Tambah Tipe Akun, isi Name, Level, Rating Bintang, Jabatan, dan Aturan No ID."],
      },
    ],
    tips: [
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
    ringkas: "Upline menyetujui akun downline yang menunggu persetujuannya.",
    kegunaan:
      "Menampilkan akun bawahan yang menunggu persetujuan Anda sebagai upline. Setiap jenjang upline memberi persetujuannya sendiri.",
    langkah: [
      {
        judul: "Menyetujui akun bawahan",
        isi: [
          "Cari nama bawahan di kolom pencarian.",
          "Di HP, ketuk kartu untuk melihat data dan struktur upline-nya. Di desktop, lihat langsung di tabel.",
          "Tekan tombol Approve (✔) lalu konfirmasi.",
          "Status per jenjang menampilkan nama upline yang sudah menyetujui, atau Belum Approve.",
        ],
      },
    ],
    tips: [
      "Anda hanya bisa menyetujui akun yang memang bawahan Anda pada jenjang tersebut.",
      "Superadmin melihat seluruh akun.",
    ],
    tanya: [
      { t: "Kenapa daftarnya kosong?", j: "Belum ada bawahan yang menunggu persetujuan Anda, atau akun Anda bukan upline langsung pada jenjang itu." },
      { t: "Muncul pesan 'Anda bukan upline dari akun ini'?", j: "Akun tersebut berada di bawah upline lain. Hanya upline sebenarnya yang bisa menyetujui." },
    ],
    gambar: [{ src: "/panduan/approval-akun.jpg", ket: "Kartu akun bawahan dan struktur upline-nya" }],
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
    tips: ["Code Cabang dipakai di banyak tempat (kode akun, filter dashboard). Hindari mengubah code cabang yang sudah dipakai."],
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
      "Melihat susunan jaringan dalam bentuk pohon: siapa atasan siapa, jumlah bawahan, dan total jaringan setiap akun.",
    langkah: [
      {
        judul: "Menjelajah pohon",
        isi: [
          "Setiap baris menampilkan jabatan dan No ID (warna emas) di atas, lalu nama di bawahnya.",
          "Tekan panah ( › ) di samping nama untuk membuka bawahannya, atau Buka Semua / Tutup Semua. Di HP kedua tombol ini berupa ikon panah di samping jumlah akun.",
          "Daftar akun digulir di dalam kotaknya sendiri, jadi kartu total dan kolom cari tetap terlihat di atas.",
          "Angka di kanan nama adalah jumlah seluruh bawahannya.",
          "Klik nama untuk melihat detail akun: No ID, atasan (nama dan No ID), jumlah bawahan langsung, dan total jaringan. Di HP detail tampil satu layar penuh; tekan ✕ di kanan atas untuk kembali ke pohon.",
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
      "No ID Supplier ke bawah mengikuti No ID atasannya, jadi dari No ID saja sudah terlihat jalurnya: B78-04-01-04 = Reseller di bawah Distributor B78-04-01.",
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
      "Upline hanya bisa menyetujui dokumen milik bawahannya sendiri.",
      "Dokumen yang diubah setelah disetujui akan kembali menunggu persetujuan.",
    ],
    tanya: [{ t: "Tombol approve tidak muncul?", j: "Dokumen tersebut bukan milik bawahan Anda pada jenjang Anda, atau sudah Anda setujui." }],
    gambar: [{ src: "/panduan/approval-dokumen.jpg", ket: "Daftar dokumen menunggu persetujuan" }],
  },
  {
    id: "mutasi",
    route: "/admin/mutasi",
    menu: "Mutasi Jabatan",
    icon: "mdi-account-switch",
    peran: "superadmin",
    ringkas: "Menaikkan, menurunkan, atau memindahkan atasan member beserta anggotanya.",
    kegunaan:
      "Satu-satunya cara mengubah jabatan atau atasan akun yang sudah aktif. Sistem otomatis menyesuaikan No ID orang tersebut dan seluruh anggotanya, kode akun, struktur upline, serta dokumen yang masih menunggu persetujuan. Ada juga tab Saran RO dan Riwayat.",
    langkah: [
      {
        judul: "1. Pilih member",
        isi: [
          "Di tab Mutasi Baru, daftar semua member langsung tampil (urut dari jabatan tertinggi). Tidak perlu ingat nama: saring dengan tombol jabatan (TM, MVO, … Reseller) dan pilihan Cabang, lalu gulir daftarnya.",
          "Bisa juga mengetik nama, No ID, atau username di kolom cari (mis. B78-04 untuk melihat Supplier B78-04 beserta anggotanya).",
          "Setiap baris menampilkan jabatan, No ID, cabang, nama, atasan, dan jumlah anggota langsung. Ketuk baris untuk memilih.",
          "Salah pilih? Tekan Ganti member untuk kembali ke daftar.",
        ],
      },
      {
        judul: "2. Tentukan posisi baru",
        isi: [
          "Pilih Jabatan baru (sama dengan sekarang bila hanya pindah atasan).",
          "Atasan baru awalnya terisi atasan sekarang. Tekan Ganti atasan untuk membuka daftar calon atasan — langsung tampil tanpa mengetik, cabang yang sama dengan member ditaruh paling atas.",
          "Bila jabatan diganti, daftar calon atasan otomatis terbuka. Daftar hanya berisi atasan dengan jenjang yang sah, dan bukan anggota orang itu sendiri.",
          "Top Management dan MVO boleh tanpa atasan: tekan Tanpa atasan.",
        ],
      },
      {
        judul: "3. Pilih anggota yang ikut",
        isi: [
          "Centang = anggota langsung ikut pindah bersama seluruh timnya.",
          "Hilangkan centang untuk anggota yang tidak ikut, lalu pilih Atasan penampung untuk mereka.",
          "Anggota yang jenjangnya tidak cocok dengan jabatan baru otomatis tidak dicentang dan wajib ke penampung (mis. Supplier yang naik menjadi GM tidak bisa membawa Distributor).",
        ],
      },
      {
        judul: "4. Periksa pratinjau lalu simpan",
        isi: [
          "Pratinjau menampilkan No ID dan atasan lama → baru untuk setiap akun yang terdampak, beserta ringkasan jumlah No ID yang berubah.",
          "Perbaiki dulu bila ada peringatan kuning.",
          "Isi Catatan (alasan mutasi), tekan Simpan Mutasi, lalu Ya, simpan.",
        ],
      },
      {
        judul: "Saran RO",
        isi: [
          "Tab Saran RO menampilkan member yang layak naik atau perlu turun berdasarkan RO dokumen yang sudah disetujui.",
          "Isi target per jabatan di Atur target per jabatan: periode (bulan), basis (Pribadi atau Tim = termasuk bawahan), Naik bila RO ≥, dan Turun bila RO <. Kosongkan bila jabatan tidak perlu dinilai.",
          "Tekan Proses pada baris saran untuk membuka Mutasi Baru dengan member dan jabatan tujuan sudah terisi.",
        ],
      },
      {
        judul: "Riwayat",
        isi: ["Tab Riwayat berisi semua mutasi. Klik baris untuk melihat rincian perubahan setiap akun."],
      },
    ],
    tips: [
      "Founder dan GM pindah atasan: No ID tidak berubah. Supplier ke bawah: No ID mengikuti No ID atasan barunya (nomor belakang dipertahankan bila masih kosong).",
      "Saran RO hanya saran — sistem tidak mengubah jabatan secara otomatis.",
      "Semua mutasi tersimpan dalam satu proses: berhasil semua atau tidak sama sekali.",
    ],
    tanya: [
      { t: "Kenapa atasan yang saya cari tidak ada di daftar?", j: "Atasan harus berjenjang sah untuk jabatan baru (Supplier ke bawah tepat satu jenjang di bawah atasannya) dan tidak boleh anggota orang yang dipindah." },
      { t: "Muncul 'Tidak ada perubahan'?", j: "Jabatan dan atasan baru sama dengan sekarang. Untuk memindahkan satu anggota saja, pilih anggota tersebut sebagai member yang dimutasi." },
    ],
    gambar: [
      { src: "/panduan/mutasi-pratinjau.jpg", ket: "Mutasi Baru: anggota yang ikut, penampung, dan pratinjau perubahan No ID" },
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
