# Setup Guide

## Private Repository with Auto-Updates

### ✅ Yes, Private Repos Work!

You have **two options** for auto-updates with a private repository:

### Option 1: Public Releases (Recommended)

Make releases public while keeping your source code private:

1. **Create your private repository** on GitHub
2. Go to **Settings → General** → Scroll to **Danger Zone**
3. Enable "**Allow public releases**"

**Advantages:**
- ✅ No configuration needed (already set up!)
- ✅ Users can download updates without authentication
- ✅ Source code stays private
- ✅ Simplest option

### Option 2: Fully Private Releases

For completely private releases (requires GitHub token):

1. **Create a Personal Access Token:**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name it "Student App Updates"
   - Select scope: `repo` (Full control of private repositories)
   - Copy the token

2. **Add token to your app:**
   - Open `electron/main.js`
   - Find the commented section around line 17
   - Uncomment and add your token:
   ```javascript
   autoUpdater.setFeedURL({
     provider: 'github',
     owner: 'blakejoy',
     repo: 'student-accomodation-tracker',
     private: true,
     token: 'ghp_your_token_here' // Your GitHub token
   });
   ```

**⚠️ Security Note:** Including the token in the app means anyone who decompiles your app can see it. For sensitive apps, use Option 1 (Public Releases) instead.

---

## Database Auto-Initialization

### ✅ Database is Already Set Up!

The database will **automatically initialize** when users install the app:

1. **On First Launch:**
   - App detects no database exists
   - Creates all tables (students, forms, accommodations, etc.)
   - Seeds 58 predefined accommodations
   - Ready to use!

2. **Database Location:**
   - **macOS:** `~/Library/Application Support/Student Accommodation Tracker/sqlite.db`
   - **Windows:** `%APPDATA%/Student Accommodation Tracker/sqlite.db`

3. **On App Updates:**
   - Database persists (never deleted)
   - Schema updates applied automatically via migrations
   - User data is safe!

### What's Gitignored:

✅ `*.db` files are gitignored (databases won't be committed)
✅ `/dist` folder is gitignored (build artifacts)
✅ **Migrations ARE committed** (`drizzle/` folder) - needed for app to work!

### Database Structure:

```
Student Accommodation Tracker.app
└── User Data Directory
    └── sqlite.db  ← Created automatically on first run
        ├── students table
        ├── accommodations table (pre-seeded)
        ├── forms table
        ├── templates table
        └── daily_tracking table
```

---

## Important Files That ARE Committed:

- ✅ `drizzle/` - Database migrations (required!)
- ✅ `assets/` - App icons
- ✅ `src/` - Source code
- ✅ `electron/` - Desktop app logic
- ✅ `.github/workflows/` - CI/CD pipeline

## Files That Are NOT Committed:

- ❌ `*.db` - Database files
- ❌ `/dist` - Build artifacts
- ❌ `/node_modules` - Dependencies
- ❌ `/.next` - Next.js build cache

---

## Quick Start Checklist:

### For Private Repo Setup:

- [ ] Create private GitHub repository
- [ ] Enable "Public Releases" (Settings → General → Danger Zone)
- [ ] Push your code
- [ ] Create first release tag (`git tag v0.1.0 && git push origin v0.1.0`)
- [ ] Done! Updates will work automatically

### For Testing Database:

- [ ] Delete any existing `sqlite.db` in project folder
- [ ] Run `npm run electron:dev`
- [ ] App should create fresh database
- [ ] Check console for "✓ Database initialized successfully"
- [ ] Browse to see 58 accommodations pre-loaded

---

## Next Steps:

1. **Commit the migrations:**
   ```bash
   git add drizzle/
   git commit -m "feat: Add database migrations"
   ```

2. **Push to GitHub:**
   ```bash
   git push
   ```

3. **Create first release:**
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

Your app will now:
- ✅ Auto-initialize database on first run
- ✅ Auto-update from GitHub Releases
- ✅ Work with private repository
- ✅ Persist user data across updates

**You're all set!** 🎉