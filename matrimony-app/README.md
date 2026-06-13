# Matrimony - React Native App

Premium Tamil Matrimony app built with **Expo** and **React Native**, converted from the original Stitch HTML designs.

## Screens

- Splash → Login → OTP → Profile Setup (8 steps) → Main App
- **Tabs:** Home, Matches, Interests, Chat, Profile
- **Settings** modal from Profile screen

## Run the app

```bash
cd matrimony-app
npm install
npm start
```

Then:

- Press `w` to open in **web browser** (`http://localhost:8081`)
- Scan QR code with **Expo Go** on your phone (Android/iOS)
- Press `a` for Android emulator or `i` for iOS simulator

## Project structure

```
matrimony-app/
├── app/                 # Expo Router screens
│   ├── index.tsx        # Splash
│   ├── login.tsx
│   ├── otp.tsx
│   ├── profile-setup/
│   └── (tabs)/          # Main tab navigation
├── components/          # Reusable UI
├── constants/           # Theme, images, profile steps
└── assets/              # App icons
```

## Firebase

### JavaScript SDK (web + mobile)
Initialized in `lib/firebase.ts` and loaded on app start (`app/_layout.tsx`).

```typescript
import { getFirebaseAuth } from '@/lib/firebase';

const auth = await getFirebaseAuth();
```

### Android Gradle (native builds)
| File | Configuration |
|------|---------------|
| `android/build.gradle` | Google services plugin `4.4.4` |
| `android/app/build.gradle` | Plugin + Firebase BoM `34.14.1` + Analytics |
| `android/app/google-services.json` | Android Firebase config |

`plugins/withGoogleServices.js` re-applies this on `npx expo prebuild`.

**Required:** In [Firebase Console](https://console.firebase.google.com/), add an Android app with package `com.matrimony.app`, download `google-services.json`, and replace the file in the project root (and `android/app/`).

Build Android:
```bash
npx expo run:android
```

### Firebase Hosting (web deploy)
The web app is deployed to Firebase Hosting.

**Live URL:** https://matrimony-mobile-app-8541d.web.app

Redeploy after changes:
```bash
npm run deploy
```

This runs `expo export --platform web` then `firebase deploy --only hosting`.


The original Stitch HTML mockups are preserved in `../stitch_premium_tamil_matrimony_app/` for reference.
