# MasterMine Drive for the ChromeOS Files app

This folder contains a Manifest V3 ChromeOS file-system provider extension. When mounted, it adds a location named **MasterMine Drive** to the left side of the ChromeOS Files app.

## Current prototype behaviour

- Creates and reads directories and files.
- Supports reading, writing, truncating, moving, copying and deleting files.
- Keeps file contents in IndexedDB in the extension's local Chrome profile.
- Supports files with any name, including the five Master DOCX Group extensions: .masterdocx, .masterslides, .masternote, .mastersheet and .mastercanvas.

## Important limitation

This is a **local-only prototype**, not cloud storage. It does not sync with the MasterMine Drive web app or with another device. The current web app only tracks file details locally; a shared server/API is needed before the website and Files app can use the same files. The local file-store is separate from Downloads and separate from website localStorage.

## Install for testing on ChromeOS

1. In Chrome, open chrome://extensions.
2. Turn on Developer mode if your device allows it.
3. Select Load unpacked.
4. Choose this repository's chromeos-files-extension folder.
5. Click the MasterMine Drive extension icon and select Mount in Files.
6. Open the ChromeOS Files app. Select **MasterMine Drive** from the left sidebar.

The mounted location is a provider volume in the Files app, not a normal folder inside Downloads. ChromeOS remembers mounted file systems; use the extension popup to check the mount status.

If the device is managed by a school or organisation, extension installation may be restricted by its administrator.

## Development notes

- Uses ChromeOS-only chrome.fileSystemProvider API.
- IndexedDB gives the prototype persistent local storage, but it does not offer cloud backup.
- The prototype has a 128 MiB limit per file.
- This extension has not been published in the Chrome Web Store and must be tested on ChromeOS.
