# Complete TestFlight Deployment Guide

This guide will walk you through deploying your AI Coach app to Apple TestFlight for judging and testing.

---

## ⏱️ Expected Timeline

- **Setup (First Time)**: 30-45 minutes
- **Build Time**: 15-30 minutes (automated)
- **TestFlight Review**: 24-48 hours (Apple review)
- **Total Time to Shareable Link**: 1-3 days

---

## 📋 Prerequisites

### 1. Apple Developer Account
- Cost: $99/year
- Sign up at: https://developer.apple.com
- Verify your account is active before proceeding

### 2. Required Software
- macOS computer (required for iOS development)
- Node.js 18+ installed
- Xcode installed (from Mac App Store)

### 3. Install EAS CLI
```bash
npm install -g eas-cli
```

---

## 🚀 Step-by-Step Deployment

### Step 1: Login to Expo

```bash
eas login
```

If you don't have an Expo account:
```bash
eas register
```

Follow the prompts to create your account (it's free).

---

### Step 2: Configure Your Project

Link your project to Expo:
```bash
eas build:configure
```

This will:
- Create an Expo project if needed
- Set up the project ID
- Confirm your eas.json configuration

---

### Step 3: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in the details:
   - **Platform**: iOS
   - **Name**: AI Coach (or your preferred name)
   - **Primary Language**: English
   - **Bundle ID**: Create new → `com.aicoach.app`
   - **SKU**: `ai-coach-001` (any unique identifier)
   - **User Access**: Full Access

4. **Save the following information** (you'll need it):
   - Your Apple ID email
   - Your Apple Team ID (found in Membership section)
   - Your App Store Connect App ID (numeric ID in the URL)

---

### Step 4: Update eas.json with Your Details

Open `eas.json` and update the submit section:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-email@example.com",
      "ascAppId": "1234567890",
      "appleTeamId": "ABCD123456"
    }
  }
}
```

Replace:
- `your-email@example.com` with your Apple ID email
- `1234567890` with your App Store Connect App ID
- `ABCD123456` with your Apple Team ID

---

### Step 5: Build for iOS

Run the production build:
```bash
eas build --platform ios --profile production
```

**What happens next:**
1. EAS will ask you to log in to your Apple account
2. It will automatically create certificates and provisioning profiles
3. Your app will be uploaded to EAS servers and built (15-30 minutes)
4. You'll get a notification when the build completes

**Monitor your build:**
```bash
# You'll see a URL like:
# https://expo.dev/accounts/[your-account]/projects/ai-coach-platform/builds/[build-id]
```

Visit this URL to watch build progress in real-time.

---

### Step 6: Submit to TestFlight

Once the build succeeds, submit it to TestFlight:

```bash
eas submit --platform ios --latest
```

This command will:
1. Automatically download your latest build
2. Upload it to App Store Connect
3. Submit it for TestFlight review

---

### Step 7: Configure TestFlight

1. Go to https://appstoreconnect.apple.com
2. Navigate to **"My Apps"** → **"AI Coach"** → **"TestFlight"**
3. Wait for Apple's review (usually 24-48 hours)
4. Once approved, you'll see your build under **"iOS Builds"**

---

### Step 8: Create External Test Group (For Judges)

1. In TestFlight, click **"External Groups"** (not Internal)
2. Click **"+"** to create a new group
3. Name it: **"Judges"** or **"Competition Reviewers"**
4. Add your build to this group
5. Submit for external testing review (Apple reviews this - usually quick)

---

### Step 9: Get Your Shareable Link

Once approved:

1. In the **"Judges"** external group, click **"Add Testers"**
2. You can either:
   - **Option A**: Add individual email addresses
   - **Option B**: Enable **"Public Link"** to generate a shareable URL

**For competitions, Public Link is recommended:**
1. Enable **"Public Link"**
2. Copy the URL (format: `https://testflight.apple.com/join/XXXXXXXX`)
3. **This is your submission link!**

---

## 📱 How Judges Will Use TestFlight

### For Judges to Test Your App:

1. **Install TestFlight** from the App Store
2. **Open your public link** or use the invitation code
3. **Accept the invitation** in TestFlight
4. **Install AI Coach** from TestFlight
5. **Open and test** the app

**Important**: Judges need:
- An iOS device (iPhone or iPad)
- iOS 13.0 or later
- TestFlight app installed

---

## 🔧 Troubleshooting

### Build Fails

**Check your credentials:**
```bash
eas credentials
```

**Clear credentials and retry:**
```bash
eas build --platform ios --clear-credentials
```

### Missing Certificates

EAS should auto-generate certificates, but if needed:
```bash
eas credentials --platform ios
```

Follow prompts to set up:
- Distribution Certificate
- Provisioning Profile

### Build Takes Too Long

Builds typically take 15-30 minutes. If it's taking longer:
- Check the build logs in your Expo dashboard
- Ensure your internet connection is stable
- Contact Expo support if stuck

---

## 🎯 Quick Command Reference

```bash
# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios --latest

# Check build status
eas build:list

# View credentials
eas credentials

# Cancel a build
eas build:cancel
```

---

## 📊 Alternative: Preview Build (Faster for Testing)

If you need a faster option that doesn't require App Store review:

```bash
eas build --platform ios --profile preview
```

This creates an **ad-hoc build** that can be:
- Installed directly via link (no TestFlight needed)
- Shared immediately after build completes
- Limited to registered devices only (up to 100 devices)

**Pros**: No Apple review, instant sharing
**Cons**: Requires device UDIDs, less professional

---

## 💰 Cost Breakdown

- **Apple Developer Account**: $99/year (required)
- **Expo EAS Builds**: Free tier includes builds (sufficient for testing)
- **Total First-Time Cost**: $99

---

## ✅ Final Checklist

Before submitting to judges:

- [ ] App builds successfully on EAS
- [ ] TestFlight submission approved by Apple
- [ ] External test group created
- [ ] Public link generated and tested
- [ ] App tested on TestFlight by at least one person
- [ ] Environment variables configured (Supabase, RevenueCat)
- [ ] Demo mode works if API keys not provided

---

## 🆘 Need Help?

**Expo Documentation:**
- https://docs.expo.dev/build/setup/
- https://docs.expo.dev/submit/ios/

**App Store Connect Help:**
- https://developer.apple.com/help/app-store-connect/

**Expo Discord:**
- https://chat.expo.dev/

---

## 🎉 Success!

Once you have your TestFlight public link, you can share it with judges. They'll be able to:
- Install your app with one tap
- Test all features on real iOS devices
- Provide feedback directly through TestFlight

**Your submission link will look like:**
```
https://testflight.apple.com/join/AbC12DeF
```

Share this link in your competition submission!
