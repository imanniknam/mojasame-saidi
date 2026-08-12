# انتشار با بسته — سورس را بسته‌بندی و با scp می‌فرستد، بدون نیاز به
# دسترسی سرور به GitHub.
#
#   npm run deploy:package
#   npm run deploy:package -- -SkipChecks
#
# عمداً `.next` را نمی‌فرستد: خروجی بیلد ویندوز روی لینوکس معتبر نیست
# (جداکننده‌ی مسیر و مسیرهای مطلق در منیفست‌های Next). بیلد روی سرور
# انجام می‌شود.

param(
  [string]$Server = "root@185.239.0.11",
  [switch]$SkipChecks
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $RepoRoot

function Step($text) { Write-Host "`n==> $text" -ForegroundColor Cyan }
function Fail($text) { Write-Host "`nخطا: $text" -ForegroundColor Red; exit 1 }

if (-not $SkipChecks) {
  Step "typecheck"
  npm run typecheck
  if ($LASTEXITCODE -ne 0) { Fail "typecheck رد شد." }

  Step "lint"
  npm run lint
  if ($LASTEXITCODE -ne 0) { Fail "lint رد شد." }
}

$tarball = Join-Path $env:LOCALAPPDATA "Temp\mojasame-deploy.tar.gz"
if (Test-Path $tarball) { Remove-Item $tarball -Force }

Step "ساخت بسته"
# node_modules و .next نمی‌روند چون وابسته به سکو هستند و روی سرور ساخته
# می‌شوند. فایل‌های env هم نمی‌روند تا تنظیمات تولید بازنویسی نشود.
tar --create --gzip --file="$tarball" `
  --exclude=node_modules `
  --exclude=.next `
  --exclude=.git `
  --exclude=.vercel `
  --exclude=backups `
  --exclude=.env `
  --exclude=.env.local `
  --exclude=.env.production `
  --exclude=tsconfig.tsbuildinfo `
  --exclude=public/uploads `
  .
if ($LASTEXITCODE -ne 0) { Fail "ساخت بسته ناموفق بود." }

$sizeMb = [math]::Round((Get-Item $tarball).Length / 1MB, 1)
Write-Host "    $tarball  ($sizeMb MB)"

Step "آپلود به $Server"
scp $tarball "${Server}:/root/mojasame-deploy.tar.gz"
if ($LASTEXITCODE -ne 0) { Fail "آپلود ناموفق بود." }

Step "آپلود اسکریپت انتشار"
# جداگانه فرستاده می‌شود تا به شکل مسیرها داخل tar وابسته نباشیم.
scp "scripts/deploy/release-tarball.sh" "${Server}:/root/release-tarball.sh"
if ($LASTEXITCODE -ne 0) { Fail "آپلود اسکریپت انتشار ناموفق بود." }

Step "انتشار روی سرور"
ssh $Server "bash /root/release-tarball.sh"
if ($LASTEXITCODE -ne 0) { Fail "انتشار روی سرور شکست خورد. خروجی بالا و دستور برگشت را ببینید." }

Step "بررسی سایت زنده"
try {
  $health = Invoke-RestMethod -Uri "https://mojasamesaidi.ir/api/health" -TimeoutSec 20
  Write-Host "    health: ok=$($health.ok) env=$($health.environment)"
} catch {
  Fail "سایت به /api/health پاسخ نداد: $_"
}

Write-Host "`nمنتشر شد." -ForegroundColor Green
Write-Host "https://mojasamesaidi.ir`n"
