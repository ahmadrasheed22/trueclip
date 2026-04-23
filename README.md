# Trueclip

Trueclip is a Next.js App Router project for discovering YouTube Shorts and publishing generated short videos to TikTok.

## Features

- YouTube channel search and Shorts browsing.
- Favorites and recently viewed channel UX.
- TikTok OAuth login with secure server-side session handling.
- TikTok account display (username + avatar), logout, and direct post initialization via Content Posting API.
- Legal pages:
	- `/privacy`
	- `/terms`

## Environment Setup

Copy `.env.example` to `.env.local` and fill real values:

```bash
copy .env.example .env.local
```

Required TikTok values:

- `TIKTOK_CLIENT_KEY`
- `TIKTOK_CLIENT_SECRET`
- `TIKTOK_REDIRECT_URI` (example: `http://localhost:3000/api/tiktok/callback`)
- `TIKTOK_SESSION_SECRET`

Clip generation values:

- `CLIP_BACKEND_URL` (example: `http://127.0.0.1:8000`)

Optional yt-dlp authentication values (recommended when YouTube returns bot-check errors):

- `YTDLP_COOKIES_FROM_BROWSER` (example: `chrome`, `edge`, or `firefox`)
- `YTDLP_COOKIES_FILE` (absolute path to a `cookies.txt` export)

Also ensure your TikTok app has this redirect URI registered in TikTok Developer portal.

Notes:

- `TIKTOK_SCOPE` defaults to `user.info.basic` for Login Kit review.
- Add `video.publish` to `TIKTOK_SCOPE` only when Content Posting is enabled in TikTok Developer Portal.
- Legacy callback path `/api/auth/tiktok/callback` is still supported and forwards to `/api/tiktok/callback`.
- Set only one of `YTDLP_COOKIES_FROM_BROWSER` or `YTDLP_COOKIES_FILE`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## TikTok Integration Notes

- Login flow uses official TikTok Login Kit authorization URL.
- Access and refresh tokens are encrypted and stored in HTTP-only cookies.
- Posting uses TikTok Content Posting Direct Post initialization endpoint with `PULL_FROM_URL`.
- TikTok may require URL prefix ownership verification for `video_url` domains.
