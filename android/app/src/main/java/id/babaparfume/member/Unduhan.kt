package id.babaparfume.member

import android.Manifest
import android.app.DownloadManager
import android.content.ActivityNotFoundException
import android.content.ContentValues
import android.content.Intent
import android.content.pm.PackageManager
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.webkit.CookieManager
import android.webkit.MimeTypeMap
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import java.io.File

/** Menyimpan file (Excel/PDF/foto) ke folder Download HP lalu menawarkan tombol Buka. */
class Unduhan(private val act: MainActivity) {

    private var tertunda: Triple<ByteArray, String, String>? = null

    fun simpan(isi: ByteArray, namaAsli: String, mimeAsli: String) {
        val nama = rapikanNama(namaAsli, mimeAsli)
        val mime = mimeAsli.ifBlank { mimeDari(nama) }
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q &&
            ContextCompat.checkSelfPermission(act, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED
        ) {
            tertunda = Triple(isi, nama, mime)
            act.izinSimpan.launch(Manifest.permission.WRITE_EXTERNAL_STORAGE)
            return
        }
        tulis(isi, nama, mime)
    }

    fun izinSimpanSelesai(ok: Boolean) {
        val (isi, nama, mime) = tertunda ?: return
        tertunda = null
        if (ok) tulis(isi, nama, mime)
        else Toast.makeText(act, "File tidak disimpan: izin penyimpanan ditolak.", Toast.LENGTH_LONG).show()
    }

    private fun tulis(isi: ByteArray, nama: String, mime: String) {
        try {
            val (uri, namaAkhir) = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val nilai = ContentValues().apply {
                    put(MediaStore.Downloads.DISPLAY_NAME, nama)
                    put(MediaStore.Downloads.MIME_TYPE, mime)
                    put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                }
                val resolver = act.contentResolver
                val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, nilai)
                    ?: throw IllegalStateException("tidak bisa membuat file")
                resolver.openOutputStream(uri).use { it!!.write(isi) }
                val akhir = resolver.query(uri, arrayOf(MediaStore.Downloads.DISPLAY_NAME), null, null, null)?.use { c ->
                    if (c.moveToFirst()) c.getString(0) else null
                } ?: nama
                uri to akhir
            } else {
                @Suppress("DEPRECATION")
                val dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).apply { mkdirs() }
                val file = namaUnik(dir, nama)
                file.writeBytes(isi)
                MediaScannerConnection.scanFile(act, arrayOf(file.absolutePath), arrayOf(mime), null)
                FileProvider.getUriForFile(act, "${act.packageName}.fileprovider", file) to file.name
            }
            act.tampilkanDialog(
                "File tersimpan",
                "$namaAkhir\ntersimpan di folder Download.",
                "Buka", { buka(uri, mime) },
                "Tutup",
            )
        } catch (e: Exception) {
            Toast.makeText(act, "File tidak bisa disimpan: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    /** File dari alamat internet (mis. dokumen di server API) lewat pengelola unduhan Android. */
    fun dariUrl(url: String, namaAsli: String, mime: String?) {
        val uri = Uri.parse(url)
        if (uri.scheme !in listOf("http", "https")) return
        try {
            val nama = rapikanNama(namaAsli.ifBlank { uri.lastPathSegment ?: "" }, mime ?: "")
            val req = DownloadManager.Request(uri).apply {
                if (!mime.isNullOrBlank()) setMimeType(mime)
                CookieManager.getInstance().getCookie(url)?.let { addRequestHeader("Cookie", it) }
                setTitle(nama)
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, nama)
            }
            (act.getSystemService(android.content.Context.DOWNLOAD_SERVICE) as DownloadManager).enqueue(req)
            Toast.makeText(act, "Mengunduh $nama… Lihat di notifikasi atau folder Download.", Toast.LENGTH_LONG).show()
        } catch (_: Exception) {
            act.bukaDiLuar(uri) // mis. izin penyimpanan Android lama ditolak → buka di browser
        }
    }

    private fun buka(uri: Uri, mime: String) {
        try {
            act.startActivity(Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, mime)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
            })
        } catch (_: ActivityNotFoundException) {
            Toast.makeText(act, "Tidak ada aplikasi untuk membuka file ini. File tetap ada di folder Download.", Toast.LENGTH_LONG).show()
        }
    }

    private fun rapikanNama(nama: String, mime: String): String {
        var n = nama.substringAfterLast('/').replace(Regex("[\\\\/:*?\"<>|\\r\\n]"), "_").trim()
        if (n.isBlank()) n = "BABA-${System.currentTimeMillis()}"
        if (!n.contains('.')) {
            MimeTypeMap.getSingleton().getExtensionFromMimeType(mime)?.let { n += ".$it" }
        }
        return n.take(120)
    }

    private fun mimeDari(nama: String): String =
        MimeTypeMap.getSingleton().getMimeTypeFromExtension(nama.substringAfterLast('.', "").lowercase())
            ?: "application/octet-stream"

    private fun namaUnik(dir: File, nama: String): File {
        var f = File(dir, nama)
        val dasar = nama.substringBeforeLast('.')
        val ext = nama.substringAfterLast('.', "").let { if (it.isEmpty()) "" else ".$it" }
        var i = 1
        while (f.exists()) f = File(dir, "$dasar (${i++})$ext")
        return f
    }
}
