"use client";

import { OrderStatus } from "@prisma/client";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  initialOrderActionState,
  updateOrderStatusAction,
} from "@/lib/admin/orders/actions";
import { orderStatusLabels, orderStatusBadgeVariant } from "@/lib/admin/labels";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const selectClass =
  "flex h-12 w-full min-h-touch rounded-lg border border-input bg-background px-3 text-base shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-11 md:text-sm";

export function AdminOrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const bound = updateOrderStatusAction.bind(null, orderId);
  const [state, formAction, pending] = useActionState(bound, initialOrderActionState);

  useEffect(() => {
    if (state.message) {
      if (state.ok) toast.success(state.message);
      else toast.error(state.message);
    }
  }, [state]);

  return (
    <Card elevated className="space-y-4 rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-foreground">وضعیت سفارش</h2>
        <Badge variant={orderStatusBadgeVariant[currentStatus]}>
          {orderStatusLabels[currentStatus]}
        </Badge>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">تغییر وضعیت</Label>
          <select
            id="status"
            name="status"
            defaultValue={currentStatus}
            className={selectClass}
            disabled={pending}
          >
            {Object.values(OrderStatus).map((s) => (
              <option key={s} value={s}>
                {orderStatusLabels[s]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="luxury" size="touch" disabled={pending} className="w-full sm:w-auto">
          {pending ? "در حال ذخیره..." : "ذخیره وضعیت"}
        </Button>
      </form>
    </Card>
  );
}
