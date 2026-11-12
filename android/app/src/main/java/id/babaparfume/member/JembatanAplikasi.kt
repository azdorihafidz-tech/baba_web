package id.babaparfume.member

import android.util.Base64
import android.webkit.JavascriptInterface
import android.widget.Toast
import org.json.JSONArray
import org.json.JSONObject

/**
 * `window.BabaApp` di halaman web. WebView tidak bisa menyimpan file "blob:" yang dibuat halaman
 * (ekspor Excel, PDF print), jadi skrip SKRIP mencegat unduhan itu dan mengirim isinya ke sini.
 */
class JembatanAplikasi(private val act: MainActivity) {

    @JavascriptInterface
    fun simpanFile(base64: String, nama: String, mime: String) {
        val isi = try {
            Base64.decode(base64, Base64.DEFAULT)
        } catch (_: IllegalArgumentException) {
            pesan("File tidak bisa disimpan.")
            return
        }
        act.runOnUiThread { act.unduhan.simpan(isi, nama, mime) }
    }

    @JavascriptInterface
    fun unduhUrl(url: String, nama: String) {
        act.runOnUiThread { act.unduhan.dariUrl(url, nama, null) }
    }

    @JavascriptInterface
    fun pesan(teks: String) {
        act.runOnUiThread { Toast.makeText(act, teks, Toast.LENGTH_LONG).show() }
    }

    @JavascriptInterface
    fun versi(): String = BuildConfig.VERSION_NAME

    // ===== Printer Bluetooth (Toko Saya: struk kasir & nota pesanan) =====
    // Isi struk (ESC/POS) dibuat web — aplikasi hanya meneruskan byte ke printer yang sudah di-pairing di HP.

    @JavascriptInterface
    fun printerIzin(): Boolean = act.bolehBluetooth()

    /** Minta izin Bluetooth; hasil → window.BabaAppIzinPrinter(true/false). */
    @JavascriptInterface
    fun mintaIzinPrinter() {
        act.runOnUiThread { act.mintaIzinBluetooth() }
    }

    /** JSON {izin, bluetooth, printer:[{mac,nama}]} — printer yang sudah di-pairing di pengaturan Bluetooth HP. */
    @JavascriptInterface
    fun printerDaftar(): String {
        if (!act.bolehBluetooth()) return JSONObject().put("izin", false).put("bluetooth", false).put("printer", JSONArray()).toString()
        val ad = BluetoothPrinter.adapter(act) ?: return JSONObject().put("izin", true).put("bluetooth", false).put("ada", false).put("printer", JSONArray()).toString()
        val daftar = JSONArray()
        try {
            BluetoothPrinter.pairedDevices(act).forEach { daftar.put(JSONObject().put("mac", it.address).put("nama", it.name ?: it.address)) }
        } catch (_: SecurityException) {
        }
        return JSONObject().put("izin", true).put("bluetooth", ad.isEnabled).put("ada", true).put("printer", daftar).toString()
    }

    /** Kirim byte (base64) ke printer [mac]; hasil → window.BabaAppCetakHasil(id, ok, pesan). */
    @JavascriptInterface
    fun cetak(base64: String, mac: String, id: String) {
        val data = try {
            Base64.decode(base64, Base64.DEFAULT)
        } catch (_: IllegalArgumentException) {
            hasilCetak(id, false, "Data struk tidak valid.")
            return
        }
        if (!act.bolehBluetooth()) {
            hasilCetak(id, false, "Izinkan akses Perangkat di sekitar (Bluetooth) untuk mencetak.")
            return
        }
        Thread {
            try {
                BluetoothPrinter.kirim(act, mac, data)
                hasilCetak(id, true, "Struk tercetak")
            } catch (_: SecurityException) {
                hasilCetak(id, false, "Izin Bluetooth belum diberikan.")
            } catch (e: Exception) {
                hasilCetak(id, false, e.message ?: "Gagal mencetak.")
            }
        }.start()
    }

    private fun hasilCetak(id: String, ok: Boolean, pesan: String) =
        act.kirimKeWeb("window.BabaAppCetakHasil && window.BabaAppCetakHasil(${JSONObject.quote(id)}, $ok, ${JSONObject.quote(pesan)})")

    companion object {
        /**
         * Dipasang di setiap halaman BABA sebelum skrip web berjalan:
         * - URL.createObjectURL dicatat (file tetap bisa diambil walau web langsung revokeObjectURL)
         * - <a download href="blob:/data:"> (klik program / klik jari) dan window.open(blob:) → simpanFile
         * - <a download href="https://..."> → unduhUrl (DownloadManager)
         */
        val SKRIP = """
            (function () {
              if (window.__babaApp || !window.BabaApp) return;
              window.__babaApp = true;
              var simpan = new Map();
              var asliBuat = URL.createObjectURL;
              URL.createObjectURL = function (o) {
                var u = asliBuat.call(URL, o);
                try {
                  if (o instanceof Blob) {
                    simpan.set(u, o);
                    if (simpan.size > 20) simpan.delete(simpan.keys().next().value);
                  }
                } catch (e) {}
                return u;
              };
              function namaFile(blob, nama) {
                if (nama) return nama;
                var t = (blob && blob.type) || '';
                var ext = t.indexOf('pdf') >= 0 ? '.pdf'
                  : (t.indexOf('sheet') >= 0 || t.indexOf('excel') >= 0) ? '.xlsx'
                  : t.indexOf('image/') === 0 ? '.' + t.split('/')[1].split('+')[0] : '';
                return 'BABA-' + new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '') + ext;
              }
              function kirim(blob, nama) {
                var r = new FileReader();
                r.onload = function () {
                  var s = String(r.result);
                  BabaApp.simpanFile(s.substring(s.indexOf(',') + 1), namaFile(blob, nama), blob.type || '');
                };
                r.onerror = function () { BabaApp.pesan('File tidak bisa disimpan.'); };
                r.readAsDataURL(blob);
              }
              function tangani(href, nama) {
                if (typeof href !== 'string') return false;
                if (href.indexOf('blob:') === 0 || href.indexOf('data:') === 0) {
                  var b = simpan.get(href);
                  (b ? Promise.resolve(b) : fetch(href).then(function (r) { return r.blob(); }))
                    .then(function (blob) { kirim(blob, nama); })
                    .catch(function () { BabaApp.pesan('File tidak bisa disimpan.'); });
                  return true;
                }
                return false;
              }
              var asliKlik = HTMLAnchorElement.prototype.click;
              HTMLAnchorElement.prototype.click = function () {
                var nama = this.getAttribute('download');
                if (tangani(this.href, nama)) return;
                if (nama !== null && /^https?:/.test(this.href)) { BabaApp.unduhUrl(this.href, nama || ''); return; }
                return asliKlik.call(this);
              };
              document.addEventListener('click', function (e) {
                var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
                if (!a) return;
                var nama = a.getAttribute('download');
                if (tangani(a.href, nama)) { e.preventDefault(); e.stopPropagation(); return; }
                if (nama !== null && /^https?:/.test(a.href)) { e.preventDefault(); BabaApp.unduhUrl(a.href, nama || ''); }
              }, true);
              var asliOpen = window.open;
              window.open = function (url) {
                if (tangani(String(url || ''), '')) return null;
                return asliOpen.apply(window, arguments);
              };
            })();
        """.trimIndent()
    }
}
