# MTD Deployment

This folder contains production deployment helpers for the MTD Vite application. It intentionally contains no private keys, passwords, htpasswd files, certificates, or server-specific secrets.

## Local production build

```powershell
$env:VITE_HLS_URL = "/hls/live/stream/index.m3u8"
npm ci
npm run build
npm run test
npm run lint
```

Development fallback HLS URL is `http://31.70.86.73:8890/live/stream/index.m3u8`. Production should serve HLS through HTTPS at `/hls/live/stream/index.m3u8`, reverse-proxied to MediaMTX, normally `http://127.0.0.1:8890/live/stream/index.m3u8`.

## Nginx

Use `deployment/nginx/mtd.conf.template` as a template only. Before installing it, confirm the existing server names, SSL certificate paths, Basic Auth file, GeoIP/geoblocking rules, current webroot, and MediaMTX upstream. Preserve existing Basic Auth and GeoIP rules.

Minimum expected behavior:

- `/` serves the React SPA.
- `/admin` serves the React route and keeps existing server-side Basic Auth when present.
- `/hls/` reverse-proxies to MediaMTX with correct HLS MIME types.
- HTTP redirects to HTTPS.
- Static assets are cached safely.
- Internal source and config files are not exposed.

## Deploy script

`deployment/deploy.ps1` builds locally, archives `dist`, uploads only the built site and server helper, then calls `deployment/server-deploy.sh` remotely. Set the user explicitly:

```powershell
$env:MTD_DEPLOY_USER = "your-ssh-user"
.\deployment\deploy.ps1 -Server 31.70.86.73
```

The remote script backs up the current webroot, extracts the new release into a temporary directory, swaps it into place, runs `nginx -t`, reloads Nginx only after a successful config test, and prints rollback paths.

## Rollback

If a release fails after deployment, restore the timestamped backup under `$RemoteBase/backups/` or move the printed previous webroot path back into place, then run `nginx -t` and reload Nginx.

## Smoke tests

After deployment, verify:

- `https://<domain>/` returns the MTD public page.
- `https://<domain>/admin` returns the SPA route and is protected when Basic Auth exists.
- `https://<domain>/hls/live/stream/index.m3u8` is reachable or returns the expected offline state without mixed content.
- JS and CSS assets load without 404s.
- Existing GeoIP/geoblocking and Basic Auth rules remain active.
