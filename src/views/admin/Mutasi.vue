<template>
  <div class="mutasi-page">
    <Breadcrumb :items="[{ title: 'Dashboard', to: '/admin/dashboard' }, { title: 'Mutasi Jabatan' }]"
      sub="Naikkan, turunkan, atau pindahkan upline member beserta downline-nya" />

    <v-alert v-if="!isSuperadmin" type="info" variant="tonal">Halaman ini khusus superadmin.</v-alert>

    <v-tabs v-if="isSuperadmin" v-model="tab" color="#B8890F" class="mb-4">
      <v-tab value="baru" prepend-icon="mdi-account-switch">Mutasi Baru</v-tab>
      <v-tab value="saran" prepend-icon="mdi-chart-timeline-variant" @click="muatSaranAwal">Saran RO</v-tab>
      <v-tab value="riwayat" prepend-icon="mdi-history" @click="muatRiwayat">Riwayat</v-tab>
    </v-tabs>

    <v-window v-if="isSuperadmin" v-model="tab">
      <!-- ================= MUTASI BARU ================= -->
      <v-window-item value="baru">
        <!-- Rencana: langkah yang sudah ditetapkan, disimpan sekaligus bersama langkah yang sedang diisi -->
        <v-card v-if="rencana.length" class="step-card mb-4">
          <div class="step-head"><v-icon icon="mdi-format-list-numbered" color="#B8890F" /> Rencana mutasi
            <span class="head-note">disimpan sekaligus</span></div>
          <v-card-text>
            <div v-for="(r, i) in rencana" :key="r.kunci" class="rencana-item">
              <span class="rencana-no">{{ i + 1 }}</span>
              <div class="rencana-teks">
                <div v-for="(t, j) in r.teks" :key="j">{{ t }}</div>
              </div>
              <v-btn v-if="i === rencana.length - 1" icon="mdi-close" size="small" variant="text"
                title="Batalkan langkah ini" @click="hapusRencanaTerakhir" />
            </div>
            <p class="hint mt-2">Langkah berikutnya diisi di bawah. Kursi kosong yang masih punya downline harus diisi
              atau dipindahkan sebelum rencana disimpan.</p>
          </v-card-text>
        </v-card>

        <!-- 1. Pilih member -->
        <v-card class="step-card mb-4">
          <div class="step-head"><span class="step-no">1</span>
            {{ kursiTarget ? `Pilih pengganti kursi ${labelKursi(kursiTarget)}` : 'Pilih member' }}</div>
          <v-card-text>
            <v-alert v-if="kursiTarget && !member" type="info" variant="tonal" density="compact" class="mb-3">
              Pengganti boleh dari jaringan atau cabang mana saja. Jabatannya menjadi {{ kursiTarget.jabatan }}
              dengan upline {{ kursiTarget.upline?.nama || '-' }}; cabang & kode cabangnya tetap.
              <div class="mt-1"><v-btn size="small" variant="text" @click="batalPengganti">Batal pilih pengganti</v-btn></div>
            </v-alert>
            <!-- Daftar member langsung tampil; pilih dengan mengetuk baris -->
            <DaftarPilihMember v-if="!member" :api="api" url="/mutasi/cari-member" filter-jabatan filter-cabang
              placeholder="Cari nama / No ID / username" kosong="Tidak ada member yang cocok"
              @pilih="pilihDariDaftar" />

            <template v-else>
              <div class="member-info">
                <div><span class="lbl">Nama</span><b>{{ member.nama }}</b></div>
                <div><span class="lbl">Jabatan</span><b>{{ member.jabatan }}</b></div>
                <div><span class="lbl">No ID</span><b>{{ member.no_id || '-' }}</b></div>
                <div><span class="lbl">Upline</span><b>{{ member.atasan_nama ? `${member.atasan_nama} (${member.atasan_no_id || '-'})` : teksOwner() }}</b></div>
                <div><span class="lbl">Cabang</span><b>{{ member.cabang || '-' }}</b></div>
              </div>
              <v-alert v-if="posisiRencana" type="info" variant="tonal" density="compact" class="mt-2">
                Sudah diubah di rencana: sekarang <b>{{ posisiRencana.jabatan_baru }} {{ posisiRencana.no_id_baru || '-' }}</b>,
                upline {{ posisiRencana.atasan_baru || 'Owner' }}. Langkah ini melanjutkan dari posisi itu.
              </v-alert>
              <v-btn variant="tonal" color="#B8890F" size="small" prepend-icon="mdi-account-switch" class="mt-3"
                @click="gantiMember">Ganti member</v-btn>
            </template>
          </v-card-text>
        </v-card>

        <!-- 2. Posisi baru -->
        <v-card v-if="member" class="step-card mb-4">
          <div class="step-head"><span class="step-no">2</span> Posisi baru</div>
          <v-card-text v-if="kursiTarget">
            <v-alert type="info" variant="tonal" density="compact">
              <b>{{ member.nama }}</b> mengisi kursi {{ labelKursi(kursiTarget) }}: jabatan {{ kursiTarget.jabatan }},
              upline {{ kursiTarget.upline ? `${kursiTarget.upline.nama} (${kursiTarget.upline.no_id || '-'})` : '-' }}.
              {{ kursiTarget.jumlah_downline }} downline kursi itu pindah ke {{ member.nama }}.
            </v-alert>
          </v-card-text>
          <v-card-text v-else>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-select v-model="jabatanBaru" :items="jabatanItems" item-title="label" item-value="id"
                  label="Jabatan baru" variant="outlined" density="comfortable" hide-details :disabled="ambilKursiTerisi"
                  @update:model-value="gantiJabatan" />
              </v-col>
            </v-row>

            <!-- No ID tujuan (kursi) untuk semua jabatan. Supplier ke bawah: cari kursinya. -->
            <template v-if="jabatanBaru">
              <div class="atasan-label mt-4">No ID</div>
              <v-btn-toggle v-model="modeNoId" mandatory density="comfortable" color="#B8890F" variant="outlined"
                class="mb-2" @update:model-value="gantiModeNoId">
                <v-btn value="otomatis" size="small">Otomatis</v-btn>
                <v-btn value="pilih" size="small">Pilih No ID</v-btn>
              </v-btn-toggle>
              <div v-if="modeNoId === 'otomatis'" class="hint">
                <template v-if="jabatanTurunan">No ID mengikuti No ID upline; nomor belakang dipertahankan bila masih kosong.</template>
                <template v-else>No ID dipertahankan bila masih sesuai jabatan, atau diberi nomor kosong berikutnya.</template>
              </div>
              <template v-else>
                <v-autocomplete v-model="noIdTujuan" :items="nomorItems" item-title="label" item-value="no_id"
                  :loading="loadingNomor" label="No ID tujuan" variant="outlined" density="comfortable" hide-details
                  prepend-inner-icon="mdi-identifier" :no-filter="jabatanTurunan"
                  :no-data-text="jabatanTurunan ? 'Ketik No ID atau nama untuk mencari kursi' : 'Tidak ada nomor untuk jabatan ini'"
                  @update:search="cariNomor" @update:model-value="pilihNoId" />
                <div class="hint mt-1">
                  Daftar berisi No ID jabatan {{ namaJabatanBaru }}.
                  <template v-if="jabatanTurunan">Ketik No ID atau nama untuk mencari kursi lain; nomor kosong muncul setelah
                    Upline baru dipilih.</template>
                  Untuk naik/turun ke kursi jabatan lain, ganti Jabatan baru dulu.
                </div>
                <v-alert v-if="pemegangTujuan" :type="nasibPemegang ? 'info' : 'warning'" variant="tonal" density="compact"
                  class="mt-2">
                  {{ noIdTujuan }} masih dipakai <b>{{ pemegangTujuan.nama }}</b> ({{ pemegangTujuan.jabatan }}).
                  Kursi tidak boleh bertabrakan, jadi tentukan ke mana {{ pemegangTujuan.nama }} pindah:
                  <v-radio-group v-model="nasibPemegang" density="compact" hide-details class="mt-1 nasib-pilihan"
                    @update:model-value="gantiNasib">
                    <v-radio value="tukar" color="#B8890F"
                      :label="`Tukar posisi: ${pemegangTujuan.nama} ke kursi lama ${member.nama} (${member.no_id || '-'})`" />
                    <v-radio value="lain" color="#B8890F" :label="`${pemegangTujuan.nama} pindah ke kursi lain`" />
                  </v-radio-group>
                </v-alert>
                <!-- Kursi baru untuk pemegang lama: kursi kosong lain, atau kursi orang ketiga (rotasi) -->
                <KursiTujuan v-if="pemegangTujuan && nasibPemegang === 'lain'" :key="`${pemegangTujuan.id}-${noIdTujuan}`"
                  :api="api" :orang="pemegangTujuan" :jabatan-list="jabatanList" :member-id="memberId"
                  :nama-member="member.nama" :no-id-member="member.no_id" :baris-rencana="barisRencana" @ubah="ubahKursiPemegang"
                  @tukar="nasibPemegang = 'tukar'; gantiNasib()" />
              </template>
            </template>

            <!-- Mengambil kursi yang terisi: jabatan & upline mengikuti kursi tujuan -->
            <v-alert v-if="ambilKursiTerisi" type="info" variant="tonal" density="compact" class="mt-4">
              {{ member.nama }} menempati kursi {{ noIdTujuan }} (jabatan & upline kursi itu), dan
              <template v-if="nasibPemegang === 'tukar'">{{ pemegangTujuan.nama }} menempati kursi lama {{ member.no_id || '-' }}.</template>
              <template v-else-if="rotasi">{{ pemegangTujuan.nama }} menempati {{ kursiPemegang.no_id_tujuan }}, lalu
                {{ kursiPemegang.pemegang.nama }} menempati kursi lama {{ member.no_id || '-' }}.</template>
              <template v-else>{{ pemegangTujuan.nama }} pindah ke kursi barunya. Kursi lama {{ member.no_id || '-' }}
                menjadi kosong.</template>
            </v-alert>

            <template v-if="!ambilKursiTerisi">
            <div class="atasan-label mt-4">Upline baru</div>
            <!-- Atasan terpilih + tombol ganti; daftar calon atasan tampil saat memilih -->
            <div v-if="!pilihAtasanTerbuka" class="atasan-terpilih">
              <div v-if="atasanTerpilih" class="atasan-teks">
                <b>{{ atasanTerpilih.nama }}</b>
                <span class="atasan-meta">{{ atasanTerpilih.no_id || '-' }}<template v-if="atasanTerpilih.jabatan"> · {{ atasanTerpilih.jabatan }}</template></span>
              </div>
              <div v-else class="atasan-teks atasan-kosong">{{ bolehTanpaAtasan ? `Langsung di bawah ${teksOwner()}` : 'Belum dipilih' }}</div>
              <v-btn variant="tonal" color="#B8890F" size="small" prepend-icon="mdi-account-arrow-up"
                @click="pilihAtasanTerbuka = true">{{ atasanTerpilih ? 'Ganti upline' : 'Pilih upline' }}</v-btn>
            </div>
            <template v-else>
              <p class="hint mb-2">Calon upline yang sah untuk jabatan ini. Cabang {{ member.cabang }} ditampilkan paling atas.</p>
              <DaftarPilihMember :api="api" url="/mutasi/kandidat-atasan"
                :params="{ mvo_type_id: jabatanBaru, user_id: memberId, cabang_utama: member.cabang }"
                :terpilih-id="atasanBaru" placeholder="Cari nama / No ID upline"
                kosong="Tidak ada calon upline untuk jabatan ini" @pilih="pilihAtasan" />
              <div class="d-flex flex-wrap ga-2 mt-2">
                <v-btn v-if="bolehTanpaAtasan" variant="text" size="small" @click="pilihAtasan(null)">Langsung di bawah Owner</v-btn>
                <v-btn v-if="atasanTerpilih" variant="text" size="small" @click="pilihAtasanTerbuka = false">Batal</v-btn>
              </div>
            </template>
            </template>
          </v-card-text>
        </v-card>

        <!-- 3. Anggota -->
        <v-card v-if="member && jumlahAnakLangsung" class="step-card mb-4">
          <div class="step-head"><span class="step-no">3</span> Downline yang ikut
            <span class="head-note">{{ jumlahAnakLangsung }} downline langsung</span></div>
          <v-card-text>
            <!-- Satu kelompok per pemilik downline: orang yang dipindah, pemegang lama kursi tujuan, dan (rotasi) orang ketiga -->
            <div v-for="g in kelompokDownline" :key="g.kunci" class="mb-4">
              <div class="kelompok-head">
                <b>{{ g.judul }}</b>
                <v-spacer />
                <v-btn size="x-small" variant="text" color="#B8890F" @click="setSemua(g, true)">Centang semua</v-btn>
                <v-btn size="x-small" variant="text" @click="setSemua(g, false)">Kosongkan semua</v-btn>
              </div>
              <p class="hint mb-2">Centang = ikut {{ g.nama }} bersama timnya. Tidak dicentang = {{ g.kalauTidak }}.</p>
              <div class="anak-list">
                <label v-for="a in g.daftar" :key="a.id" class="anak-item"
                  :class="{ 'anak-off': !ikutKah(g.state, a), 'anak-blok': a.boleh_ikut === false }">
                  <v-checkbox-btn :model-value="ikutKah(g.state, a)" :disabled="a.boleh_ikut === false" color="#B8890F"
                    @update:model-value="toggleIkut(g.kunci, a.id, $event)" />
                  <div class="anak-text">
                    <div class="anak-nama">{{ a.nama }}</div>
                    <div class="anak-meta">{{ a.jabatan_lama }} · {{ a.no_id_lama || '-' }}
                      <span v-if="a.jumlah_tim"> · beserta {{ a.jumlah_tim }} downline</span></div>
                    <div v-if="a.boleh_ikut === false" class="anak-alasan">
                      Jenjang tidak cocok dengan jabatan baru {{ g.nama }} — {{ g.kalauTidak }}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div v-if="adaTidakIkut && !pakaiTukar" class="mt-4">
              <v-autocomplete v-model="penampung" :items="penampungItems" item-title="label" item-value="id"
                :loading="loadingPenampung" no-filter clearable label="Upline penampung (opsional) untuk downline yang tidak ikut"
                variant="outlined" density="comfortable" hide-details prepend-inner-icon="mdi-account-group"
                @update:search="cariPenampung" @update:model-value="jadwalkanPratinjau" />
            </div>
          </v-card-text>
        </v-card>

        <!-- 4. Pratinjau -->
        <v-card v-if="pratinjau && (member || rencana.length)" class="step-card mb-4">
          <div class="step-head"><span class="step-no">{{ !member ? 1 : jumlahAnakLangsung ? 4 : 3 }}</span> Pratinjau perubahan
            <v-progress-circular v-if="loadingPratinjau" indeterminate size="16" width="2" color="#B8890F" class="ml-2" />
          </div>
          <v-card-text>
            <v-alert v-for="(e, i) in pratinjau.errors" :key="i" type="warning" variant="tonal" density="compact"
              class="mb-2">{{ e }}</v-alert>
            <!-- Kursi kosong yang masih punya downline: wajib diisi pengganti / dipindahkan sebelum simpan -->
            <div v-for="k in kursiKosong" :key="k.id" class="kursi-kosong mb-2">
              <v-icon icon="mdi-seat-outline" color="error" class="kk-ikon" />
              <div class="kk-teks">
                <b>Kursi {{ labelKursi(k) }} ({{ k.jabatan }}) kosong</b>, masih ada {{ k.jumlah_downline }} downline:
                {{ k.downline.join(', ') }}<template v-if="k.jumlah_downline > k.downline.length">, …</template>
                <span v-if="k.upline" class="kk-meta"> · upline kursi: {{ k.upline.nama }} ({{ k.upline.no_id || '-' }})</span>
              </div>
              <div class="kk-aksi">
                <v-btn size="small" color="primary" variant="flat" prepend-icon="mdi-account-arrow-right"
                  :disabled="!bisaLanjut" @click="mulaiPengganti(k)">Pilih pengganti</v-btn>
                <v-btn size="small" variant="tonal" color="#B8890F" prepend-icon="mdi-account-group"
                  :disabled="!bisaLanjut" @click="bukaPindahkan(k)">Pindahkan ke upline lain</v-btn>
              </div>
            </div>
            <p v-if="kursiKosong.length && !bisaLanjut && !loadingPratinjau" class="hint mb-2">
              Perbaiki peringatan di atas dulu sebelum memilih pengganti atau memindahkan downline.</p>

            <div v-if="!pratinjau.errors.length" class="ringkas mb-3">
              <span v-if="jumlahLangkah > 1" class="r-chip">Langkah: <b>{{ jumlahLangkah }}</b></span>
              <!-- Angka downline = langkah yang sedang diisi -->
              <template v-if="member">
                <span class="r-chip">Downline: <b>{{ pratinjau.ringkasan.jumlah_anggota }}</b></span>
                <span class="r-chip">Ikut: <b>{{ pratinjau.ringkasan.jumlah_ikut }}</b></span>
                <span class="r-chip">{{ pratinjau.ringkasan.tukar_dengan ? "Tetap di posisi" : "Tidak ikut" }}: <b>{{ pratinjau.ringkasan.jumlah_tidak_ikut }}</b></span>
              </template>
              <span class="r-chip r-gold">No ID berubah: <b>{{ pratinjau.ringkasan.no_id_berubah }}</b></span>
            </div>

            <v-switch v-model="hanyaBerubah" color="#B8890F" density="compact" hide-details
              label="Tampilkan hanya yang berubah" class="mb-2" />

            <v-data-table :headers="headersPratinjau" :items="barisTampil" :items-per-page="10" density="comfortable"
              :mobile="$vuetify.display.smAndDown" class="tabel-pratinjau">
              <template #item.nama="{ item }">
                <span :style="{ paddingLeft: Math.min(item.depth, 4) * 10 + 'px' }">{{ item.nama }}</span>
              </template>
              <template #item.peran="{ item }">
                <span class="peran" :class="`peran-${item.peran}`">{{ labelPeran[item.peran] }}</span>
              </template>
              <template #item.jabatan="{ item }">
                <span v-if="item.jabatan_lama === item.jabatan_baru">{{ item.jabatan_lama }}</span>
                <span v-else>{{ item.jabatan_lama }} → <b class="baru">{{ item.jabatan_baru }}</b></span>
              </template>
              <template #item.no_id="{ item }">
                <span v-if="!item.no_id_baru || item.no_id_lama === item.no_id_baru">{{ item.no_id_lama || '-' }}</span>
                <span v-else>{{ item.no_id_lama || '-' }} → <b class="baru">{{ item.no_id_baru }}</b></span>
              </template>
              <template #item.atasan="{ item }">
                <span v-if="item.atasan_lama === item.atasan_baru">{{ item.atasan_lama || 'Owner' }}</span>
                <span v-else>{{ item.atasan_lama || 'Owner' }} → <b class="baru">{{ item.atasan_baru || 'Owner' }}</b></span>
              </template>
            </v-data-table>

            <v-textarea v-model="catatan" label="Catatan (opsional, mis. alasan mutasi)" variant="outlined" rows="2"
              auto-grow class="mt-4" hide-details />

            <div class="d-flex justify-end mt-4" style="gap: 8px;">
              <v-btn variant="text" @click="reset">Batal</v-btn>
              <!-- Tetapkan langkah ini ke rencana, lalu isi langkah berikutnya; semua disimpan sekaligus -->
              <v-btn v-if="member" variant="tonal" color="#B8890F" prepend-icon="mdi-playlist-plus" :disabled="!bisaLanjut"
                @click="tambahLangkah">Tambah langkah</v-btn>
              <v-btn color="primary" :disabled="!bisaSimpan" :loading="loadingSimpan" prepend-icon="mdi-content-save"
                @click="konfirmasi = true">{{ jumlahLangkah > 1 ? `Simpan Rencana (${jumlahLangkah} langkah)` : 'Simpan Mutasi' }}</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- ================= RIWAYAT ================= -->
      <!-- ================= SARAN RO ================= -->
      <v-window-item value="saran">
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          Saran dihitung dari RO (repeat order) dokumen yang <b>sudah di-approve</b> dalam periode aturan.
          Sistem hanya memberi saran — perubahan jabatan tetap lewat tombol <b>Proses</b> (Mutasi Baru).
        </v-alert>

        <v-expansion-panels v-model="panelAturan" class="mb-4">
          <v-expansion-panel value="aturan" class="step-card">
            <v-expansion-panel-title><b>Atur target per jabatan</b></v-expansion-panel-title>
            <v-expansion-panel-text>
              <p class="hint mb-3">Kosongkan target bila jabatan tersebut tidak perlu diberi saran.
                "Tim" = RO sendiri + seluruh downline-nya.</p>
              <div v-for="a in aturanRo" :key="a.mvo_type_id" class="aturan-row">
                <div class="aturan-nama">{{ a.jabatan }}</div>
                <v-text-field v-model.number="a.periode_bulan" type="number" min="1" max="24" label="Periode (bulan)"
                  density="compact" variant="outlined" hide-details />
                <v-select v-model="a.basis" :items="basisItems" item-title="text" item-value="value" label="Basis RO"
                  density="compact" variant="outlined" hide-details />
                <v-text-field v-model="a.target_naik" type="number" min="0" label="Naik bila RO ≥" density="compact"
                  variant="outlined" hide-details clearable />
                <v-text-field v-model="a.target_turun" type="number" min="0" label="Turun bila RO <"
                  density="compact" variant="outlined" hide-details clearable />
              </div>
              <div class="d-flex justify-end mt-3">
                <v-btn color="primary" :loading="loadingAturan" prepend-icon="mdi-content-save" @click="simpanAturan">
                  Simpan Aturan</v-btn>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-card class="step-card">
          <v-card-text>
            <div class="saran-filter mb-3">
              <v-chip-group v-model="filterSaran" mandatory selected-class="chip-aktif" @update:model-value="muatSaran">
                <v-chip value="" variant="outlined">Semua</v-chip>
                <v-chip value="naik" variant="outlined">▲ Layak naik ({{ ringkasSaran.naik }})</v-chip>
                <v-chip value="turun" variant="outlined">▼ Perlu turun ({{ ringkasSaran.turun }})</v-chip>
                <v-chip value="aman" variant="outlined">● Aman ({{ ringkasSaran.aman }})</v-chip>
              </v-chip-group>
              <div class="saran-cari">
                <v-text-field v-model="filterCabang" label="Cabang" density="compact" variant="outlined" hide-details
                  clearable style="max-width: 130px;" @update:model-value="muatSaranDebounce" />
                <v-text-field v-model="filterCari" label="Cari nama / No ID" density="compact" variant="outlined"
                  prepend-inner-icon="mdi-magnify" hide-details clearable @update:model-value="muatSaranDebounce" />
              </div>
            </div>

            <v-data-table :headers="headersSaran" :items="saran" :loading="loadingSaran" :items-per-page="10"
              density="comfortable" :mobile="$vuetify.display.smAndDown"
              no-data-text="Belum ada saran. Atur target per jabatan terlebih dahulu.">
              <template #item.ro="{ item }">
                <b>{{ formatAngka(item.ro) }}</b>
                <div class="hint">{{ item.basis === 'tim' ? 'Tim' : 'Pribadi' }} · {{ item.periode_bulan }} bln</div>
              </template>
              <template #item.target="{ item }">
                <div v-if="item.target_naik !== null" class="hint">Naik ≥ {{ formatAngka(item.target_naik) }}</div>
                <div v-if="item.target_turun !== null" class="hint">Turun &lt; {{ formatAngka(item.target_turun) }}</div>
              </template>
              <template #item.saran="{ item }">
                <span class="saran" :class="`saran-${item.saran}`">
                  {{ item.saran === 'naik' ? `▲ Naik ke ${item.saran_ke}` : item.saran === 'turun' ? `▼ Turun ke ${item.saran_ke}` : '● Aman' }}
                </span>
              </template>
              <template #item.aksi="{ item }">
                <v-btn v-if="item.saran !== 'aman'" size="small" color="primary" variant="tonal" @click="prosesSaran(item)">
                  Proses</v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-window-item>

      <v-window-item value="riwayat">
        <v-card class="step-card">
          <v-card-text>
            <v-text-field v-model="cariRiwayat" label="Cari nama / No ID" variant="outlined" density="comfortable"
              prepend-inner-icon="mdi-magnify" hide-details clearable class="mb-3" @update:model-value="muatRiwayatDebounce" />
            <v-data-table :headers="headersRiwayat" :items="riwayat" :loading="loadingRiwayat" :items-per-page="10"
              density="comfortable" :mobile="$vuetify.display.smAndDown" hover @click:row="(e, { item }) => bukaDetail(item)">
              <template #item.created_at="{ item }">{{ formatTanggal(item.created_at) }}</template>
              <template #item.langkah="{ item }">
                <span class="jenis-chip">{{ labelJenis[item.jenis] || 'Pindah' }}</span>
                <div v-if="item.langkah" class="hint">Rencana #{{ item.rencana_id }} · langkah {{ item.langkah }}/{{ item.jumlah_langkah }}</div>
              </template>
              <template #item.jabatan="{ item }">
                <span v-if="item.jabatan_lama === item.jabatan_baru">{{ item.jabatan_lama }}</span>
                <span v-else>{{ item.jabatan_lama }} → <b class="baru">{{ item.jabatan_baru }}</b></span>
              </template>
              <template #item.no_id="{ item }">
                <span v-if="item.no_id_lama === item.no_id_baru">{{ item.no_id_lama || '-' }}</span>
                <span v-else>{{ item.no_id_lama || '-' }} → <b class="baru">{{ item.no_id_baru }}</b></span>
              </template>
              <template #item.atasan="{ item }">{{ item.atasan_lama || 'Owner' }} → {{ item.atasan_baru || 'Owner' }}</template>
              <template #item.anggota="{ item }">{{ item.jumlah_ikut }} ikut · {{ item.jumlah_tidak_ikut }} tidak</template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>

    <!-- Konfirmasi simpan -->
    <v-dialog v-model="konfirmasi" max-width="460">
      <v-card>
        <v-card-title class="text-h6">Simpan mutasi?</v-card-title>
        <v-card-text v-if="pratinjau">
          <template v-if="jumlahLangkah > 1">Rencana berisi <b>{{ jumlahLangkah }} langkah</b> dan disimpan sekaligus.</template>
          <template v-else-if="dipindah"><b>{{ member?.nama }}</b> menjadi <b>{{ dipindah.jabatan_baru }}</b> dengan No ID
            <b>{{ dipindah.no_id_baru }}</b>.</template>
          {{ pratinjau.ringkasan.no_id_berubah }} No ID akan berubah. Perubahan tercatat di riwayat.
          <ol v-if="jumlahLangkah > 1 || pratinjau.ringkasan.tukar_dengan" class="konfirmasi-langkah">
            <li v-for="l in pratinjau.ringkasan.langkah" :key="l.no">{{ l.teks }}</li>
          </ol>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="konfirmasi = false">Batal</v-btn>
          <v-btn color="primary" variant="flat" :loading="loadingSimpan" @click="simpan">Ya, simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Pindahkan downline kursi kosong ke upline lain -->
    <v-dialog v-model="dialogPindahkan.show" max-width="640" scrollable>
      <v-card v-if="dialogPindahkan.kursi">
        <v-card-title class="text-h6">Pindahkan downline kursi {{ labelKursi(dialogPindahkan.kursi) }}</v-card-title>
        <v-card-text>
          <p class="hint mb-2">Pilih upline baru untuk {{ dialogPindahkan.kursi.jumlah_downline }} downline kursi ini
            (beserta timnya). Daftar hanya berisi upline dengan jenjang yang sah.</p>
          <DaftarPilihMember :api="api" url="/mutasi/kandidat-atasan"
            :params="{ mvo_type_id: dialogPindahkan.kursi.downline_type }" placeholder="Cari nama / No ID upline"
            kosong="Tidak ada calon upline" @pilih="tambahPindahkan" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogPindahkan.show = false">Batal</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Detail riwayat -->
    <v-dialog v-model="detail.show" max-width="900">
      <v-card>
        <v-card-title class="text-h6">{{ detail.langkah.length ? `Rincian rencana (${detail.langkah.length} langkah)` : 'Rincian mutasi' }}</v-card-title>
        <v-card-text>
          <ol v-if="detail.langkah.length" class="konfirmasi-langkah mb-3">
            <li v-for="l in detail.langkah" :key="l.id">{{ l.catatan }}</li>
          </ol>
          <v-data-table :headers="headersDetail" :items="detail.items" :loading="detail.loading" :items-per-page="10"
            density="compact" :mobile="$vuetify.display.smAndDown">
            <template #item.no_id="{ item }">{{ item.no_id_lama || '-' }} → <b class="baru">{{ item.no_id_baru }}</b></template>
            <template #item.atasan="{ item }">{{ item.atasan_lama || 'Owner' }} → {{ item.atasan_baru || 'Owner' }}</template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="detail.show = false">Tutup</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" :timeout="5000">{{ snack.text }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "@/config";
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import DaftarPilihMember from "@/components/mutasi/DaftarPilihMember.vue";
import KursiTujuan from "@/components/mutasi/KursiTujuan.vue";
import { labelNomor, nomorMenurutRencana } from "@/utils/rencanaMutasi";
import { muatOwner, teksOwner } from "@/utils/owner";

muatOwner();

const api = axios.create({ baseURL: `${API_URL}/api`, timeout: 60000 });
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token") || Cookies.get("token");
  cfg.headers.Authorization = `Bearer ${token}`;
  cfg.headers.Accept = "application/json";
  return cfg;
});

const tab = ref("baru");
const snack = reactive({ show: false, text: "", color: "success" });
const toast = (text, color = "success") => Object.assign(snack, { show: true, text, color });
const pesanError = (e, fallback) => e?.response?.data?.message || e?.response?.data?.errors?.[0] || fallback;

const debounce = (fn, ms = 350) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

/* ---------- 1. member ---------- */
const memberId = ref(null);
const memberItems = ref([]);
const member = computed(() => memberItems.value.find((m) => m.id === memberId.value) || null);

function pilihDariDaftar(m) {
  memberItems.value = [m];
  memberId.value = m.id;
  pilihMember();
}

function gantiMember() {
  const k = kursiTarget.value;
  resetDraft();
  kursiTarget.value = k; // tetap mencari pengganti untuk kursi yang sama
  if (rencana.value.length) jadwalkanPratinjau();
  else pratinjau.value = null;
}

/* rencana (lihat bagian "rencana" di bawah) */
const rencana = ref([]); // [{ kunci, langkah: [payload langkah], teks: [teks langkah] }]
const langkahRencana = computed(() => rencana.value.flatMap((r) => r.langkah));
const kursiTarget = ref(null); // kursi kosong yang sedang dicarikan pengganti (dari ringkasan.kursi_kosong)
const dialogPindahkan = reactive({ show: false, kursi: null });
let kunciRencana = 0;

// Keadaan sesudah langkah-langkah rencana (tanpa isian sekarang): pemegang kursi & posisi member terbaru
const barisRencana = ref([]);
let urutRencana = 0;
async function muatKeadaanRencana() {
  const nomor = ++urutRencana;
  if (!rencana.value.length) {
    barisRencana.value = [];
    return;
  }
  try {
    const { data } = await api.post("/mutasi/pratinjau", { langkah: langkahRencana.value });
    if (nomor === urutRencana) barisRencana.value = data.baris || [];
  } catch (e) {
    if (nomor === urutRencana) barisRencana.value = [];
  }
}
watch(rencana, muatKeadaanRencana);
const posisiRencana = computed(() => {
  const b = barisRencana.value.find((x) => x.id === memberId.value);
  return b && (b.no_id_baru !== b.no_id_lama || b.jabatan_baru !== b.jabatan_lama || b.atasan_baru !== b.atasan_lama) ? b : null;
});

/* ---------- 2. posisi baru ---------- */
const jabatanList = ref([]);
const jabatanBaru = ref(null);
const atasanBaru = ref(null);
const atasanTerpilih = ref(null); // { id, nama, no_id, jabatan }
const pilihAtasanTerbuka = ref(false);
// Jabatan teratas (TM, MVO) boleh tanpa atasan — sama dengan aturan di MutasiController::kandidatAtasan
const bolehTanpaAtasan = computed(() => (jabatanList.value.find((j) => String(j.id) === String(jabatanBaru.value))?.level ?? 99) <= 1);

const jabatanItems = computed(() => jabatanList.value.map((j) => ({ ...j, label: `${j.name} — ${j.jabatan || ""}` })));

// No ID tujuan (kursi). Nomor yang dipegang orang lain → pemegangnya wajib pindah:
// tukar posisi (ke kursi lama member) atau ke kursi lain (kursi kosong / kursi orang ketiga = rotasi).
const modeNoId = ref("otomatis");
const noIdTujuan = ref(null);
const nasibPemegang = ref(null); // 'tukar' | 'lain'
const kursiPemegang = ref(null); // dari KursiTujuan: { mvo_type_id, parent_id, no_id_tujuan, pemegang, lengkap }
const nomorList = ref([]);
const loadingNomor = ref(false);
const jabatanDipilih = computed(() => jabatanList.value.find((x) => String(x.id) === String(jabatanBaru.value)));
const namaJabatanBaru = computed(() => jabatanDipilih.value?.name || "");
// Supplier ke bawah: No ID turunan dari upline, daftar kursinya dicari ke server
const jabatanTurunan = computed(() => jabatanDipilih.value?.mode === "turunan");
// Pemegang nomor menurut rencana (langkah yang sudah ditetapkan bisa memindahkan pemegang kursi)
const nomorRencana = computed(() => nomorMenurutRencana(nomorList.value, barisRencana.value));
const nomorItems = computed(() => nomorRencana.value.map((n) => ({ ...n, label: labelNomor(n, memberId.value) })));
const pemegangTujuan = computed(() => {
  const p = nomorRencana.value.find((n) => n.no_id === noIdTujuan.value)?.pemegang;
  return p && p.id !== memberId.value ? p : null;
});
const ambilKursiTerisi = computed(() => !!pemegangTujuan.value && !!nasibPemegang.value);
const rotasi = computed(() => ambilKursiTerisi.value && nasibPemegang.value === "lain" && !!kursiPemegang.value?.pemegang);
// Tukar posisi & rotasi = satu langkah tukar; pemegang lama ke kursi kosong lain = dua langkah
const pakaiTukar = computed(() => ambilKursiTerisi.value && (nasibPemegang.value === "tukar" || rotasi.value));
const duaLangkah = computed(() => ambilKursiTerisi.value && nasibPemegang.value === "lain" && !rotasi.value);

async function muatNomor(q = "") {
  if (!jabatanBaru.value) return;
  loadingNomor.value = true;
  try {
    const params = { mvo_type_id: jabatanBaru.value, user_id: memberId.value };
    if (jabatanTurunan.value) Object.assign(params, { q, parent_id: q ? undefined : atasanBaru.value || undefined });
    const { data } = await api.get("/mutasi/nomor", { params });
    // Nomor yang sedang terpilih tetap ada di daftar supaya labelnya tampil
    const terpilih = nomorList.value.find((n) => n.no_id === noIdTujuan.value);
    nomorList.value = terpilih && !data.data.some((n) => n.no_id === terpilih.no_id) ? [terpilih, ...data.data] : data.data;
  } catch (e) {
    toast(pesanError(e, "Gagal memuat daftar No ID"), "error");
  } finally {
    loadingNomor.value = false;
  }
}

// Kursi turunan dicari ke server; label pilihan yang sedang terpilih tidak dianggap kata kunci
const cariNomor = debounce((q) => {
  if (!jabatanTurunan.value || modeNoId.value !== "pilih") return;
  if (q && nomorItems.value.some((n) => n.no_id === noIdTujuan.value && n.label === q)) return;
  muatNomor(q || "");
});

function aturUlangNasib() {
  nasibPemegang.value = null;
  kursiPemegang.value = null;
  ikutStateTukar.value = {};
  ikutStateKetiga.value = {};
}

function aturUlangNoId() {
  noIdTujuan.value = null;
  aturUlangNasib();
}

function gantiModeNoId(v) {
  aturUlangNoId();
  if (v === "pilih") muatNomor();
  jadwalkanPratinjau();
}

function pilihNoId() {
  aturUlangNasib();
  jadwalkanPratinjau();
}

// Nasib pemegang lama berubah → pilihan ikut/tetap dihitung ulang dari jenjang yang baru
function gantiNasib() {
  if (nasibPemegang.value !== "lain") kursiPemegang.value = null;
  ikutState.value = {};
  ikutStateTukar.value = {};
  ikutStateKetiga.value = {};
  jadwalkanPratinjau();
}

function ubahKursiPemegang(k) {
  const rotasiLama = rotasi.value;
  kursiPemegang.value = k;
  if (rotasi.value !== rotasiLama) {
    ikutState.value = {};
    ikutStateTukar.value = {};
    ikutStateKetiga.value = {};
  }
  jadwalkanPratinjau();
}

async function muatJabatan() {
  try {
    const { data } = await api.get("/mutasi/jabatan");
    jabatanList.value = data.data;
  } catch (e) {
    toast(pesanError(e, "Gagal memuat jabatan"), "error");
  }
}

async function ambilKandidat(typeId, q) {
  const { data } = await api.get("/mutasi/kandidat-atasan", { params: { mvo_type_id: typeId, user_id: memberId.value, q } });
  return data.data.map((u) => ({ ...u, label: `${u.nama} — ${u.no_id || "-"} — ${u.jabatan}` }));
}

// Pilihan yang sedang terpilih tetap ada di daftar (supaya labelnya tampil), tapi hanya
// di atas bila cocok dengan kata yang dicari, agar hasil pencarian tidak tertutup.
function gabungTerpilih(terpilih, items, q) {
  const lain = items.filter((i) => !terpilih || i.id !== terpilih.id);
  if (!terpilih) return lain;
  const cocok = !q || terpilih.label.toLowerCase().includes(q.toLowerCase());
  return cocok ? [terpilih, ...lain] : [...lain, terpilih];
}

function pilihMember() {
  pratinjau.value = null;
  ikutState.value = {};
  penampung.value = null;
  penampungItems.value = [];
  if (!member.value) return;
  const m = member.value;
  // Posisi awal = posisi menurut rencana bila member sudah diubah di langkah sebelumnya
  const r = barisRencana.value.find((b) => b.id === m.id);
  // Pengganti: jabatan mengikuti kursi kosong yang diisi
  jabatanBaru.value = String(kursiTarget.value ? kursiTarget.value.mvo_type_id : r ? r.mvo_type_id : m.mvo_type_id);
  const parent = r ? r.parent_id : m.parent_id;
  atasanBaru.value = parent || null;
  const noIdParent = barisRencana.value.find((b) => b.id === parent)?.no_id_baru
    ?? (parent === m.parent_id ? m.atasan_no_id : null);
  atasanTerpilih.value = !parent ? null
    : { id: parent, nama: r ? r.atasan_baru : m.atasan_nama, no_id: noIdParent };
  pilihAtasanTerbuka.value = false;
  modeNoId.value = "otomatis";
  nomorList.value = [];
  aturUlangNoId();
  jadwalkanPratinjau();
}

// Jabatan berubah → atasan lama belum tentu sah, jadi daftar calon atasan langsung dibuka
function gantiJabatan() {
  atasanBaru.value = null;
  atasanTerpilih.value = null;
  pilihAtasanTerbuka.value = true;
  aturUlangNoId();
  nomorList.value = [];
  if (modeNoId.value === "pilih") muatNomor();
  jadwalkanPratinjau();
}

function pilihAtasan(a) {
  atasanBaru.value = a ? a.id : null;
  atasanTerpilih.value = a;
  pilihAtasanTerbuka.value = false;
  // Kursi turunan bergantung pada upline: nomor tujuan lama belum tentu sah
  if (jabatanTurunan.value && modeNoId.value === "pilih") {
    aturUlangNoId();
    muatNomor();
  }
  jadwalkanPratinjau();
}

/* ---------- 3. anggota ---------- */
const ikutState = ref({}); // downline langsung orang yang dipindah: true = ikut
const ikutStateTukar = ref({}); // downline langsung pemegang lama kursi tujuan: true = ikut dia, false = tetap di kursi
const ikutStateKetiga = ref({}); // rotasi: downline langsung orang ketiga
const dilepasOtomatis = new Map(); // state centang → id downline yang dilepas otomatis karena jenjang tidak cocok
const penampung = ref(null);
const penampungItems = ref([]);
const loadingPenampung = ref(false);

// Downline langsung per orang, dari langkah rencana di pratinjau (ringkasan.langkah[].anak)
const anakPer = computed(() => {
  const p = pratinjau.value;
  const L = (p?.ringkasan?.langkah || []).slice(langkahRencana.value.length); // hanya langkah isian sekarang
  const baris = new Map((p?.baris || []).map((b) => [b.id, b]));
  const ambil = (l, ids) => (l ? ids.filter((id) => baris.has(id)).map((id) => ({ ...baris.get(id), boleh_ikut: l.boleh_ikut?.[id] })) : []);
  const lx = [...L].reverse().find((l) => l.aktor === memberId.value);
  if (duaLangkah.value) {
    const ly = L.find((l) => l.aktor === pemegangTujuan.value?.id);
    return { x: ambil(lx, lx?.anak.x || []), y: ambil(ly, (ly?.anak.x || []).filter((id) => id !== memberId.value)), z: [] };
  }
  return { x: ambil(lx, lx?.anak.x || []), y: ambil(lx, lx?.anak.y || []), z: ambil(lx, lx?.anak.z || []) };
});
const anakLangsung = computed(() => anakPer.value.x);
const anakTukar = computed(() => anakPer.value.y);
const anakKetiga = computed(() => anakPer.value.z);
const jumlahAnakLangsung = computed(() => anakLangsung.value.length + anakTukar.value.length + anakKetiga.value.length);
// Downline yang belum punya status: ikut bila jenjangnya cocok (sama dengan centang bawaan)
const ikutKah = (state, a) => (a.id in state ? !!state[a.id] : a.boleh_ikut !== false);
const adaTidakIkut = computed(() => anakLangsung.value.some((a) => !ikutKah(ikutState.value, a)));

// Kelompok checklist: downline orang yang dipindah, pemegang lama kursi tujuan, dan (rotasi) orang ketiga
const kelompokDownline = computed(() => {
  const g = [];
  const y = pemegangTujuan.value;
  const z = rotasi.value ? kursiPemegang.value.pemegang : null;
  const nama = member.value?.nama || "";
  if (anakLangsung.value.length) {
    g.push({
      kunci: "x", judul: `Downline ${nama}`, nama, daftar: anakLangsung.value, state: ikutState.value,
      kalauTidak: pakaiTukar.value
        ? `tetap di posisi, pindah ke ${z ? z.nama : y.nama}`
        : "menunggu di kursi lama yang kosong, atau ke upline penampung bila dipilih",
    });
  }
  if (ambilKursiTerisi.value && anakTukar.value.length) {
    g.push({
      kunci: "y", judul: `Downline ${y.nama} (pemegang lama ${noIdTujuan.value})`, nama: y.nama,
      daftar: anakTukar.value, state: ikutStateTukar.value,
      kalauTidak: `tetap di kursi ${noIdTujuan.value}, pindah ke ${nama}`,
    });
  }
  if (z && anakKetiga.value.length) {
    g.push({
      kunci: "z", judul: `Downline ${z.nama} (pemegang lama ${kursiPemegang.value.no_id_tujuan})`, nama: z.nama,
      daftar: anakKetiga.value, state: ikutStateKetiga.value,
      kalauTidak: `tetap di kursi ${kursiPemegang.value.no_id_tujuan}, pindah ke ${y.nama}`,
    });
  }
  return g;
});

function setStateIkut(kunci, id, nilai) {
  const s = { x: ikutState, y: ikutStateTukar, z: ikutStateKetiga }[kunci];
  s.value = { ...s.value, [id]: nilai };
}

function setelahUbahIkut(kunci) {
  if (kunci === "x" && !pakaiTukar.value) cariPenampung("");
  jadwalkanPratinjau();
}

function toggleIkut(kunci, id, nilai) {
  setStateIkut(kunci, id, nilai);
  setelahUbahIkut(kunci);
}

// Centang semua (yang jenjangnya cocok) / kosongkan semua
function setSemua(g, nilai) {
  g.daftar.forEach((a) => setStateIkut(g.kunci, a.id, nilai && a.boleh_ikut !== false));
  setelahUbahIkut(g.kunci);
}

const cariPenampung = debounce(async (q) => {
  const lepas = anakLangsung.value.find((a) => !ikutKah(ikutState.value, a));
  if (!lepas) return;
  const terpilih = penampungItems.value.find((a) => a.id === penampung.value);
  if (terpilih && q === terpilih.label) return;
  const typeId = jabatanList.value.find((j) => j.name === lepas.jabatan_lama)?.id;
  if (!typeId) return;
  loadingPenampung.value = true;
  try {
    const items = await ambilKandidat(typeId, q || "");
    penampungItems.value = gabungTerpilih(terpilih, items, q);
  } catch (e) {
    toast(pesanError(e, "Gagal memuat penampung"), "error");
  } finally {
    loadingPenampung.value = false;
  }
});

/* ---------- 4. pratinjau & simpan ---------- */
const pratinjau = ref(null);
const loadingPratinjau = ref(false);
const hanyaBerubah = ref(true);
const catatan = ref("");
const konfirmasi = ref(false);
const loadingSimpan = ref(false);
const labelPeran = {
  dipindah: "Dipindah", ikut: "Ikut", tidak_ikut: "Tidak ikut", ditukar: "Ditukar", tetap: "Tetap di posisi",
  mengisi: "Mengisi kursi", pindah_upline: "Pindah upline", kosong: "Kursi kosong",
};

// Langkah dari isian yang sedang dibuka (0 langkah bila belum memilih member)
const draftLangkah = () => {
  if (!memberId.value) return [];
  const tidak = (daftar, state) => daftar.filter((a) => !ikutKah(state, a)).map((a) => a.id);
  const tidakX = tidak(anakLangsung.value, ikutState.value);
  const penampungX = adaTidakIkut.value ? penampung.value : null;
  if (kursiTarget.value) {
    // Pengganti mengisi kursi kosong (jabatan & upline mengikuti kursi)
    return [{ user_id: memberId.value, no_id_tujuan: kursiTarget.value.no_id, kursi_id: kursiTarget.value.id,
      tidak_ikut: tidakX, penampung_id: penampungX }];
  }
  if (duaLangkah.value) {
    // 1) pemegang lama pindah ke kursi barunya (nomornya ditinggal), 2) member mengisi kursi itu
    const y = pemegangTujuan.value;
    const k = kursiPemegang.value || {};
    return [
      { user_id: y.id, mvo_type_id: k.mvo_type_id, parent_id: k.parent_id, no_id_tujuan: k.no_id_tujuan, lepas_nomor: true,
        tidak_ikut: [memberId.value, ...tidak(anakTukar.value, ikutStateTukar.value)] },
      { user_id: memberId.value, no_id_tujuan: noIdTujuan.value, mvo_type_id: y.mvo_type_id, parent_id: y.parent_id,
        tidak_ikut: tidakX, penampung_id: penampungX },
    ];
  }
  return [{
    user_id: memberId.value,
    mvo_type_id: jabatanBaru.value,
    parent_id: atasanBaru.value,
    no_id_tujuan: modeNoId.value === "pilih" ? noIdTujuan.value : null,
    tukar: pakaiTukar.value,
    no_id_tujuan_2: rotasi.value ? kursiPemegang.value.no_id_tujuan : null,
    penampung_id: pakaiTukar.value ? null : penampungX,
    tidak_ikut: tidakX,
    tidak_ikut_tukar: pakaiTukar.value ? tidak(anakTukar.value, ikutStateTukar.value) : [],
    tidak_ikut_ketiga: rotasi.value ? tidak(anakKetiga.value, ikutStateKetiga.value) : [],
  }];
};

// Seluruh rencana: langkah yang sudah ditetapkan + langkah yang sedang diisi
const payload = () => ({ langkah: [...langkahRencana.value, ...draftLangkah()], catatan: catatan.value });

let urutPratinjau = 0;
const jadwalkanPratinjau = debounce(async () => {
  if (!memberId.value && !rencana.value.length) return;
  if (memberId.value && !jabatanBaru.value) return;
  const nomor = ++urutPratinjau;
  if (duaLangkah.value && !kursiPemegang.value?.lengkap) {
    pratinjau.value = { errors: [`Lengkapi kursi baru ${pemegangTujuan.value.nama}: jabatan, No ID, dan upline.`], baris: [], ringkasan: {} };
    loadingPratinjau.value = false;
    return;
  }
  loadingPratinjau.value = true;
  try {
    const dikirim = JSON.stringify(payload());
    const { data } = await api.post("/mutasi/pratinjau", JSON.parse(dikirim));
    if (nomor !== urutPratinjau) return; // abaikan respons lama
    pratinjau.value = data;
    // Downline langsung yang belum punya status: ikut bila jenjangnya cocok (bawaan: ikut orangnya)
    // Jabatan/upline tujuan berubah: downline yang jenjangnya tidak cocok lagi dilepas centangnya,
    // dan dicentang kembali bila pilihan dikembalikan sehingga jenjangnya cocok lagi
    const isi = (daftar, st) => {
      const baru = { ...st.value };
      if (!dilepasOtomatis.has(st)) dilepasOtomatis.set(st, new Set());
      const lepas = dilepasOtomatis.get(st);
      daftar.forEach((a) => {
        if (!(a.id in baru)) {
          baru[a.id] = a.boleh_ikut !== false;
          lepas.delete(a.id);
        } else if (a.boleh_ikut === false && baru[a.id]) {
          baru[a.id] = false;
          lepas.add(a.id);
        } else if (a.boleh_ikut !== false && lepas.has(a.id)) {
          baru[a.id] = true;
          lepas.delete(a.id);
        }
      });
      st.value = baru;
    };
    isi(anakLangsung.value, ikutState);
    isi(anakTukar.value, ikutStateTukar);
    isi(anakKetiga.value, ikutStateKetiga);
    if (JSON.stringify(payload()) !== dikirim) jadwalkanPratinjau();
  } catch (e) {
    if (nomor === urutPratinjau) {
      pratinjau.value = { errors: e?.response?.data?.errors || [pesanError(e, "Gagal membuat pratinjau")], baris: [], ringkasan: {} };
    }
  } finally {
    if (nomor === urutPratinjau) loadingPratinjau.value = false;
  }
}, 300);

const dipindah = computed(() => pratinjau.value?.baris?.find((b) => b.id === memberId.value));
const kursiKosong = computed(() => pratinjau.value?.ringkasan?.kursi_kosong || []);

// Ada downline yang tidak ikut (termasuk yang otomatis tidak dicentang): siapkan daftar calon penampung
watch(adaTidakIkut, (ada) => {
  if (ada && !pakaiTukar.value && !penampungItems.value.length) cariPenampung("");
});
const barisTampil = computed(() => {
  const b = pratinjau.value?.baris || [];
  return hanyaBerubah.value
    ? b.filter((x) => ["dipindah", "ditukar", "mengisi", "kosong"].includes(x.peran) || x.no_id_lama !== x.no_id_baru || x.atasan_lama !== x.atasan_baru)
    : b;
});
// Isian sekarang sah (kursi kosong boleh tersisa): boleh lanjut memilih pengganti / memindahkan downline
const bisaLanjut = computed(() => !!pratinjau.value && !pratinjau.value.errors.length && !loadingPratinjau.value);
const bisaSimpan = computed(() => bisaLanjut.value && !kursiKosong.value.length);
const jumlahLangkah = computed(() => pratinjau.value?.ringkasan?.langkah?.length || 0);

const headersPratinjau = [
  { title: "Nama", key: "nama" },
  { title: "Status", key: "peran" },
  { title: "Jabatan", key: "jabatan", sortable: false },
  { title: "No ID", key: "no_id", sortable: false },
  { title: "Upline", key: "atasan", sortable: false },
];

async function simpan() {
  loadingSimpan.value = true;
  try {
    const { data } = await api.post("/mutasi", payload());
    konfirmasi.value = false;
    toast(data.message);
    reset();
    tab.value = "riwayat";
    muatRiwayat();
  } catch (e) {
    konfirmasi.value = false;
    toast(pesanError(e, "Gagal menyimpan mutasi"), "error");
    jadwalkanPratinjau();
  } finally {
    loadingSimpan.value = false;
  }
}

// Kosongkan isian langkah yang sedang dibuka (rencana yang sudah ditetapkan tetap)
function resetDraft() {
  modeNoId.value = "otomatis";
  nomorList.value = [];
  aturUlangNoId();
  memberId.value = null;
  memberItems.value = [];
  jabatanBaru.value = null;
  atasanBaru.value = null;
  atasanTerpilih.value = null;
  pilihAtasanTerbuka.value = false;
  penampung.value = null;
  penampungItems.value = [];
  ikutState.value = {};
  kursiTarget.value = null;
}

function reset() {
  resetDraft();
  rencana.value = [];
  pratinjau.value = null;
  catatan.value = "";
}

/* ---------- rencana: beberapa langkah, disimpan sekaligus ---------- */
const labelKursi = (k) => k.no_id || `${k.jabatan} bekas ${k.asal}`;

// Tetapkan isian sekarang sebagai langkah rencana, lalu kosongkan isian untuk langkah berikutnya
function tetapkanDraft() {
  const d = draftLangkah();
  if (!d.length) return;
  const teks = (pratinjau.value?.ringkasan?.langkah || []).slice(langkahRencana.value.length).map((l) => l.teks);
  rencana.value = [...rencana.value, { kunci: ++kunciRencana, langkah: d, teks }];
  resetDraft();
}

function tambahLangkah() {
  tetapkanDraft();
  window.scrollTo({ top: 0, behavior: "smooth" });
  jadwalkanPratinjau();
}

function mulaiPengganti(k) {
  tetapkanDraft();
  kursiTarget.value = k;
  window.scrollTo({ top: 0, behavior: "smooth" });
  jadwalkanPratinjau();
}

function batalPengganti() {
  kursiTarget.value = null;
  jadwalkanPratinjau();
}

function bukaPindahkan(k) {
  Object.assign(dialogPindahkan, { show: true, kursi: k });
}

function tambahPindahkan(u) {
  const k = dialogPindahkan.kursi;
  dialogPindahkan.show = false;
  tetapkanDraft();
  rencana.value = [...rencana.value, {
    kunci: ++kunciRencana,
    langkah: [{ jenis: "pindahkan", kursi_id: k.id, no_id_tujuan: k.no_id, penampung_id: u.id }],
    teks: [`Downline kursi kosong ${labelKursi(k)} (${k.jumlah_downline} orang) dipindah ke ${u.nama}`],
  }];
  jadwalkanPratinjau();
}

function hapusRencanaTerakhir() {
  rencana.value = rencana.value.slice(0, -1);
  if (!memberId.value && !rencana.value.length) pratinjau.value = null;
  else jadwalkanPratinjau();
}

/* ---------- saran RO ---------- */
const aturanRo = ref([]);
const loadingAturan = ref(false);
const panelAturan = ref(null);
const saran = ref([]);
const ringkasSaran = ref({ naik: 0, turun: 0, aman: 0 });
const loadingSaran = ref(false);
const filterSaran = ref("");
const filterCabang = ref("");
const filterCari = ref("");
const basisItems = [
  { text: "Pribadi", value: "pribadi" },
  { text: "Tim (+ downline)", value: "tim" },
];
const headersSaran = [
  { title: "Nama", key: "nama" },
  { title: "Jabatan", key: "jabatan" },
  { title: "No ID", key: "no_id" },
  { title: "Cabang", key: "cabang" },
  { title: "RO", key: "ro" },
  { title: "Target", key: "target", sortable: false },
  { title: "Saran", key: "saran" },
  { title: "", key: "aksi", sortable: false, align: "end" },
];
const formatAngka = (n) => Number(n ?? 0).toLocaleString("id-ID");

async function muatAturan() {
  try {
    const { data } = await api.get("/saran-mutasi/aturan");
    aturanRo.value = data.data;
    // Belum ada target sama sekali → buka panel aturan supaya admin langsung mengisinya
    if (!data.data.some((a) => a.target_naik !== null || a.target_turun !== null)) panelAturan.value = "aturan";
  } catch (e) {
    toast(pesanError(e, "Gagal memuat aturan"), "error");
  }
}

async function simpanAturan() {
  loadingAturan.value = true;
  try {
    const { data } = await api.put("/saran-mutasi/aturan", { aturan: aturanRo.value });
    aturanRo.value = data.data;
    toast(data.message);
    muatSaran();
  } catch (e) {
    toast(pesanError(e, "Gagal menyimpan aturan"), "error");
  } finally {
    loadingAturan.value = false;
  }
}

async function muatSaran() {
  loadingSaran.value = true;
  try {
    const { data } = await api.get("/saran-mutasi", {
      params: { status: filterSaran.value || "", cabang: filterCabang.value || "", q: filterCari.value || "" },
    });
    saran.value = data.data;
    ringkasSaran.value = data.ringkasan;
  } catch (e) {
    toast(pesanError(e, "Gagal memuat saran"), "error");
  } finally {
    loadingSaran.value = false;
  }
}
const muatSaranDebounce = debounce(muatSaran, 400);

function muatSaranAwal() {
  if (!aturanRo.value.length) muatAturan();
  muatSaran();
}

// Buka Mutasi Baru dengan member & jabatan tujuan dari saran
async function prosesSaran(item) {
  try {
    const { data } = await api.get("/mutasi/cari-member", { params: { id: item.id } });
    const m = data.data[0];
    if (!m) return toast("Member tidak ditemukan", "error");
    memberItems.value = [{ ...m, label: `${m.nama} — ${m.no_id || "tanpa No ID"} — ${m.jabatan}` }];
    memberId.value = m.id;
    tab.value = "baru";
    pilihMember();
    jabatanBaru.value = String(item.saran_ke_id);
    catatan.value = `Saran RO: ${item.saran === "naik" ? "naik" : "turun"} (RO ${formatAngka(item.ro)})`;
    gantiJabatan();
  } catch (e) {
    toast(pesanError(e, "Gagal membuka mutasi"), "error");
  }
}

/* ---------- riwayat ---------- */
const riwayat = ref([]);
const loadingRiwayat = ref(false);
const cariRiwayat = ref("");
const detail = reactive({ show: false, items: [], langkah: [], loading: false });

const labelJenis = { pindah: "Pindah", isi: "Mengisi kursi", tukar: "Tukar posisi", pindahkan: "Pindahkan downline" };
const headersRiwayat = [
  { title: "Tanggal", key: "created_at" },
  { title: "Jenis", key: "langkah", sortable: false },
  { title: "Nama", key: "nama" },
  { title: "Jabatan", key: "jabatan", sortable: false },
  { title: "No ID", key: "no_id", sortable: false },
  { title: "Upline", key: "atasan", sortable: false },
  { title: "Downline", key: "anggota", sortable: false },
  { title: "No ID berubah", key: "jumlah_no_id_berubah" },
  { title: "Oleh", key: "created_by" },
];
// Kolom Langkah hanya untuk mutasi yang merupakan bagian dari rencana
const headersDetail = computed(() => [
  ...(detail.langkah.length ? [{ title: "Langkah", key: "langkah" }] : []),
  { title: "Nama", key: "nama" },
  { title: "No ID", key: "no_id", sortable: false },
  { title: "Upline", key: "atasan", sortable: false },
  { title: "Keterangan", key: "keterangan" },
]);

async function muatRiwayat() {
  loadingRiwayat.value = true;
  try {
    const { data } = await api.get("/mutasi", { params: { q: cariRiwayat.value || "" } });
    riwayat.value = data.data;
  } catch (e) {
    toast(pesanError(e, "Gagal memuat riwayat"), "error");
  } finally {
    loadingRiwayat.value = false;
  }
}
const muatRiwayatDebounce = debounce(muatRiwayat);

async function bukaDetail(item) {
  Object.assign(detail, { show: true, items: [], langkah: [], loading: true });
  try {
    const { data } = await api.get(`/mutasi/${item.id}`);
    detail.items = data.data;
    detail.langkah = data.langkah || [];
  } catch (e) {
    toast(pesanError(e, "Gagal memuat rincian"), "error");
  } finally {
    detail.loading = false;
  }
}

const formatTanggal = (s) => (s ? new Date(s.replace(" ", "T")).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-");

const isSuperadmin = localStorage.getItem("mvo_type_id") === "superadmin";
if (isSuperadmin) muatJabatan();
</script>

<style scoped>
.step-card {
  border: 1px solid var(--baba-border);
  box-shadow: var(--baba-shadow) !important;
}

.step-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 0;
  font-weight: 700;
  color: var(--baba-text);
}

.step-no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--baba-ink);
  color: var(--baba-gold-light);
  font-size: 0.85rem;
}

.head-note {
  margin-left: auto;
  font-weight: 500;
  font-size: 0.8rem;
  color: var(--baba-muted);
}

.member-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 8px;
  padding: 12px;
  border-radius: var(--baba-radius);
  background: var(--baba-gold-soft);
}

.member-info .lbl {
  display: block;
  font-size: 0.75rem;
  color: var(--baba-muted);
}

.atasan-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--baba-muted);
  margin-bottom: 6px;
}

.atasan-terpilih {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--baba-radius);
  border: 1px solid var(--baba-border);
  background: #fff;
}

.atasan-teks {
  flex: 1;
  min-width: 0;
}

.atasan-meta {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--baba-gold-dark);
}

.atasan-kosong {
  color: var(--baba-muted);
}

.hint {
  font-size: 0.8rem;
  color: var(--baba-muted);
}

.anak-list {
  display: grid;
  gap: 8px;
}

.anak-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--baba-border);
  border-radius: 12px;
  cursor: pointer;
}

.anak-item :deep(.v-selection-control) {
  flex: 0 0 auto;
}

.anak-text {
  flex: 1 1 auto;
  min-width: 0;
  text-align: left;
}

.anak-off {
  background: #fafafa;
}

.anak-blok {
  cursor: not-allowed;
}

.anak-nama {
  font-weight: 700;
}

.anak-meta {
  font-size: 0.8rem;
  color: var(--baba-muted);
}

.anak-alasan {
  font-size: 0.78rem;
  color: var(--baba-danger);
}

.ringkas {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.r-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: #f1f1f1;
  font-size: 0.85rem;
}

.r-gold {
  background: var(--baba-gold-soft);
  color: var(--baba-gold-dark);
}

.baru {
  color: var(--baba-gold-dark);
}

.peran {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
}

.peran-dipindah {
  background: var(--baba-ink);
  color: var(--baba-gold-light);
}

.peran-ikut {
  background: #e8f5e9;
  color: #2e7d32;
}

.peran-tidak_ikut {
  background: #fff3e0;
  color: #c77700;
}

.peran-ditukar {
  background: var(--baba-gold);
  color: var(--baba-ink);
}

.peran-tetap {
  background: #e3f2fd;
  color: #1565c0;
}

.rencana-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dashed var(--baba-border);
}

.rencana-no {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--baba-gold-soft);
  color: var(--baba-gold-dark);
  font-size: 0.8rem;
  font-weight: 700;
}

.rencana-teks {
  flex: 1;
  min-width: 0;
  font-size: 0.88rem;
}

.kursi-kosong {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px 10px;
  padding: 10px 12px;
  border: 1px solid #f5c2c0;
  border-radius: var(--baba-radius);
  background: #fdf3f2;
}

.kk-ikon {
  margin-top: 2px;
}

.kk-teks {
  flex: 1 1 260px;
  min-width: 0;
  font-size: 0.88rem;
}

.kk-meta {
  color: var(--baba-muted);
}

.kk-aksi {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.jenis-chip {
  padding: 2px 8px;
  border-radius: 8px;
  background: var(--baba-gold-soft);
  color: var(--baba-gold-dark);
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.konfirmasi-langkah {
  margin: 10px 0 0 18px;
  font-size: 0.85rem;
}

.nasib-pilihan :deep(.v-label) {
  font-size: 0.85rem;
  opacity: 1;
}

.peran-mengisi {
  background: var(--baba-gold);
  color: var(--baba-ink);
}

.peran-kosong {
  background: #fdecea;
  color: #c62828;
}

.peran-pindah_upline {
  background: #fff3e0;
  color: #c77700;
}

.kelompok-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}

.aturan-row {
  display: grid;
  grid-template-columns: 110px repeat(4, minmax(0, 1fr));
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.aturan-nama {
  font-weight: 700;
}

.saran-filter {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
}

.saran-cari {
  display: flex;
  gap: 8px;
  flex: 1 1 320px;
  max-width: 460px;
}

.chip-aktif {
  background: var(--baba-ink) !important;
  color: var(--baba-gold-light) !important;
  border-color: var(--baba-ink) !important;
}

.saran {
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.saran-naik {
  background: #e8f5e9;
  color: #2e7d32;
}

.saran-turun {
  background: #fdecea;
  color: #c62828;
}

.saran-aman {
  background: #f1f1f1;
  color: var(--baba-muted);
}

@media (max-width: 959.98px) {
  .aturan-row {
    grid-template-columns: 1fr 1fr;
    padding-bottom: 10px;
    border-bottom: 1px dashed var(--baba-border);
  }

  .aturan-nama {
    grid-column: 1 / -1;
  }

  .saran-cari {
    max-width: none;
  }
}
</style>
