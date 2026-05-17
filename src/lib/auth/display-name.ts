type CustomerName = {
  displayFa: string | null;
  firstName: string | null;
  lastName: string | null;
} | null;

type AdminName = {
  displayName: string;
} | null;

export function formatUserDisplayName(input: {
  email: string;
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

  const local = input.email.split("@")[0]?.trim();
  return local || input.email;
}
