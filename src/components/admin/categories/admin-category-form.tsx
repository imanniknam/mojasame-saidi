"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCategoryAction,
  initialCategoryActionState,
  updateCategoryAction,
  type CategoryActionState,
} from "@/lib/admin/categories/actions";
import { suggestSlugFromTitle } from "@/lib/admin/products/slug";

export type AdminCategoryFormProps = {
  mode: "create" | "edit";
  category?: {
    id: string;
    slug: string;
    nameFa: string;
    sortOrder: number;
    isActive: boolean;
  };
  productCount?: number;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="gap-2">
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {label}
    </Button>
  );
}

export function AdminCategoryForm({
  mode,
  category,
  productCount = 0,
}: AdminCategoryFormProps) {
  const action =
    mode === "create"
      ? createCategoryAction
      : updateCategoryAction.bind(null, category!.id);

  const [state, formAction] = useActionState<CategoryActionState, FormData>(
    action,
    initialCategoryActionState,
  );

  const [nameFa, setNameFa] = useState(category?.nameFa ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  /** در حالت ساخت، اسلاگ خودکار از نام ساخته می‌شود تا وقتی کاربر دستی عوضش کند */
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const fieldError = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <p
          role={state.ok ? "status" : "alert"}
          aria-live="polite"
          className={
            state.ok
              ? "border border-emerald-600/40 bg-emerald-600/10 px-4 py-3 text-sm text-emerald-400"
              : "border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nameFa">
            نام دسته <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nameFa"
            name="nameFa"
            required
            value={nameFa}
            onChange={(e) => {
              setNameFa(e.target.value);
              if (!slugTouched) setSlug(suggestSlugFromTitle(e.target.value));
            }}
            aria-invalid={!!fieldError("nameFa")}
            aria-describedby={fieldError("nameFa") ? "nameFa-error" : undefined}
          />
          {fieldError("nameFa") ? (
            <p id="nameFa-error" className="text-xs text-destructive">
              {fieldError("nameFa")}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="slug">
            اسلاگ (آدرس) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="slug"
            name="slug"
            required
            dir="ltr"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="font-mono text-sm"
            aria-invalid={!!fieldError("slug")}
            aria-describedby="slug-hint"
          />
          <p id="slug-hint" className="text-xs text-muted-foreground">
            آدرس صفحه: <span dir="ltr">/categories/{slug || "…"}</span>
            {mode === "edit" ? " — تغییرش لینک‌های قبلی را می‌شکند." : ""}
          </p>
          {fieldError("slug") ? (
            <p className="text-xs text-destructive">{fieldError("slug")}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="sortOrder">ترتیب نمایش</Label>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={category?.sortOrder ?? 0}
            dir="ltr"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">عدد کوچک‌تر، بالاتر نمایش داده می‌شود.</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="isActive">وضعیت</Label>
          <div className="flex h-10 items-center gap-3">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              defaultChecked={category?.isActive ?? true}
              className="size-5 shrink-0 cursor-pointer accent-[hsl(var(--primary))]"
            />
            <span className="text-sm text-muted-foreground">
              دسته‌ی غیرفعال در فروشگاه دیده نمی‌شود
              {productCount > 0
                ? ` (${productCount.toLocaleString("fa-IR")} محصول دارد)`
                : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <SubmitButton label={mode === "create" ? "ایجاد دسته" : "ذخیره تغییرات"} />
        <Button variant="ghost" asChild>
          <Link href="/admin/categories">انصراف</Link>
        </Button>
      </div>
    </form>
  );
}
