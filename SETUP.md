# Setup Guide

## Tech Stack

This app uses a modern Electron + Vite architecture:

### Frontend (Renderer Process)
- **Vite** - Fast build tool and dev server (replaces Next.js)
- **React 19** - UI framework
- **React Router** - Client-side routing (HashRouter for Electron)
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

### Backend (Main Process)
- **Electron** - Desktop app framework
- **SQLite** (better-sqlite3) - Local database
- **Drizzle ORM** - Type-safe database queries
- **Electron IPC** - Communication between renderer and main process

### Key Differences from Next.js:
- ✅ **Faster dev server** - Vite HMR vs Next.js
- ✅ **Type-safe IPC** - Database runs in main process, not renderer
- ✅ **No Server Actions** - Direct IPC calls instead
- ✅ **HashRouter** - Required for Electron's file:// protocol
- ✅ **PDF Generation** - jsPDF + html2canvas instead of @react-pdf/renderer

### Development Commands
```bash
npm run dev          # Start Vite dev server with Electron
npm run build        # Build for production
npm run electron:build:mac  # Build macOS installer
npm run electron:build:win  # Build Windows installer
```

---

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
   - Open `electron/main.ts`
   - Find the commented section in the setupAutoUpdater function
   - Uncomment and add your token:
   ```typescript
   autoUpdater.setFeedURL({
     provider: 'github',
     owner: 'blakejoy',
     repo: 'saccom-app',
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
   - Seeds 55 predefined accommodations
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
- ❌ `/dist-electron` - Electron build artifacts (main & preload)
- ❌ `/dist-renderer` - Vite build artifacts (renderer)
- ❌ `/node_modules` - Dependencies

---

## Quick Start Checklist:

### For Private Repo Setup:

- [ ] Create private GitHub repository
- [ ] Enable "Public Releases" (Settings → General → Danger Zone)
- [ ] Push your code
- [ ] Create first release tag (`git tag v0.1.0 && git push origin v0.1.0`)
- [ ] Done! Updates will work automatically

### For Testing Database:

- [ ] Delete any existing `sqlite.db` in Application Support folder
- [ ] Run `npm run dev` to start the Vite dev server with Electron
- [ ] App should create fresh database automatically
- [ ] Check console for "✓ Database initialized successfully"
- [ ] Check console for "✓ Seeded 55 accommodations"
- [ ] Browse to see 55 accommodations pre-loaded in forms

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