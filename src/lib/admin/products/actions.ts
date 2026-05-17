"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireActiveAdminSession } from "@/lib/auth/server";
import {
  productCreateSchema,
  productUpdateSchema,
} from "@/lib/validations/catalog";
import { prismaErrorMessage, zodFieldErrors } from "./errors";
import {
  createProductRecord,
  deactivateProductRecord,
  updateProductRecord,
} from "./service";
import { ImageUploadError, uploadProductImageFiles } from "@/lib/storage";
import type { ProductActionState } from "./types";
import { initialProductActionState } from "./types";

function revalidateProductPaths(productId?: string) {
  revalidatePath("/admin/products");
  if (productId) revalidatePath(`/admin/products/${productId}`);
}

export async function createProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  try {
    await requireActiveAdminSession();
    const raw = parseProductFormData(formData);
    const input = productCreateSchema.parse(raw);
    const product = await createProductRecord(input);
    revalidateProductPaths(product.id);
    redirect(`/admin/products/${product.id}?saved=1`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return actionError(error, "ثبت محصول با خطا روبه‌رو شد.");
  }
}

export async function updateProductAction(
  productId: string,
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  try {
    await requireActiveAdminSession();
    const raw = parseProductFormData(formData);
    const input = productUpdateSchema.parse(raw);
    await updateProductRecord(productId, input);
    revalidateProductPaths(productId);
    return { ok: true, message: "تغییرات ذخیره شد.", productId };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return actionError(error, "ذخیره تغییرات با خطا روبه‌رو شد.");
  }
}

export async function deleteProductAction(productId: string): Promise<ProductActionState> {
  try {
    await requireActiveAdminSession();
    await deactivateProductRecord(productId);
    revalidateProductPaths(productId);
    revalidatePath("/admin/products");
    return { ok: true, message: "محصول غیرفعال شد." };
  } catch (error) {
    return actionError(error, "غیرفعال‌سازی محصول با خطا روبه‌رو شد.");
  }
}

export async function uploadProductImagesAction(
  formData: FormData,
): Promise<{ ok: true; uploads: { url: string }[] } | ProductActionState> {
  try {
    await requireActiveAdminSession();
    const files = formData.getAll("files").filter((item): item is File => item instanceof File);
    const uploads = await uploadProductImageFiles(files);
    return {
      ok: true,
      uploads: uploads.map((u) => ({
        url: u.url,
        publicId: u.publicId,
        width: u.width,
        height: u.height,
      })),
    };
  } catch (error) {
    if (error instanceof ImageUploadError) {
      return { ok: false, message: error.message };
    }
    return actionError(error, "آپلود تصویر با خطا روبه‌رو شد.");
  }
}

function parseProductFormData(formData: FormData) {
  const imagesJson = formData.get("imagesJson");
  let images: unknown[] = [];
  if (typeof imagesJson === "string" && imagesJson.trim()) {
    try {
      images = JSON.parse(imagesJson) as unknown[];
    } catch {
      images = [];
    }
  }

  const emptyToNull = (value: FormDataEntryValue | null) => {
    const s = String(value ?? "").trim();
    return s === "" ? null : s;
  };

  const numOrNull = (value: FormDataEntryValue | null) => {
    const s = String(value ?? "").trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  return {
    slug: String(formData.get("slug") ?? "").trim(),
    sku: emptyToNull(formData.get("sku")),
    titleFa: String(formData.get("titleFa") ?? "").trim(),
    descriptionFa: String(formData.get("descriptionFa") ?? "").trim(),
    priceMinor: formData.get("priceMinor"),
    compareAtMinor: numOrNull(formData.get("compareAtMinor")),
    weightGrams: numOrNull(formData.get("weightGrams")),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    isFeatured: formData.get("isFeatured") === "on" || formData.get("isFeatured") === "true",
    isNew: formData.get("isNew") === "on" || formData.get("isNew") === "true",
    isBestSeller:
      formData.get("isBestSeller") === "on" || formData.get("isBestSeller") === "true",
    metaTitleFa: emptyToNull(formData.get("metaTitleFa")),
    metaDescFa: emptyToNull(formData.get("metaDescFa")),
    categoryId: String(formData.get("categoryId") ?? "").trim(),
    inventory: {
      quantityOnHand: formData.get("quantityOnHand"),
      quantityReserved: formData.get("quantityReserved"),
      lowStockThreshold: formData.get("lowStockThreshold"),
    },
    images,
  };
}

function actionError(error: unknown, fallback: string): ProductActionState {
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return { ok: false, message: "دسترسی شما به این بخش مجاز نیست." };
  }
  if (error instanceof ZodError) {
    return {
      ok: false,
      message: "اطلاعات فرم معتبر نیست.",
      fieldErrors: zodFieldErrors(error),
    };
  }
  const prismaMsg = prismaErrorMessage(error);
  if (prismaMsg) return { ok: false, message: prismaMsg };
  return { ok: false, message: fallback };
}

function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export { initialProductActionState };
