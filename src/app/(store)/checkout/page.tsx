import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/store/checkout/checkout-flow";

export const metadata: Metadata = {
  title: "تسویه حساب",
  description: "تکمیل سفارش در فروشگاه مجسمه‌سازی سعیدی",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutFlow />;
}
