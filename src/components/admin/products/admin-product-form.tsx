"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Plus, Trash2, Wand2 } from "lucide-react";
import {
  AdminProductImagesField,
  type ProductImageFieldValue,
} from "@/components/admin/products/admin-product-images-field";
import { AdminProductDeleteButton } from "@/components/admin/products/admin-product-delete-button";
import {
  createProductAction,
  initialProductActionState,
  updateProductAction,
} from "@/lib/admin/products/actions";
import { suggestSlugFromTitle } from "@/lib/admin/products/slug";
import type { ProductActionState } from "@/lib/admin/products/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type CategoryOption = { id: string; nameFa: string; slug: string };

export type ProductVariantFormValue = {
  id?: string;
  nameFa: string;
  sku: string;
  priceMinor: number;
  compareAtMinor: number | null;
  isActive: boolean;
  sortOrder: number;
};

export type ProductFormValues = {
  id?: string;
  slug: string;
  sku: string;
  titleFa: string;
  descriptionFa: string;
  priceMinor: number;
  compareAtMinor: number | null;
  weightGrams: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  metaTitleFa: string;
  metaDescFa: string;
  categoryId: string;
  inventory: {
    quantityOnHand: number;
    quantityReserved: number;
    lowStockThreshold: number;
  };
  images: ProductImageFieldValue[];
  variants: ProductVariantFormValue[];
};

type AdminProductFormProps = {
  mode: "create" | "edit";
  categories: CategoryOption[];
  initial: ProductFormValues;
};

const selectClass =
  "flex h-12 w-full min-h-touch rounded-lg border border-input bg-background px-3 text-base text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-11 md:text-sm";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function CheckboxField({
  id,
  name,
  label,
  defaultChecked,
}: {
  id: string;
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-touch cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-card/30 px-4 py-3 text-sm"
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        value="on"
        className="size-4 rounded border-input accent-highlight"
      />
      <span>{label}</span>
    </label>
  );
}

export function AdminProductForm({ mode, categories, initial }: AdminProductFormProps) {
  const boundUpdate = initial.id
    ? updateProductAction.bind(null, initial.id)
    : null;

  const [state, formAction, pending] = useActionState<ProductActionState, FormData>(
    mode === "create" ? createProductAction : boundUpdate!,
    initialProductActionState,
  );

  const [slug, setSlug] = useState(initial.slug);
  const [titleFa, setTitleFa] = useState(initial.titleFa);
  const [images, setImages] = useState<ProductImageFieldValue[]>(initial.images);
  const [variants, setVariants] = useState<ProductVariantFormValue[]>(initial.variants);

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { nameFa: "", sku: "", priceMinor: 0, compareAtMinor: null, isActive: true, sortOrder: prev.length },
    ]);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariant<K extends keyof ProductVariantFormValue>(
    index: number,
    key: K,
    value: ProductVariantFormValue[K],
  ) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [key]: value } : v)),
    );
  }

  useEffect(() => {
    if (state.message && state.ok && mode === "edit") {
      toast.success(state.message);
    }
    if (state.message && !state.ok) {
      toast.error(state.message);
    }
  }, [state, mode]);

  const fieldError = (key: string) => state.fieldErrors?.[key]?.[0];

  function suggestSlug() {
    const next = suggestSlugFromTitle(titleFa);
    if (next) setSlug(next);
  }

  return (
    <form action={formAction} className="mx-auto max-w-4xl space-y-6">
      <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />
      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />

      {state.fieldErrors?._form ? (
        <Card className="border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {state.fieldErrors._form.join(" ")}
        </Card>
      ) : null}

      <Card elevated className="space-y-5 rounded-2xl p-5 sm:p-6">
        <h2 className="text-base font-bold text-foreground">اطلاعات اصلی</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="titleFa">عنوان فارسی *</Label>
            <Input
              id="titleFa"
              name="titleFa"
              required
              value={titleFa}
              onChange={(e) => setTitleFa(e.target.value)}
            />
            <FieldError message={fieldError("titleFa")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">اسلاگ (لاتین) *</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                name="slug"
                required
                dir="ltr"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="font-mono"
              />
              <Button type="button" variant="outline" size="icon" onClick={suggestSlug} title="پیشنهاد از عنوان">
                <Wand2 className="size-4" />
              </Button>
            </div>
            <FieldError message={fieldError("slug")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" dir="ltr" defaultValue={initial.sku} />
            <FieldError message={fieldError("sku")} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="categoryId">دسته‌بندی *</Label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={initial.categoryId}
              className={selectClass}
            >
              <option value="" disabled>
                انتخاب دسته
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameFa}
                </option>
              ))}
            </select>
            <FieldError message={fieldError("categoryId")} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="descriptionFa">توضیحات</Label>
            <Textarea id="descriptionFa" name="descriptionFa" defaultValue={initial.descriptionFa} rows={5} />
            <FieldError message={fieldError("descriptionFa")} />
          </div>
        </div>
      </Card>

      <Card elevated className="space-y-5 rounded-2xl p-5 sm:p-6">
        <h2 className="text-base font-bold text-foreground">قیمت و موجودی</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="priceMinor">قیمت (تومان) *</Label>
            <Input
              id="priceMinor"
              name="priceMinor"
              type="number"
              min={0}
              required
              defaultValue={initial.priceMinor}
            />
            <FieldError message={fieldError("priceMinor")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compareAtMinor">قیمت قبل از تخفیف</Label>
            <Input
              id="compareAtMinor"
              name="compareAtMinor"
              type="number"
              min={0}
              defaultValue={initial.compareAtMinor ?? ""}
            />
            <FieldError message={fieldError("compareAtMinor")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weightGrams">وزن (گرم)</Label>
            <Input
              id="weightGrams"
              name="weightGrams"
              type="number"
              min={0}
              defaultValue={initial.weightGrams ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantityOnHand">موجودی انبار</Label>
            <Input
              id="quantityOnHand"
              name="quantityOnHand"
              type="number"
              min={0}
              defaultValue={initial.inventory.quantityOnHand}
            />
            <FieldError message={fieldError("inventory.quantityOnHand")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantityReserved">رزرو شده</Label>
            <Input
              id="quantityReserved"
              name="quantityReserved"
              type="number"
              min={0}
              defaultValue={initial.inventory.quantityReserved}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold">آستانه کمبود</Label>
            <Input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min={0}
              defaultValue={initial.inventory.lowStockThreshold}
            />
          </div>
        </div>
      </Card>

      <Card elevated className="space-y-5 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">سایزها / متغیرها</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              اگر این محصول در سایزهای مختلف با قیمت‌های متفاوت موجود است، اینجا تعریف کنید.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addVariant} className="shrink-0">
            <Plus className="size-4" />
            افزودن سایز
          </Button>
        </div>

        {variants.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/70 p-4 text-center text-sm text-muted-foreground">
            سایزی تعریف نشده — این محصول یک قیمت ثابت دارد.
          </p>
        ) : (
          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_1fr_auto] items-end gap-3 rounded-xl border border-border/60 bg-card/30 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <div className="space-y-1.5">
                  <Label className="text-xs">نام سایز *</Label>
                  <Input
                    value={variant.nameFa}
                    onChange={(e) => updateVariant(index, "nameFa", e.target.value)}
                    placeholder="مثلاً: کوچک"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">قیمت (تومان) *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={variant.priceMinor || ""}
                    onChange={(e) => updateVariant(index, "priceMinor", Number(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="hidden space-y-1.5 sm:block">
                  <Label className="text-xs">قیمت قبل از تخفیف</Label>
                  <Input
                    type="number"
                    min={0}
                    value={variant.compareAtMinor ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateVariant(index, "compareAtMinor", v ? Number(v) : null);
                    }}
                    placeholder="اختیاری"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeVariant(index)}
                  aria-label="حذف سایز"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card elevated className="space-y-5 rounded-2xl p-5 sm:p-6">
        <h2 className="text-base font-bold text-foreground">نمایش در فروشگاه</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <CheckboxField id="isActive" name="isActive" label="فعال (قابل نمایش)" defaultChecked={initial.isActive} />
          <CheckboxField id="isFeatured" name="isFeatured" label="محصول ویژه" defaultChecked={initial.isFeatured} />
          <CheckboxField id="isNew" name="isNew" label="جدید" defaultChecked={initial.isNew} />
          <CheckboxField
            id="isBestSeller"
            name="isBestSeller"
            label="پرفروش"
            defaultChecked={initial.isBestSeller}
          />
        </div>
      </Card>

      <Card elevated className="rounded-2xl p-5 sm:p-6">
        <AdminProductImagesField
          value={images}
          onChange={setImages}
          fieldError={fieldError("images")}
        />
      </Card>

      <Card elevated className="space-y-4 rounded-2xl p-5 sm:p-6">
        <h2 className="text-base font-bold text-foreground">سئو (اختیاری)</h2>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="metaTitleFa">عنوان متا</Label>
            <Input id="metaTitleFa" name="metaTitleFa" defaultValue={initial.metaTitleFa} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaDescFa">توضیح متا</Label>
            <Textarea id="metaDescFa" name="metaDescFa" defaultValue={initial.metaDescFa} rows={3} />
          </div>
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" size="touch" asChild>
          <Link href="/admin/products">بازگشت به لیست</Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          {mode === "edit" && initial.id ? (
            <AdminProductDeleteButton productId={initial.id} productTitle={initial.titleFa} />
          ) : null}
          <Button type="submit" variant="luxury" size="touch" disabled={pending} className={cn(pending && "opacity-80")}>
            {pending ? "در حال ذخیره..." : mode === "create" ? "ثبت محصول" : "ذخیره تغییرات"}
          </Button>
        </div>
      </div>
    </form>
  );
}
