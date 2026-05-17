import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin";
import { AdminProductForm } from "@/components/admin/products/admin-product-form";
import { productToFormValues } from "@/lib/admin/products/form-defaults";
import {
  getProductForAdminEdit,
  listActiveCategoriesForSelect,
} from "@/lib/admin/products/queries";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminProductEditPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { saved } = await searchParams;

  const [product, categories] = await Promise.all([
    getProductForAdminEdit(id),
    listActiveCategoriesForSelect(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="ویرایش محصول"
        description={saved === "1" ? "محصول با موفقیت ثبت شد. می‌توانید جزئیات را ویرایش کنید." : product.titleFa}
      />
      <AdminProductForm
        mode="edit"
        categories={categories}
        initial={productToFormValues(product)}
      />
    </div>
  );
}
