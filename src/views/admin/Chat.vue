<template>
  <v-card class="chat-container rounded-xl" height="600">
    <v-toolbar class="gradient-header" dark dense flat>
      <v-btn icon @click="toggleSidebar" class="mobile-only">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-toolbar-title class="header-title">
        <v-icon class="me-2">mdi-chat-processing</v-icon>
        Chat
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="getChatList" class="header-btn me-2" title="Refresh daftar chat">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-btn icon @click="dialogAddGroup = true" class="header-btn">
        <v-icon>mdi-account-multiple-plus</v-icon>
      </v-btn>
    </v-toolbar>

    <v-row no-gutters class="chat-content">
      <v-col :cols="12" :md="4" :class="['sidebar-col']" v-show="!selectedRoom || !isMobile">
        <div class="sidebar-gradient">
          <v-list class="sidebar-list">
            <v-subheader class="sidebar-header">
              <v-icon small class="me-2">mdi-message-text</v-icon>
              Daftar Chat
            </v-subheader>

            <v-list-item v-for="(chat, index) in chatList" :key="chat.id ?? index" @click="selectRoom(chat)" :class="[
              'chat-item',
              { 'chat-item-active': selectedRoom?.id == chat.id },
            ]">
              <template v-slot:prepend>
                <v-avatar :class="chat.is_group ? 'avatar-group' : 'avatar-private'" size="40">
                  <v-icon v-if="chat.is_group" small>mdi-account-group</v-icon>
                  <span v-else class="text-white text-body-2 font-weight-bold">
                    {{ chat.room_name ? chat.room_name[0].toUpperCase() : "U" }}
                  </span>
                </v-avatar>
              </template>

              <v-list-item-title class="chat-name">{{
                chat.room_name || "Private Chat"
              }}</v-list-item-title>
              <v-list-item-subtitle v-if="chat.last_message" class="chat-preview">
                <span class="preview-sender">{{ getLastMessageSender(chat) }}:</span>
                {{ chat.last_message.message }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <span v-if="Number(chat.unread_count) > 0" class="chat-badge">
                  {{ Number(chat.unread_count) }}
                </span>
              </template>
            </v-list-item>

            <div v-if="chatList.length === 0" class="no-chats">
              Tidak ada percakapan.
            </div>
          </v-list>
        </div>
      </v-col>

      <v-col :cols="12" :md="8" :class="['chat-col']" v-show="selectedRoom || !isMobile">
        <div class="chat-wrapper">
          <div v-if="!selectedRoom" class="empty-state">
            <div class="empty-state-content">
              <v-icon size="80" class="empty-icon">mdi-chat-outline</v-icon>
              <h3 class="empty-title">Selamat Datang!</h3>
              <p class="empty-subtitle">Pilih percakapan untuk memulai</p>
            </div>
          </div>

          <template v-else>
            <v-toolbar dense flat class="chat-room-header">
              <v-btn icon @click="backToSidebar" class="mobile-only me-2">
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>

              <v-avatar :class="selectedRoom.is_group ? 'avatar-group' : 'avatar-private'
                " size="36" class="me-3">
                <v-icon v-if="selectedRoom.is_group" small>mdi-account-group</v-icon>
                <span v-else class="text-white text-sm font-weight-bold">
                  {{
                    selectedRoom.room_name
                      ? selectedRoom.room_name[0].toUpperCase()
                      : "U"
                  }}
                </span>
              </v-avatar>

              <v-toolbar-title class="room-title">{{
                selectedRoom.room_name || "Private Chat"
              }}</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>

            <div class="chat-body flex-grow-1" ref="chatBody">
              <!-- ganti blok v-for messages dengan kode ini -->
              <div class="pa-4">
                <div v-for="(msg, index) in messages" :key="msg.id ?? index" class="message-block">
                  <!-- tanggal / group separator -->
                  <div v-if="isNewDay(index)" class="date-separator">
                    {{ formatDateGroup(msg.created_at) }}
                  </div>

                  <v-row class="mb-3" :justify="msg.sender_id == user.id ? 'end' : 'start'">
                    <v-col cols="auto" class="max-width-70">
                      <!-- tampilkan nama pengirim untuk pesan dari orang lain, atau di grup tampilkan juga nama -->
                      <div v-if="
                        msg.sender &&
                        (selectedRoom.is_group || msg.sender_id !== user.id)
                      " class="sender-name">
                        {{ senderName(msg) }}
                      </div>

                      <v-sheet :class="[
                        'message-bubble',
                        msg.sender_id == user.id
                          ? 'message-sent'
                          : 'message-received',
                      ]">
                        <div class="text-body-2 message-content">
                          {{ msg.message }}
                        </div>
                        <div class="message-time">
                          {{ formatTime(msg.created_at) }}
                        </div>
                      </v-sheet>
                    </v-col>
                  </v-row>
                </div>
              </div>
            </div>

            <v-divider></v-divider>
            <v-card-actions class="pa-3 chat-input-actions">
              <v-menu v-model="showEmojiPicker" :close-on-content-click="false" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn icon v-bind="props" size="small" class="emoji-btn">
                    <v-icon>mdi-emoticon-happy-outline</v-icon>
                  </v-btn>
                </template>
                <v-card class="emoji-picker-card pa-2" max-width="320">
                  <v-card-text class="pa-2">
                    <div class="emoji-grid">
                      <span v-for="emoji in emojiList" :key="emoji" @click="addEmoji(emoji)" class="emoji-item">{{ emoji
                      }}</span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-menu>

              <v-text-field v-model="newMessage" placeholder="Tulis pesan..." variant="outlined" hide-details dense
                class="flex-grow-1 mx-2 mb-5 message-input" @keyup.enter="sendMessage"></v-text-field>

              <v-btn icon color="primary" class="send-btn mb-5" @click="sendMessage"
                :disabled="newMessage.trim() == ''">
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </v-card-actions>
          </template>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-model="dialogAddGroup" persistent max-width="500px">
      <v-card class="dialog-card">
        <v-card-title class="text-h6 dialog-title">
          <v-icon class="me-2">mdi-account-group</v-icon>
          Buat Grup Baru
        </v-card-title>
        <v-card-text class="pt-4">
          <v-select v-model="groupForm.room_name" :items="provinsiList" item-title="name" item-value="code"
            label="Pilih Provinsi" outlined dense :loading="loadingProvinsi" required>
            <template v-slot:prepend-inner>
              <v-icon small>mdi-map-marker</v-icon>
            </template>
          </v-select>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn text @click="dialogAddGroup = false">Batal</v-btn>
          <v-btn color="primary" class="gradient-btn" @click="createGroup">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import axios from "axios";

export default {
  name: "ChatView",
  data() {
    return {
      socket: null,
      currentChannelName: null,
      user: {},
      newMessage: "",
      messages: [],
      chatList: [],
      selectedRoom: null,
      dialogAddGroup: false,
      groupForm: { room_name: "", member_ids: [] },
      provinsiList: [],
      loadingProvinsi: false,
      isMobile: false,
      api: null,
      showEmojiPicker: false,
      emojiList: [
        "😀",
        "😃",
        "😄",
        "😁",
        "😆",
        "😅",
        "🤣",
        "😂",
        "🙂",
        "🙃",
        "😉",
        "😊",
        "😇",
        "🥰",
        "😍",
        "🤩",
        "😘",
        "😗",
        "😚",
        "😙",
        "😋",
        "😛",
        "😜",
        "🤪",
        "😝",
        "🤑",
        "🤗",
        "🤭",
        "🤫",
        "🤔",
        "🤐",
        "🤨",
        "😐",
        "😑",
        "😶",
        "😏",
        "😒",
        "🙄",
        "😬",
        "🤥",
        "😌",
        "😔",
        "😪",
        "🤤",
        "😴",
        "😷",
        "🤒",
        "🤕",
        "🤢",
        "🤮",
        "🤧",
        "🥵",
        "🥶",
        "🥴",
        "😵",
        "🤯",
        "🤠",
        "🥳",
        "😎",
        "🤓",
        "🧐",
        "😕",
        "😟",
        "🙁",
        "☹️",
        "😮",
        "😯",
        "😲",
        "😳",
        "🥺",
        "😦",
        "😧",
        "😨",
        "😰",
        "😥",
        "😢",
        "😭",
        "😱",
        "😖",
        "😣",
        "😞",
        "😓",
        "😩",
        "😫",
        "🥱",
        "😤",
        "😡",
        "😠",
        "🤬",
        "👍",
        "👎",
        "👌",
        "✌️",
        "🤞",
        "🤟",
        "🤘",
        "🤙",
        "👈",
        "👉",
        "👆",
        "👇",
        "☝️",
        "👏",
        "🙌",
        "👐",
        "🤲",
        "🤝",
        "🙏",
        "✍️",
        "💪",
        "🦾",
        "🦿",
        "🦵",
        "🦶",
        "👂",
        "🦻",
        "👃",
        "🧠",
        "🦷",
        "🦴",
        "👀",
        "👁️",
        "👅",
        "👄",
        "💋",
        "🩸",
      ],
    };
  },
  methods: {
    createApiInstance() {
      const token = localStorage.getItem("token") || Cookies.get("token") || "";
      const base = "https://babaparfume.id/chat-rooms/api";
      this.api = axios.create({
        baseURL: base,
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
    },

    async getUser() {
      const userData = localStorage.getItem("user");
      this.user = userData
        ? JSON.parse(userData)
        : { id: 1, username: "DemoUser" };
      this.createApiInstance();
      this.initSocket();
    },

    // tambahkan helper untuk memperbarui chatList dari pesan baru
    updateChatListWithMessage(msg) {
      if (!msg || !msg.room_id) return;

      // cari room di chatList
      const idx = this.chatList.findIndex(
        (c) => Number(c.id) === Number(msg.room_id),
      );
      const isFromMe = Number(msg.sender_id) === Number(this.user.id);

      // buat objek last_message minimal (sesuai frontend expectation)
      const lastMessageForList = {
        id: msg.id,
        room_id: msg.room_id,
        sender_id: msg.sender_id,
        message: msg.message,
        created_at: msg.created_at || new Date().toISOString(),
        // jika server mengirim sender object sertakan itu
        sender: msg.sender ? msg.sender : undefined,
      };

      if (idx !== -1) {
        // update last_message dan unread_count
        this.$set(this.chatList[idx], "last_message", lastMessageForList);

        // jika pesan bukan dari user, tambahkan badge
        if (!isFromMe) {
          const prev = Number(this.chatList[idx].unread_count) || 0;
          this.$set(this.chatList[idx], "unread_count", prev + 1);
        } else {
          // jika pesan dari diri sendiri, biasanya unread_count tetap 0
          this.$set(this.chatList[idx], "unread_count", 0);
        }

        // optional: pindahkan room ke atas daftar (jika ingin sorted by recent)
        // uncomment jika mau: move to top
        const roomItem = this.chatList.splice(idx, 1)[0];
        this.chatList.unshift(roomItem);
      } else {
        // room belum ada di daftar (kemungkinan baru), push minimal
        this.chatList.unshift({
          id: msg.room_id,
          room_name: msg.room_name || "Private Chat",
          is_group: !!msg.is_group,
          last_message: lastMessageForList,
          unread_count: isFromMe ? 0 : 1,
        });
      }
    },

    // modifikasi initSocket() handlers: ganti existing socket.on('message'...) dan socket.on('new_message_notification'...)
    initSocket() {
      if (this.socket) return;
      const rawToken =
        localStorage.getItem("token") || Cookies.get("token") || null;
      const host = "https://babaparfume.id";
      const path = "/chat-rooms/socket.io";
      this.socket = io(host, {
        path,
        auth: { token: rawToken },

        reconnection: true,
        timeout: 20000,
      });

      this.socket.on("connect", () =>
        console.log("Socket connected", this.socket.id),
      );
      this.socket.on("connect_error", (err) =>
        console.error(
          "Socket connect_error",
          err && err.message ? err.message : err,
        ),
      );

      // ketika server mengirim event message
      this.socket.on("message", (data) => {
        if (!data || !data.message) return;
        const msg = data.message;

        // tambahkan pesan ke messages jika room terbuka
        if (
          this.selectedRoom &&
          Number(this.selectedRoom.id) === Number(msg.room_id)
        ) {
          const exists = this.messages.find((m) => m.id === msg.id);
          if (!exists) {
            this.messages.push(msg);

            // hanya auto-scroll jika pengirim adalah user sendiri OR user sedang dekat bagian bawah
            const fromMe = Number(msg.sender_id) === Number(this.user.id);
            if (fromMe || this.isUserNearBottom()) {
              // smooth scroll when new messages arrive naturally (if user is at bottom)
              this.$nextTick(() => this.scrollToBottom("smooth"));
            } else {
              // jika user sedang membaca di atas, jangan scroll; bisa tambahkan indikator "Pesan baru"
              // contoh: set property on chatList or show small badge — opsional
              // this.showNewMessageToast = true;
            }

            // jika pesan dari orang lain, opsional: mark-read (kamu sudah memanggil mark-read earlier)
            if (!fromMe) {
              // notify server we read (only if room is open and you want immediate mark)
              if (this.api) {
                this.api
                  .post(`/chat/mark-read/${this.selectedRoom.id}`, {})
                  .catch(() => { });
              }
              // pastikan badge local di sidebar di-clear
              const idxSel = this.chatList.findIndex(
                (c) => Number(c.id) === Number(this.selectedRoom.id),
              );
              if (idxSel !== -1)
                this.$set(this.chatList[idxSel], "unread_count", 0);
            }
          }
        }

        // update sidebar preview realtime juga (kamu sudah punya helper)
        this.updateChatListWithMessage(msg);
      });

      // event notifikasi unread_count — juga perbarui last_message jika data include last_message
      this.socket.on("new_message_notification", (data) => {
        if (!data || !data.room_id) return;

        const roomIndex = this.chatList.findIndex(
          (c) => Number(c.id) === Number(data.room_id),
        );
        if (roomIndex !== -1) {
          // jika server mengirim unread_count gunakan itu
          if (typeof data.unread_count !== "undefined") {
            this.$set(
              this.chatList[roomIndex],
              "unread_count",
              Number(data.unread_count),
            );
          }

          // jika server juga mengirim last_message object, perbarui preview
          if (data.last_message) {
            this.$set(
              this.chatList[roomIndex],
              "last_message",
              data.last_message,
            );
          }
        } else {
          // jika room belum ada di daftar, bisa fetch ulang 1 room atau panggil getChatList()
          // lebih ringan: tambahkan minimal entry jika server memberikan last_message
          if (data.last_message) {
            this.chatList.unshift({
              id: data.room_id,
              room_name: data.room_name || "Private Chat",
              is_group: !!data.is_group,
              last_message: data.last_message,
              unread_count: Number(data.unread_count) || 1,
            });
          } else {
            // fallback: refresh list
            this.getChatList();
          }
        }

        // Jika pengguna sedang membuka room tersebut, refresh messages
        if (
          this.selectedRoom &&
          Number(this.selectedRoom.id) === Number(data.room_id)
        ) {
          this.getAllMessages();
        }
      });

      this.socket.on("disconnect", (reason) =>
        console.log("Socket disconnected", reason),
      );
    },

    async getChatList() {
      try {
        if (!this.api) this.createApiInstance();
        const res = await this.api.get("/chat/rooms"); // jika ganti backend route, ubah di sini
        let list = Array.isArray(res.data)
          ? res.data
          : res.data && Array.isArray(res.data.data)
            ? res.data.data
            : [];

        this.chatList = list.map((c) => {
          const unread_count = Number(
            c.unread_count ?? c.unreadCount ?? c.unreads ?? c.unread ?? 0,
          );
          const has_unread =
            c.unread === true || unread_count > 0 || !!c.has_unread;
          return {
            ...c,
            unread_count,
            unread: c.unread === true || has_unread,
            has_unread,
          };
        });

        // DEBUG: tampilkan di console — cek apakah unread_count terisi
        console.log(
          "chatList loaded:",
          this.chatList.map((x) => ({
            id: x.id,
            name: x.room_name,
            unread_count: x.unread_count,
          })),
        );
      } catch (err) {
        console.error("Gagal memuat daftar chat:", err);
      }
    },

    async selectRoom(room) {
      if (!room) return;
      this.selectedRoom = room;
      this.messages = [];
      this.currentChannelName = room.id;
      await this.getAllMessages();

      if (this.socket && this.socket.connected) {
        this.socket.emit("join_room", room.id);
      }

      try {
        if (!this.api) this.createApiInstance();
        await this.api.post(`/chat/mark-read/${room.id}`, {});
        const idx = this.chatList.findIndex((c) => c.id === room.id);
        if (idx !== -1) this.$set(this.chatList[idx], "unread_count", 0);
        this.getChatList();
      } catch (err) {
        console.error("Gagal mark read", err);
      }
    },

    async getAllMessages() {
      if (!this.selectedRoom) return;
      try {
        if (!this.api) this.createApiInstance();
        const res = await this.api.get(
          `/chat/messages/${this.selectedRoom.id}`,
        );
        this.messages = Array.isArray(res.data)
          ? res.data
          : res.data && res.data.data
            ? res.data.data
            : [];

        // langsung ke pesan terbaru ketika membuka room — instant (no smooth)
        this.$nextTick(() => setTimeout(() => this.scrollToBottom("auto"), 50));
      } catch (err) {
        console.error("Gagal memuat pesan", err);
      }
    },

    async sendMessage() {
      if (!this.newMessage.trim() || !this.selectedRoom) return;
      const payload = {
        room_id: this.selectedRoom.id,
        message: this.newMessage,
      };

      if (this.socket && this.socket.connected) {
        this.socket.emit("send_message", payload, (ack) => {
          if (ack && ack.status === "success") {
            this.newMessage = "";
            this.$nextTick(() => this.scrollToBottom());
            this.getChatList();
          } else {
            console.error("send_message ack error", ack);
          }
        });
      } else {
        try {
          if (!this.api) this.createApiInstance();
          const res = await this.api.post("/chat/send", payload);
          if (res.data && res.data.data) {
            this.messages.push(res.data.data);
            this.newMessage = "";
            this.$nextTick(() => this.scrollToBottom());
            this.getChatList();
          }
        } catch (err) {
          console.error("Gagal mengirim pesan via REST", err);
        }
      }
    },

    scrollToBottom(mode = "smooth") {
      this.$nextTick(() => {
        const chatBody = this.$refs.chatBody;
        if (!chatBody) return;

        // simpan nilai scroll-behavior sebelumnya (jika ada)
        const prevBehavior = chatBody.style.scrollBehavior;

        try {
          // atur behavior sementara sesuai mode (mode: "smooth" | "auto")
          // jika mode bukan recognized, gunakan "auto"
          const behavior = mode === "smooth" ? "smooth" : "auto";
          chatBody.style.scrollBehavior = behavior;

          // prefer native scrollTo with options but fallback ke scrollTop assignment
          try {
            // gunakan scrollTo agar modern browsers bisa memakai smooth/auto sesuai option
            chatBody.scrollTo({ top: chatBody.scrollHeight, behavior });
          } catch (e) {
            // fallback (instant)
            chatBody.scrollTop = chatBody.scrollHeight;
          }
        } finally {
          // restore style setelah sedikit delay agar user merasakan smooth jika mode === 'smooth'
          // namun untuk mode 'auto' kita kembalikan segera
          if (mode === "smooth") {
            // beri sedikit waktu agar smooth effect selesai (jarang perlu, tapi aman)
            setTimeout(() => {
              chatBody.style.scrollBehavior = prevBehavior || "";
            }, 250);
          } else {
            // langsung kembalikan
            chatBody.style.scrollBehavior = prevBehavior || "";
          }
        }
      });
    },

    isUserNearBottom(threshold = 120) {
      const chatBody = this.$refs.chatBody;
      if (!chatBody) return true; // default scroll jika tidak ada ref
      const scrollTop = chatBody.scrollTop;
      const clientHeight = chatBody.clientHeight;
      const scrollHeight = chatBody.scrollHeight;
      return scrollHeight - (scrollTop + clientHeight) <= threshold;
    },

    async getProvinsiList() {
      this.loadingProvinsi = true;
      try {
        if (!this.api) this.createApiInstance();
        const response = await this.api.get("/provinsi");
        if (response.data && Array.isArray(response.data))
          this.provinsiList = response.data;
        else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        )
          this.provinsiList = response.data.data;
        else this.provinsiList = [];
      } catch (error) {
        this.provinsiList = [];
      } finally {
        this.loadingProvinsi = false;
      }
    },

    createGroup: async function () {
      try {
        if (!this.api) this.createApiInstance();
        const superadminId = 6;
        const memberIds = Array.from(
          new Set([...this.groupForm.member_ids, superadminId]),
        );
        const payload = {
          room_name: this.groupForm.room_name,
          member_ids: memberIds,
        };
        await this.api.post("/chat/create-group", payload);
        this.dialogAddGroup = false;
        this.groupForm = { room_name: "", member_ids: [] };
        this.getChatList();
      } catch (e) {
        console.error("Gagal membuat grup", e);
      }
    },

    addEmoji(emoji) {
      this.newMessage += emoji;
      this.showEmojiPicker = false;
    },
    formatTime(datetime) {
      if (!datetime) return "";
      const d = new Date(datetime);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    },
    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible;
    },
    backToSidebar() {
      if (this.isMobile) {
        if (this.socket && this.currentChannelName)
          this.socket.emit("leave_room", this.currentChannelName);
        this.selectedRoom = null;
      }
    },
    checkMobile() {
      this.isMobile = window.innerWidth < 960;
    },

    senderName(msg) {
      // coba berbagai kemungkinan nama di payload pesan
      if (!msg) return "Pengguna";
      const s = msg.sender || msg.user || {};
      // cek beberapa kemungkinan key
      return (
        s.nama ||
        s.name ||
        s.username ||
        msg.sender_name ||
        msg.senderName ||
        msg.from ||
        (msg.sender_id === this.user.id ? "Anda" : "Pengguna")
      );
    },

    getLastMessageSender(chat) {
      if (!chat) return "";

      const last =
        chat.last_message || chat.lastMessage || chat.lastMessageData || null;
      if (!last) return "";

      // objek sender (backend selalu mengirim ini untuk pesan normal)
      const senderObj = last.sender || last.user || last.from || null;

      // ambil ID pengirim dari berbagai kemungkinan sumber
      const senderId =
        (senderObj && senderObj.id) ||
        last.sender_id ||
        last.user_id ||
        last.from_id ||
        null;

      // Jika pesan dari user sendiri
      if (senderId && Number(senderId) === Number(this.user.id)) {
        return "Anda";
      }

      // Jika ada objek sender → gunakan nama sender
      if (senderObj) {
        return (
          senderObj.nama ||
          senderObj.name ||
          senderObj.username ||
          senderObj.displayName ||
          "Pengguna"
        );
      }

      // Fallback jika tidak ada data senderObj
      return (
        last.sender_name ||
        last.senderName ||
        last.from_name ||
        last.fromName ||
        "Pengguna"
      );
    },

    // returns true if this message should show a date separator (first message or different day than previous)
    isNewDay(index) {
      if (!this.messages || !Array.isArray(this.messages)) return false;
      if (index === 0) return true;
      const cur = this.messages[index];
      const prev = this.messages[index - 1];
      if (!cur || !prev || !cur.created_at || !prev.created_at) return true;

      const dCur = new Date(cur.created_at);
      const dPrev = new Date(prev.created_at);

      return (
        dCur.getFullYear() !== dPrev.getFullYear() ||
        dCur.getMonth() !== dPrev.getMonth() ||
        dCur.getDate() !== dPrev.getDate()
      );
    },

    // formats group label: "Hari ini", "Kemarin", or "DD MMM YYYY"
    formatDateGroup(datetime) {
      if (!datetime) return "";
      const d = new Date(datetime);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      function isSameDay(a, b) {
        return (
          a.getFullYear() === b.getFullYear() &&
          a.getMonth() === b.getMonth() &&
          a.getDate() === b.getDate()
        );
      }

      if (isSameDay(d, today)) return "Hari ini";
      if (isSameDay(d, yesterday)) return "Kemarin";

      // contoh: 21 Jul 2025
      const opts = { day: "2-digit", month: "short", year: "numeric" };
      return d.toLocaleDateString(undefined, opts);
    },
  },

  async mounted() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);
    await this.getUser();
    await this.getChatList();
    await this.getProvinsiList();

    this.chatListInterval = setInterval(() => this.getChatList(), 10000);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
    if (this.socket) this.socket.disconnect();
    if (this.chatListInterval) clearInterval(this.chatListInterval);
  },

  computed: {
    unreadCount() {
      return this.chatList.reduce(
        (sum, c) => sum + (Number(c.unread_count) || 0),
        0,
      );
    },
  },
};
</script>

<style scoped>
/* semua style sama seperti sebelumnya, ditambah deep selectors untuk override Vuetify */
.chat-container {
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.gradient-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.header-btn {
  transition: all 0.3s ease;
}

.header-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.chat-content {
  height: calc(600px - 48px);
}

.sidebar-col {
  transition: all 0.3s ease;
  overflow-y: auto;
}

.sidebar-gradient {
  height: 100%;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  overflow-y: auto;
}

.sidebar-list {
  background: transparent !important;
}

.sidebar-header {
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 16px;
}

.chat-item {
  margin: 4px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
}

.chat-item:hover {
  background: rgba(102, 126, 234, 0.06) !important;
  transform: translateX(4px);
}

.chat-item-active {
  background: linear-gradient(135deg,
      rgba(102, 126, 234, 0.12),
      rgba(118, 75, 162, 0.06)) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.08);
}

.avatar-group {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.avatar-private {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
}

.chat-name {
  font-weight: 600;
  color: #212529;
  font-size: 0.95rem;
}

.chat-preview {
  color: #6c757d;
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  min-width: 0;
}

.chat-col {
  transition: all 0.3s ease;
}

.chat-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.empty-state-content {
  text-align: center;
  color: white;
}

.empty-icon {
  opacity: 0.3;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 1rem;
  opacity: 0.8;
}

.chat-room-header {
  background: linear-gradient(135deg,
      rgba(102, 126, 234, 0.05),
      rgba(118, 75, 162, 0.05)) !important;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
}

.room-title {
  font-weight: 600;
  color: #212529;
  font-size: 1rem;
}

.selected-room-badge {
  background: #e53935;
  color: white;
  padding: 4px 8px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.85rem;
  margin-right: 12px;
}

.chat-body {
  height: 400px;
  overflow-y: auto;
  background-color: #fafafa;
  /* scroll-behavior diatur oleh JS agar bisa instant atau smooth sesuai kebutuhan */
  display: flex;
  flex-direction: column;
}

.sender-name {
  font-size: 0.75rem;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 4px;
  padding-left: 12px;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 100%;
  word-wrap: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.message-bubble:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.message-sent {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border-bottom-right-radius: 4px;
}

.message-received {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
  color: #212529 !important;
  border-bottom-left-radius: 4px;
}

.message-content {
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message-time {
  font-size: 0.7rem;
  margin-top: 4px;
  opacity: 0.7;
  text-align: right;
}

.max-width-70 {
  max-width: 70%;
}

.chat-input-actions {
  gap: 8px;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
}

.emoji-btn {
  transition: all 0.3s ease;
}

.emoji-btn:hover {
  background-color: rgba(102, 126, 234, 0.1);
  transform: scale(1.1);
}

.message-input {
  flex: 1;
}

.send-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.1) rotate(15deg);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
}

.emoji-picker-card {
  border-radius: 12px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-item {
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  text-align: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.emoji-item:hover {
  background: linear-gradient(135deg,
      rgba(102, 126, 234, 0.1),
      rgba(118, 75, 162, 0.1));
  transform: scale(1.2);
}

.dialog-card {
  border-radius: 16px !important;
  overflow: hidden;
}

.dialog-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  padding: 20px 24px;
}

.gradient-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
}

.chat-badge {
  background: #e53935;
  color: white;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
  display: inline-block;
}

/* Ensure list layout (avatar left, content center, action right) */
/* Use deep selector to override Vuetify generated DOM if scoped */
:v-deep .v-list-item {
  display: flex;
  align-items: center;
}

:v-deep .v-list-item__avatar,
:v-deep .v-list-item-avatar,
.list-avatar-left {
  order: 0;
  margin-right: 12px;
}

.list-content-center {
  order: 1;
  flex: 1 1 auto;
  min-width: 0;
}

.list-action-right,
:v-deep .v-list-item__action {
  order: 2;
  margin-left: 8px;
  display: flex;
  align-items: center;
}

/* fallback message */
.no-chats {
  padding: 12px;
  color: #6c757d;
  font-size: 0.9rem;
  text-align: center;
}

.chat-body::-webkit-scrollbar,
.sidebar-gradient::-webkit-scrollbar,
.emoji-grid::-webkit-scrollbar {
  width: 6px;
}

.chat-body::-webkit-scrollbar-track,
.sidebar-gradient::-webkit-scrollbar-track,
.emoji-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.chat-body::-webkit-scrollbar-thumb,
.sidebar-gradient::-webkit-scrollbar-thumb,
.emoji-grid::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.chat-body::-webkit-scrollbar-thumb:hover,
.sidebar-gradient::-webkit-scrollbar-thumb:hover,
.emoji-grid::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #764ba2 0%, #667eea 100%);
}

.mobile-only {
  display: none;
}

@media (max-width: 959px) {
  .mobile-only {
    display: inline-flex;
  }

  .max-width-70 {
    max-width: 85%;
  }

  .emoji-grid {
    grid-template-columns: repeat(8, 1fr);
  }

  .message-bubble {
    padding: 10px 14px;
  }

  .chat-name {
    font-size: 0.9rem;
  }

  .chat-preview {
    font-size: 0.8rem;
  }

  .list-action-right {
    margin-left: 8px;
  }
}

@media (max-width: 600px) {
  .chat-container {
    border-radius: 0 !important;
  }

  .header-title {
    font-size: 1.1rem;
  }

  .empty-title {
    font-size: 1.5rem;
  }

  .empty-subtitle {
    font-size: 0.9rem;
  }

  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }

  .emoji-item {
    font-size: 20px;
    padding: 6px;
  }
}

/* date separator style */
.date-separator {
  display: flex;
  justify-content: center;
  margin: 12px 0;
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 600;
}

.date-separator::before,
.date-separator::after {
  content: "";
  flex: 1 1 30%;
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
  margin: auto 12px;
  border-radius: 2px;
}

.message-block {
  /* small spacing to separate groups better */
  margin-bottom: 6px;
}
</style>
