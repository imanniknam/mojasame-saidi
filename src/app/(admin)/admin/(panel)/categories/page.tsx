import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import {
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { listAdminCategories } from "@/lib/admin/queries";

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="دسته‌بندی‌ها"
        description="ساختار دسته‌ها، ترتیب نمایش و وضعیت فعال."
        actionLabel="دسته جدید"
        actionHref="/admin/categories/new"
      />

      {categories.length === 0 ? (
        <AdminEmptyState
          icon={LayoutGrid}
          title="دسته‌بندی‌ای وجود ندارد"
          description="برای سازماندهی محصولات، حداقل یک دسته ایجاد کنید."
          actionLabel="ایجاد دسته"
          actionHref="/admin/categories/new"
        />
      ) : (
        <AdminDataTable
          caption="فهرست دسته‌بندی‌ها"
          data={categories}
          columns={[
            {
              key: "name",
              header: "نام",
              render: (row) => (
                <Link
                  href={`/admin/categories/${row.id}`}
                  className="font-medium text-highlight hover:underline"
                >
                  {row.nameFa}
                </Link>
              ),
            },
            {
              key: "slug",
              header: "اسلاگ",
              hideOnMobile: true,
              render: (row) => (
                <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                  {row.slug}
                </span>
              ),
            },
            {
              key: "products",
              header: "محصولات",
              render: (row) => row._count.products.toLocaleString("fa-IR"),
            },
            {
              key: "order",
              header: "ترتیب",
              hideOnMobile: true,
              render: (row) => row.sortOrder.toLocaleString("fa-IR"),
            },
            {
              key: "status",
              header: "وضعیت",
              render: (row) => (
                <Badge variant={row.isActive ? "success" : "muted"}>
                  {row.isActive ? "فعال" : "غیرفعال"}
                </Badge>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
