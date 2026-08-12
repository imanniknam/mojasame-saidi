#!/usr/bin/env bash
# آماده‌سازی یک‌باره‌ی سرور برای mojasamesaidi.ir
# اجرا روی VPS به‌عنوان root:  bash provision.sh
set -euo pipefail

APP_USER="mojasame"
APP_DIR="/srv/mojasame"
UPLOADS_DIR="/var/lib/mojasame/uploads"
REPO="https://github.com/imanniknam/mojasame-saidi.git"
NODE_MAJOR="20"

echo "==> بسته‌های پایه"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git ca-certificates gnupg nginx ufw

echo "==> Node.js ${NODE_MAJOR} LTS"
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt "$NODE_MAJOR" ]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi
node -v && npm -v

echo "==> کاربر برنامه (بدون شل تعاملی)"
id -u "$APP_USER" >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin "$APP_USER"

echo "==> پوشه‌ها"
mkdir -p "$APP_DIR" "$UPLOADS_DIR/products"
chown -R "$APP_USER:$APP_USER" "$UPLOADS_DIR"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "==> کلون مخزن"
  git clone "$REPO" "$APP_DIR"
fi
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

# آپلودها بیرون از پوشه‌ی دیپلوی می‌مانند، وگرنه هر بیلد/چک‌اوت تصاویر
# محصولات را از بین می‌برد. next start پوشه‌ی public را از روی دیسک سرو
# می‌کند، پس symlink کار می‌کند.
echo "==> اتصال پوشه‌ی آپلود پایدار"
rm -rf "$APP_DIR/public/uploads"
ln -sfn "$UPLOADS_DIR" "$APP_DIR/public/uploads"
chown -h "$APP_USER:$APP_USER" "$APP_DIR/public/uploads"

echo "==> سرویس systemd"
install -m 644 "$APP_DIR/scripts/deploy/mojasame.service" /etc/systemd/system/mojasame.service
systemctl daemon-reload
systemctl enable mojasame

echo "==> nginx"
install -m 644 "$APP_DIR/scripts/deploy/nginx.conf" /etc/nginx/sites-available/mojasame
ln -sfn /etc/nginx/sites-available/mojasame /etc/nginx/sites-enabled/mojasame
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> فایروال"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

cat <<'DONE'

آماده شد. مرحله‌ی بعد:

  1) فایل env را بسازید:   /srv/mojasame/.env
     (نمونه: scripts/deploy/env.production.sample)
     chown mojasame:mojasame /srv/mojasame/.env && chmod 600 /srv/mojasame/.env

  2) اولین دیپلوی:          bash /srv/mojasame/scripts/deploy/deploy.sh

  3) بعد از اینکه DNS به این سرور اشاره کرد، گواهی TLS:
     apt-get install -y certbot python3-certbot-nginx
     certbot --nginx -d mojasamesaidi.ir -d www.mojasamesaidi.ir

DONE
