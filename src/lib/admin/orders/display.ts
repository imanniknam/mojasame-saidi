import type { OrderStatus, PaymentStatus } from "@prisma/client";

type CustomerSlice = {
  id: string;
  displayFa: string | null;
  firstName: string | null;
  lastName: string | null;
  user: { email: string; phone: string | null };
} | null;

type OrderCustomerFields = {
  guestNameFa: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  customer: CustomerSlice;
};

export function getOrderCustomerDisplay(order: OrderCustomerFields) {
  if (order.customer) {
    const name =
      order.customer.displayFa ||
      [order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") ||
      order.customer.user.email;
    return {
      name,
      email: order.customer.user.email,
      phone: order.customer.user.phone,
      isGuest: false,
      customerId: order.customer.id,
    };
  }

  return {
    name: order.guestNameFa ?? "مهمان",
    email: order.guestEmail,
    phone: order.guestPhone,
    isGuest: true,
    customerId: null as string | null,
  };
}

export type AddressSnapshot = {
  recipientFa?: string;
  phone?: string;
  provinceFa?: string;
  cityFa?: string;
  line1?: string;
  line2?: string;
  postalCode?: string;
};

export function formatAddressSnapshot(snapshot: unknown): string[] {
  if (!snapshot || typeof snapshot !== "object") return [];
  const a = snapshot as AddressSnapshot;
  const lines: string[] = [];
  if (a.recipientFa) lines.push(a.recipientFa);
  if (a.phone) lines.push(a.phone);
  const cityLine = [a.provinceFa, a.cityFa].filter(Boolean).join("، ");
  if (cityLine) lines.push(cityLine);
  if (a.line1) lines.push(a.line1);
  if (a.line2) lines.push(a.line2);
  if (a.postalCode) lines.push(`کد پستی: ${a.postalCode}`);
  return lines;
}

export function getLatestPaymentStatus(
  payments: { status: PaymentStatus; createdAt: Date }[],
): PaymentStatus | null {
  if (payments.length === 0) return null;
  const sorted = [...payments].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return sorted[0].status;
}

export function isTerminalOrderStatus(status: OrderStatus) {
  return status === "DELIVERED" || status === "CANCELLED" || status === "REFUNDED";
}
