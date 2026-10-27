# Local MasterMine app projects

Your Chromebook's setup script creates the editable React/Vite starter projects under `~/mastermine-hub/apps/<app>`. Those local project files are not replaced by these repository pages.

The independent static HTML pages intended for separate Cloudflare Pages projects are in `pages-apps/<app>/index.html`:
- `docs` — `pages-apps/docs/index.html`
- `slides` — `pages-apps/slides/index.html`
- `sheets` — `pages-apps/sheets/index.html`
- `studio` — `pages-apps/studio/index.html`
- `gx` — `pages-apps/gx/index.html`
- `drive` — `pages-apps/drive/index.html`
- `meet` — `pages-apps/meet/index.html`
- `chat` — `pages-apps/chat/index.html`
- `mail` — `pages-apps/mail/index.html`

Each page is self-contained and can be hosted as a static website. See `pages-apps/README.md` for Cloudflare Pages configuration.