import { PanelsTopLeft } from "lucide-react";
import {
  AdminDataTable,
  AdminEmptyState,
  AdminPageHeader,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listAdminBanners, listAdminHomepageSections } from "@/lib/admin/queries";

export default async function AdminHomepagePage() {
  const [banners, sections] = await Promise.all([
    listAdminBanners(),
    listAdminHomepageSections(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminPageHeader
        title="صفحه اصلی"
        description="بنرهای هیرو، سکشن‌های محتوا و ترتیب نمایش در فروشگاه."
      />

      <section className="space-y-4">
        <h2 className="text-base font-bold text-foreground">بنرها</h2>
        {banners.length === 0 ? (
          <AdminEmptyState
            icon={PanelsTopLeft}
            title="بنری تعریف نشده"
            description="بنر هیرو و اسلایدر صفحه اصلی را از این بخش مدیریت کنید."
          />
        ) : (
          <AdminDataTable
            caption="فهرست بنرها"
            data={banners}
            columns={[
              {
                key: "title",
                header: "عنوان",
                render: (row) => row.titleFa ?? "—",
              },
              {
                key: "placement",
                header: "جایگاه",
                hideOnMobile: true,
                render: (row) => row.placement,
              },
              {
                key: "order",
                header: "ترتیب",
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
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-bold text-foreground">سکشن‌های صفحه</h2>
        {sections.length === 0 ? (
          <Card elevated className="rounded-2xl p-6 text-sm text-muted-foreground">
            سکشنی در پایگاه‌داده نیست. با seed یا API می‌توانید سکشن‌های featured، categories و trust را
            اضافه کنید.
          </Card>
        ) : (
          <AdminDataTable
            caption="سکشن‌های صفحه اصلی"
            data={sections}
            columns={[
              {
                key: "key",
                header: "کلید",
                render: (row) => (
                  <span className="font-mono text-xs" dir="ltr">
                    {row.key}
                  </span>
                ),
              },
              {
                key: "title",
                header: "عنوان",
                render: (row) => row.titleFa ?? "—",
              },
              {
                key: "order",
                header: "ترتیب",
                hideOnMobile: true,
                render: (row) => row.sortOrder.toLocaleString("fa-IR"),
              },
              {
                key: "enabled",
                header: "نمایش",
                render: (row) => (
                  <Badge variant={row.isEnabled ? "success" : "muted"}>
                    {row.isEnabled ? "فعال" : "غیرفعال"}
                  </Badge>
                ),
              },
            ]}
          />
        )}
      </section>
    </div>
  );
}
