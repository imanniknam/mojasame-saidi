import { redirect } from "next/navigation";

type ForgotPasswordRedirectProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** @deprecated Use /login/forgot — kept for old links */
export default async function ForgotPasswordRedirectPage({
  searchParams,
}: ForgotPasswordRedirectProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  redirect(q ? `/login?forgot=1&q=${encodeURIComponent(q)}` : "/login?forgot=1");
}
