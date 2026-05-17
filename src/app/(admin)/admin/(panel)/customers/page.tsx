import { Users } from "lucide-react";
import {
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { listAdminCustomers } from "@/lib/admin/queries";

function displayName(row: Awaited<ReturnType<typeof listAdminCustomers>>[number]) {
  return (
    row.displayFa ||
    [row.firstName, row.lastName].filter(Boolean).join(" ") ||
    row.user.email
  );
}

export default async function AdminCustomersPage() {
  const customers = await listAdminCustomers();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="مشتریان"
        description="حساب‌های ثبت‌نام‌شده و تاریخچه خرید."
      />

      {customers.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title="مشتری‌ای ثبت نشده"
          description="پس از ثبت‌نام کاربران، پروفایل مشتریان اینجا نمایش داده می‌شود."
        />
      ) : (
        <AdminDataTable
          caption="فهرست مشتریان"
          data={customers}
          columns={[
            {
              key: "name",
              header: "نام",
              render: (row) => <span className="font-medium">{displayName(row)}</span>,
            },
            {
              key: "email",
              header: "ایمیل",
              hideOnMobile: true,
              render: (row) => (
                <span className="text-muted-foreground" dir="ltr">
                  {row.user.email}
                </span>
              ),
            },
            {
              key: "orders",
              header: "سفارش‌ها",
              render: (row) => row._count.orders.toLocaleString("fa-IR"),
            },
            {
              key: "status",
              header: "حساب",
              render: (row) => (
                <Badge variant={row.user.isActive ? "success" : "muted"}>
                  {row.user.isActive ? "فعال" : "غیرفعال"}
                </Badge>
              ),
            },
            {
              key: "joined",
              header: "عضویت",
              hideOnMobile: true,
              render: (row) =>
                new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(row.createdAt),
            },
          ]}
        />
      )}
    </div>
  );
}
