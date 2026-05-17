export type ApiSuccess<T> = { ok: true; data: T };
export type ApiError = { ok: false; code: string; message: string };
export type ApiResult<T> = ApiSuccess<T> | ApiError;
