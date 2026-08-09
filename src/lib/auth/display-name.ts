type CustomerName = {
  displayFa: string | null;
  firstName: string | null;
  lastName: string | null;
} | null;

type AdminName = {
  displayName: string;
} | null;

export function formatUserDisplayName(input: {
  /** حساب‌های موبایل‌محور ایمیل ندارند */
  email?: string | null;
  phone?: string | null;
  customer?: CustomerName;
  admin?: AdminName;
}) {
  const customer = input.customer;
  if (customer?.displayFa?.trim()) return customer.displayFa.trim();

  const parts = [customer?.firstName, customer?.lastName]
    .map((part) => part?.trim())
    .filter(Boolean);
  if (parts.length) return parts.join(" ");

  if (input.admin?.displayName?.trim()) return input.admin.displayName.trim();

  // ترتیب جایگزین‌ها: بخش محلی ایمیل، بعد شماره موبایل، بعد یک برچسب عمومی.
  const local = input.email?.split("@")[0]?.trim();
  if (local) return local;
  if (input.email?.trim()) return input.email.trim();
  if (input.phone?.trim()) return input.phone.trim();
  return "کاربر";
}
