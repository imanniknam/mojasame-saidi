import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { AdminEmptyState, AdminPageHeader } from "@/components/admin";
import { AdminPagination } from "@/components/admin/products/admin-pagination";
import { AdminOrdersToolbar } from "@/components/admin/orders/admin-orders-toolbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  orderStatusBadgeVariant,
  orderStatusLabels,
  paymentStatusBadgeVariant,
  paymentStatusLabels,
} from "@/lib/admin/labels";
import { getOrderCustomerDisplay } from "@/lib/admin/orders/display";
import { parseOrderListSearchParams } from "@/lib/admin/orders/parse-list-params";
import { searchAdminOrders } from "@/lib/admin/orders/queries";
import { formatPriceFa } from "@/lib/format";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseOrderListSearchParams(params);
  const { items, total, page, totalPages } = await searchAdminOrders(filters);

  const listParams = {
    q: filters.q,
    status: filters.status !== "all" ? filters.status : undefined,
    paymentStatus: filters.paymentStatus !== "all" ? filters.paymentStatus : undefined,
    limit: filters.limit !== 20 ? String(filters.limit) : undefined,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="سفارش‌ها"
        description={`${total.toLocaleString("fa-IR")} سفارش — پیگیری پرداخت، آماده‌سازی و ارسال.`}
      />

      <AdminOrdersToolbar
        initial={{
          q: filters.q,
          status: filters.status,
          paymentStatus: filters.paymentStatus,
          limit: String(filters.limit),
        }}
      />

      {items.length === 0 ? (
        <AdminEmptyState
          icon={ShoppingBag}
          title="سفارشی یافت نشد"
          description="فیلترها را تغییر دهید یا منتظر ثبت سفارش جدید بمانید."
        />
      ) : (
        <>
          <Card elevated className="overflow-hidden rounded-2xl border-border/60">
            <div className="hidden md:block">
              <table className="w-full min-w-[800px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20">
                    <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                      شماره
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                      مشتری
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                      مبلغ
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                      سفارش
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                      پرداخت
                    </th>
                    <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground">
                      تاریخ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {items.map((row) => (
                    <OrderTableRow key={row.id} row={row} />
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-border/50 md:hidden">
              {items.map((row) => (
                <OrderCardRow key={row.id} row={row} />
              ))}
            </ul>
          </Card>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/orders"
            searchParams={listParams}
          />
        </>
      )}
    </div>
  );
}

type OrderRow = Awaited<ReturnType<typeof searchAdminOrders>>["items"][number];

function OrderTableRow({ row }: { row: OrderRow }) {
  const customer = getOrderCustomerDisplay(row);
  const payment = row.payments[0];

  return (
    <tr className="transition-colors hover:bg-muted/10">
      <td className="px-4 py-3">
        <Link
          href={`/admin/orders/${row.id}`}
          className="font-mono font-medium text-highlight hover:underline"
          dir="ltr"
        >
          {row.orderNumber}
        </Link>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {row._count.items.toLocaleString("fa-IR")} قلم
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-foreground">{customer.name}</p>
        {customer.email ? (
          <p className="text-xs text-muted-foreground" dir="ltr">
            {customer.email}
          </p>
        ) : null}
      </td>
      <td className="px-4 py-3 font-medium">{formatPriceFa(row.totalMinor)}</td>
      <td className="px-4 py-3">
        <Badge variant={orderStatusBadgeVariant[row.status]}>{orderStatusLabels[row.status]}</Badge>
      </td>
      <td className="px-4 py-3">
        {payment ? (
          <Badge variant={paymentStatusBadgeVariant[payment.status]}>
            {paymentStatusLabels[payment.status]}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(
          row.createdAt,
        )}
      </td>
    </tr>
  );
}

function OrderCardRow({ row }: { row: OrderRow }) {
  const customer = getOrderCustomerDisplay(row);
  const payment = row.payments[0];

  return (
    <li className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/admin/orders/${row.id}`} className="font-mono font-semibold text-highlight" dir="ltr">
          {row.orderNumber}
        </Link>
        <span className="text-sm font-medium">{formatPriceFa(row.totalMinor)}</span>
      </div>
      <p className="text-sm text-foreground">{customer.name}</p>
      <div className="flex flex-wrap gap-2">
        <Badge variant={orderStatusBadgeVariant[row.status]}>{orderStatusLabels[row.status]}</Badge>
        {payment ? (
          <Badge variant={paymentStatusBadgeVariant[payment.status]}>
            {paymentStatusLabels[payment.status]}
          </Badge>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        {new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(
          row.createdAt,
        )}
      </p>
    </li>
  );
}
