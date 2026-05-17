"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  initialOrderActionState,
  updateOrderNotesAction,
} from "@/lib/admin/orders/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export function AdminOrderNotesForm({
  orderId,
  notesAdmin,
  notesCustomer,
}: {
  orderId: string;
  notesAdmin: string | null;
  notesCustomer: string | null;
}) {
  const bound = updateOrderNotesAction.bind(null, orderId);
  const [state, formAction, pending] = useActionState(bound, initialOrderActionState);

  useEffect(() => {
    if (state.message) {
      if (state.ok) toast.success(state.message);
      else toast.error(state.message);
    }
  }, [state]);

  return (
    <Card elevated className="space-y-4 rounded-2xl p-5">
      <h2 className="text-base font-bold text-foreground">یادداشت‌ها</h2>

      {notesCustomer ? (
        <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
          <p className="text-xs font-semibold text-muted-foreground">یادداشت مشتری</p>
          <p className="mt-2 text-sm leading-7 text-foreground">{notesCustomer}</p>
        </div>
      ) : null}

      <form action={formAction} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="notesAdmin">یادداشت مدیر (داخلی)</Label>
          <Textarea
            id="notesAdmin"
            name="notesAdmin"
            defaultValue={notesAdmin ?? ""}
            rows={4}
            placeholder="یادداشت برای تیم — در فروشگاه نمایش داده نمی‌شود."
            disabled={pending}
          />
        </div>
        <Button type="submit" variant="outline" size="touch" disabled={pending}>
          {pending ? "در حال ذخیره..." : "ذخیره یادداشت"}
        </Button>
      </form>
    </Card>
  );
}
