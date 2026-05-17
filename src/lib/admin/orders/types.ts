export type OrderActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialOrderActionState: OrderActionState = { ok: true };
