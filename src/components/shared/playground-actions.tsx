"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function PlaygroundActions() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button
        type="button"
        variant="luxury"
        size="touch"
        onClick={() => toast.success("محصول به سبد اضافه شد.", { duration: 3500 })}
      >
        اعلان موفق
      </Button>
      <Button
        type="button"
        variant="outline"
        size="touch"
        onClick={() =>
          toast.error("اتصال برقرار نشد. دوباره تلاش کنید.", { duration: 4000 })
        }
      >
        اعلان خطا
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="secondary" size="touch">
            پنجره نمونه
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>جزئیات سفارش</DialogTitle>
            <DialogDescription>
              این یک دیالوگ نمونه است. برای موبایل و دسکتاپ با فوکوس کیبورد قابل
              استفاده است.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="ghost" size="touch" type="button">
                بستن
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="luxury" size="touch" type="button">
                تأیید
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
