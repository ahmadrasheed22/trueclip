# Trueclip

Trueclip helps creators discover trending short-form content for inspiration and manage their own video uploads to TikTok.

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
- `CLIP_BACKEND_FALLBACK_URLS` (optional, comma/space-separated fallback backend URLs)
- `CLIP_BACKEND_MAX_ATTEMPTS` (optional, default `3`)
- `NEXT_PUBLIC_CLIP_BACKEND_URL` (optional, public backend URL for direct clip downloads)

Optional yt-dlp authentication values (recommended when YouTube returns bot-check errors):

- `YTDLP_COOKIES_B64` (base64-encoded `cookies.txt` content)
- `YTDLP_COOKIES_FROM_BROWSER` (example: `chrome`, `edge`, or `firefox`)
- `YTDLP_COOKIES_FILE` (absolute path to a `cookies.txt` export)

Optional yt-dlp runtime value (recommended for newer YouTube extraction flows):

- `YTDLP_JS_RUNTIMES` (example: `node`)
- `YTDLP_EXTRACTOR_ARGS` (optional, example: `youtube:player_client=android,web`)

Also ensure your TikTok app has this redirect URI registered in TikTok Developer portal.

Notes:

- `TIKTOK_SCOPE` defaults to `user.info.basic` for Login Kit review.
- For posting, set `TIKTOK_SCOPE=user.info.basic,video.publish` and enable the Content Posting product in the TikTok Developer Portal.
- After adding `video.publish`, users must reconnect their TikTok account to refresh the session scope.
- Legacy callback path `/api/auth/tiktok/callback` is still supported and forwards to `/api/tiktok/callback`.
- Set only one of `YTDLP_COOKIES_FROM_BROWSER` or `YTDLP_COOKIES_FILE`.
- If multiple yt-dlp extractor settings are available, the backend will try broader YouTube client and format fallbacks before failing the request.
- Ensure your clip backend can run yt-dlp JavaScript extraction (for example with `--js-runtimes node`) or some videos will fail.

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
