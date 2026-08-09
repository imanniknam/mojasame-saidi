"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { requireActiveAdminSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/storefront/cached";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "@/lib/validations/catalog";
import { prismaErrorMessage, zodFieldErrors } from "@/lib/admin/products/errors";

export type CategoryActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  categoryId?: string;
};

export const initialCategoryActionState: CategoryActionState = { ok: false };

/** تغییر دسته هم فهرست دسته‌ها و هم شمارش محصولات را در فروشگاه عوض می‌کند */
function revalidateCategory(slug?: string) {
  revalidatePath("/admin/categories");
  revalidateTag(CACHE_TAGS.categories);
  revalidatePath("/");
  revalidatePath("/categories");
  if (slug) revalidatePath(`/categories/${slug}`);
}

function parseForm(formData: FormData) {
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    nameFa: String(formData.get("nameFa") ?? "").trim(),
    sortOrder: String(formData.get("sortOrder") ?? "0").trim() || "0",
    isActive:
      formData.get("isActive") === "on" || formData.get("isActive") === "true",
  };
}

function toActionError(error: unknown, fallback: string): CategoryActionState {
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

export async function createCategoryAction(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  try {
    await requireActiveAdminSession();
    const input = categoryCreateSchema.parse(parseForm(formData));
    const category = await prisma.category.create({ data: input });
    revalidateCategory(category.slug);
    redirect(`/admin/categories/${category.id}?saved=1`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return toActionError(error, "ساخت دسته‌بندی با خطا روبه‌رو شد.");
  }
}

export async function updateCategoryAction(
  categoryId: string,
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  try {
    await requireActiveAdminSession();
    const input = categoryUpdateSchema.parse(parseForm(formData));
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: input,
    });
    revalidateCategory(category.slug);
    return { ok: true, message: "تغییرات ذخیره شد.", categoryId };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return toActionError(error, "ذخیره تغییرات با خطا روبه‌رو شد.");
  }
}

/**
 * دسته حذف نمی‌شود، غیرفعال می‌شود.
 *
 * Product.category رابطه‌ی اجباری است، پس حذف دسته‌ای که محصول دارد با خطای
 * کلید خارجی شکست می‌خورد. غیرفعال‌سازی هم برگشت‌پذیر است و هم تاریخچه را
 * نگه می‌دارد.
 */
export async function deactivateCategoryAction(
  categoryId: string,
): Promise<CategoryActionState> {
  try {
    await requireActiveAdminSession();
    const productCount = await prisma.product.count({ where: { categoryId } });
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: false },
    });
    revalidateCategory(category.slug);
    return {
      ok: true,
      message:
        productCount > 0
          ? `دسته غیرفعال شد. ${productCount.toLocaleString("fa-IR")} محصول این دسته از فروشگاه پنهان می‌شوند.`
          : "دسته غیرفعال شد.",
    };
  } catch (error) {
    return toActionError(error, "غیرفعال‌سازی دسته با خطا روبه‌رو شد.");
  }
}
