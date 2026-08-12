#!/usr/bin/env bash
# نصب PostgreSQL روی همین VPS و آماده‌سازی دیتابیس برنامه.
#
# چرا: دیتابیس مدیریت‌شده‌ی فعلی از این سرور با P1001 قطع می‌شود
# («Can't reach database server at db.prisma.io:5432») و پنل ادمین با هر
# قطعی می‌افتد. روی لوکال‌هاست این مسیر شبکه کلاً حذف می‌شود.
#
# اجرا به‌عنوان root:  bash setup-postgres.sh
set -euo pipefail

DB_NAME="mojasame"
DB_USER="mojasame"
APP_DIR="/var/www/mojasame-saidi"
BACKUP_DIR="/var/backups/mojasame"

echo "==> نصب PostgreSQL"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y postgresql postgresql-contrib
systemctl enable --now postgresql

echo "==> ساخت کاربر و دیتابیس"
# رمز تصادفی؛ نه در تاریخچه‌ی شل می‌ماند نه جایی چاپ می‌شود جز فایل env.
DB_PASS="$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)"

if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  echo "    کاربر از قبل هست — فقط رمز به‌روز می‌شود"
  sudo -u postgres psql -c "ALTER ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASS';" >/dev/null
else
  sudo -u postgres psql -c "CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASS';" >/dev/null
fi

if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
  echo "    دیتابیس از قبل هست"
else
  sudo -u postgres createdb --owner="$DB_USER" "$DB_NAME"
fi

# Prisma برای migrate به ساخت schema نیاز دارد.
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;" >/dev/null

NEW_URL="postgresql://$DB_USER:$DB_PASS@127.0.0.1:5432/$DB_NAME?schema=public"

echo "==> بکاپ روزانه"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
cat > /etc/cron.daily/mojasame-backup <<CRON
#!/bin/sh
# دامپ‌ها شامل ایمیل، تلفن و آدرس مشتری‌اند — فقط root بخواند.
sudo -u postgres pg_dump -Fc "$DB_NAME" -f "$BACKUP_DIR/mojasame-\$(date +%F).dump" 2>/dev/null
chmod 600 "$BACKUP_DIR"/*.dump 2>/dev/null
find "$BACKUP_DIR" -name 'mojasame-*.dump' -mtime +14 -delete
CRON
chmod +x /etc/cron.daily/mojasame-backup
echo "    /etc/cron.daily/mojasame-backup — نگهداری ۱۴ روز"

echo "==> ساخت schema روی دیتابیس جدید"
# آدرس جدید موقتاً فقط به همین دستور داده می‌شود؛ .env هنوز دست‌نخورده است
# تا اگر چیزی خراب شد، برنامه روی دیتابیس قبلی بماند.
su - "$(stat -c '%U' "$APP_DIR")" -c "cd $APP_DIR && DATABASE_URL='$NEW_URL' npx prisma migrate deploy"

echo "$NEW_URL" > /root/mojasame-new-database-url.txt
chmod 600 /root/mojasame-new-database-url.txt

cat <<DONE

PostgreSQL آماده است.

آدرس اتصال جدید در: /root/mojasame-new-database-url.txt  (فقط root)

مرحله‌ی بعد — واردکردن داده‌ها و سوییچ:
  DATABASE_URL="\$(cat /root/mojasame-new-database-url.txt)" CONFIRM=YES \\
    node $APP_DIR/scripts/db-import.mjs /root/db-export.json

سپس DATABASE_URL را در $APP_DIR/.env و .env.production عوض کنید و:
  su - app -c 'pm2 restart mojasame-saidi --update-env'
DONE
