# Amplify – Tab Volume Control

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.1.0-green.svg)
![Firefox](https://img.shields.io/badge/Firefox-142.0+-orange.svg)
![Chrome](https://img.shields.io/badge/Chrome-MV3-blue.svg)

A browser extension that lets you boost audio volume up to 600% on any tab. Available for both Firefox and Chromium-based browsers (Chrome, Edge, Brave, etc.).

## Features

- Volume Boost - Amplify audio up to 600% (6x normal volume)
- Fine Control - Slider with 10% increments
- Quick Presets - 0%, 50%, 100%, 200%, Max buttons
- Per-Tab Control - Each tab remembers its volume setting
- Audio Tab List - See and control all tabs playing audio
- Cross-Browser - Works on Firefox and Chromium-based browsers

## Project Structure

The project is organized to support both Firefox and Chromium browsers:

```
amplify/
├── .gitignore
├── LICENSE
├── README.md
└── src/
    ├── shared/              # Shared files (popup UI, icons, CSS)
    │   ├── popup.html
    │   ├── popup.css
    │   ├── popup.js
    │   └── icons/
    │       ├── icon16.png
    │       ├── icon32.png
    │       ├── icon48.png
    │       ├── icon64.png
    │       └── icon128.png
    ├── firefox/             # Firefox-specific files (MV2)
    │   ├── manifest.json
    │   ├── background.js
    │   └── content.js
    └── chromium/            # Chromium-specific files (MV3)
        ├── manifest.json
        ├── service-worker.js
        ├── content.js
        └── page-context.js
```

## Installation

### Firefox

#### From Firefox Add-ons (Recommended)
https://addons.mozilla.org/en-GB/firefox/addon/amplify-tab-volume-control/

#### Manual Installation (Development)
1. Download or clone this repository
2. Run the setup script: `.\setup-dev-firefox.ps1` (or manually copy shared files)
3. Open Firefox and go to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on"
5. Select the `dev/firefox/manifest.json` file

### Chromium (Chrome, Edge, Brave, etc.)

#### Manual Installation (Development)
1. Download or clone this repository
2. Run the setup script: `.\setup-dev-chromium.ps1` (or manually copy shared files)
3. Open Chrome/Edge and go to `chrome://extensions/` (or `edge://extensions/`)
4. Enable "Developer mode" (toggle in top right)
5. Click "Load unpacked"
6. Select the `dev/chromium/` folder

## Usage

1. Click the Amplify icon in your toolbar
2. Adjust the volume slider (0% to 600%)
3. Use preset buttons for quick adjustments
4. The "Tabs Playing Audio" section shows all tabs with audio

## How It Works

Amplify uses the Web Audio API to capture and amplify audio from media elements:
- **0-100%**: Uses native HTML5 volume control
- **100-600%**: Uses Web Audio API GainNode for amplification

### Browser-Specific Implementation

- **Firefox**: Uses `wrappedJSObject` to access the page's AudioContext directly from content scripts
- **Chromium**: Injects a script into the page context to access the page's AudioContext (required due to isolated world restrictions)

## Building for Release

### Firefox

#### Using Build Script (Recommended)
```powershell
.\build-firefox.ps1
```

This will:
- Copy Firefox-specific files and shared files into `dist/firefox/`
- Update manifest.json paths
- Create `dist/amplify-firefox.zip`

#### Using web-ext
```bash
# First run setup script, then:
cd dev/firefox
npm install -g web-ext
web-ext build --source-dir=. --artifacts-dir=../../dist/firefox
```

### Chromium

#### Using Build Script (Recommended)
```powershell
.\build-chromium.ps1
```

This will:
- Copy Chromium-specific files and shared files into `dist/chromium/`
- Update manifest.json paths
- Create `dist/amplify-chromium.zip`

#### Manual ZIP
After running the build script, the `dist/chromium/` folder contains everything needed for submission to Chrome Web Store.

## Compatibility

- **Firefox**: 142.0 and later (MV2)
- **Chromium**: Chrome 88+, Edge 88+, Brave, and other Chromium-based browsers (MV3)
- Works on most websites including YouTube, Twitch, and more

## Development

### Working on Firefox Version
1. Run `.\setup-dev-firefox.ps1` to set up the development environment
2. Edit files in `src/firefox/` and `src/shared/`
3. After editing shared files, re-run the setup script to copy changes
4. Test by loading `dev/firefox/manifest.json` as a temporary add-on in Firefox

### Working on Chromium Version
1. Run `.\setup-dev-chromium.ps1` to set up the development environment
2. Edit files in `src/chromium/` and `src/shared/`
3. After editing shared files, re-run the setup script to copy changes
4. Test by loading the `dev/chromium/` folder as an unpacked extension

### Shared Code
- UI files (`popup.html`, `popup.css`, `popup.js`) are shared between both versions
- Icons are shared between both versions
- Both versions use the same popup interface and user experience
- **Note**: When editing shared files, remember to re-run the setup script to copy changes to the dev directory

## Known Limitations

- Some sites with complex audio processing may limit boost effectiveness
- Volume boost beyond 100% may cause distortion on already-loud audio
- Chromium version requires page context injection, which may be blocked by some strict Content Security Policies

## License

MIT License - see [LICENSE](LICENSE) file
