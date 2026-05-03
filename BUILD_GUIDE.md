
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
