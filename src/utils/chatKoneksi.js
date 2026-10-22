// Satu koneksi chat (Socket.IO) bersama untuk seluruh aplikasi: dipakai lencana pesan baru di menu
// (Sidebar) dan halaman Chat. Server: repo chatroom-baba, alamat dari CHAT_URL / CHAT_SOCKET_PATH.
import { reactive } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
import { CHAT_SOCKET_PATH, CHAT_URL } from "@/config";

export const chatState = reactive({
  total: 0, // jumlah pesan belum dibaca di semua grup
  perGrup: {}, // { roomId: jumlah }
  terhubung: false,
  ruangTerbuka: null, // grup yang sedang dibuka di halaman Chat (pesannya tidak dihitung belum dibaca)
  userId: null,
});

let socket = null;
let tokenSocket = null;
const pendengar = new Set();

const ambilToken = () => localStorage.getItem("token") || Cookies.get("token") || "";

/** axios ke server chat dengan token login aplikasi. */
export function chatApi() {
  return axios.create({
    baseURL: `${CHAT_URL}/api`,
    headers: { Authorization: `Bearer ${ambilToken()}`, Accept: "application/json" },
  });
}

function terapkanRingkas(r) {
  if (!r || typeof r.total === "undefined") return;
  chatState.total = Number(r.total) || 0;
  chatState.perGrup = { ...(r.per_grup || {}) };
}

export async function muatBelumDibaca() {
  try {
    const { data } = await chatApi().get("/chat/unread");
    terapkanRingkas(data);
  } catch (e) {
    // server chat tidak terjangkau: lencana dibiarkan apa adanya
  }
}

/** Sambungkan (sekali saja); bila token login berganti, koneksi lama diganti. */
export function mulaiChat() {
  const token = ambilToken();
  if (!CHAT_URL || !token) {
    hentikanChat();
    return null;
  }
  if (socket && tokenSocket === token) return socket;
  hentikanChat();

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (e) {
    user = {};
  }
  chatState.userId = Number(user.id) || null;
  tokenSocket = token;
  socket = io(new URL(CHAT_URL).origin, { path: CHAT_SOCKET_PATH, auth: { token }, reconnection: true });
  socket.on("connect", () => {
    chatState.terhubung = true;
    muatBelumDibaca();
  });
  socket.on("disconnect", () => {
    chatState.terhubung = false;
  });
  socket.on("unread_update", terapkanRingkas);
  socket.on("message", (d) => {
    const m = d?.message;
    if (!m) return;
    const dariSaya = Number(m.sender_id) === chatState.userId;
    const sedangDibuka = Number(m.room_id) === Number(chatState.ruangTerbuka);
    if (!dariSaya && !sedangDibuka) {
      chatState.perGrup = { ...chatState.perGrup, [m.room_id]: (chatState.perGrup[m.room_id] || 0) + 1 };
      chatState.total += 1;
    }
  });
  // Teruskan semua event ke pendengar (halaman Chat)
  socket.onAny((event, data) => pendengar.forEach((fn) => fn(event, data)));
  return socket;
}

/** Putuskan koneksi (logout / token hilang). */
export function hentikanChat() {
  if (socket) socket.disconnect();
  socket = null;
  tokenSocket = null;
  Object.assign(chatState, { total: 0, perGrup: {}, terhubung: false, ruangTerbuka: null });
}

/** Dengarkan event chat; kembalikan fungsi untuk berhenti mendengar. */
export function dengarChat(fn) {
  pendengar.add(fn);
  return () => pendengar.delete(fn);
}

export function setRuangTerbuka(roomId) {
  chatState.ruangTerbuka = roomId || null;
}

export const socketChat = () => socket;
