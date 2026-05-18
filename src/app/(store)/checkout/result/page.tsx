import Link from "next/link";
import { CheckCircle2, Home, PackageCheck, XCircle } from "lucide-react";
import { RetryZarinpalButton } from "@/components/store/checkout/retry-zarinpal-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "نتیجه پرداخت",
  description: "وضعیت پرداخت سفارش شما",
  path: "/checkout/result",
  noIndex: true,
});

type ResultPageProps = {
  searchParams: Promise<{
    outcome?: string;
    order?: string;
    ref?: string;
    reason?: string;
    token?: string;
  }>;
};

export default async function CheckoutResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const success = params.outcome === "success";
  const orderNumber = params.order;
  const refId = params.ref;
  const reason = params.reason;

  return (
    <main className="ds-section mx-auto max-w-lg space-y-6 pb-32 text-center">
      <Card elevated className="space-y-6 p-8">
        {success ? (
          <>
            <CheckCircle2 className="mx-auto size-16 text-emerald-500" strokeWidth={1.4} />
            <div className="space-y-2">
              <h1 className="ds-title text-2xl">پرداخت موفق بود</h1>
              <p className="ds-subtitle text-pretty">
                سفارش شما با موفقیت ثبت و پرداخت شد. به‌زودی برای هماهنگی ارسال با شما تماس می‌گیریم.
              </p>
            </div>
            {orderNumber ? (
              <p className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
                شماره سفارش:{" "}
                <span className="font-mono font-bold text-highlight" dir="ltr">
                  {orderNumber}
                </span>
              </p>
            ) : null}
            {refId ? (
              <p className="text-sm text-muted-foreground">
                کد پیگیری زرین‌پال:{" "}
                <span className="font-mono font-semibold text-foreground" dir="ltr">
                  {refId}
                </span>
              </p>
            ) : null}
          </>
        ) : (
          <>
            <XCircle className="mx-auto size-16 text-destructive" strokeWidth={1.4} />
            <div className="space-y-2">
              <h1 className="ds-title text-2xl">پرداخت انجام نشد</h1>
              <p className="ds-subtitle text-pretty">
                {reason === "CANCELLED"
                  ? "پرداخت توسط شما لغو شد یا از درگاه بازگشت داده شد."
                  : reason === "VERIFY_FAILED"
                    ? "تأیید پرداخت در زرین‌پال ناموفق بود. در صورت کسر وجه، با پشتیبانی تماس بگیرید."
                    : "خطایی در فرایند پرداخت رخ داد. می‌توانید دوباره تلاش کنید."}
              </p>
            </div>
            {orderNumber ? (
              <p className="text-sm text-muted-foreground">
                سفارش{" "}
                <span className="font-mono font-semibold" dir="ltr">
                  {orderNumber}
                </span>{" "}
                در انتظار پرداخت باقی مانده است.
              </p>
            ) : null}
          </>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="luxury" size="touch" asChild>
            <Link href="/">
              <Home className="size-5" aria-hidden />
              بازگشت به فروشگاه
            </Link>
          </Button>
          {!success && orderNumber ? <RetryZarinpalButton orderNumber={orderNumber} /> : null}
          {!success && !orderNumber ? (
            <Button variant="outline" size="touch" asChild>
              <Link href="/checkout">
                <PackageCheck className="size-5" aria-hidden />
                بازگشت به تسویه حساب
              </Link>
            </Button>
          ) : null}
        </div>
      </Card>
    </main>
  );
}
