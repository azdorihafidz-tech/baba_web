// Penjaga Kamus Menu aplikasi member (porting Dimsum 4.50): GAGAL bila ada menu Sidebar.vue atau route halaman admin
// di router tanpa entri di src/kamus/isi.js, atau entri Kamus yang route-nya tidak ada. Jalankan: npm run cek:kamus
// Tulis entrinya di src/kamus/isi.js — jangan menambah pengecualian selain redirect.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const akar = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baca = (f) => fs.readFileSync(path.join(akar, f), "utf8");
const { KAMUS, KELOMPOK } = await import(pathToFileURL(path.join(akar, "src/kamus/isi.js")).href);
const tanpaKomentar = (t) => t.split(/\r?\n/).filter((l) => !l.trim().startsWith("//")).join("\n");

// 1. Menu sidebar: ["ikon", "Teks", "/admin/..."] (baris komentar diabaikan)
const sidebar = [...tanpaKomentar(baca("src/components/layouts/admin/Sidebar.vue")).matchAll(/\[\s*"mdi-[^"]+",\s*"[^"]+",\s*"(\/admin\/[^"]+)"\s*\]/g)].map((m) => m[1]);
// 2. Route anak /admin di router (path: "x"), termasuk daftar dinamis [["belanja", "Belanja"], ...]
const router = tanpaKomentar(baca("src/router/index.js"));
const anak = [...router.matchAll(/path:\s*"([A-Za-z][A-Za-z0-9_-]*)"/g)].map((m) => m[1]);
const dinamis = [...router.matchAll(/\[\s*"([a-z][a-z-]+)",\s*"[^"]+"\s*\]/g)].map((m) => m[1]);
const PENGECUALIAN = new Set(["tutorial"]); // redirect ke /admin/panduan
const halaman = [...new Set([...anak, ...dinamis])].filter((p) => !PENGECUALIAN.has(p)).map((p) => `/admin/${p}`);

const ada = new Set(KAMUS.filter((k) => k.route).map((k) => k.route.toLowerCase()));
const kurang = [...new Set([...sidebar, ...halaman])].filter((r) => !ada.has(r.toLowerCase()));
const semuaRoute = new Set([...halaman, ...sidebar].map((r) => r.toLowerCase()));
const yatim = KAMUS.filter((k) => k.route && !semuaRoute.has(k.route.toLowerCase())).map((k) => `${k.id} (${k.route})`);

const salah = [];
const id = new Set();
for (const k of KAMUS) {
  if (id.has(k.id)) salah.push(`id dobel: ${k.id}`);
  id.add(k.id);
  for (const f of ["id", "menu", "kelompok", "peran", "ringkas", "fungsi"]) if (!k[f]) salah.push(`${k.id}: '${f}' kosong`);
  if (!KELOMPOK.includes(k.kelompok)) salah.push(`${k.id}: kelompok '${k.kelompok}' tidak dikenal`);
  if (!/^(semua|superadmin|hak:[a-z_]+)$/.test(k.peran)) salah.push(`${k.id}: peran '${k.peran}' tidak dikenal`);
  for (const t of k.tombol || []) if (!t.t || !t.j) salah.push(`${k.id}: tombol tanpa t/j`);
}

let gagal = false;
if (kurang.length) { gagal = true; console.error("✗ Menu/halaman tanpa entri Kamus Menu:\n  " + kurang.join("\n  ") + "\n  → tulis entrinya di src/kamus/isi.js"); }
if (yatim.length) { gagal = true; console.error("✗ Entri Kamus dengan route yang tidak ada di router/sidebar:\n  " + yatim.join("\n  ")); }
if (salah.length) { gagal = true; console.error("✗ Entri Kamus tidak lengkap:\n  " + salah.join("\n  ")); }
if (gagal) process.exit(1);
console.log(`✓ Kamus Menu lengkap: ${KAMUS.length} entri, ${sidebar.length} menu sidebar & ${halaman.length} halaman tercakup.`);
