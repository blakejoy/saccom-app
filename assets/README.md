# App Icons

This directory should contain the application icons for building the desktop app.

## Required Files

- `icon.icns` - macOS icon (512x512 or 1024x1024 PNG converted to ICNS)
- `icon.ico` - Windows icon (256x256 PNG converted to ICO)

## How to Create Icons

1. Create a 1024x1024 PNG image with your app logo
2. Use an online converter or tools like:
   - macOS: `iconutil` (built-in)
   - Cross-platform: https://cloudconvert.com/png-to-icns or png-to-ico
   - npm package: `electron-icon-builder`

## Quick Setup (Optional)

You can use a placeholder icon for now:

```bash
# Install electron-icon-builder
npm install --save-dev electron-icon-builder

# Create icons from a PNG (create a source.png first)
npx electron-icon-builder --input=./source.png --output=./assets
```

Note: The build will fail without these icon files. For development/testing, you can temporarily comment out the icon references in package.json's build configuration.