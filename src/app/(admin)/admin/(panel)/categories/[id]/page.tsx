import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin";
import { AdminCategoryForm } from "@/components/admin/categories/admin-category-form";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "ویرایش دسته" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditCategoryPage({ params }: PageProps) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      nameFa: true,
      sortOrder: true,
      isActive: true,
      _count: { select: { products: true } },
    },
  });

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={category.nameFa}
        description={`${category._count.products.toLocaleString("fa-IR")} محصول در این دسته`}
      />

      <AdminCategoryForm
        mode="edit"
        category={{
          id: category.id,
          slug: category.slug,
          nameFa: category.nameFa,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        }}
        productCount={category._count.products}
      />

      <p className="text-sm text-muted-foreground">
        مشاهده در فروشگاه:{" "}
        <Link
          href={`/categories/${category.slug}`}
          className="text-highlight hover:underline"
          dir="ltr"
        >
          /categories/{category.slug}
        </Link>
      </p>
    </div>
  );
}
