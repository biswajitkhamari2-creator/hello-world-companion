# UPSC Genius AI — Android APK Build Guide

Capacitor wrapper already configured. Follow these steps **on your local machine** (Windows / Mac / Linux) to generate a real `.apk` / `.aab` for Play Store.

## 1. Prerequisites (one-time)

- Install **Node.js 20+** and **Bun** (or npm).
- Install **Android Studio** (https://developer.android.com/studio) — this gives you Java JDK 17, Android SDK, and Gradle.
- Open Android Studio once → SDK Manager → install **Android 14 (API 34)** + Build-Tools.
- Set env vars:
  - `ANDROID_HOME` = `~/Library/Android/sdk` (Mac) / `%LOCALAPPDATA%\Android\Sdk` (Windows)

## 2. Clone & install

```bash
git clone <your-repo-url>
cd <project>
bun install
```

## 3. Add Android platform (one-time)

```bash
bunx cap add android
bunx cap sync android
```

This creates an `android/` folder (Gradle project).

## 4. Build a debug APK (for testing)

```bash
cd android
./gradlew assembleDebug
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

Install on phone via USB:
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## 5. Build a signed release AAB (for Play Store)

### Generate keystore (one-time)
```bash
keytool -genkey -v -keystore upsc-release.keystore -alias upsc -keyalg RSA -keysize 2048 -validity 10000
```
Keep `upsc-release.keystore` **safe** — losing it means you can't update the app.

### Configure signing
Create `android/keystore.properties`:
```
storeFile=../../upsc-release.keystore
storePassword=YOUR_PASSWORD
keyAlias=upsc
keyPassword=YOUR_PASSWORD
```

Edit `android/app/build.gradle` — add inside `android { }`:
```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
    }
}
```

### Build AAB
```bash
cd android
./gradlew bundleRelease
```

AAB output: `android/app/build/outputs/bundle/release/app-release.aab` → upload to Play Console.

## 6. Play Store submission

1. Create developer account at https://play.google.com/console ($25 one-time).
2. Create app → Internal testing → upload AAB.
3. Fill in store listing (icon 512x512 already in `public/icon-512.png`, screenshots, description).
4. Submit for review (usually 1–7 days).

## 7. Updating the app

Because `capacitor.config.ts` has `server.url` set to the published URL, **web changes auto-update inside the installed app** — no rebuild needed.

You only need a new APK/AAB when:
- Changing app name / icon / splash
- Adding native plugins (camera, push, etc.)
- Updating Android SDK target

Bump `versionCode` and `versionName` in `android/app/build.gradle` before each Play Store upload.

## Notes

- App ID: `app.upscgenius.ai` (change in `capacitor.config.ts` before first build if needed).
- The Lovable preview / dev server **cannot** build APKs — Android Studio + Gradle must run locally.
- For CI/CD APK builds: use GitHub Actions with `actions/setup-java@v4` + `android-actions/setup-android@v3`.