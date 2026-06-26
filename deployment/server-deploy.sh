#!/usr/bin/env bash
set -euo pipefail

BASE="${1:?remote base path required}"
STAMP="${2:?release stamp required}"
WEBROOT="${MTD_WEBROOT:-/var/www/mtd}"
RELEASE="$BASE/releases/$STAMP"
BACKUP="$BASE/backups/webroot-$STAMP.tar.gz"

mkdir -p "$WEBROOT" "$BASE/backups"
if [ -d "$WEBROOT" ] && [ "$(find "$WEBROOT" -mindepth 1 -maxdepth 1 2>/dev/null | wc -l)" -gt 0 ]; then
  tar -czf "$BACKUP" -C "$WEBROOT" .
fi

tmp="$WEBROOT.__new__$STAMP"
rm -rf "$tmp"
mkdir -p "$tmp"
tar -xzf "$RELEASE/dist.tar.gz" -C "$tmp"

prev="$WEBROOT.__previous__$STAMP"
rm -rf "$prev"
if [ -d "$WEBROOT" ]; then mv "$WEBROOT" "$prev"; fi
mv "$tmp" "$WEBROOT"

if command -v nginx >/dev/null 2>&1; then
  nginx -t
  if command -v systemctl >/dev/null 2>&1; then
    systemctl reload nginx
  else
    nginx -s reload
  fi
fi

if command -v curl >/dev/null 2>&1; then
  curl -fsS "http://127.0.0.1/" >/dev/null || true
  curl -fsSI "http://127.0.0.1/hls/live/stream/index.m3u8" >/dev/null || true
fi

echo "MTD release $STAMP deployed to $WEBROOT"
echo "Rollback candidate: $BACKUP and $prev"
