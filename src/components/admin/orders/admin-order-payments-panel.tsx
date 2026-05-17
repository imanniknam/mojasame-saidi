"use client";

import { PaymentProvider, PaymentStatus } from "@prisma/client";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  initialOrderActionState,
  updatePaymentStatusAction,
} from "@/lib/admin/orders/actions";
import {
  paymentProviderLabels,
  paymentStatusBadgeVariant,
  paymentStatusLabels,
} from "@/lib/admin/labels";
import { formatPriceFa } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const selectClass =
  "flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export type PaymentRow = {
  id: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  amountMinor: number;
  externalRef: string | null;
  paidAt: Date | null;
  createdAt: Date;
};

function PaymentStatusEditor({
  orderId,
  payment,
}: {
  orderId: string;
  payment: PaymentRow;
}) {
  const bound = updatePaymentStatusAction.bind(null, orderId);
  const [state, formAction, pending] = useActionState(bound, initialOrderActionState);

  useEffect(() => {
    if (state.message) {
      if (state.ok) toast.success(state.message);
      else toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <input type="hidden" name="paymentId" value={payment.id} />
      <div className="min-w-0 flex-1 space-y-1">
        <Label htmlFor={`pay-status-${payment.id}`} className="text-xs">
          وضعیت
        </Label>
        <select
          id={`pay-status-${payment.id}`}
          name="status"
          defaultValue={payment.status}
          className={selectClass}
          disabled={pending}
        >
          {Object.values(PaymentStatus).map((s) => (
            <option key={s} value={s}>
              {paymentStatusLabels[s]}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" variant="outline" size="sm" disabled={pending} className="shrink-0">
        {pending ? "..." : "به‌روزرسانی"}
      </Button>
    </form>
  );
}

export function AdminOrderPaymentsPanel({
  orderId,
  payments,
}: {
  orderId: string;
  payments: PaymentRow[];
}) {
  if (payments.length === 0) {
    return (
      <Card elevated className="rounded-2xl p-5 text-sm text-muted-foreground">
        هنوز رکورد پرداختی برای این سفارش ثبت نشده است.
      </Card>
    );
  }

  return (
    <Card elevated className="space-y-4 rounded-2xl p-5">
      <h2 className="text-base font-bold text-foreground">پرداخت‌ها</h2>
      <ul className="space-y-4">
        {payments.map((payment) => (
          <li
            key={payment.id}
            className="space-y-3 rounded-xl border border-border/60 bg-muted/10 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">{formatPriceFa(payment.amountMinor)}</p>
                <p className="text-xs text-muted-foreground">
                  {paymentProviderLabels[payment.provider]}
                  {payment.externalRef ? ` · ${payment.externalRef}` : ""}
                </p>
              </div>
              <Badge variant={paymentStatusBadgeVariant[payment.status]}>
                {paymentStatusLabels[payment.status]}
              </Badge>
            </div>
            {payment.paidAt ? (
              <p className="text-xs text-muted-foreground">
                پرداخت:{" "}
                {new Intl.DateTimeFormat("fa-IR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(payment.paidAt)}
              </p>
            ) : null}
            <PaymentStatusEditor orderId={orderId} payment={payment} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
