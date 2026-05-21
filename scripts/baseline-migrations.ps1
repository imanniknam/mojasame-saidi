# One-time: mark existing migrations as applied when the DB was created with db push.
# Then runs migrate deploy for any pending migration (e.g. PasswordResetToken).
#
# Usage (from project root, with DATABASE_URL in .env):
#   .\scripts\baseline-migrations.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Marking baseline migrations as applied..."
npx prisma migrate resolve --applied "20260517190942_init"
npx prisma migrate resolve --applied "20260518120000_add_user_role"

Write-Host "Applying pending migrations..."
npx prisma migrate deploy

Write-Host "Done."
