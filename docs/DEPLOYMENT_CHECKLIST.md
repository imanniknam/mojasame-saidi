# Production Deployment Checklist

Use this checklist before every production release of MojasameSaidi.ir.

## 1. Environment

- [ ] `NEXT_PUBLIC_SITE_URL` is set to `https://mojasamesaidi.ir`.
- [ ] `DATABASE_URL` points to the production PostgreSQL database with SSL enabled.
- [ ] `AUTH_SECRET` is a strong random value and is different from staging/local.
- [ ] Admin bootstrap credentials are set only when needed, then rotated.
- [ ] Payment gateway variables are configured only for the enabled provider.
- [ ] Upload/storage variables are configured for production storage, not local disk.
- [ ] No `.env`, `.env.local`, secrets, private keys, or database dumps are committed.

## 2. Database

- [ ] Production database is created in the same region as the app when possible.
- [ ] Backups and point-in-time recovery are enabled by the provider.
- [ ] Connection pooling is enabled for serverless deployment.
- [ ] `npm run db:validate` passes.
- [ ] Migrations are reviewed before deploy.
- [ ] Production deploy runs `npm run db:migrate:deploy`.
- [ ] Seed scripts are not run on production unless intentionally bootstrapping safe data.

## 3. Build Verification

- [ ] `npm run verify` passes locally or in CI.
- [ ] `npm run build` passes.
- [ ] Critical storefront pages render:
  - [ ] `/`
  - [ ] `/products`
  - [ ] `/categories`
  - [ ] `/cart`
  - [ ] `/checkout`
  - [ ] `/api/health`
- [ ] No build logs expose secrets or connection strings.

## 4. Security

- [ ] Admin routes are protected by a server-side auth boundary before launch.
- [ ] All mutations validate input with a schema such as Zod.
- [ ] API routes return public-safe errors and log private details server-side only.
- [ ] Rate limiting is enabled for login, checkout, payment callbacks, and uploads.
- [ ] Uploads validate MIME type, extension, size, and image dimensions.
- [ ] Security headers are active:
  - [ ] HSTS
  - [ ] `X-Content-Type-Options`
  - [ ] `X-Frame-Options`
  - [ ] `Referrer-Policy`
  - [ ] `Permissions-Policy`
- [ ] Payment callbacks verify gateway signatures/status with the provider.
- [ ] Webhooks use idempotency keys or event IDs.

## 5. Performance

- [ ] Product grids use server-rendered cards with small client islands.
- [ ] `next/image` is used for product and category images.
- [ ] Remote image domains are explicitly allowed in `next.config.ts`.
- [ ] Homepage LCP image is optimized and sized correctly.
- [ ] JavaScript-heavy components are lazy loaded where possible.
- [ ] Lighthouse mobile score is checked on the production URL.
- [ ] Core Web Vitals are monitored after deploy.

## 6. SEO

- [ ] Canonical domain redirects to `https://mojasamesaidi.ir`.
- [ ] `sitemap.xml` is reachable.
- [ ] `robots.txt` is reachable.
- [ ] Product pages have product metadata and JSON-LD.
- [ ] Transactional/private pages are noindexed.
- [ ] OpenGraph image loads from a public HTTPS URL.

## 7. Vercel

- [ ] Project is connected to the production Git repository.
- [ ] Framework preset is Next.js.
- [ ] Environment variables are set for Production, Preview, and Development as needed.
- [ ] Production branch is selected.
- [ ] Build command is `npm run build`.
- [ ] Install command is the default npm install command unless CI requires otherwise.
- [ ] Domain `mojasamesaidi.ir` is attached.
- [ ] `www.mojasamesaidi.ir` redirects to the apex domain or the chosen canonical domain.

## 8. Post-Deploy Smoke Test

- [ ] Visit `/api/health` and confirm `ok: true`.
- [ ] Load homepage on mobile network throttling.
- [ ] Browse category and product detail pages.
- [ ] Add product to cart.
- [ ] Apply a discount code.
- [ ] Complete checkout up to the payment boundary.
- [ ] Confirm server logs have no unexpected errors.
- [ ] Confirm database has no failed migration or connection errors.
