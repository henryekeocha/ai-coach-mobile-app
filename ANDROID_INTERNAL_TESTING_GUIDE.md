# Android Internal Testing Deployment Guide (FREE)

## Overview

This guide walks you through deploying your coaching app to Google Play Internal Testing track - a **completely FREE** way to distribute your app to judges and testers professionally.

## 🎯 What You'll Get

- Professional distribution via Google Play Store
- Support for up to 100 internal testers
- Easy installation with a simple link
- No $25 Google Play fee required (for internal testing only)
- Automatic updates when you upload new versions

---

## 📋 Prerequisites

Before starting, ensure you have:

1. **Google Account** (free Gmail account)
2. **EAS CLI installed** (if not already):
   ```bash
   npm install -g eas-cli
   ```
3. **Expo account** (free - create at expo.dev)

---

## Step 1: Create Google Play Console Account (FREE)

### 1.1 Sign Up for Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account
3. Accept the Developer Distribution Agreement
4. **Skip the $25 payment** - you don't need it for internal testing!

### 1.2 Create Your App

1. Click **"Create app"** in the Play Console
2. Fill in the details:
   - **App name**: Your coaching app name
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
3. Accept declarations and click **"Create app"**

### 1.3 Complete Required Setup (Minimal)

You'll need to fill in these sections (keep it minimal for internal testing):

1. **Store presence > Main store listing**:
   - Short description: "AI-powered coaching platform"
   - Full description: Brief description of your app
   - App icon: 512x512 PNG
   - Feature graphic: 1024x500 PNG
   - Screenshots: At least 2 screenshots

2. **Policy > Privacy policy**:
   - Add a privacy policy URL or skip for now

3. **Store presence > App content**:
   - Complete the questionnaire (mark as not containing ads, etc.)

---

## Step 2: Configure Your Expo Project

### 2.1 Update app.json

Make sure your `app.json` has proper Android configuration:

```json
{
  "expo": {
    "name": "Your Coaching App",
    "slug": "your-coaching-app",
    "version": "1.0.0",
    "android": {
      "package": "com.yourcompany.coachingapp",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

### 2.2 Login to EAS

```bash
eas login
```

Enter your Expo credentials when prompted.

---

## Step 3: Build Android App Bundle (AAB)

### 3.1 Configure EAS Build

If you haven't already, initialize EAS:

```bash
eas build:configure
```

This creates `eas.json` with build profiles.

### 3.2 Build for Production

Run the production build:

```bash
eas build --platform android --profile production
```

**What happens:**
- EAS will ask if you want to generate a new keystore - select **YES**
- Build will start on EAS servers (takes 10-20 minutes)
- You'll get a download link when complete

### 3.3 Download Your AAB

Once the build completes:
1. Click the download link in the terminal
2. Or go to [expo.dev/accounts/[your-account]/projects/[your-project]/builds](https://expo.dev)
3. Download the `.aab` file

---

## Step 4: Upload to Google Play Internal Testing

### 4.1 Create Internal Testing Release

1. In Google Play Console, go to **Testing > Internal testing**
2. Click **"Create new release"**
3. Upload your `.aab` file
4. Add release notes:
   ```
   Initial internal testing release
   - Core coaching features
   - AI-powered conversations
   - User authentication
   ```
5. Click **"Review release"**
6. Click **"Start rollout to Internal testing"**

### 4.2 Wait for Processing

- Google Play will process your AAB (usually 1-2 hours)
- You'll receive an email when it's ready

---

## Step 5: Invite Testers

### 5.1 Create Tester List

1. Go to **Testing > Internal testing**
2. Click **"Testers"** tab
3. Click **"Create email list"**
4. Add tester emails (judges, reviewers, etc.)
5. Save the list

### 5.2 Get Your Testing Link

1. In **Internal testing** section, you'll see a shareable link
2. It looks like: `https://play.google.com/apps/internaltest/[YOUR_ID]`
3. Copy this link - this is what you'll share!

---

## Step 6: Share with Testers

### 6.1 Send Instructions to Testers

Share this message with your judges:

```
Hi! Here's how to test our coaching app on Android:

1. Open this link on your Android device:
   [YOUR INTERNAL TESTING LINK]

2. Click "Become a tester"

3. Click "Download it on Google Play"

4. Install the app from the Play Store

5. Open and test!

Note: You must be logged in with the Google account I invited.
```

### 6.2 Testing Requirements

Testers must:
- Use an Android device (not iOS)
- Be logged into Google account you invited
- Accept the testing invitation
- Have Google Play Store installed

---

## Step 7: Monitor and Update

### 7.1 Check Installation Status

In Google Play Console:
- Go to **Testing > Internal testing**
- See how many testers have installed
- Check for crashes or issues

### 7.2 Push Updates

When you need to update the app:

1. **Update version in app.json**:
   ```json
   {
     "version": "1.0.1",
     "android": {
       "versionCode": 2
     }
   }
   ```

2. **Build new version**:
   ```bash
   eas build --platform android --profile production
   ```

3. **Upload to Play Console**:
   - Go to **Internal testing**
   - Click **"Create new release"**
   - Upload new AAB
   - Add release notes
   - Roll out

4. **Testers get automatic updates** via Play Store!

---

## 🎯 Quick Summary

### For First-Time Setup:
```bash
# 1. Login to EAS
eas login

# 2. Build the app
eas build --platform android --profile production

# 3. Download AAB when complete
# 4. Upload to Play Console > Internal testing
# 5. Share testing link with judges
```

### For Updates:
```bash
# 1. Update version in app.json
# 2. Build new version
eas build --platform android --profile production

# 3. Upload new AAB to Play Console
# 4. Testers get automatic updates!
```

---

## 💡 Tips for Success

### Before Building
- ✅ Test the app thoroughly in development
- ✅ Ensure all API keys are in production environment
- ✅ Update app icons and splash screens
- ✅ Set correct package name in app.json

### For Judges
- 📱 Share testing link at least 24 hours before deadline
- 📧 Send clear installation instructions
- 🔄 Allow time for Play Store processing (1-2 hours)
- 📞 Provide support contact if they have issues

### Professional Polish
- 📸 Add high-quality screenshots to Play Console
- 📝 Write clear app description
- 🎨 Use proper app icon (512x512)
- 📋 Include feature list in release notes

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and retry
eas build --platform android --profile production --clear-cache
```

### Upload Rejected
- Ensure versionCode increases with each upload
- Check that package name matches Play Console
- Verify AAB is for production (not debug)

### Testers Can't Install
- Verify they accepted testing invitation
- Check they're logged into correct Google account
- Ensure app has finished processing (1-2 hours)

### App Crashes on Start
- Check logs in Play Console > Quality > Android vitals
- Ensure all production environment variables are set
- Test on physical device, not just emulator

---

## 📱 Testing Checklist

Before sharing with judges:

- [ ] App builds successfully
- [ ] App uploaded to Play Console
- [ ] Internal testing release created
- [ ] Testers invited via email list
- [ ] Testing link copied and ready to share
- [ ] Installation instructions prepared
- [ ] Test installation on one device first
- [ ] All core features working
- [ ] No crashes or major bugs
- [ ] Professional appearance (icons, splash)

---

## 🎊 Next Steps

You're ready to deploy! Here's what to do:

1. Run `eas build --platform android --profile production`
2. Wait for build to complete (grab a coffee ☕)
3. Download the AAB file
4. Upload to Google Play Console > Internal testing
5. Share the testing link with judges
6. Celebrate! 🎉

**Need help?** Check the [EAS Build documentation](https://docs.expo.dev/build/introduction/) or [Google Play Console help](https://support.google.com/googleplay/android-developer).

---

## 💰 Cost Summary

- **Google Play Console account**: FREE (for internal testing)
- **EAS builds**: FREE tier includes builds per month
- **Distribution**: FREE (internal testing)
- **Updates**: FREE (unlimited)
- **Total cost**: **$0** 🎉

---

Good luck with your deployment! 🚀
