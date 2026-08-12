# انتقال دیتابیس از db.prisma.io به PostgreSQL روی همان VPS.
#
#   npm run db:migrate-to-vps
#
# چرا: سرور با P1001 به دیتابیس مدیریت‌شده نمی‌رسد و پنل ادمین با هر قطعی
# می‌افتد. روی لوکال‌هاست این مسیر شبکه حذف می‌شود.
#
# دیتابیس فعلی دست‌نخورده می‌ماند؛ برگشت فقط عوض‌کردن دوباره‌ی DATABASE_URL است.

param(
  [string]$Server = "root@185.239.0.11",
  [string]$AppDir = "/var/www/mojasame-saidi"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $RepoRoot

function Step($text) { Write-Host "`n==> $text" -ForegroundColor Cyan }
function Fail($text) { Write-Host "`nخطا: $text" -ForegroundColor Red; exit 1 }

$dump = Join-Path $env:LOCALAPPDATA "Temp\db-export.json"

# ── ۱. صادرات از دیتابیس فعلی، از این کامپیوتر ────────────────────────────
# صادرات اینجا انجام می‌شود نه روی سرور، چون همین دسترسیِ سرور است که
# ناپایدار است و اصلاً دلیل این انتقال.
Step "صادرات داده‌ها از دیتابیس فعلی"
node --env-file=.env.local scripts/db-export.mjs $dump
if ($LASTEXITCODE -ne 0) { Fail "صادرات ناموفق بود." }

# ── ۲. نصب Postgres و ساخت schema ────────────────────────────────────────
Step "نصب PostgreSQL روی سرور"
scp "scripts/db-export.mjs" "scripts/db-import.mjs" "${Server}:${AppDir}/scripts/"
scp "scripts/deploy/setup-postgres.sh" "${Server}:/root/setup-postgres.sh"
scp $dump "${Server}:/root/db-export.json"
if ($LASTEXITCODE -ne 0) { Fail "آپلود ناموفق بود." }

ssh $Server "bash /root/setup-postgres.sh"
if ($LASTEXITCODE -ne 0) { Fail "نصب PostgreSQL ناموفق بود." }

# ── ۳. واردکردن داده‌ها ───────────────────────────────────────────────────
Step "واردکردن داده‌ها به دیتابیس جدید"
ssh $Server "cd $AppDir && DATABASE_URL=`"`$(cat /root/mojasame-new-database-url.txt)`" CONFIRM=YES node scripts/db-import.mjs /root/db-export.json"
if ($LASTEXITCODE -ne 0) { Fail "واردکردن داده‌ها ناموفق بود. DATABASE_URL هنوز عوض نشده، پس سایت روی دیتابیس قبلی است." }

# ── ۴. سوییچ ─────────────────────────────────────────────────────────────
# آدرس قبلی در .env.bak-* می‌ماند تا برگشت یک دستور باشد.
Step "تغییر DATABASE_URL و ری‌استارت"
$switch = @'
set -e
NEW="$(cat /root/mojasame-new-database-url.txt)"
STAMP="$(date +%Y%m%d-%H%M%S)"
cd APPDIR
for f in .env .env.production; do
  [ -f "$f" ] || continue
  cp "$f" "$f.bak-$STAMP"
  grep -v '^DATABASE_URL=' "$f" > "$f.tmp"
  echo "DATABASE_URL=\"$NEW\"" >> "$f.tmp"
  mv "$f.tmp" "$f"
  chown app:app "$f"; chmod 600 "$f"
done
echo "    نسخه‌ی قبلی env: .env.bak-$STAMP"
su - app -c 'pm2 restart mojasame-saidi --update-env'
'@ -replace 'APPDIR', $AppDir

ssh $Server $switch
if ($LASTEXITCODE -ne 0) { Fail "تغییر تنظیمات ناموفق بود." }

# ── ۵. تأیید ─────────────────────────────────────────────────────────────
Step "بررسی"
Start-Sleep -Seconds 5
$okCount = 0
for ($i = 1; $i -le 6; $i++) {
  try {
    $t = Measure-Command { $r = Invoke-RestMethod -Uri "https://mojasamesaidi.ir/api/health/db" -TimeoutSec 25 }
    $ms = [math]::Round($t.TotalMilliseconds)
    Write-Host "    تلاش ${i}: ok=$($r.ok) connected=$($r.database.connected) migrations=$($r.database.appliedMigrations)  ${ms}ms"
    if ($r.ok) { $okCount++ }
  } catch {
    Write-Host "    تلاش ${i}: خطا — $_" -ForegroundColor Yellow
  }
}

Remove-Item $dump -Force -ErrorAction SilentlyContinue
ssh $Server "shred -u /root/db-export.json 2>/dev/null || rm -f /root/db-export.json"

if ($okCount -lt 6) {
  Write-Host "`n$okCount از ۶ بررسی موفق بود. برگشت به دیتابیس قبلی:" -ForegroundColor Yellow
  Write-Host "  ssh $Server `"cd $AppDir && cp .env.bak-* .env && su - app -c 'pm2 restart mojasame-saidi --update-env'`""
  exit 1
}

Write-Host "`nدیتابیس منتقل شد — هر ۶ بررسی موفق." -ForegroundColor Green
Write-Host "فایل صادرات از هر دو طرف پاک شد (داده‌ی شخصی داشت).`n"
