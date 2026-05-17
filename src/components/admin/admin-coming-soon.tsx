import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card } from "@/components/ui/card";

export type AdminComingSoonProps = {
  title: string;
  description?: string;
};

export function AdminComingSoon({ title, description }: AdminComingSoonProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AdminPageHeader title={title} description={description} />
      <Card elevated className="rounded-2xl p-6 text-sm leading-7 text-muted-foreground">
        فرم ویرایش این بخش در فاز بعد به APIهای موجود متصل می‌شود. فعلاً از لیست اصلی و API
        مدیریت استفاده کنید.
      </Card>
    </div>
  );
}
