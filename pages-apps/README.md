# MasterMine standalone pages

Each static app lives in its own source folder:

- `docs/`
- `slides/`
- `sheets/`
- `studio/`
- `gx/`
- `drive/`
- `meet/`
- `chat/`
- `mail/`

## Deployments

The main MasterMine HUB build copies these folders into the Vite `dist/` output automatically. After the connected Cloudflare Pages project successfully rebuilds, the apps will be available on that same `.pages.dev` hostname at:

- `/docs/`
- `/slides/`
- `/sheets/`
- `/studio/`
- `/gx/`
- `/drive/`
- `/meet/`
- `/chat/`
- `/mail/`

To give all nine apps separate `.pages.dev` hostnames, create a separate Pages project for each app. Cloudflare's monorepo documentation currently limits one Git repository to five Pages projects, so nine individual projects require a second repository or a Cloudflare limit increase. See https://developers.cloudflare.com/pages/configuration/monorepos/

## Feature limits

Docs, Slides, Sheets, Chat and Mail save data in that browser. Slides exports a text outline, not a PowerPoint file. Drive lists selected file details but does not upload files. Meet makes an invitation draft but does not create a video call or send invitations. GX opens web searches and quick links rather than acting as a full browser engine.
