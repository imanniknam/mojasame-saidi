import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, Mail, Phone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActiveSessionUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "حساب کاربری",
  description: "مشاهده و مدیریت اطلاعات حساب کاربری در فروشگاه مجسمه‌سازی سعیدی.",
  path: "/profile",
  noIndex: true,
});

export default async function ProfilePage() {
  const sessionUser = await getActiveSessionUser();
  if (!sessionUser) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      email: true,
      phone: true,
      createdAt: true,
      customer: {
        select: {
          firstName: true,
          lastName: true,
          displayFa: true,
          nationalId: true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  const customer = user.customer;
  const fullName =
    customer?.displayFa ??
    ([customer?.firstName, customer?.lastName].filter(Boolean).join(" ") || null);

  const memberSince = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
  }).format(user.createdAt);

  return (
    <main className="ds-section mx-auto max-w-2xl space-y-6 pb-28">
      <header className="space-y-2 text-start">
        <p className="ds-overline text-highlight">My Account</p>
        <h1 className="ds-display text-3xl">حساب کاربری</h1>
        <p className="ds-subtitle">اطلاعات حساب و پروفایل شما</p>
      </header>

      <Card
        elevated
        className="divide-y divide-border/60 overflow-hidden rounded-[2rem] border-highlight/15 p-0"
      >
        {/* Avatar + name banner */}
        <div className="flex items-center gap-4 bg-card/80 p-5 sm:p-7">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-highlight/20 bg-highlight/10 text-highlight">
            <UserRound className="size-7" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-foreground">
              {fullName ?? sessionUser.displayName}
            </p>
            <p className="text-sm text-muted-foreground">
              عضو از {memberSince}
            </p>
          </div>
        </div>

        {/* Info rows */}
        <InfoRow
          icon={<Mail className="size-5" aria-hidden />}
          label="ایمیل"
          value={user.email}
          dir="ltr"
        />
        <InfoRow
          icon={<Phone className="size-5" aria-hidden />}
          label="تلفن"
          value={user.phone ?? "ثبت نشده"}
          dir={user.phone ? "ltr" : undefined}
          muted={!user.phone}
        />
        {customer?.nationalId ? (
          <InfoRow
            icon={<UserRound className="size-5" aria-hidden />}
            label="کد ملی"
            value={customer.nationalId}
            dir="ltr"
          />
        ) : null}
      </Card>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="luxury" size="touch" asChild className="justify-center">
          <Link href="/orders">سفارش‌های من</Link>
        </Button>
        <Button variant="outline" size="touch" asChild className="justify-center">
          <Link href="/login?forgot=1">
            <KeyRound className="size-5" aria-hidden />
            تغییر رمز عبور
          </Link>
        </Button>
      </div>
    </main>
  );
}

function InfoRow({
  icon,
  label,
  value,
  dir,
  muted,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  dir?: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 sm:px-7">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p
          className={`truncate text-sm font-semibold ${muted ? "text-muted-foreground" : "text-foreground"}`}
          dir={dir}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
