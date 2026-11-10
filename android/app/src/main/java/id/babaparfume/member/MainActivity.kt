package id.babaparfume.member

import android.Manifest
import android.annotation.SuppressLint
import android.app.AlertDialog
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.Typeface
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import java.io.File

/**
 * Satu layar: aplikasi web BABA PARFUME (BuildConfig.BABA_URL) di WebView, layar penuh tanpa bilah alamat.
 * Seluruh fitur & tampilan tetap dari website — update web langsung terpakai tanpa APK baru.
 * Tambahan khusus aplikasi: simpan Excel/PDF ke folder Download (JembatanAplikasi), unggah file/kamera,
 * tombol Kembali, layar tanpa koneksi, dan pemberitahuan versi APK baru (CekVersi).
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progress: ProgressBar
    private lateinit var splash: View
    private lateinit var offline: View
    lateinit var unduhan: Unduhan
        private set

    private val baseUri: Uri by lazy { Uri.parse(BuildConfig.BABA_URL) }
    private val urlAwal: String get() = BuildConfig.BABA_URL.trimEnd('/') + HALAMAN_AWAL

    private var galatMuat = false

    // Unggah file (foto profil, Excel import dokumen, dll)
    private var fileCallback: ValueCallback<Array<Uri>>? = null
    private var fotoKameraUri: Uri? = null

    private val pilihFile = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { hasil ->
        val cb = fileCallback ?: return@registerForActivityResult
        fileCallback = null
        val data = hasil.data
        val uris: Array<Uri>? = when {
            hasil.resultCode != RESULT_OK -> null
            data?.clipData != null -> Array(data.clipData!!.itemCount) { data.clipData!!.getItemAt(it).uri }
            data?.data != null -> arrayOf(data.data!!)
            fotoKameraUri != null -> arrayOf(fotoKameraUri!!) // kamera tidak mengembalikan data
            else -> null
        }
        cb.onReceiveValue(uris)
    }

    private val izinKamera = registerForActivityResult(ActivityResultContracts.RequestPermission()) { lanjutPemilihSetelahIzin() }

    val izinSimpan = registerForActivityResult(ActivityResultContracts.RequestPermission()) { ok ->
        unduhan.izinSimpanSelesai(ok)
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        unduhan = Unduhan(this)

        val root = FrameLayout(this).apply { setBackgroundColor(WARNA_HITAM) }
        webView = WebView(this).apply { setBackgroundColor(WARNA_HITAM) }
        progress = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            max = 100
            progressTintList = android.content.res.ColorStateList.valueOf(WARNA_EMAS)
            visibility = View.GONE
        }
        splash = buatSplash()
        offline = buatOffline().apply { visibility = View.GONE }
        root.addView(webView, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        root.addView(progress, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(3)))
        root.addView(offline, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        root.addView(splash, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        setContentView(root)

        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false // bunyi notifikasi & chat
            loadWithOverviewMode = true
            useWideViewPort = true
            textZoom = 100 // tata letak sama dengan web walau ukuran huruf HP diperbesar
            cacheMode = WebSettings.LOAD_DEFAULT
            setSupportMultipleWindows(false) // window.open dibuka di layar yang sama / aplikasi lain
            allowFileAccess = false
            // Penanda supaya web tahu sedang dibuka dari aplikasi (tombol unduh/pasang disembunyikan)
            userAgentString = "$userAgentString BabaParfumeApp/${BuildConfig.VERSION_NAME}"
        }
        CookieManager.getInstance().setAcceptCookie(true)

        webView.addJavascriptInterface(JembatanAplikasi(this), "BabaApp")
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            WebViewCompat.addDocumentStartJavaScript(webView, JembatanAplikasi.SKRIP, setOf(asal()))
        }
        webView.webViewClient = BabaWebViewClient()
        webView.webChromeClient = BabaChromeClient()
        webView.setDownloadListener { url, _, contentDisposition, mimeType, _ ->
            unduhan.dariUrl(url, android.webkit.URLUtil.guessFileName(url, contentDisposition, mimeType), mimeType)
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val path = Uri.parse(webView.url ?: "").path?.trimEnd('/') ?: ""
                if (offline.visibility == View.VISIBLE || path in HALAMAN_KELUAR || !webView.canGoBack()) {
                    moveTaskToBack(true)
                } else {
                    webView.goBack()
                }
            }
        })

        try { koneksi.registerDefaultNetworkCallback(pantauJaringan) } catch (_: Exception) {}

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState)
            splash.visibility = View.GONE
        } else {
            if (adaInternet()) webView.loadUrl(urlAwal) else tampilkanOffline()
            // Layar pembuka hilang paling lambat 12 detik walau halaman belum selesai
            Handler(Looper.getMainLooper()).postDelayed({ sembunyikanSplash() }, 12_000)
            CekVersi.periksa(this)
        }
    }

    override fun onPause() {
        super.onPause()
        CookieManager.getInstance().flush()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onDestroy() {
        try { koneksi.unregisterNetworkCallback(pantauJaringan) } catch (_: Exception) {}
        webView.destroy()
        super.onDestroy()
    }

    private fun asal(): String = "${baseUri.scheme}://${baseUri.authority}"

    fun hostSendiri(uri: Uri): Boolean =
        uri.scheme in listOf("http", "https") && uri.authority.equals(baseUri.authority, ignoreCase = true)

    fun bukaDiLuar(uri: Uri) {
        try {
            val intent = if (uri.scheme == "intent") Intent.parseUri(uri.toString(), Intent.URI_INTENT_SCHEME) else Intent(Intent.ACTION_VIEW, uri)
            startActivity(intent)
        } catch (_: Exception) {
            Toast.makeText(this, "Tidak ada aplikasi untuk membuka tautan ini.", Toast.LENGTH_SHORT).show()
        }
    }

    private fun sembunyikanSplash() {
        if (splash.visibility != View.VISIBLE) return
        splash.animate().alpha(0f).setDuration(250).withEndAction { splash.visibility = View.GONE }.start()
    }

    private fun cobaLagi() {
        if (!adaInternet()) {
            Toast.makeText(this, "Masih belum ada koneksi internet.", Toast.LENGTH_SHORT).show()
            return
        }
        offline.visibility = View.GONE
        if (webView.url.isNullOrBlank() || webView.url == "about:blank") webView.loadUrl(urlAwal) else webView.reload()
    }

    private fun tampilkanOffline() {
        offline.visibility = View.VISIBLE
        sembunyikanSplash()
    }

    // ---------- Koneksi HP ----------
    // Web menyimpan salinan aplikasi (service worker), jadi tanpa internet halaman bisa tetap terbuka
    // tetapi kosong. Karena itu aplikasi memeriksa koneksi HP sendiri saat dibuka, dan memuat ulang
    // otomatis begitu internet kembali.

    private val koneksi: ConnectivityManager by lazy { getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager }

    private fun adaInternet(): Boolean {
        val jaringan = koneksi.activeNetwork ?: return false
        return koneksi.getNetworkCapabilities(jaringan)?.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) == true
    }

    private val pantauJaringan = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            runOnUiThread { if (offline.visibility == View.VISIBLE) Handler(Looper.getMainLooper()).postDelayed({ cobaLagi() }, 800) }
        }
    }

    // ---------- Tampilan bawaan aplikasi (layar pembuka & tanpa koneksi) ----------
    // Latar hitam pekat = sama dengan latar gambar logo (kotak logo tidak terlihat)

    private fun buatSplash(): View = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
        gravity = Gravity.CENTER
        setBackgroundColor(Color.BLACK)
        isClickable = true
        addView(ImageView(this@MainActivity).apply {
            setImageResource(R.drawable.logo_splash)
            scaleType = ImageView.ScaleType.FIT_CENTER
        }, LinearLayout.LayoutParams(dp(200), dp(200)))
        addView(ProgressBar(this@MainActivity).apply {
            indeterminateTintList = android.content.res.ColorStateList.valueOf(WARNA_EMAS)
        }, LinearLayout.LayoutParams(dp(32), dp(32)).apply { topMargin = dp(24) })
    }

    private fun buatOffline(): View = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
        gravity = Gravity.CENTER
        setBackgroundColor(Color.BLACK)
        setPadding(dp(32), dp(32), dp(32), dp(32))
        isClickable = true
        addView(ImageView(this@MainActivity).apply { setImageResource(R.drawable.logo_splash) }, LinearLayout.LayoutParams(dp(120), dp(120)))
        addView(TextView(this@MainActivity).apply {
            text = "Tidak ada koneksi internet"
            setTextColor(WARNA_EMAS)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 20f)
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
        }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(16) })
        addView(TextView(this@MainActivity).apply {
            text = "Periksa data seluler atau Wi-Fi HP Anda, lalu ketuk Coba lagi."
            setTextColor(Color.argb(190, 255, 255, 255))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
            gravity = Gravity.CENTER
        }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(8) })
        addView(Button(this@MainActivity).apply {
            text = "Coba lagi"
            setTextColor(WARNA_HITAM)
            backgroundTintList = android.content.res.ColorStateList.valueOf(WARNA_EMAS)
            setOnClickListener { cobaLagi() }
        }, LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(24) })
    }

    fun dp(n: Int): Int = (n * resources.displayMetrics.density).toInt()

    // ---------- WebView ----------

    private inner class BabaWebViewClient : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            // Halaman BABA tetap di aplikasi; tautan lain (WhatsApp, Maps, file di server API) dibuka aplikasi lain
            if (hostSendiri(request.url)) return false
            if (request.url.scheme == "blob" || request.url.scheme == "data") return true // ditangani skrip jembatan
            bukaDiLuar(request.url)
            return true
        }

        override fun onPageStarted(view: WebView, url: String?, favicon: Bitmap?) {
            galatMuat = false
            progress.visibility = View.VISIBLE
        }

        override fun onPageFinished(view: WebView, url: String?) {
            progress.visibility = View.GONE
            // WebView lama tanpa DOCUMENT_START_SCRIPT: pasang skrip jembatan setelah halaman dimuat
            if (!WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
                view.evaluateJavascript(JembatanAplikasi.SKRIP, null)
            }
            if (!galatMuat) {
                offline.visibility = View.GONE
                sembunyikanSplash()
            }
        }

        override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
            if (!request.isForMainFrame) return
            galatMuat = true
            offline.visibility = View.VISIBLE
            sembunyikanSplash()
        }
    }

    private inner class BabaChromeClient : WebChromeClient() {
        override fun onProgressChanged(view: WebView, newProgress: Int) {
            progress.progress = newProgress
        }

        override fun onShowFileChooser(
            webView: WebView,
            filePathCallback: ValueCallback<Array<Uri>>,
            fileChooserParams: FileChooserParams,
        ): Boolean {
            fileCallback?.onReceiveValue(null)
            fileCallback = filePathCallback
            fotoKameraUri = null

            val gambar = fileChooserParams.acceptTypes.any { it.startsWith("image") }
            if (gambar && !punyaIzinKamera() && !sudahTanyaKamera) {
                // Foto: tanya izin kamera dulu (sekali), sesudah dijawab baru jendela pilih file dibuka
                sudahTanyaKamera = true
                pemilihTertunda = fileChooserParams
                izinKamera.launch(Manifest.permission.CAMERA)
                return true
            }
            bukaPemilih(fileChooserParams)
            return true
        }
    }

    private var sudahTanyaKamera = false
    private var pemilihTertunda: WebChromeClient.FileChooserParams? = null

    private fun punyaIzinKamera() =
        ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED

    fun lanjutPemilihSetelahIzin() {
        val p = pemilihTertunda ?: return
        pemilihTertunda = null
        bukaPemilih(p)
    }

    /** Jendela pilih file; untuk foto ditambah pilihan Kamera bila izin kamera ada. */
    private fun bukaPemilih(params: WebChromeClient.FileChooserParams) {
        val gambar = params.acceptTypes.any { it.startsWith("image") }
        val kamera = if (gambar) buatIntentKamera() else null
        val intent = if (params.isCaptureEnabled && kamera != null) {
            kamera
        } else {
            Intent.createChooser(params.createIntent(), "Pilih file").apply {
                if (kamera != null) putExtra(Intent.EXTRA_INITIAL_INTENTS, arrayOf(kamera))
            }
        }
        try {
            pilihFile.launch(intent)
        } catch (_: ActivityNotFoundException) {
            fileCallback?.onReceiveValue(null)
            fileCallback = null
            Toast.makeText(this, "Tidak ada aplikasi untuk memilih file.", Toast.LENGTH_SHORT).show()
        }
    }

    /** Intent kamera yang menyimpan foto ke cache aplikasi (dibagikan lewat FileProvider). */
    private fun buatIntentKamera(): Intent? {
        if (!punyaIzinKamera()) return null
        return try {
            val dir = File(cacheDir, "foto").apply { mkdirs() }
            val file = File.createTempFile("foto_", ".jpg", dir)
            val uri = FileProvider.getUriForFile(this, "$packageName.fileprovider", file)
            fotoKameraUri = uri
            Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                putExtra(MediaStore.EXTRA_OUTPUT, uri)
                addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION or Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
        } catch (_: Exception) {
            null
        }
    }

    fun tampilkanDialog(judul: String, pesan: String, tombolYa: String?, aksiYa: (() -> Unit)?, tombolTidak: String) {
        if (isFinishing || isDestroyed) return
        AlertDialog.Builder(this).apply {
            setTitle(judul)
            setMessage(pesan)
            if (tombolYa != null && aksiYa != null) setPositiveButton(tombolYa) { _, _ -> aksiYa() }
            setNegativeButton(tombolTidak, null)
        }.show()
    }

    companion object {
        const val HALAMAN_AWAL = "/admin/dashboard"
        /** Tombol Kembali di halaman ini = keluar (ke layar utama HP), bukan mundur ke Login. */
        val HALAMAN_KELUAR = setOf("", "/admin", "/admin/dashboard", "/admin/login")
        val WARNA_HITAM: Int = Color.parseColor("#141414")
        val WARNA_EMAS: Int = Color.parseColor("#E6B422")
    }
}
