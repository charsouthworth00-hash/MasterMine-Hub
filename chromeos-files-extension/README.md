# MasterMine Drive for the ChromeOS Files app

**MasterMine Drive** adds a storage location named **MasterMine Drive** to the left sidebar of the ChromeOS Files app.

## Download the extension

**[Download MasterMine Drive for ChromeOS (ZIP)](https://github.com/charsouthworth00-hash/MasterMine-Hub/archive/refs/heads/main.zip)**

After downloading and extracting the ZIP:

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode**, if your device allows it.
3. Click **Load unpacked**.
4. Open the extracted `MasterMine-Hub-main` folder, then select the **`chromeos-files-extension`** folder (the one containing `manifest.json`).
5. Open the extension's popup and click **Mount in Files**.
6. Open the ChromeOS Files app and select **MasterMine Drive** from the left sidebar.

> **Chrome Web Store status:** MasterMine Drive is not published in the Chrome Web Store yet. For now, use the ZIP download and install it with **Load unpacked**. Publishing requires a Chrome Web Store developer account, a reviewed store listing, and submission/approval; adding a README link does not publish the extension automatically.

## Current prototype behaviour

- Creates and reads directories and files.
- Supports reading, writing, truncating, moving, copying and deleting files.
- Keeps file contents in IndexedDB in the extension's local Chrome profile.
- Supports files with any name, including the Master DOCX Group extensions: `.masterdocx`, `.masterslides`, `.masternote`, `.mastersheet` and `.mastercanvas`.

## Important limitation

This is a **local-only prototype**, not cloud storage. It does not sync with the MasterMine Drive website or another device. The local file store is separate from Downloads and from website localStorage. A shared backend/API is needed before the website and Files app can use the same files.

## Development notes

- Uses the ChromeOS-only `chrome.fileSystemProvider` API.
- IndexedDB provides persistent local storage but not cloud backup.
- The prototype has a 128 MiB limit per file.
- If the Chromebook is managed by a school or organisation, extension installation may be restricted by its administrator.
