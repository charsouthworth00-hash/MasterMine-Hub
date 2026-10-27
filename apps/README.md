# MasterMine standalone apps

Each app is self-contained in its own folder, with a static `index.html`:
- `docs/` — MasterMine Docs: Write, save and download documents.
- `slides/` — MasterMine Slides: Create slides and download a presentation outline.
- `sheets/` — MasterMine Sheets: Edit spreadsheet cells, use basic formulas and export CSV.
- `studio/` — MasterMine Studio: Draw pictures and download them as PNG files.
- `gx/` — MasterMine GX: Search the web and open useful websites.
- `drive/` — MasterMine Drive: Choose files from your device and view a local file list.
- `meet/` — MasterMine Meet: Prepare a meeting invitation draft.
- `chat/` — MasterMine Chat: Post messages to a message board saved in this browser.
- `mail/` — MasterMine Mail: Compose, save and download email drafts.

## Local testing

You can run the existing React starter versions from your Chromebook's `apps/<app>` folders with Vite. The repository copies in this folder are also standalone static HTML pages; they need no npm install and can be hosted independently.

## Cloudflare Pages

To create a separate Pages website for an app, connect this repository and set that app's root directory to `apps/<slug>` (for example, `apps/docs`). For these static pages, use no build command and set the output directory to the selected app folder / root (Cloudflare's Pages project configuration interface may label this as the root directory and output directory). Each Pages project needs to be created/configured separately.

## Feature limits

Docs, Slides, Sheets, Chat and Mail use browser-local storage. Slides exports a text outline rather than a PowerPoint file. Drive lists selected file metadata only and does not upload the files. Meet creates an invitation draft; it does not create a live video call or send invitations. GX opens external search and site links; it is not a full browser engine.
