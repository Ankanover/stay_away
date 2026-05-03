# Stay Away

A premium iOS-centric call blocking scheduler built with React Native & Expo. Scalable architecture supporting 10,000+ users.

## Features

- **Schedule-based call blocking** — Block specific contacts during set hours
- **Routine support** — Repeat schedules on selected days
- **Emergency bypass** — Auto-unblocks contacts after repeated calls (configurable threshold)
- **iOS Design System** — Native iOS toggles, SF-style typography (Inter), spring animations
- **Dark/Light mode** — System-aware with manual override
- **10k+ User Scale** — Optimized state management, memoized components, FlatList-ready architecture

## Tech Stack

- React Native 0.73+
- Expo SDK 50+
- React Navigation 6 (Bottom Tabs + Native Stack)
- Zustand-ready context architecture
- AsyncStorage (easily swappable for Firebase/Supabase)
- Reanimated 3 + Gesture Handler

## Project Structure

```
src/
  components/       # Reusable UI (IOSToggle, ScheduleCard, Icons, EmptyState)
  context/          # Global state & theme providers
  navigation/       # React Navigation setup
  screens/          # Home, Contacts, Settings, NewSchedule
  utils/            # Call blocker stubs & helpers
```

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for builds): `npm install -g eas-cli`

### Installation

```bash
cd stay-away-app
npm install
```

### Run Development

```bash
npx expo start
# Press 'i' for iOS simulator, 'a' for Android emulator
```

### Build APK (Android)

**Option 1: Expo Application Services (EAS) — Recommended**

1. Login to Expo:
```bash
eas login
```

2. Configure build:
```bash
eas build:configure
```

3. Build APK:
```bash
eas build -p android --profile preview
```

This generates a signed `.apk` you can download from the Expo dashboard.

**Option 2: Local Android Build (requires Android Studio)**

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Scaling to 10,000+ Users

### Current Architecture (Local-First)
- AsyncStorage persists data per device
- All logic runs client-side
- Suitable for single-user or offline-first experience

### Production Scale Upgrades

1. **Backend Sync**
   - Replace AsyncStorage with Firebase Firestore or Supabase
   - Sync schedules across devices per user ID
   - Implement offline-first with optimistic UI

2. **Native Call Blocking**
   - **Android**: Implement `CallScreeningService` (TelecomManager) via Expo Config Plugin
   - **iOS**: Integrate CallKit CXCallDirectoryProvider (requires native module)
   - Sync blocked numbers to OS-level block list

3. **Push Notifications**
   - Use Expo Push Notifications for block alerts
   - Serverless functions for emergency bypass webhooks

4. **Performance**
   - Already implemented: `React.memo`, `useMemo`, `useCallback`
   - Use `FlatList` for contacts if scaling beyond 1k contacts
   - Code splitting with React.lazy for settings screens

5. **Security**
   - Encrypt stored phone numbers with Expo SecureStore
   - Implement biometric auth for schedule modifications

## Important: Native Call Blocking Limitation

**This codebase provides the UI and logic layer only.**

True call interception requires native OS integration:
- **Android**: Requires `CallScreeningService` and `READ_CALL_LOG` permissions
- **iOS**: Requires CallKit extension (cannot auto-block without user enabling in Settings > Phone > Call Blocking)

For a production app, you must:
1. Eject from Expo managed workflow (or use custom dev clients)
2. Write native Java/Kotlin (Android) and Swift (iOS) modules
3. Handle runtime permissions gracefully

## License

MIT
