// File: src/plugins/echo.js atau main.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Enable Pusher logging untuk debugging
Pusher.logToConsole = true;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: '3d23956db3656091d2e5',
    cluster: 'ap1',
    forceTLS: true,
    encrypted: true,

});

// Debug: cek koneksi Echo
console.log('🚀 Echo initialized:', window.Echo);

// Monitor koneksi Pusher
window.Echo.connector.pusher.connection.bind('connected', () => {
    console.log('✅ Pusher connected successfully');
    console.log('🆔 Socket ID:', window.Echo.socketId());
});

window.Echo.connector.pusher.connection.bind('error', (err) => {
    console.error('❌ Pusher connection error:', err);
});

window.Echo.connector.pusher.connection.bind('disconnected', () => {
    console.warn('⚠️ Pusher disconnected');
});

// Listen raw Pusher events untuk debugging
window.Echo.connector.pusher.bind_global((event, data) => {
    if (!event.startsWith('pusher:')) {
        console.log('📡 Raw Pusher event:', event, data);
    }
});

// Plugins
import { registerPlugins } from "@/plugins";

// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";

// Styles
import "unfonts.css";

const app = createApp(App);

registerPlugins(app);

app.mount("#app");
