# Stay Away — Build Guide (Fixed for macOS)

## ⚠️ Important: I Cannot Provide a Pre-built APK

APKs must be built using Android SDK tools. I provide the complete source code 
and exact instructions to build your APK in ~10 minutes using Expo's free cloud build service.

---

## 🔧 Fix npm Permissions (macOS) — DO THIS FIRST

If you see `EACCES` or `permission denied` errors, **do NOT use sudo**. 
Instead, run these exact commands:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

Now all global npm installs will work without `sudo`.

---

## 🚀 Build Your APK (3 Steps)

### Step 1: Download & Extract

Download `stay-away-app-fixed.zip` and extract it:

```bash
cd ~/Downloads
unzip stay-away-app-fixed.zip
cd stay-away-app
```

### Step 2: Install Dependencies

```bash
npm install
```

If you see any errors, clear cache and retry:

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Step 3: Build APK via Expo Cloud (No Android Studio needed!)

**Option A: Use npx (no global install required)**

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure   # Select "Android"
npx eas-cli@latest build -p android --profile preview
```

**Option B: Install EAS globally (after fixing permissions above)**

```bash
npm install -g eas-cli
eas login
eas build:configure   # Select "Android"
eas build -p android --profile preview
```

**Result:** Expo builds the APK in the cloud. You get a download link in ~10 minutes.

---

## 🖥️ Alternative: Local Build (Requires Android Studio)

Only do this if you want to build on your own machine:

```bash
# Install Android Studio first, then:
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

APK: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🐛 Troubleshooting

### "No matching version found for react-native-bottom-sheet"
**Fixed in this version.** That package was removed. If you still see this, you have an old zip. Re-download.

### "cannot find or open stay-away-app.zip"
Make sure you downloaded the file and are in the correct folder:
```bash
cd ~/Downloads
ls -la *.zip
```

### "EACCES permission denied"
Run the npm permission fix at the top of this guide, then restart your terminal.

### "expo command not found"
Use `npx expo` instead of installing globally:
```bash
npx expo start
```

---

## 📱 Architecture for 10,000+ Users

| Layer | Current | Production Upgrade |
|-------|---------|-------------------|
| Storage | AsyncStorage (local) | Supabase/Firebase (cloud sync) |
| State | React Context | Zustand + React Query |
| Contacts | Demo array | expo-contacts API |
| Blocking | UI logic only | Native CallScreeningService (Android) |

---

## 📂 Project Structure

```
stay-away-app/
├── App.js
├── app.json                 # App name: "Stay Away"
├── eas.json                 # Build config (APK output)
├── package.json             # Fixed dependencies
├── babel.config.js
├── assets/
└── src/
    ├── components/          # Icons, Toggle, Cards
    ├── context/             # State + Theme
    ├── navigation/          # Tabs + Modal
    ├── screens/             # Home, Contacts, Settings, NewSchedule
    └── utils/               # Call blocker stubs
```

## 🎨 Design System

- **Font:** Inter (400/500/600/700/800) via expo-google-fonts
- **Colors:** iOS System Colors (Blue #007AFF, Green #34C759, Red #FF3B30)
- **Animations:** Spring physics, 60fps native driver
- **Spacing:** 4pt grid (Apple HIG compliant)
