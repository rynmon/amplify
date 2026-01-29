# Privacy Policy for Amplify – Tab Volume Control

**Last Updated:** January 28, 2026

## Introduction

Amplify – Tab Volume Control ("the Extension") is a browser extension that allows users to control and amplify audio volume on browser tabs. This privacy policy explains how the Extension handles user data and what permissions it requires.

## Data Collection and Usage

### We Do NOT Collect:
- **No personal information** - The Extension does not collect, store, or transmit any personal information, browsing history, or user data
- **No page content** - The Extension does not read, access, or transmit any content from web pages
- **No network requests** - The Extension does not make any network requests to external servers
- **No analytics** - The Extension does not use analytics, tracking, or telemetry services
- **No user identification** - The Extension does not identify or track users

### What We Store Locally:
The Extension uses Chrome's local storage API (`chrome.storage.local`) to store the following data **only on your device**:
- Volume settings per browser tab (stored locally in your browser)
- Theme preference (dark/light mode) - stored locally in your browser

**This data is:**
- Stored only on your local device
- Never transmitted to any external servers
- Never shared with third parties
- Deleted when you uninstall the Extension

## Permissions Explained

### 1. **tabs** Permission
**Purpose:** To identify which tabs are playing audio and communicate with content scripts to control volume.

**What it accesses:**
- Tab metadata (ID, title, audible status) to show which tabs are playing audio
- Ability to send messages to content scripts in tabs
- Ability to switch to tabs when requested by the user

**What it does NOT access:**
- Page content or URLs
- Browsing history
- User data

### 2. **storage** Permission
**Purpose:** To save your volume preferences locally on your device.

**What it stores:**
- Volume level per tab (0-600%)
- Theme preference (dark/light mode)

**Storage location:** Local browser storage only (never transmitted externally)

### 3. **host_permissions: "<all_urls>"** Permission
**Purpose:** To inject content scripts into web pages to control audio/video elements.

**What it does:**
- Injects a content script into web pages to access audio/video elements
- Modifies audio volume levels using the Web Audio API
- Works on any website where you want to control audio

**What it does NOT do:**
- Read or access page content
- Transmit page data anywhere
- Track your browsing
- Access your personal information

**Why all URLs:** Audio and video content can be found on any website. To provide universal volume control, the Extension must be able to work on any page. The Extension only modifies audio volume properties - it does not access or transmit any other page content.

## How the Extension Works

1. **Content Script Injection:** The Extension injects a content script into web pages to detect and control audio/video elements
2. **Volume Control:** Uses the Web Audio API to amplify audio volume up to 600%
3. **Local Storage:** Saves your volume preferences locally in your browser
4. **No External Communication:** All processing happens locally - no data leaves your device

## Third-Party Services

The Extension does not use any third-party services, analytics, or external APIs. All functionality is self-contained within the Extension.

## Data Security

- All data is stored locally on your device using Chrome's secure storage API
- No data is transmitted over the network
- No data is shared with third parties
- Data is automatically deleted when you uninstall the Extension

## Children's Privacy

The Extension does not knowingly collect any information from anyone, including children. Since we do not collect any data, the Extension is safe for users of all ages.

## Changes to This Privacy Policy

We may update this privacy policy from time to time. The "Last Updated" date at the top of this policy indicates when it was last revised. We encourage you to review this policy periodically.

## Your Rights

Since the Extension does not collect or transmit any personal data, there is no personal data to access, modify, or delete. All data stored locally can be cleared by:
- Uninstalling the Extension (removes all stored preferences)
- Clearing browser storage manually through Chrome settings

## Contact

If you have questions about this privacy policy or the Extension's data practices, please contact:
- **Email:** ryan@rynmon.ie
- **GitHub:** https://github.com/rynmon/amplify

## Summary

**In short:** Amplify – Tab Volume Control stores your volume preferences locally on your device and does not collect, transmit, or share any personal information or browsing data. All functionality operates entirely within your browser with no external communication.
