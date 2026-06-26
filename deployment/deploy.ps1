param(
  [string]$Server = "31.70.86.73",
  [string]$User = $env:MTD_DEPLOY_USER,
  [string]$RemoteBase = "/var/www/mtd-control-livestream",
  [string]$HlsUrl = "/hls/live/stream/index.m3u8"
)

$ErrorActionPreference = "Stop"
if (-not $User) { throw "Set MTD_DEPLOY_USER or pass -User. No password is read from files." }

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archive = "dist-mtd-$stamp.tar.gz"

npm ci
$env:VITE_HLS_URL = $HlsUrl
npm run build

if (Test-Path $archive) { Remove-Item -LiteralPath $archive -Force }
tar -czf $archive -C dist .

ssh "$User@$Server" "mkdir -p '$RemoteBase/releases/$stamp' '$RemoteBase/backups'"
scp $archive "$User@$Server:$RemoteBase/releases/$stamp/dist.tar.gz"
scp deployment/server-deploy.sh "$User@$Server:$RemoteBase/server-deploy.sh"
ssh "$User@$Server" "chmod +x '$RemoteBase/server-deploy.sh' && '$RemoteBase/server-deploy.sh' '$RemoteBase' '$stamp'"
Remove-Item -LiteralPath $archive -Force
