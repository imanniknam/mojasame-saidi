# فروشگاه مجسمه‌سازی سعیدی

Premium Persian RTL ecommerce storefront for MojasameSaidi.ir, built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Prisma, and PostgreSQL.

The project is mobile-first, SEO-focused, and optimized for fast product discovery, cart, checkout, and future admin workflows.

## Tech Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS and shadcn/ui
- Prisma ORM and PostgreSQL
- Zustand for cart state
- Framer Motion only where interaction complexity justifies it
- Vercel-ready deployment

## Project Structure

```text
src/
  app/                 Next.js routes, layouts, metadata, sitemap, robots
  components/          UI, layout, storefront, admin, shared components
  hooks/               React hooks
  lib/                 formatting, SEO, storefront data, stores, server helpers
  server/              future server actions, queries, validation boundaries
prisma/
  schema.prisma        ecommerce database schema
  seed.ts              development seed data
docs/
  ARCHITECTURE.md
  ADMIN.md
  DEPLOYMENT_CHECKLIST.md
  PRODUCTION_SETUP.md
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create local env:

```bash
cp .env.example .env
```

Set at least:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mojasame_saidi?schema=public"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
AUTH_SECRET="replace-with-local-secret"
```

Prepare Prisma:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

```bash
npm run dev                 # local development
npm run build               # production build
npm run start               # start built app
npm run lint                # Next lint
npm run typecheck           # TypeScript check
npm run verify              # lint + typecheck + Prisma validation
npm run db:generate         # generate Prisma client
npm run db:validate         # validate Prisma schema
npm run db:migrate          # create local development migration
npm run db:migrate:deploy   # apply migrations in production
npm run db:push             # prototype schema sync only
npm run db:seed             # seed development data
npm run db:studio           # open Prisma Studio
```

## Environment Variables

Use `.env.example` as the source of truth.

Important production variables:

- `NEXT_PUBLIC_SITE_URL`: canonical site URL, e.g. `https://mojasamesaidi.ir`.
- `DATABASE_URL`: PostgreSQL connection string with SSL in production.
- `AUTH_SECRET`: strong server-only auth secret.
- `LOG_LEVEL`: `info` by default, `debug` only temporarily.
- Payment and storage variables: configure only when those integrations are enabled.

Never commit `.env`, `.env.local`, database URLs, private keys, payment secrets, or admin passwords.

## Production Deployment

Read these before launch:

- `docs/DEPLOYMENT_CHECKLIST.md`
- `docs/PRODUCTION_SETUP.md`

Recommended production flow:

```bash
npm run verify
npm run build
npm run db:migrate:deploy
```

For Vercel:

- Set framework preset to Next.js.
- Set build command to `npm run build`.
- Configure environment variables in Vercel Project Settings.
- Attach `mojasamesaidi.ir` and redirect the non-canonical domain.
- Use a pooled PostgreSQL URL when deploying to serverless.

## Security And Reliability

The project includes:

- Production security headers in `next.config.ts`.
- `poweredByHeader` disabled.
- Public-safe API response helpers in `src/lib/server/api-response.ts`.
- Structured server logging in `src/lib/server/logger.ts`.
- No-store response handling for health/API responses.
- SEO noindex configuration for transactional pages.

Before taking real orders:

- Add server-side admin authentication and role checks.
- Add rate limiting for login, checkout, payment callbacks, and uploads.
- Validate all API inputs with Zod.
- Verify payment callbacks with the gateway provider.
- Move production uploads to durable object storage.
- Enable monitoring and exception tracking.

## Performance Notes

The storefront is optimized for mobile users:

- Product grids use server-rendered cards with small client action islands.
- Non-critical UI is lazy loaded where useful.
- `next/image` is used with responsive image sizes.
- Metadata, sitemap, robots, and JSON-LD are generated server-side.
- Package imports for `lucide-react` are optimized.

Run Lighthouse against the deployed production URL to verify the 90+ mobile target.
# MojasameSaidi.ir — اسکلت معماری

فروشگاه مجسمه‌سازی سعیدی؛ Next.js App Router، TypeScript، Tailwind، shadcn/ui، Prisma، PostgreSQL، Framer Motion.

## شروع

1. متغیرهای محیطی را از `docs/env.sample.txt` کپی کنید (به `.env` محلی).
2. `npm install`
3. `npx prisma db push` (یا migrate)
4. `npm run dev`

## مستندات

- `docs/ARCHITECTURE.md` — تصمیمات معماری، قرارداد نام‌گذاری، API، ادمین، تصویر، state.

## وضعیت

**صفحات فروشگاه و ادمین هنوز پیاده‌سازی نشده‌اند** — فقط ساختار پوشه‌ها، Prisma، ابزارها و یک صفحه‌ی ریشه‌ی خنثی وجود دارد.
