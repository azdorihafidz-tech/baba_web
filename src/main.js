// main.js
import { createApp } from "vue";
import App from "./App.vue";
import { registerPlugins } from "@/plugins";

// import { initSocket } from "@/plugins/socket";  // ⬅ tambahkan

const app = createApp(App);

registerPlugins(app);

// Initialize socket
// initSocket();   // ⬅ start socket sebelum mount

app.mount("#app");
