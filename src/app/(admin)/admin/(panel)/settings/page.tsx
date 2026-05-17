import { Settings } from "lucide-react";
import { AdminEmptyState, AdminPageHeader } from "@/components/admin";
import { Card, CardContent } from "@/components/ui/card";
import { getStoreSettings } from "@/lib/admin/queries";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  if (!settings) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <AdminPageHeader title="تنظیمات" description="برند، تماس و ظاهر فروشگاه." />
        <AdminEmptyState
          icon={Settings}
          title="تنظیمات اولیه یافت نشد"
          description="رکورد StoreSettings با شناسه ۱ باید در seed ایجاد شود."
        />
      </div>
    );
  }

  const rows = [
    { label: "نام برند", value: settings.brandNameFa },
    { label: "شعار", value: settings.taglineFa ?? "—" },
    { label: "تلفن پشتیبانی", value: settings.supportPhone ?? "—" },
    { label: "ایمیل پشتیبانی", value: settings.supportEmail ?? "—" },
    { label: "رنگ اصلی (HSL)", value: settings.primaryHsl, dir: "ltr" as const },
    { label: "رنگ تاکید (HSL)", value: settings.accentHsl, dir: "ltr" as const },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="تنظیمات"
        description="اطلاعات برند و تم فروشگاه. ویرایش کامل از API در فاز بعد."
      />

      <Card elevated className="overflow-hidden rounded-2xl border-border/60">
        <CardContent className="divide-y divide-border/50 p-0">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span
                className="text-sm font-medium text-foreground"
                dir={"dir" in row ? row.dir : undefined}
              >
                {row.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
