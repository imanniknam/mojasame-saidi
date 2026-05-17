# Production Setup Guide

This guide prepares the Persian RTL ecommerce project for production deployment on Vercel with PostgreSQL and Prisma.

## 1. Required Services

- Vercel project for the Next.js App Router application.
- PostgreSQL database with SSL and backups enabled.
- Production image storage if product uploads must persist outside Vercel deployments.
- Payment gateway account when online payments are enabled.
- Monitoring/logging provider such as Vercel Logs, Sentry, Axiom, or Datadog.

## 2. Environment Variables

Start from `.env.example` and configure variables in Vercel Project Settings.

Required production variables:

```bash
NEXT_PUBLIC_SITE_URL="https://mojasamesaidi.ir"
NEXT_PUBLIC_SITE_NAME="فروشگاه مجسمه‌سازی سعیدی"
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
AUTH_SECRET="strong-random-secret"
LOG_LEVEL="info"
```

Recommended generation for `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Important rules:

- `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secrets there.
- Keep database URLs, auth secrets, payment keys, and storage credentials server-only.
- Use separate values for Production, Preview, and Development.
- Rotate secrets after any accidental exposure.

## 3. Database Deployment

The Prisma datasource uses `DATABASE_URL`. For Vercel/serverless, use a pooled PostgreSQL connection string when the provider offers one.

Local validation:

```bash
npm run db:validate
npm run typecheck
```

Production migration command:

```bash
npm run db:migrate:deploy
```

Do not use `prisma db push` for production. It is useful for prototyping but does not provide audited migration history.

Recommended release flow:

1. Create and review migrations locally with `npm run db:migrate`.
2. Commit the generated `prisma/migrations` files.
3. Deploy application code.
4. Run `npm run db:migrate:deploy` during deployment or as a controlled release step.
5. Verify `/api/health` and check provider logs.

## 4. Vercel Deployment

1. Import the repository into Vercel.
2. Select the Next.js framework preset.
3. Set the build command:

```bash
npm run build
```

4. Add all production environment variables from `.env.example`.
5. Attach the domain `mojasamesaidi.ir`.
6. Configure `www.mojasamesaidi.ir` to redirect to the canonical domain.
7. Confirm HTTPS is active before accepting orders.

If migrations are run outside Vercel, execute them before or immediately after a release and keep deployment rollback notes for any schema changes.

## 5. Production Optimization

Already configured:

- `reactStrictMode` is enabled.
- `poweredByHeader` is disabled.
- `lucide-react` package imports are optimized.
- Product cards are mostly server-rendered with a small client action island.
- Product and category images use `next/image` where applicable.
- Product, category, and storefront metadata are server-generated.
- Storefront loading UI improves perceived speed.

Before launch:

- Replace placeholder SVG product images with compressed AVIF/WebP assets.
- Configure remote image hostnames in `next.config.ts`.
- Keep client components small and isolated.
- Avoid importing admin-only code into storefront routes.
- Run Lighthouse mobile against the production URL, not only localhost.

## 6. Secure API Configuration

API route rules:

- Return public-safe error messages only.
- Log private error details server-side with `logger`.
- Use `jsonNoStore` for health, admin, checkout, and payment endpoints.
- Validate request bodies with Zod before database writes.
- Require authentication and role checks for all admin mutations.
- Verify payment callbacks with the provider before changing order status.
- Add rate limiting before production login, checkout, and upload endpoints.

Helpers added:

- `src/lib/server/logger.ts` for structured server logs.
- `src/lib/server/api-response.ts` for no-store JSON responses and safe error responses.

## 7. Error Handling

Recommended pattern for route handlers:

```ts
import { apiErrorResponse, jsonNoStore } from "@/lib/server/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // validate, authorize, mutate
    return jsonNoStore({ ok: true });
  } catch (error) {
    return apiErrorResponse(error, {
      code: "CHECKOUT_FAILED",
      publicMessage: "ثبت سفارش با خطا روبه‌رو شد.",
    });
  }
}
```

User-facing pages should show Persian, actionable messages and avoid exposing stack traces or internal IDs unless they are intended support references.

## 8. Logging And Monitoring

Use structured logs in server code:

```ts
import { logger } from "@/lib/server/logger";

logger.info("order_created", { orderId, customerId });
logger.error("payment_callback_failed", { provider, orderId });
```

Recommended production monitoring:

- Vercel runtime logs for deployment and server errors.
- Sentry for exceptions and source maps.
- Vercel Analytics or another Web Vitals provider.
- Database provider metrics for connection count, query latency, and storage.

Never log:

- Passwords or password hashes.
- Full payment tokens.
- Full database connection strings.
- Private customer addresses beyond what is needed for debugging.

## 9. Security Best Practices

- Protect admin routes with server-side session checks and role checks.
- Store password hashes only, never plaintext passwords.
- Use strong admin passwords and rotate bootstrap credentials after launch.
- Keep dependencies updated and run `npm audit` as part of release review.
- Use least-privilege database users where the provider supports it.
- Use signed URLs or private buckets for admin uploads when moving beyond local files.
- Keep transactional pages noindexed.
- Enforce HTTPS through Vercel and HSTS.
- Add a Content Security Policy after finalizing all third-party scripts and gateways.

## 10. Release Commands

Local verification:

```bash
npm run verify
npm run build
```

Production migration:

```bash
npm run db:migrate:deploy
```

Production start for non-Vercel Node hosting:

```bash
npm run start
```
