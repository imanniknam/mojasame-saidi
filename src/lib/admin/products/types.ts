export type ProductActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  productId?: string;
};

export const initialProductActionState: ProductActionState = { ok: true };
