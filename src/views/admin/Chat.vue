<template>
  <v-card class="chat-container rounded-xl" height="600">
    <!-- Header dengan Gradient -->
    <v-toolbar class="gradient-header" dark dense flat>
      <v-btn icon @click="toggleSidebar" class="mobile-only">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-toolbar-title class="header-title">
        <v-icon class="me-2">mdi-chat-processing</v-icon>
        Chat
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="getChatList" class="header-btn">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-btn icon @click="dialogAddGroup = true" class="header-btn">
        <v-icon>mdi-account-multiple-plus</v-icon>
      </v-btn>
    </v-toolbar>

    <v-row no-gutters class="chat-content">
      <!-- SIDEBAR (LIST CHAT) - Tampil di mobile saat belum pilih room -->
      <v-col :cols="12" :md="4" :class="['sidebar-col']" v-show="!selectedRoom || !isMobile">
        <div class="sidebar-gradient">
          <v-list class="sidebar-list">
            <v-subheader class="sidebar-header">
              <v-icon small class="me-2">mdi-message-text</v-icon>
              Daftar Chat
            </v-subheader>

            <v-list-item v-for="(chat, index) in chatList" :key="index" @click="selectRoom(chat)"
              :class="['chat-item', { 'chat-item-active': selectedRoom?.id == chat.id }]">
              <v-list-item-avatar>
                <v-avatar :class="chat.is_group ? 'avatar-group' : 'avatar-private'" size="40">
                  <v-icon v-if="chat.is_group" small>mdi-account-group</v-icon>
                  <span v-else class="text-white text-body-2 font-weight-bold">
                    {{ chat.room_name ? chat.room_name[0].toUpperCase() : 'U' }}
                  </span>
                </v-avatar>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title class="chat-name">
                  {{ chat.room_name || 'Private Chat' }}
                </v-list-item-title>
                <v-list-item-subtitle v-if="chat.last_message" class="chat-preview">
                  {{ chat.last_message.message }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

          </v-list>
        </div>
      </v-col>

      <!-- AREA CHAT - Tampil di mobile setelah pilih room -->
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
            <!-- Header Room Chat -->
            <v-toolbar dense flat class="chat-room-header">
              <v-btn icon @click="backToSidebar" class="mobile-only me-2">
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <v-avatar :class="selectedRoom.is_group ? 'avatar-group' : 'avatar-private'" size="36" class="me-3">
                <v-icon v-if="selectedRoom.is_group" small>mdi-account-group</v-icon>
                <span v-else class="text-white text-sm font-weight-bold">
                  {{ selectedRoom.room_name ? selectedRoom.room_name[0].toUpperCase() : 'U' }}
                </span>
              </v-avatar>
              <v-toolbar-title class="room-title">
                {{ selectedRoom.room_name || 'Private Chat' }}
              </v-toolbar-title>
            </v-toolbar>

            <div class="chat-body flex-grow-1" ref="chatBody">
              <div class="pa-4">
                <v-row v-for="(msg, index) in messages" :key="index" class="mb-3"
                  :justify="msg.sender_id == user.id ? 'end' : 'start'">
                  <v-col cols="auto" class="max-width-70">
                    <!-- Nama pengirim -->
                    <div v-if="msg.sender_id !== user.id && selectedRoom.is_group" class="sender-name">
                      {{ msg.sender?.nama || 'Pengguna' }}
                    </div>

                    <!-- Bubble pesan -->
                    <v-sheet
                      :class="['message-bubble', msg.sender_id == user.id ? 'message-sent' : 'message-received']">
                      <div class="text-body-2 message-content">{{ msg.message }}</div>
                      <div class="message-time">
                        {{ formatTime(msg.created_at) }}
                      </div>
                    </v-sheet>
                  </v-col>
                </v-row>
              </div>
            </div>

            <!-- Input Chat -->
            <v-divider></v-divider>
            <v-card-actions class="pa-3 chat-input-actions">
              <!-- Button Emoji Picker -->
              <v-menu v-model="showEmojiPicker" :close-on-content-click="false" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn icon v-bind="props" size="small" class="emoji-btn">
                    <v-icon>mdi-emoticon-happy-outline</v-icon>
                  </v-btn>
                </template>
                <v-card class="emoji-picker-card pa-2" max-width="320">
                  <v-card-text class="pa-2">
                    <div class="emoji-grid">
                      <span v-for="emoji in emojiList" :key="emoji" @click="addEmoji(emoji)" class="emoji-item">
                        {{ emoji }}
                      </span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-menu>

              <v-text-field v-model="newMessage" placeholder="Tulis pesan..." variant="outlined" hide-details dense
                class="flex-grow-1 mx-2 message-input" @keyup.enter="sendMessage">
              </v-text-field>

              <v-btn icon color="primary" class="send-btn" @click="sendMessage" :disabled="newMessage.trim() == ''">
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </v-card-actions>
          </template>
        </div>
      </v-col>
    </v-row>

    <!-- DIALOG TAMBAH GRUP -->
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
import axios from "axios";
import Cookies from "js-cookie";

export default {
  name: "ChatView",

  data() {
    return {
      currentChannelName: null,
      user: {},
      newMessage: "",
      messages: [],
      chatList: [],
      selectedRoom: null,
      dialogAddGroup: false,
      groupForm: {
        room_name: "",
        member_ids: [],
      },
      userList: [],
      showEmojiPicker: false,
      emojiList: [
        "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
        "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
        "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔",
        "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥",
        "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮",
        "🤧", "🥵", "🥶", "😶‍🌫️", "😵", "🤯", "🤠", "🥳", "😎", "🤓",
        "🧐", "😕", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺",
        "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣",
        "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈",
        "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👏", "🙌",
        "👐", "🤲", "🤝", "🙏", "✍️", "💪", "🦾", "🦿", "🦵", "🦶",
        "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
        "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️",
        "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐",
        "⭐", "🌟", "✨", "⚡", "☄️", "💥", "🔥", "🌈", "☀️", "🌤️"
      ],
      provinsiList: [],
      loadingProvinsi: false,
      sidebarVisible: true,
      isMobile: false,
    };
  },

  methods: {
    async getProvinsiList() {
      this.loadingProvinsi = true;
      try {
        const token = Cookies.get("token");
        const response = await axios.get("https://babaapi.babaparfume.id/api/provinsi", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && Array.isArray(response.data)) {
          this.provinsiList = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          this.provinsiList = response.data.data;
        } else {
          this.provinsiList = [];
        }
      } catch (error) {
        console.error("Gagal memuat daftar provinsi:", error);
        this.provinsiList = [];
      } finally {
        this.loadingProvinsi = false;
      }
    },

    async getUser() {
      const userData = localStorage.getItem("user");
      this.user = userData ? JSON.parse(userData) : { id: 1, username: "DemoUser" };
    },

    async getChatList() {
      try {
        const token = Cookies.get("token");
        const response = await axios.get("https://babaapi.babaparfume.id/api/chat/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.chatList = response.data || [];
      } catch (error) {
        console.error("Gagal memuat daftar chat:", error);
      }
    },

    async selectRoom(room) {
      this.selectedRoom = room;
      this.messages = [];
      await this.getAllMessages();
      this.listenToRoom(room.id);

      try {
        const token = Cookies.get("token");
        await axios.post(
          `https://babaapi.babaparfume.id/api/chat/mark-read/${room.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.getChatList();
      } catch (error) {
        console.error("Gagal menandai pesan sebagai dibaca:", error);
      }
    },

    async getAllMessages() {
      if (!this.selectedRoom) return;
      try {
        const token = Cookies.get("token");
        const response = await axios.get(
          `https://babaapi.babaparfume.id/api/chat/messages/${this.selectedRoom.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.messages = response.data || [];

        this.$nextTick(() => {
          setTimeout(() => {
            this.scrollToBottom();
          }, 300);
        });
      } catch (error) {
        console.error("Gagal memuat pesan:", error);
      }
    },

    // async sendMessage() {
    //   if (!this.newMessage.trim() || !this.selectedRoom) return;
    //   try {
    //     const token = Cookies.get("token");
    //     const payload = {
    //       room_id: this.selectedRoom.id,
    //       message: this.newMessage,
    //     };
    //     await axios.post(`https://babaapi.babaparfume.id/api/chat/send`, payload, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //     this.messages.push({
    //       sender_id: this.user.id,
    //       message: this.newMessage,
    //       created_at: new Date().toISOString(),
    //     });
    //     this.newMessage = "";
    //     this.scrollToBottom();
    //   } catch (error) {
    //     console.error("Gagal mengirim pesan:", error);
    //   }
    // },

    async sendMessage() {
      if (!this.newMessage.trim() || !this.selectedRoom) return;

      try {
        const token = Cookies.get("token");
        await axios.post(
          "https://babaapi.babaparfume.id/api/chat/send",
          {
            room_id: this.selectedRoom.id,
            message: this.newMessage,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // this.messages.push({
        //   sender_id: this.user.id,
        //   message: this.newMessage,
        //   created_at: new Date().toISOString(),
        // });
        this.newMessage = "";
        this.scrollToBottom();
      } catch (e) {
        console.error("Gagal mengirim pesan:", e);
      }
    },

    async createGroup() {
      try {
        const token = Cookies.get("token");
        const superadminId = 6;
        const memberIds = Array.from(new Set([...this.groupForm.member_ids, superadminId]));

        const payload = {
          room_name: this.groupForm.room_name,
          member_ids: memberIds,
        };

        await axios.post("https://babaapi.babaparfume.id/api/chat/create-group", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.dialogAddGroup = false;
        this.groupForm = { room_name: "", member_ids: [] };
        this.getChatList();
      } catch (error) {
        console.error("Gagal membuat grup:", error);
      }
    },

    scrollToBottom() {
      const chatBody = this.$refs.chatBody;
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    },

    formatTime(datetime) {
      const date = new Date(datetime);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    },

    addEmoji(emoji) {
      this.newMessage += emoji;
      this.showEmojiPicker = false;
    },

    // listenToRoom(roomId) {
    //   // stop listener sebelumnya
    //   if (this.channel) {
    //     this.channel.unsubscribe();
    //   }

    //   this.channel = window.Echo.channel(`chat-room.${roomId}`);

    //   this.channel.listen('.message.sent', (e) => {
    //     // Tambah pesan SEGERA tanpa reload
    //     this.messages.push(e.message);
    //     this.scrollToBottom();
    //   });
    // },

    // listenToRoom(roomId) {
    //   console.log("📩 Pesan realtime xx:");
    //   // Hentikan listener sebelumnya
    //   if (this.channel) {
    //     window.Echo.leave(`private-chat.${this.selectedRoom?.id}`);
    //   }

    //   // Subscribe private channel
    //   this.channel = window.Echo.private(`chat.${roomId}`);

    //   // Listen event
    //   this.channel.listen('.MessageSent', (e) => {
    //     console.log("📩 Pesan realtime:", e.message);
    //     this.messages.push(e.message);
    //     this.scrollToBottom();
    //   });
    // },

    // listenToRoom(roomId) {
    //   console.log("🔔 Listening room:", roomId);

    //   // Hentikan listener lama
    //   if (this.channel) {
    //     window.Echo.leave(`chat.${this.selectedRoom?.id}`);
    //   }

    //   // Subscribe public channel
    //   this.channel = window.Echo.channel(`chat.${roomId}`);

    //   // Listen event
    //   this.channel.listen('.MessageSent', (e) => {
    //     console.log("📩 Pesan realtime:", e.message);
    //     this.messages.push(e.message);
    //     this.scrollToBottom();
    //   });
    // },

    // listenToRoom(roomId) {
    //   console.log("🔔 Listening room:", roomId);

    //   // Hentikan listener sebelumnya
    //   if (this.currentChannelName) {
    //     window.Echo.leave(this.currentChannelName);
    //   }

    //   // Nama channel baru
    //   this.currentChannelName = `chat-room.${roomId}`;

    //   this.channel = window.Echo.channel(this.currentChannelName);

    //   this.channel.listen('.message.sent', (e) => {
    //     console.log("📩 Pesan realtime:", e.message);
    //     this.messages.push(e.message);
    //     this.scrollToBottom();
    //   });
    // }

    // listenToRoom(roomId) {
    //   console.log("🔔 Listening room:", roomId);

    //   // Hentikan listener lama
    //   if (this.currentChannelName) {
    //     window.Echo.leave(this.currentChannelName);
    //   }

    //   // Set channel baru
    //   this.currentChannelName = `chat-room.${roomId}`;
    //   this.channel = window.Echo.channel(this.currentChannelName);

    //   this.channel.listen('message.sent', (e) => {
    //     console.log("📩 Pesan realtime:", e.message);
    //     this.messages.push(e.message);
    //     this.scrollToBottom();
    //   });
    // },

    listenToRoom(roomId) {
      if (this.currentChannelName) {
        window.Echo.leave(this.currentChannelName);
      }

      this.currentChannelName = `chat-room.${roomId}`;
      this.channel = window.Echo.channel(this.currentChannelName);

      const pusherChannel = window.Echo.connector.pusher.channel(this.currentChannelName);

      pusherChannel.bind_global((eventName, data) => {
        if (eventName.includes('message') || eventName.includes('MessageSent')) {
          this.handleNewMessage(data);
        }
      });

      this.channel.listen('message.sent', (e) => {
        this.handleNewMessage(e);
      });

      this.channel.subscribed(() => {
        console.log(`✅ Berhasil subscribe ke ${this.currentChannelName}`);
      });

      this.channel.error((error) => {
        console.error(`❌ Error subscribe ke ${this.currentChannelName}:`, error);
      });
    },

    handleNewMessage(e) {
      if (e.message) {
        const exists = this.messages.find(m => m.id === e.message.id);
        if (!exists) {
          this.messages.push(e.message);
          this.scrollToBottom();
        }
        this.getChatList();
      }
    },

    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible;
    },

    backToSidebar() {
      if (this.isMobile) {
        this.selectedRoom = null;
        if (this.currentChannelName) {
          window.Echo.leave(this.currentChannelName);
        }
      }
    },

    checkMobile() {
      this.isMobile = window.innerWidth < 960;
    },
  },

  async mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);

    await this.getUser();
    await this.getChatList();
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
    if (this.currentChannelName) {
      window.Echo.leave(this.currentChannelName);
    }
  },

  watch: {
    messages: {
      handler() {
        this.$nextTick(() => {
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        });
      },
      deep: true
    },
    dialogAddGroup(val) {
      if (val) {
        this.getProvinsiList();
      }
    }
  }
};
</script>

<style scoped>
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
}

.chat-item:hover {
  background: rgba(102, 126, 234, 0.1) !important;
  transform: translateX(4px);
}

.chat-item-active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2)) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
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
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05)) !important;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.room-title {
  font-weight: 600;
  color: #212529;
  font-size: 1rem;
}

.chat-body {
  height: 400px;
  overflow-y: auto;
  background-color: #fafafa;
  scroll-behavior: smooth;
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
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
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
</style>