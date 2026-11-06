// main.js
import { createApp } from "vue";
import App from "./App.vue";
import { registerPlugins } from "@/plugins";
import "@/utils/pasangAplikasi"; // tangkap event pasang aplikasi (Android) sejak awal

// import { initSocket } from "@/plugins/socket";  // ⬅ tambahkan

const app = createApp(App);

registerPlugins(app);

// Initialize socket
// initSocket();   // ⬅ start socket sebelum mount

app.mount("#app");
