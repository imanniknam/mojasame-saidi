import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function zodFieldErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_form";
    if (!fieldErrors[key]) fieldErrors[key] = [];
    fieldErrors[key].push(issue.message);
  }
  return fieldErrors;
}

export function prismaErrorMessage(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return "اسلاگ یا SKU تکراری است.";
    if (error.code === "P2025") return "محصول پیدا نشد.";
    if (error.code === "P2003") return "دسته‌بندی انتخاب‌شده معتبر نیست.";
  }
  return null;
}
