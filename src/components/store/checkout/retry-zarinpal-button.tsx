"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type RetryZarinpalButtonProps = {
  orderNumber: string;
};

export function RetryZarinpalButton({ orderNumber }: RetryZarinpalButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleRetry() {
    setLoading(true);
    try {
      const response = await fetch("/api/payments/zarinpal/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        gatewayUrl?: string;
        error?: { message?: string };
      };

      if (!response.ok || !data.ok || !data.gatewayUrl) {
        toast.error(data.error?.message ?? "شروع پرداخت ناموفق بود.");
        return;
      }

      toast.message("در حال انتقال به زرین‌پال…");
      window.location.assign(data.gatewayUrl);
    } catch {
      toast.error("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="luxury"
      size="touch"
      disabled={loading}
      onClick={() => void handleRetry()}
    >
      {loading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
      پرداخت مجدد با زرین‌پال
    </Button>
  );
}
