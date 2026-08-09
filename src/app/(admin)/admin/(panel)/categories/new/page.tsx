import { AdminPageHeader } from "@/components/admin";
import { AdminCategoryForm } from "@/components/admin/categories/admin-category-form";

export const metadata = { title: "دسته جدید" };

export default function AdminNewCategoryPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="دسته جدید"
        description="نام دسته را بنویسید؛ اسلاگ خودکار پیشنهاد می‌شود."
      />
      <AdminCategoryForm mode="create" />
    </div>
  );
}
