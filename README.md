# Matrimony Project

## Run the React Native app

```powershell
cd matrimony-app
npm start
```

Press `w` for web → http://localhost:8081

## Folders

| Folder | What it is |
|--------|------------|
| **`matrimony-app/`** | React Native Expo app — **run this** |
| `stitch_premium_tamil_matrimony_app/` | Original HTML mockups (reference only) |

## Common error fix

If you see **500 error** or **MIME type application/json** in the browser:

You started Expo from the wrong folder. Stop the server and run from `matrimony-app` instead.

**Wrong:** `stitch_premium_tamil_matrimony_app` (no App.js, no expo-router)  
**Correct:** `matrimony-app`

## Live deployment

https://matrimony-mobile-app-8541d.web.app
