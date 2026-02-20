# Wardrobe Outfit App

A slick mobile app that helps men build and style their wardrobe using **Claude AI**.

---

## Features

| Feature | Description |
|---|---|
| **Photo Upload** | Add clothes one at a time via camera or photo library |
| **AI Analysis** | Claude Vision identifies type, color, pattern, style, material & season |
| **Outfit Advisor** | Pick an occasion → Claude recommends 3 outfit combinations from your wardrobe |
| **Smart Storage** | All items saved locally on device (no account needed) |
| **Dark UI** | Clean, minimal dark-mode design |

---

## Architecture

```
wardrobe-outfit-app/
├── mobile/          ← Expo React Native (TypeScript)
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx    ← Wardrobe screen (upload + grid)
│   │   │   └── advisor.tsx  ← Outfit Advisor screen
│   ├── services/
│   │   ├── api.ts           ← Backend API client
│   │   └── storage.ts       ← Local AsyncStorage persistence
│   └── types/index.ts       ← Shared TypeScript types
│
└── backend/         ← Express.js + TypeScript
    └── src/
        ├── services/claude.ts   ← Claude API integration
        ├── routes/wardrobe.ts   ← POST /api/wardrobe/analyze
        └── routes/advisor.ts    ← POST /api/advisor/recommend
```

---

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — add your ANTHROPIC_API_KEY

npm install
npm run dev
# Server running at http://localhost:3000
```

### 2. Mobile App

```bash
cd mobile
cp .env.example .env
# Edit .env — set EXPO_PUBLIC_API_URL to your backend URL
# For physical device: use your LAN IP, e.g. http://192.168.1.100:3000

npm install
npx expo start
# Scan QR with Expo Go app (iOS/Android)
```

---

## How It Works

### Uploading a Clothing Item

1. Tap **+** → choose camera or photo library
2. Photo is base64-encoded and sent to `POST /api/wardrobe/analyze`
3. Backend sends image to **Claude Opus 4.6** (vision + adaptive thinking)
4. Claude returns structured JSON: type, color, pattern, style, material, season
5. Item is saved locally with the analysis metadata

### Getting Outfit Recommendations

1. Open **Outfit Advisor** tab
2. Select an occasion (Job Interview, First Date, etc.)
3. Optionally add context ("outdoor", "evening", etc.)
4. Tap **Style Me**
5. Backend sends your wardrobe summary to **Claude Opus 4.6**
6. Claude returns up to 3 outfit combinations with styling tips

---

## API Reference

### `POST /api/wardrobe/analyze`

```json
// Request
{ "imageBase64": "...", "mediaType": "image/jpeg" }

// Response
{
  "success": true,
  "analysis": {
    "type": "slim-fit white oxford shirt",
    "category": "top",
    "color": ["white"],
    "pattern": "solid",
    "style": "smart-casual",
    "material": "cotton",
    "season": ["spring", "summer", "fall"],
    "description": "A crisp white oxford shirt ideal for layering or wearing alone."
  }
}
```

### `POST /api/advisor/recommend`

```json
// Request
{
  "wardrobe": [{ "id": "...", "analysis": {...}, "addedAt": "..." }],
  "occasion": "Job Interview",
  "context": "tech company, warm day"
}

// Response
{
  "success": true,
  "recommendation": {
    "occasion": "Job Interview",
    "outfits": [
      {
        "name": "Sharp & Confident",
        "items": ["Item 1", "Item 3"],
        "description": "The white shirt with navy chinos projects professionalism...",
        "tips": "Tuck in the shirt and add a leather belt for a polished finish."
      }
    ],
    "generalAdvice": "For a tech interview, smart-casual is the sweet spot..."
  }
}
```

---

## Requirements

- Node.js 18+
- Expo CLI (`npm install -g expo`)
- Expo Go app on your phone
- Anthropic API key ([get one here](https://console.anthropic.com))
