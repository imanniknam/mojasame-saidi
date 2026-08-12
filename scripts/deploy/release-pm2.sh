#!/usr/bin/env bash
# انتشار نسخه‌ی جدید روی سرور تولید فعلی (185.239.0.11).
#
# ساختار این سرور: برنامه در /var/www/mojasame-saidi زیر کاربر app اجرا
# می‌شود و PM2 آن را با نام mojasame-saidi بالا نگه می‌دارد؛ nginx روی
# 127.0.0.1:3000 پروکسی می‌کند و TLS با Certbot تنظیم شده.
#
# اجرا به‌عنوان root:
#   curl -fsSL https://raw.githubusercontent.com/imanniknam/mojasame-saidi/main/scripts/deploy/release-pm2.sh -o /root/release.sh && bash /root/release.sh
set -euo pipefail

APP_DIR="/var/www/mojasame-saidi"
APP_USER="app"
PM2_NAME="mojasame-saidi"
REPO="https://github.com/imanniknam/mojasame-saidi.git"
BRANCH="${1:-main}"
STAMP="$(date +%Y%m%d-%H%M%S)"

cd "$APP_DIR"

echo "==> پیش‌بررسی"
[ -f .env.production ] || { echo "خطا: .env.production نیست." >&2; exit 1; }
su - "$APP_USER" -c "pm2 describe $PM2_NAME" >/dev/null 2>&1 \
  || { echo "خطا: پروسه‌ی PM2 با نام $PM2_NAME پیدا نشد." >&2; exit 1; }

echo "==> کدام دامنه‌ی زرین‌پال از این سرور در دسترس است"
# اطلاعاتی: اگر هاستی که کد استفاده می‌کند از اینجا جواب ندهد، پرداخت
# می‌شکند. خروجی را نگه دارید.
for host in api.zarinpal.com payment.zarinpal.com; do
  printf '    %-24s ' "$host"
  curl -s -o /dev/null -w '%{http_code} in %{time_total}s\n' --max-time 15 \
    -X POST "https://$host/pg/v4/payment/request.json" \
    -H 'Content-Type: application/json' -d '{}' || echo "unreachable"
done

if [ "${SKIP_BACKUP:-0}" = "1" ]; then
  echo "==> بکاپ رد شد (SKIP_BACKUP=1)"
else
  echo "==> بکاپ کامل ($APP_DIR-rollback-$STAMP)"
  cp -a "$APP_DIR" "$APP_DIR-rollback-$STAMP"
fi

echo "==> اتصال پوشه به مخزن git"
# پوشه تا امروز چک‌اوت git نبود و فایل‌ها دستی کپی می‌شدند. بعد از این،
# هر انتشار فقط یک fetch/reset است. فایل‌های خارج از git — .env،
# .env.production، node_modules، .next و public/uploads — دست‌نخورده
# می‌مانند چون در .gitignore هستند.
#
# همه‌ی دستورهای git با کاربر app اجرا می‌شوند، نه root. اگر root آن‌ها را
# بزند، .git مالکش root می‌شود و git با «dubious ownership» کار را رد
# می‌کند — چون مالک پوشه‌ی کاری با کاربر جاری یکی نیست.
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
as_app() { su - "$APP_USER" -c "cd $APP_DIR && $1"; }

if [ ! -d .git ]; then
  as_app "git init -q"
  as_app "git remote add origin $REPO"
else
  as_app "git remote set-url origin $REPO"
fi
as_app "git fetch -q origin $BRANCH"
as_app "git reset -q --hard origin/$BRANCH"
echo "    نسخه: $(as_app 'git rev-parse --short HEAD') — $(as_app 'git log -1 --pretty=%s')"

echo "==> بیلد (چند دقیقه طول می‌کشد)"
# next build روی همان .next می‌نویسد که next start از آن سرو می‌کند، پس
# در این فاصله ممکن است چند درخواست خطا بگیرند. برای فروشگاهی در این
# اندازه پذیرفتنی است؛ در ساعت کم‌ترافیک اجرا کنید.
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
  echo "برگشت به نسخه‌ی قبلی:" >&2
  echo "  rm -rf $APP_DIR && mv $APP_DIR-rollback-$STAMP $APP_DIR && su - $APP_USER -c 'pm2 restart $PM2_NAME'" >&2
  exit 1
fi

echo
echo "==> تأیید رفع باگ‌ها"
logout_code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -X GET http://127.0.0.1:3000/logout)"
printf '    GET /logout  = %s  ' "$logout_code"
[ "$logout_code" = "405" ] && echo "✅ (prefetch دیگر سشن را پاک نمی‌کند)" \
                           || echo "❌ انتظار ۴۰۵ بود — کد جدید بالا نیامده"

echo "    /api/health  = $(curl -s --max-time 5 http://127.0.0.1:3000/api/health)"

cat <<DONE

انتشار تمام شد.
بکاپ نسخه‌ی قبلی: $APP_DIR-rollback-$STAMP
برگشت در صورت نیاز:
  rm -rf $APP_DIR && mv $APP_DIR-rollback-$STAMP $APP_DIR && su - $APP_USER -c 'pm2 restart $PM2_NAME'
DONE
