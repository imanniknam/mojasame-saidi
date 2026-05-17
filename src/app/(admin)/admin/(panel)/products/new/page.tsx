import { AdminPageHeader } from "@/components/admin";
import { AdminProductForm } from "@/components/admin/products/admin-product-form";
import { emptyProductFormValues } from "@/lib/admin/products/form-defaults";
import { listActiveCategoriesForSelect } from "@/lib/admin/products/queries";

export default async function AdminProductNewPage() {
  const categories = await listActiveCategoriesForSelect();
  const defaultCategoryId = categories[0]?.id ?? "";

  return (
    <div className="space-y-6">
      <AdminPageHeader title="افزودن محصول" description="ثبت محصول جدید با تصویر، موجودی و تنظیمات نمایش." />
      <AdminProductForm mode="create" categories={categories} initial={emptyProductFormValues(defaultCategoryId)} />
    </div>
  );
}
