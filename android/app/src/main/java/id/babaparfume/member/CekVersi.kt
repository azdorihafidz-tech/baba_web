package id.babaparfume.member

import android.net.Uri
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * Saat aplikasi dibuka: baca `<web>/unduh/versi.json` ({"versionCode": n, "versionName": "1.0.n"},
 * dibuat GitHub Actions bersama APK). Bila lebih baru dari APK terpasang → tawarkan unduh APK baru.
 * Tanpa koneksi / file belum ada → diam saja.
 */
object CekVersi {
    fun periksa(act: MainActivity) {
        val dasar = BuildConfig.BABA_URL.trimEnd('/')
        Thread {
            try {
                val sambung = URL("$dasar/unduh/versi.json?t=${System.currentTimeMillis()}").openConnection() as HttpURLConnection
                sambung.connectTimeout = 8000
                sambung.readTimeout = 8000
                sambung.useCaches = false
                if (sambung.responseCode != 200) return@Thread
                val json = JSONObject(sambung.inputStream.bufferedReader().use { it.readText() })
                val kode = json.optInt("versionCode", 0)
                val nama = json.optString("versionName", "")
                if (kode <= BuildConfig.VERSION_CODE) return@Thread
                act.runOnUiThread {
                    act.tampilkanDialog(
                        "Versi baru tersedia",
                        "Aplikasi BABA PARFUME versi $nama sudah tersedia (versi Anda ${BuildConfig.VERSION_NAME}).\n\n" +
                            "Ketuk Unduh, lalu buka file baba-parfume.apk dan ketuk Instal. Data & login Anda tetap.",
                        "Unduh", { act.bukaDiLuar(Uri.parse("$dasar/unduh/baba-parfume.apk")) },
                        "Nanti",
                    )
                }
            } catch (_: Exception) {
                // tanpa koneksi / format salah: lewati
            }
        }.start()
    }
}
