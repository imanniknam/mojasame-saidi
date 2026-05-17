"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProductAction } from "@/lib/admin/products/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function AdminProductDeleteButton({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProductAction(productId);
      if (result.ok) {
        toast.success(result.message ?? "محصول غیرفعال شد.");
        setOpen(false);
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(result.message ?? "خطا در حذف محصول.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive" size="touch" className="gap-2">
          <Trash2 className="size-4" />
          غیرفعال‌سازی
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>غیرفعال‌سازی محصول</DialogTitle>
          <DialogDescription>
            آیا از غیرفعال کردن «{productTitle}» مطمئن هستید؟ محصول از فروشگاه پنهان می‌شود ولی در
            پایگاه‌داده باقی می‌ماند.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            انصراف
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={pending}>
            {pending ? "در حال انجام..." : "تأیید غیرفعال‌سازی"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
