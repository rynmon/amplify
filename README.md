# Amplify – Tab Volume Control

![Amplify Logo](icons/icon128.png)

A Firefox extension that lets you boost audio volume up to 600% on any tab.

## Features

- Volume Boost - Amplify audio up to 600% (6x normal volume)
- Fine Control - Slider with 10% increments
- Quick Presets - 0%, 50%, 100%, 200%, Max buttons
- Per-Tab Control - Each tab remembers its volume setting
- Audio Tab List - See and control all tabs playing audio

## Installation

### From Firefox Add-ons (Recommended)
*Coming soon*

### Manual Installation (Development)
1. Download or clone this repository
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from this folder

## Usage

1. Click the Amplify icon in your toolbar
2. Adjust the volume slider (0% to 600%)
3. Use preset buttons for quick adjustments
4. The "Tabs Playing Audio" section shows all tabs with audio

## How It Works

Amplify uses the Web Audio API to capture and amplify audio from media elements:
- 0-100%: Uses native HTML5 volume control
- 100-600%: Uses Web Audio API GainNode for amplification

## Building for Release

### Using web-ext (Recommended)
```bash
npm install -g web-ext
web-ext build
```

### Manual ZIP
Create a ZIP file containing:
- `manifest.json`
- `background.js`
- `content.js`
- `popup.html`
- `popup.css`
- `popup.js`
- `icons/` folder (icon16.png, icon48.png, icon128.png)

## Compatibility

- Firefox 91.0 and later
- Works on most websites including YouTube, Twitch, and more

## Known Limitations

- Some sites with complex audio processing may limit boost effectiveness
- Volume boost beyond 100% may cause distortion on already-loud audio

## License

MIT License - see [LICENSE](LICENSE) file
