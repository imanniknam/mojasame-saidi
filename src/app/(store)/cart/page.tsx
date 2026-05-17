import type { Metadata } from "next";
import { CartPageContent } from "@/components/store/cart/cart-page-content";

export const metadata: Metadata = {
  title: "سبد خرید",
  description: "سبد خرید شما در فروشگاه مجسمه‌سازی سعیدی",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return <CartPageContent />;
}
