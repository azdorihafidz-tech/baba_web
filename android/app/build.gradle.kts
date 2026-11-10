plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// Alamat aplikasi web yang dibuka APK (tetap, tanpa isian alamat di HP).
// Bisa diganti saat build untuk uji: BABA_URL=http://10.0.2.2:3000 ./gradlew assembleDebug
val babaUrl: String = System.getenv("BABA_URL") ?: "https://member.babaparfume.id"

// Nomor versi naik otomatis tiap build GitHub Actions (GITHUB_RUN_NUMBER),
// supaya APK baru bisa dipasang di atas versi lama tanpa hapus aplikasi.
val buildNumber = System.getenv("GITHUB_RUN_NUMBER")?.toIntOrNull() ?: 1

// Kunci tanda tangan tetap (GitHub Secrets, lihat .github/workflows/android-apk.yml).
// Tanpa kunci, build release memakai kunci debug (hanya untuk uji, tidak bisa menimpa APK resmi).
val keystorePath: String? = System.getenv("BABA_KEYSTORE_PATH")

android {
    namespace = "id.babaparfume.member"
    compileSdk = 34

    defaultConfig {
        applicationId = "id.babaparfume.member"
        minSdk = 24
        targetSdk = 34
        versionCode = buildNumber
        versionName = "1.0.$buildNumber"
        buildConfigField("String", "BABA_URL", "\"$babaUrl\"")
    }

    buildFeatures {
        buildConfig = true
    }

    signingConfigs {
        if (keystorePath != null) {
            create("release") {
                storeFile = file(keystorePath)
                storeType = "pkcs12"
                storePassword = System.getenv("BABA_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("BABA_KEY_ALIAS") ?: "babaparfume"
                keyPassword = System.getenv("BABA_KEYSTORE_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = if (keystorePath != null) signingConfigs.getByName("release") else signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.webkit:webkit:1.11.0")
}
