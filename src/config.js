// Alamat server, diambil dari file .env.development (lokal) / .env.production (build hosting).
// Jangan menulis URL server langsung di komponen; impor dari file ini.

// Root backend Laravel. Endpoint API = `${API_URL}/api/...`
export const API_URL = import.meta.env.VITE_API_URL;

// Root folder public Laravel tempat file upload (foto, dokumen, pdf).
export const FILE_URL = import.meta.env.VITE_FILE_URL;

// Domain utama babaparfume.id (sumber daftar lagu).
export const MAIN_URL = import.meta.env.VITE_MAIN_URL;

// Server chat Node.js (repo chatroom-baba). REST = `${CHAT_URL}/api/chat/...`,
// Socket.IO di origin CHAT_URL dengan path CHAT_SOCKET_PATH.
export const CHAT_URL = import.meta.env.VITE_CHAT_URL;
export const CHAT_SOCKET_PATH = import.meta.env.VITE_CHAT_SOCKET_PATH || "/socket.io";
