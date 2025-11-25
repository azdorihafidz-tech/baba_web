<template>
  <v-card class="rounded-xl" height="600">
    <!-- Header -->
    <v-toolbar color="primary" dark dense flat>
      <v-toolbar-title>Chat</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="getChatList">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
      <v-btn icon @click="dialogAddGroup = true">
        <v-icon>mdi-account-multiple-plus</v-icon>
      </v-btn>
    </v-toolbar>

    <v-row no-gutters>
      <!-- SIDEBAR (LIST CHAT) -->
      <v-col cols="4" class="border-e" style="background-color: #f5f5f5; overflow-y: auto;">
        <v-list>
          <v-subheader>Daftar Chat</v-subheader>

          <v-list-item v-for="(chat, index) in chatList" :key="index" @click="selectRoom(chat)"
            :class="{ 'bg-grey-lighten-3': selectedRoom?.id == chat.id }">
            <v-list-item-avatar>
              <v-avatar :color="chat.is_group ? 'deep-purple' : 'primary'" size="32">
                <v-icon v-if="chat.is_group" small>mdi-account-group</v-icon>
                <span v-else class="text-white text-sm">
                  {{ chat.room_name ? chat.room_name[0].toUpperCase() : 'U' }}
                </span>
              </v-avatar>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>{{ chat.room_name || 'Private Chat' }}</v-list-item-title>
              <v-list-item-subtitle v-if="chat.last_message">
                {{ chat.last_message.message }}
              </v-list-item-subtitle>
            </v-list-item-content>

            <!-- 🔔 Tambahkan indikator belum dibaca -->
            <!--<template
              v-if="chat.last_message && chat.last_message.is_read == 0 && chat.last_message.sender_id !== user.id">
              <v-badge dot color="red" offset-x="10" offset-y="10">
                <v-icon color="red" small>mdi-bell-alert</v-icon>
              </v-badge>
            </template>-->
          </v-list-item>

        </v-list>
      </v-col>

      <!-- AREA CHAT -->
      <v-col cols="8" class="d-flex flex-column">
        <div v-if="!selectedRoom" class="d-flex align-center justify-center flex-grow-1 text-grey">
          <v-icon large class="me-2">mdi-chat-outline</v-icon>
          Pilih percakapan untuk memulai
        </div>

        <template v-else>
          <v-card-text class="chat-body flex-grow-1" ref="chatBody">
            <v-row v-for="(msg, index) in messages" :key="index" class="mb-2"
              :justify="msg.sender_id == user.id ? 'end' : 'start'">
              <v-col cols="auto">
                <!-- Nama pengirim -->
                <div v-if="msg.sender_id !== user.id" class="text-caption text-grey-darken-1 mb-1">
                  {{ msg.sender?.nama || 'Pengguna' }}
                </div>

                <!-- Bubble pesan -->
                <v-sheet :color="msg.sender_id == user.id ? 'primary' : 'grey lighten-3'"
                  :class="msg.sender_id == user.id ? 'text-white' : 'text-black'" rounded="xl" class="pa-2">
                  <div class="text-body-2">{{ msg.message }}</div>
                  <div class="text-caption text-right opacity-60">
                    {{ formatTime(msg.created_at) }}
                  </div>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card-text>


          <!-- Input Chat -->
          <v-divider></v-divider>
          <v-card-actions>
            <v-text-field v-model="newMessage" placeholder="Tulis pesan..." variant="outlined" hide-details dense
              class="flex-grow-1" @keyup.enter="sendMessage"></v-text-field>
            <v-btn icon color="primary" @click="sendMessage" :disabled="newMessage.trim() == ''">
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </v-card-actions>
        </template>
      </v-col>
    </v-row>

    <!-- ✅ DIALOG TAMBAH GRUP -->
    <v-dialog v-model="dialogAddGroup" persistent max-width="500px">
      <v-card>
        <v-card-title class="text-h6">Buat Grup Baru</v-card-title>
        <v-card-text>
          <v-text-field label="Nama Grup" v-model="groupForm.room_name" outlined dense required></v-text-field>
          <!-- 
          <v-select label="Pilih Anggota" v-model="groupForm.member_ids" :items="[
            { id: 1, nama: 'Ridwan Pranajaya' },
            { id: 2, nama: 'Mega Bintang' },
            { id: 3, nama: 'Andi Saputra' },
            { id: 6, nama: 'Superadmin' }
          ]" item-title="nama" item-value="id" multiple chips outlined dense required></v-select> -->
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogAddGroup = false">Batal</v-btn>
          <v-btn color="primary" @click="createGroup">Simpan</v-btn>
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
      pollingInterval: null, // ✅ untuk interval polling
    };
  },

  methods: {
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

    async getUserList() {
      try {
        const token = Cookies.get("token");
        const response = await axios.get("https://babaapi.babaparfume.id/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // this.userList = response.data.data || [];
        console.log("Daftar user:", this.userList);
      } catch (error) {
        console.error("Gagal memuat daftar user:", error);
      }
    },

    async selectRoom(room) {
      this.selectedRoom = room;
      this.messages = [];
      await this.getAllMessages();
      this.listenToRoom(room.id); // ===> tambahkan ini
      // this.startPolling();

      // 🔹 Tandai semua pesan di room ini sebagai sudah dibaca
      try {
        const token = Cookies.get("token");
        await axios.post(
          `https://babaapi.babaparfume.id/api/chat/mark-read/${room.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Refresh daftar chat agar indikator hilang
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
        console.log("Pesan:", this.messages);
        this.scrollToBottom();
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

        // Pastikan Superadmin (id: 6) selalu ikut
        const superadminId = 6;
        const memberIds = Array.from(new Set([...this.groupForm.member_ids, superadminId]));

        const payload = {
          room_name: this.groupForm.room_name,
          member_ids: memberIds,
        };

        console.log("payload dikirim:", payload);

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
      this.$nextTick(() => {
        const chatBody = this.$refs.chatBody;
        if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
      });
    },

    formatTime(datetime) {
      const date = new Date(datetime);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
      console.log("🔔 Listening room:", roomId);

      // Hentikan listener lama
      if (this.currentChannelName) {
        window.Echo.leave(this.currentChannelName);
      }

      // Set channel baru - HARUS SAMA dengan backend
      this.currentChannelName = `chat-room.${roomId}`;
      this.channel = window.Echo.channel(this.currentChannelName);

      // ✅ TANGKAP SEMUA EVENT MENTAH dari Pusher
      const pusherChannel = window.Echo.connector.pusher.channel(this.currentChannelName);

      pusherChannel.bind_global((eventName, data) => {
        console.log("📡 Raw event dari Pusher:", eventName, data);

        // Filter hanya event message
        if (eventName.includes('message') || eventName.includes('MessageSent')) {
          console.log("✅ Event message ditemukan!");
          this.handleNewMessage(data);
        }
      });

      // Tetap coba dengan cara Laravel Echo biasa
      this.channel.listen('message.sent', (e) => {
        console.log("📩 [Echo] message.sent:", e);
        this.handleNewMessage(e);
      });

      // Debug: cek apakah channel berhasil subscribe
      this.channel.subscribed(() => {
        console.log(`✅ Berhasil subscribe ke ${this.currentChannelName}`);
      });

      this.channel.error((error) => {
        console.error(`❌ Error subscribe ke ${this.currentChannelName}:`, error);
      });
    },

    // Handle pesan baru
    handleNewMessage(e) {
      console.log("🔥 handleNewMessage called:", e);

      if (e.message) {
        // Cek apakah pesan sudah ada (hindari duplikat)
        const exists = this.messages.find(m => m.id === e.message.id);
        if (!exists) {
          this.messages.push(e.message);
          this.scrollToBottom();
          console.log("✅ Pesan ditambahkan ke UI");
        } else {
          console.log("⚠️ Pesan sudah ada, skip");
        }

        // Refresh chat list untuk update last_message
        this.getChatList();
      }
    },
    // Handle pesan baru
    handleNewMessage(e) {
      console.log("🔥 handleNewMessage called:", e);

      if (e.message) {
        // Cek apakah pesan sudah ada (hindari duplikat)
        const exists = this.messages.find(m => m.id === e.message.id);
        if (!exists) {
          this.messages.push(e.message);
          this.scrollToBottom();
          console.log("✅ Pesan ditambahkan ke UI");
        } else {
          console.log("⚠️ Pesan sudah ada, skip");
        }

        // Refresh chat list untuk update last_message
        this.getChatList();
      }
    },

    // ✅ MULAI POLLING
    startPolling() {
      this.stopPolling(); // hentikan polling sebelumnya kalau ada
      this.pollingInterval = setInterval(() => {
        if (this.selectedRoom) {
          this.getAllMessages();
          this.getChatList();
        }
      }, 10000); // setiap 10 detik
    },

    // ✅ HENTIKAN POLLING
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },
  },

  async mounted() {
    await this.getUser();
    await this.getChatList();

    // Jika user membuka room terakhir yang disimpan
    if (this.selectedRoom) {
      this.listenToRoom(this.selectedRoom.id);
    }

  },

  beforeUnmount() {
    // this.stopPolling(); // ✅ hentikan polling saat keluar dari halaman
  },
};
</script>

<style scoped>
.chat-body {
  height: 450px;
  overflow-y: auto;
  background-color: #fafafa;
}

.border-e {
  border-right: 1px solid #ddd;
}
</style>
