#!/usr/bin/env bash
# انتشار یک نسخه‌ی جدید. اجرا روی VPS به‌عنوان root:
#   bash /srv/mojasame/scripts/deploy/deploy.sh [branch]
set -euo pipefail

APP_USER="mojasame"
APP_DIR="/srv/mojasame"
BRANCH="${1:-main}"

cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "خطا: $APP_DIR/.env وجود ندارد. از scripts/deploy/env.production.sample بسازید." >&2
  exit 1
fi

echo "==> دریافت کد ($BRANCH)"
git fetch --prune origin
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"
PREV_COMMIT="$(git rev-parse --short HEAD@{1} 2>/dev/null || echo '-')"
echo "    نسخه‌ی قبلی: $PREV_COMMIT  →  جدید: $(git rev-parse --short HEAD)"

# symlink آپلودها ممکن است با checkout عوض شده باشد
ln -sfn /var/lib/mojasame/uploads "$APP_DIR/public/uploads"

echo "==> نصب وابستگی‌ها"
# devDependencies لازم است: prisma CLI و کامپایلر برای بیلد استفاده می‌شوند.
npm ci

echo "==> مهاجرت دیتابیس"
npm run db:migrate:deploy

echo "==> بیلد"
npm run build

chown -R "$APP_USER:$APP_USER" "$APP_DIR"
chown -h "$APP_USER:$APP_USER" "$APP_DIR/public/uploads"

echo "==> ری‌استارت سرویس"
systemctl restart mojasame

echo "==> بررسی سلامت"
for i in $(seq 1 30); do
  if curl -fsS --max-time 3 http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
    echo "    سالم است."
    curl -s http://127.0.0.1:3000/api/health; echo
    exit 0
  fi
  sleep 2
done

echo "خطا: سرویس بعد از ۶۰ ثانیه پاسخ نداد. لاگ:" >&2
journalctl -u mojasame -n 50 --no-pager >&2
exit 1
