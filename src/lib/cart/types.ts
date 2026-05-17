export type CartDiscount =
  | { code: string; type: "PERCENT"; value: number; maxMinor?: number }
  | { code: string; type: "FIXED_MINOR"; value: number };
