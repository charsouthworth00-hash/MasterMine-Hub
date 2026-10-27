# MasterMine standalone Pages websites

Each app has a self-contained static `index.html`:
- `docs/`
- `slides/`
- `sheets/`
- `studio/`
- `gx/`
- `drive/`
- `meet/`
- `chat/`
- `mail/`

## Cloudflare Pages setup

Create one Pages project per app, connect this repository, and set the production branch to `main`. Set **Root directory** to `pages-apps/<app>`, leave the build command blank (no build step is needed), and set the output directory to the selected folder's root (usually `.`). Example: Docs uses `pages-apps/docs`. Each project gets its own `.pages.dev` hostname. A project has to be created/configured in Cloudflare before it has a public URL.

## Feature limits

Docs, Slides, Sheets, Chat and Mail save data in that browser. Slides exports a text outline, not a PowerPoint file. Drive lists selected file details but does not upload files. Meet makes an invitation draft but does not create a video call or send invitations. GX opens web searches and quick links rather than acting as a full browser engine.
