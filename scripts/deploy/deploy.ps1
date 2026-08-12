# انتشار روی سرور تولید — از روی ویندوز.
#
#   npm run deploy                 انتشار عادی
#   npm run deploy -- -WithBackup  با بکاپ کامل پوشه روی سرور (کندتر)
#   npm run deploy -- -SkipChecks  بدون typecheck/lint محلی
#
# تنها چیزی که ممکن است بپرسد، رمز/passphrase خود SSH است که مستقیم به
# ssh می‌رود و اینجا ذخیره یا خوانده نمی‌شود.

param(
  [string]$Server = "root@185.239.0.11",
  [string]$Branch = "main",
  [switch]$WithBackup,
  [switch]$SkipChecks
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $RepoRoot

function Step($text) { Write-Host "`n==> $text" -ForegroundColor Cyan }
function Fail($text) { Write-Host "`nخطا: $text" -ForegroundColor Red; exit 1 }

# ── ۱. کار تمام‌نشده روی دیسک نباید بی‌صدا جا بماند ────────────────────────
Step "بررسی وضعیت git"
$dirty = git status --porcelain
if ($dirty) {
  Write-Host $dirty
  Fail "تغییرات کامیت‌نشده دارید. فقط چیزی که کامیت شده منتشر می‌شود، پس این‌ها جا می‌مانند.`n      اول کامیت کنید، بعد دوباره اجرا کنید."
}

$current = (git rev-parse --abbrev-ref HEAD).Trim()
if ($current -ne $Branch) {
  Fail "روی شاخه‌ی '$current' هستید ولی انتشار از '$Branch' انجام می‌شود."
}

# ── ۲. گیت‌های محلی — سریع‌تر از فهمیدن خطا بعد از ۳ دقیقه بیلد روی سرور ──
if (-not $SkipChecks) {
  Step "typecheck"
  npm run typecheck
  if ($LASTEXITCODE -ne 0) { Fail "typecheck رد شد. انتشار متوقف شد." }

  Step "lint"
  npm run lint
  if ($LASTEXITCODE -ne 0) { Fail "lint رد شد. انتشار متوقف شد." }
}

# ── ۳. سرور از origin می‌خواند، پس push شرط لازم است ──────────────────────
Step "push به GitHub"
git push origin $Branch
if ($LASTEXITCODE -ne 0) { Fail "push ناموفق بود." }

$sha = (git rev-parse --short HEAD).Trim()
$subject = (git log -1 --pretty=%s).Trim()
Write-Host "    $sha — $subject"

# ── ۴. انتشار روی سرور ────────────────────────────────────────────────────
# اسکریپت انتشار هر بار تازه از مخزن گرفته می‌شود تا اصلاحات خودش هم اعمال شود.
Step "انتشار روی $Server"
if ($WithBackup) { $skip = "0" } else { $skip = "1" }
$remote = "curl -fsSL https://raw.githubusercontent.com/imanniknam/mojasame-saidi/$Branch/scripts/deploy/release-pm2.sh -o /root/release.sh && SKIP_BACKUP=$skip bash /root/release.sh $Branch"

ssh $Server $remote
if ($LASTEXITCODE -ne 0) {
  Fail "انتشار روی سرور شکست خورد. خروجی بالا و دستور برگشت را ببینید."
}

# ── ۵. تأیید از بیرون، نه از روی حرفِ خودِ سرور ───────────────────────────
Step "بررسی سایت زنده"
try {
  $health = Invoke-RestMethod -Uri "https://mojasamesaidi.ir/api/health" -TimeoutSec 20
  Write-Host "    health: ok=$($health.ok) env=$($health.environment)"
} catch {
  Fail "سایت به /api/health پاسخ نداد: $_"
}

Write-Host "`nمنتشر شد: $sha" -ForegroundColor Green
Write-Host "https://mojasamesaidi.ir`n"
