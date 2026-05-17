import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = { searchParams: { token?: string } };

export const metadata: Metadata = {
  title: "پیگیری سفارش",
  description: "وضعیت سفارش شما",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderTrackPage({ searchParams }: Props) {
  const token = searchParams.token ?? "";

  return (
    <main className="ds-section mx-auto max-w-lg space-y-6 pb-28 text-center">
      <h1 className="ds-title">پیگیری سفارش</h1>
      {token ? (
        <p className="text-sm text-muted-foreground">
          توکن پیگیری:{" "}
          <span className="font-mono font-semibold text-foreground" dir="ltr">
            {token}
          </span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">توکن پیگیری ارسال نشده است.</p>
      )}
      <p className="ds-body text-pretty text-muted-foreground">
        این صفحه نمونه است؛ پس از اتصال به بک‌اند، وضعیت واقعی سفارش اینجا نمایش
        داده می‌شود.
      </p>
      <Button variant="luxury" asChild>
        <Link href="/">خانه</Link>
      </Button>
    </main>
  );
}
