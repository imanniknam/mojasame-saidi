import { NextResponse, type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/logout?next=/admin/login", request.url));
}

export function POST(request: NextRequest) {
  return NextResponse.redirect(new URL("/logout?next=/admin/login", request.url));
}
