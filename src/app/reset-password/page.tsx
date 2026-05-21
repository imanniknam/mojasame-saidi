import { redirect } from "next/navigation";

type ResetPasswordRedirectProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** @deprecated Use /login/reset — kept for old email links */
export default async function ResetPasswordRedirectPage({
  searchParams,
}: ResetPasswordRedirectProps) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;
  redirect(token ? `/login/reset?token=${encodeURIComponent(token)}` : "/login/forgot");
}
