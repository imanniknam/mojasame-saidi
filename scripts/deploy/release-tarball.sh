#!/usr/bin/env bash
# انتشار از روی بسته‌ی آپلودشده — بدون نیاز به GitHub روی سرور.
#
# اجرا به‌عنوان root، بعد از اینکه mojasame-deploy.tar.gz در /root/ قرار گرفت:
#   bash /root/release-tarball.sh
set -euo pipefail

APP_DIR="/var/www/mojasame-saidi"
APP_USER="app"
PM2_NAME="mojasame-saidi"
TARBALL="${1:-/root/mojasame-deploy.tar.gz}"
STAMP="$(date +%Y%m%d-%H%M%S)"

[ -f "$TARBALL" ] || { echo "خطا: بسته پیدا نشد: $TARBALL" >&2; exit 1; }
[ -f "$APP_DIR/.env.production" ] || { echo "خطا: .env.production نیست." >&2; exit 1; }
su - "$APP_USER" -c "pm2 describe $PM2_NAME" >/dev/null 2>&1 \
  || { echo "خطا: پروسه‌ی PM2 با نام $PM2_NAME پیدا نشد." >&2; exit 1; }

as_app() { su - "$APP_USER" -c "cd $APP_DIR && $1"; }

echo "==> بکاپ سبک (بدون node_modules و .next)"
BACKUP="$APP_DIR-rollback-$STAMP.tar.gz"
tar -czf "$BACKUP" -C "$APP_DIR" \
  --exclude=node_modules --exclude=.next --exclude=.git . 2>/dev/null || true
echo "    $BACKUP"

LOCK_BEFORE="$(md5sum "$APP_DIR/package-lock.json" 2>/dev/null | cut -d' ' -f1 || echo none)"
SCHEMA_BEFORE="$(md5sum "$APP_DIR/prisma/schema.prisma" 2>/dev/null | cut -d' ' -f1 || echo none)"

echo "==> باز کردن بسته"
# بسته فقط سورس دارد: node_modules، .next و فایل‌های env داخلش نیستند، پس
# آنچه روی سرور است دست‌نخورده می‌ماند.
tar -xzf "$TARBALL" -C "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

LOCK_AFTER="$(md5sum "$APP_DIR/package-lock.json" 2>/dev/null | cut -d' ' -f1 || echo none)"
SCHEMA_AFTER="$(md5sum "$APP_DIR/prisma/schema.prisma" 2>/dev/null | cut -d' ' -f1 || echo none)"

if [ "$LOCK_BEFORE" != "$LOCK_AFTER" ]; then
  echo "==> package-lock عوض شده — نصب وابستگی‌ها"
  as_app "npm ci"
else
  echo "==> وابستگی‌ها بدون تغییر — نصب رد شد"
fi

if [ "$SCHEMA_BEFORE" != "$SCHEMA_AFTER" ]; then
  echo "==> schema عوض شده — مهاجرت دیتابیس"
  as_app "npm run db:migrate:deploy"
else
  echo "==> schema بدون تغییر — مهاجرت رد شد"
fi

echo "==> بیلد (روی سرور، نه ویندوز — خروجی بیلد ویندوز روی لینوکس معتبر نیست)"
as_app "npm run build"

echo "==> ری‌استارت"
su - "$APP_USER" -c "pm2 restart $PM2_NAME --update-env"

echo "==> بررسی سلامت"
ok=0
for _ in $(seq 1 30); do
  if curl -fsS --max-time 3 http://127.0.0.1:3000/api/health >/dev/null 2>&1; then ok=1; break; fi
  sleep 2
done
if [ "$ok" -ne 1 ]; then
  echo "خطا: سرویس بالا نیامد. لاگ:" >&2
  su - "$APP_USER" -c "pm2 logs $PM2_NAME --lines 60 --nostream" >&2
  echo >&2
  echo "برگشت: tar -xzf $BACKUP -C $APP_DIR && cd $APP_DIR && npm run build && pm2 restart $PM2_NAME" >&2
  exit 1
fi

logout_code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 http://127.0.0.1:3000/logout)"
echo "    GET /logout = $logout_code (انتظار ۴۰۵)"
echo "    $(curl -s --max-time 5 http://127.0.0.1:3000/api/health)"
echo
echo "منتشر شد. بکاپ: $BACKUP"
