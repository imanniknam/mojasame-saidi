import Link from "next/link";
import Image from "next/image";
import { Package, Star } from "lucide-react";
import { AdminEmptyState, AdminPageHeader } from "@/components/admin";
import { AdminPagination } from "@/components/admin/products/admin-pagination";
import { AdminProductsToolbar } from "@/components/admin/products/admin-products-toolbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { parseProductListSearchParams } from "@/lib/admin/products/parse-list-params";
import {
  listActiveCategoriesForSelect,
  searchAdminProducts,
} from "@/lib/admin/products/queries";
import { formatPriceFa } from "@/lib/format";
import { shouldUnoptimizeImageUrl } from "@/lib/image";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseProductListSearchParams(params);
  const [{ items, total, page, totalPages }, categories] = await Promise.all([
    searchAdminProducts(filters),
    listActiveCategoriesForSelect(),
  ]);

  const listParams = {
    q: filters.q,
    categoryId: filters.categoryId,
    isFeatured: filters.isFeatured !== "all" ? filters.isFeatured : undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    limit: filters.limit !== 20 ? String(filters.limit) : undefined,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="محصولات"
        description={`${total.toLocaleString("fa-IR")} محصول — جستجو، فیلتر و مدیریت کامل کاتالوگ.`}
        actionLabel="افزودن محصول"
        actionHref="/admin/products/new"
      />

      <AdminProductsToolbar
        initial={{
          q: filters.q,
          categoryId: filters.categoryId,
          isFeatured: filters.isFeatured,
          status: filters.status,
          limit: String(filters.limit),
        }}
        categories={categories}
      />

      {items.length === 0 ? (
        <AdminEmptyState
          icon={Package}
          title="محصولی یافت نشد"
          description="فیلترها را تغییر دهید یا محصول جدید اضافه کنید."
          actionLabel="افزودن محصول"
          actionHref="/admin/products/new"
        />
      ) : (
        <>
          <Card elevated className="overflow-hidden rounded-2xl border-border/60">
            <div className="hidden md:block">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20">
                    <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">محصول</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">دسته</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">قیمت</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">موجودی</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {items.map((row) => (
                    <ProductRow key={row.id} row={row} variant="table" />
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-border/50 md:hidden">
              {items.map((row) => (
                <ProductRow key={row.id} row={row} variant="card" />
              ))}
            </ul>
          </Card>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/products"
            searchParams={listParams}
          />
        </>
      )}
    </div>
  );
}

type ProductRowData = Awaited<ReturnType<typeof searchAdminProducts>>["items"][number];

function ProductRow({ row, variant }: { row: ProductRowData; variant: "table" | "card" }) {
  const thumb = row.images[0]?.url;
  const stock = row.inventory?.quantityOnHand ?? 0;
  const low = row.inventory?.lowStockThreshold ?? 3;
  const stockClass = stock <= low ? "text-amber-400" : "text-foreground";

  const titleCell = (
    <Link href={`/admin/products/${row.id}`} className="flex items-center gap-3 group">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted/30">
        {thumb ? (
          <Image
            src={thumb}
            alt=""
            fill
            className="object-cover"
            sizes="48px"
            unoptimized={shouldUnoptimizeImageUrl(thumb)}
          />
        ) : (
          <Package className="m-auto size-5 text-muted-foreground" />
        )}
      </div>
      <span className="min-w-0">
        <span className="flex items-center gap-1 font-medium text-highlight group-hover:underline">
          {row.titleFa}
          {row.isFeatured ? <Star className="size-3.5 fill-highlight text-highlight" aria-label="ویژه" /> : null}
        </span>
        <span className="block truncate font-mono text-xs text-muted-foreground" dir="ltr">
          {row.slug}
        </span>
      </span>
    </Link>
  );

  const statusBadges = (
    <div className="flex flex-wrap gap-1">
      <Badge variant={row.isActive ? "success" : "muted"}>{row.isActive ? "فعال" : "غیرفعال"}</Badge>
      {row.isNew ? <Badge variant="outline">جدید</Badge> : null}
    </div>
  );

  if (variant === "card") {
    return (
      <li className="space-y-3 p-4">
        {titleCell}
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          <span className="text-muted-foreground">{row.category?.nameFa ?? "—"}</span>
          <span className="font-medium">{formatPriceFa(row.priceMinor)}</span>
        </div>
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          <span className={stockClass}>موجودی: {stock.toLocaleString("fa-IR")}</span>
          {statusBadges}
        </div>
      </li>
    );
  }

  return (
    <tr className="hover:bg-muted/10">
      <td className="px-4 py-3">{titleCell}</td>
      <td className="px-4 py-3 text-muted-foreground">{row.category?.nameFa ?? "—"}</td>
      <td className="px-4 py-3 font-medium">{formatPriceFa(row.priceMinor)}</td>
      <td className={`px-4 py-3 tabular-nums ${stockClass}`}>{stock.toLocaleString("fa-IR")}</td>
      <td className="px-4 py-3">{statusBadges}</td>
    </tr>
  );
}
