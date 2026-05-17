import { getActiveSessionUserFromRequest } from "@/lib/auth/server";
import { getAuthRuntimeError } from "@/lib/auth/runtime";
import { jsonNoStore } from "@/lib/server/api-response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const runtimeError = getAuthRuntimeError();
  if (runtimeError) {
    return jsonNoStore(
      { ok: false, error: { code: runtimeError.code, message: runtimeError.message } },
      { status: runtimeError.status },
    );
  }

  const user = await getActiveSessionUserFromRequest(request);

  if (!user) {
    return jsonNoStore({ ok: true, user: null });
  }

  return jsonNoStore({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      customerId: user.customerId ?? null,
      adminId: user.adminId ?? null,
    },
  });
}
