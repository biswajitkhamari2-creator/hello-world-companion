# UPSC Genius AI — Android (Capacitor) Setup

This is a **remote WebView wrapper**. The native shell loads your deployed
Lovable app (`https://project--be6b80b9-70b2-4fbd-91be-fb74dc5bebe0.lovable.app`).
All AI / Supabase / Telegram / Drive logic continues to run on the Lovable
server — secrets never enter the APK.

## Prerequisites (on YOUR computer)

- Node.js 20+
- Android Studio Hedgehog (2023.1.1) or newer
- JDK 17
- Android SDK 34 + 35 installed via Android Studio SDK Manager

## One-time setup

```bash
# 1. Install dependencies
npm install

# 2. Publish the app in Lovable first (click Publish button)
#    Until you publish, the WebView will show "Loading..." forever.

# 3. Add the Android platform
npx cap add android

# 4. Sync config + assets into the native project
npx cap sync android

# 5. Open in Android Studio
npx cap open android
```

## After `npx cap add android` — apply the manifest patches

Open the files in `android-setup/` and merge them into the generated Android
project (Capacitor's defaults are too restrictive for file upload / camera /
mic):

| Source file in this repo                       | Destination in android/                                            |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `android-setup/AndroidManifest.additions.xml`  | merge into `android/app/src/main/AndroidManifest.xml`              |
| `android-setup/network_security_config.xml`    | copy to `android/app/src/main/res/xml/network_security_config.xml` |
| `android-setup/build.gradle.snippet`           | merge into `android/app/build.gradle`                              |
| `android-setup/colors.xml`                     | overwrite `android/app/src/main/res/values/colors.xml`             |
| `android-setup/strings.xml`                    | overwrite `android/app/src/main/res/values/strings.xml`            |

Then in `AndroidManifest.xml`, add this attribute to the `<application>` tag:

```
android:networkSecurityConfig="@xml/network_security_config"
```

## Launcher icons & splash screen

Easiest path — use Android Studio's built-in **Image Asset Studio**:

1. Right-click `android/app/src/main/res` → **New → Image Asset**
2. Icon type: **Launcher Icons (Adaptive and Legacy)**
3. Foreground: your UPSC Genius AI logo (PNG, 1024×1024, transparent bg)
4. Background color: `#1a1f3a`
5. Click Next → Finish. This generates all `mipmap-*` densities + adaptive XML.

For the splash, place a 2732×2732 PNG of your logo on the indigo background at:
`android/app/src/main/res/drawable/splash.png`
(Capacitor's SplashScreen plugin uses this automatically — configured in
`capacitor.config.ts`.)

## Build a signed AAB for Play Store

1. In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**
2. Create a new keystore (store the `.jks` and passwords somewhere safe — losing
   them means you can never update the app on Play Store again).
3. Build variant: **release**
4. AAB output: `android/app/release/app-release.aab`
5. Upload to Play Console → Internal testing first, then Production.

## Updating the app

Because this is a remote wrapper, **every change you ship from Lovable goes
live to all users instantly** — no Play Store re-submission needed. You only
re-release the AAB when you change:

- App name, icon, splash, package ID
- Permissions or native plugins
- The `PUBLISHED_URL` in `capacitor.config.ts`

## Daily dev workflow

```bash
npm run build       # not required for remote wrapper, but keeps Lovable build healthy
npx cap sync android
npx cap open android
```

## Troubleshooting

- **Blank screen on launch** → You haven't clicked Publish in Lovable yet, or
  the published URL changed. Verify the URL loads in a desktop browser.
- **"net::ERR_CLEARTEXT_NOT_PERMITTED"** → Something tried to load over HTTP.
  Keep `cleartext: false` and only use HTTPS URLs.
- **File picker doesn't open** → Manifest `<queries>` block from
  `AndroidManifest.additions.xml` wasn't merged.
- **Camera/mic permission denied silently** → On Android 13+ you must request
  `POST_NOTIFICATIONS` and media permissions at runtime; the WebView does this
  via the permission prompts when the page calls `getUserMedia()`.
- **Google sign-in shows "disallowed_useragent"** → Google blocks OAuth in
  embedded WebViews. Use Supabase email/password or switch to Custom Tabs for
  the OAuth flow (requires `@capacitor/browser` plugin).
