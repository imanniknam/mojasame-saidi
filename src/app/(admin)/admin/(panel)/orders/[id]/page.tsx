import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Mail, Phone, User } from "lucide-react";
import { AdminPageHeader } from "@/components/admin";
import { AdminOrderNotesForm } from "@/components/admin/orders/admin-order-notes-form";
import { AdminOrderPaymentsPanel } from "@/components/admin/orders/admin-order-payments-panel";
import { AdminOrderStatusForm } from "@/components/admin/orders/admin-order-status-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  orderStatusBadgeVariant,
  orderStatusLabels,
  paymentStatusBadgeVariant,
  paymentStatusLabels,
} from "@/lib/admin/labels";
import { formatAddressSnapshot, getOrderCustomerDisplay } from "@/lib/admin/orders/display";
import { getOrderForAdminDetail } from "@/lib/admin/orders/queries";
import { formatPriceFa } from "@/lib/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderForAdminDetail(id);
  if (!order) notFound();

  const customer = getOrderCustomerDisplay(order);
  const shippingLines = formatAddressSnapshot(order.shippingSnapshot);
  const latestPayment = order.payments[0];

  const totals = [
    { label: "جمع جزء", amount: order.subtotalMinor },
    { label: "تخفیف", amount: order.discountMinor, deduct: true },
    { label: "ارسال", amount: order.shippingMinor },
    { label: "مالیات", amount: order.taxMinor },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-highlight"
        >
          <ArrowRight className="size-4" />
          بازگشت به سفارش‌ها
        </Link>
      </div>

      <AdminPageHeader
        title={`سفارش ${order.orderNumber}`}
        description={new Intl.DateTimeFormat("fa-IR", {
          dateStyle: "full",
          timeStyle: "short",
        }).format(order.createdAt)}
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant={orderStatusBadgeVariant[order.status]}>{orderStatusLabels[order.status]}</Badge>
          {latestPayment ? (
            <Badge variant={paymentStatusBadgeVariant[latestPayment.status]}>
              {paymentStatusLabels[latestPayment.status]}
            </Badge>
          ) : null}
        </div>
      </AdminPageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card elevated className="overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <div className="border-b border-border/50 px-5 py-4">
                <h2 className="font-bold text-foreground">اقلام سفارش</h2>
              </div>
              <div className="hidden md:block">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/15">
                      <th className="px-4 py-3 text-start text-xs text-muted-foreground">محصول</th>
                      <th className="px-4 py-3 text-start text-xs text-muted-foreground">تعداد</th>
                      <th className="px-4 py-3 text-start text-xs text-muted-foreground">قیمت واحد</th>
                      <th className="px-4 py-3 text-start text-xs text-muted-foreground">جمع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{item.titleFaSnap}</p>
                          {item.skuSnap ? (
                            <p className="font-mono text-xs text-muted-foreground" dir="ltr">
                              {item.skuSnap}
                            </p>
                          ) : null}
                          {item.product ? (
                            <Link
                              href={`/admin/products/${item.product.id}`}
                              className="text-xs text-highlight hover:underline"
                            >
                              مشاهده محصول
                            </Link>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 tabular-nums">{item.quantity.toLocaleString("fa-IR")}</td>
                        <td className="px-4 py-3">{formatPriceFa(item.unitPriceMinor)}</td>
                        <td className="px-4 py-3 font-medium">
                          {formatPriceFa(item.unitPriceMinor * item.quantity - item.discountMinor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="divide-y divide-border/50 md:hidden">
                {order.items.map((item) => (
                  <li key={item.id} className="space-y-2 p-4">
                    <p className="font-medium">{item.titleFaSnap}</p>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>× {item.quantity.toLocaleString("fa-IR")}</span>
                      <span>{formatPriceFa(item.unitPriceMinor * item.quantity - item.discountMinor)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card elevated className="rounded-2xl p-5">
            <h2 className="mb-4 font-bold text-foreground">خلاصه مالی</h2>
            <dl className="space-y-2 text-sm">
              {totals.map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="font-medium tabular-nums">
                    {"deduct" in row && row.deduct && row.amount > 0
                      ? `−${formatPriceFa(row.amount)}`
                      : formatPriceFa(row.amount)}
                  </dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-t border-border/50 pt-3 text-base font-bold">
                <dt>مبلغ کل</dt>
                <dd className="text-highlight">{formatPriceFa(order.totalMinor)}</dd>
              </div>
            </dl>
          </Card>

          {shippingLines.length > 0 ? (
            <Card elevated className="rounded-2xl p-5">
              <h2 className="mb-3 font-bold text-foreground">آدرس ارسال</h2>
              <ul className="space-y-1 text-sm leading-7 text-muted-foreground">
                {shippingLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Card>
          ) : null}

          <AdminOrderNotesForm
            orderId={order.id}
            notesAdmin={order.notesAdmin}
            notesCustomer={order.notesCustomer}
          />
        </div>

        <div className="space-y-6">
          <Card elevated className="space-y-4 rounded-2xl p-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <User className="size-4 text-highlight" />
              مشتری
            </h2>
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-foreground">{customer.name}</p>
              {customer.isGuest ? (
                <Badge variant="outline">خرید مهمان</Badge>
              ) : (
                <Badge variant="secondary">حساب ثبت‌شده</Badge>
              )}
              {customer.email ? (
                <p className="flex items-center gap-2 text-muted-foreground" dir="ltr">
                  <Mail className="size-4 shrink-0" />
                  {customer.email}
                </p>
              ) : null}
              {customer.phone ? (
                <p className="flex items-center gap-2 text-muted-foreground" dir="ltr">
                  <Phone className="size-4 shrink-0" />
                  {customer.phone}
                </p>
              ) : null}
              {customer.customerId ? (
                <Link href="/admin/customers" className="text-xs text-highlight hover:underline">
                  مشاهده لیست مشتریان
                </Link>
              ) : null}
            </div>
          </Card>

          <AdminOrderStatusForm orderId={order.id} currentStatus={order.status} />

          <AdminOrderPaymentsPanel orderId={order.id} payments={order.payments} />

          <Card elevated className="rounded-2xl p-5 text-xs text-muted-foreground">
            <p>شناسه پیگیری</p>
            <p className="mt-1 font-mono text-foreground" dir="ltr">
              {order.trackingToken}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
