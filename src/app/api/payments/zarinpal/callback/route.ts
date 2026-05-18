import { NextResponse } from "next/server";
import { completeZarinpalCallback } from "@/lib/payments/zarinpal/service";
import { absoluteUrl } from "@/lib/seo/metadata";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authority = searchParams.get("Authority") ?? searchParams.get("authority") ?? "";
  const status = searchParams.get("Status") ?? searchParams.get("status") ?? "NOK";

  if (!authority) {
    return NextResponse.redirect(
      absoluteUrl("/checkout/result?outcome=error&reason=missing_authority"),
    );
  }

  try {
    const result = await completeZarinpalCallback({ authority, status });

    if (result.ok) {
      const params = new URLSearchParams({
        outcome: "success",
        order: result.orderNumber,
      });
      if (result.refId) params.set("ref", result.refId);
      if (result.trackingToken) params.set("token", result.trackingToken);
      return NextResponse.redirect(absoluteUrl(`/checkout/result?${params.toString()}`));
    }

    const params = new URLSearchParams({
      outcome: "failed",
      reason: result.reason,
    });
    if (result.orderNumber) params.set("order", result.orderNumber);
    return NextResponse.redirect(absoluteUrl(`/checkout/result?${params.toString()}`));
  } catch {
    return NextResponse.redirect(absoluteUrl("/checkout/result?outcome=error&reason=verify_error"));
  }
}
