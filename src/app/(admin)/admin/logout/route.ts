import { NextResponse, type NextRequest } from "next/server";

/**
 * فقط POST — مثل `/logout`، تا prefetchِ لینک منو باعث خروج ناخواسته نشود.
 * ۳۰۷ نگه داشته می‌شود تا متد POST تا `/logout` حفظ شود.
 */
export function POST(request: NextRequest) {
  return NextResponse.redirect(new URL("/logout?next=/admin/login", request.url), 307);
}
