import { getActiveSessionUserFromRequest } from "@/lib/auth/server";
import { jsonNoStore } from "@/lib/server/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getActiveSessionUserFromRequest(request);

  return jsonNoStore({
    ok: true,
    user: user
      ? {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      : null,
  });
}
