# Release Process & Auto-Updates

This document explains how to create new releases and how the auto-update system works.

> **Note:** This app uses Vite + React with Electron. The build process compiles TypeScript and bundles the renderer using Vite, while Electron main and preload scripts are built separately.

## How Auto-Updates Work

Your desktop app uses **electron-updater** with **GitHub Releases** as the update server:

1. **Automatic Checks**: The app checks for updates:
   - 3 seconds after app startup
   - Every 4 hours while running

2. **User Experience**:
   - When an update is available, users see a dialog asking if they want to download it
   - Download progress shows in the dock/taskbar
   - Once downloaded, users can install immediately or wait until next app quit
   - Updates install automatically on app quit

3. **Manual Check**: Users can manually check via **Help → Check for Updates**

## Creating a New Release

### Step 1: Update the Version

Edit `package.json` and bump the version:

```json
{
  "version": "0.2.0"  // Change from 0.1.0
}
```

**Version Scheme:**
- `0.1.0` → `0.1.1`: Bug fixes (patch)
- `0.1.0` → `0.2.0`: New features (minor)
- `0.1.0` → `1.0.0`: Major changes (major)

### Step 2: Commit Your Changes

```bash
git add .
git commit -m "Release v0.2.0: Description of changes"
```

### Step 3: Create and Push a Git Tag

The GitHub Actions workflow triggers on version tags (`v*.*.*`):

```bash
# Create a tag matching the package.json version
git tag v0.2.0

# Push the tag to GitHub
git push origin v0.2.0
```

### Step 4: Automated Build Process

Once you push the tag, GitHub Actions will automatically:

1. ✅ Build installers for macOS (DMG + ZIP)
2. ✅ Build installers for Windows (NSIS + Portable)
3. ✅ Create a GitHub Release with the tag
4. ✅ Upload all installers to the release
5. ✅ Publish the release (making it available for auto-updates)

**Build time:** Approximately 10-15 minutes

### Step 5: Monitor the Build

1. Go to your GitHub repository
2. Click **Actions** tab
3. Watch the "Build and Release" workflow
4. When complete, check **Releases** to see your new release

## First-Time Setup

Before you can use auto-updates, you need to:

### 1. Create the GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .
git commit -m "Initial commit"

# Create the repository on GitHub at:
# https://github.com/blakejoy/saccom-app

# Add remote and push
git remote add origin https://github.com/blakejoy/saccom-app.git
git branch -M main
git push -u origin main
```

### 2. Create Your First Release

```bash
# Create and push the first version tag
git tag v0.1.0
git push origin v0.1.0
```

This will trigger the GitHub Actions workflow and create your first release!

## Testing Auto-Updates Locally

To test the update mechanism:

1. Create a release with version `v0.1.1`
2. Install version `0.1.0` on your machine
3. Open the app - it should detect and offer the update to `0.1.1`

## Troubleshooting

### Build Fails
- Check the GitHub Actions logs for errors
- Ensure all dependencies are in `package.json`
- Verify `better-sqlite3` rebuilds correctly for Electron's Node version
- Check that TypeScript compiles without errors: `npx tsc --noEmit`
- Ensure Vite build succeeds: `npm run build`

### Updates Not Detected
- Verify the release is published (not draft) on GitHub
- Check that `package.json` repository URL matches GitHub repo
- Ensure the installed version is lower than the release version
- Check dev tools console for error messages (Help → Toggle Developer Tools)

### macOS Gatekeeper Issues
- Users may need to right-click → Open on first launch (unsigned apps)
- Consider getting an Apple Developer ID for smoother updates

### Windows SmartScreen Warnings
- Expected for unsigned apps
- Users click "More info" → "Run anyway"
- Consider getting a code signing certificate for production

## Update Strategy Best Practices

- 🚀 **Release often**: Small, frequent updates are better than large infrequent ones
- 📝 **Document changes**: Write clear release notes in the GitHub Release
- 🧪 **Test first**: Test locally before pushing tags
- 🔒 **Security updates**: Mark urgent security fixes in release notes
- 🎯 **Version carefully**: Follow semantic versioning (semver)

## Release Checklist

Before creating a release:

- [ ] Test the app thoroughly
- [ ] Update version in `package.json`
- [ ] Update CHANGELOG (if you have one)
- [ ] Commit all changes
- [ ] Create git tag (`v{version}`)
- [ ] Push tag to GitHub
- [ ] Monitor GitHub Actions build
- [ ] Test the release installers
- [ ] Add release notes on GitHub

---

**Your CI/CD is now fully automated!** 🎉

Every time you push a version tag, your app will automatically build and release to users worldwide.