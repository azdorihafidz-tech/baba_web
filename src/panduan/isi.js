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
    { judul: "1. Daftar", isi: "Calon member membuka halaman Login → Daftar sekarang, mengisi data diri, memilih jabatan, cabang, dan upline (pilihan upline tampil sebagai No ID · Nama, mis. B70-04 · Budi Santoso), lalu mengunggah foto profil." },
    { judul: "2. Verifikasi", isi: "Superadmin memeriksa data di menu Verifikasi ID lalu menekan Aktivasi. Saat itu No ID dibuat otomatis dan akun bisa dipakai untuk login." },
    { judul: "3. Approval upline", isi: "Upline menyetujui akun downline-nya di menu Akun Belum Approve." },
    { judul: "4. Input dokumen RO", isi: "Dokumen repeat order (RO) diinput di menu Input Data, lalu disetujui upline dan superadmin di menu Document Belum Approve." },
  ],
  istilah: [
    { t: "Owner", j: "Puncak struktur, di atas Top Management. Hanya satu orang, No ID OW01. Akun tanpa upline (Top Management, juga MVO yang belum di bawah Top Management) berarti langsung di bawah Owner." },
    { t: "No ID", j: "Nomor member yang dibuat otomatis oleh sistem saat akun diverifikasi. Contoh: OW01 (Owner), TM01 (Top Management), M01 (MVO), R01 (Regional), B01 (Founder), B51 (GM), B51-01 (Supplier), B51-01-01 (Distributor), B51-01-01-01 (Reseller). Supplier ke bawah mengikuti No ID upline-nya." },
    { t: "No. Member", j: "Nomor tetap setiap akun, mis. BP-00284. Tidak pernah berubah walau No ID, jabatan, upline, atau cabang berubah lewat Mutasi, dan tidak pernah dipakai akun lain. No ID menunjukkan posisi (kursi) di struktur, No. Member menunjukkan orangnya. RO dan dokumen selalu tercatat atas nama orangnya, jadi tidak ikut pindah ke pengganti kursi. Lihat di Profil Saya, kolom No. Member di Input Data & Verifikasi ID, atau ketik BP-00284 di kolom cari." },
    { t: "Upline", j: "Akun di atas Anda dalam struktur jaringan. Upline langsung = satu jenjang tepat di atas Anda." },
    { t: "Downline", j: "Akun di bawah Anda dalam struktur jaringan. Downline langsung = satu jenjang tepat di bawah Anda." },
    { t: "RO (Repeat Order)", j: "Nilai pembelian ulang yang dicatat lewat dokumen di menu Input Data (kolom Range Point)." },
    { t: "Rating Star", j: "Nilai bintang 0–8 pada dokumen star; dijumlahkan untuk peringkat di Dashboard → Star." },
    { t: "Urutan jabatan", j: "Owner → Top Management → MVO → Regional → Founder → GM → Supplier → Distributor → Reseller." },
  ],
  akses: [
    { t: "Login", j: "Masukkan username dan password di halaman Login. Akun yang belum diverifikasi superadmin belum bisa masuk." },
    { t: "Lupa password", j: "Klik Lupa Password? di halaman Login, isi username atau nomor WhatsApp. Link reset dikirim lewat WhatsApp dan berlaku 60 menit." },
    { t: "Menu di HP", j: "Menu utama ada di bar bawah. Menu lain ada di tombol Lainnya. Foto profil di kanan atas berisi Profil Saya, Info Cabang, Muat Ulang Data, dan Keluar." },
    { t: "Kembali ke Dashboard", j: "Tekan tulisan 🏠 Dashboard di kepala halaman (kotak hitam bertuliskan nama menu) di bagian atas setiap halaman." },
    { t: "Menggulir daftar & tabel", j: "Daftar akun dan tabel digulir di dalam kotaknya sendiri (geser di dalam kotak). Kolom cari, judul kolom, dan tombol halaman berikutnya tetap terlihat, jadi tidak perlu menggulir halaman sampai bawah." },
    { t: "Menyaring daftar", j: "Di Input Data, Verifikasi ID, Akun Belum Approve, Document Belum Approve, dan Mutasi ada baris filter yang sama: kolom cari (nama / No ID), pilihan Cabang, dan tombol jabatan beserta jumlahnya (TM, MVO, Regional, FO, GM, Supplier, Dist, Reseller). Klik tombol jabatan untuk menampilkan jabatan itu saja, klik Semua untuk kembali. Di HP, Cabang, tombol status, dan tombol jabatan ada di dalam tombol ⚙ Saring di samping kolom cari: ketuk Saring, pilih, lalu Tampilkan hasil. Filter yang sedang aktif tampil di bawah kolom cari (mis. Belum aktif ✕, GM ✕); ketuk ✕ untuk menghapusnya, atau Hapus semua. Angka di tombol Saring = jumlah filter yang aktif." },
    { t: "Angka merah di menu", j: "Menunjukkan pekerjaan yang menunggu Anda. Chat: pesan baru. Akun Belum Approve: pendaftar yang belum Anda approve. Document Belum Approve: dokumen yang sedang giliran Anda setujui. Verifikasi ID (superadmin): akun yang semua uplinenya sudah approve. Di HP, angka menu yang tersimpan di Lainnya dijumlah di tombol Lainnya. Angka berkurang sendiri setelah pekerjaannya selesai." },
    { t: "Lonceng notifikasi 🔔", j: "Tombol lonceng di kanan atas berisi kabar untuk Anda; angka merahnya = notifikasi yang belum dibaca. Kabar baru juga muncul sebentar di atas layar (tekan Lihat) disertai bunyi “ting”; pesan chat baru berbunyi lebih lembut (tidak berbunyi untuk grup yang sedang dibuka). Bunyi hanya keluar selama aplikasi terbuka dan setelah Anda pernah mengetuk layar sekali. Matikan / nyalakan di bagian bawah panel lonceng: Suara notifikasi & chat (berlaku untuk HP/laptop itu saja). Ketuk satu notifikasi untuk langsung membuka halamannya, atau tekan Tandai semua dibaca. Isinya: pendaftar baru yang mencantumkan Anda sebagai upline, dokumen yang giliran Anda approve, akun Anda sudah aktif, downline baru sudah aktif, dokumen RO Anda disetujui, posisi Anda berubah lewat Mutasi Jabatan, downline langsung baru dari Mutasi, dan perubahan hak Anda di menu Hak Akses. Superadmin hanya menerima yang menunggu tindakannya: akun siap diverifikasi dan dokumen menunggu persetujuan akhir." },
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
          "Tab Akun: baris hitam paling atas di Jabatan Akun menampilkan Owner (nama dan No ID OW01). Owner tidak ikut dihitung sebagai akun member.",
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
          { teks: "Template lalu Import Dokumen: mengisi banyak dokumen sekaligus dari file Excel (No Member, No ID, Nama, Rating Star, Range Point, Tanggal Input). Akun dicari lewat No Member dulu, lalu No ID; Nama hanya dipakai bila tidak ada akun lain dengan nama sama. Baris yang gagal disebutkan nomornya beserta alasannya.", peran: "superadmin" },
          { teks: "Approve dokumen (persetujuan akhir) bisa juga dilakukan dari detail akun.", peran: "superadmin" },
          { teks: "Hapus akun dilakukan di menu Verifikasi ID (tombol Hapus). Dialognya menampilkan data terkait yang harus dibereskan dulu, mis. downline atau dokumen.", peran: "superadmin" },
        ],
      },
    ],
    tips: [
      "Dokumen hanya bisa dilihat untuk akun Anda sendiri dan downline Anda. Akun cabang yang sama tapi di luar jaringan Anda menampilkan keterangan \"Akun ini di luar jaringan Anda\", dan tombol Tambah Dokumen tidak aktif.",
      "Yang bisa menambah, mengubah, dan menghapus dokumen diatur superadmin di menu Hak Akses (awalnya: MVO, Regional, dan Founder). Selain superadmin hanya untuk akun di jaringannya sendiri. Akun tanpa hak ini tetap bisa melihat dokumen; tombol Tambah Dokumen tidak aktif dan ada keterangannya.",
      "Dokumen yang sudah disetujui final ikut dihitung di Star/RO, jadi hanya superadmin yang bisa mengubah atau menghapusnya (ada peringatan sebelum dihapus).",
      "Print pada detail akun menghasilkan formulir registrasi dalam bentuk PDF.",
      "Range Point inilah yang dihitung sebagai RO di Dashboard dan Saran RO.",
      "Kolom Distributor, Supplier, General Manager, Founder, Regional, MVO, dan TM menampilkan No ID dan nama upline sesuai Struktur Akun saat ini (ikut berubah setelah Mutasi). Di HP, jalurnya tampil ringkas di bawah nama, mis. M01 › R03 › B02 › B78.",
    ],
    tanya: [
      { t: "Kenapa tombol Tambah Dokumen tidak bisa dipakai?", j: "Akun Anda belum memiliki hak menambah dokumen (diatur superadmin di menu Hak Akses), atau akun yang dibuka di luar jaringan Anda." },
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
          "Tekan tombol Belum aktif untuk melihat pendaftar yang menunggu verifikasi (angka di tombol = jumlahnya). Saring juga per jabatan atau cabang, atau cari nama / username / No ID / No. Member (mis. BP-00284). Di HP, tombol-tombol ini ada di dalam ⚙ Saring.",
          "Tombol Siap diverifikasi = pendaftar yang semua uplinenya sudah approve (tidak termasuk yang ditolak). Jumlah ini juga tampil sebagai angka merah di menu Verifikasi ID.",
          "Akun yang ditunda/ditolak di menu Akun Belum Approve diberi label Ditunda / Ditolak di kolom Aktivasi (arahkan kursor untuk melihat alasannya). Akun tetap bisa diperbaiki dan diaktifkan.",
          "Periksa data dan foto profilnya (tombol Edit untuk melihat lengkap).",
          "Tekan Aktivasi. Pesan yang muncul menampilkan No ID baru akun tersebut.",
          "Bila aktivasi ditolak dengan pesan tentang No ID (misalnya rentang nomor penuh atau upline belum punya No ID), perbaiki dulu upline-nya atau rentang nomor di menu Tipe Akun.",
        ],
      },
      {
        judul: "Menambah user secara manual",
        isi: [
          "Tekan Tambah User, isi data pribadi, pilih Jabatan, Cabang, dan upline secara berurutan (MVO → Regional → Founder → GM → Supplier → Distributor), lalu simpan. Pilihan upline tampil sebagai No ID · Nama; kode akun (mis. SUPPLIER-MDN-016) tertulis kecil di bawahnya.",
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
      {
        judul: "Menjadikan akun superadmin sebagai member (mis. TM02)",
        isi: [
          "Akun superadmin tidak tampil di daftar Verifikasi ID dan tidak punya No ID, jadi tidak bisa ditempatkan di struktur.",
          "Tekan Akun superadmin di atas daftar. Semua akun superadmin tampil beserta statusnya.",
          "Pada akun yang dimaksud, tekan Jadikan member, pilih Jabatan (bawaan TOP MANAGEMENT) dan Cabang, lalu Simpan.",
          "Akun itu sekarang muncul di daftar dengan status belum aktif. Untuk Top Management, tekan Edit bila perlu mengisi Judul Jabatan (mis. CEO) dan Singkatan.",
          "Tekan Aktivasi. Sistem memberi nomor kosong terkecil, mis. TM02 bila kursi TM02 kosong. Bila nomor yang diinginkan masih dipakai akun lain, kosongkan dulu kursinya (hapus akun contoh, atau pindahkan lewat Mutasi Jabatan).",
        ],
      },
    ],
    tips: [
      "Bila salah satu upline di rantai pilihan sedang kursi kosong (dibiarkan kosong lewat Mutasi Jabatan), daftar pilihannya memuat “Kursi kosong · No ID (lewati)”. Pilih itu lalu lanjut pilih downline kursi tersebut. Upline langsung tidak boleh kursi kosong.",
      "Setiap perubahan No ID tercatat di riwayat.",
      "Setelah tombol Aktivasi ditekan, tombol itu berputar dan terkunci sampai proses selesai, jadi akun tidak bisa teraktivasi dua kali.",
      "Kode akun (mis. FO-BDG-007) yang pernah dipakai tidak akan diberikan lagi ke akun lain, walau pemiliknya sudah berganti kode karena Mutasi atau pindah cabang.",
      "Kolom DISTRIBUTOR sampai TOP MANAGEMENT menampilkan No ID dan nama upline. Untuk akun yang belum diaktivasi, isinya diambil dari pilihan upline saat registrasi.",
      "Akun yang belum diaktivasi tidak bisa login.",
      "Hapus akun bersifat permanen. Sebelum menghapus, sistem memeriksa data terkait: downline, dokumen, persetujuan yang pernah diberikan, dan riwayat Mutasi. Bila masih ada, dialog Hapus menampilkan apa yang harus dibereskan dulu dan tombol Ya, hapus tidak muncul.",
      "Pindah cabang akun yang sudah aktif hanya bisa bila akun itu belum punya downline dan tidak ada dokumen yang menunggu persetujuan. Bila berhasil, kode akunnya ikut berganti (mis. RESELLER-MDN-001 → RESELLER-BDG-357).",
    ],
    tanya: [
      { t: "Kenapa No ID tidak bisa diisi saat Tambah User?", j: "No ID dibuat otomatis saat Aktivasi supaya selalu urut, sesuai jabatan, dan tidak ganda." },
      { t: "Kenapa jabatan akun aktif tidak bisa diubah?", j: "Perubahan jabatan/upline memengaruhi No ID downline-nya, jadi harus lewat Mutasi Jabatan yang menyesuaikan semuanya sekaligus." },
      { t: "Ada orang yang tidak ditemukan di Verifikasi ID, padahal akunnya ada?", j: "Kemungkinan akunnya superadmin. Tekan Akun superadmin untuk melihatnya. Akun Owner dan akun yang sedang Anda pakai login tidak bisa dijadikan member. Setelah dijadikan member, hak superadmin akun itu hilang; hak tambahan bisa diberikan lewat menu Hak Akses." },
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
          "Jenjang = urutan jabatan dalam struktur: 0 · Di bawah Owner (TM), 1 MVO, 2 Regional, 3 Founder, 4 GM, 5 Supplier, 6 Distributor, 7 Reseller.",
          "Angka jenjang juga dipakai sistem sebagai nomor kolom upline, approval, dan aturan No ID, jadi jangan diubah untuk jabatan yang sudah berjalan.",
          "SUPERADMIN bertanda Di luar struktur karena bukan bagian dari jenjang jabatan.",
          "Baris hitam OWNER di atas tabel: Owner adalah puncak di atas Top Management, satu orang dengan No ID OW01. Owner bukan tipe akun, jadi tidak ada di tabel dan tidak bisa ditambah dari sini.",
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
          "Tombol status: Perlu tindakan (bawaan: menunggu + ditunda), Ditunda, Ditolak, Semua — angka di tombol = jumlahnya. Di HP, tombol status dan jabatan ada di dalam ⚙ Saring.",
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
      "Pendaftar yang rantai uplinenya melewati kursi kosong tidak menunggu approve pada level itu. Ia siap diverifikasi setelah semua upline yang ada orangnya approve.",
      "Yang boleh Approve/Tunda/Tolak: superadmin dan upline yang tercatat di akun tersebut, kecuali upline yang haknya dinonaktifkan superadmin di menu Hak Akses (muncul keterangan kuning dan tombolnya disembunyikan).",
      "Superadmin melihat seluruh akun; upline hanya downline-nya.",
      "Angka merah di menu Akun Belum Approve = pendaftar yang belum Anda approve (yang ditolak tidak dihitung). Angkanya berkurang setelah Anda approve atau tolak.",
      { teks: "Superadmin: angka merah ada di menu Verifikasi ID, yaitu akun yang semua uplinenya sudah approve dan tinggal diaktifkan.", peran: "superadmin" },
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
    ringkas: "Pohon jaringan dari Owner sampai Reseller.",
    kegunaan:
      "Melihat susunan jaringan dalam bentuk pohon: siapa upline siapa, jumlah downline, dan total jaringan setiap akun.",
    langkah: [
      {
        judul: "Menjelajah pohon",
        isi: [
          "Baris paling atas adalah Owner (No ID OW01). Di bawahnya Top Management, lalu MVO dan seterusnya. MVO yang belum di bawah Top Management langsung berada di bawah Owner.",
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
          "Kartu di atas menampilkan total akun per jabatan (Owner, TM, MVO, Regional, Founder, GM, Supplier, Distributor, Reseller). Klik kartu untuk menyorot jabatan tersebut; klik lagi untuk membatalkan.",
        ],
      },
    ],
    tips: [
      "Baris bertulisan “Kursi kosong — menunggu pengganti” adalah kursi yang dibiarkan kosong lewat Mutasi Jabatan. Downline-nya tetap di bawah kursi itu dengan No ID yang sama. Kursi kosong tidak dihitung di kartu jumlah maupun Total akun.",
      { teks: "Tombol Excel di kanan atas membuka menu Excel Struktur untuk mengunduh pohon ini sebagai file Excel.", peran: "superadmin" },
      { teks: "Nama Owner diubah di sini: klik baris OWNER di puncak pohon, lalu tekan Ubah nama Owner di panel detail. Akun Owner tidak tampil di Verifikasi ID.", peran: "superadmin" },
      "Label seperti MVO HO berarti MVO tersebut berada di bawah Top Management Head Office.",
      "Urutan di pohon: jabatan tertinggi dulu, lalu No ID dari angka terkecil (TM01, TM02, TM03, lalu M01, M02, …).",
      "No ID Supplier ke bawah mengikuti No ID upline-nya, jadi dari No ID saja sudah terlihat jalurnya: B78-04-01-04 = Reseller di bawah Distributor B78-04-01.",
    ],
    tanya: [
      { t: "Akun saya tidak muncul?", j: "Hanya akun yang sudah aktif (diverifikasi) yang tampil di pohon." },
      { t: "Kenapa upline Top Management tertulis Owner?", j: "Owner adalah puncak struktur. Semua akun tanpa upline berada langsung di bawah Owner." },
    ],
  },
  {
    id: "excel-struktur",
    route: "/admin/struktur-excel",
    menu: "Excel Struktur",
    icon: "mdi-microsoft-excel",
    peran: "superadmin",
    ringkas: "Unduh struktur akun sebagai Excel berbentuk pohon, ubah, lalu unggah & simpan.",
    kegunaan:
      "Seluruh struktur akun aktif dalam satu file Excel: urut dari Owner ke bawah, nama menjorok sesuai jenjang, dan baris bisa dilipat per tim. File yang sama menjadi template untuk mengubah struktur (kolom kuning BARU).",
    langkah: [
      {
        judul: "Mengunduh",
        isi: [
          "Pilih Cabang (bawaan Semua cabang). Upline dari cabang lain tetap dicantumkan dengan huruf abu-abu supaya bentuk pohonnya utuh.",
          "Bila hanya perlu satu tim, isi Tim dengan No ID atau No Member ketua tim (mis. B07 atau BP-00320).",
          "Tekan Unduh Excel. Nama file berisi tanggal & jam unduh, mis. Struktur-Akun-20261030-0915.xlsx.",
        ],
      },
      {
        judul: "Membaca file",
        isi: [
          "Sheet Struktur: No Member, Struktur (No ID · Nama), Jabatan, No ID, Upline, Cabang, Kode Akun, jumlah Downline (langsung) dan Tim (seluruh jaringan), serta Jalur (No ID dari atas, mis. M03 › R05 › B07).",
          "Warna kolom Struktur & Jabatan berbeda per jabatan. Upline bertanda ⚠ belum punya upline = data lama yang perlu dirapikan.",
          "Cari orang: Ctrl+F lalu ketik nama, No ID, atau No Member.",
          "Lihat satu tim: tombol saring di judul kolom Jalur (No ID) → Text Filters → Contains → ketik No ID ketua tim.",
          "Lipat / buka tim: tanda − / + di kiri nomor baris, atau angka 1–8 di pojok kiri atas untuk melihat sampai jenjang tertentu.",
          "Sheet Petunjuk berisi cara mengisi perubahan beserta contoh; sheet Daftar berisi pilihan jabatan & kode cabang.",
        ],
      },
      {
        judul: "Mengisi perubahan di Excel",
        isi: [
          "Isi hanya kolom kuning di baris akun yang berubah. Kolom yang kosong = tidak berubah.",
          "Jabatan BARU: pilih dari daftar. Upline BARU: tulis No ID upline yang sekarang (mis. M03) atau No Member-nya (mis. BP-00287). Tulis OWNER untuk TM/MVO yang langsung di bawah Owner.",
          "No ID BARU biasanya dikosongkan (diisi sistem). Isi bila orang itu menggantikan kursi orang lain, mis. pengganti Founder B07 cukup diisi B07: jabatan & upline otomatis mengikuti kursi B07.",
          "Downline yang barisnya tidak diubah: bila upline-nya hanya pindah upline, ikut pindah bersama timnya; bila upline-nya berganti jabatan, tetap di kursi lama dan menjadi downline penggantinya.",
          "Cabang BARU: hanya untuk akun tanpa downline dan tanpa dokumen yang belum di-approve.",
        ],
      },
      {
        judul: "Unggah dan periksa",
        isi: [
          "Simpan file Excel, lalu di bagian Unggah perubahan pilih file tersebut dan tekan Periksa.",
          "Bila ada masalah, setiap masalah ditampilkan dengan nomor barisnya di Excel (mis. Baris 754). Perbaiki di Excel, simpan, lalu unggah dan Periksa lagi.",
          "Bila tidak ada masalah, Pratinjau menampilkan setiap akun yang terdampak: Status, Jabatan, No ID, Upline, Cabang, dan Kode Akun lama → baru. Status Diubah = baris yang Anda isi, Mengisi kursi = pengganti kursi, Tetap di kursi = downline yang kini di bawah pengganti, Ikut upline = tim yang ikut pindah.",
          "Memeriksa tidak menyimpan apa pun.",
        ],
      },
      {
        judul: "Menyimpan",
        isi: [
          "Bila tidak ada masalah, muncul tombol Simpan … perubahan. Isi Catatan bila perlu (mis. Penataan struktur Oktober), tekan Simpan, lalu Simpan lagi di kotak konfirmasi.",
          "Semua baris disimpan sekaligus: bila satu saja gagal, tidak ada yang tersimpan. Jabatan, No ID, upline, kode akun, dan dokumen yang masih menunggu approval ikut disesuaikan, sama seperti Mutasi Jabatan.",
          "Akun yang berubah dan upline yang mendapat downline baru menerima notifikasi.",
          "Perubahan tercatat di menu Mutasi Jabatan › Riwayat dengan Jenis Import Excel (satu baris per akun yang Anda ubah). Tekan Lihat di Riwayat Mutasi untuk membukanya.",
          "Setelah disimpan, file tadi tidak berlaku lagi. Unduh ulang Excel terbaru sebelum mengubah lagi.",
        ],
      },
    ],
    tips: [
      "Kursi kosong tampil sebagai baris KURSI KOSONG (abu-abu, tanpa No Member). Baris itu tidak bisa diubah dan tidak bisa dipakai sebagai Upline BARU. Untuk mengisinya, tulis No ID kursi itu di No ID BARU pada baris penggantinya.",
      "Kolom kuning (Jabatan BARU, Upline BARU, No ID BARU, Cabang BARU) adalah tempat mengisi perubahan. Kosong = tidak berubah.",
      "Maksimal 250 baris diubah per unggahan. Perubahan besar bisa dibagi beberapa kali (unduh ulang file terbaru setiap kali selesai menyimpan).",
      "Jangan mengubah kolom No Member: kolom ini pengenal tetap setiap akun.",
      "File ini berisi data member asli: simpan baik-baik dan jangan dibagikan ke luar.",
    ],
    tanya: [
      { t: "Kenapa ada akun dari cabang lain di file cabang saya?", j: "Itu upline akun cabang tersebut (huruf abu-abu), dicantumkan supaya pohonnya utuh." },
      { t: "Kenapa nomor HP dan alamat tidak ada?", j: "File ini hanya untuk struktur. Data pribadi sengaja tidak disertakan karena file Excel mudah tersebar." },
      { t: "Akun yang belum diverifikasi ada di file?", j: "Tidak. Hanya akun aktif yang sudah masuk struktur." },
      { t: "Muncul “Kursi B07 ditinggal … masih punya downline”?", j: "Orang di kursi B07 berganti jabatan, tetapi kursinya belum ada pengganti. Isi No ID BARU = B07 pada orang yang menggantikan, atau ubah Upline BARU downline-nya ke upline lain." },
      { t: "Muncul “Data akun ini sudah berubah sejak file diunduh”?", j: "Akun itu sudah diubah (mis. lewat Mutasi Jabatan) setelah file Anda unduh. Unduh ulang file terbaru, lalu isi lagi perubahannya." },
      { t: "Bolehkah menambah akun baru atau menghapus baris?", j: "Menambah akun tidak bisa lewat Excel (tetap lewat Registrasi). Baris yang dihapus dianggap tidak berubah." },
    ],
  },
  {
    id: "approval-dokumen",
    route: "/admin/documentbelumapprove",
    menu: "Document Belum Approve",
    icon: "mdi-file-document-alert",
    peran: "semua",
    ringkas: "Persetujuan dokumen RO/star oleh upline lalu superadmin.",
    kegunaan:
      "Dokumen yang diinput di Input Data menunggu persetujuan di sini: pertama oleh upline (Regional, lalu MVO), kemudian persetujuan akhir oleh superadmin. Hanya dokumen yang sudah disetujui akhir yang dihitung di Dashboard dan Saran RO.",
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
      "Angka merah di menu Document Belum Approve = dokumen yang sedang giliran Anda setujui. Urutannya Regional dulu, lalu MVO.",
      { teks: "Superadmin: angka merah = dokumen yang semua uplinenya sudah approve dan tinggal persetujuan akhir.", peran: "superadmin" },
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
    peran: "hak:mutasi",
    ringkas: "Menaikkan, menurunkan, atau memindahkan upline member beserta downline-nya.",
    kegunaan:
      "Satu-satunya cara mengubah jabatan atau upline akun yang sudah aktif. Sistem otomatis menyesuaikan No ID orang tersebut dan seluruh downline-nya, kode akun, struktur upline, serta dokumen yang masih menunggu persetujuan. Ada juga tab Bagan (geser orang ke kursi pada bagan tim), Saran RO, dan Riwayat.",
    langkah: [
      {
        judul: "Jenis mutasi & caranya",
        isi: [
          "Satu gerbong naik (seluruh tim ikut naik 1 jenjang): pilih member, pilih Jabatan baru 1 jenjang di atas, lalu nyalakan saklar Satu gerbong di bagian Downline yang ikut.",
          "Naik (satu orang per tingkat): pilih Jabatan baru yang lebih tinggi dan biarkan Satu gerbong mati. Downline-nya otomatis tetap di kursi lama, kursi lama tetap di bawahnya, lalu di Pratinjau pilih siapa yang naik mengisi kursi itu (rantai pengganti, lihat di bawah).",
          "Turun: pilih Jabatan baru yang lebih rendah. Di bagian Downline muncul dua kotak: Ikut turun bersama … (turun 1 jenjang beserta timnya) dan Tetap di kursi … (jabatan & No ID tetap). Bawaannya semua tetap di kursi; tekan Ikut turun / Tetap untuk memindahkan seseorang.",
          "Saat turun, Upline baru bisa Regional / Founder lain, atau tekan Di bawah pengganti kursi lamanya: orang itu berada di bawah siapa pun yang naik mengisi kursi lamanya.",
          "Kursi lama yang ditinggal saat turun diisi lewat kotak “siapa yang naik?” di Pratinjau, sama seperti saat naik.",
          "Pindah upline (jabatan tetap, tim ikut): biarkan Jabatan baru seperti sekarang, lalu tekan Ganti upline.",
          "Rotasi bersama anggota: tekan Pilih No ID, pilih No ID yang sudah dipegang orang lain, lalu pilih Tukar posisi. Biarkan anggota dicentang: anggota ikut orangnya.",
          "Rotasi sendiri (anggota tetap di kursinya): sama seperti rotasi, tetapi hilangkan centang anggota. Anggota pindah ke orang yang kini menempati kursi itu, No ID-nya tidak berubah.",
          "Rotasi 3 orang: setelah memilih No ID yang terisi, pilih \"… pindah ke kursi lain\" lalu pilih No ID milik orang ketiga.",
          "Naik/turun 2 jenjang: lakukan 1 jenjang, tekan Tambah langkah, pilih orang yang sama, lalu 1 jenjang lagi. Keduanya tersimpan sekali dengan Simpan Rencana.",
        ],
      },
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
          "Top Management dan MVO boleh langsung di bawah Owner: tekan Langsung di bawah Owner.",
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
          "Centang = downline langsung ikut pindah bersama seluruh timnya. Bawaan: semua ikut, kecuali saat naik jabatan (semua tetap di kursi lama). Tombol Centang semua / Kosongkan semua mempercepat pilihan.",
          "Bila mengambil kursi yang terisi, ada daftar terpisah untuk downline pemegang lama (dan orang ketiga pada rotasi). Yang tidak dicentang tetap di kursinya — mereka pindah ke orang yang kini menempati kursi itu, No ID-nya tidak berubah.",
          "Downline orang yang dipindah yang tidak dicentang menunggu di kursi lama yang kosong. Pilih Upline penampung (opsional) untuk memindahkan mereka langsung ke upline lain.",
          "Downline yang jenjangnya tidak cocok dengan jabatan baru otomatis tidak dicentang (mis. Supplier yang naik menjadi GM tidak bisa membawa Distributor; Regional yang turun menjadi GM tidak bisa membawa Founder). Bila jabatan dikembalikan, centangnya kembali sendiri.",
          "Satu gerbong (naik): bila jabatan baru naik 1 jenjang, nyalakan saklar Satu gerbong di atas daftar downline. Downline yang dicentang beserta seluruh jaringannya ikut naik 1 jenjang (mis. Distributor di timnya menjadi Supplier, Reseller menjadi Distributor). No ID seluruh tim ikut berubah. Saklar mati = hanya orang itu yang naik (rantai pengganti).",
          "Ikut turun (turun): downline di kotak Ikut turun bersama … beserta seluruh jaringannya turun 1 jenjang (mis. GM turun menjadi Supplier: Supplier di timnya menjadi Distributor, Distributor menjadi Reseller). Reseller tidak punya jenjang di bawahnya, jadi tim yang berisi Reseller tidak bisa ikut turun — biarkan di kotak Tetap di kursi.",
          "Satu gerbong dan Ikut turun hanya 1 jenjang per langkah. Untuk 2 jenjang: turunkan/naikkan 1 jenjang, tekan Tambah langkah, pilih orang yang sama, lalu turunkan/naikkan 1 jenjang lagi.",
          "Selama masih ada kursi kosong yang punya downline, Pratinjau menampilkan kotak merah “Kursi … — siapa yang naik?” dan Simpan Mutasi belum bisa ditekan, kecuali kursi itu dibiarkan kosong.",
        ],
      },
      {
        judul: "Kursi yang ditinggal: siapa yang naik? (rantai pengganti)",
        isi: [
          "Bila ada kursi yang ditinggal tapi masih punya downline, Pratinjau menampilkan kotak merah “Kursi … ditinggal … — siapa yang naik?” beserta daftar downline langsung kursi itu (jabatan, No ID, jumlah downline).",
          "Ketuk salah satu nama (tombol Naik): orang itu naik mengisi kursi tersebut dan memakai No ID kursi itu. Downline lain tetap di jabatan dan No ID-nya, kini di bawah orang yang naik.",
          "Downline orang yang naik juga tetap di kursinya, jadi kursi yang ia tinggalkan langsung muncul sebagai kotak berikutnya. Ulangi ke bawah sampai tidak ada kursi kosong. Contoh: Founder B07 naik ke Regional → GM B63 naik mengisi B07 → Supplier B63-01 naik mengisi B63 → Distributor naik mengisi B63-01. Hanya 4 No ID yang berubah.",
          "Rantai berhenti bila orang yang naik tidak punya downline.",
          "Pilih orang lain…: pengganti boleh dari jaringan atau cabang mana saja. Jabatan dan upline-nya mengikuti kursi; cabang dan kode cabangnya tetap.",
          "Biarkan kosong: kursi tetap ada tanpa orang, downline-nya tetap di kursi itu dengan jabatan dan No ID yang sama. Kotaknya berubah abu-abu bertuliskan dibiarkan kosong, dan Simpan bisa ditekan. Berlaku untuk semua jabatan (mis. GM naik ke Founder, kursi GM-nya dibiarkan kosong). Kursi tanpa No ID tidak bisa dibiarkan kosong.",
          "Pindahkan tim ke upline lain: kursi dihapus dan semua downline-nya (beserta timnya) pindah ke upline lain yang dipilih. No ID mereka menyesuaikan upline baru.",
          "Orang yang naik tetap menjadi upline kursi lamanya (mis. Founder naik ke Regional: kursi Founder-nya tetap di bawahnya). Kursi Supplier ke bawah tetap di upline lamanya, karena No ID kursi itu mengikuti No ID upline.",
          "Salah langkah? Tekan × pada langkah terakhir di kotak Rencana mutasi.",
        ],
      },
      {
        judul: "Kursi kosong (menunggu pengganti)",
        isi: [
          "Kursi yang dibiarkan kosong tampil di tab Kursi kosong. Angka merah di menu Mutasi Jabatan dan di tab itu = jumlah kursi kosong yang menunggu pengganti.",
          "Setiap kursi menampilkan jabatan, No ID, cabang, upline kursi, jumlah downline, dan sejak kapan kosong.",
          "Ketuk salah satu downline langsungnya (tombol Naik) untuk menaikkannya mengisi kursi itu. Mutasi Baru terbuka dengan rencana tersebut; kursi yang ia tinggal muncul berikutnya: pilih siapa yang naik, atau biarkan kosong.",
          "Pilih orang lain…: pengganti dari member mana saja. Pindahkan tim ke upline lain: kursi dihapus, timnya pindah.",
          "Di Bagan, kursi kosong tampil merah dengan tulisan Kursi kosong. Geser orang ke kursi itu untuk mengisinya.",
          "Saat kursi kosong, level jabatan itu dilewati: isian upline downline-nya pada level itu kosong (-), dan approve pendaftar baru dilakukan upline di atasnya.",
          { teks: "Pemegang hak Mutasi hanya melihat kursi kosong di gerbongnya.", peran: "superadmin" },
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
          { teks: "Isi target per jabatan di Atur target per jabatan: periode (bulan), basis (Pribadi atau Tim = termasuk downline), Naik bila RO ≥, dan Turun bila RO <. Kosongkan bila jabatan tidak perlu dinilai.", peran: "superadmin" },
          "Tekan Proses pada baris saran untuk membuka Mutasi Baru dengan member dan jabatan tujuan sudah terisi.",
        ],
      },
      {
        judul: "Mutasi Bagan (geser orang ke kursi)",
        isi: [
          "Buka tab Bagan, lalu ketuk kolom Buka tim. Daftar akun langsung tampil tanpa perlu mengetik. Saring dengan tombol Jabatan (angka = jumlah akun) dan pilihan Cabang, atau ketik nama / No ID / No Member.",
          "Pilih ketua tim (mis. R05 atau B07). Bagan tim tampil: setiap baris = satu kursi (jabatan · No ID, warna sesuai jabatan) berisi orangnya (No Member + nama).",
          "Superadmin: pilihan paling atas, Seluruh struktur (mulai dari Owner), membuka semua akun di bawah Owner. Yang terbuka awalnya TM, MVO, dan Regional; buka lebih dalam dengan tanda › atau tombol Buka semua.",
          "Pemegang hak Mutasi: pilihan paling atas adalah ketua gerbong Anda (Seluruh gerbong Anda).",
          "Kursi tetap di tempatnya; yang digeser orangnya. Di komputer: tarik nama orang lalu lepas di tujuan. Di HP: ketuk nama orang (berwarna hitam), lalu ketuk tujuannya.",
          "Ke kursi kosong (merah): orang itu mengisi kursi tersebut, termasuk jabatan & No ID-nya.",
          "Ke orang lain (mis. lepas Founder B17 di atas MVO M01): muncul menu pilihan, lalu tekan Terapkan:",
          "• Naik / turun sendiri menjadi downline … — pilih Jabatan baru (bawaan 1 jenjang di bawah orang itu). Kursi lamanya menjadi kosong, timnya tetap di kursi itu.",
          "• Pindah beserta timnya, tetap … — jabatan tidak berubah; kursi dan seluruh timnya ikut ke bawah orang itu.",
          "• Naik / turun beserta seluruh timnya (1 jenjang) — semua anggota tim ikut naik/turun 1 jenjang (mis. FO jadi Regional, GM jadi FO, Supplier jadi GM). Ditolak bila ada Reseller saat turun.",
          "• Tukar posisi dengan … — saling bertukar jabatan, No ID, dan upline (bawaan bila jabatannya sama).",
          "• Ambil kursi …; … ke bangku tunggu — pemegang lama ditempatkan belakangan.",
          "Ke + downline (muncul saat menggeser / di HP selalu tampil): menu yang sama tanpa Tukar posisi dan bangku tunggu. Baris Upline di atas bagan (atau baris Owner) juga punya + downline.",
          "Ke Bangku tunggu (kotak di kanan / di atas pada HP): orang itu keluar dulu dari kursinya, ditempatkan nanti.",
          "Setiap geseran langsung diperiksa. Bila melanggar aturan (mis. Supplier di bawah Founder), muncul pesan Tidak bisa: … dan bagan tidak berubah.",
          "Orang yang naik meninggalkan kursi kosong (merah) yang tetap berada di bawahnya. Di kotak Rencana muncul Kursi … kosong — siapa yang naik? berisi downline langsungnya: ketuk salah satu (atau geser orang lain ke kursi merah itu).",
          "Kursi yang ditinggal orang yang naik menjadi kosong berikutnya, dan seterusnya sampai ke bawah (mis. GM naik ke FO, Supplier naik ke GM, … Reseller naik ke Distributor). Kursi terbawah yang tidak punya downline dibiarkan kosong; nomornya bebas dipakai lagi.",
          "Tidak ingin ada yang naik? Tekan Biarkan kosong di kotak kursi itu: kursi tetap kosong bersama timnya (abu-abu). Batalkan untuk mengembalikannya.",
          "Naik / turun beserta seluruh timnya harus dikerjakan sebelum mengubah anggota tim itu. Ubah anggota timnya setelah disimpan.",
          "Buka tim kedua lewat kolom Buka tim untuk memindah orang antar tim (dua tim tampil berdampingan).",
          "Bila ada anggota tim yang di rencana pindah ke upline di luar tim (mis. Founder naik ke bawah MVO lain), ia tampil di bawah judul kuning “Pindah ke luar tim ini — sekarang di bawah …” beserta kursi kosong & timnya, supaya tetap bisa digeser. Anggota yang hanya tersembunyi karena barisnya tertutup tidak tampil di sana.",
          "Kotak Rencana mencatat setiap geseran. Batal = urungkan geseran terakhir, Ulang dari awal = buang semua.",
          "Simpan aktif bila setiap kursi kosong yang masih punya downline sudah diisi atau dibiarkan kosong, dan bangku tunggu kosong. Tekan Simpan, periksa tabel perubahan (jabatan, No ID, upline lama → baru), isi Catatan bila perlu, lalu Simpan. Tercatat di Riwayat dengan Jenis Mutasi Bagan.",
        ],
      },
      {
        judul: "Riwayat",
        isi: [
          "Tab Riwayat berisi semua mutasi. Kolom Jenis menampilkan Pindah, Mengisi kursi, Tukar posisi, Pindahkan downline, Kursi dibiarkan kosong, atau Import Excel (perubahan yang disimpan dari menu Excel Struktur).",
          "Mutasi yang disimpan sebagai rencana bertanda \"Rencana #… · langkah 1/3\". Klik barisnya untuk melihat seluruh langkah rencana itu dan perubahan setiap akun.",
        ],
      },
    ],
    tips: [
      "Founder dan GM pindah upline: No ID tidak berubah. Supplier ke bawah: No ID mengikuti No ID upline barunya (nomor belakang dipertahankan bila masih kosong).",
      "Saran RO hanya saran — sistem tidak mengubah jabatan secara otomatis.",
      "Seluruh langkah rencana tersimpan dalam satu proses: berhasil semua atau tidak sama sekali. Setiap langkah tercatat terpisah di Riwayat.",
      "Mutasi satu gerbong tercatat di Riwayat dengan Jenis Satu gerbong.",
      "Setelah Simpan, setiap akun yang posisinya berubah menerima notifikasi di lonceng 🔔 (No ID / jabatan lama → baru dan upline langsungnya), dan upline yang mendapat downline langsung baru juga diberi tahu.",
      "Akun yang diberi hak Mutasi (menu Hak Akses) hanya bisa memutasi akun di bawah pemilik gerbongnya, dengan jabatan paling tinggi 1 jenjang di bawah pemilik gerbong (gerbong Regional → paling tinggi Founder, gerbong Founder → GM, gerbong GM → Supplier). Pemilik gerbong sendiri dan akun di gerbong lain tidak bisa dipilih. Daftar member, upline, No ID, Riwayat, dan Saran RO otomatis hanya berisi gerbongnya.",
    ],
    tanya: [
      { t: "Bedanya Mutasi Baru dan Bagan?", j: "Hasilnya sama (aturan jabatan, No ID, kode akun, riwayat). Mutasi Baru memandu langkah demi langkah lewat isian; Bagan memperlihatkan tim sebagai pohon dan Anda cukup menggeser orang ke kursi." },
      { t: "Di Bagan, Simpan tidak bisa ditekan?", j: "Masih ada kursi kosong (merah) yang punya downline, atau masih ada orang di bangku tunggu. Pilih calon di kotak “siapa yang naik?”, tekan Biarkan kosong, atau tempatkan orang di bangku tunggu ke kursi." },
      { t: "GM naik ke Founder, kursi GM-nya mau dikosongkan saja?", j: "Bisa. Di kotak “Kursi … — siapa yang naik?” tekan Biarkan kosong. Supplier di bawah kursi GM itu tetap dengan No ID yang sama. Kursi itu muncul di tab Kursi kosong sampai diisi." },
      { t: "Sampai kapan kursi boleh kosong?", j: "Tidak ada batas waktu. Angka merah di menu Mutasi Jabatan mengingatkan selama masih ada kursi kosong." },
      { t: "Hanya memindah upline (mis. MVO M01 ke bawah TM01), apakah No ID timnya berubah?", j: "Tidak. Pilih Pindah beserta timnya (bawaan bila jabatannya tetap): kursi dan seluruh tim ikut, No ID tidak berubah. No ID lama yang formatnya belum rapi (mis. Founder B-7y) juga tetap dipakai selama jabatannya tidak berubah." },
      { t: "Muncul pesan “Nomor FO (B01–B50) sudah penuh”?", j: "Ada akun yang menjadi Founder dan butuh nomor baru, padahal B01–B50 sudah terpakai semua (mis. GM ikut naik bersama timnya). Isi kursi Founder yang ditinggal (nomornya dipakai pengganti), atau minta superadmin melonggarkan rentang Founder di Tipe Akun." },
      { t: "Di Bagan, Founder saya pindah ke bawah MVO tapi jabatannya tetap Founder?", j: "Itu pilihan Pindah beserta timnya (jabatan tetap). Untuk naik jabatan, pilih Naik / turun sendiri (lalu isi kursi kosongnya) atau Naik / turun beserta seluruh timnya." },
      { t: "Kenapa upline yang saya cari tidak ada di daftar?", j: "Upline harus berjenjang sah untuk jabatan baru (Supplier ke bawah tepat satu jenjang di bawah upline-nya) dan tidak boleh downline orang yang dipindah." },
      { t: "B02 mau pindah ke B03 yang sudah terisi?", j: "Pilih member B02, Pilih No ID → B03, lalu aktifkan Tukar posisi. Pemegang B03 otomatis menempati B02. Atur downline masing-masing: ikut orangnya, atau tetap di posisi." },
      { t: "B52-01 naik ke B52, tapi GM B52 tidak mau turun?", j: "Setelah memilih No ID B52, pilih \"… pindah ke kursi lain\". Isi kursi barunya, mis. No ID Otomatis (nomor GM kosong berikutnya) dengan upline yang sama. Kursi B52-01 jadi kosong: pilih Upline penampung untuk downline-nya." },
      { t: "Bisakah beberapa mutasi disimpan sekaligus?", j: "Bisa. Selesaikan langkah pertama, tekan Tambah langkah, lalu isi langkah berikutnya. Semua langkah tersimpan bersama dengan Simpan Rencana; bila satu gagal, tidak ada yang tersimpan." },
      { t: "Kursi B52-01 kosong, siapa yang menggantikan?", j: "Di kotak kursi itu, ketuk nama downline yang naik (mis. Distributor B52-01-04), atau tekan Pilih orang lain… untuk memilih dari seluruh member. Bila kursi Distributor itu jadi kosong, pilih lagi siapa yang naik sampai tidak ada kursi kosong, lalu Simpan Rencana." },
      { t: "Founder naik ke Regional, apakah semua GM-nya ikut naik?", j: "Tidak. Saat naik, downline-nya tetap di kursi masing-masing. Hanya satu GM yang Anda pilih naik mengisi kursi Founder itu, lalu satu Supplier-nya naik mengisi kursi GM tersebut, dan seterusnya. GM lain tetap GM dengan No ID yang sama, kini di bawah Founder baru. Bila memang seluruh tim ingin naik 1 jenjang, nyalakan Satu gerbong." },
      { t: "Supplier B52-01 naik menggantikan GM B52?", j: "Pilih member B52-01, Jabatan baru GM, Pilih No ID → B52, lalu aktifkan Tukar posisi. GM lama otomatis menempati kursi B52-01. Downline yang jenjangnya tidak cocok otomatis tetap di posisi, jadi hanya 2 No ID yang berubah." },
      { t: "Kenapa downline tidak bisa dicentang saat tukar posisi?", j: "Jenjangnya tidak cocok dengan jabatan baru orang itu (mis. GM naik menjadi Founder: Supplier-nya tidak bisa ikut karena Supplier harus di bawah GM). Downline tersebut otomatis tetap di posisi." },
      { t: "Founder turun menjadi GM, bagaimana dengan GM-GM di bawahnya?", j: "Setiap GM masuk ke salah satu kotak. Tetap di kursi (bawaan): tetap GM dengan No ID yang sama, lalu salah satunya naik mengisi kursi Founder itu di Pratinjau. Ikut turun: GM itu beserta timnya turun 1 jenjang di bawah Founder yang turun (GM jadi Supplier, dan seterusnya)." },
      { t: "Founder yang turun ingin tetap di tim lamanya?", j: "Di Upline baru, tekan Di bawah pengganti kursi lamanya. Setelah Anda memilih siapa yang naik mengisi kursi Founder itu, Founder yang turun berada di bawah orang tersebut." },
      { t: "Muncul 'Satu gerbong tidak bisa: … akun RESELLER tidak punya jenjang di bawahnya'?", j: "Reseller adalah jenjang paling bawah, jadi tidak bisa ikut turun. Pindahkan dulu Reseller yang disebut ke upline lain (Mutasi biasa), atau hilangkan centang downline yang membawahinya agar tim itu tidak ikut turun." },
      { t: "Muncul 'Nomor FO (B01–B50) sudah penuh' saat satu gerbong naik?", j: "Tim yang naik butuh nomor baru dan rentangnya habis. Pesan menyebut berapa nomor yang dibutuhkan per jabatan. Kosongkan dulu sebagian nomor (mis. turunkan Founder lain), atau perlebar rentang di Tipe Akun." },
      { t: "Muncul 'Mutasi ini mengubah akun di luar gerbong Anda'?", j: "Akun Anda diberi hak Mutasi hanya untuk gerbong tertentu. Pilihan itu ikut mengubah akun di gerbong lain (mis. tukar posisi dengan Supplier gerbong lain). Pilih kursi atau upline yang ada di gerbong Anda, atau minta superadmin yang memprosesnya." },
      { t: "Muncul 'Tidak ada perubahan'?", j: "Jabatan dan upline baru sama dengan sekarang. Untuk memindahkan satu downline saja, pilih downline tersebut sebagai member yang dimutasi." },
    ],
    gambar: [
      { src: "/panduan/mutasi-pratinjau.jpg", ket: "Mutasi Baru: downline yang ikut dan pratinjau perubahan upline / No ID" },
      { src: "/panduan/mutasi-saran.jpg", ket: "Saran RO: target per jabatan dan daftar saran" },
    ],
  },
  {
    id: "hak-akses",
    route: "/admin/hak-akses",
    menu: "Hak Akses",
    icon: "mdi-shield-account",
    peran: "superadmin",
    ringkas: "Memberi atau mencabut hak tambahan untuk akun tertentu, mis. Mutasi di gerbong Regional atau Founder.",
    kegunaan:
      "Hak akses terpisah dari jabatan: jabatan mengatur posisi di struktur, hak akses mengatur apa yang boleh dikerjakan di aplikasi. Contoh: Founder B27 diberi hak Mutasi Jabatan untuk gerbongnya sendiri, sehingga bisa membantu superadmin memutasi akun di bawahnya tanpa bisa menyentuh gerbong lain. Satu gerbong = pemilik gerbong beserta seluruh jaringan di bawahnya (mis. Founder → GM → Supplier → Distributor → Reseller).",
    langkah: [
      {
        judul: "Melihat hak satu akun (tab Per akun)",
        isi: [
          "Buka tab Per akun, lalu ketik nama, No ID, atau username di kolom Pilih akun.",
          "Tampil semua yang bisa dilakukan akun itu, dikelompokkan menurut asalnya: Semua member, Menurut jabatan, Menurut posisi upline, Hak tambahan, dan Khusus superadmin. Tanda ✔ = bisa, ✘ = tidak bisa, dengan keterangan batasnya (mis. hanya akun di jaringannya, atau jumlah pendaftar yang menunggu approve-nya).",
          "Pada baris Mutasi Jabatan, tekan Beri hak untuk langsung memberi hak ke akun tersebut, atau Lihat untuk membuka kartunya di tab Hak aktif.",
          "Akun yang belum aktif (belum diverifikasi) belum bisa login, jadi semua haknya belum berlaku.",
        ],
      },
      {
        judul: "Mengubah hak satu akun",
        isi: [
          "Di tab Per akun, kemampuan yang bisa diubah punya tombol di barisnya:",
          "Larang akun ini — akun tersebut tidak boleh, walau jabatannya boleh. Izinkan akun ini — akun tersebut boleh, walau jabatannya tidak.",
          "Ikuti aturan jabatan (untuk hak approve: Ikuti aturan) — menghapus pengecualian, akun kembali mengikuti aturan jabatan / posisinya sebagai upline.",
          "Isi alasan bila perlu, lalu Simpan. Keterangan baris menyebut siapa yang mengizinkan/melarang dan alasannya.",
          "Saat ini yang bisa diubah: Tambah / ubah / hapus / import dokumen (izinkan atau larang), Approve / Tunda / Tolak / Pulihkan pendaftar (hanya bisa dilarang, karena hak ini mengikuti posisi akun sebagai upline), dan Kirim pesan Chat (hanya bisa dilarang; akun tetap bisa membaca pesan).",
        ],
      },
      {
        judul: "Aturan dokumen per jabatan",
        isi: [
          "Tab Aturan dokumen per jabatan: centang = semua akun berjabatan itu boleh menambah, mengubah, menghapus, dan import dokumen; tidak dicentang = hanya bisa melihat dokumen. Contoh: centang GM agar semua GM boleh menginput dokumen. Perubahan langsung berlaku.",
          "Aturan jabatan berlaku untuk semua akun berjabatan itu, kecuali akun yang diizinkan / dilarang khusus di tab Per akun.",
        ],
      },
      {
        judul: "Memberi hak",
        isi: [
          "Tekan Beri hak.",
          "Akun yang diberi hak: cari nama, No ID, atau username (mis. akun Regional atau Founder itu sendiri).",
          "Hak: pilih Mutasi Jabatan.",
          "Di isian Cakupan: pemilik gerbong, pilih akun TM sampai Distributor yang gerbongnya boleh diurus (daftar menampilkan jabatan dan jumlah downline langsungnya). Pemegang hak bisa memutasi seluruh akun di bawahnya, dengan jabatan paling tinggi 1 jenjang di bawah pemilik gerbong; pemilik gerbong sendiri tidak bisa dimutasi.",
          "Isi Catatan bila perlu, lalu tekan Simpan.",
        ],
      },
      {
        judul: "Mencabut hak",
        isi: [
          "Di tab Hak aktif, tekan Cabut pada kartu hak tersebut, isi alasan bila perlu, lalu tekan Cabut.",
          "Menu terkait langsung hilang dari akun itu saat halaman dibuka ulang.",
        ],
      },
      {
        judul: "Riwayat",
        isi: ["Tab Riwayat mencatat setiap hak yang diberi dan dicabut (gerbong mana), setiap akun yang diizinkan / dilarang, dan setiap perubahan aturan jabatan: kapan dan oleh siapa."],
      },
    ],
    tips: [
      "Satu akun boleh diberi hak untuk beberapa gerbong.",
      "Gerbong boleh bertumpuk: bila Regional R03 dan Founder B27 di bawahnya sama-sama diberi hak, keduanya bisa memutasi gerbong B27. Riwayat Mutasi mencatat siapa yang melakukannya.",
      "Superadmin sudah memiliki semua hak, tidak perlu diberi hak tambahan.",
      "Akun yang diberi / dicabut haknya, diizinkan, dilarang, atau dikembalikan ke aturan langsung menerima notifikasi di lonceng 🔔 beserta catatan/alasannya. Perubahan aturan per jabatan tidak dikirim sebagai notifikasi.",
      "Akun yang memegang hak atau menjadi cakupan gerbong tidak bisa dihapus sebelum haknya dicabut.",
    ],
    tanya: [
      { t: "Kenapa Reseller tidak ada di pilihan Cakupan?", j: "Reseller adalah jenjang paling bawah dan tidak punya downline, jadi tidak bisa menjadi pemilik gerbong. Yang bisa dipilih: akun aktif TM sampai Distributor." },
      { t: "Regional diberi hak, apakah bisa menjadikan anggotanya Regional?", j: "Tidak. Jabatan paling tinggi yang bisa dipilih adalah 1 jenjang di bawah pemilik gerbong: untuk gerbong Regional paling tinggi Founder." },
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
    ringkas: "Grup chat GLOBAL (semua member) dan grup cabang Anda.",
    kegunaan: "Mengobrol dengan sesama member. Setiap member otomatis masuk dua grup: GLOBAL · Semua member, dan grup cabangnya sendiri (mis. Cabang MEDAN). Pesan baru langsung muncul tanpa perlu muat ulang.",
    langkah: [
      {
        judul: "Mengirim pesan",
        isi: [
          "Pilih grup di daftar Grup Chat. Di HP, daftar berganti menjadi percakapan; tekan panah kiri untuk kembali.",
          "Ketik pesan di kolom Tulis pesan..., lalu tekan Enter atau tombol kirim. Shift + Enter untuk baris baru.",
          "Ikon senyum untuk menambah emoji.",
          "Pesan maksimal 2.000 karakter. Bila mengirim terlalu cepat, tunggu beberapa detik.",
        ],
      },
      {
        judul: "Membaca percakapan",
        isi: [
          "Pesan terbaru tampil di bawah. Untuk pesan lama, gulir ke atas lalu tekan Muat pesan sebelumnya.",
          "Saat Anda membaca pesan lama dan ada pesan masuk, tekan Pesan baru untuk langsung ke bawah.",
          "Tekan tulisan … anggota di bawah nama grup untuk melihat dan mencari anggota grup.",
          "Tulisan Menyambung ulang… berarti koneksi terputus sebentar; pesan yang terlewat dimuat otomatis setelah tersambung.",
        ],
      },
      {
        judul: "Pesan baru",
        isi: [
          "Angka merah di menu Chat = jumlah pesan yang belum Anda baca. Di HP, angkanya juga tampil di tombol Lainnya.",
          "Angka di samping nama grup = pesan belum dibaca di grup itu. Angka hilang setelah grup dibuka.",
          "Status dibaca berlaku untuk masing-masing orang: grup yang Anda buka tidak membuat pesan terbaca untuk member lain.",
        ],
      },
      {
        judul: "Grup yang tersedia",
        isi: [
          "Grup dibuat otomatis, tidak perlu dibuat sendiri.",
          "Pindah cabang? Grup cabang Anda ikut berganti setelah data cabang diubah superadmin.",
        ],
      },
      {
        judul: "Khusus superadmin",
        peran: "superadmin",
        isi: [
          "Superadmin melihat dan bisa menulis di semua grup: GLOBAL dan seluruh grup cabang.",
          "Hapus pesan: tekan ikon tempat sampah di bawah pesan, lalu Hapus. Pesan tampil sebagai \"Pesan dihapus admin\" untuk semua anggota; teks aslinya tetap tersimpan sebagai catatan.",
        ],
      },
    ],
    tips: [
      "Grup cabang lain tidak bisa dibuka; pesannya hanya untuk anggota cabang itu.",
      "Pesan baru berbunyi pendek bila grupnya sedang tidak dibuka. Bunyi bisa dimatikan di panel lonceng 🔔: Suara notifikasi & chat.",
    ],
    tanya: [
      { t: "Bisakah saya menghapus pesan yang sudah terkirim?", j: "Tidak. Hanya superadmin yang bisa menghapus pesan. Periksa pesan sebelum dikirim, atau minta bantuan superadmin." },
      { t: "Kenapa saya tidak bisa membuat grup?", j: "Grup dibuat otomatis: GLOBAL untuk semua member dan satu grup per cabang." },
      { t: "Kolom tulis berganti keterangan \"Hak kirim pesan … dinonaktifkan superadmin\"?", j: "Superadmin menonaktifkan hak kirim pesan untuk akun Anda di menu Hak Akses. Anda tetap bisa membaca semua pesan grup. Hubungi superadmin bila perlu." },
    ],
  },
  {
    id: "profil",
    route: "/admin/profil",
    menu: "Profil Saya",
    icon: "mdi-account-circle",
    peran: "semua",
    ringkas: "Melihat data diri, mengganti foto profil, dan mengganti password.",
    kegunaan: "Dibuka dari foto profil di kanan atas → Profil Saya. Menampilkan data akun Anda, status akun, No ID, dan No. Member.",
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
    tips: [
      "No ID, jabatan, dan cabang tidak bisa diubah sendiri. Hubungi superadmin bila ada data yang salah.",
      "No. Member (mis. BP-00284) adalah nomor tetap akun Anda: tidak berubah walau No ID atau jabatan Anda berubah lewat Mutasi. Sebutkan nomor ini bila menghubungi admin.",
    ],
    tanya: [],
  },
];

/** Panduan untuk path halaman (atau null). */
export function cariPanduan(path) {
  const p = (path || "").toLowerCase().replace(/\/+$/, "");
  return PANDUAN.find((g) => g.route.toLowerCase() === p) || null;
}

/**
 * Apakah user ini boleh melihat panduan/elemen dengan peran tertentu.
 * peran: "semua" | "superadmin" | "hak:<kode>" (superadmin + pemegang hak itu, lihat menu Hak Akses).
 * hakSaya: kode hak milik akun login, mis. ["mutasi"].
 */
export function bolehLihat(peran, isSuperadmin, hakSaya = []) {
  if (!peran || peran === "semua") return true;
  if (peran === "superadmin") return isSuperadmin;
  if (String(peran).startsWith("hak:")) return isSuperadmin || hakSaya.includes(peran.slice(4));
  return false;
}

/** Teks "siapa yang bisa" untuk satu panduan. */
export function labelPeran(peran) {
  if (peran === "superadmin") return "Khusus superadmin";
  if (String(peran || "").startsWith("hak:")) return "Superadmin & akun yang diberi hak di menu Hak Akses";
  return "Semua member";
}
