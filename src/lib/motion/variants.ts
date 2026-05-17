import type { Variants } from "framer-motion";

/** انیمیشن‌های سبک با رعایت reduced-motion در کامپوننت مصرف‌کننده */
export const softFade: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};
