# 🚀 TestFlight Quick Start (5-Minute Version)

If you already have an Apple Developer account and know what you're doing, here's the express version:

## Prerequisites
- ✅ Apple Developer account ($99/year)
- ✅ Node.js installed
- ✅ App created in App Store Connect

---

## Commands to Run

### 1. Install & Login
```bash
npm install -g eas-cli
eas login
```

### 2. Configure & Build
```bash
eas build:configure
eas build --platform ios --profile production
```

Wait 15-30 minutes for build to complete.

### 3. Submit to TestFlight
```bash
eas submit --platform ios --latest
```

### 4. Update eas.json
Edit `eas.json` and add your credentials:
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your@email.com",
      "ascAppId": "1234567890",
      "appleTeamId": "ABCD123456"
    }
  }
}
```

### 5. Get Your Link
1. Go to https://appstoreconnect.apple.com
2. TestFlight → External Groups → Create "Judges" group
3. Enable Public Link
4. Copy and share: `https://testflight.apple.com/join/XXXXXXXX`

---

## Timeline
- Build: 15-30 min
- Apple Review: 24-48 hours
- Total: 1-3 days

---

## App Details Configured
- **App Name**: AI Coach
- **Bundle ID**: com.aicoach.app
- **Version**: 1.0.0

---

## Need Full Guide?
See `TESTFLIGHT_DEPLOYMENT_GUIDE.md` for detailed step-by-step instructions.
