# VPS Deploy Guide

## Current production layout — read this first

`mojasamesaidi.ir` already runs on the VPS at `185.239.0.11`. It is **not**
served by Vercel. The live setup is:

| Piece | Value |
| --- | --- |
| App directory | `/var/www/mojasame-saidi` (owner `app`) |
| Process manager | PM2 as user `app`, process name `mojasame-saidi` |
| Server | `next start` on `127.0.0.1:3000` |
| Proxy | nginx, TLS via Certbot |
| Env | `.env` and `.env.production` in the app directory |

To ship a new version, that is all you need:

```bash
ssh root@185.239.0.11 "curl -fsSL https://raw.githubusercontent.com/imanniknam/mojasame-saidi/main/scripts/deploy/release-pm2.sh -o /root/release.sh && bash /root/release.sh"
```

`release-pm2.sh` backs the directory up, syncs it to `origin/main`, builds,
restarts PM2, waits for `/api/health`, and prints the rollback command. On
failure it exits non-zero with the PM2 log attached.

> **Do not run `provision.sh` on this server.** It provisions a *fresh*
> machine: it rewrites `/etc/nginx/sites-enabled`, removes the default site,
> installs a competing systemd unit on port 3000, and clones into
> `/srv/mojasame`. On the live host that takes the store down. The rest of
> this document describes that from-scratch path for a new server.

---

## From-scratch setup (new server only)

Node + systemd + nginx on a plain Ubuntu VPS.

Everything below is driven by files in `scripts/deploy/`:

| File | Purpose |
| --- | --- |
| `provision.sh` | one-time server setup |
| `deploy.sh` | run for every release |
| `mojasame.service` | systemd unit |
| `nginx.conf` | reverse proxy |
| `env.production.sample` | template for `/srv/mojasame/.env` |

## 0. SSH key (do this first, from your own machine)

Password logins should not be used for deploys. Create a key and install it:

```bash
ssh-keygen -t ed25519 -C "mojasame-deploy"
```

```bash
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh root@185.239.0.11 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

Confirm it works without a password, then disable password auth in
`/etc/ssh/sshd_config` (`PasswordAuthentication no`) and
`systemctl restart ssh`.

## 1. Provision the server

```bash
ssh root@185.239.0.11 "apt-get update -y && apt-get install -y git && git clone https://github.com/imanniknam/mojasame-saidi.git /srv/mojasame && bash /srv/mojasame/scripts/deploy/provision.sh"
```

This installs Node 20, nginx, and ufw; creates the `mojasame` service user;
clones the repo to `/srv/mojasame`; points `public/uploads` at
`/var/lib/mojasame/uploads`; and installs the systemd unit and nginx site.

If the repository is private, add a deploy key to the server first and clone
over SSH instead of HTTPS.

## 2. Environment

Copy `scripts/deploy/env.production.sample` to `/srv/mojasame/.env` and fill
it in. Both Next.js and Prisma read `.env` from the working directory.

```bash
ssh root@185.239.0.11 "cp /srv/mojasame/scripts/deploy/env.production.sample /srv/mojasame/.env && chown mojasame:mojasame /srv/mojasame/.env && chmod 600 /srv/mojasame/.env && nano /srv/mojasame/.env"
```

Non-obvious values:

- `AUTH_SECRET` — generate with `openssl rand -base64 32`. It must differ
  from local and staging. Changing it later invalidates every session.
- `ZARINPAL_SANDBOX` must be `"false"`. ZarinPal retired
  `sandbox.zarinpal.com`; pointing at it means every payment hangs until the
  12s timeout and then fails.
- `ZARINPAL_GATEWAY_DOMAIN` — leave unset unless the subdomain is actually
  registered and CNAMEd with ZarinPal. An unregistered domain produces a 404
  on the payment page.
- `DATABASE_URL` — keeping the current managed Postgres means no data
  migration. See section 6 to move it onto this VPS later.

## 3. First release

```bash
ssh root@185.239.0.11 "bash /srv/mojasame/scripts/deploy/deploy.sh"
```

`deploy.sh` resets to `origin/main`, installs dependencies, applies
migrations with `db:migrate:deploy`, builds, restarts the service, and polls
`/api/health` for up to 60s. It exits non-zero and prints the journal if the
service does not come up, so a failed release is loud.

Verify over the raw IP before touching DNS:

```bash
curl -s http://185.239.0.11/api/health
```

## 4. Domain and TLS

Only after step 3 responds correctly, point DNS at the VPS:

- `A` record `mojasamesaidi.ir` → `185.239.0.11`
- `A` record `www` → `185.239.0.11`

Remove the Vercel records for the same names. Once DNS has propagated:

```bash
ssh root@185.239.0.11 "apt-get install -y certbot python3-certbot-nginx && certbot --nginx -d mojasamesaidi.ir -d www.mojasamesaidi.ir"
```

Certbot adds the `443` block and the HTTP→HTTPS redirect, and installs a
renewal timer.

`vercel.json` handles the `www` → apex redirect on Vercel only. On nginx,
add a redirect server block for `www.mojasamesaidi.ir` if you want the same
canonical behaviour.

## 5. Operating

```bash
systemctl status mojasame
journalctl -u mojasame -f
journalctl -u mojasame -n 200 --no-pager
systemctl restart mojasame
```

Release a new version (after pushing to `main`):

```bash
ssh root@185.239.0.11 "bash /srv/mojasame/scripts/deploy/deploy.sh"
```

Roll back to a known commit:

```bash
ssh root@185.239.0.11 "cd /srv/mojasame && git reset --hard <sha> && npm ci && npm run build && systemctl restart mojasame"
```

Note that a rollback does **not** revert database migrations. Review any
schema change before deploying it, and keep rollback notes.

## 6. Optional: move Postgres onto the VPS

Removes the managed-database dependency and the connection-pool pressure
that `src/lib/storefront/cached.ts` documents.

```bash
apt-get install -y postgresql
sudo -u postgres createuser --pwprompt mojasame
sudo -u postgres createdb --owner=mojasame mojasame
```

Dump from the current database and restore, with the app stopped so no
orders are written mid-dump:

```bash
systemctl stop mojasame
pg_dump "<current DATABASE_URL>" --no-owner --no-acl -Fc -f /root/mojasame.dump
pg_restore -d "postgresql://mojasame:PASS@127.0.0.1:5432/mojasame" --no-owner /root/mojasame.dump
```

Update `DATABASE_URL` in `/srv/mojasame/.env` (no `sslmode=require` for a
local socket), then `bash scripts/deploy/deploy.sh`.

Set up backups before taking real orders — a VPS Postgres has none by
default:

```bash
# /etc/cron.daily/mojasame-backup
pg_dump "postgresql://mojasame:PASS@127.0.0.1:5432/mojasame" -Fc \
  -f "/var/backups/mojasame-$(date +\%F).dump"
find /var/backups -name 'mojasame-*.dump' -mtime +14 -delete
```

Dumps contain customer emails, phone numbers and addresses. Keep them off
the repo and restrict them to root.

## 7. Post-deploy smoke test

Run through `docs/DEPLOYMENT_CHECKLIST.md` section 8, plus the paths that
recently changed:

- Log in, open the account menu, then click «حساب کاربری» — it must not
  bounce to the login page.
- Add a product to the cart, check out with card-to-card, confirm the order
  appears in `/admin/orders`.
- Check out with online payment and confirm the redirect reaches ZarinPal
  rather than a 404.
- Cancel at the gateway and confirm the cart is still intact on return.
