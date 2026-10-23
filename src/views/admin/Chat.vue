<template>
  <!-- Chat grup: GLOBAL (semua member) + grup cabang. Server: repo chatroom-baba (lihat utils/chatKoneksi.js) -->
  <div class="chat-halaman">
    <Breadcrumb :items="[{ title: 'Dashboard', to: '/admin/dashboard' }, { title: 'Chat' }]" />

    <div class="chat-kartu" :class="{ 'buka-percakapan': !!grup }">
      <!-- ===== Daftar grup ===== -->
      <aside class="daftar">
        <div class="daftar-kepala">
          <span class="daftar-judul"><v-icon size="20" color="#E6B422">mdi-forum</v-icon> Grup Chat</span>
          <span v-if="!chatState.terhubung" class="status-sambung" :title="chatState.galat || 'Koneksi realtime terputus'">
            <v-progress-circular indeterminate size="12" width="2" /> Menyambung ulang…
          </span>
        </div>
        <div v-if="!chatState.terhubung && chatState.galat" class="alasan-sambung">
          <v-icon size="16">mdi-alert-circle-outline</v-icon> {{ chatState.galat }}
        </div>
        <div class="daftar-isi baba-gulir">
          <div v-if="loadingGrup && !grupList.length" class="kosong">Memuat grup…</div>
          <div v-else-if="galatGrup" class="kosong">
            {{ galatGrup }}
            <div><v-btn size="small" variant="tonal" color="#B8890F" class="mt-2" @click="muatGrup">Coba lagi</v-btn></div>
          </div>
          <button v-for="g in grupList" :key="g.id" type="button" class="grup-item"
            :class="{ aktif: grup && grup.id === g.id }" @click="bukaGrup(g)">
            <span class="grup-avatar" :class="{ global: g.room_name === 'GLOBAL' }">
              <v-icon size="22">{{ g.room_name === "GLOBAL" ? "mdi-earth" : "mdi-office-building-marker" }}</v-icon>
            </span>
            <span class="grup-teks">
              <span class="grup-baris">
                <span class="grup-nama">{{ g.label }}</span>
                <span v-if="g.last_message" class="grup-waktu">{{ waktuSingkat(g.last_message.created_at) }}</span>
              </span>
              <span class="grup-baris">
                <span class="grup-cuplikan">
                  <template v-if="g.last_message">
                    <b>{{ namaPengirimSingkat(g.last_message) }}:</b>
                    {{ g.last_message.dihapus ? "Pesan dihapus" : g.last_message.message }}
                  </template>
                  <template v-else>Belum ada pesan</template>
                </span>
                <span v-if="belumDibaca(g)" class="grup-lencana">{{ belumDibaca(g) > 99 ? "99+" : belumDibaca(g) }}</span>
              </span>
            </span>
          </button>
        </div>
      </aside>

      <!-- ===== Percakapan ===== -->
      <section class="percakapan">
        <div v-if="!grup" class="sambutan">
          <v-icon size="64" color="#E6B422">mdi-chat-processing-outline</v-icon>
          <div class="sambutan-judul">Pilih grup untuk mulai mengobrol</div>
          <div class="sambutan-sub">GLOBAL untuk semua member, grup cabang untuk member cabang Anda.</div>
        </div>

        <template v-else>
          <div class="percakapan-kepala">
            <v-btn icon variant="text" size="small" class="tombol-kembali" title="Kembali ke daftar grup" @click="tutupGrup">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <span class="grup-avatar kecil" :class="{ global: grup.room_name === 'GLOBAL' }">
              <v-icon size="18">{{ grup.room_name === "GLOBAL" ? "mdi-earth" : "mdi-office-building-marker" }}</v-icon>
            </span>
            <div class="percakapan-judul">
              <div class="judul-nama">{{ grup.label }}</div>
              <button type="button" class="judul-anggota" @click="bukaAnggota">
                <v-icon size="14">mdi-account-group</v-icon>
                {{ jumlahAnggota === null ? "Lihat anggota" : `${angka(jumlahAnggota)} anggota` }}
              </button>
            </div>
          </div>

          <div ref="badan" class="badan baba-gulir" @scroll="cekGulir">
            <div v-if="adaLagi" class="muat-lagi">
              <v-btn size="small" variant="tonal" color="#B8890F" :loading="loadingLama" @click="muatSebelumnya">
                Muat pesan sebelumnya</v-btn>
            </div>
            <div v-if="loadingPesan" class="kosong">Memuat pesan…</div>
            <div v-else-if="!pesan.length" class="kosong">Belum ada pesan. Mulai percakapan!</div>

            <template v-for="(m, i) in pesan" :key="m.id">
              <div v-if="hariBaru(i)" class="pemisah-hari"><span>{{ labelHari(m.created_at) }}</span></div>
              <div class="baris-pesan" :class="{ saya: dariSaya(m) }">
                <div class="gelembung" :class="{ saya: dariSaya(m), dihapus: m.dihapus }">
                  <div v-if="!dariSaya(m) && !samaPengirim(i)" class="pengirim">
                    <span class="pengirim-nama">{{ m.sender?.nama || "Member" }}</span>
                    <span v-if="m.sender?.superadmin" class="tanda-admin">Admin</span>
                    <span v-else class="pengirim-meta">{{ [m.sender?.no_id, m.sender?.cabang].filter(Boolean).join(" · ") }}</span>
                  </div>
                  <div v-if="m.dihapus" class="isi isi-dihapus">
                    <v-icon size="14" class="me-1">mdi-cancel</v-icon>Pesan dihapus admin
                  </div>
                  <div v-else class="isi">{{ m.message }}</div>
                  <div class="kaki-pesan">
                    <span>{{ jam(m.created_at) }}</span>
                    <v-btn v-if="isSuperadmin && !m.dihapus" icon size="x-small" variant="text" class="hapus-btn"
                      title="Hapus pesan" @click="mintaHapus(m)">
                      <v-icon size="16">mdi-delete-outline</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <button v-if="adaPesanBaru" type="button" class="pesan-baru" @click="keBawah('smooth')">
            Pesan baru <v-icon size="16">mdi-arrow-down</v-icon>
          </button>

          <div class="tulis">
            <v-menu v-model="menuEmoji" :close-on-content-click="false" location="top start">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon variant="text" size="small" title="Emoji">
                  <v-icon>mdi-emoticon-happy-outline</v-icon>
                </v-btn>
              </template>
              <div class="emoji-kotak">
                <button v-for="e in EMOJI" :key="e" type="button" class="emoji" @click="tambahEmoji(e)">{{ e }}</button>
              </div>
            </v-menu>
            <v-textarea v-model="draf" placeholder="Tulis pesan..." variant="outlined" density="compact" rows="1"
              max-rows="4" auto-grow hide-details class="kolom-tulis" :maxlength="PANJANG_MAKS"
              @keydown.enter.exact.prevent="kirim" />
            <v-btn icon class="tombol-kirim" :disabled="!draf.trim() || mengirim" :loading="mengirim" title="Kirim"
              @click="kirim">
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </div>
          <div v-if="draf.length > PANJANG_MAKS - 200" class="hitung-karakter">{{ draf.length }}/{{ PANJANG_MAKS }}</div>
        </template>
      </section>
    </div>

    <!-- Anggota grup -->
    <v-dialog v-model="dialogAnggota" max-width="520" scrollable>
      <v-card>
        <v-card-title class="text-h6">Anggota {{ grup?.label }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="cariAnggota" placeholder="Cari nama / No ID" prepend-inner-icon="mdi-magnify"
            variant="outlined" density="compact" hide-details clearable class="mb-3" />
          <div class="hint mb-2">{{ angka(anggota.jumlah) }} anggota<template v-if="cariAnggota"> cocok</template></div>
          <div v-for="a in anggota.data" :key="a.id" class="anggota-item">
            <div class="anggota-nama">{{ a.nama }}</div>
            <div class="anggota-meta">{{ [a.jabatan, a.no_id, a.cabang].filter(Boolean).join(" · ") }}</div>
          </div>
          <div v-if="anggota.data.length < anggota.jumlah" class="text-center mt-2">
            <v-btn size="small" variant="text" color="#B8890F" :loading="anggota.loading" @click="muatAnggota(false)">
              Muat lagi</v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogAnggota = false">Tutup</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Konfirmasi hapus pesan (khusus superadmin) -->
    <v-dialog v-model="dialogHapus" max-width="420">
      <v-card>
        <v-card-title class="text-h6">Hapus pesan?</v-card-title>
        <v-card-text>
          Pesan dari <b>{{ pesanDihapus?.sender?.nama || "member" }}</b> akan tampil sebagai
          "Pesan dihapus admin" untuk semua anggota grup.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogHapus = false">Batal</v-btn>
          <v-btn color="error" variant="flat" :loading="loadingHapus" @click="hapusPesan">Hapus</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack.show" :color="snack.color" :timeout="4000">{{ snack.text }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import Breadcrumb from "@/components/ui/Breadcrumb.vue";
import { chatApi, chatState, dengarChat, mulaiChat, setRuangTerbuka, socketChat } from "@/utils/chatKoneksi";

const PANJANG_MAKS = 2000;
const EMOJI = ["😀", "😁", "😂", "🤣", "😊", "😍", "🥰", "😘", "😎", "🤗", "🤔", "😅", "😢", "😭", "😡", "🥳",
  "😴", "🙄", "😇", "🤩", "👍", "👎", "👏", "🙌", "🙏", "💪", "🤝", "👌", "✌️", "🔥", "✨", "🎉", "💯", "❤️",
  "💛", "🌹", "🌸", "⭐", "✅", "❌"];

const user = (() => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch (e) {
    return {};
  }
})();
// Identitas dari server chat (chatState); localStorage hanya cadangan sebelum tersambung
const isSuperadmin = computed(() => chatState.superadmin || localStorage.getItem("mvo_type_id") === "superadmin");

const snack = reactive({ show: false, text: "", color: "error" });
const toast = (text, color = "error") => Object.assign(snack, { show: true, text, color });
const pesanGalat = (e, cadangan) => e?.response?.data?.message || cadangan;

/* ---------- daftar grup ---------- */
const grupList = ref([]);
const loadingGrup = ref(false);
const galatGrup = ref("");
const grup = ref(null);

async function muatGrup() {
  loadingGrup.value = true;
  galatGrup.value = "";
  try {
    const { data } = await chatApi().get("/chat/rooms");
    grupList.value = data;
    if (grup.value) grup.value = data.find((g) => g.id === grup.value.id) || grup.value;
  } catch (e) {
    galatGrup.value = pesanGalat(e, "Server chat tidak bisa dihubungi.");
  } finally {
    loadingGrup.value = false;
  }
}

// Angka belum dibaca: dari koneksi bersama (sama dengan lencana menu)
const belumDibaca = (g) => (grup.value?.id === g.id ? 0 : Number(chatState.perGrup[g.id] ?? g.unread_count) || 0);

/* ---------- pesan ---------- */
const pesan = ref([]);
const adaLagi = ref(false);
const loadingPesan = ref(false);
const loadingLama = ref(false);
const badan = ref(null);
const adaPesanBaru = ref(false);
const draf = ref("");
const mengirim = ref(false);
const menuEmoji = ref(false);

const dariSaya = (m) => Number(m.sender_id) === Number(chatState.userId || user.id);

async function bukaGrup(g) {
  grup.value = g;
  setRuangTerbuka(g.id);
  pesan.value = [];
  adaLagi.value = false;
  adaPesanBaru.value = false;
  jumlahAnggota.value = null;
  loadingPesan.value = true;
  try {
    const { data } = await chatApi().get(`/chat/messages/${g.id}`, { params: { limit: 50 } });
    if (grup.value?.id !== g.id) return; // sudah pindah grup
    pesan.value = data.data;
    adaLagi.value = data.ada_lagi;
    loadingPesan.value = false;
    await nextTick();
    keBawah("auto");
    tandaiDibaca();
    muatJumlahAnggota();
  } catch (e) {
    toast(pesanGalat(e, "Gagal memuat pesan."));
  } finally {
    loadingPesan.value = false;
  }
}

function tutupGrup() {
  grup.value = null;
  setRuangTerbuka(null);
}

async function muatSebelumnya() {
  if (!grup.value || !pesan.value.length) return;
  loadingLama.value = true;
  const el = badan.value;
  const tinggiLama = el ? el.scrollHeight : 0;
  try {
    const { data } = await chatApi().get(`/chat/messages/${grup.value.id}`, { params: { limit: 50, sebelum: pesan.value[0].id } });
    pesan.value = [...data.data, ...pesan.value];
    adaLagi.value = data.ada_lagi;
    await nextTick();
    if (el) el.scrollTop = el.scrollHeight - tinggiLama; // posisi baca tidak melompat
  } catch (e) {
    toast(pesanGalat(e, "Gagal memuat pesan sebelumnya."));
  } finally {
    loadingLama.value = false;
  }
}

let tundaBaca = null;
function tandaiDibaca() {
  if (!grup.value) return;
  clearTimeout(tundaBaca);
  const id = grup.value.id;
  tundaBaca = setTimeout(() => chatApi().post(`/chat/mark-read/${id}`).catch(() => {}), 300);
}

async function kirim() {
  const isi = draf.value.trim();
  if (!isi || !grup.value || mengirim.value) return;
  mengirim.value = true;
  const roomId = grup.value.id;
  const s = socketChat();
  try {
    let hasil;
    if (s && s.connected) {
      hasil = await new Promise((ok) => s.timeout(10000).emit("send_message", { room_id: roomId, message: isi },
        (err, ack) => ok(err ? { status: "error", message: "Koneksi lambat, coba lagi." } : ack)));
      if (hasil?.status !== "success") throw new Error(hasil?.message || "Gagal mengirim pesan.");
    } else {
      const { data } = await chatApi().post("/chat/send", { room_id: roomId, message: isi });
      hasil = data;
    }
    terimaPesan(hasil.data);
    draf.value = "";
    nextTick(() => keBawah("smooth"));
  } catch (e) {
    toast(e?.response ? pesanGalat(e, "Gagal mengirim pesan.") : e.message);
  } finally {
    mengirim.value = false;
  }
}

/** Pesan baru (dari socket atau balasan kirim): tampilkan & perbarui cuplikan grup. */
function terimaPesan(m) {
  if (!m) return;
  const g = grupList.value.find((x) => x.id === Number(m.room_id));
  if (g) g.last_message = m;
  if (grup.value?.id !== Number(m.room_id) || pesan.value.some((x) => x.id === m.id)) return;
  const dekatBawah = diBawah();
  pesan.value.push(m);
  if (dariSaya(m) || dekatBawah) nextTick(() => keBawah("smooth"));
  else adaPesanBaru.value = true;
  if (!dariSaya(m)) tandaiDibaca();
}

function tandaiDihapus(d) {
  const m = pesan.value.find((x) => x.id === Number(d?.id));
  if (m) Object.assign(m, { dihapus: true, message: null });
  const g = grupList.value.find((x) => x.last_message?.id === Number(d?.id));
  if (g) g.last_message = { ...g.last_message, dihapus: true, message: null };
}

/* ---------- gulir ---------- */
function diBawah(ambang = 120) {
  const el = badan.value;
  return !el || el.scrollHeight - (el.scrollTop + el.clientHeight) <= ambang;
}
function keBawah(perilaku = "auto") {
  const el = badan.value;
  if (!el) return;
  el.scrollTo({ top: el.scrollHeight, behavior: perilaku });
  adaPesanBaru.value = false;
}
function cekGulir() {
  if (diBawah()) adaPesanBaru.value = false;
}

/* ---------- hapus pesan (superadmin) ---------- */
const dialogHapus = ref(false);
const pesanDihapus = ref(null);
const loadingHapus = ref(false);
function mintaHapus(m) {
  pesanDihapus.value = m;
  dialogHapus.value = true;
}
async function hapusPesan() {
  if (!pesanDihapus.value) return;
  loadingHapus.value = true;
  try {
    const { data } = await chatApi().delete(`/chat/messages/${pesanDihapus.value.id}`);
    tandaiDihapus(data.data);
    dialogHapus.value = false;
    toast("Pesan dihapus.", "success");
  } catch (e) {
    toast(pesanGalat(e, "Gagal menghapus pesan."));
  } finally {
    loadingHapus.value = false;
  }
}

/* ---------- anggota grup ---------- */
const jumlahAnggota = ref(null);
const dialogAnggota = ref(false);
const cariAnggota = ref("");
const anggota = reactive({ data: [], jumlah: 0, loading: false });

async function muatJumlahAnggota() {
  const id = grup.value?.id;
  try {
    const { data } = await chatApi().get(`/chat/group-members/${id}`, { params: { limit: 1 } });
    if (grup.value?.id === id) jumlahAnggota.value = data.jumlah;
  } catch (e) {
    jumlahAnggota.value = null;
  }
}
async function muatAnggota(ulang = true) {
  if (!grup.value) return;
  anggota.loading = true;
  try {
    const { data } = await chatApi().get(`/chat/group-members/${grup.value.id}`, {
      params: { q: cariAnggota.value || undefined, limit: 30, offset: ulang ? 0 : anggota.data.length },
    });
    anggota.data = ulang ? data.data : [...anggota.data, ...data.data];
    anggota.jumlah = data.jumlah;
  } catch (e) {
    toast(pesanGalat(e, "Gagal memuat anggota."));
  } finally {
    anggota.loading = false;
  }
}
function bukaAnggota() {
  cariAnggota.value = "";
  dialogAnggota.value = true;
  muatAnggota(true);
}
let tundaCari = null;
watch(cariAnggota, () => {
  clearTimeout(tundaCari);
  tundaCari = setTimeout(() => muatAnggota(true), 350);
});

/* ---------- format ---------- */
const angka = (n) => Number(n || 0).toLocaleString("id-ID");
const tgl = (s) => new Date(s);
const sama = (a, b) => a.toDateString() === b.toDateString();
const jam = (s) => (s ? tgl(s).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "");
function labelHari(s) {
  const d = tgl(s);
  const kemarin = new Date();
  kemarin.setDate(kemarin.getDate() - 1);
  if (sama(d, new Date())) return "Hari ini";
  if (sama(d, kemarin)) return "Kemarin";
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
}
function waktuSingkat(s) {
  const d = tgl(s);
  return sama(d, new Date()) ? jam(s) : d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
const hariBaru = (i) => i === 0 || !sama(tgl(pesan.value[i].created_at), tgl(pesan.value[i - 1].created_at));
// Nama pengirim tidak diulang untuk pesan beruntun dari orang yang sama di hari yang sama
const samaPengirim = (i) => i > 0 && !hariBaru(i) && pesan.value[i - 1].sender_id === pesan.value[i].sender_id;
const namaPengirimSingkat = (m) => (dariSaya(m) ? "Anda" : (m.sender?.nama || "Member").split(" ")[0]);
function tambahEmoji(e) {
  draf.value += e;
  menuEmoji.value = false;
}

/* ---------- koneksi ---------- */
let berhentiDengar = null;
let socketTerpasang = null;
// Tersambung ulang: ambil pesan yang mungkin terlewat
const saatTersambung = () => {
  muatGrup();
  if (grup.value) bukaGrup(grup.value);
};
onMounted(async () => {
  socketTerpasang = mulaiChat();
  socketTerpasang?.io.on("reconnect", saatTersambung);
  berhentiDengar = dengarChat((event, data) => {
    if (event === "message") terimaPesan(data?.message);
    else if (event === "message_deleted") tandaiDihapus(data);
  });
  await muatGrup();
});
onBeforeUnmount(() => {
  if (berhentiDengar) berhentiDengar();
  socketTerpasang?.io.off("reconnect", saatTersambung);
  setRuangTerbuka(null);
  clearTimeout(tundaBaca);
});
</script>

<style scoped>
.chat-halaman {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - 96px);
  min-height: 420px;
  /* Desktop: ruang menu bawah HP (tersembunyi) yang dicadangkan layout Vuetify ikut dipakai */
  margin-bottom: calc(-1 * var(--v-layout-bottom, 0px));
}

.chat-kartu {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 320px 1fr;
  border: 1px solid var(--baba-border);
  border-radius: var(--baba-radius);
  background: var(--baba-surface);
  box-shadow: var(--baba-shadow);
  overflow: hidden;
}

/* ----- daftar grup ----- */
.daftar {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid var(--baba-border);
}

.daftar-kepala {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 16px;
  background: var(--baba-ink);
  color: #fff;
}

.daftar-judul {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.status-sambung {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: var(--baba-gold-light);
}

.alasan-sambung {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 0.8rem;
  background: var(--baba-gold-soft);
  color: var(--baba-gold-dark);
}

.daftar-isi {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.grup-item {
  display: flex;
  width: 100%;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid var(--baba-border);
  text-align: left;
  background: transparent;
  cursor: pointer;
}

.grup-item:hover {
  background: var(--baba-bg);
}

.grup-item.aktif {
  background: var(--baba-gold-soft);
  box-shadow: inset 3px 0 0 var(--baba-gold);
}

.grup-avatar {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--baba-ink);
  color: var(--baba-gold-light);
}

.grup-avatar.global {
  background: var(--baba-gold);
  color: var(--baba-ink);
}

.grup-avatar.kecil {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.grup-teks {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.grup-baris {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.grup-nama {
  font-weight: 700;
  color: var(--baba-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grup-waktu {
  flex: 0 0 auto;
  font-size: 0.72rem;
  color: var(--baba-muted);
}

.grup-cuplikan {
  font-size: 0.82rem;
  color: var(--baba-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.grup-lencana {
  flex: 0 0 auto;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgb(var(--v-theme-error));
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ----- percakapan ----- */
.percakapan {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--baba-bg);
}

.sambutan {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px;
  text-align: center;
}

.sambutan-judul {
  font-weight: 700;
  font-size: 1.05rem;
}

.sambutan-sub,
.hint {
  font-size: 0.85rem;
  color: var(--baba-muted);
}

.percakapan-kepala {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--baba-surface);
  border-bottom: 1px solid var(--baba-border);
}

.tombol-kembali {
  display: none;
}

.percakapan-judul {
  min-width: 0;
}

.judul-nama {
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.judul-anggota {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: var(--baba-gold-dark);
  background: transparent;
  cursor: pointer;
}

.badan {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 14px;
}

.muat-lagi {
  text-align: center;
  margin-bottom: 8px;
}

.kosong {
  padding: 24px 16px;
  text-align: center;
  color: var(--baba-muted);
  font-size: 0.9rem;
}

.pemisah-hari {
  display: flex;
  justify-content: center;
  margin: 12px 0 8px;
}

.pemisah-hari span {
  padding: 3px 12px;
  border-radius: 999px;
  background: var(--baba-border);
  color: var(--baba-muted);
  font-size: 0.75rem;
  font-weight: 600;
}

.baris-pesan {
  display: flex;
  margin-bottom: 6px;
}

.baris-pesan.saya {
  justify-content: flex-end;
}

.gelembung {
  max-width: min(78%, 560px);
  padding: 8px 12px 4px;
  border-radius: 14px 14px 14px 4px;
  background: var(--baba-surface);
  border: 1px solid var(--baba-border);
}

.gelembung.saya {
  border-radius: 14px 14px 4px 14px;
  background: var(--baba-gold-soft);
  border-color: var(--baba-gold-light);
}

.gelembung.dihapus {
  opacity: 0.75;
}

.pengirim {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 2px;
}

.pengirim-nama {
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--baba-gold-dark);
}

.pengirim-meta {
  font-size: 0.7rem;
  color: var(--baba-muted);
}

.tanda-admin {
  padding: 0 6px;
  border-radius: 6px;
  background: var(--baba-ink);
  color: var(--baba-gold-light);
  font-size: 0.65rem;
  font-weight: 700;
}

.isi {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.92rem;
  color: var(--baba-text);
}

.isi-dihapus {
  font-style: italic;
  color: var(--baba-muted);
}

.kaki-pesan {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  min-height: 22px;
  font-size: 0.7rem;
  color: var(--baba-muted);
}

.hapus-btn {
  opacity: 0.7;
}

.pesan-baru {
  position: absolute;
  bottom: 76px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--baba-ink);
  color: var(--baba-gold-light);
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: var(--baba-shadow);
  cursor: pointer;
}

.tulis {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  padding: 10px 12px;
  background: var(--baba-surface);
  border-top: 1px solid var(--baba-border);
}

.kolom-tulis {
  flex: 1;
}

.tombol-kirim {
  background: var(--baba-gold) !important;
  color: var(--baba-ink) !important;
}

.hitung-karakter {
  position: absolute;
  right: 70px;
  bottom: 4px;
  font-size: 0.7rem;
  color: var(--baba-muted);
}

.emoji-kotak {
  display: grid;
  grid-template-columns: repeat(8, 36px);
  gap: 2px;
  padding: 8px;
  border-radius: 12px;
  background: var(--baba-surface);
  box-shadow: var(--baba-shadow);
}

.emoji {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 1.25rem;
  background: transparent;
  cursor: pointer;
}

.emoji:hover {
  background: var(--baba-gold-soft);
}

.anggota-item {
  padding: 8px 0;
  border-bottom: 1px dashed var(--baba-border);
}

.anggota-nama {
  font-weight: 600;
}

.anggota-meta {
  font-size: 0.78rem;
  color: var(--baba-muted);
}

/* ----- HP: daftar & percakapan bergantian ----- */
@media (max-width: 959.98px) {
  .chat-halaman {
    height: calc(100dvh - 160px);
    margin-bottom: 0;
  }

  .chat-kartu {
    grid-template-columns: 1fr;
  }

  .percakapan {
    display: none;
  }

  .chat-kartu.buka-percakapan .daftar {
    display: none;
  }

  .chat-kartu.buka-percakapan .percakapan {
    display: flex;
  }

  .tombol-kembali {
    display: inline-flex;
  }

  .gelembung {
    max-width: 86%;
  }

  .emoji-kotak {
    grid-template-columns: repeat(7, 36px);
  }
}
</style>
