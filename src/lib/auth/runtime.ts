export function getAuthRuntimeError() {
  if (!process.env.DATABASE_URL) {
    return {
      code: "DATABASE_NOT_CONFIGURED",
      message: "اتصال پایگاه داده تنظیم نشده است. مقدار DATABASE_URL را در محیط اجرا وارد کنید.",
      status: 503,
    };
  }

  if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
    return {
      code: "AUTH_SECRET_NOT_CONFIGURED",
      message: "تنظیمات امنیتی ورود کامل نیست. مقدار AUTH_SECRET را در محیط تولید وارد کنید.",
      status: 503,
    };
  }

  return null;
}
